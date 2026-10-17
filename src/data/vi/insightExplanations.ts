import type { InsightCategory } from '../insightExplanations';

// The regex patterns match the ENGLISH item text (stable lookup key). Only the outputs are Vietnamese.
interface ExplanationInput {
  category: InsightCategory;
  item: string; // English item text, used only as a lookup key
  week: number;
}

type Rule = {
  pattern: RegExp;
  explain: string | ((week: number) => string);
};

function ageBand(week: number): 'newborn' | 'infant' | 'mobileInfant' | 'toddler' | 'preschooler' {
  if (week < 8) return 'newborn';
  if (week < 28) return 'infant';
  if (week < 52) return 'mobileInfant';
  if (week < 104) return 'toddler';
  return 'preschooler';
}

const motorRules: Rule[] = [
  {
    pattern: /reflex|rooting|sucking|moro|startle|stepping|grasping|tight fist/i,
    explain:
      'Đây là phản xạ tự động giúp bé bú và tự bảo vệ, rồi sẽ dần thành cử động có chủ ý nhé.',
  },
  {
    pattern: /head|neck|tummy|forearm|push|chest|wobble/i,
    explain:
      'Mỗi lần bé ngẩng đầu khi nằm sấp đều làm khỏe cổ và lưng, để sau này ngồi, bò, đi nhé.',
  },
  {
    pattern: /sit|sitting|seated/i,
    explain:
      'Ngồi vững giúp hai tay bé rảnh để với, chơi và tập tự ăn đó mẹ.',
  },
  {
    pattern: /roll|rolling|side|pivot|scoot|crawl|cruises|cruising|walk|walking|run|runs|jump|hop|climb|stairs|pedal|tricycle/i,
    explain: (week) =>
      week < 52
        ? 'Bé tập chuyển trọng lượng và xoay người để di chuyển, mẹ nhớ kiểm tra an toàn ở sàn nhà nhé.'
        : 'Thăng bằng và sức chân của bé được rèn qua tập lặp lại, vấp ngã nhẹ cũng bình thường nhé.',
  },
  {
    pattern: /kick|leg|bear weight|bounces|standing|stands|step/i,
    explain:
      'Tập đứng và đạp chân giúp chân bé khỏe, miễn là bé vững và luôn có mẹ bên cạnh nhé.',
  },
  {
    pattern: /hand|hands|finger|rattle|toy|midline|reach|grasps|grabs|pincer|crayon|pencil|scissor|spoon|fork|utensil|cup|page|blocks?|stack|draw|scribble|shapes?|catches|throws|kicks ball/i,
    explain: (week) =>
      week < 52
        ? 'Bé đang chuyển từ nắm theo phản xạ sang dùng tay có chủ ý để khám phá đồ vật nhé.'
        : 'Đôi tay bé khéo hơn nhờ phối hợp tay mắt, giúp bé ăn, vẽ, mặc đồ và sau này viết nhé.',
  },
  {
    pattern: /toilet|dress|undress|zippers|buttons/i,
    explain:
      'Tự chăm sóc bản thân cần nhiều kỹ năng cùng lớn, nên tiến bộ của bé có lúc nhanh lúc chậm nhé.',
  },
];

const cognitiveRules: Rule[] = [
  {
    pattern: /voice|face|smell|familiar|mother|caregiver|high-contrast|8.?12|patterns?|colorful|primary colors/i,
    explain:
      'Giọng nói, khuôn mặt và mùi hương quen thuộc giúp não bé học dần qua mỗi ngày nhé.',
  },
  {
    pattern: /track|tracks|moving|visual|distance|across|field|midline|object off|dropped|fallen/i,
    explain:
      'Bé dõi theo bằng mắt cho thấy mắt và não đang phối hợp, chuẩn bị cho việc với tay nhé.',
  },
  {
    pattern: /routine|anticipates|associate|feeding|bath|bedtime|consequences|up/i,
    explain:
      'Thói quen lặp lại giúp bé biết điều gì sắp đến, nên bé thấy yên tâm hơn nhé.',
  },
  {
    pattern: /coo|vocalizing|mouth|imitates? .*sound|aah|ooh|speech|sentences?|words?|vocabulary|language|name|questions?|why|what|past|future|grammar/i,
    explain: (week) =>
      week < 52
        ? 'Bé hiểu trước khi nói, nên mẹ cứ trò chuyện và nhìn bé thật nhiều nhé.'
        : 'Bé đang nối trí nhớ và ngữ pháp để diễn đạt ý, từ gọi tên đến nói cả câu ngắn nhé.',
  },
  {
    pattern: /cause|effect|rattle|banging|bangs|button|opens|problem|solve|experiments|gravity|drops|gadgets/i,
    explain:
      'Lặp lại một hành động và xem kết quả giúp bé hiểu nguyên nhân và kết quả nhé.',
  },
  {
    pattern: /object permanence|hidden|out of sight|searches|finds|cloth/i,
    explain:
      'Bé đang học rằng người và đồ vật vẫn còn đó dù bị che đi, như khi chơi ú òa nhé.',
  },
  {
    pattern: /imitates?|household|pretend|symbolic|block becomes|doll|using objects|function|pictures?|book|stories|events/i,
    explain: (week) =>
      week < 78
        ? 'Bé học bằng cách bắt chước những gì mẹ làm mỗi ngày, nên mẹ làm mẫu nhiều nhé.'
        : 'Chơi giả vờ cho thấy bé hiểu một vật có thể đại diện cho vật khác, rất tốt cho ngôn ngữ nhé.',
  },
  {
    pattern: /sort|categor|match|same|different|opposites|colors?|shapes?|counts?|one|many|first|then|last|letters?|written name|print/i,
    explain:
      'Phân loại, đếm và sắp xếp giúp bé hiểu đồ vật và từ ngữ có nhóm, thứ tự và quy luật nhé.',
  },
  {
    pattern: /body parts|self|own name|reflection/i,
    explain:
      'Gọi tên bộ phận cơ thể hay nhận ra mình trong gương giúp bé hiểu rõ hơn về “con” nhé.',
  },
  {
    pattern: /attention|studies|fascinated|remembers|recognizes|looks from object to face/i,
    explain:
      'Bé chăm chú nhìn một thứ là đang so sánh chi tiết và ghi nhớ, nên mẹ cứ để bé khám phá nhé.',
  },
];

