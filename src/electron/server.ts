// const express = require('express');
// const bodyParser = require('body-parser');
// const fs = require('fs');
// const axios = require('axios');

// const app = express();
// const PORT = 3000;

// // camera gửi XML hoặc JSON, nhưng thường là XML → cần raw body để xử lý thủ công nếu cần
// app.use(bodyParser.text({ type: '*/*' }));

// app.post('/anpr', async (req, res) => {
//   try {
//     console.log('📥 Nhận dữ liệu ANPR từ camera');

//     const body = req.body;

//     // 👇 Trích xuất thông tin từ XML (ví dụ đơn giản)
//     const plateMatch = body.match(/<plateNumber>(.*?)<\/plateNumber>/);
//     const imageMatch = body.match(/<picName>(.*?)<\/picName>/);

//     if (plateMatch && imageMatch) {
//       const plateNumber = plateMatch[1];
//       const imageUrl = `http://<ip_camera>/ISAPI/Intelligent/FDLib/pic/${imageMatch[1]}`;

//       // Tải ảnh về
//       const response = await axios.get(imageUrl, {
//         responseType: 'arraybuffer',
//         auth: {
//           username: 'admin',
//           password: 'your_password'
//         }
//       });

//       fs.writeFileSync(`plates/${plateNumber}_${Date.now()}.jpg`, response.data);
//       console.log(`✅ Biển số: ${plateNumber} đã lưu ảnh`);
//     } else {
//       console.log('⚠️ Không tìm thấy biển số trong dữ liệu');
//     }

//     res.sendStatus(200);
//   } catch (err) {
//     console.error('❌ Lỗi xử lý ANPR:', err.message);
//     res.sendStatus(500);
//   }
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server lắng nghe tại http://localhost:${PORT}/anpr`);
// });