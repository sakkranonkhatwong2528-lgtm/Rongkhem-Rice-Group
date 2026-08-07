// Import ระบบคลาวด์ Firebase
import { saveData, loadData, deleteData } from './database.js';

// ==========================================
// 1. เรียกทำงานเมื่อโหลดหน้าเว็บเรียบร้อย
// ==========================================
document.addEventListener('DOMContentLoaded', async function () {
  await renderFuneralList();
  await updateCondolenceTicker();
});

// ==========================================
// 2. ระบบบันทึกข้อมูลแจ้งเปิดงานศพใหม่ (ลง Cloud)
// ==========================================
const funeralForm = document.getElementById('funeralForm');

if (funeralForm) {
  funeralForm.addEventListener('submit', async function (e) {
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

    // สร้าง Object ข้อมูลงานศพ (รับค่าอายุเป็นตัวเลขจริง)
    const newFuneralData = {
      deceasedName: deceasedName,
      age: parseInt(age) || 0,
      hostInfo: hostInfo,
      deathDate: deathDate,
      cremationDate: cremationDate,
      status: 'active' // สถานะเริ่มต้น: กำลังจัดงาน
    };

    try {
      // บันทึกลง Cloud Firestore ผ่าน database.js
      const result = await saveData('Rongkhem_Funerals', newFuneralData);

      if (result.success) {
        alert('✅ บันทึกแจ้งเปิดงานศพลง Cloud เรียบร้อยแล้ว!');
        funeralForm.reset();
        closeFuneralModal();
        await renderFuneralList();
        await updateCondolenceTicker();
      } else {
        alert('❌ ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      }

    } catch (error) {
      console.error('Error saving funeral record:', error);
      alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล: ' + error.message);
    }
  });
}

// ==========================================
// 3. ระบบแสดงตารางรายการงานศพ + อัปเดตการ์ดหน้าแรก
// ==========================================
async function renderFuneralList() {
  const tableBody = document.getElementById('funeralTableBody');
  
  // ดึงข้อมูลจริงจาก Cloud
  const funeralList = await loadData('Rongkhem_Funerals');

  // 3.1 อัปเดตการ์ดงานศพที่กำลังเปิดอยู่ (แก้ปัญหาส่วนแสดงผลอายุ 72 ปี)
  updateActiveFuneralCard(funeralList);

  if (!tableBody) return;

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
        <td>${item.age ? item.age + ' ปี' : '-'}</td>
        <td>${escapeHtml(item.hostInfo)}</td>
        <td>${formatThaiDate(item.deathDate)}</td>
        <td>${formatThaiDate(item.cremationDate)}</td>
        <td>
          <span class="status-badge ${isActive ? 'status-active' : 'status-completed'}">
            ${isActive ? 'กำลังจัดงาน' : 'เสร็จสิ้น'}
          </span>
        </td>
        <td>
          <button class="btn-toggle" onclick="toggleFuneralStatus('${item.id}', '${item.status}')">
            ${isActive ? 'ปิดงาน' : 'เปิดงาน'}
          </button>
          <button class="btn-delete" onclick="deleteFuneralRecord('${item.id}')">ลบ</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ฟังก์ชันอัปเดตการ์ดโชว์งานศพหน้าแรกให้อายุตรงตามที่คีย์
function updateActiveFuneralCard(funeralList) {
  const activeFunerals = funeralList.filter(item => item.status === 'active');
  const cardContainer = document.querySelector('.funeral-card') || document.getElementById('activeFuneralCard');

  if (cardContainer && activeFunerals.length > 0) {
    const latest = activeFunerals[activeFunerals.length - 1];
    cardContainer.innerHTML = `
      <div class="badge-status">กำลังเปิดรับข้าวสาร</div>
      <h3>${escapeHtml(latest.deceasedName)} (อายุ ${latest.age || '-'} ปี)</h3>
      <p><strong>เจ้าภาพ:</strong> ${escapeHtml(latest.hostInfo)}</p>
      <p><strong>ฌาปนกิจ:</strong> ${formatThaiDate(latest.cremationDate)}</p>
    `;
  }
}

// ==========================================
// 4. สลับสถานะงานศพ
// ==========================================
window.toggleFuneralStatus = async function(id, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'completed' : 'active';
  
  // อัปเดตลง Cloud
  const { doc, updateDoc, getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
  const db = getFirestore();
  await updateDoc(doc(db, 'Rongkhem_Funerals', id), { status: newStatus });

  await renderFuneralList();
  await updateCondolenceTicker();
};

// ==========================================
// 5. ระบบอัปเดตตัวอักษรวิ่งไว้อาลัย
// ==========================================
async function updateCondolenceTicker() {
  const funeralList = await loadData('Rongkhem_Funerals');
  const nameElement = document.getElementById('tickerDeceasedName');
  const tickerContainer = document.querySelector('.condolence-ticker');

  if (!nameElement) return;

  const activeFunerals = funeralList.filter(item => item.status === 'active');

  if (activeFunerals.length > 0) {
    const latestDeceased = activeFunerals[activeFunerals.length - 1];
    nameElement.textContent = `${latestDeceased.deceasedName} (อายุ ${latestDeceased.age} ปี)`;
    if (tickerContainer) tickerContainer.style.display = 'block';
  } else {
    if (tickerContainer) tickerContainer.style.display = 'none';
  }
}

// ==========================================
// 6. ฟังก์ชันช่วยจัดการระบบ (Helpers)
// ==========================================
window.deleteFuneralRecord = async function(id) {
  if (confirm('คุณต้องการลบรายการงานศพนี้ใช่หรือไม่?')) {
    await deleteData('Rongkhem_Funerals', id);
    await renderFuneralList();
    await updateCondolenceTicker();
  }
};

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

window.openFuneralModal = function() {
  const modal = document.getElementById('funeralModal');
  if (modal) modal.style.display = 'block';
};

window.closeFuneralModal = function() {
  const modal = document.getElementById('funeralModal');
  if (modal) modal.style.display = 'none';
};
