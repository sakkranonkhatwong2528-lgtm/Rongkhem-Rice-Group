/* ===== MOCK DATA ===== */
const funeralHistory = [
  {
    id:1, name:"นายบุญมี ทองสุข", age:80, house:"45", year:2569,
    deathDate:"5 มิถุนายน 2569", funeralDate:"8 มิถุนายน 2569", place:"วัดร่องเข็ม",
    totalHouseholds:176, received:176, riceTotal:176,
    photo:"https://placehold.co/120x120/e8e0d0/555?text=รูป"
  },
  {
    id:2, name:"นางสาวสมหญิง แสงจันทร์", age:65, house:"22", year:2569,
    deathDate:"2 พฤษภาคม 2569", funeralDate:"5 พฤษภาคม 2569", place:"วัดร่องเข็ม",
    totalHouseholds:174, received:170, riceTotal:170,
    photo:"https://placehold.co/120x120/e8e0d0/555?text=รูป"
  },
  {
    id:3, name:"นายสุนทร ใจงาม", age:75, house:"12", year:2568,
    deathDate:"18 ธันวาคม 2568", funeralDate:"21 ธันวาคม 2568", place:"วัดร่องเข็ม",
    totalHouseholds:170, received:165, riceTotal:165,
    photo:"https://placehold.co/120x120/e8e0d0/555?text=รูป"
  },
  {
    id:4, name:"นางลำใย ดวงดี", age:88, house:"67", year:2568,
    deathDate:"3 กันยายน 2568", funeralDate:"6 กันยายน 2568", place:"วัดร่องเข็ม",
    totalHouseholds:168, received:160, riceTotal:160,
    photo:"https://placehold.co/120x120/e8e0d0/555?text=รูป"
  },
  {
    id:5, name:"นายเจริญ พูลสวัสดิ์", age:70, house:"90", year:2567,
    deathDate:"14 กุมภาพันธ์ 2567", funeralDate:"17 กุมภาพันธ์ 2567", place:"วัดร่องเข็ม",
    totalHouseholds:160, received:150, riceTotal:150,
    photo:"https://placehold.co/120x120/e8e0d0/555?text=รูป"
  },
];

let currentYearFilter = "all";

/* ===== INIT YEAR FILTER BUTTONS ===== */
function initYearFilters() {
  const years = [...new Set(funeralHistory.map(f => f.year))].sort((a,b) => b - a);
  const group = document.getElementById("yearFilterGroup");
  years.forEach(year => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.year = year;
    btn.innerText = `ปี ${year}`;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentYearFilter = String(year);
      renderHistory();
    });
    group.appendChild(btn);
  });
  document.querySelector('[data-year="all"]').addEventListener("click", function() {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    this.classList.add("active");
    currentYearFilter = "all";
    renderHistory();
  });
}

/* ===== RENDER SUMMARY ===== */
function renderHistorySummary() {
  const totalFunerals = funeralHistory.length;
  const totalRice = funeralHistory.reduce((sum, f) => sum + f.riceTotal, 0);
  const avgPercent = Math.round(
    funeralHistory.reduce((sum, f) => sum + (f.received / f.totalHouseholds) * 100, 0) / totalFunerals
  );
  const currentYear = 2569; // ปี พ.ศ. ปัจจุบันของระบบ
  const thisYearCount = funeralHistory.filter(f => f.year === currentYear).length;

  animateNumber(document.getElementById("hTotalFunerals"), totalFunerals);
  animateNumber(document.getElementById("hTotalRice"), totalRice);
  animateNumber(document.getElementById("hAvgPercent"), avgPercent);
  animateNumber(document.getElementById("hThisYear"), thisYearCount);
}

