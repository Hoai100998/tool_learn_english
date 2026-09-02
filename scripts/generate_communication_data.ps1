param([string]$DataDir = (Join-Path $PSScriptRoot '..\data'))

$ErrorActionPreference = 'Stop'
$utf8 = [Text.UTF8Encoding]::new($false)

$phrasePatterns = @(
    @('{a}', '{v}'), @('please {a}', 'vui lòng {v}'), @('{a} now', '{v} ngay bây giờ'),
    @('{a} today', '{v} hôm nay'), @('{a} again', '{v} lại'), @('{a} carefully', '{v} cẩn thận'),
    @('{a} before lunch', '{v} trước giờ ăn trưa'), @('{a} after the meeting', '{v} sau cuộc họp'),
    @('{a} this morning', '{v} sáng nay'), @('{a} as soon as possible', '{v} sớm nhất có thể'),
    @('need to {a}', 'cần {v}'), @('want to {a}', 'muốn {v}'), @('remember to {a}', 'nhớ {v}'),
    @("don't forget to {a}", 'đừng quên {v}'), @('help me {a}', 'giúp tôi {v}'),
    @("let's {a}", 'hãy cùng {v}'), @('ready to {a}', 'sẵn sàng {v}'),
    @('time to {a}', 'đến lúc {v}'), @('plan to {a}', 'dự định {v}'), @('trying to {a}', 'đang cố {v}')
)

$sentencePatterns = @(
    @('I need to {a}.', 'Tôi cần {v}.'), @('I would like to {a}.', 'Tôi muốn {v}.'),
    @('Can you {a}, please?', 'Bạn có thể {v} không?'), @('Could you help me {a}?', 'Bạn có thể giúp tôi {v} không?'),
    @("Let's {a} now.", 'Chúng ta hãy {v} ngay bây giờ.'), @('We should {a} today.', 'Chúng ta nên {v} hôm nay.'),
    @("Please don't forget to {a}.", 'Vui lòng đừng quên {v}.'), @('Do I need to {a}?', 'Tôi có cần {v} không?'),
    @('When can we {a}?', 'Khi nào chúng ta có thể {v}?'), @('Who can help me {a}?', 'Ai có thể giúp tôi {v}?'),
    @('I am ready to {a}.', 'Tôi đã sẵn sàng {v}.'), @('I am trying to {a}.', 'Tôi đang cố {v}.'),
    @('We have enough time to {a}.', 'Chúng ta có đủ thời gian để {v}.'),
    @('It is important to {a}.', 'Việc {v} rất quan trọng.'),
    @('Would you be able to {a} with me?', 'Bạn có thể cùng tôi {v} không?'),
    @('I will {a} after lunch.', 'Tôi sẽ {v} sau giờ ăn trưa.'),
    @('We can {a} before the meeting.', 'Chúng ta có thể {v} trước cuộc họp.'),
    @('I forgot to {a} yesterday.', 'Hôm qua tôi đã quên {v}.'),
    @('Please show me how to {a}.', 'Vui lòng chỉ cho tôi cách {v}.'),
    @('Is it possible to {a} today?', 'Hôm nay có thể {v} được không?')
)

