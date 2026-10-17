import { Moon, Milk, Zap, Star } from 'lucide-react';
import type { Activity, WeekData } from '../../types';
import { useLang, type Lang } from '../../i18n/langContext';
import { weeklyData as enWeeklyData } from '../../data/weeklyDevelopment';

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

// Vietnamese YouTube search terms, keyed by the same stable English activity title
const ACTIVITY_SEARCH_TERMS_VI: Record<string, string> = {
  'Talk softly': 'nói chuyện với trẻ sơ sinh',
  'Show your face': 'tương tác mặt đối mặt với trẻ sơ sinh',
  'Slow dance': 'ru bé nhảy nhẹ nhàng gắn kết',
  'Coo back and forth': 'trò chuyện ê a với bé',
  'Bicycle legs': 'đạp xe chân cho bé đỡ đầy hơi',
  'Outdoor air': 'đưa trẻ sơ sinh ra ngoài',
  'Smile game': 'trò chơi cười với bé',
  'Narrate everything': 'nói chuyện với bé phát triển ngôn ngữ',
  'Coo conversation': 'trò chuyện ê a với bé',
  'Window gazing': 'kích thích thị giác cho bé',
  'Make them laugh': 'cách chọc bé cười',
  'Name game': 'dạy bé nhận biết tên mình',
  'Roll practice': 'tập lật cho bé',
  'Sound imitation': 'bé bắt chước âm thanh',
  'Foot discovery': 'bé khám phá bàn chân',
  'Scarf magic': 'chơi ú òa với khăn voan',
  'Object grab': 'tập với và nắm đồ vật cho bé',
  'Sit practice': 'tập ngồi cho bé',
  'Object hide': 'trò chơi giấu đồ vật cho bé',
  'Food exposure': 'cho bé làm quen thức ăn trước khi ăn dặm',
  'Object in container': 'bé chơi bỏ đồ vào hộp',
  'First words game': 'dạy bé nói những từ đầu tiên',
  'Walking practice': 'tập đi cho bé',
  'Board book library': 'đọc sách bìa cứng cho bé',
  'Birthday adventure': 'ý tưởng hoạt động sinh nhật cho bé',
  'Baby book': 'ý tưởng sổ kỷ niệm của bé',
  'Push toy walk': 'xe đẩy tập đi cho bé',
  'Naming walk': 'đi dạo dạy bé gọi tên đồ vật',
  'Body part game': 'trò chơi các bộ phận cơ thể cho bé',
  'Emotion naming': 'dạy bé gọi tên cảm xúc',
  'Parallel household tasks': 'cho bé giúp việc nhà',
  'Word labeling': 'dạy bé gọi tên đồ vật',
  'Choice architecture': 'cho bé lựa chọn',
  'Expand their sentences': 'mở rộng câu nói của bé',
  'Answer why with why': 'trả lời câu hỏi tại sao của bé',
  'Letter exposure': 'dạy bé nhận biết chữ cái',
  'Name writing': 'tập viết tên cho bé mẫu giáo',
  'Photo journey': 'hoạt động xem ảnh gia đình cho bé',
};

// Activity titles are shown in the current language, so look the stable English title up by activity id
const EN_TITLE_BY_ID = new Map(enWeeklyData.flatMap(w => w.activities.map(a => [a.id, a.title] as const)));

function getActivityAgeContext(week: number, lang: Lang): string {
  if (lang === 'vi') {
    if (week < 4) return 'trẻ sơ sinh';
    if (week < 52) return 'em bé';
    return 'bé 1 tuổi';
  }
  if (week < 4) return 'newborn baby';
  if (week < 52) return 'baby';
  return 'toddler';
}

function getActivitySearchQuery(activity: Activity, week: number, lang: Lang): string {
  const enTitle = EN_TITLE_BY_ID.get(activity.id) ?? activity.title;
  const terms = lang === 'vi' ? ACTIVITY_SEARCH_TERMS_VI : ACTIVITY_SEARCH_TERMS;
  const searchTerm = terms[enTitle] ?? (lang === 'vi' ? activity.title : enTitle).toLowerCase();
  const hasAgeContext = lang === 'vi'
    ? /(trẻ sơ sinh|em bé|\bbé\b|trẻ|mẫu giáo)/i.test(searchTerm)
    : /\b(newborn|baby|toddler|preschool|child|children)\b/i.test(searchTerm);
  return hasAgeContext ? searchTerm : `${searchTerm} ${getActivityAgeContext(week, lang)}`;
}

function getActivityYoutubeUrl(activity: Activity, week: number, lang: Lang): string {
  const query = getActivitySearchQuery(activity, week, lang);
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
  const { lang, t } = useLang();
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2">
        <Star size={16} strokeWidth={2} className="text-peachDark" />
        <p className="text-base font-extrabold text-app-text">{t('wte.title', { week })}</p>
      </div>

      <div className="mt-4 space-y-4">
          <p className="text-sm text-textMuted leading-relaxed">{data.summary}</p>

          {WEEK_VIDEO_IDS[week] && (
            <div className="rounded-2xl overflow-hidden shadow-sm aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${WEEK_VIDEO_IDS[week]}`}
                title={t('wte.videoTitle', { week })}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Moon size={16} strokeWidth={2} className="text-indigo-400" />
              <p className="font-bold text-app-text">{t('wte.sleep')}</p>
            </div>
            <div className="text-sm text-textMuted space-y-1">
              <p>{t('wte.sleepTotal')} <span className="text-app-text font-semibold">{t('wte.hoursPerDay', { hours: data.sleep.totalHoursRange })}</span></p>
              <p>{t('wte.longestStretch')} <span className="text-app-text font-semibold">{data.sleep.nightSleepHours}</span></p>
              <p>{t('wte.naps')} <span className="text-app-text font-semibold">{data.sleep.naps}</span></p>
              <p className="italic">{t('wte.sleepNote')}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Milk size={16} strokeWidth={2} className="text-blue-400" />
              <p className="font-bold text-app-text">{t('wte.feeding')}</p>
            </div>
            <div className="text-sm text-textMuted space-y-1">
              <p>{t('wte.method')} <span className="text-app-text font-semibold">{data.feeding.method}</span></p>
              <p>{t('wte.frequency')} <span className="text-app-text font-semibold">{data.feeding.frequency}</span></p>
              <p className="italic">{data.feeding.notes}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} strokeWidth={2} className="text-peach" />
              <p className="font-bold text-app-text">{t('wte.activities')}</p>
            </div>
            <div className="divide-y divide-peach/20">
              {data.activities.map(a => (
                <a
                  key={a.id}
                  href={getActivityYoutubeUrl(a, week, lang)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-2.5 items-start py-2.5 first:pt-0 last:pb-0 active:opacity-70"
                  aria-label={t('wte.openYoutube', { title: a.title })}
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
