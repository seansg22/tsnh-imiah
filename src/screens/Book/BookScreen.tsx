import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { bookChapters } from '../../data/bookChapters';
import { getLocalizedChapterTitle } from '../../data/localizedCare';
import { useApp } from '../../context/appStateContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useLang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { useGesture } from '@use-gesture/react';
import { useSpring, animated, to } from '@react-spring/web';

const bookUrl = `${import.meta.env.BASE_URL}book.pdf`;

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

interface PdfRef {
  num: number;
  gen: number;
}

interface PdfOutlineNode {
  title: string;
  dest: string | unknown[] | null;
  items: PdfOutlineNode[];
}

interface BookSearchEntry {
  id: string;
  title: string;
  page: number;
  kind: 'chapter' | 'section' | 'part';
  chapter?: number;
  parentTitle?: string;
  searchText: string;
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function getChapterTitle(title: string) {
  const match = title.match(/^CHAPTER\s+(\d+)\s+(.+)$/i);
  if (!match) return null;
  return { chapter: Number(match[1]), title: match[2] };
}

function getFallbackSearchEntries(): BookSearchEntry[] {
  return bookChapters.map(({ chapter, title, page }) => ({
    id: `chapter-${chapter}`,
    title,
    page,
    kind: 'chapter',
    chapter,
    searchText: `chapter ${chapter} ${title}`.toLowerCase(),
  }));
}

async function resolveOutlinePage(pdfDoc: PDFDocumentProxy, dest: string | unknown[] | null) {
  const destination = typeof dest === 'string' ? await pdfDoc.getDestination(dest) : dest;
  if (!Array.isArray(destination) || destination.length === 0) return null;

  const pageRef = destination[0];
  if (typeof pageRef === 'number') return pageRef + 1;

  if (
    pageRef &&
    typeof pageRef === 'object' &&
    'num' in pageRef &&
    'gen' in pageRef &&
    typeof pageRef.num === 'number' &&
    typeof pageRef.gen === 'number'
  ) {
    return (await pdfDoc.getPageIndex(pageRef as PdfRef)) + 1;
  }

  return null;
}

async function buildOutlineSearchEntries(pdfDoc: PDFDocumentProxy): Promise<BookSearchEntry[]> {
  const outline = (await pdfDoc.getOutline()) as PdfOutlineNode[] | null;
  if (!outline) return [];

  const entries: BookSearchEntry[] = [];

  async function visit(nodes: PdfOutlineNode[], parent?: { chapter?: number; title: string }) {
    for (const node of nodes) {
      const page = await resolveOutlinePage(pdfDoc, node.dest);
      const chapterTitle = getChapterTitle(node.title);
      const kind = chapterTitle ? 'chapter' : parent ? 'section' : 'part';
      const title = chapterTitle?.title ?? node.title;
      const chapter = chapterTitle?.chapter ?? parent?.chapter;
      const parentTitle = kind === 'section' ? parent?.title : undefined;

      if (page) {
        entries.push({
          id: `outline-${entries.length}-${page}`,
          title,
          page,
          kind,
          chapter,
          parentTitle,
          searchText: `${node.title} ${title} ${parentTitle ?? ''} ${chapter ? `chapter ${chapter}` : ''}`.toLowerCase(),
        });
      }

      if (node.items.length > 0) await visit(node.items, { chapter, title });
    }
  }

  await visit(outline);
  return entries;
}

// ---------------------------------------------------------------------------
// Render a single page into a visible canvas via OffscreenCanvas.
// Returns the render task so it can be cancelled on cleanup.
// ---------------------------------------------------------------------------
type RenderSlotResult = { task: RenderTask | null; promise: Promise<void> };

function renderSlot(
  pdfDoc: PDFDocumentProxy,
  pageNum: number,
  canvas: HTMLCanvasElement,
  availableWidth: number,
  isCancelled: () => boolean
): RenderSlotResult {
  if (pageNum < 1 || pageNum > pdfDoc.numPages) {
    // blank slot (boundary)
    canvas.width = 0;
    canvas.height = 0;
    return { task: null, promise: Promise.resolve() };
  }

  let task: RenderTask | null = null;

  const promise = (async () => {
    const page = await pdfDoc.getPage(pageNum);
    if (isCancelled()) return;

    const baseViewport = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: availableWidth / baseViewport.width });
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);
    const pw = Math.floor(viewport.width * outputScale);
    const ph = Math.floor(viewport.height * outputScale);

