// ==========================================
// funeral.js
// ระบบงานศพ V4.0
// ==========================================

// โหลดรายการงานศพ
function loadFunerals(){

const tbody=document.getElementById("funeralTable");

if(!tbody)return;

tbody.innerHTML="";

db.funerals
.slice()
.reverse()
.forEach((f,index)=>{

tbody.innerHTML+=`

<tr>

<td>${index+1}</td>

<td>${f.name}</td>

<td>${f.houseNo}</td>

<td>${f.age}</td>

<td>${f.deathDate}</td>

<td>${f.cremationDate}</td>

<td>

${
f.active

?

'<span class="status normal">กำลังเปิด</span>'

:

'<span class="status pending">ปิดแล้ว</span>'

}

</td>

<td>

<button

class="btn btn-info"

onclick="editFuneral('${f.id}')">

✏️

</button>

<button

class="btn btn-danger"

onclick="deleteFuneral('${f.id}')">

🗑️

</button>

</td>

</tr>

`;

});

updateDashboard();

}



// เพิ่มงานศพ

function addFuneral(){

const first=document.getElementById("firstName").value;

const last=document.getElementById("lastName").value;

const age=document.getElementById("age").value;

const house=document.getElementById("houseNo").value;

const death=document.getElementById("deathDate").value;

const cremation=document.getElementById("cremationDate").value;



if(first==""){

notify("กรุณากรอกชื่อ");

return;

}



// ปิดงานศพเดิมทั้งหมด

db.funerals.forEach(f=>{

f.active=false;

});



const funeral={

id:Date.now().toString(),

name:first+" "+last,

houseNo:house,

age:age,

deathDate:death,

cremationDate:cremation,

active:true

};



db.funerals.push(funeral);



addActivity(

"เปิดงานศพ "+funeral.name

);



saveDB();

loadFunerals();

clearFuneralForm();

notify("เปิดงานศพสำเร็จ");

}



// แก้ไข

function editFuneral(id){

const f=db.funerals.find(

x=>x.id==id

);

if(!f)return;

document.getElementById("funeralId").value=f.id;

const fullname=f.name.split(" ");

document.getElementById("firstName").value=fullname[0];

document.getElementById("lastName").value=fullname.slice(1).join(" ");

document.getElementById("age").value=f.age;

document.getElementById("houseNo").value=f.houseNo;

document.getElementById("deathDate").value=f.deathDate;

document.getElementById("cremationDate").value=f.cremationDate;

}



// บันทึกแก้ไข

function updateFuneral(){

const id=document.getElementById("funeralId").value;

const f=db.funerals.find(

x=>x.id==id

);

if(!f)return;



f.name=

document.getElementById("firstName").value+

" "+

document.getElementById("lastName").value;



f.age=

document.getElementById("age").value;



f.houseNo=

document.getElementById("houseNo").value;



f.deathDate=

document.getElementById("deathDate").value;



f.cremationDate=

document.getElementById("cremationDate").value;



addActivity(

"แก้ไขงานศพ "+f.name

);



saveDB();

loadFunerals();

clearFuneralForm();

}



// ลบ

function deleteFuneral(id){

if(!confirm("ลบงานศพนี้ใช่หรือไม่"))

return;



db.funerals=

db.funerals.filter(

x=>x.id!=id

);



saveDB();

loadFunerals();

notify("ลบข้อมูลสำเร็จ");

}



// ปิดงานศพ

function closeFuneral(id){

const f=db.funerals.find(

x=>x.id==id

);

if(!f)return;



if(confirm("ปิดงานศพนี้ใช่หรือไม่")){

f.active=false;

saveDB();

loadFunerals();

addActivity(

"ปิดงานศพ "+f.name

);

}

}



// งานศพปัจจุบัน

function getActiveFuneral(){

return db.funerals.find(

x=>x.active

);

}



// ล้างฟอร์ม

function clearFuneralForm(){

document.getElementById("funeralId").value="";

document.getElementById("firstName").value="";

document.getElementById("lastName").value="";

document.getElementById("age").value="";

document.getElementById("houseNo").value="";

document.getElementById("deathDate").value="";

document.getElementById("cremationDate").value="";

}



// โหลดเมื่อเปิดหน้า

window.addEventListener(

"load",

loadFunerals

);
