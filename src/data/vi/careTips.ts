import type { CareTips } from '../../types';

interface CareTipsEntry extends CareTips {
  week: number;
}

export const careTipsDataVi: CareTipsEntry[] = [
  {
    week: 0,
    feeding: [
      'Cho bé bú theo nhu cầu, khoảng 1,5-3 giờ một lần. Bú 8-12 cữ mỗi ngày là bình thường và tốt cho bé.',
      'Dấu hiệu đói xuất hiện TRƯỚC khi bé khóc: tìm vú, mút tay, quay đầu. Khóc là dấu hiệu muộn.',
      'Sau mỗi cữ bú, bế bé thẳng đứng 10-20 phút để giảm trào ngược và giúp bé ợ hơi.',
    ],
    sleep: [
      'Luôn ngủ an toàn: mặt phẳng cứng, bé nằm ngửa, ngủ một mình, không gối, chăn hay thành chắn.',
      'Nếu quấn bé, luôn đặt bé nằm ngửa, để hông bé thoải mái, không dùng khăn quấn có tạ, và ngừng quấn ngay khi bé có dấu hiệu biết lật.',
      'Bé sơ sinh chưa phân biệt được ngày và đêm. Ban ngày hãy để sáng và vui vẻ, ban đêm tối, yên tĩnh và nhẹ nhàng nhé.',
    ],
    soothing: [
      '5 chiêu dỗ bé: Quấn, nằm nghiêng/sấp (khi đang bế), Suỵt, Đưa nhẹ, Mút. Dùng cùng lúc sẽ hiệu quả nhất.',
      'Tiếng ồn trắng 65-70 dB (quạt, ứng dụng hoặc tiếng suỵt) giống âm thanh liên tục trong bụng mẹ.',
      'Nếu mẹ đang căng thẳng, bé sẽ cảm nhận được. Hãy đặt bé xuống an toàn và hít thở 5 phút, điều đó tốt cho cả hai mẹ con.',
    ],
    health: [
      'Bé từ 12 tuần tuổi trở xuống bị sốt (từ 38°C / 100.4°F, đo hậu môn) cần được bác sĩ nhi tư vấn ngay. Hãy gọi bác sĩ hoặc đến cơ sở cấp cứu ngay.',
      'Vàng da (da/mắt vàng) thường gặp vào ngày 2-5. Vàng da nhẹ tự hết, vàng da nặng cần điều trị.',
      'Rốn: giữ khô, gấp tã xuống dưới rốn, để rốn tự rụng (1-3 tuần). Tuyệt đối không giật rốn.',
      'Cần chú ý: dưới 6 tã ướt mỗi ngày, 48 giờ không đi ngoài, khó thở, lờ đờ bất thường. Hãy gọi bác sĩ.',
    ],
  },
  {
    week: 4,
    feeding: [
      'Một cữ bú xong khi bé tự nhả ra, trông thỏa mãn và có tã ướt đều đặn.',
      'Bé thường có đợt tăng trưởng nhanh ở tuần 3-4, bé sẽ bú dày hơn trong 2-3 ngày. Hãy theo tín hiệu của bé nhé.',
      'Trào ngược (ọc sữa) cao điểm quanh tuần 4-6 vì van dạ dày còn đang hoàn thiện. Để giảm: bế bé thẳng 20-30 phút sau mỗi cữ, vỗ ợ hơi giữa cữ khi bé ngồi thẳng (đỡ đầu bé, không vắt qua vai), và thử cho bú ít hơn nhưng nhiều cữ hơn.',
      'Hãy gọi bác sĩ nếu bé: không tăng cân, nôn vọt, ọc ra dịch xanh hoặc có máu, bỏ bú, hoặc có máu trong phân. Đây có thể là trào ngược bệnh lý (GERD) chứ không phải trào ngược thông thường.',
    ],
    sleep: [
      'Để ý dấu hiệu buồn ngủ trước khi bé khóc: ngáp, nhìn xa xăm, dụi mắt, mất hứng thú với xung quanh.',
      'Giới hạn thời gian thức ở 45-75 phút. Bé quá mệt sẽ càng khó ngủ hơn.',
      'Môi trường ngủ nhất quán (cùng chỗ, cùng tiếng ồn trắng) giúp bé hiểu đây là nơi để ngủ.',
      'Bắt đầu tập "buồn ngủ nhưng còn tỉnh": đặt bé xuống khi bé đang lim dim nhưng vẫn còn tỉnh. Bé học tự ngủ sẽ dễ tự ngủ lại giữa các chu kỳ ngủ ban đêm hơn.',
    ],
    soothing: [
      'Địu bé giúp bé bình tĩnh và tay mẹ rảnh rang. Hơi ấm và chuyển động rất dễ chịu với bé.',
      'Với bé quấy đã bú và đã thay tã: thử tắm nước ấm, da kề da, hoặc đi xe nhẹ nhàng.',
      'Ở tuổi này mẹ cứ yên tâm dỗ bé ngay khi bé khóc. Bé dưới 24 tuần không thể bị chiều hư.',
      'Khi bé đau bụng đầy hơi: thử "tư thế úp bụng", cho bé nằm sấp dọc cẳng tay mẹ, má tựa vào lòng bàn tay. Hoặc nhẹ nhàng đạp xe chân bé và xoa bụng theo vòng tròn nhỏ theo chiều kim đồng hồ. Chuyển động đều (đưa nôi, xe đẩy, xe hơi) và tiếng ồn trắng giúp nhiều nhất với khóc dạ đề.',
    ],
    health: [
      'Mũi tiêm đầu tiên thường vào tuần 6-8. Hãy xem lịch tiêm chủng tại địa phương và đặt lịch ngay nhé.',
      'Quy tắc sốt: nếu bé từ 12 tuần trở xuống và nhiệt độ hậu môn từ 38°C / 100.4°F trở lên, hãy gọi bác sĩ nhi ngay.',
      'Cứt trâu (da đầu bong vảy) vô hại. Thoa dầu cho bé, để 20 phút, rồi chải nhẹ bằng bàn chải mềm.',
      'Phân bình thường ở tuổi này rất đa dạng: bé bú mẹ có thể đi sau mỗi cữ bú hoặc vài ngày mới đi, cả hai đều bình thường. Phân vàng mù tạt, có hạt là tốt. Bé bú sữa công thức thường đi phân chắc hơn, đều hơn, màu vàng xanh.',
    ],
  },
  {
    week: 8,
    feeding: [
      'Cữ bú có thể ngắn lại (5-10 phút) khi bé bú hiệu quả hơn. Điều này bình thường, không phải mẹ thiếu sữa.',
      'Nếu cho con bú, nguồn sữa của mẹ đã ổn định. Hãy cho bú theo nhu cầu thay vì theo đồng hồ.',
      'Bé hơi quấy khi bú là bình thường: do đầy hơi, trào ngược, hoặc sữa về nhanh/chậm. Thử đổi tư thế bú nhé.',
    ],
    sleep: [
      'Bắt đầu một thói quen đi ngủ đơn giản: bú, tắm, hát ru, ngủ. Đều đặn quan trọng hơn là dài.',
      'Thử đặt bé xuống khi lim dim nhưng còn tỉnh. Đây là bước đầu giúp bé tự ngủ.',
      '"Quý 4 của thai kỳ" sắp kết thúc. Quanh tuần 12 sẽ khá hơn, nhưng mỗi bé một khác.',
      'Khi ngủ, bé thường rên, giật mình và cựa quậy. Đây là giấc ngủ chủ động (REM) bình thường, không phải bé thức. Hãy chờ một chút trước khi dỗ, nhiều bé sẽ tự ngủ lại.',
    ],
    soothing: [
      'Bé quấy buổi tối ("giờ quỷ") thường cao điểm quanh tuần 6-8 và thường hết vào tuần 12.',
      'Nếu bé khóc dạ đề nặng, thử: đạp xe chân, xoa bụng vòng tròn, nước gripe, hoặc tắm nước ấm.',
      'Chia ca: bố mẹ thay phiên nhau để không ai bị kiệt sức. Chỉ cần ngủ liền 3 giờ cũng giúp rất nhiều.',
    ],
    health: [
      'Đến lịch tiêm 8 tuần: thường là bạch hầu-ho gà-uốn ván (DTaP), bại liệt, Hib, phế cầu (PCV), rota. Sốt nhẹ và quấy khóc 24-48 giờ sau tiêm là bình thường.',
      'Cho bé uống paracetamol (theo cân nặng) nếu bé sốt trên 38°C sau tiêm và có vẻ khó chịu.',
      'Chàm sữa thường xuất hiện lúc này. Hãy bôi kem dưỡng ẩm không mùi hai lần mỗi ngày và tránh tắm bọt.',
      'Bình thường ở tuổi này: hắt hơi (làm sạch đường thở), nấc cụt, thở khò khè nhẹ và thỉnh thoảng lé mắt.',
    ],
  },
  {
    week: 12,
    feeding: [
      'Cữ bú có thể thưa ra 3-4 giờ một lần khi dạ dày bé lớn dần. Đây là thay đổi bình thường của sự phát triển.',
      'Bé dễ xao nhãng khi bú. Hãy thử phòng yên tĩnh, ánh sáng dịu và ít kích thích.',
      'Sữa mẹ hoặc sữa công thức là đủ dinh dưỡng. Chưa cho uống nước, nước ép hay ăn dặm trước 24 tuần.',
    ],
    sleep: [
      'Có thể cho bé ngủ 3 giấc ngày: sáng, trưa, và một giấc ngắn chiều muộn. Thời gian thức khoảng 90 phút.',
      'Nếu bé thức giấc ban đêm, hãy chờ 1-2 phút trước khi dỗ, bé có thể tự ngủ lại.',
      'Nhiệt độ phòng 18-20°C là mục tiêu hợp lý. Dùng túi ngủ không có tạ thay vì chăn rời.',
      'Đây là thời điểm tốt để tạo thói quen giúp việc luyện ngủ sau này ngắn hơn: giờ đi ngủ đều đặn, cùng môi trường ngủ cho mọi giấc ngày và đêm, và luôn đặt bé xuống khi lim dim nhưng còn tỉnh.',
    ],
    soothing: [
      'Bé ngày càng thích giao tiếp và phản ứng nhiều hơn. Nhìn vào mắt bé và trò chuyện là cách làm bé bình tĩnh rất hiệu quả.',
      'Nhẹ nhàng "suỵt và vỗ" khi bé nằm trong nôi giúp bé ngủ lại mà không cần bế lên mỗi lần.',
      'Mọc răng có thể bắt đầu từ tuần 12. Gặm lạnh, bàn chải ngón tay silicone, hoặc xoa nhẹ nướu sẽ giúp bé dễ chịu.',
    ],
    health: [
      'Khám 12 tuần: cân nặng, chiều dài, vòng đầu. Hãy hỏi bác sĩ mọi điều mẹ thắc mắc bấy lâu nhé.',
      'Mọc răng có thể bắt đầu từ tuần 12 nhưng răng đầu tiên thường lên ở tuần 16-28. Chảy dãi và gặm cắn là dấu hiệu sớm.',
      'Trầm cảm sau sinh có thể đỉnh điểm ở tuần 12, không chỉ vài tuần đầu. Nếu mẹ thấy khó khăn, xin mẹ hãy nói với bác sĩ.',
      'Chống nắng: không để bé dưới nắng trực tiếp. Sau 24 tuần có thể dùng kem chống nắng SPF 30+. Trước 24 tuần, hãy dùng bóng râm và quần áo che chắn.',
    ],
  },
  {
    week: 16,
    feeding: [
      'Giai đoạn "thoái lui giấc ngủ 16 tuần" thường khiến bé thức đêm nhiều hơn và bú nhiều hơn. Điều này chỉ tạm thời.',
      'CHƯA nên cho ăn dặm. Tổ chức Y tế Thế giới (WHO) khuyến nghị chỉ bú sữa đến 24 tuần.',
      'Nếu muốn tập cho bé bú bình, tuần 16 là thời điểm tốt. Càng sớm bé càng dễ chấp nhận bình hơn.',
    ],
    sleep: [
      'Thoái lui giấc ngủ 16 tuần là có thật. Chu kỳ ngủ của bé đã trưởng thành vĩnh viễn, nên bé thức hẳn giữa các chu kỳ giống người lớn.',
      'Nếu bé hay thức giấc, hãy kiểm tra: quá mệt, chưa đủ mệt, đói, nóng/lạnh, hoặc đang trong giai đoạn phát triển nhảy vọt.',
      'Tránh đưa nôi hoặc cho bú để ngủ mỗi lần. Đây sẽ thành thói quen bé cần lặp lại mỗi lần thức giấc.',
      'Cách khắc phục là dạy bé tự vào giấc. Sau thói quen trước khi ngủ, đặt bé xuống khi còn tỉnh. Nếu bé khóc, chờ vài phút rồi vào thăm ngắn (vỗ nhẹ, nói giọng bình tĩnh, không bế lên). Lặp lại và tăng dần thời gian chờ.',
    ],
    soothing: [
      'Bé tuổi này thích đứng trên đùi mẹ. Việc đạp chân giúp bé thấy bình tĩnh nhờ cảm giác vận động.',
      'Đáp lại tiếng khóc nhất quán (thay vì bỏ mặc) giúp xây dựng niềm tin và thực ra làm bé khóc ít đi theo thời gian.',
      'Nếu mẹ thấy kiệt sức, hãy nhờ người giúp. Sức khỏe tinh thần của mẹ không tách rời sức khỏe của bé.',
    ],
    health: [
      'Đến lịch tiêm 16 tuần: các mũi nhắc DTaP, bại liệt, Hib, PCV. Hãy đặt lịch ngay nhé.',
      'Để ý dấu hiệu viêm tai: kéo tai, quấy bất thường, sốt, khó ngủ. Hãy đưa bé đến bác sĩ.',
      'Đầu bé có thể bị bẹp một bên (biến dạng đầu do tư thế). Hãy cho bé nằm sấp chơi nhiều hơn và đổi đầu nằm của bé ở hai đầu giường.',
      'Virus hợp bào hô hấp (RSV) gây triệu chứng giống cảm lạnh nhưng có thể nặng ở trẻ nhỏ. Hãy tránh để người bệnh đến gần bé.',
    ],
  },
  {
    week: 20,
    feeding: [
      'Dấu hiệu bé sẵn sàng ăn dặm (mục tiêu 24 tuần): ngồi có đỡ, hết phản xạ đẩy lưỡi, thích thú với đồ ăn.',
      'Tiếp tục dùng sữa mẹ hoặc sữa công thức là nguồn dinh dưỡng chính. Ăn dặm chỉ bổ sung, không thay thế.',
      'Nếu cho ăn dặm sớm theo chỉ định của bác sĩ, hãy bắt đầu với bột xay mịn một loại nguyên liệu.',
    ],
    sleep: [
      'Hầu hết bé 20 tuần ngủ 2-3 giấc ngày. Chuyển sang 2 giấc thường diễn ra từ 24-36 tuần.',
      'Nếu giấc ngủ chưa cải thiện sau giai đoạn thoái lui, việc luyện ngủ lúc này an toàn và phù hợp. Phương pháp từng bước: sau thói quen đi ngủ, đặt bé xuống khi còn tỉnh rồi rời đi. Nếu bé khóc, chờ vài phút, vào thăm ngắn (vỗ nhẹ, nói vài lời, không bế lên), rồi ra. Tăng dần thời gian chờ. Hầu hết bé tự ngủ lại sau 3-5 đêm.',
      'Tạo nghi thức thư giãn: giảm đèn 30 phút trước giờ ngủ, chơi yên tĩnh, tắm nước ấm, bú, hát ru.',
    ],
    soothing: [
      'Bé bắt đầu nhận ra người lạ và có chút lo lắng. Hãy luôn giới thiệu người mới thật từ từ.',
      'Lo âu khi xa mẹ đang bắt đầu. Một nghi thức tạm biệt nhất quán (ngắn gọn, vui vẻ, luôn quay lại) sẽ xây dựng niềm tin cho bé.',
      'Đánh lạc hướng rất hiệu quả lúc này: món đồ chơi mới, đổi phòng, hoặc ra ngoài có thể nhanh chóng đổi tâm trạng của bé.',
    ],
    health: [
      'Hầu hết các nước không có mũi tiêm theo lịch ở tuần 20, nhưng mẹ hãy kiểm tra lịch tại địa phương nhé.',
      'Dọn nhà an toàn cho bé: bây giờ là lúc bắt đầu. Bé lật rồi sẽ bò nhanh hơn mẹ nghĩ.',
      'Không bao giờ để bé một mình trên bề mặt cao. Bé có thể lật bất ngờ mà không báo trước.',
      'Nếu bé chảy dãi nhiều, đó là bé đang chuẩn bị mọc răng. Giữ da khô để tránh hăm do dãi.',
    ],
  },
  {
    week: 24,
    feeding: [
      'Bắt đầu ăn dặm nếu bé có dấu hiệu sẵn sàng. Bắt đầu với 1-2 thìa cà phê bột mịn mỗi ngày một lần.',
      'Cho bé thử một món mới mỗi 3 ngày để theo dõi phản ứng dị ứng. Các thực phẩm dễ gây dị ứng có thể cho ăn sớm.',
      'Không bao giờ ép bé ăn. Quay đi, ngậm miệng hay khóc là tín hiệu rõ ràng "con no rồi".',
    ],
    sleep: [
      'Hầu hết bé 24 tuần có thể ngủ 5-8 giờ không cần bú. Nếu bé vẫn dậy bú nhiều lần, hãy thử cho bú trước giờ đi ngủ 1 giờ thay vì làm bước cuối cùng. Cách này giúp bỏ thói quen bú để ngủ.',
      'Phương pháp Ferber (khóc có kiểm soát): đặt bé xuống khi còn tỉnh sau thói quen đi ngủ rồi rời đi. Nếu bé khóc, chờ vài phút, vào thăm ngắn (vỗ nhẹ, nói giọng bình tĩnh, không bế lên, ở dưới 1-2 phút), rồi ra. Tăng dần thời gian chờ. Ghi nhớ thời gian chờ cuối cùng và bắt đầu từ đó vào đêm sau. Lặp lại trong nhiều đêm.',
      'Mẹ có thể tạo thói quen gắn bó với vật thân thuộc khi ôm bé lúc thức, nhưng hãy để thú nhồi bông, chăn và đồ vật mềm ra khỏi chỗ ngủ cho đến sau 52 tuần.',
    ],
    soothing: [
      'Đau do mọc răng cao điểm quanh 24-32 tuần (răng cửa dưới). Đồ gặm lạnh, khăn ướt lạnh hoặc gel mọc răng sẽ giúp bé.',
      'Lo âu khi xa mẹ đang tăng. Trò ú òa dạy bé "mẹ đi rồi mẹ lại về", hãy chơi thật nhiều nhé.',
      'Bé ngày càng độc lập nên đôi lúc bực bội khi chưa làm được. Hãy nói giúp bé cảm xúc của bé.',
    ],
    health: [
      'Đến lịch khám 24 tuần và tiêm chủng: các mũi nhắc và vaccine cúm (lần đầu cần 2 mũi, cách nhau 4 tuần).',
      'Răng đầu tiên mọc: bắt đầu đánh răng hai lần mỗi ngày với một lượng kem đánh răng có fluoride bằng vết quẹt ngay khi có răng đầu tiên.',
      'Từ 24 tuần, cho bé làm quen từng loại một các thực phẩm dễ gây dị ứng (đậu phộng, trứng, sữa, lúa mì). Cho ăn sớm giúp giảm nguy cơ dị ứng.',
      'Nhắc lại về nguy cơ hóc: mọi vật nhỏ hơn lõi giấy vệ sinh đều có thể gây hóc. Hãy kiểm tra sàn nhà và các bề mặt thấp.',
    ],
  },
  {
    week: 28,
    feeding: [
      'Chuyển từ bột mịn sang đồ nghiền và có hạt nhỏ để giúp bé tập nhai.',
      'Cho bé làm quen với cốc tập uống hoặc cốc mở có nước trong bữa ăn. Đây là một kỹ năng, nên sẽ có bừa bộn một chút nhé.',
      'Bé có thể đột nhiên từ chối món đã thích tuần trước. Hãy cứ tiếp tục cho thử, cần 10-15 lần bé mới quen.',
    ],
    sleep: [
      'Thoái lui giấc ngủ 32 tuần thường làm gián đoạn giấc ngủ đúng lúc mọi thứ đang ổn. Điều này chỉ tạm thời.',
      'Nếu bé tập bò hoặc vịn đứng trong cũi, việc thức đêm để tập là thường gặp. Hãy trấn an ngắn gọn rồi rời đi.',
      'Tránh để bé thức quá lâu trước giờ ngủ. Bé quá mệt sẽ chống lại giấc ngủ nhiều hơn.',
    ],
    soothing: [
      'Lo âu khi xa mẹ cao điểm quanh 32-44 tuần. Hãy luôn chào tạm biệt, lén đi sẽ làm bé lo hơn.',
      'Thói quen có thể đoán trước là công cụ tốt nhất của mẹ. Khi bé biết điều gì tiếp theo, bé thấy an toàn.',
      'Bé đang thử nghiệm nguyên nhân và kết quả với mọi thứ, kể cả phản ứng của mẹ. Hãy bình tĩnh và nhất quán nhé.',
    ],
    health: [
      'Hầu hết lịch tiêm không có mũi mới ở tuần 28, nhưng mũi cúm thứ hai có thể đến hạn.',
      'Nếu chưa làm, hãy dọn nhà an toàn cho bé ngay: bé bò nghĩa là chạm được mọi thứ ở tầm sàn.',
      'An toàn với nước: không bao giờ để bé một mình gần nước, kể cả bồn tắm, xô, hồ bơi. Đuối nước xảy ra rất nhanh và âm thầm.',
      'Dấu hiệu viêm tai: sốt, kéo tai, thức đêm nhiều hơn, quấy hơn bình thường sau khi bị cảm. Hãy đưa bé đến bác sĩ.',
    ],
  },
  {
    week: 32,
    feeding: [
      'Bắt đầu cho ăn bốc: miếng chuối mềm, bơ, cà rốt nấu chín. Bé đang phát triển kỹ năng cầm nắm bằng hai ngón, hãy để bé thử.',
      'Bé buồn nôn (gagging) là bình thường và khác với hóc. Gagging là phản xạ bảo vệ bình thường; hóc thì im lặng, bé không thở được.',
      'Bữa ăn cả nhà cùng nhau là yếu tố dự báo tốt nhất cho thói quen ăn uống lành mạnh suốt đời. Hãy ăn cùng bé khi có thể.',
    ],
    sleep: [
      'Hầu hết bé 32 tuần ngủ 2 giấc ngày (sáng và chiều). Một số đêm bé vẫn có thể thức 1-2 lần.',
      'Giờ đi ngủ đều đặn lúc 7-8 giờ tối phù hợp với hầu hết bé tuổi này.',
      'Nếu bé thức đêm để bú, có thể cân nhắc cữ bú "trong mơ" lúc 10-11 giờ đêm để kéo dài giấc ngủ dài nhất.',
    ],
    soothing: [
      'Vật thân thuộc (thú nhồi bông, chăn nhỏ) lúc này rất hữu ích để bé tự trấn an. Hãy đảm bảo vật đó an toàn.',
      'Âm thanh lớn hoặc thay đổi đột ngột có thể làm bé khó chịu. Hãy nói trước với bé khi chuyển hoạt động.',
      'Khi bé bực bội, gọi tên cảm xúc và đưa ra lựa chọn khác sẽ hiệu quả hơn là chỉ đánh lạc hướng.',
    ],
    health: [
      'Đến lịch khám 36 tuần: sàng lọc phát triển, kiểm tra sắt, và sàng lọc chì ở một số nơi.',
      'Hãy học cách sơ cứu khi bé hóc trước khi cần đến. Dùng khóa học sơ cứu có chứng nhận hoặc tài liệu bác sĩ nhi khuyên dùng, và lưu số khẩn cấp tại địa phương.',
      'Răng sữa: đánh răng sáng và tối với một lượng kem đánh răng có fluoride bằng vết quẹt. Tránh đồ uống có đường, kể cả nước ép.',
      'Mùa cảm cúm: rửa tay là cách phòng tránh hiệu quả nhất. Để nước rửa tay ở mọi lối vào nhà.',
    ],
  },
  {
    week: 36,
    feeding: [
      'Chuyển dần sang 3 bữa nhỏ với thức ăn của gia đình cùng các bữa phụ. Tiếp tục sữa mẹ hoặc sữa công thức 2-3 lần mỗi ngày.',
      'Tránh thêm muối, đường và mật ong (không cho mật ong trước 52 tuần vì nguy cơ ngộ độc botulinum).',
      'Hãy để bé tự ăn nhiều nhất có thể. Dù bừa bộn nhưng rất quan trọng để bé phát triển kỹ năng ăn uống.',
    ],
    sleep: [
      'Thoái lui giấc ngủ 36 tuần khá phổ biến. Đây là do sự phát triển, bộ não đang lớn của bé đang làm việc hết công suất.',
      'Nếu có thể, tránh để bé ngủ khi đang bú mẹ/bú bình mỗi lần vì dễ thành thói quen ngủ.',
      'Nếu bé bỏ giấc ngủ ngày, hãy cho bé đi ngủ sớm hơn (6:30 tối không quá sớm với bé 36 tuần).',
    ],
    soothing: [
      'Bé sẽ nhìn mẹ để đọc cảm xúc ("tham chiếu xã hội"). Hãy giữ bình tĩnh trong những tình huống chưa chắc chắn.',
      'Vận động rất dễ chịu với bé: đưa võng, đung đưa, nhún nhẹ hoặc đi dạo khi bé khó chịu.',
      'Những từ đầu tiên đang hình thành trong đầu bé. Hãy đáp lại mọi tiếng bé phát ra để khuyến khích ngôn ngữ.',
    ],
    health: [
      'Cập nhật việc dọn nhà an toàn: bé vịn đứng nghĩa là bàn, kệ sách và TV giờ đã chạm tới được.',
      'Hãy cố định mọi đồ nội thất cao vào tường. Đồ đổ là một trong những nguyên nhân hàng đầu gây thương tích ở trẻ nhỏ.',
      'Kiểm tra thị lực: bé nên nhìn theo vật di chuyển mượt mà. Nheo mắt liên tục hoặc lác mắt cần được thăm khám.',
      'Nên đưa bé đi khám nha khoa lần đầu trước 52 tuần hoặc khi răng đầu tiên mọc, tùy cái nào đến trước.',
    ],
  },
  {
    week: 44,
    feeding: [
      'Chuyển hoàn toàn từ bột mịn sang thức ăn mềm của gia đình. Giờ bé có thể ăn hầu hết những gì cả nhà ăn.',
      'Sữa bò nguyên kem có thể thay sữa công thức từ 52 tuần. Hãy cho làm quen từ từ, cho bé uống bằng cốc.',
      'Nếu bé từ chối bữa ăn, hãy đưa nước và dọn đĩa đi. Đừng đổi sang món bé thích, vì như vậy dạy bé biết từ chối.',
    ],
    sleep: [
      'Hầu hết bé 44 tuần ngủ 10-12 giờ ban đêm với 2 giấc ngày, rồi chuyển sang 1 giấc quanh 52-61 tuần.',
      'Bé khóc một chút ban đêm là bình thường và không phải lúc nào cũng cần đáp lại. Hãy chờ 2-3 phút rồi hãy vào.',
      'Cẩn thận với việc bé quá mệt. Đi ngủ lúc 7 giờ tối tốt hơn 9 giờ tối để tránh bé thức đêm.',
    ],
    soothing: [
      'Bé giờ rất gắn bó với mẹ. Điều này tốt và cho thấy mối quan hệ gắn bó của hai mẹ con rất vững chắc.',
      'Cơn giận dỗi mới bắt đầu. Hãy thấu hiểu cảm xúc, giữ ranh giới, rồi dỗ dành sau, theo đúng thứ tự đó.',
      'Đọc sách cùng nhau mỗi tối vừa làm bé dịu lại, vừa là một trong những hoạt động hiệu quả nhất cho sự phát triển.',
    ],
    health: [
      'Sắp đến lúc khám 52 tuần. Hầu hết lịch tiêm có MMR, thủy đậu và viêm gan A.',
      'Tập đi: giày đế mềm hoặc chân trần là tốt nhất khi đi trong nhà. Đế cứng làm giảm cảm giác phản hồi vận động.',
      'Kiểm tra ghế xe hơi: ở 52 tuần, hầu hết trẻ vẫn nên ngồi quay mặt về phía sau. Hãy xem hướng dẫn của nước mình.',
      'Tránh cho xem màn hình trước 2 tuổi (trừ gọi video). Ngay cả TV bật nền cũng ảnh hưởng đến phát triển ngôn ngữ.',
    ],
  },
  {
    week: 52,
    feeding: [
      'Chuyển sang sữa bò nguyên kem lúc 52 tuần nếu bé không bú mẹ. Giới hạn 480-720 ml mỗi ngày.',
      'Giờ bé có thể ăn gần như mọi thức ăn của gia đình. Tránh: thức ăn tròn cứng (nguy cơ hóc), mật ong, muối/đường thêm vào.',
      'Hãy bỏ hẳn bột xay. Thức ăn có hạt và kết cấu giúp phát triển hàm và giảm biếng ăn kén chọn.',
    ],
    sleep: [
      'Hầu hết bé 1 tuổi ngủ 10-12 giờ ban đêm cộng 1-2 giấc ngày, tổng 2-3 giờ.',
      'Lo âu khi xa mẹ vào giờ đi ngủ khá phổ biến ở 52 tuần. Một thói quen đi ngủ đều đặn, ấm áp sẽ giúp rất nhiều.',
      'Nếu giấc ngủ lùi bước quanh sinh nhật, đó là thoái lui giấc ngủ do phát triển. Thường hết sau 2-4 tuần.',
    ],
    soothing: [
      'Cơn giận dỗi sẽ tăng trong năm tới vì mong muốn của bé vượt khả năng nói. Hãy bình tĩnh và đồng cảm nhé.',
      'Thấu hiểu cảm xúc trước khi xử lý hành vi: "Con buồn lắm nhỉ. Phải dừng chơi thì khó chịu quá."',
      'Vận động ban ngày giúp bé ngủ ngon hơn ban đêm. Rất nên cho bé ra ngoài chơi mỗi ngày.',
    ],
    health: [
      'Khám 52 tuần: tiêm MMR, thủy đậu, viêm gan A. Cũng kiểm tra thiếu sắt, đánh giá phát triển và xét nghiệm chì.',
      'Nha khoa: hãy đặt lịch khám nha sĩ đầu tiên nếu chưa làm. Đánh răng hai lần mỗi ngày với kem đánh răng có fluoride (một vết quẹt).',
      'Cổng chắn cầu thang phải đặt ở cả đầu và cuối mọi cầu thang. Bé tập đi hay ngã, thường xuyên.',
      'An toàn với hồ bơi và bồn tắm: không bao giờ để bé một mình gần nước. Đuối nước có thể xảy ra ở chỗ nước chỉ sâu 5 cm trong chưa đến 30 giây.',
    ],
  },
  {
    week: 61,
    feeding: [
      'Cho ăn theo lịch đều đặn: 3 bữa chính + 2 bữa phụ. Bé ăn ngon hơn khi biết khi nào có đồ ăn.',
      'Hãy cho bé thử nhiều món dù bé từ chối. Có thể cần 15-20 lần bé mới chấp nhận món mới, mẹ cứ kiên trì nhé.',
      'Tránh dùng đồ ăn để thưởng hay phạt. Câu "ăn rau đi để được ăn tráng miệng" làm bé càng ghét rau.',
    ],
    sleep: [
      'Bé 56-78 tuần cần 11-14 giờ ngủ mỗi ngày. Giờ đi ngủ đều đặn lúc 7-7:30 tối là lý tưởng.',
      'Chuyển từ 2 giấc sang 1 giấc ngày thường diễn ra ở 56-78 tuần. Dấu hiệu: bỏ ngủ trưa, khó ngủ vào buổi tối.',
      'Bé bắt đầu câu giờ trước khi ngủ. Hãy đặt thói quen rõ ràng, ngắn gọn (tối đa 20 phút) và giữ đúng, không thương lượng.',
    ],
    soothing: [
      'Khi bé bắt đầu ăn vạ, đừng cố giảng giải vì bộ não lý trí của bé đang "tắt". Hãy ở gần, giữ bình tĩnh và chờ cơn bão qua đi.',
      'Nhất quán là tất cả. Quy tắc chỉ thực hiện đôi khi thì coi như không có, hãy chọn cuộc chiến khôn ngoan.',
      'Vận động là cách điều hòa tâm trạng tự nhiên. Nếu bé quấy, hãy thử 20 phút chơi vận động ngoài trời.',
    ],
    health: [
      'Đến lịch khám 61 tuần: mũi nhắc DTaP, Hib, PCV, thủy đậu và mũi 2 viêm gan A.',
      'Làm nhà an toàn cho bé tập đi: cất vĩnh viễn hóa chất tẩy rửa, thuốc và vật sắc nhọn ra khỏi tầm với.',
      'Thời gian xem màn hình: WHO khuyến nghị không cho trẻ dưới 2 tuổi xem màn hình (trừ gọi video).',
      'Nha khoa: đánh răng có thể là một cuộc chiến. Hãy để bé cầm bàn chải trước, rồi mẹ mới đánh răng thật sự.',
    ],
  },
  {
    week: 78,
    feeding: [
      'Giai đoạn chỉ ăn một món cao điểm quanh 78 tuần. Hãy tiếp tục cho bé thử nhiều món cùng với món bé thích.',
      'Giai đoạn bùng nổ từ vựng ở 78 tuần gồm cả từ chỉ đồ ăn. Hãy gọi tên từng món thật vui vẻ trong mỗi bữa.',
      'Tránh màn hình trong bữa ăn. Ăn mất tập trung làm bé không nhận ra tín hiệu đói.',
    ],
    sleep: [
      'Thoái lui giấc ngủ 78 tuần là có thật và do các bước nhảy vọt phát triển. Thường kéo dài 2-6 tuần.',
      'Hầu hết bé 78 tuần ngủ 1 giấc ngày. Hãy chuyển nếu: ngủ trưa mãi không vào giấc, HOẶC giấc ngủ đêm bị ảnh hưởng.',
      'Luyện ngủ vẫn hiệu quả ở 78 tuần. Thường chỉ cần kiên trì nhất quán trong 3-5 đêm.',
    ],
    soothing: [
      'Giai đoạn "khủng hoảng tuổi lên hai" bắt đầu với nhiều bé. Bực bội vì ngôn ngữ (muốn nói nhiều hơn khả năng) gây ra nhiều cơn ăn vạ.',
      'Cho bé lựa chọn: "Cốc đỏ hay cốc xanh?" Lựa chọn thật giúp giảm tranh giành mà vẫn giữ nề nếp.',
      'Thấu hiểu trước, hướng dẫn sau: "Mẹ biết con đang giận. Con không được đánh. Con dậm chân thay nhé?"',
    ],
    health: [
      'Khám 78 tuần: mũi 2 viêm gan A, vaccine cúm, sàng lọc phát triển và tự kỷ.',
      'Mốc ngôn ngữ: bé 78 tuần nên có ít nhất 10-20 từ. Dưới 10 từ cần được chuyển đến chuyên gia ngôn ngữ.',
      'Thức ăn giàu sắt rất quan trọng lúc này: thịt đỏ, đậu, ngũ cốc bổ sung sắt. Trẻ nhỏ dễ bị thiếu sắt.',
      'An toàn nắng: kem chống nắng SPF 30+ trên mọi vùng da hở, bôi lại mỗi 2 giờ. Áo chống nắng và mũ tốt hơn chỉ dùng kem.',
    ],
  },
  {
    week: 95,
    feeding: [
      'Hầu hết bé 95 tuần có thể dùng nĩa và thìa. Hãy để bé tự làm, dù chậm và bừa hơn.',
      'Cho bé tham gia chuẩn bị món đơn giản: rửa rau, khuấy, xé bánh mì. Bé sẽ ăn món do chính mình làm.',
      'Không gian bữa ăn ổn định (cùng ghế, cùng giờ, không màn hình) giúp giảm đáng kể những cuộc chiến bàn ăn.',
    ],
    sleep: [
      'Nếu bé vẫn còn ngủ trưa, hãy giữ giấc ngủ đó. Bé bỏ ngủ trưa thường quá mệt và khó ngủ hơn buổi tối.',
      'Nỗi sợ ban đêm có thể bắt đầu ở tuổi này. Một đèn ngủ nhỏ và vào thăm ngắn là cách đáp lại phù hợp.',
      'Giờ đi ngủ nên đủ sớm để bé tự thức dậy (không bị lôi dậy) vào giờ sáng mong muốn.',
    ],
    soothing: [
      'Dạy bé về cảm xúc: gọi tên cảm xúc, thấu hiểu, rồi cùng giải quyết. "Con buồn vì hết giờ chơi công viên. Thế thì khó chịu quá. Điều gì giúp con ổn hơn nhỉ?"',
      'Hậu quả tự nhiên hiệu quả hơn trừng phạt ở tuổi này: "Con ném đồ chơi, nên đồ chơi cất đi một lúc nhé."',
      'Báo trước 5 phút trước khi chuyển hoạt động ("5 phút nữa mình về nhé"). Bé chưa xem được đồng hồ nhưng cảm nhận được sự công bằng.',
    ],
    health: [
      'Sắp khám lúc 2 tuổi, một lần đánh giá phát triển quan trọng. Hãy ghi lại mọi lo lắng về lời nói, hành vi hay thể chất trước khi đi.',
      'Dấu hiệu sẵn sàng tập bô: khô ráo 1-2 giờ, thích thú với bồn cầu, biết kéo quần lên xuống.',
      'Thị lực: nếu bé hay đưa đồ vật sát mắt, nheo mắt, hoặc tránh xếp hình/sách, hãy xin sàng lọc thị lực.',
      'Khám nha khoa hai lần mỗi năm. Đánh răng hai lần mỗi ngày, hãy làm cho vui với bài hát, đồng hồ hẹn giờ hoặc bàn chải đặc biệt.',
    ],
  },
  {
    week: 104,
    feeding: [
      'Dạ dày của bé nhỏ bằng nắm tay bé nên khẩu phần nhỏ. Đừng ép bé ăn thêm.',
      'Ở 2 tuổi, bé có thể ăn mọi thứ cả nhà ăn. Việc dám thử món mới được hình thành bằng sự đa dạng chứ không phải ép buộc.',
      'Có thể chuyển từ sữa nguyên kem sang sữa tách béo một phần ở 2 tuổi nếu muốn. Tiếp tục giới hạn sữa 480-600 ml mỗi ngày.',
    ],
    sleep: [
      'Hầu hết bé 2 tuổi cần tổng 11-14 giờ ngủ. Giờ đi ngủ đều đặn lúc 7-7:30 tối giúp bé dậy sớm và dễ hơn.',
      'Chuyển sang giường lớn: nếu được, hãy chờ đến 2-2,5 tuổi hoặc đến khi bé trèo ra khỏi cũi. Thường để muộn sẽ dễ hơn.',
      'Nỗi sợ giờ đi ngủ và chiêu câu giờ tăng quanh 2 tuổi. Hãy giữ thói quen vững vàng và ấm áp: đọc sách, hát, tắt đèn.',
    ],
    soothing: [
      'Ngôn ngữ đang bùng nổ, hãy tận dụng. "Mẹ thấy con đang rất bực. Con dùng lời nói cho mẹ biết được không?"',
      'Phạt đứng yên hiệu quả nhất từ 2 tuổi trở lên. Giữ ngắn: 1 phút cho mỗi tuổi (2 phút ở 2 tuổi).',
      'Trẻ nhỏ điều hòa cảm xúc nhờ cùng điều hòa với mẹ. Gương mặt bình tĩnh của mẹ thực sự làm dịu hệ thần kinh của bé.',
    ],
    health: [
      'Khám 2 tuổi: đánh giá phát triển toàn diện gồm ngôn ngữ, vận động, xã hội-cảm xúc và sàng lọc tự kỷ.',
      'Mốc ngôn ngữ: bé 2 tuổi nên có trên 50 từ và biết ghép 2 từ. Ít hơn cần được chuyển đến chuyên gia ngôn ngữ.',
      'Nha khoa: lần khám này có thể chụp X-quang răng đầu tiên. Đảm bảo đánh răng hai lần mỗi ngày với lượng kem đánh răng fluoride bằng hạt đậu.',
      'Vận động: WHO khuyến nghị ít nhất 180 phút vận động mỗi ngày ở tuổi này (kể cả chơi vận động).',
    ],
  },
  {
    week: 117,
    feeding: [
      'Giai đoạn "tại sao" cũng đến với đồ ăn. Hãy trả lời thật lòng: "Mình ăn rau vì rau giúp cơ thể khỏe mạnh."',
      'Hãy tự mình làm gương ăn đa dạng. Trẻ nhỏ chịu ảnh hưởng từ việc mẹ ăn nhiều hơn là lời mẹ nói.',
      'Nếu bữa ăn như chiến trường, hãy thử kiểu bày món cho cả nhà (ai tự lấy phần mình). Cho bé tự chủ giúp bé ăn tốt hơn.',
    ],
    sleep: [
      'Một số bé 117 tuần bắt đầu chống lại giấc ngủ trưa. Hãy cho bé "giờ yên tĩnh" (30-60 phút trong phòng) dù bé có ngủ hay không.',
      'Hoảng sợ ban đêm có thể bắt đầu quanh 2-3 tuổi. Khác với ác mộng: bé trông như thức nhưng thật ra không. Đừng đánh thức bé, hãy bình tĩnh và giữ bé an toàn.',
      'Cho bé đi ngủ sớm hơn nếu bé bỏ giấc trưa. Bé quá mệt ngủ không ngon và thức đêm nhiều hơn.',
    ],
    soothing: [
      'Trò chơi tưởng tượng rất phong phú lúc này. Chơi lại các tình huống ("em bé đang sợ") giúp bé xử lý cảm xúc một cách an toàn.',
      'Hậu quả hợp lý bắt đầu có tác dụng: "Con đẩy bạn, nên mình về khỏi buổi chơi nhé."',
      'Nếu cơn ăn vạ ngày càng lớn, hãy tìm nguyên nhân: đói, mệt, quá kích thích, hoặc căng thẳng khi chuyển hoạt động.',
    ],
    health: [
      'Tập bô: hầu hết trẻ biết dùng bô từ 2-3 tuổi. Áp lực và trừng phạt làm chậm quá trình, kiên nhẫn và khen ngợi mới hiệu quả.',
      'Thời gian xem màn hình: WHO khuyến nghị giới hạn 1 giờ mỗi ngày cho trẻ 2-5 tuổi. Chọn nội dung chất lượng và xem cùng bé.',
      'An toàn giao thông: luôn nắm tay bé gần đường. Hãy làm gương nhìn hai bên mỗi lần, bé đang quan sát đấy.',
      'Thính giác: nếu bé không làm theo hướng dẫn hoặc thường như không nghe mẹ nói, hãy xin kiểm tra thính lực.',
    ],
  },
  {
    week: 130,
    feeding: [
      'Cho bé tham gia lên thực đơn ("Mình ăn cà rốt hay đậu nhỉ?"). Cảm giác tự chủ giúp bé ăn ngon hơn.',
      'Ăn cùng cả nhà, dù chỉ một bữa mỗi ngày, là yếu tố dự báo mạnh nhất cho thói quen ăn uống lành mạnh lâu dài.',
      'Tránh ép "ăn sạch đĩa". Trẻ nhỏ có khả năng tự điều chỉnh cơn đói, hãy tôn trọng điều đó.',
    ],
    sleep: [
      'Một số bé 2,5 tuổi có thể sắp bỏ giấc trưa. Hãy thay bằng giờ yên tĩnh bắt buộc, vẫn giúp bé nghỉ ngơi.',
      'Tập không tã ban đêm thường bắt đầu quanh 2,5-3 tuổi. Dùng ga chống thấm. Chờ đến khi bé khô ráo ổn định cả lúc ngủ trưa.',
      'Giờ đi ngủ và giờ thức dậy đều đặn giúp hormone giấc ngủ ổn định hơn và ít cuộc chiến giờ đi ngủ hơn.',
    ],
    soothing: [
      'Cùng giải quyết vấn đề: "Con buồn vì tháp bị đổ. Mình làm gì được nhỉ?" Giúp bé tự điều chỉnh và kiên cường.',
      'Ghi nhận điều tốt: "Mẹ thấy con chia sẻ đồ chơi thật nhẹ nhàng." Sự chú ý tích cực mạnh hơn việc sửa lỗi.',
      'Hãy để ý phản ứng của chính mình khi mắc lỗi. Bé học cách mẹ xử lý bực bội.',
    ],
    health: [
      'Khám nha khoa hai lần mỗi năm. Một số trẻ cần trám bít hố rãnh, hãy hỏi nha sĩ.',
      'Chống nắng quanh năm: tia UV gây hại tích lũy. Đội mũ và bôi kem SPF 30+ trên mọi vùng da hở mỗi khi ra ngoài.',
      'Rửa tay: bắt buộc trước bữa ăn và sau khi đi vệ sinh. Rửa ít nhất 20 giây.',
      'Vệ sinh giấc ngủ: phòng ngủ chỉ để ngủ, hãy bỏ đồ chơi và màn hình ra khỏi nơi ngủ.',
    ],
  },
  {
    week: 143,
    feeding: [
      'Đến 143 tuần, bé có thể dùng dao nĩa khá tốt. Hãy để bé tự lấy đồ ăn, giúp bé tự lập và ăn ngon miệng.',
      'Cho món mới cùng với món quen thuộc bé thích. Món mới dễ được chấp nhận hơn khi bé thoải mái.',
      'Sinh tố và súp là cách hiệu quả để đưa rau vào bữa ăn nếu bé vẫn ngại kết cấu.',
    ],
    sleep: [
      'Nhiều bé 143 tuần bỏ giấc trưa hoặc ngủ không đều. Hãy cho bé đi ngủ lúc 6:30-7 tối vào những ngày không ngủ trưa.',
      'Nỗi sợ ban đêm khá phổ biến lúc này. Một nghi thức trấn an nhất quán ("Mẹ ghé thăm con, con an toàn rồi") hiệu quả hơn nói chuyện dài.',
      'Giữ phòng ngủ yên tĩnh, mát (18-20°C) và tối. Đèn ngủ nhỏ cũng được nếu giúp bé.',
    ],
    soothing: [
      'Ở tuổi này, "góc bình tĩnh" hiệu quả hơn phạt đứng yên: một góc ấm cúng có đồ mềm để bé đến khi quá tải.',
      'Dạy bé hít thở sâu: "Mình ngửi hoa (hít vào) và thổi nến (thở ra) nhé." Bé làm được đấy.',
      'Có thể sắp đến lúc bé đi mẫu giáo. Hãy nói về điều đó thật tích cực, đến thăm trường trước và đọc sách về việc đi học.',
    ],
    health: [
      'Sắp khám 3 tuổi: sàng lọc thị lực, thính lực, huyết áp và đánh giá phát triển.',
      'Vaccine mẫu giáo: hãy xem lịch tiêm cho các mũi nhắc DTaP, bại liệt, MMR và thủy đậu quanh 4-5 tuổi.',
      'Nha khoa: đánh răng hai lần mỗi ngày, khám hai lần mỗi năm, hạn chế đồ ăn vặt và đồ uống có đường.',
      'Vận động: trên 180 phút mỗi ngày, gồm ít nhất 60 phút chơi sôi nổi. Hạn chế ngồi liên tục quá 1 giờ.',
    ],
  },
  {
    week: 156,
    feeding: [
      'Đến 3 tuổi, hầu hết bé ăn được đồ ăn gia đình mà không cần chế biến riêng. Đây là mục tiêu và mẹ đã làm được rồi đó!',
      'Khuyến khích bé phụ bếp: khuấy, rót, rửa. Bé biết nấu sớm sẽ bớt kén ăn.',
      'Làm gương có mối quan hệ lành mạnh với đồ ăn. Tránh gọi món là "tốt" hay "xấu", hãy dùng "món ăn thường ngày" và "món thỉnh thoảng".',
    ],
    sleep: [
      'Hầu hết bé 3 tuổi ngủ 10-13 giờ. Lịch đều đặn quan trọng hơn số giờ chính xác.',
      'Nếu bé đã bỏ giấc ngủ trưa, hãy cho bé đi ngủ sớm hơn (6:30-7 tối) để tránh quá mệt.',
      'Ở 3 tuổi, bé hiểu được quy tắc ngủ đơn giản. Một "bảng thói quen đi ngủ" bằng hình ảnh giúp bé thấy mình làm chủ.',
    ],
    soothing: [
      'Bé 3 tuổi đã đủ ngôn ngữ để nói về cảm xúc. "Kể mẹ nghe chuyện gì đã xảy ra. Con cảm thấy thế nào?" rất hiệu quả.',
      'Vận động mỗi ngày quan trọng như giấc ngủ với tâm trạng của bé. Hãy cho bé chơi ngoài trời ít nhất 1 giờ.',
      'Mẹ đã làm điều này suốt 3 năm rồi. Hãy tin vào trực giác của mình, nó đã đưa mẹ đến đây.',
    ],
    health: [
      'Khám 3 tuổi: sàng lọc thị lực và thính lực, đánh giá phát triển và hành vi, huyết áp.',
      'Thị lực: 3 tuổi là độ tuổi để khám mắt chính thức trước khi vào mẫu giáo. Nhược thị ("mắt lười") có thể điều trị nếu phát hiện sớm.',
      'Nha khoa: bây giờ dùng kem đánh răng fluoride bằng hạt đậu (tăng từ vết quẹt). Khám hai lần mỗi năm. Giới hạn nước ép 120 ml mỗi ngày.',
      'Sẵn sàng đi mẫu giáo: đảm bảo bé tiêm đủ vaccine trước khi nhập học. Hãy xem yêu cầu của trường.',
    ],
  },
];

