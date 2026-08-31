/* ===== MOCK DATA ===== */
let systemUsers = [
  { id:1, name:"ศักรแทน ขัติย์วงศ์", phone:"081-234-5678", role:"admin" },
  { id:2, name:"สมศักดิ์ มีสุข", phone:"089-876-5432", role:"staff" },
  { id:3, name:"วิภา ใจบุญ", phone:"092-345-6789", role:"viewer" },
];

const roleLabel = { admin:"ผู้ดูแลระบบ", staff:"เจ้าหน้าที่", viewer:"ดูข้อมูลอย่างเดียว" };
let editUserId = null;
let userToDelete = null;

/* ===== TABS ===== */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

/* ===== RENDER USER TABLE ===== */
function renderUsers() {
  const table = document.getElementById("userTable");
  table.innerHTML = "";
  systemUsers.forEach(u => {
    const row = document.createElement("div");
    row.className = "user-row";
    row.innerHTML = `
      <div class="u-avatar"><i class="fa-solid fa-user"></i></div>
      <div class="u-info"><strong>${u.name}</strong><span>${u.phone}</span></div>
      <span class="role-badge ${u.role}">${roleLabel[u.role]}</span>
      <div class="u-actions">
        <button class="icon-btn edit" data-id="${u.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn delete" data-id="${u.id}"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    table.appendChild(row);
  });

  document.querySelectorAll(".icon-btn.edit").forEach(btn => {
    btn.addEventListener("click", () => openUserModal(parseInt(btn.dataset.id)));
  });
  document.querySelectorAll(".icon-btn.delete").forEach(btn => {
    btn.addEventListener("click", () => {
      userToDelete = parseInt(btn.dataset.id);
      systemUsers = systemUsers.filter(u => u.id !== userToDelete);
      renderUsers();
      showToast("ลบผู้ใช้งานเรียบร้อยแล้ว", "success");
    });
  });
}

/* ===== USER MODAL ===== */
const userModal = document.getElementById("userModal");
document.getElementById("btnAddUser").addEventListener("click", () => openUserModal(null));

function openUserModal(id) {
  editUserId = id;
  if (id) {
    const u = systemUsers.find(x => x.id === id);
    document.getElementById("userModalTitle").innerText = "แก้ไขผู้ใช้งาน";
    document.getElementById("inputUserName").value = u.name;
    document.getElementById("inputUserPhone").value = u.phone;
    document.getElementById("inputUserRole").value = u.role;
  } else {
    document.getElementById("userModalTitle").innerText = "เพิ่มผู้ใช้งานใหม่";
    document.getElementById("inputUserName").value = "";
    document.getElementById("inputUserPhone").value = "";
    document.getElementById("inputUserRole").value = "staff";
  }
  userModal.classList.add("show");
}
document.getElementById("closeUserModal").addEventListener("click", () => userModal.classList.remove("show"));
document.getElementById("cancelUserModal").addEventListener("click", () => userModal.classList.remove("show"));

document.getElementById("saveUser").addEventListener("click", () => {
  const name = document.getElementById("inputUserName").value.trim();
  const phone = document.getElementById("inputUserPhone").value.trim();
  const role = document.getElementById("inputUserRole").value;

  if (!name || !phone) {
    showToast("กรุณากรอกชื่อและเบอร์โทรศัพท์", "error");
    return;
  }

  if (editUserId) {
    const u = systemUsers.find(x => x.id === editUserId);
    u.name = name; u.phone = phone; u.role = role;
    showToast("แก้ไขข้อมูลผู้ใช้งานสำเร็จ", "success");
  } else {
    systemUsers.push({ id: Date.now(), name, phone, role });
    showToast("เพิ่มผู้ใช้งานใหม่สำเร็จ", "success");
  }
  userModal.classList.remove("show");
  renderUsers();
});

/* ===== GENERAL / NOTIFY SAVE ===== */
document.getElementById("saveGeneral").addEventListener("click", () => {
  showToast("บันทึกการตั้งค่าทั่วไปสำเร็จ", "success");
});
document.getElementById("saveNotify").addEventListener("click", () => {
  showToast("บันทึกการตั้งค่าการแจ้งเตือนสำเร็จ", "success");
});

/* ===== BACKUP / RESTORE ===== */
document.getElementById("btnBackup").addEventListener("click", () => {
  showToast("กำลังสำรองข้อมูลทั้งหมด...", "success");
});
document.getElementById("btnRestore").addEventListener("click", () => {
  showToast("กรุณาเลือกไฟล์สำรองข้อมูล (.json)", "success");
});

/* ===== RESET ALL ===== */
const resetModal = document.getElementById("resetModal");
document.getElementById("btnResetAll").addEventListener("click", () => resetModal.classList.add("show"));
document.getElementById("cancelReset").addEventListener("click", () => resetModal.classList.remove("show"));
document.getElementById("confirmReset").addEventListener("click", () => {
  resetModal.classList.remove("show");
  showToast("ล้างข้อมูลทั้งหมดในระบบเรียบร้อยแล้ว", "success");
});

/* ===== INIT ===== */
renderUsers();
