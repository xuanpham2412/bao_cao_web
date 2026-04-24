const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. CẤU HÌNH KẾT NỐI MYSQL ---
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "quanlysinhvien",
});

db.connect((err) => {
  if (err) return console.error("❌ Lỗi kết nối MySQL:", err);
  console.log("✅ Đã kết nối thành công với Database MySQL (XAMPP)!");
});

// --- 2. API ĐĂNG NHẬP (Tích hợp Sinh viên & Giảng viên) ---
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM TaiKhoan WHERE Username = ?",
    [username],
    (err, results) => {
      if (err)
        return res.status(500).json({ success: false, message: "Lỗi CSDL!" });

      if (results.length > 0) {
        // Tài khoản đã tồn tại
        if (results[0].Password === password) {
          res.json({
            success: true,
            message: "Đăng nhập thành công!",
            user: results[0],
          });
        } else {
          res.status(401).json({ success: false, message: "Sai mật khẩu!" });
        }
      } else {
        // Tự động cấp tài khoản cho Sinh viên
        db.query(
          "SELECT * FROM SinhVien WHERE MaSV = ?",
          [username],
          (err, svResults) => {
            if (svResults && svResults.length > 0) {
              db.query(
                "INSERT INTO TaiKhoan (Username, Password, Quyen) VALUES (?, ?, ?)",
                [username, password, "SinhVien"],
                () => {
                  res.json({
                    success: true,
                    message: "Đăng nhập lần đầu thành công!",
                    user: { Username: username, Quyen: "SinhVien" },
                  });
                },
              );
            } else {
              // Tự động cấp tài khoản cho Giảng viên
              db.query(
                "SELECT * FROM GiangVien WHERE MaGV = ?",
                [username],
                (err, gvResults) => {
                  if (gvResults && gvResults.length > 0) {
                    db.query(
                      "INSERT INTO TaiKhoan (Username, Password, Quyen) VALUES (?, ?, ?)",
                      [username, password, "GiangVien"],
                      () => {
                        res.json({
                          success: true,
                          message: "Đăng nhập lần đầu thành công!",
                          user: { Username: username, Quyen: "GiangVien" },
                        });
                      },
                    );
                  } else {
                    res.status(401).json({
                      success: false,
                      message: "Tài khoản không tồn tại hoặc chưa được cấp mã!",
                    });
                  }
                },
              );
            }
          },
        );
      }
    },
  );
});

// --- 3. CÁC API DÀNH CHO ADMIN ---

// Lấy danh sách hiển thị lên bảng
app.get("/api/danhsach/:loai", (req, res) => {
  const loai = req.params.loai;
  let query = "";

  if (loai === "khoa") query = "SELECT * FROM Khoa";
  else if (loai === "lop") query = "SELECT * FROM Lop";
  else if (loai === "giangvien") query = "SELECT * FROM GiangVien";
  else if (loai === "sinhvien") query = "SELECT * FROM SinhVien";
  else if (loai === "monhoc") query = "SELECT * FROM MonHoc";
  else if (loai === "lichhoc") query = "SELECT * FROM LichHoc";
  else return res.status(400).json({ success: false });

  db.query(query, (err, results) => {
    res.json({ success: !err, data: results });
  });
});

// Hàm xử lý kết quả trả về chung cho Admin
const handleDBRes = (res) => (err) => {
  if (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ success: false, message: "Mã này đã tồn tại!" });
    if (err.code === "ER_NO_REFERENCED_ROW_2")
      return res.status(400).json({
        success: false,
        message: "Khóa ngoại không tồn tại (Ví dụ: Sai Mã Khoa, Mã Lớp)!",
      });
    return res.status(500).json({ success: false, message: "Lỗi CSDL!" });
  }
  res.json({ success: true, message: "Lưu thành công!" });
};

// CÁC API THÊM MỚI (Đã bọc ngoặc nhọn an toàn)
app.post("/api/themkhoa", (req, res) => {
  db.query(
    "INSERT INTO Khoa (MaKhoa, TenKhoa) VALUES (?, ?)",
    [req.body.maKhoa, req.body.tenKhoa],
    handleDBRes(res),
  );
});
app.post("/api/themlop", (req, res) => {
  db.query(
    "INSERT INTO Lop (MaLop, TenLop, MaKhoa) VALUES (?, ?, ?)",
    [req.body.maLop, req.body.tenLop, req.body.maKhoa],
    handleDBRes(res),
  );
});
app.post("/api/themgiangvien", (req, res) => {
  db.query(
    "INSERT INTO GiangVien (MaGV, TenGV, Email, MaKhoa) VALUES (?, ?, ?, ?)",
    [req.body.maGV, req.body.tenGV, req.body.email, req.body.maKhoa],
    handleDBRes(res),
  );
});
app.post("/api/themsinhvien", (req, res) => {
  db.query(
    "INSERT INTO SinhVien (MaSV, TenSV, NgaySinh, GioiTinh, MaLop) VALUES (?, ?, ?, ?, ?)",
    [
      req.body.maSV,
      req.body.tenSV,
      req.body.ngaySinh,
      req.body.gioiTinh,
      req.body.maLop,
    ],
    handleDBRes(res),
  );
});
app.post("/api/themmonhoc", (req, res) => {
  db.query(
    "INSERT INTO MonHoc (MaMH, TenMH, SoTinChi) VALUES (?, ?, ?)",
    [req.body.maMH, req.body.tenMH, req.body.soTinChi],
    handleDBRes(res),
  );
});
app.post("/api/themlichhoc", (req, res) => {
  db.query(
    "INSERT INTO LichHoc (MaLop, MaMH, MaGV, PhongHoc, Thu, CaHoc) VALUES (?, ?, ?, ?, ?, ?)",
    [
      req.body.maLop,
      req.body.maMH,
      req.body.maGV,
      req.body.phongHoc,
      req.body.thu,
      req.body.caHoc,
    ],
    handleDBRes(res),
  );
});