interface CareTipsEnrichment {
  weekRange: [number, number];
  tips: Partial<CareTips>;
}

const careTipsEnrichmentsVi: CareTipsEnrichment[] = [
  {
    weekRange: [0, 3],
    tips: {
      feeding: [
        'Những tuần đầu sơ sinh: cho bú theo nhu cầu, theo dõi số tã ướt, kiểu đi ngoài và xem bé có thức đủ để bú không.',
      ],
      sleep: [
        'Những tuần đầu sơ sinh: giấc ngủ chưa đều và thời gian thức rất ngắn. Hãy ưu tiên chỗ ngủ an toàn hơn bất kỳ lịch nào.',
      ],
    },
  },
  {
    weekRange: [0, 52],
    tips: {
      sleep: [
        'Chỗ ngủ an toàn: mỗi giấc ngủ đều bắt đầu với bé nằm ngửa, trên mặt phẳng cứng dành cho trẻ sơ sinh, không có chăn rời hay đồ vật mềm.',
        'Tránh khăn quấn có tạ, túi ngủ có tạ, nôi nghiêng, ghế sofa, ghế bành, và việc thường xuyên cho bé ngủ ở tư thế ngồi.',
      ],
    },
  },
  {
    weekRange: [4, 13],
    tips: {
      sleep: [
        'Ở tuần 4-13, thói quen đơn giản sẽ giúp ích, nhưng việc thức đêm bình thường và tiếng động khi ngủ chủ động vẫn là điều dễ gặp.',
      ],
      soothing: [
        'Ở tuần 4-13, giai đoạn khóc nhiều dần dịu đi. Cho bé nằm sấp chơi ngắn, thường xuyên, khi bé tỉnh và luôn có người trông.',
      ],
      health: [
        'Hãy nói với bác sĩ trong các lần khám nếu bé khó bú, nôn liên tục, có triệu chứng hô hấp, hoặc mẹ cảm thấy kiệt sức.',
      ],
    },
  },
  {
    weekRange: [14, 23],
    tips: {
      feeding: [
        'Trước khi ăn dặm, hãy tìm các dấu hiệu sẵn sàng: giữ đầu vững, ngồi có đỡ, thích thú với đồ ăn, và giảm phản xạ đẩy lưỡi.',
        'Tránh bắt đầu ăn dặm trước 16 tuần. Hầu hết bé sẵn sàng quanh 24 tuần trừ khi bác sĩ khuyên khác.',
      ],
      sleep: [
        'Ngừng quấn bé khi bé có dấu hiệu cố lật.',
      ],
    },
  },
  {
    weekRange: [17, 34],
    tips: {
      feeding: [
        'Ban đầu ăn dặm chỉ bổ sung cho sữa. Sữa mẹ hoặc sữa công thức vẫn là nguồn dinh dưỡng chính trong khi bé tập kỹ năng ăn và làm quen món mới.',
        'Cho bé làm quen các thực phẩm dễ gây dị ứng ở dạng an toàn cho trẻ nhỏ, từng loại một, khi bé đã sẵn sàng về mặt phát triển.',
        'Tránh các thức ăn dễ gây hóc như hạt nguyên, bơ đậu phộng đặc, thức ăn tròn cứng và miếng thịt to.',
      ],
    },
  },
  {
    weekRange: [24, 35],
    tips: {
      health: [
        'Trước khi bé vịn đứng: chắn cầu thang, khóa thuốc và hóa chất tẩy rửa, cố định dây rèm và neo đồ nội thất.',
      ],
    },
  },
  {
    weekRange: [44, 60],
    tips: {
      feeding: [
        'Quanh 1 tuổi, hãy hỏi bác sĩ khi đi khám về việc chuyển sang sữa bò, bổ sung sắt, xét nghiệm chì, thời điểm khám nha khoa và lịch tiêm chủng.',
        'Giữ nghiêm quy tắc phòng hóc: tránh hạt nguyên, thức ăn tròn cứng, bỏng ngô, miếng thịt to và bơ hạt đặc.',
      ],
      soothing: [
        'Quanh 1 tuổi, lo âu khi xa mẹ và ăn uống thất thường rất phổ biến. Thói quen ổn định quan trọng hơn việc ép buộc.',
      ],
    },
  },
  {
    weekRange: [61, 103],
    tips: {
      soothing: [
        'Đặt ranh giới cho bé: dùng câu ngắn, nhất quán và hướng bé sang điều bé có thể làm.',
        'Hãy đọc sách, kể chuyện, hát và gọi tên cảm xúc để hỗ trợ giao tiếp và điều hòa cảm xúc của bé.',
      ],
    },
  },
  {
    weekRange: [104, 156],
    tips: {
      soothing: [
        'Tập bô hiệu quả nhất khi bé có dấu hiệu sẵn sàng: khô ráo lâu hơn, nhận ra tã ướt hay bẩn, và thích thú với bô.',
        'Cho bé lựa chọn trong giới hạn để giảm tranh cãi mà vẫn giữ ranh giới vững vàng.',
      ],
    },
  },
  {
    weekRange: [4, 156],
    tips: {
      health: [
        'Dấu hiệu nguy hiểm khi bé ốm: hãy tìm trợ giúp khẩn cấp nếu bé khó thở, môi hoặc da tím hoặc xám, mềm nhũn, khó đánh thức, co giật, dị ứng nặng, ngộ độc hoặc có dấu hiệu mất nước.',
      ],
    },
  },
  {
    weekRange: [0, 156],
    tips: {
      health: [
        'Trước khi gọi bác sĩ khi bé ốm, hãy ghi lại: cách đo nhiệt độ, số tã ướt, cữ bú hoặc lượng nước uống, nhịp thở, phát ban, số lần nôn hoặc tiêu chảy, và hành vi của bé.',
      ],
    },
  },
];

