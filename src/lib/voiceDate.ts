// The day a spoken note is about, found in the words (cheap, no AI), so Gemini only needs that one saved day.
// Nothing said = today. Works for Vietnamese and English speech-to-text.
// ponytail: regex only. A phrase it does not know counts as today, and the screen then rejects the answer when Gemini
// reads another date. Add a pattern here when a real phrase slips through (see voiceDate.test.ts).

const iso = (d: Date) => d.toISOString().split('T')[0];
// a real calendar date as "YYYY-MM-DD", or undefined for 31/2 and the like
const real = (y: number, m: number, d: number) => {
  const x = new Date(Date.UTC(y, m - 1, d));
  return x.getUTCFullYear() === y && x.getUTCMonth() === m - 1 && x.getUTCDate() === d ? iso(x) : undefined;
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
const monthNo = (s: string) => MONTHS.indexOf(s.slice(0, 3)) + 1;

const COUNT: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, couple: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  một: 1, hai: 2, ba: 3, bốn: 4, năm: 5, sáu: 6, bảy: 7, tám: 8, chín: 9, mười: 10,
};
const NUM = `\\d{1,2}|${Object.keys(COUNT).join('|')}`;
const count = (s: string) => COUNT[s] ?? Number(s);

// weekday as Monday = 0 ... Sunday = 6
const EN_DAY = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const VI_DAY: Record<string, number> = { hai: 0, ba: 1, tư: 2, năm: 3, sáu: 4, bảy: 5 };
const vi = (s: string) => VI_DAY[s] ?? Number(s) - 2; // "thứ 2" ... "thứ 7"
const VI_W = 'hai|ba|tư|năm|sáu|bảy|[2-7]';
// "thứ hai" alone also means "the second" (cữ sữa thứ hai), so it needs a word before it or "last week" after it
const VI_WEEKDAY = new RegExp(`(?:hôm|ngày|vào|hồi)\\s+thứ\\s*(${VI_W})(?!\\d)|thứ\\s*(${VI_W})(?=\\s*(?:tuần trước|tuần rồi|tuần này|vừa rồi|vừa qua))`);

// words after "1/2" that show it is a portion, not a date
const PORTION = 'chén|bát|tô|muỗng|thìa|ly|cốc|quả|trái|củ|miếng|phần|cup|bowl|spoon|tsp|tbsp|glass|of\\b|portion|piece|slice';

