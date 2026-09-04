# DictaLearn

DictaLearn là ứng dụng web học tiếng Anh chạy trên máy cá nhân, tập trung vào luyện nghe – chép chính tả, luyện nói và ôn tập từ vựng. App không cần cài cơ sở dữ liệu và có thể chạy trên Windows hoặc macOS.

## Tính năng chính

- Luyện nghe và chép chính tả theo từ, cụm từ hoặc câu.
- Học theo các nhóm trình độ A1 đến C1.
- Phát âm tiếng Anh với nhiều tốc độ và giọng đọc.
- Luyện nói bằng tính năng nhận diện giọng nói của trình duyệt.
- So sánh câu trả lời và chỉ ra từ đúng, sai hoặc còn thiếu.
- Tự động đưa nội dung đã học vào Kho ôn tập.
- Ôn tập ngắt quãng theo thuật toán SRS.
- Theo dõi chuỗi ngày học và lộ trình học trong 30 ngày.
- Sao lưu và khôi phục tiến độ bằng file JSON.
- Giao diện sáng/tối, hỗ trợ máy tính và điện thoại.

## Yêu cầu

- Google Chrome hoặc Microsoft Edge phiên bản mới nhất.
- Cho phép trình duyệt sử dụng microphone nếu muốn luyện nói.
- Python 3 chỉ cần thiết khi chạy app trên macOS theo hướng dẫn bên dưới.

> Nên mở app qua `http://localhost:5500/index.html`. Không nên nhấp đúp vào `index.html` để mở bằng địa chỉ `file://`, vì trình duyệt có thể chặn dữ liệu, microphone và một số tính năng khác.

## Chạy trên Windows

### Cách đơn giản nhất

1. Tải hoặc clone mã nguồn về máy.
2. Mở thư mục `tool_learn_english`.
3. Nhấp đúp vào file `run_app.bat`.
4. Giữ cửa sổ server mở trong khi học.
5. App sẽ tự mở tại <http://localhost:5500/index.html>.

Nếu trình duyệt không tự mở, hãy nhập địa chỉ trên vào Chrome hoặc Edge.

### Chạy bằng PowerShell

Mở PowerShell trong thư mục dự án và chạy:

cd "I:\duong-dan-den\tool_learn_english"
powershell -NoProfile -ExecutionPolicy Bypass -File .\server.ps1

Sau đó truy cập <http://localhost:5500/index.html>. Để dừng server, đóng cửa sổ PowerShell.

## Chạy trên MacBook (macOS)

File `run_app.bat` và `server.ps1` dành cho Windows nên không chạy trực tiếp trên macOS. Trên MacBook, hãy dùng HTTP server có sẵn trong Python 3.

> **Lưu ý:** MacBook cần có Python 3 để chạy app theo hướng dẫn này. Nếu máy chưa có Python 3, hãy cài đặt trước rồi mới tiếp tục các bước bên dưới.

Kiểm tra Python 3 bằng lệnh:

python3 --version

- Nếu Terminal hiện phiên bản như `Python 3.x.x`, máy đã sẵn sàng và không cần cài thêm.
- Nếu Terminal báo `command not found`, hãy tải và cài Python 3 từ <https://www.python.org/downloads/macos/>. Sau khi cài xong, đóng và mở lại Terminal rồi kiểm tra lại phiên bản.

1. Mở ứng dụng **Terminal**.
2. Di chuyển đến thư mục dự án. Nếu đường dẫn có khoảng trắng, cần đặt đường dẫn trong dấu ngoặc kép:

cd "/duong-dan-den/tool_learn_english"

3. Khởi động server:

python3 -m http.server 5500

4. Mở Chrome và truy cập:

http://localhost:5500/index.html

5. Khi học xong, quay lại Terminal và nhấn `Control + C` để dừng server.

> Safari có thể phát âm thanh nhưng tính năng nhận diện giọng nói có thể không ổn định. Google Chrome được khuyến nghị cho tính năng luyện nói.

## Tiến độ học được lưu như thế nào?

