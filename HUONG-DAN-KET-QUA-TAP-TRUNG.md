# Bật chức năng thu kết quả tập trung (Tin học 3–4–5)

## Bước 1: Tạo Supabase
Tạo dự án Supabase riêng do nhà trường quản lý và chọn vùng lưu trữ phù hợp chính sách bảo vệ dữ liệu học sinh của đơn vị. Trong SQL Editor, chạy nội dung file `database/learning_results.sql`.

## Bước 2: Cấu hình Vercel
Project Settings → Environment Variables → Production:
- `SUPABASE_URL`: Project URL của Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: service_role secret key của Supabase. **Chỉ cấu hình trên Vercel; tuyệt đối không đưa lên GitHub, HTML hay nói trong chat.**
- `TEACHER_REPORT_PASSWORD`: mật khẩu quản trị kết quả mạnh, tối thiểu 12 ký tự; không dùng mã demo 1234.

Sau khi cấu hình, Redeploy Production.

## Bước 3: Kiểm tra
1. Trên một máy thử, mở website → chọn bài học → nhập tên giả và lớp thử → hoàn thành bài.
2. Trên máy khác, vào Góc giáo viên, nhập mật khẩu, bấm Xem thống kê.
3. Lọc Khối 3, 4 hoặc 5, lọc lớp; xuất CSV mở bằng Excel.
4. Không dùng tên học sinh thật cho đến khi nhà trường phê duyệt việc thu thập và có thông báo bảo vệ dữ liệu phù hợp.

## Các giới hạn cần biết
- Nếu chưa có các biến môi trường/bảng SQL, website vẫn luyện tập được, nhưng **kết quả không đồng bộ** lên bảng chung.
- Việc gửi điểm cần mạng; nếu mạng lỗi, bản ghi tạm còn ở trình duyệt máy học sinh, nhưng **không tự đồng bộ lại**.
- Bảng giáo viên lấy tối đa **1.000 lượt gần nhất** mỗi lần tra cứu. Đây là bản nền tảng, chưa có phân trang đầy đủ và chưa có cơ chế giới hạn chống gửi kết quả giả/nhồi dữ liệu.
- Chỉ có một mật khẩu báo cáo chung cho người được phép quản lý, chưa có tài khoản giáo viên cá nhân, chưa có phân quyền theo lớp.
- **CSV** tương thích Excel, chưa phải định dạng `.xlsx`. Không nên chia sẻ bảng điểm công khai.
- Bảng kết quả có thể chứa dữ liệu cá nhân trẻ em: cần quy định quyền truy cập, thời hạn lưu, quy trình xóa, thông báo/đồng ý theo yêu cầu pháp luật và của nhà trường trước khi sử dụng thực tế.
