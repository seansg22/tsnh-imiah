import { Moon, Milk, Zap, Star } from 'lucide-react';
import type { Activity, WeekData } from '../../types';

// Playlist: "Your Baby's Development, Week by Week" — week 43 is missing in the playlist
const WEEK_VIDEO_IDS: Record<number, string> = {
  1: 'EbH0D720Fb4', 2: 'UWLzYS57J_8', 3: 'VOn5NPMfQTo', 4: 'QyW-C_bRr98',
  5: 'ejMyQzB454M', 6: 'nP2wofsZZ5Q', 7: 'W7Ei5-MOjNI', 8: '8PlblRCq4YI',
  9: 'OSNsc6Vhmw4', 10: 'apYV11Shk2o', 11: '4XLPhYO93PQ', 12: 'fZ269FwNsEQ',
  13: 'X2m2nDUDviA', 14: 'fUJ0l4nrV-w', 15: '8wMgzXNV4aM', 16: '-mR3BimBLn8',
  17: 'mwGJNKJ60Cg', 18: 'f7ey0xjUdPw', 19: 'mAcOWmZQ2N4', 20: 'vioocKepq78',
  21: 'ElBm6_t4l6Y', 22: 'ValCycmLl2w', 23: '7lavEOrPgO4', 24: '6W-LGTgzhjo',
  25: 'HHuHjP_hAek', 26: 'rSmS384ri0k', 27: 'rp6UhQ6P0x0', 28: 'WAFnJY3q7vQ',
  29: 'ofslcqFFxzY', 30: 'o3WiDAQFNTY', 31: 'KRS_pvq7Ej0', 32: '8pyDGsj9R-Q',
  33: 'EPnytAzWARw', 34: '8ALKlF04RY8', 35: 'I2LgJFsjYgQ', 36: 'G66QTeHcORc',
  37: '2KMsrEXFonA', 38: '5DpWcjlUVvA', 39: 'sEknfB-o_34', 40: '_PB1_c4-Ysk',
  41: 'Fw4JkENRrQs', 42: 'MLiTc9p02rw', 44: '-fPNparhRCQ', 45: 'yPkftodD2vI',
  46: 'sh-gJroMkEc', 47: 'HWQDOuKvRaQ', 48: 'JUgLrNd2peY', 49: 'xRpWikTaUFA',
  50: 'SnOA1amFQ6k', 51: 'Ov-x3FbOW1M', 52: 'zyCp51AXeZo',
};

interface WhatToExpectSectionProps {
  week: number;
  data: WeekData;
}

const ACTIVITY_SEARCH_TERMS: Record<string, string> = {
  'Talk softly': 'talking to newborn baby',
  'Show your face': 'face to face newborn interaction',
  'Slow dance': 'dancing with baby bonding',
  'Coo back and forth': 'baby cooing communication',
  'Bicycle legs': 'baby bicycle legs gas relief',
  'Outdoor air': 'taking newborn outside',
  'Smile game': 'baby social smile game',
  'Narrate everything': 'talking to baby language development',
  'Coo conversation': 'baby cooing conversation',
  'Window gazing': 'baby visual stimulation',
  'Make them laugh': 'make baby laugh',
  'Name game': 'baby name recognition',
  'Roll practice': 'baby rolling exercises',
  'Sound imitation': 'baby sound imitation',
  'Foot discovery': 'baby discovering feet',
  'Scarf magic': 'baby peekaboo scarf play',
  'Object grab': 'baby reaching grasping activity',
  'Sit practice': 'baby sitting practice',
  'Object hide': 'baby object permanence game',
  'Food exposure': 'baby food exposure before solids',
  'Object in container': 'baby container play',
  'First words game': 'baby first words activities',
  'Walking practice': 'baby walking practice',
  'Board book library': 'reading board books baby',
  'Birthday adventure': 'toddler birthday activity ideas',
  'Baby book': 'baby memory book ideas',
  'Push toy walk': 'toddler push toy walking',
  'Naming walk': 'toddler vocabulary walk',
  'Body part game': 'toddler body parts game',
  'Emotion naming': 'toddler emotion naming',
  'Parallel household tasks': 'toddler helping household chores',
  'Word labeling': 'toddler language labeling',
  'Choice architecture': 'offering choices toddler',
  'Expand their sentences': 'expanding toddler sentences',
  'Answer why with why': 'toddler why questions',
  'Letter exposure': 'letter recognition toddler activities',
  'Name writing': 'preschool name writing activity',
  'Photo journey': 'family photo memory activity toddler',
};

