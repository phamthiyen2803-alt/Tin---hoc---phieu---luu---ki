TIN HỌC PHIÊU LƯU KÝ — PHIÊN BẢN DEMO 1.2
=========================================

CÁCH 1: XEM NHANH (KHÔNG CẦN CÀI ĐẶT)
- Giải nén file ZIP.
- Nhấp đúp index.html để mở bằng Chrome hoặc Edge.
- Dùng được Trang chủ, Đảo tri thức, 8 câu trắc nghiệm, tính sao và kết quả giáo viên.
- Trợ lý AI Mây dùng phản hồi MẪU khi chưa có máy chủ.

CÁCH 2: CHẠY MÁY CHỦ VỚI NODE.JS (PHIÊN BẢN 18 TRỞ LÊN)
- Cài Node.js từ https://nodejs.org nếu máy chưa có.
- Mở Terminal / Command Prompt trong thư mục đã giải nén.
- Chạy: node server.js
- Mở: http://localhost:3000
- Không cần npm install.

CÁCH 3: KẾT NỐI AI THẬT QUA MÁY CHỦ
- Cần khóa OpenAI API riêng, có thể phát sinh chi phí sử dụng API.
- KHÔNG nhập khóa trong index.html, KHÔNG gửi khóa cho học sinh.
- Trong Windows PowerShell:
  $env:OPENAI_API_KEY="KHOA_CUA_BAN"
  node server.js
- Trong macOS/Linux:
  OPENAI_API_KEY="KHOA_CUA_BAN" node server.js
- Trợ lý gọi API Responses, dùng OPENAI_MODEL nếu muốn đổi mô hình.
- Khi triển khai công khai phải bổ sung xác thực giáo viên trên server, giới hạn chi phí API, kiểm soát nội dung và chính sách bảo vệ dữ liệu học sinh.

NỘI DUNG VÀ PHẠM VI
- Bản mẫu tập trung Bài 3: Máy tính và em, Chủ đề 1, Tin học 3 Kết nối tri thức.
- 8 câu hỏi được biên soạn mới để thực hành, không sao chép nguyên văn SGK.
- Chấm điểm và phát hiện lỗi sai dựa trên quy tắc lập trình; AI thật chỉ dùng ở Trạm AI Mây khi có API.
- Lịch sử chỉ lưu ở localStorage của trình duyệt (tối đa 100 lượt); không phải cơ sở dữ liệu lớp.
- Mã giáo viên 1234 là mã DEMO trên giao diện, KHÔNG bảo mật dữ liệu.
- Chưa có tài khoản học sinh, lưu điểm toàn trường, AI cá nhân hóa theo dữ liệu bài kiểm tra hay hệ thống phân quyền sản xuất.

GỢI Ý CHO HỒ SƠ DỰ THI
- Quay video học sinh trải nghiệm phù hợp quy định về hình ảnh và dữ liệu trẻ em.
- Phân biệt minh chứng thật và chức năng dự kiến.
- Trước khi triển khai ở trường cần thử nghiệm trên thiết bị thực tế và duyệt nội dung giáo dục.


NÂNG CẤP 1.1: Tab "Phân loại" có 6 thiết bị, hỗ trợ kéo thả hoặc chọn bằng nhấp chuột, phản hồi gợi ý, huy hiệu và thống kê kết quả tại Góc giáo viên.

NÂNG CẤP 1.2: Bản đồ 5 đảo, huy hiệu đảo, thanh tiến trình, Mây đề xuất nhiệm vụ từ kết quả sai; nút nhờ AI giải thích lỗi sai. Các gợi ý tuyến nhiệm vụ là quy tắc lập trình, còn nút hỏi Mây kết nối AI thật khi có OPENAI_API_KEY trên máy chủ.

LƯU Ý: mã PIN giáo viên 1234 CHỈ DÙNG DEMO, không bảo vệ dữ liệu khi triển khai công khai. Lịch sử được lưu riêng trên từng trình duyệt. Chưa có tài khoản hay kho dữ liệu dùng chung.
