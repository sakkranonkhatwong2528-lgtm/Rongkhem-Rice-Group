/* ===== MOCK DATA ===== */
const funeralData = { total: 176, received: 132 };

const activities = [
  {icon:"fa-check", name:"บ้านเลขที่ 106 นางสมศรี รักไทย", action:"ส่งข้าวสารเรียบร้อยแล้ว", time:"09:01 น."},
  {icon:"fa-check", name:"บ้านเลขที่ 105 นายประเสริฐ มั่งมี", action:"ส่งข้าวสารเรียบร้อยแล้ว", time:"08:22 น."},
  {icon:"fa-check", name:"บ้านเลขที่ 104 นางจันทร์เพ็ญ ดีใจ", action:"ส่งข้าวสารเรียบร้อยแล้ว", time:"08:15 น."},
  {icon:"fa-bullhorn", name:"ระบบ", action:"เผยแพร่ประกาศงานฌาปนกิจให้สมาชิกทราบ", time:"07:00 น."},
  {icon:"fa-heart-crack", name:"ระบบ", action:"เพิ่มข้อมูลงานศพ นายเกษมสุข ใฝ่ใจ", time:"20 ก.ค. 2569"},
];

/* ===== RENDER SUMMARY ===== */
function renderSummary() {
  const pending = funeralData.total - funeralData.received;
  const percent = Math.round((funeralData.received / funeralData.total) * 100);

  animateNumber(document.getElementById("sumTotal"), funeralData.total);
  animateNumber(document.getElementById("sumReceived"), funeralData.received);
  animateNumber(document.getElementById("sumPending"), pending);
  animateNumber(document.getElementById("sumPercent"), percent);
}

/* ===== RENDER ACTIVITY LIST ===== */
function renderActivity() {
  const list = document.getElementById("activityList");
  list.innerHTML = "";
  activities.forEach((a, i) => {
    const item = document.createElement("div");
    item.className = "activity-item";
    item.style.animationDelay = `${i * 0.08}s`;
    item.innerHTML = `
      <div class="activity-icon"><i class="fa-solid ${a.icon}"></i></div>
      <div class="activity-text">
        <strong>${a.name}</strong>
        <span>${a.action} • ${a.time}</span>
      </div>
    `;
    list.appendChild(item);
  });
}

/* ===== BUTTON EVENTS ===== */
document.getElementById("btnEditFuneral").addEventListener("click", () => {
  showToast("เปิดหน้าต่างแก้ไขข้อมูลงานศพ", "success");
});
document.getElementById("btnPrint").addEventListener("click", () => {
  showToast("กำลังเตรียมไฟล์ประกาศสำหรับพิมพ์...", "success");
});

/* ===== INIT ===== */
renderSummary();
renderActivity();