function getActivityAgeContext(week: number): string {
  if (week < 4) return 'newborn baby';
  if (week < 52) return 'baby';
  return 'toddler';
}

function getActivitySearchQuery(activity: Activity, week: number): string {
  const searchTerm = ACTIVITY_SEARCH_TERMS[activity.title] ?? activity.title.toLowerCase();
  const hasAgeContext = /\b(newborn|baby|toddler|preschool|child|children)\b/i.test(searchTerm);
  return hasAgeContext ? searchTerm : `${searchTerm} ${getActivityAgeContext(week)}`;
}

function getActivityYoutubeUrl(activity: Activity, week: number): string {
  const query = getActivitySearchQuery(activity, week);
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}



// lucide-react has no brand icons, so inline the YouTube logo
function YouTubeLogo() {
  return (
    <svg width="20" height="14" viewBox="0 0 24 17" className="flex-shrink-0 mt-1" aria-hidden="true">
      <rect width="24" height="17" rx="4.5" fill="#FF0000" />
      <path d="M9.5 4.8v7.4L16 8.5z" fill="#fff" />
    </svg>
  );
}

export function WhatToExpectSection({ week, data }: WhatToExpectSectionProps) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2">
        <Star size={16} strokeWidth={2} className="text-peachDark" />
        <p className="text-base font-extrabold text-app-text">What to expect at week {week}</p>
      </div>

      <div className="mt-4 space-y-4">
          <p className="text-sm text-textMuted leading-relaxed">{data.summary}</p>

          {WEEK_VIDEO_IDS[week] && (
            <div className="rounded-2xl overflow-hidden shadow-sm aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${WEEK_VIDEO_IDS[week]}`}
                title={`Week ${week} baby development`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Moon size={16} strokeWidth={2} className="text-indigo-400" />
              <p className="font-bold text-app-text">Sleep</p>
            </div>
            <div className="text-sm text-textMuted space-y-1">
              <p>Total: <span className="text-app-text font-semibold">{data.sleep.totalHoursRange} hours/day</span></p>
              <p>Longest overnight stretch: <span className="text-app-text font-semibold">{data.sleep.nightSleepHours}</span></p>
              <p>Daytime naps: <span className="text-app-text font-semibold">{data.sleep.naps}</span></p>
              <p className="italic">Ranges are typical for this age. Short wakes and day-to-day variation are normal.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Milk size={16} strokeWidth={2} className="text-blue-400" />
              <p className="font-bold text-app-text">Feeding</p>
            </div>
            <div className="text-sm text-textMuted space-y-1">
              <p>Method: <span className="text-app-text font-semibold">{data.feeding.method}</span></p>
              <p>Frequency: <span className="text-app-text font-semibold">{data.feeding.frequency}</span></p>
              <p className="italic">{data.feeding.notes}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} strokeWidth={2} className="text-peach" />
              <p className="font-bold text-app-text">Activities</p>
            </div>
            <div className="divide-y divide-peach/20">
              {data.activities.map(a => (
                <a
                  key={a.id}
                  href={getActivityYoutubeUrl(a, week)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-2.5 items-start py-2.5 first:pt-0 last:pb-0 active:opacity-70"
                  aria-label={`Open YouTube videos for ${a.title}`}
                >
                  <YouTubeLogo />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-app-text text-sm">{a.title}</p>
                    <p className="text-textMuted text-xs leading-snug">{a.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
    </div>
  );
}
