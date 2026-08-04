// เรียกทำงานเมื่อโหลดหน้าเว็บ
document.addEventListener('DOMContentLoaded', function () {
  renderMemberList();
});

// ฟังก์ชันดึงและบันทึกข้อมูลฟอร์ม
const memberForm = document.getElementById('memberForm');

if (memberForm) {
  memberForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const memberName = document.getElementById('memberName').value.trim();
    const address = document.getElementById('address').value.trim();
    const initialStatus = document.getElementById('initialStatus').value;

    if (!memberName || !address) {
      alert('กรุณากรอกชื่อ-นามสกุล และบ้านเลขที่ให้ครบถ้วน');
      return;
    }

    const newMember = {
      id: 'MEM-' + String(Date.now()).slice(-4),
      name: memberName,
      address: address,
      status: initialStatus, // 'sent' หรือ 'pending'
      updatedAt: new Date().toISOString()
    };

    try {
      let memberList = JSON.parse(localStorage.getItem('Rongkhem_Members')) || [];
      memberList.push(newMember);
      localStorage.setItem('Rongkhem_Members', JSON.stringify(memberList));

      alert('✅ บันทึกสมาชิกเรียบร้อยแล้ว!');

      memberForm.reset();
      closeMemberModal();
      renderMemberList();

    } catch (error) {
      console.error('Error saving member:', error);
      alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  });
}

// ฟังก์ชันแสดงรายการลงตาราง
function renderMemberList(dataToDisplay = null) {
  const tableBody = document.getElementById('memberTableBody');
  if (!tableBody) return;

  const memberList = dataToDisplay || JSON.parse(localStorage.getItem('Rongkhem_Members')) || [];

  if (memberList.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 20px; color: #888;">
          ไม่พบข้อมูลสมาชิก
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = memberList.map((item, index) => {
    const isSent = item.status === 'sent';
    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px;">${index + 1}</td>
        <td style="padding: 12px;"><strong>${item.id}</strong></td>
        <td style="padding: 12px;">${escapeHtml(item.name)}</td>
        <td style="padding: 12px;">${escapeHtml(item.address)}</td>
        <td style="padding: 12px;">
          <span class="status-badge ${isSent ? 'status-paid' : 'status-pending'}">
            ${isSent ? '🟢 ส่งแล้ว' : '🔴 ยังไม่ส่ง'}
          </span>
        </td>
        <td style="padding: 12px;">
          <button class="btn-status" onclick="toggleStatus('${item.id}')" style="background: ${isSent ? '#ffc107' : '#198754'}; color: ${isSent ? '#000' : '#fff'};">
            ${isSent ? 'เปลี่ยนเป็น: ยังไม่ส่ง' : 'เปลี่ยนเป็น: ส่งแล้ว'}
          </button>
          <button onclick="deleteMember('${item.id}')" style="background: #dc3545; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">ลบ</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ฟังก์ชันกดเปลี่ยนสถานะ (ส่งแล้ว <-> ยังไม่ส่ง)
function toggleStatus(id) {
  let memberList = JSON.parse(localStorage.getItem('Rongkhem_Members')) || [];
  
  memberList = memberList.map(member => {
    if (member.id === id) {
      member.status = member.status === 'sent' ? 'pending' : 'sent';
      member.updatedAt = new Date().toISOString();
    }
    return member;
  });

  localStorage.setItem('Rongkhem_Members', JSON.stringify(memberList));
  filterMembers(); // อัปเดตการแสดงผลตาราง
}

// ฟังก์ชันค้นหาและกรองข้อมูล
function filterMembers() {
  const keyword = document.getElementById('searchMember').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;
  const memberList = JSON.parse(localStorage.getItem('Rongkhem_Members')) || [];

  const filtered = memberList.filter(member => {
    const matchText = member.name.toLowerCase().includes(keyword) || member.address.toLowerCase().includes(keyword);
    const matchStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchText && matchStatus;
  });

  renderMemberList(filtered);
}

// ฟังก์ชันลบสมาชิก
function deleteMember(id) {
  if (confirm('คุณต้องการลบรายชื่อสมาชิกนี้หรือไม่?')) {
    let memberList = JSON.parse(localStorage.getItem('Rongkhem_Members')) || [];
    memberList = memberList.filter(item => item.id !== id);
    localStorage.setItem('Rongkhem_Members', JSON.stringify(memberList));
    filterMembers();
  }
}

// ฟังก์ชัน ปิด/เปิด Modal
function openMemberModal() {
  document.getElementById('memberModal').style.display = 'block';
}

function closeMemberModal() {
  document.getElementById('memberModal').style.display = 'none';
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