// API Xóa
app.delete("/api/xoa/:loai/:id", (req, res) => {
  const map = {
    khoa: ["Khoa", "MaKhoa"],
    lop: ["Lop", "MaLop"],
    giangvien: ["GiangVien", "MaGV"],
    sinhvien: ["SinhVien", "MaSV"],
    monhoc: ["MonHoc", "MaMH"],
    lichhoc: ["LichHoc", "MaLich"],
  };
  if (!map[req.params.loai]) return res.status(400).json({ success: false });

  db.query(
    `DELETE FROM ${map[req.params.loai][0]} WHERE ${map[req.params.loai][1]} = ?`,
    [req.params.id],
    (err) => {
      if (err)
        return res.status(400).json({
          success: false,
          message: "Không thể xóa vì dữ liệu đang được sử dụng ở bảng khác!",
        });
      res.json({ success: true, message: "Xóa thành công!" });
    },
  );
});

// API Cập nhật (Sửa) Lịch Học
app.put("/api/sua/lichhoc/:id", (req, res) => {
  db.query(
    "UPDATE LichHoc SET MaLop=?, MaMH=?, MaGV=?, PhongHoc=?, Thu=?, CaHoc=? WHERE MaLich=?",
    [
      req.body.maLop,
      req.body.maMH,
      req.body.maGV,
      req.body.phongHoc,
      req.body.thu,
      req.body.caHoc,
      req.params.id,
    ],
    handleDBRes(res),
  );
});

// --- 4. API CHO GIẢNG VIÊN (QUẢN LÝ BẢNG ĐIỂM) ---

// Lấy thông tin cá nhân giảng viên (kèm tên Khoa)
app.get("/api/thongtin_giangvien/:magv", (req, res) => {
  const query = `
        SELECT gv.MaGV, gv.TenGV, gv.Email, k.TenKhoa 
        FROM GiangVien gv 
        LEFT JOIN Khoa k ON gv.MaKhoa = k.MaKhoa 
        WHERE gv.MaGV = ?
    `;
  db.query(query, [req.params.magv], (err, results) => {
    if (results && results.length > 0)
      res.json({ success: true, data: results[0] });
    else res.status(404).json({ success: false });
  });
});

app.get("/api/diem-lop/:maLop/:maMH", (req, res) => {
  const query = `
        SELECT sv.MaSV, sv.TenSV, mh.MaMH, mh.TenMH, bd.Diem 
        FROM SinhVien sv 
        JOIN MonHoc mh ON mh.MaMH = ? 
        LEFT JOIN BangDiem bd ON sv.MaSV = bd.MaSV AND bd.MaMH = mh.MaMH 
        WHERE sv.MaLop = ?
    `;
  db.query(query, [req.params.maMH, req.params.maLop], (err, results) => {
    res.json({ success: !err, data: results });
  });
});

app.post("/api/capnhatdiem", (req, res) => {
  db.query(
    `INSERT INTO BangDiem (MaSV, MaMH, Diem) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Diem = ?`,
    [req.body.maSV, req.body.maMH, req.body.diem, req.body.diem],
    (err) => {
      res.json({
        success: !err,
        message: err ? "Lỗi CSDL" : "Lưu điểm thành công!",
      });
    },
  );
});

app.delete("/api/xoadiem/:maSV/:maMH", (req, res) => {
  db.query(
    `DELETE FROM BangDiem WHERE MaSV = ? AND MaMH = ?`,
    [req.params.maSV, req.params.maMH],
    (err) => {
      res.json({ success: !err });
    },
  );
});

// --- 5. API CHO SINH VIÊN ---
app.get("/api/thongtin_sinhvien/:masv", (req, res) => {
  db.query(
    "SELECT * FROM SinhVien WHERE MaSV = ?",
    [req.params.masv],
    (err, results) => {
      if (results && results.length > 0)
        res.json({ success: true, data: results[0] });
      else res.status(404).json({ success: false });
    },
  );
});

app.get("/api/lichhoc-sinhvien/:maLop", (req, res) => {
  const query = `
        SELECT lh.PhongHoc, lh.Thu, lh.CaHoc, mh.TenMH, gv.TenGV 
        FROM LichHoc lh 
        JOIN MonHoc mh ON lh.MaMH = mh.MaMH 
        JOIN GiangVien gv ON lh.MaGV = gv.MaGV 
        WHERE lh.MaLop = ?
    `;
  db.query(query, [req.params.maLop], (err, results) => {
    res.json({ success: !err, data: results });
  });
});

app.get("/api/diem-sinhvien/:maSV", (req, res) => {
  const query = `
        SELECT mh.MaMH, mh.TenMH, mh.SoTinChi, bd.Diem 
        FROM BangDiem bd 
        JOIN MonHoc mh ON bd.MaMH = mh.MaMH 
        WHERE bd.MaSV = ?
    `;
  db.query(query, [req.params.maSV], (err, results) => {
    res.json({ success: !err, data: results });
  });
});

// --- KHỞI ĐỘNG MÁY CHỦ ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Server đang chạy tại: http://localhost:${PORT}`);
});
