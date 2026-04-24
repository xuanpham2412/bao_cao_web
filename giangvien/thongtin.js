document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("userRole") !== "GiangVien") {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "../dangnhap/login.html";
    return;
  }
  const maGV = localStorage.getItem("username");

  // Lấy thông tin từ Backend
  fetch(`http://localhost:3000/api/thongtin_giangvien/${maGV}`)
    .then((res) => res.json())
    .then((result) => {
      if (result.success) {
        const gv = result.data;
        document.getElementById("welcomeName").innerText =
          " Giảng viên: " + gv.TenGV;
        document.getElementById("txtMaGV").innerText = gv.MaGV;
        document.getElementById("txtTenGV").innerText = gv.TenGV;
        document.getElementById("txtEmail").innerText =
          gv.Email || "Chưa cập nhật";
        document.getElementById("txtTenKhoa").innerText =
          gv.TenKhoa || "Chưa phân khoa";
      }
    })
    .catch((err) => alert("Lỗi khi tải thông tin giảng viên!"));
});

window.dangXuat = function () {
  localStorage.clear();
  window.location.href = "../dangnhap/login.html";
};
