// ==========================================
// 1. เรียกทำงานเมื่อโหลดหน้าเว็บเรียบร้อย
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
  renderFuneralList();
  updateCondolenceTicker();
});

// ==========================================
// 2. ระบบบันทึกข้อมูลแจ้งเปิดงานศพใหม่
// ==========================================
const funeralForm = document.getElementById('funeralForm');

if (funeralForm) {
  funeralForm.addEventListener('submit', function (e) {
    e.preventDefault(); // 🛑 ป้องกันหน้าเว็บ Refresh

    // ดึงค่าจากช่องกรอกข้อมูล
    const deceasedName = document.getElementById('deceasedName').value.trim();
    const age = document.getElementById('age').value.trim();
    const hostInfo = document.getElementById('hostInfo').value.trim();
    const deathDate = document.getElementById('deathDate').value;
    const cremationDate = document.getElementById('cremationDate').value;

    // ตรวจสอบความถูกต้อง
    if (!deceasedName || !age || !hostInfo || !deathDate || !cremationDate) {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    // สร้าง Object ข้อมูลงานศพ
    const newFuneralData = {
      id: 'FUN-' + Date.now(),
      deceasedName: deceasedName,
      age: parseInt(age),
      hostInfo: hostInfo,
      deathDate: deathDate,
      cremationDate: cremationDate,
      status: 'active', // สถานะเริ่มต้น: กำลังจัดงาน
      createdAt: new Date().toISOString()
    };

    try {
      // บันทึกลง LocalStorage
      saveFuneralToStorage(newFuneralData);

      alert('✅ บันทึกแจ้งเปิดงานศพเรียบร้อยแล้ว!');

      // ล้างฟอร์ม, ปิด Pop-up และอัปเดตหน้าจอ
      funeralForm.reset();
      closeFuneralModal();
      renderFuneralList();
      updateCondolenceTicker();

    } catch (error) {
      console.error('Error saving funeral record:', error);
      alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    }
  });
}

// ฟังก์ชันบันทึกลง LocalStorage
function saveFuneralToStorage(data) {
  let funeralList = JSON.parse(localStorage.getItem('Rongkhem_Funerals')) || [];
  funeralList.push(data);
  localStorage.setItem('Rongkhem_Funerals', JSON.stringify(funeralList));
}

// ==========================================
// 3. ระบบแสดงตารางรายการงานศพ
// ==========================================
function renderFuneralList() {
  const tableBody = document.getElementById('funeralTableBody');
  if (!tableBody) return;

  const funeralList = JSON.parse(localStorage.getItem('Rongkhem_Funerals')) || [];

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

  // สร้างแถวข้อมูลตาราง
  tableBody.innerHTML = funeralList.map((item, index) => {
    const isActive = item.status === 'active';
    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(item.deceasedName)}</strong></td>
        <td>${item.age || '-'}</td>
        <td>${escapeHtml(item.hostInfo)}</td>
        <td>${formatThaiDate(item.deathDate)}</td>
        <td>${formatThaiDate(item.cremationDate)}</td>
        <td>
          <span class="status-badge ${isActive ? 'status-active' : 'status-completed'}">
            ${isActive ? 'กำลังจัดงาน' : 'เสร็จสิ้น'}
          </span>
        </td>
        <td>
          <button class="btn-toggle" onclick="toggleFuneralStatus('${item.id}')">
            ${isActive ? 'ปิดงาน' : 'เปิดงาน'}
          </button>
          <button class="btn-delete" onclick="deleteFuneralRecord('${item.id}')">ลบ</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 4. สลับสถานะ (กำลังจัดงาน <-> เสร็จสิ้น)
// ==========================================
function toggleFuneralStatus(id) {
  let funeralList = JSON.parse(localStorage.getItem('Rongkhem_Funerals')) || [];
  funeralList = funeralList.map(item => {
    if (item.id === id) {
      item.status = item.status === 'active' ? 'completed' : 'active';
    }
    return item;
  });

  localStorage.setItem('Rongkhem_Funerals', JSON.stringify(funeralList));
  renderFuneralList();
  updateCondolenceTicker();
}

// ==========================================
// 5. ระบบอัปเดตตัวอักษรวิ่งไว้อาลัย (แบบที่ 2)
// ==========================================
function updateCondolenceTicker() {
  const funeralList = JSON.parse(localStorage.getItem('Rongkhem_Funerals')) || [];
  const nameElement = document.getElementById('tickerDeceasedName');
  const tickerContainer = document.querySelector('.condolence-ticker');

  if (!nameElement) return;

  // กรองเอาเฉพาะงานศพที่กำลังจัดอยู่ (active)
  const activeFunerals = funeralList.filter(item => item.status === 'active');

  if (activeFunerals.length > 0) {
    // ดึงชื่อคนที่เพิ่งแจ้งล่าสุด
    const latestDeceased = activeFunerals[activeFunerals.length - 1];
    nameElement.textContent = latestDeceased.deceasedName;
    if (tickerContainer) tickerContainer.style.display = 'block';
  } else {
    // ถ้าไม่มีงานศพเปิดอยู่ ให้ซ่อนแถบวิ่ง
    if (tickerContainer) tickerContainer.style.display = 'none';
  }
}

// ==========================================
// 6. ฟังก์ชันช่วยจัดการระบบ (Helpers)
// ==========================================
function deleteFuneralRecord(id) {
  if (confirm('คุณต้องการลบรายการงานศพนี้ใช่หรือไม่?')) {
    let funeralList = JSON.parse(localStorage.getItem('Rongkhem_Funerals')) || [];
    funeralList = funeralList.filter(item => item.id !== id);
    localStorage.setItem('Rongkhem_Funerals', JSON.stringify(funeralList));
    
    renderFuneralList();
    updateCondolenceTicker();
  }
}

function formatThaiDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];

  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function openFuneralModal() {
  const modal = document.getElementById('funeralModal');
  if (modal) modal.style.display = 'block';
}

function closeFuneralModal() {
  const modal = document.getElementById('funeralModal');
  if (modal) modal.style.display = 'none';
}
