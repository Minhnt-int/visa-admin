// Thêm hàm helper này bên ngoài class
function createPromptDialog(message: string, defaultValue: string = ''): Promise<string | null> {
  return new Promise((resolve) => {
    const result = window.prompt(message, defaultValue);
    resolve(result);
  });
}

export class CustomUploadAdapter {
    private loader: any;
    private uploadUrl: string;
    private controller: AbortController | null = null;
  
    constructor(loader: any, uploadUrl: string) {
      // Lưu loader được cung cấp bởi CKEditor
      this.loader = loader;
      
      // URL API endpoint để upload ảnh
      this.uploadUrl = uploadUrl;
    }
    
    // Chuyển đổi thành async method
    async upload() {
      try {
        // Thay thế alert bằng prompt
        const altText = await createPromptDialog('Nhập mô tả cho ảnh:', '');
        const file = await this.loader.file;
        
        // Sử dụng altText trong quá trình upload
        const response = await this._uploadFile(file, altText);
        return response;
      } catch (error) {
        console.error('Upload failed:', error);
        throw error;
      }
    }
  
    // Hủy quá trình upload
    abort() {
      // Sử dụng AbortController để hủy fetch request
      if (this.controller) {
        this.controller.abort();
        this.controller = null;
      }
    }
  
    // Phương thức private để xử lý việc upload file sử dụng async/await
    async _uploadFile(file: File, altText: string | null) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('altText', altText || "");
      
      // Sử dụng AbortController để có thể hủy request
      this.controller = new AbortController();
      
      try {
        // Theo dõi tiến trình upload
        const onProgress = (evt: ProgressEvent) => {
          if (evt.lengthComputable) {
            this.loader.uploadTotal = evt.total;
            this.loader.uploaded = evt.loaded;
          }
        };
        
        // Sử dụng XMLHttpRequest để có thể theo dõi tiến trình
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.uploadUrl, true);
        xhr.responseType = 'json';
        
        // Tạo promise từ XMLHttpRequest
        const uploadPromise = new Promise<{default: string, alt: string}>((resolve, reject) => {
          xhr.onload = function() {
            if (xhr.status === 200 || xhr.status === 201) {
              // Trả về URL của ảnh đã upload và alt text
              resolve({
                default: process.env.NEXT_PUBLIC_API_URL + xhr.response.data.pop().url,
                alt: xhr.response.data.pop().altText || '' // Thêm thuộc tính alt
              });
            } else {
              reject(`Upload failed: ${xhr.status}`);
            }
          };
          
          xhr.onerror = function() {
            reject('Network error');
          };
          
          xhr.upload.onprogress = onProgress;
        });
        
        // Gửi request
        xhr.send(formData);
        
        // Đợi promise hoàn thành
        return await uploadPromise;
        
        // Cách sử dụng fetch API (thay thế cho XMLHttpRequest nếu không cần theo dõi tiến trình)
        /*
        const response = await fetch(this.uploadUrl, {
          method: 'POST',
          body: formData,
          signal: this.controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        return {
          default: process.env.NEXT_PUBLIC_API_URL + data.data.pop().path
        };
        */
      } catch (error) {
        console.error('Error during file upload:', error);
        throw error;
      } finally {
        this.controller = null;
      }
    }
}

// Không thay đổi hàm CustomUploadAdapterPlugin (xóa từ khóa async)
export function CustomUploadAdapterPlugin(editor: any) {
  try {
    // Đăng ký adapter
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      const uploadUrl = process.env.NEXT_PUBLIC_API_URL + '/api/media';
      return new CustomUploadAdapter(loader, uploadUrl);
    };
  } catch (error) {
    console.error('Error initializing upload adapter:', error);
  }
}