App tự động lưu tiến độ trong `localStorage` của trình duyệt sau khi bạn học. Bạn không cần bấm nút lưu sau mỗi câu.

Dữ liệu được lưu gồm:

- Các từ, cụm từ và câu đã học.
- Số lần luyện tập và tỷ lệ chính xác.
- Kho ôn tập và lịch ôn SRS.
- Nội dung đã thành thạo hoặc cần học lại.
- Nghĩa tiếng Việt do người học chỉnh sửa.
- Chuỗi ngày học và tiến độ lộ trình 30 ngày.
- Một số thiết lập giao diện.

Dữ liệu `localStorage` chỉ nằm trên máy và hồ sơ trình duyệt đang sử dụng. Tiến độ không tự động đồng bộ qua tài khoản GitHub, Google hoặc giữa nhiều máy.

Để app nhìn thấy đúng tiến độ cũ, nên luôn sử dụng:

- Cùng một trình duyệt và cùng hồ sơ người dùng.
- Cùng địa chỉ `http://localhost:5500`.
- Không dùng chế độ ẩn danh.
- Không xóa dữ liệu trang web hoặc dữ liệu trình duyệt của localhost.

Nếu đổi cổng, ví dụ từ `5500` sang `8000`, trình duyệt sẽ xem đó là một địa chỉ khác và tiến độ cũ sẽ không xuất hiện.

## Sao lưu tiến độ

Có hai cách xuất file tiến độ:

### Cách 1: Nút **Lưu tiến độ học**

Nút lớn **Lưu tiến độ học** ở khu vực mục tiêu hằng ngày tạo hoặc cập nhật file `dictalearn_progress.json` trên máy.

File này chứa đầy đủ:

- Tiến độ học và dữ liệu SRS.
- Lộ trình 30 ngày.
- Tiến độ của ngày hiện tại.
- Lịch sử các ngày đã hoàn thành.

Đây là file nên dùng để sao lưu định kỳ và chuyển tiến độ sang máy khác. Lần đầu lưu, trình duyệt sẽ yêu cầu chọn vị trí và cấp quyền ghi file. Các lần sau app có thể cập nhật lại cùng file nếu trình duyệt vẫn còn quyền.

### Cách 2: **Thống kê → Xuất dữ liệu (JSON)**

1. Mở cửa sổ **Thống kê tiến độ học tập**.
2. Chọn **Xuất dữ liệu (JSON)**.
3. Trình duyệt tải về file có dạng `dictalearn_progress_YYYY-MM-DD.json`.

Cách này chủ yếu sao lưu dữ liệu học và SRS. Để giữ cả lộ trình 30 ngày, nên ưu tiên file được tạo bởi nút **Lưu tiến độ học**.

Nên sao chép file sao lưu sang USB, Google Drive, iCloud Drive hoặc nơi lưu trữ an toàn khác. File có thể chứa lịch sử học và các nghĩa do bạn tự chỉnh sửa, vì vậy không nên chia sẻ công khai nếu không cần thiết.

## Chuyển tiến độ sang máy khác

### Trên máy cũ

1. Mở app bằng trình duyệt vẫn đang có tiến độ.
2. Nhấn **Lưu tiến độ học** để tạo file `dictalearn_progress.json` mới nhất.
3. Chép file JSON đó sang máy mới bằng USB, Google Drive, iCloud Drive hoặc cách khác.

### Trên máy mới

1. Tải hoặc clone cùng phiên bản DictaLearn về máy mới.
2. Khởi động app tại `http://localhost:5500/index.html`.
3. Mở **Thống kê tiến độ học tập**.
4. Chọn **Nhập dữ liệu**.
5. Chọn file `dictalearn_progress.json` đã sao chép từ máy cũ.
6. Khi thấy thông báo **Khôi phục tiến trình học thành công**, kiểm tra lại cấp độ, Kho ôn tập, thống kê và lộ trình.

Việc nhập dữ liệu sẽ thay thế dữ liệu tiến độ hiện tại trên máy mới bằng nội dung trong file. Nếu máy mới đã có tiến độ riêng, hãy xuất một bản sao lưu trước khi nhập.