# Each group defines five natural verb-object actions. Ten groups per level = 50
# actions; 50 actions x 20 controlled patterns = 1,000 items of each type.
$groups = @{
  A1 = @(
    @('Hằng ngày','buy','mua',@('some food|một ít thức ăn','a bottle of water|một chai nước','a bus ticket|một vé xe buýt','a phone card|một thẻ điện thoại','a new shirt|một chiếc áo mới')),
    @('Hằng ngày','make','làm',@('breakfast|bữa sáng','some coffee|một ít cà phê','a shopping list|danh sách mua sắm','a phone call|một cuộc gọi','an appointment|một cuộc hẹn')),
    @('Đi lại','find','tìm',@('the bus stop|trạm xe buýt','the train station|ga tàu','a taxi|một chiếc taxi','the right address|đúng địa chỉ','a parking space|chỗ đỗ xe')),
    @('Mua sắm','check','kiểm tra',@('the price|giá tiền','the size|kích cỡ','the receipt|hóa đơn','the opening hours|giờ mở cửa','my change|tiền thừa của tôi')),
    @('Ăn uống','order','gọi',@('lunch|bữa trưa','a cup of tea|một tách trà','the daily special|món đặc biệt trong ngày','a vegetarian meal|một phần ăn chay','dessert|món tráng miệng')),
    @('Gia đình','clean','dọn',@('the kitchen|nhà bếp','my room|phòng của tôi','the table|cái bàn','the bathroom|phòng tắm','the living room|phòng khách')),
    @('Giao tiếp','call','gọi',@('my family|gia đình tôi','the doctor|bác sĩ','a friend|một người bạn','the hotel|khách sạn','customer service|bộ phận chăm sóc khách hàng')),
    @('Văn phòng','open','mở',@('the email|email','the document|tài liệu','the meeting room|phòng họp','the calendar|lịch','the office door|cửa văn phòng')),
    @('Dịch vụ','ask for','hỏi xin',@('some help|sự giúp đỡ','the menu|thực đơn','directions|chỉ đường','a receipt|hóa đơn','more information|thêm thông tin')),
    @('Hằng ngày','bring','mang',@('my ID card|thẻ căn cước của tôi','an umbrella|một chiếc ô','the keys|chìa khóa','my laptop|máy tính xách tay của tôi','some cash|một ít tiền mặt'))
  )
  A2 = @(
    @('Mua sắm','compare','so sánh',@('the two prices|hai mức giá','these products|những sản phẩm này','the available sizes|các kích cỡ có sẵn','the delivery options|các lựa chọn giao hàng','the customer reviews|các đánh giá của khách hàng')),
    @('Văn phòng','prepare','chuẩn bị',@('the meeting room|phòng họp','a short presentation|một bài thuyết trình ngắn','the weekly report|báo cáo tuần','the visitor list|danh sách khách','the printed documents|các tài liệu đã in')),
    @('Công việc','confirm','xác nhận',@('the appointment|cuộc hẹn','the delivery date|ngày giao hàng','my work schedule|lịch làm việc của tôi','the booking details|thông tin đặt chỗ','the final price|giá cuối cùng')),
    @('Dịch vụ','change','thay đổi',@('the reservation|đặt chỗ','my password|mật khẩu của tôi','the delivery address|địa chỉ giao hàng','the meeting time|thời gian họp','the payment method|phương thức thanh toán')),
    @('Đi lại','book','đặt',@('a hotel room|một phòng khách sạn','a return ticket|vé khứ hồi','an airport taxi|taxi ra sân bay','a window seat|ghế cạnh cửa sổ','a guided tour|chuyến tham quan có hướng dẫn')),
    @('Văn phòng','send','gửi',@('the updated file|tệp đã cập nhật','a calendar invitation|lời mời trên lịch','the signed contract|hợp đồng đã ký','a reminder email|email nhắc nhở','the meeting notes|ghi chú cuộc họp')),
    @('Ăn uống','reserve','đặt trước',@('a table for two|bàn cho hai người','a quiet table|một bàn yên tĩnh','a private room|phòng riêng','a table near the window|bàn gần cửa sổ','seats for the whole team|chỗ cho cả nhóm')),
    @('Công việc','update','cập nhật',@('my contact details|thông tin liên hệ của tôi','the task list|danh sách công việc','the project calendar|lịch dự án','the customer record|hồ sơ khách hàng','the shared spreadsheet|bảng tính dùng chung')),
    @('Dịch vụ','return','trả lại',@('the damaged product|sản phẩm bị hỏng','the library book|sách thư viện','the rental car|xe thuê','the borrowed equipment|thiết bị đã mượn','the incorrect order|đơn hàng bị sai')),
    @('Giao tiếp','explain','giải thích',@('the problem|vấn đề','the new process|quy trình mới','my request|yêu cầu của tôi','the payment issue|vấn đề thanh toán','the reason for the delay|lý do chậm trễ'))
  )
  B1 = @(
    @('Văn phòng','review','xem xét',@('the project proposal|đề xuất dự án','the monthly budget|ngân sách tháng','the meeting agenda|chương trình họp','the customer feedback|phản hồi khách hàng','the safety guidelines|hướng dẫn an toàn')),
    @('Công việc','schedule','lên lịch',@('a follow-up meeting|cuộc họp tiếp theo','the training session|buổi đào tạo','a performance review|buổi đánh giá hiệu suất','the product demonstration|buổi giới thiệu sản phẩm','a team discussion|buổi thảo luận nhóm')),
    @('Công việc','resolve','giải quyết',@('the delivery problem|vấn đề giao hàng','a billing error|lỗi hóa đơn','the customer complaint|khiếu nại của khách hàng','the scheduling conflict|xung đột lịch trình','the technical issue|sự cố kỹ thuật')),
    @('Văn phòng','organize','sắp xếp',@('the shared drive|ổ đĩa dùng chung','the client files|hồ sơ khách hàng','the office supplies|vật tư văn phòng','the training materials|tài liệu đào tạo','the project folders|các thư mục dự án')),
    @('Giao tiếp','discuss','thảo luận',@('the next steps|các bước tiếp theo','our main priorities|các ưu tiên chính','the proposed changes|những thay đổi được đề xuất','the customer requirements|yêu cầu của khách hàng','the possible solutions|các giải pháp khả thi')),
    @('Công việc','submit','nộp',@('the expense report|báo cáo chi phí','a leave request|đơn xin nghỉ','the completed form|biểu mẫu đã hoàn thành','the final draft|bản nháp cuối','the travel documents|giấy tờ công tác')),
    @('Mua sắm','request','yêu cầu',@('a full refund|hoàn tiền đầy đủ','a replacement item|sản phẩm thay thế','an official invoice|hóa đơn chính thức','express delivery|giao hàng nhanh','a product demonstration|buổi giới thiệu sản phẩm')),
    @('Công việc','coordinate','phối hợp',@('the delivery schedule|lịch giao hàng','the team workload|khối lượng công việc của nhóm','the office move|việc chuyển văn phòng','the client visit|chuyến thăm khách hàng','the recruitment process|quy trình tuyển dụng')),
    @('Dịch vụ','investigate','điều tra',@('the missing payment|khoản thanh toán bị thiếu','the damaged package|bưu kiện bị hỏng','the system error|lỗi hệ thống','the unusual charge|khoản phí bất thường','the service interruption|việc gián đoạn dịch vụ')),
    @('Văn phòng','summarize','tóm tắt',@('the meeting outcomes|kết quả cuộc họp','the survey results|kết quả khảo sát','the project status|tình trạng dự án','the main concerns|những mối quan tâm chính','the customer requests|các yêu cầu của khách hàng'))
  )
  B2 = @(
    @('Quản lý','evaluate','đánh giá',@('the proposed solution|giải pháp được đề xuất','the operational risks|rủi ro vận hành','the supplier performance|hiệu suất nhà cung cấp','the long-term impact|tác động dài hạn','the available alternatives|các phương án thay thế')),
    @('Quản lý','negotiate','đàm phán',@('the contract terms|các điều khoản hợp đồng','a better delivery schedule|lịch giao hàng tốt hơn','the annual service fee|phí dịch vụ hằng năm','a volume discount|chiết khấu theo số lượng','the project scope|phạm vi dự án')),
    @('Văn phòng','clarify','làm rõ',@('the reporting requirements|yêu cầu báo cáo','the division of responsibilities|phân chia trách nhiệm','the approval process|quy trình phê duyệt','the expected outcome|kết quả mong đợi','the revised deadline|hạn chót đã điều chỉnh')),
    @('Quản lý','prioritize','ưu tiên',@('the urgent requests|các yêu cầu khẩn cấp','the highest-value tasks|công việc có giá trị cao nhất','the customer concerns|mối quan tâm của khách hàng','the critical system updates|các bản cập nhật hệ thống quan trọng','the outstanding payments|các khoản thanh toán tồn đọng')),
    @('Công việc','streamline','tinh gọn',@('the approval workflow|quy trình phê duyệt','the onboarding process|quy trình hội nhập nhân viên','the monthly reporting cycle|chu kỳ báo cáo tháng','the inventory procedure|quy trình tồn kho','the customer support process|quy trình hỗ trợ khách hàng')),
    @('Giao tiếp','address','giải quyết',@('the underlying concern|mối lo ngại cốt lõi','the decline in sales|sự sụt giảm doanh số','the communication gap|khoảng cách giao tiếp','the recurring complaint|khiếu nại lặp lại','the shortage of staff|tình trạng thiếu nhân sự')),
    @('Quản lý','allocate','phân bổ',@('the available budget|ngân sách hiện có','the additional resources|nguồn lực bổ sung','the team responsibilities|trách nhiệm của nhóm','the remaining office space|diện tích văn phòng còn lại','the training funds|ngân sách đào tạo')),
    @('Công việc','implement','triển khai',@('the revised policy|chính sách đã sửa đổi','the security measures|các biện pháp bảo mật','the customer retention plan|kế hoạch giữ chân khách hàng','the quality controls|các biện pháp kiểm soát chất lượng','the new filing system|hệ thống lưu hồ sơ mới')),
    @('Phân tích','analyze','phân tích',@('the purchasing trends|xu hướng mua sắm','the quarterly figures|số liệu quý','the survey responses|phản hồi khảo sát','the productivity data|dữ liệu năng suất','the causes of the delay|nguyên nhân chậm trễ')),
    @('Quản lý','justify','giải trình',@('the additional expense|chi phí bổ sung','the proposed investment|khoản đầu tư đề xuất','the change in strategy|thay đổi chiến lược','the extended timeline|tiến độ kéo dài','the choice of supplier|việc lựa chọn nhà cung cấp'))
  )
  C1 = @(
    @('Chiến lược','anticipate','dự liệu',@('the potential objections|các phản đối tiềm ẩn','the broader implications|các hệ quả rộng hơn','the shift in demand|sự thay đổi nhu cầu','the regulatory changes|các thay đổi quy định','the operational constraints|các hạn chế vận hành')),
    @('Chiến lược','formulate','xây dựng',@('a coherent response|phản hồi mạch lạc','a contingency strategy|chiến lược dự phòng','the long-term vision|tầm nhìn dài hạn','a persuasive business case|luận chứng kinh doanh thuyết phục','a balanced recommendation|khuyến nghị cân bằng')),
    @('Quản lý','reconcile','dung hòa',@('the competing priorities|các ưu tiên cạnh tranh','the conflicting accounts|các báo cáo mâu thuẫn','the budget with our ambitions|ngân sách với tham vọng','the short-term and long-term goals|mục tiêu ngắn hạn và dài hạn','the stakeholder expectations|kỳ vọng của các bên liên quan')),
    @('Giao tiếp','articulate','trình bày rõ',@('the strategic rationale|cơ sở chiến lược','our position on the matter|quan điểm của chúng ta về vấn đề','the value proposition|đề xuất giá trị','the principal concerns|các mối quan tâm chính','the intended outcomes|các kết quả dự kiến')),
    @('Phân tích','scrutinize','xem xét kỹ',@('the underlying assumptions|các giả định nền tảng','the contractual obligations|nghĩa vụ hợp đồng','the projected returns|lợi nhuận dự kiến','the methodological limitations|hạn chế phương pháp','the supplier credentials|năng lực của nhà cung cấp')),
    @('Quản lý','mitigate','giảm thiểu',@('the reputational risk|rủi ro danh tiếng','the adverse consequences|hậu quả bất lợi','the disruption to operations|gián đoạn hoạt động','the exposure to fraud|nguy cơ gian lận','the impact on employees|tác động lên nhân viên')),
    @('Chiến lược','consolidate','củng cố',@('our market position|vị thế thị trường','the preliminary findings|các phát hiện ban đầu','the regional operations|hoạt động khu vực','the fragmented processes|các quy trình phân mảnh','the existing partnerships|các quan hệ đối tác hiện có')),
    @('Quản lý','substantiate','chứng minh',@('the projected savings|khoản tiết kiệm dự kiến','the allegations|các cáo buộc','the need for reform|nhu cầu cải tổ','the proposed valuation|mức định giá đề xuất','the reported improvement|mức cải thiện được báo cáo')),
    @('Chiến lược','facilitate','tạo điều kiện cho',@('a constructive dialogue|đối thoại mang tính xây dựng','the transfer of knowledge|việc chuyển giao kiến thức','a smooth transition|quá trình chuyển đổi suôn sẻ','cross-functional collaboration|hợp tác liên chức năng','an informed decision|quyết định có đầy đủ thông tin')),
    @('Quản lý','reassess','đánh giá lại',@('the strategic direction|định hướng chiến lược','the allocation of resources|việc phân bổ nguồn lực','the viability of the proposal|tính khả thi của đề xuất','the organization structure|cơ cấu tổ chức','the criteria for success|tiêu chí thành công'))
  )
}

