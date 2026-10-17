import type { MomStage, PainArea } from '../momCare';

// Vietnamese display text only. Ids, keys, `from`, `areas` and `sources` stay in the English file.
export const painAreasVi: Record<string, Pick<PainArea, 'label' | 'why' | 'fix' | 'doctor'>> = {
  back: {
    label: 'Lưng dưới',
    why: 'Bế, nâng và cúi xuống chăm bé làm lưng mẹ bị căng.',
    fix: [
      'Dùng gối nâng bé lên ngang tầm mẹ. Đừng cúi người xuống phía bé.',
      'Khi bế, hãy gập gối và giữ bé sát người. Đừng xoay người khi đang bế bé.',
      'Tư thế mèo-bò: chống hai tay và hai gối, từ từ cong rồi ưỡn lưng. Làm 8-10 lần, vài lần mỗi ngày.',
    ],
    doctor: 'Hãy đi khám ngay nếu đau lưng kèm sốt, tê chân hoặc vùng bẹn, khó đi tiểu hoặc đi ngoài, yếu chân, hoặc đau dữ dội và ngày càng nặng hơn.',
  },
  neck: {
    label: 'Cổ và vai',
    why: 'Cúi nhìn bé làm đầu mẹ chúi về phía trước và vai bị khép lại.',
    fix: [
      'Dùng gối nâng bé lên ngang ngực để đầu, cổ và vai của mẹ được thả lỏng.',
      'Mở ngực: đan hai tay ra sau lưng, kéo vai xuống và ra sau, rồi nâng tay lên. Giữ 15 giây, làm 3 lần sau mỗi cữ bú.',
      'Giãn cổ: nghiêng tai về phía vai, sau đó xoay cằm xuống hướng nách. Giữ 30 giây, mỗi bên 2 lần, ít nhất 2 lần mỗi ngày.',
    ],
    doctor: 'Hãy đi khám nếu đau cổ kèm tê hoặc yếu tay, đau đầu dữ dội, sốt, đau sau khi bị ngã, hoặc không đỡ sau 2 tuần.',
  },
  wrist: {
    label: 'Cổ tay và ngón cái',
    why: 'Nâng bé và đỡ đầu bé với ngón cái dạng ra làm bên ngón cái của cổ tay bị căng.',
    fix: [
      'Nâng bé bằng cả hai tay đặt dưới người bé. Giữ cổ tay thẳng và lòng bàn tay mở.',
      'Khi cho bú, đặt bé lên gối để cổ tay và ngón cái không phải gánh sức nặng.',
      'Nếu ngón cái bị sưng, chườm lạnh 10 phút sau khi dùng tay. Chườm ấm trước khi vận động nhẹ có thể giúp bớt cứng.',
    ],
    doctor: 'Hãy đi khám nếu đau ngón cái hoặc cổ tay kéo dài hơn 2 tuần, ngày càng nặng, hoặc kèm sưng, khớp nóng đỏ, sốt, tê, hoặc mẹ không cử động được ngón cái.',
  },
  breast: {
    label: 'Ngực và đầu ti',
    why: 'Đau đầu ti thường do bé ngậm bắt vú nông hoặc tư thế bú chưa đúng.',
    fix: [
      'Nhờ nữ hộ sinh, chuyên gia tư vấn sữa mẹ hoặc người có kinh nghiệm cho con bú quan sát cả một cữ bú. Chỉ cần chỉnh nhỏ thường hết đau nhanh.',
      'Đưa bé vào ngực, bụng bé áp bụng mẹ. Hướng đầu ti về phía mũi bé để bé há miệng rộng và ngậm sâu.',
      'Dùng khăn ấm trước cữ bú, khăn mát giữa các cữ. Tránh xoa bóp mạnh hoặc bóp ngực.',
    ],
    doctor: 'Hãy đi khám ngay hôm nay nếu ngực nóng, đỏ hoặc cứng và đau kèm sốt hoặc cảm giác như bị cúm, không đỡ sau 12-24 giờ, có cục cứng, có mủ, hoặc đau kéo dài sau cữ bú.',
  },
  pelvic: {
    label: 'Bụng và sàn chậu',
    why: 'Thai kỳ và sinh nở làm cơ bụng và sàn chậu bị giãn.',
    fix: [
      'Sàn chậu: siết và nâng bên trong như đang nhịn tiểu. Giữ tối đa 10 giây, nghỉ, lặp lại 8-10 lần, 3 lần mỗi ngày.',
      'Chưa nên gập bụng, ngồi dậy hay plank cho đến khi bác sĩ hoặc chuyên viên vật lý trị liệu nói mẹ đã sẵn sàng.',
      'Dùng gối ép nhẹ lên vết mổ lấy thai khi ho, hắt hơi hoặc cười.',
    ],
    doctor: 'Hãy đi khám ngay nếu ra máu nhiều, sốt, vết thương đỏ, sưng hoặc có mùi hôi, đau bụng dữ dội, sưng chân, đau ngực, đau đầu nhiều, hoặc khe hở cơ bụng rộng hơn 2 ngón tay ở tuần thứ 8.',
  },
};

