// ==========================================
// scanner.js
// ระบบสแกน QR รับข้าวสาร
// Rongkhem Rice Group V4.0
// ==========================================

// ต้องเพิ่ม
// <script src="https://unpkg.com/html5-qrcode"></script>

let html5QrCode;

// เริ่มสแกน

function startScanner(){

document.getElementById("reader").style.display="block";

html5QrCode=new Html5Qrcode("reader");

Html5QrCode.getCameras().then(devices=>{

if(devices && devices.length){

html5QrCode.start(

devices[0].id,

{

fps:10,

qrbox:250

},

onScanSuccess

);

}

});

}



// เมื่อสแกนสำเร็จ

function onScanSuccess(decodedText){

html5QrCode.stop();

document.getElementById("reader").style.display="none";

const member=JSON.parse(decodedText);

receiveByQR(member.id);

}



// รับข้าวสาร

function receiveByQR(memberId){

const active=getActiveFuneral();

if(!active){

alert("ไม่มีงานศพ");

return;

}

const member=db.members.find(

m=>m.id==memberId

);

if(!member){

alert("ไม่พบสมาชิก");

return;

}

// ตรวจสอบส่งแล้ว

const check=db.deliveries.find(d=>

d.funeralId==active.id &&

d.memberId==member.id

);

if(check){

alert("สมาชิกส่งแล้ว");

return;

}

// บันทึก

db.deliveries.push({

id:Date.now(),

memberId:member.id,

funeralId:active.id,

qty:1,

date:new Date()

});

member.sent++;

db.stock++;

addActivity(

member.name+

" ส่งข้าวสาร (QR)"

);

saveDB();

updateDashboard();

alert(

"รับข้าวสารเรียบร้อย"

);

loadReceiveMembers();

}



// ปิด Scanner

function stopScanner(){

if(html5QrCode){

html5QrCode.stop();

}

document.getElementById("reader").style.display="none";

}
