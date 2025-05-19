/**
 * Chuyển đổi tiêu đề tiếng Việt có dấu thành slug không dấu
 * @param title Tiêu đề cần chuyển đổi
 * @returns Chuỗi slug không dấu, viết thường, các từ cách nhau bởi dấu gạch ngang
 */
export const convertToSlug = (title: string): string => {
  // Bước 1: Chuyển đổi dấu tiếng Việt thành không dấu
  let str = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Bước 2: Xử lý các ký tự đặc biệt trong tiếng Việt
  const vietnameseMap: { [key: string]: string } = {
    'đ': 'd', 'Đ': 'D',
    'ă': 'a', 'Ă': 'A',
    'â': 'a', 'Â': 'A',
    'ê': 'e', 'Ê': 'E',
    'ô': 'o', 'Ô': 'O',
    'ơ': 'o', 'Ơ': 'O',
    'ư': 'u', 'Ư': 'U'
  };
  
  for (const key in vietnameseMap) {
    str = str.replace(new RegExp(key, 'g'), vietnameseMap[key]);
  }
  
  // Bước 3: Chuyển thành chữ thường và thay thế khoảng trắng thành dấu gạch ngang
  str = str.toLowerCase();
  
  // Bước 4: Loại bỏ các ký tự không phải chữ cái hoặc số, thay thế bằng dấu gạch ngang
  str = str.replace(/[^a-z0-9]+/g, '-');
  
  // Bước 5: Loại bỏ dấu gạch ngang ở đầu và cuối chuỗi
  str = str.replace(/^-+|-+$/g, '');
  
  return str;
};

// Ví dụ sử dụng
// const title = "Ví dụ của tôi";
// const slug = convertToSlug(title); // Kết quả: "vi-du-cua-toi"