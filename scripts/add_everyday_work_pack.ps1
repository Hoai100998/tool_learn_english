param([string]$DataDir = (Join-Path $PSScriptRoot '..\data'))

$ErrorActionPreference = 'Stop'
$utf8 = [Text.UTF8Encoding]::new($false)

$phrases = @(
  'good morning|chào buổi sáng|Chào hỏi','good afternoon|chào buổi chiều|Chào hỏi','good evening|chào buổi tối|Chào hỏi',
  'nice to meet you|rất vui được gặp bạn|Làm quen','nice to see you again|rất vui được gặp lại bạn|Làm quen',
  'what is your name|bạn tên là gì|Làm quen','my name is|tên tôi là|Làm quen','where are you from|bạn đến từ đâu|Làm quen',
  'I am from Vietnam|tôi đến từ Việt Nam|Làm quen','this is my friend|đây là bạn của tôi|Làm quen',
  'how are you|bạn khỏe không|Hỏi thăm','I am doing well|tôi vẫn khỏe|Hỏi thăm','not bad, thanks|không tệ, cảm ơn|Hỏi thăm',
  'see you tomorrow|hẹn gặp bạn ngày mai|Chào hỏi','have a nice day|chúc bạn một ngày tốt lành|Chào hỏi',
  'take care|giữ gìn sức khỏe nhé|Chào hỏi','welcome to the team|chào mừng bạn đến với nhóm|Đi làm',
  'my new colleague|đồng nghiệp mới của tôi|Đi làm','the first day at work|ngày đầu tiên đi làm|Đi làm',
  'on the way to work|trên đường đi làm|Đi làm','at the office|tại văn phòng|Văn phòng','at my desk|tại bàn làm việc của tôi|Văn phòng',
  'start work|bắt đầu làm việc|Đi làm','finish work|kết thúc công việc|Đi làm','take a short break|nghỉ giải lao một lát|Đi làm',
  'lunch break|giờ nghỉ trưa|Đi làm','after work|sau giờ làm|Đi làm','busy right now|hiện giờ đang bận|Văn phòng',
  'free this afternoon|rảnh chiều nay|Văn phòng','ready for the meeting|sẵn sàng cho cuộc họp|Văn phòng',
  'a quick question|một câu hỏi nhanh|Văn phòng','need some help|cần một chút giúp đỡ|Văn phòng',
  'no problem|không vấn đề gì|Giao tiếp','of course|tất nhiên|Giao tiếp','just a moment|chờ một chút|Giao tiếp',
  'thank you for your help|cảm ơn bạn đã giúp đỡ|Giao tiếp','you are welcome|không có gì|Giao tiếp',
  'sorry I am late|xin lỗi tôi đến muộn|Đi làm','see you at work|hẹn gặp bạn ở chỗ làm|Đi làm',
  'have a good weekend|chúc bạn cuối tuần vui vẻ|Chào hỏi'
)

