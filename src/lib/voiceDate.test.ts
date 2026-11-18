import { describe, expect, it } from 'vitest';
import { voiceDate } from './voiceDate';

// today = Wednesday 2026-11-18. This week: Mon 16, Tue 17. Last week: Mon 9 ... Thu 12, Fri 13, Sat 14, Sun 15.
const today = '2026-11-18';
const cases: Record<string, [string, string][]> = {
  'nothing said = today': [
    ['', today], ['bé uống 120 ml sữa', today], ['hôm nay bé ị 2 lần', today], ['today she had porridge', today],
    ['bé ị ngày 3 lần', today], ['mỗi ngày 2 cữ', today], ['ngày 3 bữa', today], ['bé 5 tháng 2 tuần tuổi', today],
    ['cữ sữa thứ hai là 80ml', today], ['bữa thứ ba ăn cháo', today], ['xóa bữa ăn dặm thứ 2', today],
    ['3 ngày rồi bé chưa ị', today], ['ăn 1/2 chén cháo', today], ['ăn 1/2 chuối', today], ['3/4 bát', today],
    ['120/150', today], ['may 30 ml milk', today], ['3 marinated beef', today], ['on the 3rd feed 90 ml', today],
  ],
  'vi: day and month': [
    ['ngày 3 tháng 11 cập nhật bữa phụ từ chuối sang bơ', '2026-11-03'], ['Ngày 3 Tháng 11', '2026-11-03'],
    ['ngày 03 tháng 11', '2026-11-03'], ['3 tháng 11 bé ăn cháo', '2026-11-03'], ['xóa ngày 2 tháng 11', '2026-11-02'],
    ['ngày 20 tháng 10', '2026-10-20'], ['ngày 3 tháng 11 năm 2025', '2025-11-03'], ['hôm 3 tháng 11', '2026-11-03'],
  ],
  'vi: slash': [
    ['sửa ngày 3/11 sữa 120', '2026-11-03'], ['ngày 03/11/2026', '2026-11-03'], ['3/11/26', '2026-11-03'], ['hôm 3/11', '2026-11-03'],
    ['11/15', '2026-11-15'], ['ngày 5/6', '2026-06-05'],
  ],
  'vi: relative': [
    ['hôm qua bé ị 2 lần', '2026-11-17'], ['bữa qua bé ăn cháo', '2026-11-17'], ['tối qua bé bú 100', '2026-11-17'],
    ['đêm qua bé dậy bú', '2026-11-17'], ['hồi hôm bé ị', '2026-11-17'], ['hôm kia bé ăn cháo', '2026-11-16'],
    ['3 ngày trước bé ăn bơ', '2026-11-15'], ['ba ngày trước', '2026-11-15'], ['cách đây 4 ngày', '2026-11-14'],
    ['một tuần trước', '2026-11-11'], ['hai tuần trước', '2026-11-04'], ['cách đây 2 tuần', '2026-11-04'],
    ['tuần trước bé ăn bơ', '2026-11-11'], ['tuần rồi bé ị', '2026-11-11'],
  ],
  'vi: weekday': [
    ['hôm thứ hai bé ăn', '2026-11-16'], ['vào thứ sáu bé ị', '2026-11-13'], ['thứ hai tuần trước bé ăn', '2026-11-09'],
    ['thứ 3 vừa rồi', '2026-11-17'], ['ngày thứ 7 bé ăn', '2026-11-14'], ['chủ nhật bé bú 100', '2026-11-15'],
    ['chủ nhật tuần trước', '2026-11-15'], ['hôm thứ tư bé ăn', today], ['thứ sáu tuần trước', '2026-11-13'], ['thứ năm tuần rồi', '2026-11-12'],
  ],
  'vi: day of month only': [
    ['ngày 3 cập nhật bữa phụ', '2026-11-03'], ['mùng 5 bé ăn cháo', '2026-11-05'], ['ngày 20 sửa sữa', '2026-10-20'], ['ngày 18 bé ị', today],
  ],
  'en: date': [
    ['november 3', '2026-11-03'], ['Nov 3rd porridge', '2026-11-03'], ['3 nov', '2026-11-03'], ['3rd of November', '2026-11-03'],
    ['the 3rd of november', '2026-11-03'], ['november the 3rd', '2026-11-03'], ['november 3, 2025', '2025-11-03'],
    ['3 november 2025', '2025-11-03'], ['update oct 20 snack to avocado', '2026-10-20'], ['sept 5', '2026-09-05'],
    ['on 2026-11-03 she had rice', '2026-11-03'], ['11/3/2026', '2026-03-11'], ['on the 3rd she had rice', '2026-11-03'], ['on the 20th', '2026-10-20'],
  ],
  'en: relative and weekday': [
    ['yesterday banana snack', '2026-11-17'], ['last night she woke up', '2026-11-17'], ['the day before yesterday', '2026-11-16'],
    ['2 days ago', '2026-11-16'], ['three days ago', '2026-11-15'], ['a couple of days ago', '2026-11-16'], ['a week ago', '2026-11-11'],
    ['two weeks ago', '2026-11-04'], ['3 weeks ago', '2026-10-28'], ['last week she ate rice', '2026-11-11'],
    ['on monday she ate rice', '2026-11-16'], ['Friday', '2026-11-13'], ['last wednesday', '2026-11-11'], ['wednesday', today],
    ['monday last week', '2026-11-09'], ['last friday', '2026-11-13'], ['sunday', '2026-11-15'],
  ],
  'not a real date': [
    ['ngày 31 tháng 2 bé ăn', today], ['31/2', today], ['february 30', today], ['ngày 25 tháng 12 bé ăn', '2026-12-25'],
  ],
};

describe('voiceDate', () => {
  for (const [group, list] of Object.entries(cases)) {
    describe(group, () => it.each(list)('%s', (said, want) => expect(voiceDate(said, today)).toBe(want)));
  }
  it('rolls the day-only guess into the last year in January', () => {
    expect(voiceDate('ngày 20', '2027-01-05')).toBe('2026-12-20');
  });
});
