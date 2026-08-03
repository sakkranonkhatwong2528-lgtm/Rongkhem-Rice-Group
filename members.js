// ==========================================
// members.js
// Rongkhem Rice Group V5.0
// ==========================================

// โหลดสมาชิก
function loadMembers() {

    const tbody = document.getElementById("memberTable");

    if (!tbody) return;

    tbody.innerHTML = "";

    const members = db.members.sort((a,b)=>{

        return Number(a.houseNo)-Number(b.houseNo);

    });

    members.forEach((member,index)=>{

        let status = '<span class="status normal">ปกติ</span>';

        if(member.pending>=1){

            status=`<span class="status pending">
            ค้าง ${member.pending} ครั้ง
            </span>`;

        }

        if(member.pending>=2){

            status=`<span class="status danger">
            ค้าง ${member.pending} ครั้ง
            </span>`;

        }

        tbody.innerHTML+=`

<tr>

<td>${index+1}</td>

<td>${member.houseNo}</td>

<td>${member.name}</td>

<td>${member.phone||"-"}</td>

<td>${member.sent||0}</td>

<td>${member.pending||0}</td>

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

function addMember(){

    const name=document.getElementById("memberName").value.trim();

    const house=document.getElementById("memberHouse").value.trim();

    const phone=document.getElementById("memberPhone").value.trim();

    if(name==""){

        alert("กรุณากรอกชื่อสมาชิก");

        return;

    }

    db.members.push({

        id:Date.now().toString(),

        houseNo:house,

        name:name,

        phone:phone,

        sent:0,

        pending:0

    });

    addActivity("เพิ่มสมาชิก "+name);

    saveDB();

    loadMembers();

    clearMemberForm();

}



// แก้ไขสมาชิก

function editMember(id){

    const member=db.members.find(x=>x.id==id);

    if(!member) return;

    document.getElementById("memberId").value=member.id;

    document.getElementById("memberHouse").value=member.houseNo;

    document.getElementById("memberName").value=member.name;

    document.getElementById("memberPhone").value=member.phone;

}



// บันทึกการแก้ไข

function updateMember(){

    const id=document.getElementById("memberId").value;

    const member=db.members.find(x=>x.id==id);

    if(!member) return;

    member.houseNo=document.getElementById("memberHouse").value;

    member.name=document.getElementById("memberName").value;

    member.phone=document.getElementById("memberPhone").value;

    addActivity("แก้ไขสมาชิก "+member.name);

    saveDB();

    loadMembers();

    clearMemberForm();

}



// ลบสมาชิก

function deleteMember(id){

    if(!confirm("ต้องการลบสมาชิกใช่หรือไม่?"))

        return;

    db.members=db.members.filter(x=>x.id!=id);

    saveDB();

    loadMembers();

}



// ล้างฟอร์ม

function clearMemberForm(){

    document.getElementById("memberId").value="";

    document.getElementById("memberHouse").value="";

    document.getElementById("memberName").value="";

    document.getElementById("memberPhone").value="";

}
// ===============================
// ค้นหาสมาชิก
// ===============================

function searchMember(){

    const keyword = document
        .getElementById("searchMember")
        .value
        .toLowerCase();

    const tbody = document.getElementById("memberTable");

    tbody.innerHTML = "";

    const result = db.members.filter(member=>{

        return (
            member.name.toLowerCase().includes(keyword) ||
            member.houseNo.toLowerCase().includes(keyword) ||
            (member.phone||"").includes(keyword)
        );

    });

    result.forEach((member,index)=>{

        let status = '<span class="status normal">ปกติ</span>';

        if(member.pending>=1){

            status=`<span class="status pending">
            ค้าง ${member.pending} ครั้ง
            </span>`;

        }

        if(member.pending>=2){

            status=`<span class="status danger">
            ค้าง ${member.pending} ครั้ง
            </span>`;

        }

        tbody.innerHTML += `

<tr>

<td>${index+1}</td>

<td>${member.houseNo}</td>

<td>${member.name}</td>

<td>${member.phone||"-"}</td>

<td>${member.sent||0}</td>

<td>${member.pending||0}</td>

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

}



// ===============================
// Export สมาชิก
// ===============================

function exportMembers(){

    const blob = new Blob(

        [JSON.stringify(db.members,null,2)],

        {type:"application/json"}

    );

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download="members.json";

    a.click();

}



// ===============================
// Import สมาชิก
// ===============================

function importMembers(file){

    const reader=new FileReader();

    reader.onload=function(e){

        db.members=JSON.parse(e.target.result);

        saveDB();

        loadMembers();

        alert("นำเข้าข้อมูลสำเร็จ");

    };

    reader.readAsText(file);

}



// ===============================
// QR Code
// ===============================

function showQR(id){

    const member=db.members.find(x=>x.id==id);

    if(!member){

        alert("ไม่พบสมาชิก");

        return;

    }

    document.getElementById("qrModal").style.display="flex";

    const qr=document.getElementById("qrcode");

    qr.innerHTML="";

    new QRCode(qr,{

        text:JSON.stringify({

            id:member.id,

            houseNo:member.houseNo,

            name:member.name,

            phone:member.phone||""

        }),

        width:220,

        height:220,

        colorDark:"#198754",

        colorLight:"#ffffff",

        correctLevel:QRCode.CorrectLevel.H

    });

    document.getElementById("qrMemberName").textContent=member.name;

    document.getElementById("qrHouseNo").textContent=member.houseNo;

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

    const win=window.open("","","width=500,height=700");

    win.document.write(`

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

        <h3>${document.getElementById("qrMemberName").textContent}</h3>

        <p>บ้านเลขที่ ${document.getElementById("qrHouseNo").textContent}</p>

    </body>

    </html>

    `);

    win.document.close();

    win.print();

}



// ===============================
// โหลดระบบ
// ===============================

window.addEventListener("load",function(){

    loadMembers();

});
