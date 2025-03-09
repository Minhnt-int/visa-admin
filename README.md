## Quy trình triển khai dự án lên port công khai trên Windows sử dụng PM2
    - npm i
    - mở port 3002:
     mở cmd admin:
    netsh advfirewall firewall add rule name="Open Port 3002" dir=in action=allow protocol=TCP localport=3002
1. **Cài đặt Node.js và npm**:
    - Tải và cài đặt Node.js từ trang chủ [Node.js](https://nodejs.org/).
    - Kiểm tra cài đặt bằng lệnh:
      ```sh
      node -v
      npm -v
      ```

2. **Cài đặt PM2**:
    - Sử dụng npm để cài đặt PM2 toàn cục:
      ```sh
      npm install -g pm2
      ```

3. **Triển khai dự án**:

    - Port được cài đặt trong file: pm2 start ecosystem.config.js
    - Điều hướng đến thư mục dự án của bạn:
      ```sh
      cd /path/to/your/project
      ```
    - Khởi chạy ứng dụng bằng PM2:
      ```sh
      pm2 start ecosystem.config.js
      ```
      (Thay `app.js` bằng file khởi động của dự án của bạn)

4. **Cấu hình PM2 để tự động khởi động lại khi hệ thống khởi động**:
    - Tạo cấu hình startup script:
      ```sh
      pm2 startup
      ```
    - Lưu cấu hình hiện tại:
      ```sh
      pm2 save
      ```

5. **Quản lý ứng dụng với PM2**:
    - Kiểm tra trạng thái ứng dụng:
      ```sh
      pm2 status
      ```
    - Xem logs của ứng dụng:
      ```sh
      pm2 logs
      ```
    - Khởi động lại ứng dụng:
      ```sh
      pm2 restart app
      ```
    - Dừng ứng dụng:
      ```sh
      pm2 stop app
      ```

6. **Truy cập ứng dụng**:
    - Mở trình duyệt và truy cập vào địa chỉ `http://localhost:<port>` để kiểm tra ứng dụng của bạn.

Lưu ý: Thay `<port>` bằng số port mà ứng dụng của bạn đang lắng nghe.