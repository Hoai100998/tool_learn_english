# DictaLearn

Ứng dụng web tĩnh để luyện nghe–chép chính tả tiếng Anh, lưu tiến độ bằng LocalStorage và lên lịch ôn tập theo SM-2.

## Chạy ứng dụng

Ứng dụng tải dữ liệu bằng `fetch`, vì vậy cần chạy qua HTTP thay vì mở trực tiếp `index.html` bằng `file://`:

```bash
python -m http.server 3000
```

Sau đó mở `http://localhost:3000`.

## Tình trạng dữ liệu

- `data/data_A1.json` đến `data/data_C1.json` chứa tổng cộng 35.000 mục.
- Mỗi level có 5.000 từ, 1.000 cụm từ và 1.000 câu giao tiếp.
- Các nhãn A1–C1 hiện là năm **nhóm tần suất**, không phải phân loại CEFR đã được chuyên gia hoặc nguồn CEFR xác nhận.
- 10.000 mục giao tiếp tập trung vào sinh hoạt, mua sắm, đi lại, dịch vụ, văn phòng, khách hàng và quản lý.
- Nghĩa Việt và IPA được nhập từ từ điển cộng đồng cũ. Một phần dữ liệu có placeholder hoặc chú thích từ điển cần biên tập lại.
- Không nên quảng bá bộ dữ liệu này là “100% chính xác” trước khi hoàn tất lexical QA với nguồn được cấp phép.

Chạy kiểm định tự động:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\validate_dataset.ps1
```

Kết quả chi tiết được ghi vào `data_quality_report.json`. Đây là kiểm tra schema và heuristic, không thay thế việc chuyên gia kiểm tra từng nghĩa.

## Pipeline tùy chọn

```bash
cd scripts
pip install -r requirements.txt
python data_generator.py --level B2 --count 50 --api-key YOUR_GEMINI_API_KEY
python audio_synthesizer.py --voice en-US-JennyNeural --rate=-10%
```

Nội dung sinh bằng mô hình vẫn phải qua kiểm định trước khi nhập vào dữ liệu chính.

### Đối chiếu lại nghĩa từ bằng Google Cloud Translation

Pipeline sử dụng API chính thức, lưu checkpoint và chỉ ghi dữ liệu khi đủ 25.000 kết quả:

```powershell
[Environment]::SetEnvironmentVariable('GOOGLE_TRANSLATE_API_KEY', 'YOUR_KEY', 'User')
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\translate_words_google.ps1 -Mode Fetch
# Rà soát google_translation_checkpoint.json trước khi áp dụng:
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\translate_words_google.ps1 -Mode Apply
```

Không truyền API key trên command line và không commit key vào repository.

## Cấu trúc

- `index.html`, `css/`, `js/`: giao diện và logic ứng dụng.
- `data/`: dữ liệu từ vựng JSON.
- `scripts/`: sinh audio, sinh nội dung và kiểm định dữ liệu.
- `sw.js`, `manifest.json`: cấu hình PWA/offline.

## Giới hạn kỹ thuật

- Chỉ level đang chọn được tải để giảm thời gian khởi động và bộ nhớ.
- A1 được precache để dùng offline; các level khác khả dụng offline sau khi đã được mở ít nhất một lần khi có mạng.
- Dịch/IPA từ API công cộng chỉ là dữ liệu bổ sung và có thể chịu giới hạn request.
