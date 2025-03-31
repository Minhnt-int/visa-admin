export class CustomUploadAdapter {
    private loader: any;
    private uploadUrl: string;
  
    constructor(loader: any, uploadUrl: string) {
      // Lưu loader được cung cấp bởi CKEditor
      this.loader = loader;
      
      // URL API endpoint để upload ảnh
      this.uploadUrl = uploadUrl;
    }
  
    // Bắt đầu quá trình upload
    upload() {
      return this.loader.file
        .then((file: File) => new Promise((resolve, reject) => {
          this._uploadFile(file, resolve, reject);
        }));
    }
  
    // Hủy quá trình upload
    abort() {
      // Thực hiện các hành động cần thiết để hủy upload, nếu cần
    }
  
    // Phương thức private để xử lý việc upload file
    _uploadFile(file: File, resolve: Function, reject: Function) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', "");
  
      const xhr = new XMLHttpRequest();
  
      xhr.open('POST', this.uploadUrl, true);
      xhr.responseType = 'json';
  
      // Xử lý sự kiện khi upload hoàn thành
      xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 201) {
            console.log(xhr.response);
            
          // Trả về URL của ảnh đã upload
          // Điều chỉnh theo cấu trúc phản hồi từ API của bạn
          resolve({
            default: process.env.NEXT_PUBLIC_API_URL + xhr.response.data.pop().path
          });
        } else {
          reject(`Upload failed: ${xhr.status}`);
        }
      };
  
      // Xử lý lỗi
      xhr.onerror = function() {
        reject('Network error');
      };
  
      // Xử lý tiến trình upload
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          this.loader.uploadTotal = evt.total;
          this.loader.uploaded = evt.loaded;
        }
      };
  
      // Gửi request
      xhr.send(formData);
    }
  }
  
  // Hàm factory để tạo adapter khi CKEditor yêu cầu
  export function CustomUploadAdapterPlugin(editor: any) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      // Đặt URL API endpoint của bạn ở đây
      const uploadUrl = process.env.NEXT_PUBLIC_API_URL + '/api/media';
      
      // Trả về một instance mới của adapter
      return new CustomUploadAdapter(loader, uploadUrl);
    };
  }