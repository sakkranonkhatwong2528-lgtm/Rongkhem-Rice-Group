// ==========================================
// stock.js
// ระบบคลังข้าวสาร V4.0
// ==========================================

// โหลดข้อมูลคลัง
function loadStock(){

const stockText=document.getElementById("stockTotal");
if(stockText){
stockText.innerHTML=db.stock;
}

loadStockHistory();

checkLowStock();

updateDashboard();

}



// รับข้าวสารเข้าคลัง
function stockIn(){

const qty=parseInt(
document.getElementById("stockInQty").value
);

if(!qty || qty<=0){
notify("กรุณาระบุจำนวน");
return;
}

db.stock+=qty;

db.stockHistory=db.stockHistory||[];

db.stockHistory.unshift({

id:Date.now().toString(),

type:"IN",

qty:qty,

date:new Date(),

remark:"รับเข้าคลัง"

});

addActivity("รับข้าวสารเข้าคลัง "+qty+" ถุง");

saveDB();

loadStock();

document.getElementById("stockInQty").value="";

}



// จ่ายข้าวสารออก
function stockOut(){

const qty=parseInt(
document.getElementById("stockOutQty").value
);

if(!qty || qty<=0){
notify("กรุณาระบุจำนวน");
return;
}

if(qty>db.stock){
notify("ข้าวสารไม่เพียงพอ");
return;
}

db.stock-=qty;

db.stockHistory=db.stockHistory||[];

db.stockHistory.unshift({

id:Date.now().toString(),

type:"OUT",

qty:qty,

date:new Date(),

remark:"จ่ายออก"

});

addActivity("จ่ายข้าวสาร "+qty+" ถุง");

saveDB();

loadStock();

document.getElementById("stockOutQty").value="";

}



// ตารางประวัติ
function loadStockHistory(){

const tbody=document.getElementById("stockTable");

if(!tbody)return;

tbody.innerHTML="";

(db.stockHistory||[]).forEach((item,index)=>{

tbody.innerHTML+=`

<tr>

<td>${index+1}</td>

<td>

${new Date(item.date).toLocaleDateString("th-TH")}

</td>

<td>

${
item.type=="IN"

?

'<span class="status normal">รับเข้า</span>'

:

'<span class="status danger">จ่ายออก</span>'

}

</td>

<td>${item.qty}</td>

<td>${item.remark}</td>

</tr>

`;

});

}



// แจ้งเตือนสต็อกต่ำ
function checkLowStock(){

const alertBox=document.getElementById("stockAlert");

if(!alertBox)return;

if(db.stock<=20){

alertBox.innerHTML=`
<div class="alert alert-danger">
⚠️ ข้าวสารคงเหลือน้อย (${db.stock} ถุง)
ควรจัดหาข้าวสารเพิ่ม
</div>
`;

}else{

alertBox.innerHTML=`
<div class="alert alert-success">
✅ คลังข้าวสารเพียงพอ (${db.stock} ถุง)
</div>
`;

}

}



// ค้นหาประวัติ
function searchStock(){

const keyword=document
.getElementById("searchStock")
.value
.toLowerCase();

const rows=document.querySelectorAll("#stockTable tr");

rows.forEach(r=>{

r.style.display=

r.innerText.toLowerCase().includes(keyword)

?

""

:

"none";

});

}



// พิมพ์รายงานคลัง
function printStock(){

const w=window.open();

w.document.write(`

<h2>รายงานคลังข้าวสาร</h2>

<hr>

<h3>คงเหลือ ${db.stock} ถุง</h3>

<table border="1" width="100%" cellspacing="0" cellpadding="8">

<tr>

<th>วันที่</th>

<th>ประเภท</th>

<th>จำนวน</th>

</tr>

${
(db.stockHistory||[]).map(i=>`

<tr>

<td>

${new Date(i.date).toLocaleDateString("th-TH")}

</td>

<td>

${i.type}

</td>

<td>

${i.qty}

</td>

</tr>

`).join("")
}

</table>

`);

w.print();

}



// รีเซ็ตคลัง
function resetStock(){

if(!confirm("ล้างข้อมูลคลังทั้งหมด ?"))

return;

db.stock=0;

db.stockHistory=[];

saveDB();

loadStock();

}



// โหลดหน้า
window.addEventListener(

"load",

loadStock

);
