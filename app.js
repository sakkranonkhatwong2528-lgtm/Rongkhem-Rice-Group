function updateClock() {
    const now = new Date();
    
    // รูปแบบเวลา HH:MM:SS
    const timeString = now.toLocaleTimeString('th-TH', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    
    // รูปแบบวันที่ ภาษาไทย
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('th-TH', options);

    // อัปเดตลง Element ใน HTML (ปรับ id ให้ตรงกับใน index.html ของผู้ใหญ่บ้าน)
    const clockEl = document.getElementById('clock') || document.querySelector('.time-display');
    const dateEl = document.getElementById('date') || document.querySelector('.date-display');

    if (clockEl) clockEl.innerText = timeString;
    if (dateEl) dateEl.innerText = dateString;
}

// เรียกให้ทำงานทันทีเมื่อโหลดหน้า และสั่งให้ทำงานทุกๆ 1 วินาที (1000 ms)
updateClock();
setInterval(updateClock, 1000);