const socialRules: Rule[] = [
  {
    pattern: /calm|comfort|swaddled|touch|voice|heartbeat|song|routine|secure|attachment/i,
    explain:
      'Được bế, dỗ và đáp lời đều đặn giúp bé thấy an toàn và tin tưởng mẹ hơn nhé.',
  },
  {
    pattern: /eye contact|gazes|face|smile|laugh|giggle|joy|expressions?|surprise/i,
    explain:
      'Nụ cười và ánh mắt dạy bé rằng bé có thể làm người thương đáp lại, thật vui nhé.',
  },
  {
    pattern: /cry|cries|fuss|needs|hunger|discomfort|wake windows/i,
    explain:
      'Khóc là cách bé nói chuyện, mẹ đáp lại đều đặn để bé thấy được hiểu nhé.',
  },
  {
    pattern: /coo|vocal|babbl|sounds|mama|dada|words|communicate|gestures|points|pointing|language/i,
    explain:
      'Âm thanh và cử chỉ của bé là những cuộc trò chuyện đầu tiên, mẹ đáp lại bé nhé.',
  },
  {
    pattern: /stranger|separation|cling|jealous|preference|familiar|caregiver|reaches for/i,
    explain:
      'Bé thích người quen vì trí nhớ và sự gắn bó đang mạnh lên, lo khi xa mẹ cũng bình thường nhé.',
  },
  {
    pattern: /peekaboo|games|turn-taking|give-and-take|claps|waves|bye|approval|look/i,
    explain:
      'Vẫy tay, vỗ tay và chờ lượt giúp bé tập giao tiếp qua lại với mẹ nhé.',
  },
  {
    pattern: /no|limits|tantrums|mine|preferences|independent|ownership|sharing|rules|bargains|negotiates/i,
    explain:
      'Bé muốn tự quyết là đang hình thành bản ngã, mẹ cứ bình tĩnh đặt giới hạn đơn giản nhé.',
  },
  {
    pattern: /empathy|affection|hugs|kisses|concern|comforts|feelings|moral|fair|complex emotions/i,
    explain:
      'Bé bắt đầu để ý cảm xúc của người khác, dù việc điều chỉnh cảm xúc còn non nhé.',
  },
  {
    pattern: /parallel|peers|children|cooperative|friend|play with|alongside|group|imaginary/i,
    explain:
      'Bé tập chơi cùng bạn dần dần, từ quan sát đến chơi bên cạnh rồi chia sẻ nhé.',
  },
  {
    pattern: /self|own first name|photo|reflection|shows objects|describes events/i,
    explain:
      'Bé nhận ra mình và kể lại chuyện đã xảy ra, nối bản thân với trí nhớ và mọi người nhé.',
  },
];

