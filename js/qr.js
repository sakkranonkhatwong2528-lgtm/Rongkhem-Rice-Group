// ==========================================
// qr.js
// ระบบ QR Code สมาชิก
// ==========================================

// สร้าง QR Code สมาชิก
function createMemberQR(memberId){

    const member = db.members.find(m => m.id == memberId);

    if(!member){
        alert("ไม่พบสมาชิก");
        return;
    }

    const qrText = JSON.stringify({
        id: member.id,
        houseNo: member.houseNo,
        name: member.name
    });

    const box = document.getElementById("qrcode");

    if(!box) return;

    box.innerHTML = "";

    new QRCode(box,{
        text: qrText,
        width:220,
        height:220,
        colorDark:"#0f5132",
        colorLight:"#ffffff"
    });

}



// พิมพ์ QR Code
function printQR(){

    const box=document.getElementById("qrcode");

    const w=window.open();

    w.document.write(box.innerHTML);

    w.print();

}



// ดาวน์โหลด QR

function downloadQR(){

    const img=document.querySelector("#qrcode img");

    if(!img){

        alert("ยังไม่มี QR");

        return;

    }

    const a=document.createElement("a");

    a.href=img.src;

    a.download="member-qrcode.png";

    a.click();

}
