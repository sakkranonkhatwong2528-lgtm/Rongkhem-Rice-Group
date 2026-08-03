// ===============================
// members.js
// ระบบสมาชิก V4.0
// ===============================

// โหลดสมาชิก
function loadMembers() {
    const tbody = document.getElementById("memberTable");
    if (!tbody) return;

    tbody.innerHTML = "";

    db.members
        .sort((a, b) => Number(a.houseNo) - Number(b.houseNo))
        .forEach((member, index) => {

            let status = `<span class="status normal">ปกติ</span>`;

            if (member.pending >= 1)
                status = `<span class="status pending">ค้าง ${member.pending} ครั้ง</span>`;

            if (member.pending >= 2)
                status = `<span class="status danger">ค้าง ${member.pending} ครั้ง</span>`;

            tbody.innerHTML += `

<tr>

<td>${index + 1}</td>

<td>${member.houseNo}</td>

<td>${member.name}</td>

<td>${member.phone || "-"}</td>

<td>${member.sent || 0}</td>

<td>${member.pending || 0}</td>

<td>${status}</td>

<td>

<button
class="btn btn-success"
onclick="showQR('${member.id}')">

📱 QR

</button>

<button
class="btn btn-info"
onclick="editMember('${member.id}')">

✏️

</button>

<button
class="btn btn-danger"
onclick="deleteMember('${member.id}')">

🗑️

</button>

</td>

</tr>

`;

        });

    updateDashboard();
}

// เพิ่มสมาชิก

function addMember() {

const name =
document.getElementById("memberName").value;

const house =
document.getElementById("memberHouse").value;

const phone =
document.getElementById("memberPhone").value;

if(name==""){

notify("กรุณากรอกชื่อ");

return;

}

db.members.push({

id:Date.now().toString(),

name:name,

houseNo:house,

phone:phone,

sent:0,

pending:0

});

addActivity("เพิ่มสมาชิก "+name);

saveDB();

loadMembers();

clearMemberForm();

notify("บันทึกสำเร็จ");

}

// แก้ไขสมาชิก

function editMember(id){

const m=db.members.find(x=>x.id==id);

if(!m)return;

document.getElementById("memberId").value=m.id;

document.getElementById("memberName").value=m.name;

document.getElementById("memberHouse").value=m.houseNo;

document.getElementById("memberPhone").value=m.phone;

}

// บันทึกการแก้ไข

function updateMember(){

const id=
document.getElementById("memberId").value;

const m=db.members.find(x=>x.id==id);

if(!m)return;

m.name=
document.getElementById("memberName").value;

m.houseNo=
document.getElementById("memberHouse").value;

m.phone=
document.getElementById("memberPhone").value;

addActivity("แก้ไขสมาชิก "+m.name);

saveDB();

loadMembers();

clearMemberForm();

}

// ลบสมาชิก

function deleteMember(id){

if(!confirm("ต้องการลบสมาชิกใช่หรือไม่"))

return;

db.members=db.members.filter(x=>x.id!=id);

saveDB();

loadMembers();

notify("ลบสำเร็จ");

}

// ล้างฟอร์ม

function clearMemberForm(){

document.getElementById("memberId").value="";

document.getElementById("memberName").value="";

document.getElementById("memberHouse").value="";

document.getElementById("memberPhone").value="";

}

// ค้นหา

function searchMember(){

const keyword=

document.getElementById("searchMember")

.value.toLowerCase();

const result=db.members.filter(m=>{

return m.name.toLowerCase().includes(keyword)

||

m.houseNo.toLowerCase().includes(keyword)

||

(m.phone||"").includes(keyword);

});

const tbody=document.getElementById("memberTable");

tbody.innerHTML="";

result.forEach((m,i)=>{

tbody.innerHTML+=`

<tr>

<td>${i+1}</td>

<td>${m.houseNo}</td>

<td>${m.name}</td>

<td>${m.phone||"-"}</td>

<td>${m.sent}</td>

<td>${m.pending}</td>

<td>

<button class="btn btn-info"

onclick="editMember('${m.id}')">

✏️

</button>

<button class="btn btn-danger"

onclick="deleteMember('${m.id}')">

🗑️

</button>

</td>

</tr>

`;

});

}

// ส่งออก JSON

function exportMembers(){

const blob=new Blob(

[JSON.stringify(db.members)],

{type:"application/json"}

);

const a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="members.json";

a.click();

}

// นำเข้า JSON

function importMembers(file){

const reader=new FileReader();

reader.onload=function(e){

db.members=

JSON.parse(e.target.result);

saveDB();

loadMembers();

};

reader.readAsText(file);

}

// โหลดเมื่อเปิดหน้า

window.addEventListener(

"load",

loadMembers
// ===============================
// Export JSON
// ===============================

function exportMembers(){

    const blob = new Blob(
        [JSON.stringify(db.members,null,2)],
        {type:"application/json"}
    );

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = "members.json";

    a.click();

}



// ===============================
// Import JSON
// ===============================

function importMembers(file){

    const reader = new FileReader();

    reader.onload = function(e){

        db.members = JSON.parse(e.target.result);

        saveDB();

        loadMembers();

        notify("นำเข้าข้อมูลสมาชิกสำเร็จ");

    };

    reader.readAsText(file);

}



// ===============================
// QR Code
// ===============================

function showQR(id){

    const member = db.members.find(x=>x.id==id);

    if(!member){

        alert("ไม่พบสมาชิก");

        return;

    }

    document.getElementById("qrModal").style.display="flex";

    const box=document.getElementById("qrcode");

    box.innerHTML="";

    new QRCode(box,{

        text:JSON.stringify({

            id:member.id,

            houseNo:member.houseNo,

            name:member.name,

            phone:member.phone||""

        }),

        width:220,

        height:220,

        colorDark:"#0f5132",

        colorLight:"#ffffff",

        correctLevel:QRCode.CorrectLevel.H

    });

    document.getElementById("qrMemberName").innerHTML=member.name;

    document.getElementById("qrHouseNo").innerHTML=member.houseNo;

}



// ===============================
// ปิด QR
// ===============================

function closeQR(){

    document.getElementById("qrModal").style.display="none";

}



// ===============================
// พิมพ์ QR
// ===============================

function printQR(){

    const w = window.open("","","width=500,height=700");

    w.document.write(`

    <html>

    <head>

    <title>QR สมาชิก</title>

    <style>

    body{

        font-family:Sarabun;

        text-align:center;

        padding:30px;

    }

    h2{

        color:#198754;

    }

    </style>

    </head>

    <body>

        <h2>กลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6</h2>

        ${document.getElementById("qrcode").innerHTML}

        <h3>${document.getElementById("qrMemberName").innerHTML}</h3>

        <p>บ้านเลขที่ ${document.getElementById("qrHouseNo").innerHTML}</p>

    </body>

    </html>

    `);

    w.document.close();

    w.print();

}



// ===============================
// นับสมาชิก
// ===============================

function totalMembers(){

    return db.members.length;

}



// ===============================
// โหลดระบบ
// ===============================

window.addEventListener("load",()=>{

    loadMembers();

});
);
