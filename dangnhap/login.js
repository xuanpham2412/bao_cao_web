document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  if (!loginForm) return;

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    errorMessage.style.display = "none";
    errorMessage.innerText = "";

    // Gọi API Đăng nhập của XAMPP Backend
    fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert(data.message);
          localStorage.setItem("userRole", data.user.Quyen);
          localStorage.setItem("username", data.user.Username);

          // CHUYỂN HƯỚNG DỰA VÀO QUYỀN VÀ THƯ MỤC MỚI
          if (data.user.Quyen === "Admin") {
            window.location.href = "../admin/admin.html";
          } else if (data.user.Quyen === "SinhVien") {
            window.location.href = "../sinhvien/trangchu.html";
          } else if (data.user.Quyen === "GiangVien") {
            window.location.href = "../giangvien/quanlybangdiem.html";
          }
        } else {
          showError(data.message);
        }
      })
      .catch((error) => {
        console.error("Lỗi:", error);
        showError(
          "Lỗi kết nối đến máy chủ! Hãy kiểm tra xem Backend đã chạy chưa.",
        );
      });
  });

  function showError(msg) {
    errorMessage.innerText = msg;
    errorMessage.style.display = "block";
  }
});