/* ===== RENDER LIST ===== */
function renderHistory() {
  const searchTerm = document.getElementById("searchHistory").value.toLowerCase().trim();
  const list = document.getElementById("historyList");
  const emptyState = document.getElementById("emptyState");

  let filtered = funeralHistory
    .filter(f => currentYearFilter === "all" || String(f.year) === currentYearFilter)
    .filter(f => f.name.toLowerCase().includes(searchTerm))
    .sort((a,b) => b.id - a.id);

  list.innerHTML = "";
  if (filtered.length === 0) {
    emptyState.style.display = "block";
    list.style.display = "none";
    return;
  }
  emptyState.style.display = "none";
  list.style.display = "flex";

  filtered.forEach((f, i) => {
    const percent = Math.round((f.received / f.totalHouseholds) * 100);
    const card = document.createElement("div");
    card.className = "history-card";
    card.style.animationDelay = `${i * 0.06}s`;
    card.innerHTML = `
      <div class="history-photo"><img src="${f.photo}" alt=""></div>
      <div class="history-info">
        <h4>${f.name}</h4>
        <div class="h-sub">
          <span><i class="fa-solid fa-house"></i> บ้านเลขที่ ${f.house}</span>
          <span><i class="fa-solid fa-calendar"></i> ฌาปนกิจ ${f.funeralDate}</span>
          <span><i class="fa-solid fa-location-dot"></i> ${f.place}</span>
        </div>
      </div>
      <div class="history-progress">
        <span class="h-percent-text">${percent}% (${f.received}/${f.totalHouseholds})</span>
        <div class="h-progress-bar"><div class="h-progress-fill" style="width:${percent}%"></div></div>
      </div>
      <span class="history-year-tag">พ.ศ. ${f.year}</span>
    `;
    card.addEventListener("click", () => openHistoryDetail(f.id));
    list.appendChild(card);
  });
}

/* ===== DETAIL MODAL ===== */
const historyModal = document.getElementById("historyDetailModal");
function openHistoryDetail(id) {
  const f = funeralHistory.find(x => x.id === id);
  const percent = Math.round((f.received / f.totalHouseholds) * 100);
  document.getElementById("historyDetailBody").innerHTML = `
    <div style="display:flex; gap:20px; margin-bottom:18px;">
      <img src="${f.photo}" style="width:100px; height:100px; border-radius:14px; object-fit:cover;">
      <div>
        <h2 style="margin-bottom:4px;">${f.name}</h2>
        <p style="color:#9ca3af; font-size:14px;">อายุ ${f.age} ปี • บ้านเลขที่ ${f.house}</p>
      </div>
    </div>
    <div class="detail-grid">
      <div class="detail-item"><i class="fa-solid fa-heart-crack"></i><div><small>วันที่เสียชีวิต</small><strong>${f.deathDate}</strong></div></div>
      <div class="detail-item"><i class="fa-solid fa-fire-flame-curved"></i><div><small>วันฌาปนกิจ</small><strong>${f.funeralDate}</strong></div></div>
      <div class="detail-item"><i class="fa-solid fa-location-dot"></i><div><small>สถานที่</small><strong>${f.place}</strong></div></div>
      <div class="detail-item"><i class="fa-solid fa-calendar"></i><div><small>ปี พ.ศ.</small><strong>${f.year}</strong></div></div>
    </div>
    <div class="detail-stats">
      <div class="detail-stat"><span>${f.totalHouseholds}</span><small>ครัวเรือนทั้งหมด</small></div>
      <div class="detail-stat"><span>${f.received}</span><small>ส่งข้าวสาร</small></div>
      <div class="detail-stat"><span>${percent}%</span><small>ความร่วมมือ</small></div>
    </div>
  `;
  historyModal.classList.add("show");
}
document.getElementById("closeHistoryModal").addEventListener("click", () => historyModal.classList.remove("show"));
document.getElementById("closeHistoryModal2").addEventListener("click", () => historyModal.classList.remove("show"));

/* ===== SEARCH ===== */
document.getElementById("searchHistory").addEventListener("input", renderHistory);

/* ===== EXPORT ===== */
document.getElementById("btnExportHistory").addEventListener("click", () => {
  showToast("กำลังส่งออกประวัติงานศพทั้งหมดเป็น PDF...", "success");
});

/* ===== INIT ===== */
initYearFilters();
renderHistorySummary();
renderHistory();