const sensoryRules: Rule[] = [
  {
    pattern: /bright|light|contrast|black|white|colors?|red|blue|primary|visual|tracks|faces|eyes|distance|mirror|reflection|photos/i,
    explain:
      'Thị giác bé phát triển rất nhanh, màu sắc và khuôn mặt cho não nhiều điều để học nhé.',
  },
  {
    pattern: /sound|voice|music|singing|songs?|tone|rhythm|claps|stomps|instruments|dancing|swaying|bouncing/i,
    explain:
      'Giọng nói, nhịp điệu và bài hát giúp bé hiểu âm thanh và thấy gần gũi với mẹ nhé.',
  },
  {
    pattern: /smell|taste|sweet|bitter|sour|food|foods|texture of food|mouths|mouthing|oral|temperature/i,
    explain:
      'Nếm, ngửi và đưa đồ vào miệng là cách bé học về đồ ăn và đồ vật nhé.',
  },
  {
    pattern: /touch|warmth|closeness|cold|wetness|swaddled|rocked|motion|white noise|soothed/i,
    explain:
      'Cái chạm nhẹ, hơi ấm và nhịp đưa nôi giúp bé nhỏ dịu lại khi thấy quá nhiều thứ nhé.',
  },
  {
    pattern: /texture|sand|water|mud|playdough|sensory|pressing|smearing|paint|messy|outdoor|nature|soil|bins|pouring|splashing/i,
    explain:
      'Chơi giác quan giúp bé hiểu độ nặng, nhiệt độ và kết cấu, bừa bộn một chút cũng không sao nhé.',
  },
  {
    pattern: /containers?|fills|dumps|drops|gravity|cause-effect|tools?|spoon|brush|gadgets|details|angles|sorts|small objects|pincer/i,
    explain:
      'Đổ, thả, xoay đồ vật là bé đang thử nghiệm về kích thước, trọng lượng và nguyên nhân nhé.',
  },
  {
    pattern: /drawing|scribbles|scissors|pencils|brushes|writing|letters|numbers|patterns|constructions|role play|pretend|dress-up/i,
    explain:
      'Vẽ, xây và đóng vai giúp bé kết hợp xúc giác, thị giác và trí tưởng tượng nhé.',
  },
  {
    pattern: /routine|familiar|emotional tone|changes/i,
    explain:
      'Bé nhạy với thói quen và không khí quanh mình là bình thường, bé đang dò xem có an toàn không nhé.',
  },
];

const fallbackByCategory: Record<InsightCategory, Record<ReturnType<typeof ageBand>, string>> = {
  motor: {
    newborn:
      'Cử động giật là bình thường vì thần kinh còn non, chơi ngắn khi bé tỉnh sẽ giúp bé nhé.',
    infant:
      'Giữ đầu, lật, ngồi được xây từng lớp, mỗi lần tập nhỏ chuẩn bị cho kỹ năng sau nhé.',
    mobileInfant:
      'Bé di chuyển được nhiều hơn rồi, mẹ nhớ giữ nhà thật an toàn trước một bước nhé.',
    toddler:
      'Bé chạy, trèo, mang đồ trông hơi lộn xộn vì thăng bằng còn đang học nhé.',
    preschooler:
      'Bóng, vẽ, mặc đồ và leo trèo giúp bé phối hợp tốt hơn và tự tin hơn nhé.',
  },
  cognitive: {
    newborn:
      'Bé học qua khuôn mặt, giọng nói và mùi hương của mẹ mỗi ngày, nên mẹ cứ ôm bé nhiều nhé.',
    infant:
      'Bé học qua lặp lại: nhìn, nghe, bắt chước rồi thử lại, não bé nối hành động với kết quả nhé.',
    mobileInfant:
      'Bé đang thành nhà giải quyết vấn đề nhỏ, biết tìm đồ và hiểu nguyên nhân kết quả nhé.',
    toddler:
      'Bé học qua chơi, nói và bắt chước, nên các việc hằng ngày đều là bài học nhé.',
    preschooler:
      'Kể chuyện, chơi giả vờ, đếm và hỏi nhiều cho thấy trí nhớ và ngôn ngữ của bé đang lớn nhé.',
  },
  social: {
    newborn:
      'Cho bú, dỗ dành, nhìn mắt và chạm nhẹ giúp bé biết mọi người luôn đáp lại nhé.',
    infant:
      'Nụ cười, âm thanh và những lần dừng chờ giúp bé biết trò chuyện là việc cùng chia sẻ nhé.',
    mobileInfant:
      'Bé dùng cử chỉ và nét mặt của mẹ để khám phá, nên bé gắn bó và sợ người lạ cùng lúc nhé.',
    toddler:
      'Bé có ý riêng nhưng chưa kiềm chế được, nên mẹ đặt giới hạn ấm áp và cho lựa chọn đơn giản nhé.',
    preschooler:
      'Bé chơi hợp tác và giàu tưởng tượng hơn, kết bạn và chờ lượt là bài học mỗi ngày nhé.',
  },
  sensory: {
    newborn:
      'Giọng nói quen thuộc, chạm nhẹ và nhịp điệu giúp bé thấy thế giới dễ hiểu hơn nhé.',
    infant:
      'Với tay, ngậm, nhìn và nghe giúp bé biết về đồ vật và mọi người xung quanh nhé.',
    mobileInfant:
      'Bé khám phá chủ động hơn: đổ, ngậm, đập, bò tới để xem mọi thứ thật kỹ nhé.',
    toddler:
      'Bé dùng cả cơ thể để học qua kết cấu, nước, đất và vận động nhé.',
    preschooler:
      'Vẽ, cắt, đóng vai và xây dựng giúp bé kết hợp cảm nhận với lập kế hoạch và tưởng tượng nhé.',
  },
};

const rulesByCategory: Record<InsightCategory, Rule[]> = {
  motor: motorRules,
  cognitive: cognitiveRules,
  social: socialRules,
  sensory: sensoryRules,
};

export function getInsightExplanation({ category, item, week }: ExplanationInput): string {
  const rule = rulesByCategory[category].find(({ pattern }) => pattern.test(item));

  if (!rule) {
    return fallbackByCategory[category][ageBand(week)];
  }

  return typeof rule.explain === 'function' ? rule.explain(week) : rule.explain;
}
