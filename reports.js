/* ===== MOCK DATA ===== */
const reportDataByYear = {
  "2569": {
    totalFunerals: 6,
    totalRice: 986,
    avgPercent: 91,
    monthly: [80, 95, 0, 176, 170, 88, 0, 0, 0, 0, 0, 0], // ถังข้าวสารต่อเดือน
    received: 91, notReceived: 9
  },
  "2568": {
    totalFunerals: 8,
    totalRice: 1240,
    avgPercent: 87,
    monthly: [60, 0, 90, 0, 150, 0, 0, 160, 0, 0, 165, 0],
    received: 87, notReceived: 13
  },
  "2567": {
    totalFunerals: 5,
    totalRice: 780,
    avgPercent: 84,
    monthly: [0, 150, 0, 0, 0, 0, 0, 0, 130, 0, 0, 0],
    received: 84, notReceived: 16
  }
};

const yearlyComparison = { labels: ["2567", "2568", "2569"], data: [5, 8, 6] };

const laggingHouseholds = [
  { name: "นายวิเชียร แสงทอง", house: "34", count: 4 },
  { name: "นางสมพร ใจดี", house: "112", count: 3 },
  { name: "นายอุดม พูลทรัพย์", house: "56", count: 3 },
  { name: "นางสาวรัตนา ศรีสุข", house: "89", count: 2 },
  { name: "นายชาญ วงศ์ษา", house: "21", count: 2 },
];

let monthlyChartInstance, donutChartInstance, yearlyChartInstance;

const monthLabels = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

/* ===== RENDER SUMMARY ===== */
function renderReportSummary(year) {
  const d = reportDataByYear[year];
  animateNumber(document.getElementById("rTotalFunerals"), d.totalFunerals);
  animateNumber(document.getElementById("rTotalRice"), d.totalRice);
  animateNumber(document.getElementById("rAvgPercent"), d.avgPercent);
  animateNumber(document.getElementById("rLowest"), laggingHouseholds[0].count);
}

/* ===== MONTHLY BAR CHART ===== */
function renderMonthlyChart(year) {
  const d = reportDataByYear[year];
  const ctx = document.getElementById("monthlyChart").getContext("2d");
  if (monthlyChartInstance) monthlyChartInstance.destroy();
  monthlyChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: monthLabels,
      datasets: [{
        label: "ข้าวสาร (ถัง)",
        data: d.monthly,
        backgroundColor: "#2d6a4f",
        borderRadius: 6,
        maxBarThickness: 34
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: "#f3f4f6" } },
        x: { grid: { display: false } }
      }
    }
  });
}

/* ===== DONUT CHART ===== */
function renderDonutChart(year) {
  const d = reportDataByYear[year];
  const ctx = document.getElementById("donutChart").getContext("2d");
  if (donutChartInstance) donutChartInstance.destroy();
  donutChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["ส่งข้าวสารแล้ว", "ยังไม่ส่ง"],
      datasets: [{
        data: [d.received, d.notReceived],
        backgroundColor: ["#2d6a4f", "#e5e7eb"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: "70%",
      plugins: { legend: { position: "bottom", labels: { font: { family: "Kanit" }, padding: 16 } } }
    }
  });
}

/* ===== YEARLY COMPARISON CHART ===== */
function renderYearlyChart() {
  const ctx = document.getElementById("yearlyChart").getContext("2d");
  if (yearlyChartInstance) yearlyChartInstance.destroy();
  yearlyChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: yearlyComparison.labels.map(y => `พ.ศ. ${y}`),
      datasets: [{
        label: "จำนวนงานศพ",
        data: yearlyComparison.data,
        borderColor: "#2d6a4f",
        backgroundColor: "rgba(45,106,79,.1)",
        fill: true, tension: 0.4,
        pointBackgroundColor: "#2d6a4f",
        pointRadius: 5
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#f3f4f6" } },
        x: { grid: { display: false } }
      }
    }
  });
}

/* ===== RANKING LIST ===== */
function renderRanking() {
  const list = document.getElementById("rankingList");
  list.innerHTML = "";
  laggingHouseholds.forEach((h, i) => {
    const item = document.createElement("div");
    item.className = "ranking-item";
    item.style.animationDelay = `${i * 0.08}s`;
    item.innerHTML = `
      <div class="rank-number">${i + 1}</div>
      <div class="rank-info"><strong>${h.name}</strong><span>บ้านเลขที่ ${h.house}</span></div>
      <div class="rank-count">ค้าง ${h.count} ครั้ง</div>
    `;
    list.appendChild(item);
  });
}

/* ===== YEAR SELECT ===== */
document.getElementById("yearSelect").addEventListener("change", (e) => {
  const year = e.target.value;
  renderReportSummary(year);
  renderMonthlyChart(year);
  renderDonutChart(year);
});

/* ===== EXPORT BUTTONS ===== */
document.getElementById("btnExportExcel").addEventListener("click", () => {
  showToast("กำลังส่งออกรายงานเป็นไฟล์ Excel...", "success");
});
document.getElementById("btnExportPDF").addEventListener("click", () => {
  showToast("กำลังส่งออกรายงานเป็นไฟล์ PDF...", "success");
});

/* ===== INIT ===== */
const initialYear = "2569";
renderReportSummary(initialYear);
renderMonthlyChart(initialYear);
renderDonutChart(initialYear);
renderYearlyChart();
renderRanking();
