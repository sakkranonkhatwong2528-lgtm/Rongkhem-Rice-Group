/* ===== MOCK DATA (แทนที่ด้วย Firebase ทีหลัง) ===== */
let members = [
  {id:1, house:"101", name:"นายสมชาย ใจดี", phone:"081-234-5678", status:"pending", overdue:2},
  {id:2, house:"102", name:"นางสาววิภาดา คำมา", phone:"082-345-6789", status:"pending", overdue:2},
  {id:3, house:"103", name:"นายทองสุข ฟ้าใส", phone:"083-456-7890", status:"pending", overdue:3},
  {id:4, house:"104", name:"นางจันทร์เพ็ญ ดีใจ", phone:"084-567-8901", status:"paid", overdue:0},
  {id:5, house:"105", name:"นายประเสริฐ มั่งมี", phone:"085-678-9012", status:"paid", overdue:0},
  {id:6, house:"106", name:"นางสมศรี รักไทย", phone:"086-789-0123", status:"paid", overdue:0},
];
let currentFilter = "all";
let deleteTargetId = null;
let editTargetId = null;

const tbody = document.getElementById("memberTbody");
const emptyState = document.getElementById("emptyState");

function renderMembers() {
  const searchTerm = document.getElementById("searchMember").value.toLowerCase().trim();

  let filtered = members.filter(m => {
    const matchFilter = currentFilter === "all" || m.status === currentFilter;
    const matchSearch = m.name.toLowerCase().includes(searchTerm) || m.house.includes(searchTerm);
    return matchFilter && matchSearch;
  });

  tbody.innerHTML = "";
  if (filtered.length === 0) {
    emptyState.style.display = "block";
    document.getElementById("memberTable").style.display = "none";
    return;
  }
  emptyState.style.display = "none";
  document.getElementById("memberTable").style.display = "table";

  filtered.forEach((m, index) => {
    const tr = document.createElement("tr");
    tr.style.animationDelay = `${index * 0.04}s`;

    const overdueClass = m.overdue === 0 ? "zero" : m.overdue >= 3 ? "danger" : "warn";
    const statusHtml = m.status === "paid"
      ? `<span class="status-pill paid"><i class="fa-solid fa-check"></i> รับแล้ว</span>`
      : `<span class="status-pill pending"><i class="fa-regular fa-clock"></i> ค้างส่ง</span>`;

    tr.innerHTML = `
      <td>${m.house}</td>
      <td>${m.name}</td>
      <td>${m.phone}</td>
      <td>${statusHtml}</td>
      <td><span class="overdue-count ${overdueClass}">${m.overdue} ครั้ง</span></td>
      <td>
        <button class="icon-btn edit" data-id="${m.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn delete" data-id="${m.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  attachRowEvents();
}

function attachRowEvents() {
  document.querySelectorAll(".icon-btn.edit").forEach(btn => {
    btn.addEventListener("click", () => openEditModal(parseInt(btn.dataset.id)));
  });
  document.querySelectorAll(".icon-btn.delete").forEach(btn => {
    btn.addEventListener("click", () => openDeleteModal(parseInt(btn.dataset.id)));
  });
}

/* ===== SEARCH (Real-time) ===== */
document.getElementById("searchMember").addEventListener("input", renderMembers);

/* ===== FILTER BUTTONS ===== */
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderMembers();
  });
});

/* ===== ADD / EDIT MODAL ===== */
const memberModal = document.getElementById("memberModal");
document.getElementById("btnAddMember").addEventListener("click", () => {
  editTargetId = null;
  document.getElementById("modalTitle").innerText = "เพิ่มสมาชิกใหม่";
  document.getElementById("inputHouseNo").value = "";
  document.getElementById("inputName").value = "";
  document.getElementById("inputPhone").value = "";
  memberModal.classList.add("show");
});

function openEditModal(id) {
  const m = members.find(x => x.id === id);
  editTargetId = id;
  document.getElementById("modalTitle").innerText = "แก้ไขข้อมูลสมาชิก";
  document.getElementById("inputHouseNo").value = m.house;
  document.getElementById("inputName").value = m.name;
  document.getElementById("inputPhone").value = m.phone;
  memberModal.classList.add("show");
}

document.getElementById("closeModal").addEventListener("click", () => memberModal.classList.remove("show"));
document.getElementById("cancelModal").addEventListener("click", () => memberModal.classList.remove("show"));

document.getElementById("saveMember").addEventListener("click", () => {
  const house = document.getElementById("inputHouseNo").value.trim();
  const name = document.getElementById("inputName").value.trim();
  const phone = document.getElementById("inputPhone").value.trim();

  if (!house || !name) {
    showToast("กรุณากรอกบ้านเลขที่และชื่อ-สกุล", "error");
    return;
  }

  if (editTargetId) {
    const m = members.find(x => x.id === editTargetId);
    m.house = house; m.name = name; m.phone = phone;
    showToast("แก้ไขข้อมูลสมาชิกสำเร็จ", "success");
  } else {
    members.push({ id: Date.now(), house, name, phone, status: "pending", overdue: 0 });
    showToast("เพิ่มสมาชิกใหม่สำเร็จ", "success");
  }
  memberModal.classList.remove("show");
  renderMembers();
});

/* ===== DELETE MODAL ===== */
const deleteModal = document.getElementById("deleteModal");
function openDeleteModal(id) {
  deleteTargetId = id;
  const m = members.find(x => x.id === id);
  document.getElementById("deleteTargetName").innerText = `บ้านเลขที่ ${m.house} - ${m.name}`;
  deleteModal.classList.add("show");
}
document.getElementById("cancelDelete").addEventListener("click", () => deleteModal.classList.remove("show"));
document.getElementById("confirmDelete").addEventListener("click", () => {
  members = members.filter(m => m.id !== deleteTargetId);
  deleteModal.classList.remove("show");
  showToast("ลบข้อมูลสมาชิกเรียบร้อยแล้ว", "success");
  renderMembers();
});

/* ===== INIT ===== */
renderMembers();