export function voiceDate(said: string, today: string): string {
  const t = said.normalize('NFC').toLowerCase().replace(/\s+/g, ' ');
  const [Y, M, D] = today.split('-').map(Number);
  const back = (n: number) => iso(new Date(Date.UTC(Y, M - 1, D - n)));
  const ahead = (n: number) => iso(new Date(Date.UTC(Y, M - 1, D + n)));
  const year = (s?: string) => (!s ? Y : s.length === 2 ? 2000 + Number(s) : Number(s));

  // 1. a written date. Each pattern gives the [year, month, day] guesses to try, in order.
  const dates: [RegExp, (m: string[]) => number[][]][] = [
    // 2026-11-03
    [/(?:^|\D)(\d{4})-(\d{2})-(\d{2})(?!\d)/g, m => [[+m[1], +m[2], +m[3]]]],
    // ngày 3 tháng 11 (năm 2026). Not "bé 5 tháng 2 tuần tuổi"
    [/(?:^|\D)(\d{1,2})\s*tháng\s*(\d{1,2})(?!\d)(?:\s*năm\s*(\d{4}))?(?!\s*(?:tuần|tuổi|lần))/g, m => [[year(m[3]), +m[2], +m[1]]]],
    // 3 nov, 3rd of november 2026
    [new RegExp(`(?:^|\\D)(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(${MONTH})\\b(?:,?\\s*(\\d{4}))?`, 'g'), m => [[year(m[3]), monthNo(m[2]), +m[1]]]],
    // november 3, nov the 3rd, not "may 30 ml"
    [new RegExp(`\\b(${MONTH})\\b\\.?\\s+(?:the\\s+)?(\\d{1,2})(?!\\d)(?:st|nd|rd|th)?(?!\\s*(?:ml|g|oz|cc)\\b)(?:,?\\s*(\\d{4}))?`, 'g'), m => [[year(m[3]), monthNo(m[1]), +m[2]]]],
    // 3/11, 3/11/2026, 3/11/26. Day first (Vietnam); "11/15" can only be month first. "1/2" "3/4" are fractions.
    [new RegExp(`(?:^|[^\\d/])(\\d{1,2})/(\\d{1,2})(?:/(\\d{2,4}))?(?![\\d/])(?!\\s*(?:${PORTION}))`, 'g'), m => {
      const [a, b] = [+m[1], +m[2]];
      if (!m[3] && a < b && b <= 4) return [];
      return [b > 12 ? [year(m[3]), a, b] : [year(m[3]), b, a]];
    }],
  ];
  for (const [re, guess] of dates) {
    for (const m of t.matchAll(re)) {
      for (const [y, mo, d] of guess(m)) {
        const r = real(y, mo, d);
        if (r) return r;
      }
    }
  }

  // 2. a weekday: the latest one up to today. "last" / "tuần trước" = strictly before / in the week before.
  const dow = (new Date(Date.UTC(Y, M - 1, D)).getUTCDay() + 6) % 7;
  const weekday = (idx: number) => {
    const diff = dow - idx;
    if (/tuần trước|tuần rồi|last week/.test(t)) return back(diff + 7);
    if (/\blast\b|previous|vừa rồi|vừa qua/.test(t)) return back(diff > 0 ? diff : diff + 7);
    return back(diff >= 0 ? diff : diff + 7);
  };
  const vw = t.match(VI_WEEKDAY);
  if (vw) return weekday(vi(vw[1] ?? vw[2]));
  if (/chủ nhật|chúa nhật/.test(t)) return weekday(6);
  const ew = t.match(new RegExp(`\\b(${EN_DAY.join('|')})\\b`));
  if (ew) return weekday(EN_DAY.indexOf(ew[1]));

  // 3. a number of days or weeks back. "3 ngày rồi" (it has been 3 days) is not one.
  // the days ahead: the screen then says the day has not come yet
  if (/ngày kia|day after tomorrow/.test(t)) return ahead(2);
  if (/(?:ngày|hôm|sáng|trưa|chiều|tối|đêm)\s*mai\b|tomorrow/.test(t)) return ahead(1);
  if (/hôm kia|bữa kia|day before yesterday/.test(t)) return back(2);
  if (/(?:hôm|bữa|tối|chiều|sáng|trưa|đêm)\s*qua|hồi hôm(?!\s*(?:nay|kia))|yesterday|last night/.test(t)) return back(1);
  const ago = t.match(new RegExp(`(?:^|\\s)(${NUM})\\s*(?:of\\s+)?(?:(ngày|hôm)\\s*trước|(tuần)\\s*(?:trước|rồi)|(days?)\\s+(?:ago|back)|(weeks?)\\s+(?:ago|back))`))
    ?? t.match(new RegExp(`cách đây\\s*(${NUM})\\s*(?:(ngày)|(tuần))`));
  if (ago) return back(count(ago[1]) * (ago[3] || ago[5] ? 7 : 1));
  if (/tuần trước|tuần rồi|last week/.test(t)) return back(7);

  // 4. only the day of the month: "ngày 3", "mùng 5", "on the 3rd". Not "ngày 3 lần" (3 times a day).
  const only = t.match(/(?:ngày|mùng|mồng)\s*(\d{1,2})(?!\d|\s*(?:\/|tháng|lần|cữ|cử|bữa|muỗng|ml|tuần|tuổi|hôm))/)
    ?? t.match(/\bon the (\d{1,2})(?:st|nd|rd|th)\b(?!\s*(?:feed|meal|bottle|time|poop|snack|milk|diaper))/);
  if (only) {
    const d = Number(only[1]);
    const now = real(Y, M, d);
    if (now && now <= today) return now;
    return (M === 1 ? real(Y - 1, 12, d) : real(Y, M - 1, d)) ?? today; // the day has not come this month: last month
  }
  return today;
}
