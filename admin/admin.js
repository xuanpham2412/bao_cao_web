let currentTableData = {}; // Biến toàn cục để lưu dữ liệu bảng hiện tại

document.addEventListener("DOMContentLoaded", () => {
  const role = localStorage.getItem("userRole");
  if (!role) {
    alert("Vui lòng đăng nhập!");
    window.location.href = "../dangnhap/login.html";
    return;
  }
  document.getElementById("userInfo").innerText = "Quyền: " + role;
  if (role === "Admin") {
    document.getElementById("adminContainer").style.display = "flex";
    loadData("khoa");
  }

  // Chuyển Tab
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      this.classList.add("active");
      const targetId = this.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");

      const dataType = targetId.replace("tab", "").toLowerCase();
      cancelEdit(dataType); // Hủy trạng thái sửa nếu đổi tab
      loadData(dataType);
    });
  });

  document.getElementById("btnLogout").addEventListener("click", function () {
    localStorage.removeItem("userRole");
    window.location.href = "../dangnhap/login.html";
  });

  // Xử lý nút LƯU / CẬP NHẬT
  const forms = document.querySelectorAll(".tab-content form");
  forms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const type = this.getAttribute("data-type");
      let data = {};

      if (type === "khoa")
        data = {
          maKhoa: document.getElementById("khoa_ma").value,
          tenKhoa: document.getElementById("khoa_ten").value,
        };
      else if (type === "lop")
        data = {
          maLop: document.getElementById("lop_ma").value,
          tenLop: document.getElementById("lop_ten").value,
          maKhoa: document.getElementById("lop_makhoa").value,
        };
      else if (type === "giangvien")
        data = {
          maGV: document.getElementById("gv_ma").value,
          tenGV: document.getElementById("gv_ten").value,
          email: document.getElementById("gv_email").value,
          maKhoa: document.getElementById("gv_makhoa").value,
        };
      else if (type === "sinhvien")
        data = {
          maSV: document.getElementById("sv_ma").value,
          tenSV: document.getElementById("sv_ten").value,
          ngaySinh: document.getElementById("sv_ngay").value,
          gioiTinh: document.getElementById("sv_gioitinh").value,
          maLop: document.getElementById("sv_malop").value,
        };
      else if (type === "monhoc")
        data = {
          maMH: document.getElementById("mh_ma").value,
          tenMH: document.getElementById("mh_ten").value,
          soTinChi: document.getElementById("mh_tinchi").value,
        };
      else if (type === "lichhoc")
        data = {
          maLop: document.getElementById("lh_malop").value,
          maMH: document.getElementById("lh_mamh").value,
          maGV: document.getElementById("lh_magv").value,
          phongHoc: document.getElementById("lh_phong").value,
          thu: document.getElementById("lh_thu").value,
          caHoc: document.getElementById("lh_cahoc").value,
        };

      // Kiểm tra xem đang Thêm mới hay Sửa
      const isEdit = this.hasAttribute("data-edit-id");
      let editId = isEdit ? this.getAttribute("data-edit-id") : null;
      if (type === "lichhoc" && isEdit)
        editId = document.getElementById("lh_malich_hidden").value;

      const url = isEdit
        ? `http://localhost:3000/api/sua/${type}/${editId}`
        : `http://localhost:3000/api/them${type}`;
      const method = isEdit ? "PUT" : "POST";

      fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((result) => {
          if (result.success) {
            alert(`✅ ${result.message}`);
            cancelEdit(type); // Trả form về trạng thái Thêm Mới
            loadData(type);
          } else {
            alert(`❌ Lỗi: ${result.message}`);
          }
        })
        .catch((err) => alert("❌ Lỗi kết nối đến máy chủ!"));
    });
  });
});

// HÀM TẢI DỮ LIỆU
window.loadData = function (type) {
  fetch(`http://localhost:3000/api/danhsach/${type}`)
    .then((res) => res.json())
    .then((result) => {
      if (result.success) {
        currentTableData[type] = result.data; // Lưu lại để dùng cho chức năng Sửa
        const tbody = document.querySelector(`#table_${type} tbody`);
        tbody.innerHTML = "";

        result.data.forEach((row) => {
          let tr = document.createElement("tr");
          let rowId = Object.values(row)[0]; // Lấy giá trị cột đầu tiên làm ID (VD: MaKhoa, MaLop)

          Object.keys(row).forEach((key) => {
            let td = document.createElement("td");
            let val = row[key];
            if (key === "NgaySinh" && val) val = val.split("T")[0]; // Định dạng yyyy-mm-dd cho ô input
            td.innerText = val;
            tr.appendChild(td);
          });

          // Cột Hành Động
          let tdAction = document.createElement("td");
          tdAction.className = "action-col";
          tdAction.innerHTML = `
                    <button class="btn-edit" onclick="editData('${type}', '${rowId}')">Sửa</button>
                    <button class="btn-delete" onclick="deleteData('${type}', '${rowId}')">Xóa</button>
                `;
          tr.appendChild(tdAction);
          tbody.appendChild(tr);
        });
      }
    })
    .catch((err) => console.error("Lỗi lấy danh sách:", err));
};

