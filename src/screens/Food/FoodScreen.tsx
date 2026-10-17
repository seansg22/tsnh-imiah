import { useLayoutEffect, useRef, useState } from 'react';
import { addMonths, differenceInCalendarDays, parseISO } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  CirclePlay,
  Clock3,
  ExternalLink,
  Search,
  ShieldCheck,
  Soup,
  Utensils,
} from 'lucide-react';
import { useApp } from '../../context/appStateContext';
import { useLang } from '../../i18n/langContext';
import { formatDate } from '../../i18n/date';
import type { Lang } from '../../i18n/langContext';
import type { UiKey } from '../../i18n/ui';
import { useBabyAge } from '../../hooks/useBabyAge';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { BabyRecipe } from '../../data/foodByMonth';
import { getCategoryLabel, getDifficultyLabel, getFoodData } from '../../data/localizedFood';

function getBabyMonth(totalDays: number) {
  const month = Math.floor(totalDays / 30.4375);
  return Math.max(6, Math.min(12, month));
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim()
    .toLowerCase();
}

function getSolidsBanner(birthDate: string | null, babyName: string, t: (key: UiKey, vars?: Record<string, string | number>) => string, lang: Lang) {
  if (!birthDate) return null;

  const sixMonthDate = addMonths(parseISO(birthDate), 6);
  const daysUntil = differenceInCalendarDays(sixMonthDate, new Date());

  if (daysUntil <= 0) return null;

  return {
    title: t('food.solidsTitle'),
    body: t('food.solidsBody', { name: babyName, date: formatDate(sixMonthDate, lang === 'vi' ? 'd MMM' : 'MMM d', lang) }),
    badgeMain: String(daysUntil),
    badgeSub: daysUntil === 1 ? t('food.dayLeft') : t('food.daysLeft'),
  };
}

function getRecipeYoutubeUrl(recipe: BabyRecipe) {
  const query = `${recipe.vietnameseTitle} ăn dặm cho bé ${recipe.month} tháng`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function RecipeCard({
  recipe,
  onOpen,
}: {
  recipe: BabyRecipe;
  onOpen: () => void;
}) {
  const { t, lang } = useLang();
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full overflow-hidden rounded-xl bg-white text-left shadow-sm active:scale-[0.99] transition-transform"
    >
      <div className="flex w-[72px] flex-shrink-0 flex-col items-center justify-center bg-peachLight/60 text-peachDark">
        <Soup size={20} strokeWidth={2.3} />
        <span className="mt-1 text-xs font-extrabold">{t('food.monthPlus', { n: recipe.month })}</span>
      </div>
      <div className="min-w-0 flex-1 p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-extrabold leading-snug text-app-text">{recipe.vietnameseTitle}</p>
            <p className="mt-0.5 line-clamp-1 text-xs font-bold leading-tight text-textMuted">{recipe.englishTitle}</p>
          </div>
          <ChevronRight size={16} strokeWidth={2.4} className="mt-0.5 flex-shrink-0 text-textMuted" />
        </div>
        <p className="mt-1 line-clamp-1 text-sm font-semibold text-textMuted">{getCategoryLabel(recipe.category, lang)} · {recipe.prepTime}</p>
      </div>
    </button>
  );
}

