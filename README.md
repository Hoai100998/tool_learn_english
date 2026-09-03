# DictaLearn

DictaLearn là ứng dụng web học tiếng Anh chạy trên máy cá nhân, tập trung vào luyện nghe–chép chính tả, phát âm và ôn tập từ vựng. Ứng dụng không cần cài đặt cơ sở dữ liệu; dữ liệu học và tiến độ cá nhân được lưu ngay trong trình duyệt.

## Tính năng chính

- Luyện nghe và chép chính tả theo từ, cụm từ hoặc câu.
- Chọn nhóm trình độ từ A1 đến C1.
- Phát âm tiếng Anh với nhiều tốc độ và giọng đọc khác nhau.
- Luyện nói bằng tính năng nhận diện giọng nói của trình duyệt.
- So sánh câu trả lời theo từng từ và từng ký tự.
- Gợi ý ký tự, bỏ qua bài và phát lại âm thanh.
- Ôn tập ngắt quãng theo thuật toán SM-2.
- Theo dõi chuỗi ngày học và kế hoạch học trong 30 ngày.
- Giao diện sáng/tối, hỗ trợ máy tính và điện thoại.
- Xuất hoặc nhập dữ liệu tiến độ học tập.

## Khởi động trên Windows

### Cách đơn giản nhất

1. Mở thư mục dự án.
2. Nhấp đúp vào `run_app.bat`.
3. Giữ cửa sổ server mở trong suốt thời gian sử dụng.
4. Nếu trình duyệt không tự mở, truy cập <http://localhost:5500/index.html>.

### Chạy bằng PowerShell

```powershell
cd <duong-dan-den-thu-muc>\tool_learn_english
powershell -NoProfile -ExecutionPolicy Bypass -File .\server.ps1
```

Sau đó mở <http://localhost:5500/index.html> bằng Chrome hoặc Microsoft Edge.

> Không mở trực tiếp `index.html` bằng địa chỉ `file://`. Trình duyệt có thể chặn việc tải dữ liệu, microphone và một số tính năng khác.

## Âm thanh hoạt động như thế nào?

App không chứa sẵn hàng chục nghìn file MP3. Khi người học bấm **Nghe**, ứng dụng xử lý theo thứ tự:

1. Phát `audioUrl` nếu mục học có đường dẫn âm thanh riêng.
2. Nếu không có file riêng, dùng Web Speech API và giọng tiếng Anh có trong trình duyệt hoặc hệ điều hành.

Vì vậy, chất lượng và danh sách giọng đọc phụ thuộc vào trình duyệt và hệ điều hành. Một số giọng có thể cần Internet; âm thanh không được tự động lưu xuống máy.

Script `scripts/audio_synthesizer.py` có thể tạo MP3 cục bộ bằng Edge TTS. Mặc định, các file được ghi vào thư mục `audio/` với tên theo ID bài học, ví dụ `A1_W0001.mp3`. App hiện chưa tự động ưu tiên các file được sinh theo cách này nếu dữ liệu chưa có `audioUrl` tương ứng.

## Dữ liệu và tiến độ học

- Năm file từ `data/data_A1.json` đến `data/data_C1.json` hiện chứa tổng cộng **35.080 mục**.
- Mỗi nhóm có 5.000 từ cùng ít nhất 1.000 cụm từ và 1.000 câu.
- Tiến độ, lịch ôn SRS, nghĩa do người dùng sửa và thiết lập giao diện được lưu trong `localStorage` của trình duyệt.
- Xóa dữ liệu trình duyệt có thể làm mất tiến độ. Hãy dùng chức năng xuất dữ liệu để sao lưu định kỳ.

### Lưu ý về nhãn trình độ

A1–C1 trong bộ dữ liệu hiện được dùng như các **nhóm nội dung/tần suất**. Đây chưa phải là bộ dữ liệu CEFR đã được chuyên gia thẩm định. Không nên mô tả dữ liệu là “chuẩn Oxford” hoặc “CEFR chính thức”.

Nghĩa tiếng Việt, IPA và ví dụ vẫn còn một số mục thiếu, placeholder hoặc nội dung cần biên tập. Báo cáo gần nhất nằm trong `data_quality_report.json`.

Chạy lại kiểm định dữ liệu bằng lệnh:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate_dataset.ps1
```

Đây là kiểm tra cấu trúc và heuristic, không thay thế việc kiểm duyệt nội dung bởi người có chuyên môn.

## Khả năng offline

DictaLearn có service worker và có thể được cài như PWA:

- Giao diện chính và dữ liệu A1 được lưu sẵn vào cache.
- Các nhóm khác được cache sau khi đã mở thành công ít nhất một lần.
- Google TTS, dịch tự động, tra từ online và một số giọng đọc vẫn cần Internet.
- Nhận diện giọng nói phụ thuộc vào Chrome/Edge và có thể cần kết nối mạng.

## Cấu trúc dự án

```text
tool_learn_english/
├── assets/              Biểu tượng PWA
├── css/                 Giao diện và hiệu ứng so sánh đáp án
├── data/                Dữ liệu học A1–C1
├── js/                  Logic ứng dụng, audio, SRS và luyện nói
├── scripts/             Công cụ tạo và kiểm định dữ liệu
├── index.html           Trang chính
├── manifest.json        Cấu hình PWA
├── run_app.bat          Trình khởi động trên Windows
├── server.ps1           HTTP server cục bộ
└── sw.js                Service worker và cache offline
```

## Công cụ dành cho người phát triển

Cài các thư viện Python tùy chọn:

```powershell
cd scripts
pip install -r requirements.txt
```

Tạo thử dữ liệu bằng Gemini:

```powershell
python data_generator.py --level B2 --count 50 --api-key YOUR_GEMINI_API_KEY
```

Tạo MP3 bằng Edge TTS:

```powershell
python audio_synthesizer.py --voice en-US-JennyNeural --rate=-10%
```

Nội dung được tạo tự động cần được kiểm duyệt trước khi nhập vào dữ liệu chính. Không đưa API key, file `.env` hoặc thông tin cá nhân lên Git.

## Trình duyệt khuyến nghị

Sử dụng phiên bản mới của Google Chrome hoặc Microsoft Edge. Tính năng luyện nói có thể không hoạt động đầy đủ trên Firefox, Safari hoặc khi người dùng chưa cấp quyền microphone.
