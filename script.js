import { db, collection, onSnapshot, query, where, orderBy } from './firebase-config.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

document.addEventListener('DOMContentLoaded', () => {
    startLiveClock();
    initDashboard();
    initNotifications();
});

function initDashboard() {
    // 1. ดึงจำนวนสมาชิก
    onSnapshot(collection(db, 'members'), s => {
        $('#totalMembers').textContent = s.size;
        $('#totalMembersSmall').textContent = s.size;
    });

    // 2. ดึงข้อมูลงานศพปัจจุบันและคำนวณ Progress
    onSnapshot(query(collection(db, 'funerals'), where('status', '==', 'active')), s => {
        if (s.empty) return;
        const f = s.docs[0].data();
        const fId = s.docs[0].id;
        
        // อัปเดตรายละเอียดผู้เสียชีวิต (ใส่ id ใน html ของคุณตามนี้)
        $('#funeralName')?.textContent = f.name; 
        
        onSnapshot(collection(db, 'riceRecords'), snap => {
            const records = snap.docs.filter(d => d.data().funeralId === fId);
            const received = records.length;
            const total = parseInt($('#totalMembers').textContent) || 1;
            const percent = Math.round((received / total) * 100);

            $('#receivedCount').textContent = received;
            $('#receivedSummary').textContent = received;
            $('#pendingCount').textContent = total - received;
            $('#percentNumber').textContent = percent;
            
            // วงกลม Progress
            const circle = document.querySelector('.progress-ring .fill');
            if (circle) {
                const circumference = 46 * 2 * Math.PI;
                circle.style.strokeDasharray = `${circumference} ${circumference}`;
                circle.style.strokeDashoffset = circumference - (percent / 100) * circumference;
            }
        });
    });

    // 3. ดึงรายการค้างส่ง (สมมติ logic: สมาชิกที่ไม่มีประวัติรับข้าวในงานปัจจุบัน)
    // สำหรับส่วนแสดงรายชื่อสมาชิกค้างส่ง (ต้องมี container ใน HTML)
    onSnapshot(collection(db, 'members'), s => {
        const listContainer = $('#overdueListContainer'); // ต้องสร้าง div นี้ใน HTML
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        s.docs.forEach(doc => {
            const m = doc.data();
            if (m.isOverdue) { // เช็คเงื่อนไขค้างส่งที่คุณเก็บใน DB
                listContainer.innerHTML += `
                    <div class="list-item">
                        <div class="avatar-circle"><i class="fa-solid fa-user"></i></div>
                        <div class="list-item-text"><strong>${m.houseNumber} ${m.name}</strong></div>
                        <span class="tag-overdue">${m.overdueCount} ครั้ง</span>
                    </div>`;
            }
        });
    });
}

// 4. ระบบแจ้งเตือน
function initNotifications() {
    onSnapshot(collection(db, 'announcements'), s => {
        $('#notifCount').textContent = s.size;
        // logic แสดงรายการประกาศใน dropdown...
    });
}

// 5. นาฬิกา
function startLiveClock() {
    setInterval(() => {
        const now = new Date();
        $('#liveClock').textContent = now.toLocaleTimeString('th-TH');
        $('#liveDate').textContent = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    }, 1000);
}
