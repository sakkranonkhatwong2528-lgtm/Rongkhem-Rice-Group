// ฟังก์ชันดึงชื่อผู้เสียชีวิตรายล่าสุดมาใส่ในข้อความวิ่ง
function updateCondolenceTicker() {
  const funeralList = JSON.parse(localStorage.getItem('Rongkhem_Funerals')) || [];
  const nameElement = document.getElementById('tickerDeceasedName');
  
  if (!nameElement) return;

  // กรองหาเฉพาะรายการที่กำลังจัดงาน (status: 'active')
  const activeFunerals = funeralList.filter(item => item.status === 'active');

  if (activeFunerals.length > 0) {
    // เอาชื่อคนล่าสุด (รายการท้ายสุดใน Array)
    const latestDeceased = activeFunerals[activeFunerals.length - 1];
    nameElement.textContent = latestDeceased.deceasedName;
  } else {
    // ถ้าไม่มีงานศพที่กำลังจัดอยู่ ให้ซ่อนแถบวิ่ง หรือแสดงข้อความทั่วไป
    nameElement.textContent = "ผู้วายชนม์";
  }
}

// เรียกทำงานเมื่อโหลดหน้าเว็บเรียบร้อย
document.addEventListener('DOMContentLoaded', function() {
  updateCondolenceTicker();
});
