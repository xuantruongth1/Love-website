// ============================================================
// FILE CẤU HÌNH TRUNG TÂM — chỉnh sửa tại đây để cá nhân hóa
// ============================================================

export const config = {
  // --- Tên hiển thị ---
  boyName: 'MaiTruongg',   // Tên chủ (admin)
  girlName: 'PhLien',      // Tên người yêu (hiển thị trên trang)
  coupleTitle: 'Của chúng mình 💕',

  // --- Ngày tháng quan trọng ---
  anniversaryDate: '2024-11-05',   // Ngày bắt đầu yêu nhau (YYYY-MM-DD)
  girlBirthday: '2007-08-04',      // Sinh nhật người yêu
  boyBirthday: '2005-05-28',       // Sinh nhật chủ

  // --- Mật khẩu vào trang ---
  password: '05112024',            // Gợi ý: ngày kỷ niệm không dấu
  adminPassword: 'admin2805',      // Mật khẩu vào admin panel

  // --- Thông điệp landing ---
  landingTagline: 'Có một nơi chỉ dành cho em...',
  landingSubtitle: 'Nhập chìa khóa để bước vào thế giới của chúng ta',

  // --- Màu sắc override (để null để dùng default) ---
  primaryColor: null,
  accentColor: null,

  // --- Nhạc nền ---
  defaultMusic: [
    { title: 'Một Đời - 14 Casper & Bon Nghiêm', src: '/music/mot-doi-14casper.mp3' },
    { title: 'Một Nhà - Da LAB', src: '/music/mot-nha-dalab.mp3' },
    { title: 'Beauty And A Beat - Justin Bieber ft. Nicki Minaj', src: '/music/beauty-and-a-beat.mp3' },
    { title: 'Lữ Đường - KAI ĐINH ft. Hải Long & Salim', src: '/music/lu-duong-kaidin.mp3' },
    { title: 'Lửa Gần Rơm - Quân A.P', src: '/music/lua-gan-rom-quanap.mp3' },
    { title: 'Mình Cười Nhau Đi - Pjnboys x Huỳnh James', src: '/music/minh-cuoi-nhau-di.mp3' },
    { title: 'Ngày Chung Đôi - Văn Mai Hương', src: '/music/ngay-chung-doi.mp3' },
    { title: 'Ngày Đầu Tiên - Đức Phúc', src: '/music/ngay-dau-tien-ducphuc.mp3' },
    { title: 'You Are My Crush - Quân A.P x Nguyên Jenda', src: '/music/you-are-my-crush.mp3' },
  ],

  // --- Spotify playlist embed (lấy Embed URL từ Spotify) ---
  spotifyPlaylistUrl: '',   // vd: https://open.spotify.com/embed/playlist/xxx

  // --- YouTube playlist embed ---
  youtubePlaylistUrl: '', // vd: https://www.youtube.com/embed/videoseries?list=xxx

  // --- Câu thống kê vui (dùng trong countdown) ---
  funStats: [
    { label: 'ly trà sữa đã uống cùng nhau', multiplier: 0.5 },
    { label: 'bữa ăn đã chia sẻ', multiplier: 2 },
    { label: 'tin nhắn "em ơi"', multiplier: 12 },
    { label: 'lần nhắc nhau uống nước', multiplier: 3 },
  ],

  // --- Nội dung thư tình (hiển thị trong /letter) ---
  // Dùng ${config.girlName} / ${config.boyName} để tự điền tên
  letterContent: `PhLien yêu của anh,

Anh không biết bắt đầu từ đâu khi ngồi xuống viết những dòng này. Có lẽ vì có quá nhiều thứ anh muốn nói — những điều đã được giữ trong lòng lâu lắm rồi, và anh không chắc chữ viết có đủ để diễn đạt hết.

Nhưng anh sẽ cố.

Kể từ ngày 05/11/2024 — ngày em bước vào cuộc đời anh, có điều gì đó đã thay đổi — nhẹ nhàng thôi, nhưng anh cảm nhận được. Như là có thêm ánh sáng ở những góc tối anh đã quen. Như là tiếng ồn của cuộc sống bỗng có một giai điệu khác — giai điệu của em.

Anh yêu em không phải vì em hoàn hảo. Mà vì em thật — thật trong cách em cười, thật trong cách em buồn, thật trong cách em yêu anh bằng tất cả những gì em có.

Cảm ơn em đã ở lại. Cảm ơn em đã kiên nhẫn với anh những lúc anh khó chịu. Cảm ơn em đã luôn là nơi anh muốn trở về sau mọi ngày dài.

Anh không hứa sẽ hoàn hảo. Nhưng anh hứa sẽ cố gắng mỗi ngày — để xứng đáng với tình yêu em dành cho anh.

Mãi yêu em,
MaiTruongg ❤️`,
}

export function getConfig() {
  try {
    const overrides = JSON.parse(localStorage.getItem('config_overrides') || '{}')
    return { ...config, ...overrides }
  } catch {
    return config
  }
}

export function saveConfig(overrides) {
  localStorage.setItem('config_overrides', JSON.stringify(overrides))
}