type StageVi = Pick<MomStage, 'title' | 'focus' | 'stageTip' | 'exercise' | 'mind' | 'doctor' | 'dad'>;

// Keyed by the stage's `from` value
export const momStagesVi: Record<number, StageVi> = {
  0: {
    title: 'Hồi phục (tuần 0-2)',
    focus: 'Hãy nghỉ ngơi, chăm sóc vết thương và cho bé bú trong lúc cơ thể mẹ ra sản dịch, tử cung co lại và dần hồi phục sau sinh hoặc sau mổ.',
    stageTip: 'Cho bé bú khi nằm nghiêng hoặc ngả người ra sau, kê gối dưới tay và dưới bé để vết khâu, vết mổ và lưng mẹ không bị căng.',
    exercise: [
      'Mỗi ngày đi bộ nhẹ nhàng quanh nhà. Bắt đầu 2-5 phút, vài lần mỗi ngày. Dừng lại nếu ra máu nhiều hơn hoặc thấy đau nhói.',
      'Siết sàn chậu: nâng và giữ 3-10 giây, nghỉ, lặp lại tối đa 10 lần, 3-5 lần mỗi ngày. Không nín thở. Dừng lại nếu thấy đau.',
      'Không xách vật nào nặng hơn bé, và chưa lái xe cho đến khi mẹ có thể đạp phanh mạnh mà không đau (mổ lấy thai: thường sau vài tuần).',
    ],
    mind: [
      'Thay đổi tâm trạng, hay khóc và lo lắng trong những ngày đầu rất thường gặp. Đây gọi là "baby blues" và thường hết sau khoảng 2 tuần.',
      'Nếu buồn bã, lo lắng sâu sắc hoặc tuyệt vọng kéo dài quá 2 tuần hoặc nặng hơn, hãy nói với nữ hộ sinh hoặc bác sĩ. Được giúp đỡ sẽ tốt lên nhiều.',
      'Hãy ngủ khi bé ngủ, dù chỉ chợp mắt ngắn. Nhờ bạn đời đảm nhận một cữ bú hoặc một ca đêm (cho bé bú sữa vắt ra bằng bình, hoặc dỗ bé và vỗ ợ hơi).',
    ],
    doctor: [
      'Gọi cấp cứu ngay nếu đau ngực, khó thở, hoặc tim đập nhanh không dịu đi.',
      'Thấm đẫm một miếng băng trong một giờ, ra cục máu đông lớn, hoặc thấy choáng váng, xây xẩm khi ra máu. Đây có thể là mất máu nhiều.',
      'Sốt từ 38°C (100.4°F) trở lên, đau bụng hoặc ấn đau, hoặc sản dịch có mùi hôi. Đây có thể là dấu hiệu nhiễm trùng.',
      'Đau đầu không hết, thay đổi thị lực, hoặc mặt hay tay sưng nhiều. Đây có thể là dấu hiệu của vấn đề huyết áp cao.',
      'Có ý nghĩ làm hại bản thân hoặc bé, hoặc thấy lú lẫn, hoặc nhìn thấy hay nghe thấy những thứ không có thật. Hãy tìm trợ giúp ngay.',
    ],
    dad: [
      'Nhận một ca đêm để vợ được ngủ liền 4-5 tiếng. Chỉ đưa bé cho vợ khi bé cần bú.',
      'Lo bữa ăn, nước uống, giặt giũ và tiếp khách. Nếu vợ mổ lấy thai, hãy là người bế và xách đồ nặng, để vợ nghỉ ngơi.',
      'Gọi bác sĩ hoặc đến phòng cấp cứu nếu vợ ra máu nhiều, sốt, đau ngực, đau đầu nhiều hoặc có ý nghĩ làm hại bản thân.',
      'Mỗi ngày hãy cho bé da kề da. Bố cũng nên ăn, ngủ và nhờ bạn bè giúp đỡ. Khoảng 1 trong 10 ông bố bị buồn bã kéo dài.',
    ],
  },
  3: {
    title: 'Dần vào nhịp (tuần 3-6)',
    focus: 'Xây dựng nhịp bú và ngủ, giảm đau do bế và cho bú, và từ từ tập vận động nhẹ nhàng hơn trước buổi khám lúc 6 tuần.',
    stageTip: 'Dùng gối đưa bé lên ngang ngực và giữ đầu thẳng, tai nằm trên vai. Đổi tay bế bé để chia sức cho cổ tay.',
    exercise: [
      'Đi bộ 10-20 phút mỗi ngày với nhịp nhẹ nhàng. Thêm vài phút mỗi tuần. Đi chậm lại hoặc dừng nếu ra máu nhiều hơn hoặc thấy nặng vùng chậu.',
      'Sàn chậu: 10 lần siết chậm, giữ 10 giây, 3 lần mỗi ngày. Siết trước khi ho, hắt hơi hoặc nhấc đồ. Dừng lại nếu thấy đau.',
      'Cơ bụng nhẹ nhàng: thở ra và thu bụng dưới vào, 10 lần, 1-2 lần mỗi ngày. Dừng lại nếu thấy bụng phồng lên hoặc đau.',
    ],
    mind: [
      'Baby blues lúc này nên đang dịu đi. Nếu buồn bã, lo lắng hoặc khóc nhiều hơn hoặc kéo dài quá 2 tuần, hãy nói với bác sĩ hoặc nữ hộ sinh. Điều trị có hiệu quả.',
      'Cùng nhau lên kế hoạch ngủ. Mỗi người nên có một giấc ngủ liền dài hơn (4-5 tiếng) bằng cách thay phiên nhau trực đêm.',
      'Chia việc nhà với bạn đời và nói rõ điều mẹ cần. Đừng chờ người ấy đoán. Trò chuyện ngắn mỗi ngày sẽ giúp ích.',
    ],
    doctor: [
      'Có ý nghĩ làm hại bản thân hoặc bé, hoặc thấy lú lẫn, hoặc nhìn thấy hay nghe thấy những thứ không có thật. Hãy tìm trợ giúp khẩn cấp ngay.',
      'Buồn bã, mất niềm vui, tuyệt vọng hoặc hoảng loạn kéo dài hơn 2 tuần, hoặc khiến mẹ không chăm sóc được bản thân hay bé.',
      'Ngực đỏ, nóng và đau kèm cảm giác như bị cúm hoặc sốt từ 38°C (100.4°F) trở lên. Hãy đi khám nếu không đỡ sau 12-24 giờ.',
      'Ra máu nhiều trở lại, ra máu đỏ tươi sau khi đã giảm, hoặc sản dịch có mùi hôi. Hãy gọi đội ngũ chăm sóc của mẹ.',
    ],
    dad: [
      'Nhận trách nhiệm một cữ bú hoặc một lần dậy mỗi đêm. Vỗ ợ hơi, thay tã và dỗ bé để vợ được ngủ.',
      'Lên kế hoạch và nấu ăn cho cả tuần. Lo việc mua sắm và việc nhà để vợ không phải gánh hết.',
      'Vợ buồn, hay khóc hoặc lo âu quá 2 tuần? Hãy lắng nghe, đừng vội sửa. Giúp vợ đặt lịch gặp bác sĩ hoặc nhân viên y tế.',
      'Mỗi ngày đưa bé đi dạo hoặc tắm cho bé. Hãy để ý tâm trạng của chính mình: cáu gắt, thu mình hoặc uống rượu nhiều hơn thì nên nói chuyện với bác sĩ.',
    ],
  },
  7: {
    title: 'Khám sau sinh và lấy lại sức (tuần 7-12)',
    focus: 'Đi khám sau sinh đầy đủ, rồi từ từ lấy lại sức: đi bộ, sàn chậu và cơ bụng nhẹ nhàng trước, cùng với sự hỗ trợ tốt về tinh thần.',
    stageTip: 'Đau cổ tay do bế bé rất hay gặp lúc này. Giữ cổ tay thẳng khi nâng bé và luồn cả bàn tay xuống dưới bé thay vì kẹp bằng ngón cái.',
    exercise: [
      'Đi bộ 10-30 phút hầu hết các ngày. Tăng thời gian từ từ. Đi chậm lại hoặc dừng nếu thấy nặng, rò rỉ hoặc đau nhói.',
      'Sàn chậu: siết và nâng, giữ tối đa 10 giây, nghỉ, lặp lại 10 lần. Làm 3 lần mỗi ngày. Thở bình thường.',
      'Thêm bài tập sức mạnh nhẹ 2 ngày mỗi tuần: nâng mông, chống đẩy vào tường, đứng lên ngồi xuống. 8-10 lần, 1-2 hiệp. Dừng lại nếu thấy nặng vùng chậu.',
    ],
    mind: [
      'Trầm cảm sau sinh có thể bắt đầu bất cứ lúc nào trong năm đầu. Dù chỉ có vài dấu hiệu, mẹ vẫn xứng đáng được giúp đỡ.',
      'Hãy xin được sàng lọc tâm trạng (EPDS) khi đi khám. Hãy trả lời thật lòng. Đó chỉ là bước sàng lọc, không phải một cái nhãn.',
      'Giấc ngủ: thay phiên với bạn đời để mẹ có một giấc ngủ liền từ 4 tiếng trở lên. Hãy chợp mắt khi bé ngủ nếu có thể.',
    ],
    doctor: [
      'Có ý nghĩ làm hại bản thân hoặc bé, hoặc nhìn thấy hay nghe thấy những thứ không có thật. Hãy gọi cấp cứu hoặc đường dây hỗ trợ khủng hoảng ngay.',
      'Buồn bã, hoảng loạn, lo lắng nhiều hoặc không thấy gắn bó với bé kéo dài hơn 2 tuần hoặc nặng hơn.',
      'Ra máu thấm đẫm một miếng băng trong một giờ, ra cục máu đông lớn, hoặc ra máu trở lại hay vẫn nhiều sau tuần thứ 8.',
      'Rò rỉ nước tiểu hoặc phân, hoặc có cảm giác nặng như kéo xuống ở vùng chậu. Chuyên viên vật lý trị liệu sức khỏe vùng chậu có thể giúp mẹ.',
    ],
    dad: [
      'Cùng vợ đi buổi khám lúc 6-8 tuần. Trông bé, lái xe và giúp vợ hỏi bác sĩ những điều vợ thắc mắc.',
      'Chia việc công bằng. Mỗi ngày làm cùng những việc chăm bé để vợ có thể nghỉ ngơi, tập thể dục hoặc gặp bạn bè.',
      'Hãy thường xuyên hỏi vợ thật sự cảm thấy thế nào. Hãy khen ngợi vợ. Lo lắng liên tục, mất niềm vui hoặc buồn bã thì cần gặp bác sĩ.',
      'Triệu chứng ở bố thường cao điểm lúc 3-6 tháng. Hãy giữ giấc ngủ, vận động và có một người bạn để tâm sự. Hãy tìm giúp đỡ sớm.',
    ],
  },
  13: {
    title: 'Khỏe dần lên (tuần 13-26)',
    focus: 'Xây dựng sức mạnh và thể lực thật sự từng bước khi bé nặng dần, đồng thời để ý tâm trạng và giấc nghỉ của mẹ.',
    stageTip: 'Bé giờ đã nặng hơn. Hãy dùng địu vừa vặn có dây rộng, đổi bên thường xuyên và giữ bé sát ngực để đỡ cho cổ và lưng.',
    exercise: [
      'Dần dần đạt 150 phút vận động vừa phải mỗi tuần, như đi bộ nhanh. Chia thành các đợt 10-30 phút. Dừng lại nếu bị rò rỉ hoặc thấy nặng.',
      'Tập sức mạnh 2-3 ngày mỗi tuần: squat, kéo tạ, gập hông, bước lên bậc. 8-12 lần, 2-3 hiệp. Tăng tạ từ từ. Dừng lại nếu thấy bụng phồng hoặc áp lực vùng chậu.',
      'Siết sàn chậu mỗi ngày: 10 lần giữ lâu và 10 lần siết nhanh, 3 lần mỗi ngày. Siết một lần trước khi nhấc đồ hoặc nhảy.',
    ],
    mind: [
      'Lo âu và buồn bã vẫn có thể bắt đầu hoặc nặng hơn lúc này. Nếu lo lắng không tắt dù bé đang ngủ, đó là lý do để tìm sự giúp đỡ.',
      'Thiếu ngủ dồn lại. Hãy giữ một giấc ngủ liền dài mỗi đêm và nhờ người thân hoặc bạn bè nhận bớt một việc cho mẹ.',
      'Mỗi tuần trò chuyện với bạn đời 10 phút. Cùng chia ca đêm, việc nhà và chăm bé để không ai phải gánh hết.',
    ],
    doctor: [
      'Có ý nghĩ tự làm hại bản thân hoặc làm hại bé, hoặc cảm thấy mất liên hệ với thực tại. Hãy tìm trợ giúp khẩn cấp ngay.',
      'Cơn hoảng loạn, ý nghĩ đáng sợ cứ quay lại, hoặc mẹ không ngủ được dù bé đã ngủ.',
      'Rò rỉ nước tiểu hoặc phân, có khối phồng ở âm đạo, hoặc nặng như kéo xuống ở vùng chậu, nhất là khi chạy hoặc nhấc đồ.',
      'Bụng phồng hoặc nhô hình nón khi ngồi dậy hoặc nhấc đồ ngày càng nặng hơn, hoặc đau lưng dưới hay vùng chậu đến mức không làm được việc hằng ngày.',
    ],
    dad: [
      'Hãy nhận hẳn một việc mỗi ngày, như tắm cho bé hoặc nấu bữa tối. Đừng chờ được nhờ.',
      'Nhận một ca ngủ cố định mỗi tuần để vợ có một giấc nghỉ liền dài.',
      'Buồn bã, lo lắng hoặc mất niềm vui kéo dài, hay thấy xa cách với bé? Hãy cùng nhau nói với bác sĩ hoặc y tá của vợ.',
      'Bố hay buồn bã nhiều nhất quanh 3-6 tháng. Thấy cáu gắt hoặc xa cách? Hãy nói chuyện với bạn bè hoặc bác sĩ.',
    ],
  },
  27: {
    title: 'Bé luôn chuyển động (tuần 27-52)',
    focus: 'Bé tập bò, vịn đứng và nặng dần, nên lưng, cổ tay và đầu gối của mẹ làm việc nhiều hơn, trong khi giấc ngủ và tâm trạng vẫn cần được chăm sóc.',
    stageTip: 'Chơi dưới sàn theo từng đợt ngắn và đổi tư thế thường xuyên. Quỳ hoặc ngồi trên đệm có tựa lưng thay vì cúi người xuống bé đang bò.',
    exercise: [
      'Đi bộ nhanh với xe đẩy hoặc địu 10-30 phút, hầu hết các ngày. Dần dần hướng tới 150 phút mỗi tuần. Dừng lại nếu bị rò rỉ, thấy nặng hoặc đau.',
      'Tập sức mạnh 2 ngày mỗi tuần: squat, nâng mông, kéo dây kháng lực. 8-12 lần, 2 hiệp. Dừng lại nếu đau nhói hoặc nặng vùng chậu.',
      'Nâng bé với gối gập và lưng thẳng. Giữ bé sát người và thở ra khi nâng. Không xoay người khi nâng.',
    ],
    mind: [
      'Baby blues chỉ ngắn, nhưng trầm cảm sau sinh có thể bắt đầu đến một năm sau sinh. Buồn bã, lo lắng hoặc cảm thấy không xoay xở nổi từ 2 tuần trở lên là điều nên nói với ai đó.',
      'Kiệt sức vì làm cha mẹ có thể tích tụ lúc này. Dấu hiệu là mệt mỏi sâu, thấy xa cách với bé và cảm giác mình không còn là người mẹ như trước. Hãy chia sẻ với bác sĩ hoặc người mẹ tin tưởng.',
      'Giấc ngủ: bé thường thức đêm ở giai đoạn này. Hãy thay phiên với bạn đời, chợp mắt khi bé ngủ nếu có thể, và xin một giấc ngủ liền dài mỗi tuần.',
    ],
    doctor: [
      'Có ý nghĩ làm hại bản thân hoặc bé. Hãy tìm trợ giúp khẩn cấp ngay (số cấp cứu hoặc đường dây khủng hoảng).',
      'Buồn bã, tuyệt vọng, hoảng loạn hoặc lo lắng liên tục kéo dài hơn 2 tuần hoặc khiến mẹ không làm được việc hằng ngày.',
      'Đau lưng dữ dội, làm mẹ thức giấc ban đêm, hoặc kèm yếu chân, tê hoặc khó đi tiểu hay đi ngoài.',
      'Đau, sưng hoặc cảm giác vướng ở bên ngón cái của cổ tay không đỡ sau vài tuần nghỉ ngơi và chăm sóc.',
    ],
    dad: [
      'Nhận việc nâng nặng: ghế xe hơi, xe đẩy, nhấc bé từ dưới sàn. Điều này giúp lưng và cổ tay của vợ đỡ đau.',
      'Làm những việc chăm bé ít ai thấy, như túi đồ đi nhà trẻ, lịch khám bác sĩ và đi chợ.',
      'Hãy hỏi thường xuyên: em thật sự thấy thế nào? Để ý nếu vợ buồn bã, lo lắng hoặc mất niềm vui kéo dài, và hãy tìm giúp đỡ.',
      'Tự mình chơi với bé dưới sàn và lo thói quen giờ đi ngủ. Điều này gắn kết bố con và cho vợ được nghỉ.',
    ],
  },
  53: {
    title: 'Tuổi tập đi (từ 1 tuổi)',
    focus: 'Bé đã biết đi, biết chạy và vẫn đòi bế, nên hãy bảo vệ lưng, hông và đầu gối của mẹ, đồng thời chăm sóc tâm trạng, giấc ngủ và thời gian riêng của mẹ.',
    stageTip: 'Đừng bế bé trên một bên hông cả ngày. Đổi bên, dùng địu có đỡ hông, và để bé tự đi hoặc leo cầu thang một đoạn.',
    exercise: [
      'Vận động vừa phải 150 phút mỗi tuần, như đi bộ nhanh hoặc chơi ở sân chơi. Các đợt ngắn 10 phút cũng tính. Dừng lại nếu đau ngực hoặc chóng mặt.',
      'Tập sức mạnh 2 ngày mỗi tuần cho chân, hông, lưng, bụng, ngực và tay. 8-12 lần, 2 hiệp. Dừng lại nếu đau nhói hoặc nặng vùng chậu.',
      'Squat để nhặt bé và đồ chơi. Gối gập, lưng thẳng, bé sát người. Mỗi ngày tập 10 lần squat chậm. Dừng lại nếu đau gối.',
    ],
    mind: [
      'Trầm cảm và lo âu sau sinh vẫn có thể xuất hiện trong năm thứ hai. Triệu chứng kéo dài từ 2 tuần trở lên là lý do để nói với bác sĩ hoặc nhân viên y tế.',
      'Kiểm tra kiệt sức: nếu mẹ thấy trống rỗng, xa cách với bé hoặc chán nản trong nhiều tuần, hãy nói với bác sĩ. Điều này khá phổ biến và có thể cải thiện khi được hỗ trợ.',
      'Bảo vệ giấc ngủ: bé 1-2 tuổi cần khoảng 11-14 giờ trong 24 giờ. Thói quen đi ngủ đều đặn sẽ giúp ích. Chia ca đêm và nghỉ ngơi khi có thể.',
    ],
    doctor: [
      'Có ý nghĩ tự tử hoặc làm hại bản thân hay bé. Hãy tìm trợ giúp khẩn cấp ngay (số cấp cứu hoặc đường dây khủng hoảng).',
      'Buồn bã, hoảng loạn, lo lắng liên tục hoặc mất hứng thú kéo dài hơn 2 tuần và ảnh hưởng đến cuộc sống hằng ngày.',
      'Đau lưng hoặc hông làm mẹ thức giấc ban đêm, lan xuống chân, hoặc kèm tê, yếu hay thay đổi về đi tiểu hoặc đi ngoài.',
      'Rò rỉ nước tiểu hoặc phân, có khối phồng hoặc cảm giác nặng ở âm đạo, hoặc vẫn đau khi quan hệ.',
    ],
    dad: [
      'Cùng gánh việc "nghĩ giùm": tự theo dõi lịch khám bác sĩ, nhà trẻ và danh sách đi chợ.',
      'Nếu vợ đi làm, hãy đảm nhận một nửa việc đưa đón nhà trẻ, ngày bé ốm và những lần bé thức đêm.',
      'Đặt lịch mỗi tuần để vợ tập thể dục hoặc nghỉ ngơi, và một buổi hẹn hò của hai vợ chồng.',
      'Bé ăn vạ là bình thường. Hãy bình tĩnh, hạ người xuống ngang tầm bé và nhẹ nhàng. Cũng nhớ chăm sóc giấc ngủ của chính mình nhé.',
    ],
  },
};