> Không cần chép thủ công thư mục cache hoặc dữ liệu Chrome. Chỉ cần chuyển file JSON và dùng chức năng **Nhập dữ liệu** trong app.

## Âm thanh hoạt động như thế nào?

App không chứa sẵn hàng chục nghìn file MP3. Khi người học bấm **Nghe**, app xử lý theo thứ tự:

1. Phát `audioUrl` nếu mục học có đường dẫn âm thanh riêng.
2. Nếu không có file riêng, sử dụng Web Speech API và giọng tiếng Anh có trong trình duyệt hoặc hệ điều hành.

Chất lượng và danh sách giọng đọc phụ thuộc vào trình duyệt và hệ điều hành. Một số giọng có thể cần kết nối Internet. Âm thanh được tạo bởi Web Speech API không tự động lưu xuống máy.

Script `scripts/audio_synthesizer.py` có thể tạo MP3 bằng Edge TTS. Mặc định, file được ghi vào thư mục `audio/` với tên theo ID bài học, ví dụ `A1_W0001.mp3`. Dữ liệu bài học cần có `audioUrl` tương ứng thì app mới ưu tiên phát file này.

## Khả năng hoạt động offline

DictaLearn có service worker và có thể được cài như PWA:

- Giao diện chính và dữ liệu A1 được lưu sẵn vào cache.
- Các cấp độ khác được cache sau khi đã mở thành công ít nhất một lần.
- Google TTS, dịch tự động, tra từ trực tuyến và một số giọng đọc vẫn cần Internet.
- Nhận diện giọng nói phụ thuộc vào trình duyệt và có thể cần Internet.

## Dữ liệu học và nhãn trình độ

Các file từ `data/data_A1.json` đến `data/data_C1.json` chứa nội dung học của ứng dụng.

A1–C1 hiện được sử dụng như các nhóm nội dung và tần suất. Bộ dữ liệu chưa phải danh sách CEFR chính thức đã được chuyên gia thẩm định. Nghĩa tiếng Việt, IPA và ví dụ có thể vẫn còn mục cần biên tập. Báo cáo kiểm tra gần nhất nằm trong `data_quality_report.json`.

Chạy kiểm tra dữ liệu trên Windows:

powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate_dataset.ps1

Đây là kiểm tra cấu trúc và heuristic, không thay thế việc kiểm duyệt nội dung bởi người có chuyên môn.

## Cấu trúc dự án

tool_learn_english/
├── assets/              Biểu tượng PWA
├── audio/               File âm thanh MP3 được tạo riêng, nếu có
├── css/                 Giao diện và hiệu ứng
├── data/                Dữ liệu học A1–C1
├── js/                  Logic ứng dụng, âm thanh, SRS và luyện nói
├── scripts/             Công cụ tạo và kiểm tra dữ liệu
├── index.html           Trang chính
├── manifest.json        Cấu hình PWA
├── run_app.bat          Trình khởi động trên Windows
├── server.ps1           HTTP server cục bộ cho Windows
└── sw.js                Service worker và cache offline

## Công cụ dành cho người phát triển

Cài thư viện Python tùy chọn:

cd scripts
python3 -m pip install -r requirements.txt

Tạo thử dữ liệu bằng Gemini:

python3 data_generator.py --level B2 --count 50 --api-key YOUR_GEMINI_API_KEY

Tạo MP3 bằng Edge TTS:

python3 audio_synthesizer.py --voice en-US-JennyNeural --rate=-10%

Trên Windows có thể thay `python3` bằng `python` nếu đó là tên lệnh Python trên máy.

Nội dung được tạo tự động cần được kiểm duyệt trước khi nhập vào dữ liệu chính. Không đưa API key, file `.env`, file sao lưu tiến độ hoặc thông tin cá nhân lên Git.

## Trình duyệt khuyến nghị

Google Chrome hoặc Microsoft Edge phiên bản mới được khuyến nghị. Tính năng luyện nói có thể không hoạt động đầy đủ trên Firefox, Safari hoặc khi người dùng chưa cấp quyền microphone.