$sentences = @(
  'Hello, my name is Minh.|Xin chào, tôi tên là Minh.|Làm quen',
  'What should I call you?|Tôi nên gọi bạn là gì?|Làm quen',
  'It is nice to meet you.|Rất vui được gặp bạn.|Làm quen',
  'Where are you from?|Bạn đến từ đâu?|Làm quen',
  'I am from Vietnam.|Tôi đến từ Việt Nam.|Làm quen',
  'How long have you lived here?|Bạn đã sống ở đây bao lâu rồi?|Làm quen',
  'What do you do for work?|Bạn làm công việc gì?|Làm quen',
  'I work in an office.|Tôi làm việc tại một văn phòng.|Làm quen',
  'This is my first day here.|Hôm nay là ngày đầu tiên của tôi ở đây.|Đi làm',
  'I am happy to join the team.|Tôi rất vui được tham gia nhóm.|Đi làm',
  'Could you show me around the office?|Bạn có thể dẫn tôi xem quanh văn phòng không?|Văn phòng',
  'Where is the meeting room?|Phòng họp ở đâu?|Văn phòng',
  'Where can I put my bag?|Tôi có thể để túi ở đâu?|Văn phòng',
  'What time do we start work?|Chúng ta bắt đầu làm việc lúc mấy giờ?|Đi làm',
  'What time do we finish today?|Hôm nay chúng ta kết thúc lúc mấy giờ?|Đi làm',
  'I usually go to work by bus.|Tôi thường đi làm bằng xe buýt.|Đi làm',
  'The traffic was heavy this morning.|Sáng nay giao thông rất đông.|Đi làm',
  'Sorry, I am a few minutes late.|Xin lỗi, tôi đến muộn vài phút.|Đi làm',
  'I am working from home today.|Hôm nay tôi làm việc tại nhà.|Đi làm',
  'I have a meeting at ten.|Tôi có một cuộc họp lúc mười giờ.|Văn phòng',
  'Could you send me the file?|Bạn có thể gửi tệp cho tôi không?|Văn phòng',
  'Please check your email.|Vui lòng kiểm tra email của bạn.|Văn phòng',
  'I will reply this afternoon.|Tôi sẽ trả lời vào chiều nay.|Văn phòng',
  'Can I ask you a quick question?|Tôi có thể hỏi bạn một câu nhanh không?|Văn phòng',
  'Could you help me with this task?|Bạn có thể giúp tôi việc này không?|Văn phòng',
  'I do not understand this part.|Tôi không hiểu phần này.|Văn phòng',
  'Could you explain it again?|Bạn có thể giải thích lại không?|Văn phòng',
  'Let us take a short break.|Chúng ta nghỉ giải lao một lát nhé.|Đi làm',
  'Would you like to have lunch together?|Bạn có muốn ăn trưa cùng nhau không?|Đi làm',
  'Where do you usually have lunch?|Bạn thường ăn trưa ở đâu?|Đi làm',
  'I brought lunch from home.|Tôi mang cơm trưa từ nhà.|Đi làm',
  'The coffee is in the kitchen.|Cà phê ở trong nhà bếp.|Văn phòng',
  'I am busy right now.|Hiện giờ tôi đang bận.|Văn phòng',
  'I will be free after three.|Tôi sẽ rảnh sau ba giờ.|Văn phòng',
  'Can we talk after the meeting?|Chúng ta có thể nói chuyện sau cuộc họp không?|Văn phòng',
  'I have finished my work for today.|Tôi đã hoàn thành công việc hôm nay.|Đi làm',
  'I am going home now.|Bây giờ tôi về nhà.|Đời sống hằng ngày',
  'See you at the office tomorrow.|Hẹn gặp bạn tại văn phòng ngày mai.|Đi làm',
  'Thank you for helping me today.|Cảm ơn bạn đã giúp tôi hôm nay.|Giao tiếp',
  'Have a good evening and see you tomorrow.|Chúc bạn buổi tối vui vẻ và hẹn gặp lại ngày mai.|Chào hỏi'
)

function Convert-PackItem([string]$row, [string]$type, [int]$index) {
    $parts = $row -split '\|', 3
    $level = if ($index -le 25) { 'A1' } else { 'A2' }
    $prefix = if ($type -eq 'phrase') { 'P' } else { 'S' }
    $english = $parts[0]
    $vietnamese = $parts[1]
    return [pscustomobject][ordered]@{
      id = ('{0}_E_{1}_{2:D3}' -f $level,$prefix,$index); level=$level; type=$type; category=$parts[2]
      english=$english; ipa=''; vietnamese=$vietnamese
      part_of_speech=$(if($type -eq 'phrase'){'communication phrase'}else{'communication sentence'})
      hint=('Tình huống: ' + $parts[2]); example=$(if($type -eq 'phrase'){($english.TrimEnd('.?!') + '.')}else{$english})
      example_vi=$(if($type -eq 'phrase'){($vietnamese.TrimEnd('.?!') + '.')}else{$vietnamese})
      source='curated_everyday_work_pack'
    }
}

$packByLevel = @{ A1=[System.Collections.Generic.List[object]]::new(); A2=[System.Collections.Generic.List[object]]::new() }
$index=0;foreach($row in $phrases){$index++;$item=Convert-PackItem $row 'phrase' $index;$packByLevel[$item.level].Add($item)}
$index=0;foreach($row in $sentences){$index++;$item=Convert-PackItem $row 'sentence' $index;$packByLevel[$item.level].Add($item)}

foreach($level in @('A1','A2')) {
    $jsonPath=Join-Path $DataDir "data_$level.json"
    $parsed=Get-Content -Raw -Encoding UTF8 -LiteralPath $jsonPath|ConvertFrom-Json
    $merged=[System.Collections.Generic.List[object]]::new();foreach($item in $parsed){if($item.source -ne 'curated_everyday_work_pack'){$merged.Add($item)}};foreach($item in $packByLevel[$level]){$merged.Add($item)}
    $json=$merged|ConvertTo-Json -Depth 8
    [IO.File]::WriteAllText($jsonPath,$json,$utf8)
    [IO.File]::WriteAllText((Join-Path $DataDir "data_$level.js"),"window.DATA_$level = $json;",$utf8)
    Write-Output "$level added $($packByLevel[$level].Count) curated everyday/work items; total $($merged.Count)."
}
