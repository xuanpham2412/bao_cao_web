document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("userRole") !== "SinhVien")
    window.location.href = "../dangnhap/login.html";
  const maSV = localStorage.getItem("username");

  fetch(`http://localhost:3000/api/thongtin_sinhvien/${maSV}`)
    .then((res) => res.json())
    .then((result) => {
      if (result.success) {
        document.getElementById("welcomeName").innerText =
          "Sinh viên: " + result.data.TenSV;
        const maLop = result.data.MaLop;
        document.getElementById("tenLop").innerText = maLop;
        taiLichHoc(maLop);
      }
    });
});

function taiLichHoc(maLop) {
  fetch(`http://localhost:3000/api/lichhoc-sinhvien/${maLop}`)
    .then((res) => res.json())
    .then((result) => {
      const tbody = document.getElementById("bangLichHoc");
      tbody.innerHTML = "";

      if (!result.success || result.data.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="7" class="text-center">Lớp của bạn chưa có lịch học nào.</td></tr>';
        return;
      }

      // Đã bổ sung 'Thứ 7' vào lưới ma trận
      const grid = {
        Sáng: {
          "Thứ 2": "",
          "Thứ 3": "",
          "Thứ 4": "",
          "Thứ 5": "",
          "Thứ 6": "",
          "Thứ 7": "",
        },
        Chiều: {
          "Thứ 2": "",
          "Thứ 3": "",
          "Thứ 4": "",
          "Thứ 5": "",
          "Thứ 6": "",
          "Thứ 7": "",
        },
        Tối: {
          "Thứ 2": "",
          "Thứ 3": "",
          "Thứ 4": "",
          "Thứ 5": "",
          "Thứ 6": "",
          "Thứ 7": "",
        },
      };

      result.data.forEach((row) => {
        if (grid[row.CaHoc] && grid[row.CaHoc][row.Thu] !== undefined) {
          grid[row.CaHoc][row.Thu] += `
                    <div class="subject-box">
                        <strong>${row.TenMH}</strong>
                        <span>Phòng: ${row.PhongHoc}</span>
                        <span>GV: ${row.TenGV}</span>
                    </div>
                `;
        }
      });

      const caList = ["Sáng", "Chiều", "Tối"];
      const thuList = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]; // Đã thêm Thứ 7

      caList.forEach((ca) => {
        let tr = `<tr><td class="ca-col">Ca ${ca}</td>`;
        thuList.forEach((thu) => {
          let cellContent =
            grid[ca][thu] || '<span style="color: #ccc;">-</span>';
          tr += `<td>${cellContent}</td>`;
        });
        tr += `</tr>`;
        tbody.innerHTML += tr;
      });
    });
}

window.dangXuat = function () {
  localStorage.clear();
  window.location.href = "../dangnhap/login.html";
};