function Expand-Text([string]$pattern, $action) {
    return $pattern.Replace('{a}', $action.en).Replace('{v}', $action.vi)
}

foreach ($level in @('A1','A2','B1','B2','C1')) {
    $path = Join-Path $DataDir "data_$level.json"
    $parsed = Get-Content -Raw -Encoding UTF8 -LiteralPath $path | ConvertFrom-Json
    # Windows PowerShell 5 may preserve a piped JSON array as a wrapper object.
    # Accept that shape so a rerun can repair an interrupted/legacy generation.
    if ($parsed.Count -gt 0 -and $parsed[0].PSObject.Properties['value'] -and $parsed[0].value -is [array]) {
        $sourceItems = $parsed[0].value
    } else {
        $sourceItems = $parsed
    }
    $existing = [System.Collections.Generic.List[object]]::new()
    foreach ($sourceItem in $sourceItems) {
        if ($sourceItem.type -eq 'word' -or $sourceItem.source -eq 'curated_everyday_work_pack') { $existing.Add($sourceItem) }
    }
    $actions = [System.Collections.Generic.List[object]]::new()
    foreach ($group in $groups[$level]) {
        foreach ($pair in $group[3]) {
            $parts = $pair -split '\|', 2
            $actions.Add([pscustomobject]@{ category=$group[0]; en=($group[1] + ' ' + $parts[0]); vi=($group[2] + ' ' + $parts[1]) })
        }
    }
    if ($actions.Count -ne 50) { throw "$level must define exactly 50 actions; got $($actions.Count)." }

    $items = [System.Collections.Generic.List[object]]::new()
    foreach ($item in $existing) { $items.Add($item) }
    $phraseIndex = 0
    $sentenceIndex = 0
    foreach ($action in $actions) {
        foreach ($pattern in $phrasePatterns) {
            $phraseIndex++
            $english = Expand-Text $pattern[0] $action
            $vietnamese = Expand-Text $pattern[1] $action
            $items.Add([pscustomobject][ordered]@{
                id = ('{0}_P_{1:D4}' -f $level,$phraseIndex); level=$level; type='phrase'; category=$action.category
                english=$english; ipa=''; vietnamese=$vietnamese; part_of_speech='communication phrase'
                hint=('Chủ đề: ' + $action.category); example=('Please ' + $action.en + '.')
                example_vi=('Vui lòng ' + $action.vi + '.')
            })
        }
        foreach ($pattern in $sentencePatterns) {
            $sentenceIndex++
            $english = Expand-Text $pattern[0] $action
            $vietnamese = Expand-Text $pattern[1] $action
            $items.Add([pscustomobject][ordered]@{
                id = ('{0}_S_{1:D4}' -f $level,$sentenceIndex); level=$level; type='sentence'; category=$action.category
                english=$english; ipa=''; vietnamese=$vietnamese; part_of_speech='communication sentence'
                hint=('Tình huống: ' + $action.category); example=$english; example_vi=$vietnamese
            })
        }
    }
    if ($phraseIndex -ne 1000 -or $sentenceIndex -ne 1000) { throw "Unexpected item count for $level." }
    $json = $items | ConvertTo-Json -Depth 6
    [IO.File]::WriteAllText($path, $json, $utf8)
    $wordCount = @($existing | Where-Object { $_.type -eq 'word' }).Count
    $curatedCount = @($existing | Where-Object { $_.source -eq 'curated_everyday_work_pack' }).Count
    Write-Output "${level}: $wordCount words + $phraseIndex generated phrases + $sentenceIndex generated sentences + $curatedCount curated items"
}
