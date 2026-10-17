import { leaps as enLeaps, type Leap } from '../wonderWeeks';

// Vietnamese display text per leap number. Weeks and level come from the English data.
const tr: Record<number, { name: string; description: string; tips: string[] }> = {
  1: {
    name: 'Cảm giác',
    description: 'Bé nhận ra nhiều cảm giác mới cùng một lúc. Chạm, ánh sáng và âm thanh lần đầu trở nên sống động và mạnh mẽ.',
    tips: [
      'Giảm đèn và giữ phòng yên tĩnh, các giác quan của bé đang quá tải.',
      'Dỗ ngay khi bé khóc, mẹ không thể làm hư bé sơ sinh đâu.',
      'Thử da kề da và địu bé để bé bình tĩnh, giơ thẻ tương phản mạnh cách mặt bé 20 cm.',
    ],
  },
  2: {
    name: 'Mẫu hình',
    description: 'Bé bắt đầu nhận ra những cấu trúc lặp lại. Hoa văn thị giác, âm thanh có nhịp và chuỗi thói quen hằng ngày trở nên hấp dẫn.',
    tips: [
      'Cứ lặp lại nhé: cùng bài hát và câu nói mỗi ngày giúp xây mạch nhận ra mẫu hình.',
      'Giữ thời gian thức 45 đến 90 phút, bé rất nhanh bị quá mệt trong bước nhảy này.',
      'Bắt đầu thói quen trước giờ ngủ đơn giản 3 bước ngay bây giờ: tắm, bú, hát. Não bé sẽ ghi nhớ.',
    ],
  },
  3: {
    name: 'Chuyển động mượt mà',
    description: 'Bé cảm nhận sự thay đổi từ từ như một trải nghiệm liên tục. Chuyển động mượt, giọng lên xuống và ánh sáng chuyển dần đều trở nên hấp dẫn. Tiếng cười đầu tiên thường xuất hiện.',
    tips: [
      'Giai đoạn quấy này ngắn (khoảng 1 tuần), cứ bế thoải mái thì sẽ qua nhanh.',
      'Bắt đầu chuyển đổi cách quấn khăn (cho một tay ra ngoài) vì phản xạ Moro đang mờ dần.',
      'Thử trò máy bay: bế bé và lượn nhẹ nhàng khắp phòng.',
    ],
  },
  4: {
    name: 'Sự kiện',
    description: 'Bé hiểu về sự kiện: mọi việc đều có phần đầu, giữa và cuối. Đây cũng là giai đoạn ngủ lùi 14 đến 19 tuần: chu kỳ ngủ được tái cấu trúc vĩnh viễn giống người lớn.',
    tips: [
      'Luôn nói tạm biệt trước khi rời phòng, đừng lén đi vì sẽ làm bé lo âu khi xa mẹ nặng hơn.',
      'Hoàn tất chuyển đổi cách quấn khăn ngay bây giờ (bé bắt đầu lật, quấn khăn sẽ không an toàn).',
      'Đây là bước nhảy khó nhất của năm đầu (5 đến 6 tuần). Hãy hạ kỳ vọng và chuẩn bị nhờ người giúp đỡ.',
    ],
  },
  5: {
    name: 'Mối quan hệ',
    description: 'Bé hiểu về khoảng cách và quan hệ không gian. Lo âu khi xa mẹ lên đỉnh, giờ bé hiểu mẹ có thể đi và ở xa bé.',
    tips: [
      'Khi bé bám, hãy đáp lại bằng sự gần gũi, ôm nhiều hơn và địu bé là phù hợp lúc này.',
      'Luôn nói trước khi đi: “Mẹ xuống bếp một chút, mẹ quay lại ngay nhé.”',
      'Cho bé một vật an ủi (thú bông mềm có mùi của mẹ) để giảm lo âu ban đêm.',
    ],
  },
  6: {
    name: 'Phân loại',
    description: 'Bé bắt đầu chia thế giới thành các nhóm: cứng/mềm, to/nhỏ, con vật/không phải con vật. Bé bắt đầu nhận ra đồ vật thuộc về các nhóm.',
    tips: [
      'Gọi tên nhóm khi chơi: “Đây là con chó, chó kêu gâu gâu. Đây cũng là con chó.”',
      'Cùng bé phân loại đồ chơi theo màu hoặc hình, biến thành trò chơi.',
      'Đọc sách tranh đơn giản mỗi trang một đồ vật để củng cố các nhóm.',
    ],
  },
  7: {
    name: 'Chuỗi hành động',
    description: 'Bé hiểu rằng các hành động nối tiếp nhau theo thứ tự hợp lý để đạt mục tiêu. Bắt đầu biết giải quyết vấn đề và chơi có chủ ý.',
    tips: [
      'Cho bé “giúp” những chuỗi đơn giản: cất đồ chơi, xếp chồng, mở nắp.',
      'Kể các việc nhiều bước: “Trước tiên mang tất, rồi mang giày, rồi mình ra ngoài.”',
      'Bé có thể bực khi chuỗi hành động bị cắt ngang. Hãy thấu hiểu cảm xúc rồi hãy giúp bé.',
    ],
  },
  8: {
    name: 'Chương trình',
    description: 'Bé kết hợp các chuỗi hành động thành chương trình linh hoạt để đạt các kết quả khác nhau. Bắt đầu có sự sáng tạo và thử nghiệm các chuỗi nguyên nhân kết quả.',
    tips: [
      'Cho bé đồ chơi mở như khối gỗ, cốc, bóng để hỗ trợ thử nghiệm các chuỗi hành động.',
      'Cứ để bé dẫn dắt khi chơi, cố nhịn không chỉ “cách đúng”.',
      'Giận dỗi lên đỉnh lúc này vì bé có kế hoạch nhưng chưa đủ từ, hãy ghi nhận sự bực bội của bé.',
    ],
  },
  9: {
    name: 'Nguyên tắc',
    description: 'Bé khám phá rằng thế giới vận hành theo quy tắc và nguyên tắc: nguyên nhân và kết quả, sự công bằng, “của con” và “của bạn” trở thành những khái niệm thật.',
    tips: [
      'Hãy nhất quán với quy tắc, bé đang thử các nguyên tắc để hiểu chúng.',
      'Giải thích nguyên nhân kết quả đơn giản lúc này rất hiệu quả: “Mình rửa tay để vi trùng không làm con bị bệnh.”',
      'Bé sẽ có ý kiến mạnh và phản đối nhiều. Đây là bé đang thử nguyên tắc lành mạnh chứ không phải chống đối.',
    ],
  },
  10: {
    name: 'Hệ thống',
    description: 'Bé hiểu thế giới được tạo nên từ các hệ thống: gia đình, xã hội và thiên nhiên, và bắt đầu hiểu vị trí của mình trong đó.',
    tips: [
      'Nói về gia đình và cộng đồng: “Nhà mình làm việc này. Hàng xóm mình làm việc kia.”',
      'Các trò đóng vai đơn giản (bác sĩ, cửa hàng, nhà bếp) giúp bé khám phá các hệ thống xã hội.',
      'Bé có thể hỏi “tại sao” liên tục. Đó là sự tò mò thật sự của tư duy hệ thống, rất đáng để trả lời.',
    ],
  },
};

export const leaps: Leap[] = enLeaps.map(l => ({ ...l, ...tr[l.number] }));
export type { Leap };
