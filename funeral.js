// ==========================================
// funeral.js V5.0
// ระบบงานศพ
// ==========================================

// โหลดรายการงานศพ
function loadFunerals(){

    const tbody=document.getElementById("funeralTable");

    if(!tbody) return;

    tbody.innerHTML="";

    db.funerals.forEach((f,index)=>{

        let status=f.active
            ? '<span class="status-open">🟢 เปิดรับข้าวสาร</span>'
            : '<span class="status-close">⚪ ปิดงานแล้ว</span>';

        tbody.innerHTML+=`

<tr>

<td>${index+1}</td>

<td>${f.name}</td>

<td>${f.houseNo}</td>

<td>${f.deathDate}</td>

<td>${f.cremationDate}</td>

<td>${status}</td>

<td>

<button
class="btn btn-success"
onclick="openFuneral('${f.id}')">

เปิด

</button>

<button
class="btn btn-warning"
onclick="closeFuneral('${f.id}')">

ปิด

</button>

<button
class="btn btn-info"
onclick="printFuneral('${f.id}')">

พิมพ์

</button>

<button
class="btn btn-danger"
onclick="deleteFuneral('${f.id}')">

ลบ

</button>

</td>

</tr>

`;

    });

}



// เพิ่มงานศพ

function addFuneral(){

    const name=document.getElementById("funeralName").value.trim();

    const house=document.getElementById("funeralHouse").value.trim();

    const death=document.getElementById("deathDate").value;

    const cremation=document.getElementById("cremationDate").value;

    if(name==""){

        alert("กรุณากรอกชื่อผู้เสียชีวิต");

        return;

    }

    db.funerals.push({

        id:Date.now().toString(),

        name:name,

        houseNo:house,

        deathDate:death,

        cremationDate:cremation,

        active:false

    });

    saveDB();

    loadFunerals();

    clearFuneralForm();

}
// ==========================================
// เปิดงานศพ
// ==========================================

function openFuneral(id){

    // ปิดงานศพเดิมทั้งหมด
    db.funerals.forEach(f=>{

        f.active=false;

    });

    // เปิดงานใหม่
    const funeral=db.funerals.find(f=>f.id==id);

    if(!funeral) return;

    funeral.active=true;

    addActivity("เปิดงานศพ : "+funeral.name);

    saveDB();

    loadFunerals();

    updateDashboard();

    alert("เปิดรับข้าวสารเรียบร้อย");

}



// ==========================================
// ปิดงานศพ
// ==========================================

function closeFuneral(id){

    if(!confirm("ต้องการปิดงานศพนี้ใช่หรือไม่?"))

        return;

    const funeral=db.funerals.find(f=>f.id==id);

    if(!funeral) return;

    funeral.active=false;

    addActivity("ปิดงานศพ : "+funeral.name);

    saveDB();

    loadFunerals();

    updateDashboard();

}



// ==========================================
// ลบงานศพ
// ==========================================

function deleteFuneral(id){

    if(!confirm("ต้องการลบข้อมูลนี้ใช่หรือไม่?"))

        return;

    db.funerals=db.funerals.filter(f=>f.id!=id);

    saveDB();

    loadFunerals();

}



// ==========================================
// พิมพ์รายงานงานศพ
// ==========================================

function printFuneral(id){

    const funeral=db.funerals.find(f=>f.id==id);

    if(!funeral) return;

    const win=window.open("","","width=800,height=900");

    win.document.write(`

    <html>

    <head>

    <title>รายงานงานศพ</title>

    <style>

    body{

        font-family:Sarabun;

        padding:40px;

        line-height:1.8;

    }

    h2{

        color:#198754;

        text-align:center;

    }

    table{

        width:100%;

        border-collapse:collapse;

    }

    td{

        border:1px solid #ddd;

        padding:10px;

    }

    </style>

    </head>

    <body>

    <h2>

    รายงานงานศพ

    </h2>

    <table>

    <tr>

    <td>ชื่อผู้เสียชีวิต</td>

    <td>${funeral.name}</td>

    </tr>

    <tr>

    <td>บ้านเลขที่</td>

    <td>${funeral.houseNo}</td>

    </tr>

    <tr>

    <td>วันที่เสียชีวิต</td>

    <td>${funeral.deathDate}</td>

    </tr>

    <tr>

    <td>วันฌาปนกิจ</td>

    <td>${funeral.cremationDate}</td>

    </tr>

    <tr>

    <td>สถานะ</td>

    <td>

    ${funeral.active ? "กำลังเปิดรับข้าวสาร" : "ปิดงานแล้ว"}

    </td>

    </tr>

    </table>

    <br><br>

    <div style="text-align:center;">

    ระบบกลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6

    </div>

    </body>

    </html>

    `);

    win.document.close();

    win.print();

}



// ==========================================
// ล้างฟอร์ม
// ==========================================

function clearFuneralForm(){

    document.getElementById("funeralName").value="";

    document.getElementById("funeralHouse").value="";

    document.getElementById("deathDate").value="";

    document.getElementById("cremationDate").value="";

}



// ==========================================
// งานศพที่กำลังเปิด
// ==========================================

function getActiveFuneral(){

    return db.funerals.find(f=>f.active);

}



// ==========================================
// โหลดระบบ
// ==========================================

window.addEventListener("load",function(){

    loadFunerals();

});
