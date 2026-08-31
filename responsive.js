/* ===== RESPONSIVE SIDEBAR TOGGLE ===== */
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const topbar = document.querySelector(".topbar");
  if (!sidebar || !topbar) return;

  // สร้างปุ่ม hamburger แล้วแทรกไว้หน้าสุดของ topbar-title
  const hamburger = document.createElement("button");
  hamburger.className = "hamburger-btn";
  hamburger.innerHTML = `<i class="fa-solid fa-bars"></i>`;
  hamburger.setAttribute("aria-label", "เปิดเมนู");

  const topbarTitle = topbar.querySelector(".topbar-title");
  topbarTitle.prepend(hamburger);

  // สร้าง overlay
  const overlay = document.createElement("div");
  overlay.className = "sidebar-overlay";
  document.body.appendChild(overlay);

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", openSidebar);
  overlay.addEventListener("click", closeSidebar);

  // ปิดเมนูอัตโนมัติเมื่อคลิกลิงก์เมนู (บนมือถือ)
  document.querySelectorAll(".sidebar .menu-item").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 1024) closeSidebar();
    });
  });

  // ปิดเมนูอัตโนมัติถ้าขยายจอกลับมาใหญ่
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) closeSidebar();
  });
});
