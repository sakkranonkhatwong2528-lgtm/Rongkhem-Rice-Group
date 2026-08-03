// ฟังก์ชันสำหรับพิมพ์สลิป/ใบรับข้าวสารให้สมาชิก
function printReceipt(memberName, houseNo, funeralName) {
    const receiptWindow = window.open('', '', 'width=400,height=600');
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html lang="th">
        <head>
            <meta charset="UTF-8">
            <title>ใบรับข้าวสาร</title>
            <style>
                body { font-family: 'Prompt', sans-serif; padding: 20px; text-align: center; color: #333; }
                .ticket { border: 1px dashed #444; padding: 15px; border-radius: 8px; }
                h2 { margin: 0 0 5px 0; font-size: 18px; color: #064e3b; }
                p { margin: 3px 0; font-size: 13px; }
                .highlight { font-weight: bold; font-size: 15px; color: #000; margin: 10px 0; }
                .footer { font-size: 11px; color: #777; margin-top: 15px; border-top: 1px solid #eee; pt: 5px; }
            </style>
        </head>
        <body>
            <div class="ticket">
                <h2>🌾 กลุ่มข้าวสาร บ้านร่องเข็ม หมู่ 6</h2>
                <p><b>ใบรับข้าวสาร (ฌาปนกิจสงเคราะห์)</b></p>
                <hr>
                <p class="highlight">งานศพ: ${funeralName}</p>
                <p><b>ผู้ส่งข้าวสาร:</b> ${memberName}</p>
                <p><b>บ้านเลขที่:</b> ${houseNo}</p>
                <p><b>จำนวน:</b> 1 ถุง</p>
                <hr>
                <p><b>วันที่บันทึก:</b> ${dateStr} (${timeStr} น.)</p>
                <p class="footer">ขอบคุณที่ร่วมทำบุญสงเคราะห์สมาชิกกลุ่ม</p>
            </div>
            <script>
                window.onload = function() { window.print(); window.close(); }
            <\/script>
        </body>
        </html>
    `);
    receiptWindow.document.close();
}
