// เรียกทำงานเมื่อโหลดหน้าเว็บเรียบร้อยแล้ว
document.addEventListener('DOMContentLoaded', function () {
  renderFuneralList();
});

// ฟังก์ชันดึงข้อมูลจาก LocalStorage มาแสดงบนตาราง
function renderFuneralList() {
  const tableBody = document.getElementById('funeralTableBody');
  if (!tableBody) return;

  // ดึงข้อมูลจาก LocalStorage
  const funeralList = JSON.parse(localStorage.getItem('Rongkhem_Funerals')) || [];

  // ถ้าไม่มีข้อมูล ให้แสดงข้อความแจ้งเตือน
  if (funeralList.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 20px; color: #888;">
          ยังไม่มีข้อมูลงานศพในระบบ
        </td>
      </tr>
    `;
    return;
  }

  // สร้างแถวข้อมูล (Tr) ในตาราง
  tableBody.innerHTML = funeralList.map((item, index) => {
    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(item.deceasedName)}</strong></td>
        <td>${item.age || '-'}</td>
        <td>${escapeHtml(item.hostInfo)}</td>
        <td>${formatThaiDate(item.deathDate)}</td>
        <td>${formatThaiDate(item.cremationDate)}</td>
        <td>
          <span class="status-badge ${item.status === 'active' ? 'status-active' : 'status-completed'}">
            ${item.status === 'active' ? 'กำลังจัดงาน' : 'เสร็จสิ้น'}
          </span>
        </td>
        <td>
          <button class="btn-delete" onclick="deleteFuneralRecord('${item.id}')">ลบ</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ฟังก์ชันแปลงวันที่ (YYYY-MM-DD) เป็นวันที่ไทย (เช่น 15 ม.ค. 2567)
function formatThaiDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;

  return `${day} ${month} ${year}`;
}

// ฟังก์ชันป้องกัน XSS
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ฟังก์ชันลบรายการงานศพ
function deleteFuneralRecord(id) {
  if (confirm('คุณต้องการลบรายการงานศพนี้ใช่หรือไม่?')) {
    let funeralList = JSON.parse(localStorage.getItem('Rongkhem_Funerals')) || [];
    funeralList = funeralList.filter(item => item.id !== id);
    localStorage.setItem('Rongkhem_Funerals', JSON.stringify(funeralList));
    
    // โหลดตารางใหม่
    renderFuneralList();
    alert('ลบข้อมูลเรียบร้อยแล้ว');
  }
}

// ฟังก์ชันเปิด Modal
function openFuneralModal() {
  const modal = document.getElementById('funeralModal');
  if (modal) modal.style.display = 'block';
}
