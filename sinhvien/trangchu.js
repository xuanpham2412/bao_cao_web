document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("userRole") !== "SinhVien") {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "../dangnhap/login.html";
    return;
  }
  const maSV = localStorage.getItem("username");
  fetch(`http://localhost:3000/api/thongtin_sinhvien/${maSV}`)
    .then((res) => res.json())
    .then((result) => {
      if (result.success) {
        const sv = result.data;
        document.getElementById("welcomeName").innerText =
          "Sinh viên: " + sv.TenSV;
        document.getElementById("txtMaSV").innerText = sv.MaSV;
        document.getElementById("txtTenSV").innerText = sv.TenSV;
        document.getElementById("txtGioiTinh").innerText = sv.GioiTinh;
        document.getElementById("txtMaLop").innerText = sv.MaLop;
        if (sv.NgaySinh)
          document.getElementById("txtNgaySinh").innerText = new Date(
            sv.NgaySinh,
          ).toLocaleDateString("vi-VN");
      }
    });
});

window.dangXuat = function () {
  localStorage.clear();
  window.location.href = "../dangnhap/login.html";
};
