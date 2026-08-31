/* ===== MOCK DATA (แทนที่ด้วย Firebase ทีหลัง) ===== */
let riceMembers = [
  {id:1, house:"101", name:"นายสมชาย ใจดี", received:false, time:null},
  {id:2, house:"102", name:"นางสาววิภาดา คำมา", received:false, time:null},
  {id:3, house:"103", name:"นายทองสุข ฟ้าใส", received:false, time:null},
  {id:4, house:"104", name:"นางจันทร์เพ็ญ ดีใจ", received:true, time:"08:15 น."},
  {id:5, house:"105", name:"นายประเสริฐ มั่งมี", received:true, time:"08:22 น."},
  {id:6, house:"106", name:"นางสมศรี รักไทย", received:true, time:"08:30 น."},
  {id:7, house:"107", name:"นายวิรัตน์ ทองคำ", received:true, time:"09:01 น."},
  {id:8, house:"108", name:"นางสาวปิยะดา แจ่มใส", received:false, time:null},
];
let currentFilter = "all";

const riceList = document.getElementById("riceList");
const emptyState = document.getElementById("emptyState");

function renderRiceList() {
  const searchTerm = document.getElementById("searchRice").value.toLowerCase().trim();

  let filtered = riceMembers.filter(m => {
    const matchFilter =
      currentFilter === "all" ? true :
      currentFilter === "received" ? m.received :
      !m.received;
    const matchSearch = m.name.toLowerCase().includes(searchTerm) || m.house.includes(searchTerm);
    return matchFilter && matchSearch;
  });

  riceList.innerHTML = "";
  if (filtered.length === 0) {
    emptyState.style.display = "block";
    riceList.style.display = "none";
  } else {
    emptyState.style.display = "none";
    riceList.style.display = "block";

    filtered.forEach((m, index) => {
      const row = document.createElement("div");
      row.className = `rice-row ${m.received ? "received" : ""}`;
      row.style.animationDelay = `${index * 0.03}s`;

      row.innerHTML = `
        <div class="rice-checkbox ${m.received ? "checked" : ""}" data-id="${m.id}">
          <i class="fa-solid fa-check"></i>
        </div>
        <div class="rice-info">
          <strong>บ้านเลขที่ ${m.house} — ${m.name}</strong>
          <span>${m.received ? "รับข้าวเรียบร้อยแล้ว" : "ยังไม่ได้ส่งข้าว"}</span>
        </div>
        <span class="rice-time ${m.time ? "" : "empty"}">${m.time || "ยังไม่รับ"}</span>
        <span class="rice-status-tag ${m.received ? "received" : "pending"}">
          ${m.received ? "รับแล้ว" : "รอดำเนินการ"}
        </span>
      `;
      riceList.appendChild(row);
    });
  }

  attachCheckboxEvents();
  updateStats();
  document.getElementById("listCounter").innerText = `${filtered.length} / ${riceMembers.length} ครัวเรือน`;
}

function attachCheckboxEvents() {
  document.querySelectorAll(".rice-checkbox").forEach(box => {
    box.addEventListener("click", () => {
      const id = parseInt(box.dataset.id);
      const member = riceMembers.find(m => m.id === id);
      member.received = !member.received;

      if (member.received) {
        const now = new Date();
        member.time = now.toLocaleTimeString("th-TH", {hour:"2-digit", minute:"2-digit"}) + " น.";
        showToast(`บันทึกรับข้าว: บ้านเลขที่ ${member.house} สำเร็จ`, "success");
      } else {
        member.time = null;
        showToast(`ยกเลิกการรับข้าว: บ้านเลขที่ ${member.house}`, "error");
      }

      box.classList.add("pop");
      setTimeout(() => renderRiceList(), 250);
    });
  });
}

/* ===== STATS + PROGRESS RING (real-time update) ===== */
function updateStats() {
  const total = riceMembers.length;
  const received = riceMembers.filter(m => m.received).length;
  const pending = total - received;
  const percent = total === 0 ? 0 : Math.round((received / total) * 100);

  animateNumber(document.getElementById("statTotal"), total, 600);
  animateNumber(document.getElementById("statReceived"), received, 600);
  animateNumber(document.getElementById("statPending"), pending, 600);
  document.getElementById("statPercent").innerText = percent + "%";

  const circle = document.getElementById("miniRingFill");
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
}

/* ===== SEARCH + FILTER ===== */
document.getElementById("searchRice").addEventListener("input", renderRiceList);
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderRiceList();
  });
});

/* ===== EXPORT BUTTON ===== */
document.getElementById("btnExport").addEventListener("click", () => {
  showToast("กำลังสร้างรายงาน PDF...", "success");
});

/* ===== INIT ===== */
renderRiceList();
