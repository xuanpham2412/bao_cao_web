document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("userRole") !== "GiangVien") {
    window.location.href = "../dangnhap/login.html";
    return;
  }
  const maGV = localStorage.getItem("username");

  // Lấy tên gán lên Header
  fetch(`http://localhost:3000/api/thongtin_giangvien/${maGV}`)
    .then((res) => res.json())
    .then((result) => {
      if (result.success)
        document.getElementById("welcomeName").innerText =
          " Giảng viên: " + result.data.TenGV;
    });
});

window.layDanhSachLop = function () {
  const maLop = document.getElementById("inputMaLop").value.trim();
  const maMH = document.getElementById("inputMaMH").value.trim();

  if (!maLop || !maMH) {
    alert("Vui lòng nhập đầy đủ Mã Lớp và Mã Môn Học!");
    return;
  }

  document.getElementById("tableTitle").innerText =
    `Danh sách điểm - Lớp: ${maLop} | Môn: ${maMH}`;
  const tbody = document.getElementById("bangDiemBody");
  tbody.innerHTML = `<tr><td colspan="6" class="empty-message">Đang tải dữ liệu...</td></tr>`;

  fetch(`http://localhost:3000/api/diem-lop/${maLop}/${maMH}`)
    .then((res) => res.json())
    .then((result) => {
      if (result.success) {
        tbody.innerHTML = "";
        if (result.data.length === 0) {
          tbody.innerHTML = `<tr><td colspan="6" class="empty-message">Không tìm thấy sinh viên nào hoặc sai mã!</td></tr>`;
          return;
        }

        result.data.forEach((row) => {
          const diemHienTai = row.Diem !== null ? row.Diem : "";
          const colorDiem =
            row.Diem !== null && row.Diem < 4 ? "color: red;" : "color: green;";

          tbody.innerHTML += `
                    <tr>
                        <td>${row.MaSV}</td>
                        <td>${row.TenSV}</td>
                        <td>${row.MaMH}</td>
                        <td>${row.TenMH}</td>
                        <td>
                            <input type="number" step="0.1" max="10" min="0" 
                                   id="diem_${row.MaSV}" class="input-diem" 
                                   value="${diemHienTai}" style="${colorDiem}">
                        </td>
                        <td>
                            <button class="btn-save" onclick="luuDiem('${row.MaSV}', '${row.MaMH}')">Lưu</button>
                            <button class="btn-delete" onclick="xoaDiem('${row.MaSV}', '${row.MaMH}')">Xóa</button>
                        </td>
                    </tr>
                `;
        });
      } else {
        alert("Lỗi: " + result.message);
      }
    })
    .catch((err) => {
      document.getElementById("bangDiemBody").innerHTML =
        `<tr><td colspan="6" class="empty-message" style="color:red;">Lỗi kết nối máy chủ!</td></tr>`;
    });
};

window.luuDiem = function (maSV, maMH) {
  const diemInput = document.getElementById(`diem_${maSV}`).value;
  if (diemInput === "") return alert("Vui lòng nhập điểm!");

  fetch("http://localhost:3000/api/capnhatdiem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      maSV: maSV,
      maMH: maMH,
      diem: parseFloat(diemInput),
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.success) {
        alert(` Đã lưu điểm cho sinh viên ${maSV}!`);
        layDanhSachLop();
      } else {
        alert(" Lỗi: " + result.message);
      }
    });
};

window.xoaDiem = function (maSV, maMH) {
  if (document.getElementById(`diem_${maSV}`).value === "")
    return alert("Chưa có điểm để xóa!");
  if (!confirm(` Xóa điểm của sinh viên ${maSV}?`)) return;

  fetch(`http://localhost:3000/api/xoadiem/${maSV}/${maMH}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.success) {
        alert(` Đã xóa điểm!`);
        layDanhSachLop();
      } else {
        alert(" Lỗi: " + result.message);
      }
    });
};

window.dangXuat = function () {
  localStorage.clear();
  window.location.href = "../dangnhap/login.html";
};
