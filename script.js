/* ===================== CLOCK ===================== */
function updateClock() {
  const now = new Date();
  const days = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"];
  const months = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
  document.getElementById("liveClock").innerText = now.toLocaleTimeString("th-TH",{hour12:false});
  document.getElementById("liveDate").innerText = `วัน${days[now.getDay()]}ที่ ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()+543}`;
}
setInterval(updateClock,1000);
updateClock();

/* ===================== NOTIFICATION DROPDOWN ===================== */
const bellIcon = document.getElementById("bellIcon");
const notifDropdown = document.getElementById("notifDropdown");
bellIcon.addEventListener("click",(e)=>{
  e.stopPropagation();
  notifDropdown.classList.toggle("show");
});
document.addEventListener("click",(e)=>{
  if(!e.target.closest("#bellIcon") && !e.target.closest("#notifDropdown")){
    notifDropdown.classList.remove("show");
  }
});

/* ===================== SIDEBAR ACTIVE MENU ===================== */
document.querySelectorAll(".menu-item").forEach(item=>{
  item.addEventListener("click",(e)=>{
    e.preventDefault();
    document.querySelectorAll(".menu-item").forEach(m=>m.classList.remove("active"));
    item.classList.add("active");
    showToast(`เปิดหน้า: ${item.innerText.trim()}`,"success");
  });
});

/* ===================== ANIMATED NUMBER COUNT-UP ===================== */
function animateNumber(el,target,duration=1200){
  if(!el) return;
  const start = performance.now();
  function step(ts){
    const progress = Math.min((ts-start)/duration,1);
    const eased = 1-Math.pow(1-progress,3);
    el.innerText = Math.floor(eased*target);
    if(progress<1) requestAnimationFrame(step);
    else el.innerText = target;
  }
  requestAnimationFrame(step);
}

/* ===================== PROGRESS RING ===================== */
function animateProgressRing(){
  const circle = document.querySelector(".progress-ring circle.fill");
  if(!circle) return;
  const percent = parseFloat(circle.dataset.percent);
  const radius = circle.r.baseVal.value;
  const circumference = 2*Math.PI*radius;
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference;
  setTimeout(()=>{
    circle.style.strokeDashoffset = circumference - (percent/100)*circumference;
  },200);
}

/* ===================== PROGRESS BARS (thumb cards) ===================== */
function animateProgressBars(){
  document.querySelectorAll(".progress-fill").forEach(bar=>{
    const value = bar.dataset.value;
    setTimeout(()=>{ bar.style.width = value+"%"; },300);
  });
}

/* ===================== RIPPLE EFFECT ON BUTTONS ===================== */
document.querySelectorAll(".action-btn").forEach(btn=>{
  btn.addEventListener("click",function(e){
    const circle = document.createElement("span");
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width,rect.height);
    circle.style.width = circle.style.height = size+"px";
    circle.style.left = (e.clientX-rect.left-size/2)+"px";
    circle.style.top = (e.clientY-rect.top-size/2)+"px";
    circle.classList.add("ripple");
    this.appendChild(circle);
    setTimeout(()=>circle.remove(),600);
    showToast(`คลิก: ${this.innerText.trim()}`,"success");
  });
});

/* ===================== TOAST NOTIFICATION ===================== */
function showToast(message,type="success"){
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icon = type==="success" ? "fa-circle-check" : "fa-circle-exclamation";
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(()=>toast.remove(),3000);
}

/* ===================== LOGOUT BUTTON ===================== */
document.querySelector(".btn-logout").addEventListener("click",()=>{
  showToast("กำลังออกจากระบบ...","error");
});

/* ===================== INIT ON LOAD ===================== */
window.addEventListener("load",()=>{
  animateNumber(document.getElementById("totalMembers"),176);
  animateNumber(document.getElementById("receivedSummary"),132);
  animateNumber(document.getElementById("pendingCount"),44);
  animateNumber(document.getElementById("totalFunerals"),8);
  animateNumber(document.getElementById("receivedCount"),132);
  animateNumber(document.getElementById("totalMembersSmall"),176);
  animateNumber(document.getElementById("percentNumber"),75);
  animateProgressRing();
  animateProgressBars();
});