const careTipsMapVi = new Map(careTipsDataVi.map(e => [e.week, e]));

function mergeEnrichments(baseTips: CareTips, week: number): CareTips {
  const enriched: CareTips = {
    feeding: [...baseTips.feeding],
    sleep: [...baseTips.sleep],
    soothing: [...baseTips.soothing],
    health: [...baseTips.health],
  };

  careTipsEnrichmentsVi
    .filter(({ weekRange }) => week >= weekRange[0] && week <= weekRange[1])
    .forEach(({ tips }) => {
      enriched.feeding.push(...(tips.feeding ?? []));
      enriched.sleep.push(...(tips.sleep ?? []));
      enriched.soothing.push(...(tips.soothing ?? []));
      enriched.health.push(...(tips.health ?? []));
    });

  return enriched;
}

export function getCareTipsVi(week: number): CareTips {
  const clamped = Math.min(week, 156);
  for (let w = clamped; w >= 0; w--) {
    const entry = careTipsMapVi.get(w);
    if (entry) {
      const { feeding, sleep, soothing, health } = entry;
      return mergeEnrichments({ feeding, sleep, soothing, health }, clamped);
    }
  }
  const { feeding, sleep, soothing, health } = careTipsDataVi[0];
  return mergeEnrichments({ feeding, sleep, soothing, health }, clamped);
}

export function getSoothingLabelVi(week: number): string {
  if (week >= 104) return 'Tâm trạng';
  if (week >= 52) return 'Ổn định';
  return 'Dỗ bé';
}