// HÀM XÓA DỮ LIỆU
window.deleteData = function (type, id) {
  if (!confirm(" Bạn có chắc chắn muốn xóa dữ liệu này?")) return;

  fetch(`http://localhost:3000/api/xoa/${type}/${id}`, { method: "DELETE" })
    .then((res) => res.json())
    .then((result) => {
      alert(
        result.success ? ` ${result.message}` : `❌ Lỗi: ${result.message}`,
      );
      if (result.success) loadData(type);
    })
    .catch((err) => alert(" Lỗi mạng!"));
};

// HÀM CHUẨN BỊ SỬA DỮ LIỆU
window.editData = function (type, id) {
  // Tìm object chứa dữ liệu của dòng vừa click
  const item = currentTableData[type].find((r) => Object.values(r)[0] == id);
  if (!item) return;

  // Đẩy dữ liệu lên Form tương ứng
  if (type === "khoa") {
    document.getElementById("khoa_ma").value = item.MaKhoa;
    document.getElementById("khoa_ten").value = item.TenKhoa;
  } else if (type === "lop") {
    document.getElementById("lop_ma").value = item.MaLop;
    document.getElementById("lop_ten").value = item.TenLop;
    document.getElementById("lop_makhoa").value = item.MaKhoa;
  } else if (type === "giangvien") {
    document.getElementById("gv_ma").value = item.MaGV;
    document.getElementById("gv_ten").value = item.TenGV;
    document.getElementById("gv_email").value = item.Email;
    document.getElementById("gv_makhoa").value = item.MaKhoa;
  } else if (type === "sinhvien") {
    document.getElementById("sv_ma").value = item.MaSV;
    document.getElementById("sv_ten").value = item.TenSV;
    document.getElementById("sv_ngay").value = item.NgaySinh
      ? item.NgaySinh.split("T")[0]
      : "";
    document.getElementById("sv_gioitinh").value = item.GioiTinh;
    document.getElementById("sv_malop").value = item.MaLop;
  } else if (type === "monhoc") {
    document.getElementById("mh_ma").value = item.MaMH;
    document.getElementById("mh_ten").value = item.TenMH;
    document.getElementById("mh_tinchi").value = item.SoTinChi;
  } else if (type === "lichhoc") {
    document.getElementById("lh_malich_hidden").value = item.MaLich;
    document.getElementById("lh_malop").value = item.MaLop;
    document.getElementById("lh_mamh").value = item.MaMH;
    document.getElementById("lh_magv").value = item.MaGV;
    document.getElementById("lh_phong").value = item.PhongHoc;

    document.getElementById("lh_thu").value = item.Thu;
    document.getElementById("lh_cahoc").value = item.CaHoc;
  }

  // Đổi giao diện Form sang chế độ Cập Nhật
  const form = document.querySelector(`form[data-type="${type}"]`);
  form.setAttribute("data-edit-id", id);

  // Khóa trường ID lại không cho sửa (Khóa chính không được phép đổi)
  const firstInput = form.querySelector("input");
  if (type !== "lichhoc") firstInput.disabled = true;

  document.getElementById(`title_${type}`).innerText = "Cập Nhật Dữ Liệu";

  const btnSubmit = document.getElementById(`btn_submit_${type}`);
  btnSubmit.innerText = "Lưu Cập Nhật";
  btnSubmit.classList.add("btn-warning");

  document.getElementById(`btn_cancel_${type}`).style.display = "block";

  window.scrollTo(0, 0); // Cuộn lên đầu trang
};

// HÀM HỦY CHẾ ĐỘ SỬA
window.cancelEdit = function (type) {
  const form = document.querySelector(`form[data-type="${type}"]`);
  form.reset();
  form.removeAttribute("data-edit-id");

  // Mở khóa lại trường ID
  const firstInput = form.querySelector("input");
  firstInput.disabled = false;

  // Đổi chữ viết hoa chữ cái đầu (VD: khoa -> Khoa)
  const TypeName = type.charAt(0).toUpperCase() + type.slice(1);

  document.getElementById(`title_${type}`).innerText = `Thêm ${TypeName} Mới`;

  const btnSubmit = document.getElementById(`btn_submit_${type}`);
  btnSubmit.innerText = `Lưu ${TypeName}`;
  btnSubmit.classList.remove("btn-warning");

  document.getElementById(`btn_cancel_${type}`).style.display = "none";
};