function RecipeDetail({
  recipe,
  isMade,
  onBack,
  onToggleMade,
}: {
  recipe: BabyRecipe;
  isMade: boolean;
  onBack: () => void;
  onToggleMade: () => void;
}) {
  const { t, lang } = useLang();
  // Swipe right anywhere to go back, like iPhone (pointer events: touch + mouse)
  const start = useRef<{ x: number; y: number } | null>(null);
  return (
    <div
      className="fade-in min-h-screen bg-cream"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={e => {
        start.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={e => {
        const s0 = start.current;
        start.current = null;
        if (s0 && e.clientX - s0.x > 80 && Math.abs(e.clientY - s0.y) < 60) onBack();
      }}
      onPointerCancel={() => {
        start.current = null;
      }}
    >
      <div className="sticky top-0 z-20 flex h-14 items-center justify-between bg-cream/95 px-4 backdrop-blur-[2px]">
        <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-peachLight text-peachDark">
          <ArrowLeft size={20} strokeWidth={2.4} />
        </button>
        <p className="mx-3 min-w-0 flex-1 truncate text-center text-sm font-extrabold text-app-text">{recipe.vietnameseTitle}</p>
        <div className="h-9 w-9" />
      </div>

      <div className="px-4 pb-6">
        <div className="flex items-start justify-between gap-4 pt-2">
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold leading-tight text-app-text">{recipe.vietnameseTitle}</h1>
            <p className="mt-1 text-sm font-bold leading-tight text-textMuted">{recipe.englishTitle}</p>
          </div>
        </div>

        <button type="button" onClick={onToggleMade} className="mt-3 flex w-full items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-left shadow-sm">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${isMade ? 'bg-success' : 'bg-peachLight ring-2 ring-peach'}`}>
            {isMade && <Check size={19} strokeWidth={3} className="text-white" />}
          </span>
          <span className="text-sm font-extrabold text-app-text">{isMade ? t('food.alreadyMade') : t('food.markMade')}</span>
        </button>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white p-2 text-center shadow-sm">
            <Clock3 size={16} className="mx-auto text-peachDark" />
            <p className="mt-1 text-xs font-extrabold text-app-text">{recipe.prepTime}</p>
          </div>
          <div className="rounded-xl bg-white p-2 text-center shadow-sm">
            <Soup size={16} className="mx-auto text-peachDark" />
            <p className="mt-1 text-xs font-extrabold text-app-text">{t('food.monthPlus', { n: recipe.month })}</p>
          </div>
          <div className="rounded-xl bg-white p-2 text-center shadow-sm">
            <Utensils size={16} className="mx-auto text-peachDark" />
            <p className="mt-1 text-xs font-extrabold text-app-text">{getDifficultyLabel(recipe.difficulty, lang)}</p>
          </div>
        </div>

        <p className="mt-3 text-sm font-medium leading-relaxed text-textMuted">{recipe.summary}</p>

        <a
          href={getRecipeYoutubeUrl(recipe)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl bg-red-500 px-3 py-2.5 text-white shadow-sm active:scale-[0.99] transition-transform"
          aria-label={t('food.openYtAria', { title: recipe.vietnameseTitle })}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
              <CirclePlay size={18} strokeWidth={2.4} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold leading-tight">{t('food.watch')}</span>
              <span className="block text-xs font-bold leading-tight text-white/80">{t('food.openYt')}</span>
            </span>
          </span>
          <ExternalLink size={16} strokeWidth={2.4} className="flex-shrink-0" />
        </a>

        {recipe.allergens.length > 0 && (
          <div className="mt-3 rounded-xl bg-peachLight/40 p-3">
            <p className="flex items-center gap-1.5 text-sm font-extrabold text-app-text">
              <AlertTriangle size={16} strokeWidth={2.4} className="flex-shrink-0 text-amber-600" />
              {t('food.allergens')}
            </p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-textMuted">{recipe.allergens.join(', ')}</p>
          </div>
        )}

        <section className="mt-3 rounded-xl bg-white p-3 shadow-sm">
          <h2 className="text-base font-extrabold text-app-text">{t('food.ingredients')}</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm font-semibold leading-relaxed text-app-text">
            {recipe.ingredients.map(ingredient => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
        </section>

        <section className="mt-3 rounded-xl bg-white p-3 shadow-sm">
          <h2 className="text-base font-extrabold text-app-text">{t('food.directions')}</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm font-semibold leading-relaxed text-app-text">
            {recipe.directions.map(step => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        {recipe.directions.some(step => /mash|blend|nghiền|xay/i.test(step)) && (
          <section className="mt-3 rounded-xl bg-white p-3 shadow-sm">
            <h2 className="text-base font-extrabold text-app-text">{t('food.mashTitle')}</h2>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm font-semibold leading-relaxed text-app-text">
              {(['food.mashStep1', 'food.mashStep2', 'food.mashStep3', 'food.mashStep4'] as const).map(key => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-3 flex gap-3 rounded-xl bg-peachLight/50 p-3">
          <ShieldCheck size={19} strokeWidth={2.4} className="mt-0.5 flex-shrink-0 text-peachDark" />
          <p className="text-sm font-bold leading-relaxed text-app-text">{recipe.safetyNote}</p>
        </div>
      </div>
    </div>
  );
}

export function FoodScreen() {
  const { state } = useApp();
  const { t, lang } = useLang();
  const birthDate = state.babyProfile?.birthDate ?? null;
  const babyName = state.babyProfile?.name ?? t('food.defaultName');
  const { totalDays } = useBabyAge(birthDate);
  const initialMonth = getBabyMonth(totalDays);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [query, setQuery] = useState('');
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [madeIds, setMadeIds] = useLocalStorage<string[]>('baby-day:food-made', []);

  const solidsBanner = getSolidsBanner(birthDate, babyName, t, lang);
  const { foodMonthPlans, getFoodMonthPlan, recipeDatabase } = getFoodData(lang);
  const monthPlan = getFoodMonthPlan(selectedMonth);
  const selectedRecipe = recipeDatabase.find(recipe => recipe.id === selectedRecipeId) ?? null;

  const filteredRecipes = (() => {
    const normalizedQuery = normalizeSearchText(query);
    return recipeDatabase.filter(recipe => {
      const matchesMonth = recipe.month === selectedMonth;
      const haystack = normalizeSearchText([
        recipe.title,
        recipe.vietnameseTitle,
        recipe.englishTitle,
        getCategoryLabel(recipe.category, lang),
        recipe.summary,
        ...recipe.tags,
        ...recipe.ingredients,
        ...recipe.allergens,
      ].join(' '));
      return matchesMonth && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  })();

  const madeRecipes = recipeDatabase.filter(recipe => madeIds.includes(recipe.id));

  const listScrollY = useRef(0);
  useLayoutEffect(() => {
    window.scrollTo(0, selectedRecipeId ? 0 : listScrollY.current);
  }, [selectedRecipeId]);

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        isMade={madeIds.includes(selectedRecipe.id)}
        onBack={() => setSelectedRecipeId(null)}
        onToggleMade={() => setMadeIds(madeIds.includes(selectedRecipe.id) ? madeIds.filter(id => id !== selectedRecipe.id) : [...madeIds, selectedRecipe.id])}
      />
    );
  }

  return (
    <div className="fade-in">
      <div className="px-4 pt-5 pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-app-text">{t('food.title')}</h1>
            <p className="mt-1 text-sm font-medium text-textMuted">
              {t('food.count', { n: recipeDatabase.length })}
            </p>
          </div>
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-peachLight text-peachDark">
            <Utensils size={19} strokeWidth={2} />
          </div>
        </div>
      </div>

      {solidsBanner && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-peachLight/60 px-3 py-2.5 shadow-sm">
            <div className="min-w-0">
              <p className="text-sm font-extrabold leading-tight text-app-text">{solidsBanner.title}</p>
              <p className="mt-0.5 text-xs font-semibold leading-tight text-textMuted">{solidsBanner.body}</p>
            </div>
            <div className="flex-shrink-0 rounded-lg bg-white px-3 py-1.5 text-center">
              <p className="text-base font-extrabold leading-none text-peachDark">{solidsBanner.badgeMain}</p>
              <p className="mt-0.5 text-[11px] font-bold uppercase leading-none text-textMuted">{solidsBanner.badgeSub}</p>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 bg-cream px-4 pb-3 pt-3">
        <div className="flex items-center gap-2 rounded-xl bg-warm px-3 py-2">
          <Search size={16} className="flex-shrink-0 text-textMuted" />
          <input
            type="text"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={t('food.searchPh')}
            className="min-w-0 flex-1 bg-transparent text-sm text-app-text outline-none placeholder:text-textMuted"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-xs font-bold text-textMuted">
              ✕
            </button>
          )}
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {foodMonthPlans.map(plan => (
            <button
              key={plan.month}
              type="button"
              onClick={() => setSelectedMonth(plan.month)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                selectedMonth === plan.month ? 'bg-peach text-white' : 'bg-warm text-textMuted'
              }`}
            >
              {t('food.monthPlus', { n: plan.month })}
            </button>
          ))}
        </div>
      </div>

      <section className="px-4 pt-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-app-text">{t('food.recFoods')}</h2>
          </div>
        </div>
        <p className="mt-1.5 text-sm font-medium leading-relaxed text-textMuted">{monthPlan.summary}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {monthPlan.recommendations.map(food => (
            <div key={food.name} className="min-w-0 rounded-xl bg-white p-2.5 shadow-sm">
              <p className="line-clamp-1 text-sm font-extrabold leading-snug text-app-text">{food.vietnameseName}</p>
              <p className="mt-0.5 line-clamp-1 text-xs font-bold leading-tight text-textMuted">{food.englishName}</p>
              <p className="mt-1 text-xs font-semibold leading-snug text-textMuted">
                <span className="font-extrabold text-app-text">{t('food.nutrition')}</span>
                {food.nutrition}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-app-text">{t('food.recRecipes')}</h2>
          <p className="text-xs font-bold text-textMuted">{t('food.made', { n: madeRecipes.length })}</p>
        </div>
        <div className="mt-3 space-y-2">
          {filteredRecipes.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onOpen={() => {
                listScrollY.current = window.scrollY;
                setSelectedRecipeId(recipe.id);
              }}
            />
          ))}
        </div>
        {filteredRecipes.length === 0 && (
          <div className="mt-3 rounded-xl bg-white p-4 text-center shadow-sm">
            <p className="text-sm font-extrabold text-textMuted">{t('food.noMatch')}</p>
          </div>
        )}
      </section>

      <section className="px-4 pb-6 pt-4">
        <div className="rounded-xl bg-peachLight/50 p-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={19} strokeWidth={2.4} className="text-peachDark" />
            <p className="text-base font-extrabold text-app-text">{t('food.safety')}</p>
          </div>
          <ul className="mt-2 space-y-1.5">
            {monthPlan.safety.map(item => (
              <li key={item} className="text-sm font-semibold leading-relaxed text-textMuted">{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