    // Render into OffscreenCanvas so the visible canvas is updated atomically
    const offscreen = new OffscreenCanvas(pw, ph);
    const offCtx = offscreen.getContext('2d') as OffscreenCanvasRenderingContext2D | null;
    if (!offCtx || isCancelled()) return;

    offCtx.setTransform(outputScale, 0, 0, outputScale, 0, 0);
    offCtx.clearRect(0, 0, viewport.width, viewport.height);

    task = page.render({ canvas: offscreen as unknown as HTMLCanvasElement, canvasContext: offCtx as unknown as CanvasRenderingContext2D, viewport });
    try {
      await task.promise;
    } catch (e) {
      if (e instanceof Error && e.name === 'RenderingCancelledException') return;
      throw e;
    }

    if (isCancelled()) return;

    // Atomically commit: clear + fill in one repaint cycle (no visible flash)
    canvas.width = pw;
    canvas.height = ph;
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(offscreen, 0, 0);
  })();

  return { task, promise };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function BookScreen() {
  const { dispatch } = useApp();
  const { t, lang } = useLang();

  // Three canvas refs for the horizontal strip (prev | current | next)
  const prevCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useLocalStorage<number>('baby-day:book-page', 1);
  const [viewerWidth, setViewerWidth] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<UiKey | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomedRenderCancelRef = useRef<(() => void) | null>(null);
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchEntries, setSearchEntries] = useState<BookSearchEntry[]>(getFallbackSearchEntries);

  // Refs to avoid stale closures inside gesture handlers
  const pageNumberRef = useRef(pageNumber);
  const viewerWidthRef = useRef(viewerWidth);
  const totalPagesRef = useRef(0);
  const isNavigatingRef = useRef(false); // prevent multiple page-turn triggers
  const scaleRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });

  useEffect(() => { pageNumberRef.current = pageNumber; }, [pageNumber]);
  useEffect(() => { viewerWidthRef.current = viewerWidth; }, [viewerWidth]);

  const totalPages = pdfDoc?.numPages ?? 0;
  useEffect(() => { totalPagesRef.current = totalPages; }, [totalPages]);

  // Spring: horizontal position of the 3-slot strip
  const [{ stripX }, stripApi] = useSpring(() => ({
    stripX: 0,
    config: { tension: 320, friction: 32 },
  }));

  // Spring: zoom + pan for the center canvas slot
  const [zoomProps, zoomApi] = useSpring(() => ({
    scale: 1,
    x: 0,
    y: 0,
    config: { tension: 300, friction: 28 },
  }));

  const normalizedQuery = normalizeSearch(query);
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return searchEntries.filter(({ kind }) => kind !== 'section');
    return searchEntries.filter(({ searchText }) => searchText.includes(normalizedQuery));
  }, [normalizedQuery, searchEntries]);

  // Find which chapter the current page belongs to (last chapter whose start page ≤ current page)
  const currentChapter = useMemo(() => {
    let result: { chapter: number; title: string } | null = null;
    for (const c of bookChapters) {
      if (c.page <= pageNumber) result = c;
      else break;
    }
    return result;
  }, [pageNumber]);

  // Load PDF document
  useEffect(() => {
    let cancelled = false;
    const loadingTask = pdfjsLib.getDocument(bookUrl);

    loadingTask.promise
      .then(async (loadedPdf) => {
        if (cancelled) return;
        const outlineEntries = await buildOutlineSearchEntries(loadedPdf);
        if (cancelled) return;
        setPdfDoc(loadedPdf);
        setSearchEntries(outlineEntries.length > 0 ? outlineEntries : getFallbackSearchEntries());
      })
      .catch(() => { if (!cancelled) setError('book.errLoad'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => {
      cancelled = true;
      void loadingTask.destroy();
    };
  }, []);

  // Measure viewer width
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return undefined;
    const update = () => setViewerWidth(viewer.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewer);
    return () => observer.disconnect();
  }, []);

  // Keep strip centered when viewerWidth changes (instant, no animation)
  useEffect(() => {
    if (viewerWidth > 0) stripApi.set({ stripX: -viewerWidth });
  }, [viewerWidth, stripApi]);

  // Render all three slots whenever page or width changes (center first)
  useEffect(() => {
    if (!pdfDoc || viewerWidth === 0) return undefined;

    let cancelled = false;
    const isCancelled = () => cancelled;
    const activeTasks: RenderTask[] = [];
    const availableWidth = Math.max(viewerWidth - 32, 280);

    async function runRenders() {
      setError(null);
      try {
        // Center first so the user sees the current page ASAP
        const centerResult = renderSlot(pdfDoc!, pageNumber, currCanvasRef.current!, availableWidth, isCancelled);
        if (centerResult.task) activeTasks.push(centerResult.task);
        await centerResult.promise;

        if (cancelled) return;

        const prevResult = renderSlot(pdfDoc!, pageNumber - 1, prevCanvasRef.current!, availableWidth, isCancelled);
        if (prevResult.task) activeTasks.push(prevResult.task);

        const nextResult = renderSlot(pdfDoc!, pageNumber + 1, nextCanvasRef.current!, availableWidth, isCancelled);
        if (nextResult.task) activeTasks.push(nextResult.task);

        await Promise.all([prevResult.promise, nextResult.promise]);
      } catch {
        if (!cancelled) setError('book.errRender');
      }
    }

    void runRenders();

    return () => {
      cancelled = true;
      activeTasks.forEach(t => t.cancel());
    };
  }, [pageNumber, pdfDoc, viewerWidth]);

  // Reset zoom when page changes
  useEffect(() => {
    // Cancel any in-flight zoomed render
    zoomedRenderCancelRef.current?.();
    zoomedRenderCancelRef.current = null;
    scaleRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setZoomLevel(1);
    zoomApi.start({ scale: 1, x: 0, y: 0 });
  }, [pageNumber, zoomApi]);

  // -------------------------------------------------------------------------
  // Page navigation helpers
  // -------------------------------------------------------------------------
  function resetZoom() {
    zoomedRenderCancelRef.current?.();
    zoomedRenderCancelRef.current = null;
    scaleRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setZoomLevel(1);
    zoomApi.start({ scale: 1, x: 0, y: 0 });
    // Re-render the center canvas back at normal resolution
    if (pdfDoc && viewerWidthRef.current > 0 && currCanvasRef.current) {
      const availableWidth = Math.max(viewerWidthRef.current - 32, 280);
      let cancelled = false;
      const result = renderSlot(pdfDoc, pageNumberRef.current, currCanvasRef.current, availableWidth, () => cancelled);
      zoomedRenderCancelRef.current = () => { cancelled = true; result.task?.cancel(); };
    }
  }

  // Re-render the center canvas at the zoomed resolution so text stays crisp.
  function renderAtZoom(scale: number) {
    if (!pdfDoc || viewerWidthRef.current === 0 || !currCanvasRef.current) return;

    // Cancel any previous zoomed render
    zoomedRenderCancelRef.current?.();
    zoomedRenderCancelRef.current = null;

    const canvas = currCanvasRef.current;
    const availableWidth = Math.max(viewerWidthRef.current - 32, 280);
    const zoomedWidth = availableWidth * scale;
    let cancelled = false;

    const result = renderSlot(
      pdfDoc,
      pageNumberRef.current,
      canvas,
      zoomedWidth,
      () => cancelled,
    );
    zoomedRenderCancelRef.current = () => {
      cancelled = true;
      result.task?.cancel();
    };

    result.promise.then(() => {
      if (cancelled || !canvas) return;
      // renderSlot sets canvas CSS size to `availableWidth * scale` px (the zoomed size).
      // We need to reset it to the original display size so the layout doesn't jump.
      // The spring `scale` transform still applies the visual zoom — we just give the
      // canvas more backing pixels so text is crisp instead of blurry.
      const displayW = parseFloat(canvas.style.width) / scale;
      const displayH = parseFloat(canvas.style.height) / scale;
      canvas.style.width = `${Math.round(displayW)}px`;
      canvas.style.height = `${Math.round(displayH)}px`;
      // Do NOT touch zoomApi — the transform is unchanged, only the pixel density improved.
    });
  }

  function navigatePage(direction: 1 | -1) {
    const vw = viewerWidthRef.current;
    const pn = pageNumberRef.current;
    const tp = totalPagesRef.current;

    if (isNavigatingRef.current) return;
    if (direction === 1 && pn >= tp) return;
    if (direction === -1 && pn <= 1) return;

    isNavigatingRef.current = true;

    // Before the strip resets, copy the incoming canvas content to the center canvas
    // so there's zero visual flash when the strip reposition happens.
    const copyAndReset = () => {
      const src = direction === 1 ? nextCanvasRef.current : prevCanvasRef.current;
      const dst = currCanvasRef.current;
      if (src && dst && src.width > 0) {
        dst.width = src.width;
        dst.height = src.height;
        dst.style.width = src.style.width;
        dst.style.height = src.style.height;
        dst.getContext('2d')?.drawImage(src, 0, 0);
      }
      // Snap strip back to center instantly (center canvas now has the right content)
      stripApi.set({ stripX: -vw });
      // Advance the page — this triggers re-rendering of all 3 slots
      setPageNumber(pageNumberRef.current + direction);
      isNavigatingRef.current = false;
    };

    // Animate strip to reveal the prev or next slot, then copy + reset
    stripApi.start({
      stripX: direction === 1 ? -2 * vw : 0,
      onRest: ({ finished }) => {
        if (finished) copyAndReset();
        else isNavigatingRef.current = false;
      },
    });
  }

  function goToPage(nextPage: number) {
    if (!totalPages) return;
    setPageNumber(Math.min(Math.max(nextPage, 1), totalPages));
    // Strip centers itself via the viewerWidth/pageNumber effects
    stripApi.start({ stripX: -viewerWidthRef.current });
  }

  function selectSearchEntry(entry: BookSearchEntry) {
    goToPage(entry.page);
    setQuery('')
    setIsSearchOpen(false);
    inputRef.current?.blur();
  }

  function getEntryBadge(entry: BookSearchEntry) {
    if (entry.kind === 'chapter' && entry.chapter) return `${entry.chapter}`;
    if (entry.kind === 'section') return 'S';
    return 'P';
  }

  function getEntryMeta(entry: BookSearchEntry) {
    const chapterMeta =
      entry.kind === 'section' && entry.chapter
        ? entry.parentTitle
          ? t('book.chapterOf', { n: entry.chapter, parent: entry.parentTitle })
          : t('book.chapter', { n: entry.chapter })
        : entry.kind === 'chapter' && entry.chapter
          ? t('book.chapter', { n: entry.chapter })
          : t('book.bookLabel');
    return t('book.metaPage', { meta: chapterMeta, page: entry.page });
  }

  // -------------------------------------------------------------------------
  // Gesture setup
  // -------------------------------------------------------------------------
  const bind = useGesture(
    {
      onDrag: ({ active, offset: [ox, oy], movement: [mx], velocity: [vx], direction: [dx] }) => {
        const vw = viewerWidthRef.current;
        const currentScale = scaleRef.current;

        if (currentScale <= 1.05) {
          // ── SWIPE MODE: move the strip ──────────────────────────────────
          if (active) {
            const pn = pageNumberRef.current;
            const tp = totalPagesRef.current;
            let clampedOx = ox;

            // Rubber-band resistance at the first / last page
            if (ox > 0 && pn <= 1) clampedOx = ox * 0.25;
            if (ox < 0 && pn >= tp) clampedOx = ox * 0.25;

            stripApi.start({ stripX: -vw + clampedOx, immediate: true });
          } else {
            if (isNavigatingRef.current) return;
            const hardSwipe = Math.abs(vx) > 0.4;
            const longDrag = Math.abs(mx) > vw * 0.3;

            if ((hardSwipe || longDrag) && dx < 0) {
              navigatePage(1);  // next
            } else if ((hardSwipe || longDrag) && dx > 0) {
              navigatePage(-1); // prev
            } else {
              // Snap back to center
              stripApi.start({ stripX: -vw });
            }
          }
        } else {
          // ── PAN MODE: move the zoomed center canvas ─────────────────────
          zoomApi.start({ x: ox, y: oy, immediate: active });
          if (!active) panRef.current = { x: ox, y: oy };
        }
      },

      onPinch: ({ offset: [s], active }) => {
        const newScale = Math.min(Math.max(1, s), 4);
        scaleRef.current = newScale;
        setZoomLevel(Math.round(newScale * 10) / 10);

        if (!active && newScale < 1.15) {
          resetZoom();
        } else {
          zoomApi.start({ scale: newScale, immediate: active });
          if (!active) {
            if (newScale <= 1) {
              panRef.current = { x: 0, y: 0 };
              zoomApi.start({ x: 0, y: 0 });
            } else {
              // Pinch ended at zoom > 1 — re-render at high res for crisp text
              renderAtZoom(newScale);
            }
          }
        }
      },
    },
    {
      drag: {
        // In pan mode: continue from saved pan offset.
        // In swipe mode: always start from 0 (strip spring handles the rest).
        from: () =>
          scaleRef.current > 1.05
            ? [panRef.current.x, panRef.current.y]
            : [0, 0],
        filterTaps: true,
      },
      pinch: {
        scaleBounds: { min: 1, max: 4 },
        rubberband: true,
      },
    }
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-cream text-app-text">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-peachLight bg-white px-3 py-3 shadow-sm">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'SET_PAGE', payload: 'today' })}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-cream text-peachDark"
            aria-label={t('book.backToday')}
          >
            <ArrowLeft size={20} strokeWidth={2.3} />
          </button>

          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textMuted"
            />
            <input
              type="text"
              ref={inputRef}
              value={query}
              onChange={(event) => { setQuery(event.target.value); setIsSearchOpen(true); }}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={(e) => {
                if (e.relatedTarget?.id === 'clear-search') return;
                window.setTimeout(() => setIsSearchOpen(false), 100);
              }}
              placeholder={t('book.search')}
              className="h-10 w-full rounded-full border border-peachLight bg-cream px-9 text-sm font-bold text-app-text outline-none transition-colors placeholder:text-textMuted focus:border-peach"
            />
            {query && (
              <button
                id="clear-search"
                type="button"
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); setQuery(''); setIsSearchOpen(true); }}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-textMuted"
                aria-label={t('book.clearSearch')}
              >
                <X size={15} strokeWidth={2.2} />
              </button>
            )}

            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-12 z-10 max-h-72 overflow-y-auto rounded-2xl border border-peachLight bg-white p-2 shadow-lg">
                {searchResults.length > 0 ? (
                  searchResults.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSearchEntry(entry)}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-cream"
                    >
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-peachLight text-xs font-extrabold text-peachDark">
                        {getEntryBadge(entry)}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold text-app-text">{entry.title}</span>
                        <span className="block text-xs font-semibold text-textMuted">{getEntryMeta(entry)}</span>
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-4 text-sm font-semibold text-textMuted">{t('book.noResult')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      {lang === 'vi' && (
        <p className="flex-shrink-0 bg-peachLight/40 px-4 py-1.5 text-center text-xs font-semibold text-textMuted">{t('book.englishOnly')}</p>
      )}

      {/* ── Main: gesture container ─────────────────────────────────────────── */}
      <main
        ref={viewerRef}
        className="relative min-h-0 flex-1 overflow-hidden"
      >
        {/* Loading / error overlays */}
        {(isLoading) && (
          <div className="pointer-events-none absolute left-1/2 top-6 z-10 -translate-x-1/2 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-textMuted shadow-sm">
            {t('book.loading')}
          </div>
        )}

        {error && (
          <div className="absolute inset-x-4 top-16 z-10 rounded-2xl bg-white p-4 text-sm font-bold text-peachDark shadow-sm">
            {t(error)}
          </div>
        )}

        {/* Zoom badge */}
        {zoomLevel > 1 && (
          <button
            type="button"
            onClick={resetZoom}
            className="absolute right-3 top-3 z-10 rounded-full bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm"
            aria-label={t('book.resetZoom')}
          >
            {t('book.zoomReset', { pct: Math.round(zoomLevel * 100) })}
          </button>
        )}

        {/* Gesture capture layer */}
        <div
          {...bind()}
          onDoubleClick={zoomLevel > 1 ? resetZoom : undefined}
          style={{ touchAction: 'none', userSelect: 'none' } as React.CSSProperties}
          className="h-full w-full"
        >
          {/* ── 3-slot horizontal strip ───────────────────────────────────── */}
          <animated.div
            style={{
              display: 'flex',
              width: viewerWidth > 0 ? `${3 * viewerWidth}px` : '300%',
              height: '100%',
              x: stripX,
              willChange: 'transform',
            }}
          >
            {/* Slot 0 – previous page */}
            <div
              style={{ width: viewerWidth || '33.333%', flexShrink: 0, overflow: 'hidden' }}
              className="flex items-start justify-center py-4 px-4"
            >
              <canvas ref={prevCanvasRef} className="mx-auto rounded-lg bg-white shadow-md" />
            </div>

            {/* Slot 1 – current page (zoom applied here) */}
            <div
              style={{ width: viewerWidth || '33.333%', flexShrink: 0, overflow: 'hidden' }}
              className="flex items-start justify-center py-4 px-4"
            >
              <animated.div
                style={{
                  transformOrigin: 'center top',
                  willChange: 'transform',
                  transform: to(
                    [zoomProps.scale, zoomProps.x, zoomProps.y],
                    (s, tx, ty) => `translate3d(${tx}px, ${ty}px, 0) scale(${s})`
                  ),
                }}
              >
                <canvas ref={currCanvasRef} className="mx-auto rounded-lg bg-white shadow-md" />
              </animated.div>
            </div>

            {/* Slot 2 – next page */}
            <div
              style={{ width: viewerWidth || '33.333%', flexShrink: 0, overflow: 'hidden' }}
              className="flex items-start justify-center py-4 px-4"
            >
              <canvas ref={nextCanvasRef} className="mx-auto rounded-lg bg-white shadow-md" />
            </div>
          </animated.div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="flex-shrink-0 border-t border-peachLight bg-white px-4 py-3"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goToPage(pageNumber - 1)}
            disabled={pageNumber <= 1 || isLoading}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-cream text-peachDark transition-opacity disabled:opacity-40"
            aria-label={t('book.prev')}
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>

          {/* Center: chapter + page stacked */}
          <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
            {currentChapter && (
              <span className="flex items-center gap-1.5 w-full justify-center">
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-peachLight px-1 text-[9px] font-extrabold text-peachDark flex-shrink-0">
                  {currentChapter.chapter}
                </span>
                <span className="truncate text-[11px] font-semibold text-textMuted">
                  {getLocalizedChapterTitle(currentChapter.chapter, lang)}
                </span>
              </span>
            )}
            <span className="text-sm font-extrabold text-app-text">
              {totalPages ? `${pageNumber} / ${totalPages}` : t('book.loadingShort')}
            </span>
          </div>

          <button
            type="button"
            onClick={() => goToPage(pageNumber + 1)}
            disabled={!totalPages || pageNumber >= totalPages || isLoading}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-peach text-white shadow-md transition-opacity disabled:opacity-40"
            aria-label={t('book.next')}
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>
        </div>
      </footer>
    </div>
  );
}
