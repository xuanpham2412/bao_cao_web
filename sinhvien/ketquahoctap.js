document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("userRole") !== "SinhVien")
    window.location.href = "../dangnhap/login.html";
  const maSV = localStorage.getItem("username");

  fetch(`http://localhost:3000/api/thongtin_sinhvien/${maSV}`)
    .then((res) => res.json())
    .then((result) => {
      if (result.success)
        document.getElementById("welcomeName").innerText =
          "Sinh viên: " + result.data.TenSV;
    });

  fetch(`http://localhost:3000/api/diem-sinhvien/${maSV}`)
    .then((res) => res.json())
    .then((result) => {
      const tbody = document.getElementById("bangDiem");
      tbody.innerHTML = "";

      if (!result.success || result.data.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="5" class="text-center">Bạn chưa có điểm môn nào.</td></tr>';
        return;
      }

      let tongDiemNhanTinChi = 0;
      let tongTinChi = 0;

      result.data.forEach((row) => {
        const isPass = row.Diem >= 4.0;
        const statusHTML = isPass
          ? '<span class="status-pass">Qua Môn</span>'
          : '<span class="status-fail">Học Lại</span>';

        tongDiemNhanTinChi += row.Diem * row.SoTinChi;
        tongTinChi += row.SoTinChi;

        tbody.innerHTML += `
                <tr>
                    <td>${row.MaMH}</td>
                    <td class="text-bold" style="text-align: left;">${row.TenMH}</td>
                    <td class="text-center">${row.SoTinChi}</td>
                    <td class="text-center text-bold">${row.Diem}</td>
                    <td class="text-center">${statusHTML}</td>
                </tr>
            `;
      });

      document.getElementById("tongTinChi").innerText = tongTinChi;
      if (tongTinChi > 0) {
        const dtb = (tongDiemNhanTinChi / tongTinChi).toFixed(2);
        document.getElementById("diemTrungBinh").innerText = dtb;
      }
    });
});

window.dangXuat = function () {
  localStorage.clear();
  window.location.href = "../dangnhap/login.html";
};
