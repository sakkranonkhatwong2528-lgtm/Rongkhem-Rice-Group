// ==========================================
// receive.js
// ระบบรับข้าวสาร V4.0
// ==========================================

// โหลดสมาชิกสำหรับรับข้าวสาร
function loadReceiveMembers() {

    const tbody = document.getElementById("receiveTable");
    if (!tbody) return;

    const active = getActiveFuneral();

    tbody.innerHTML = "";

    if (!active) {
        tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align:center;color:red">
                ยังไม่มีงานศพที่เปิดอยู่
            </td>
        </tr>`;
        return;
    }

    db.members.forEach((m, i) => {

        const received = db.deliveries.find(d =>
            d.funeralId == active.id &&
            d.memberId == m.id
        );

        tbody.innerHTML += `
        <tr>

            <td>${i + 1}</td>

            <td>${m.houseNo}</td>

            <td>${m.name}</td>

            <td>${m.phone || "-"}</td>

            <td>
            ${
                received
                ?
                '<span class="status normal">ส่งแล้ว</span>'
                :
                '<span class="status pending">รอส่ง</span>'
            }
            </td>

            <td>

            ${
                received

                ?

                '-'

                :

                `<button
                    class="btn btn-success"
                    onclick="receiveRice('${m.id}')">

                    รับข้าวสาร

                </button>`
            }

            </td>

        </tr>

        `;

    });

}



// รับข้าวสาร

function receiveRice(memberId){

const active=getActiveFuneral();

if(!active){

notify("ไม่มีงานศพ");

return;

}

const member=db.members.find(

m=>m.id==memberId

);

if(!member)return;



db.deliveries.push({

id:Date.now().toString(),

funeralId:active.id,

memberId:member.id,

date:new Date()

});



// เพิ่มจำนวนส่ง

member.sent++;



// เพิ่มสต๊อก

db.stock++;



// บันทึกกิจกรรม

addActivity(

member.name+

" ส่งข้าวสาร"

);

saveDB();

loadReceiveMembers();

updateDashboard();

}



// ค้นหา

function searchReceive(){

const keyword=

document

.getElementById("searchReceive")

.value

.toLowerCase();



const rows=

document.querySelectorAll(

"#receiveTable tr"

);



rows.forEach(r=>{

r.style.display=

r.innerText

.toLowerCase()

.includes(keyword)

?

""

:

"none";

});

}



// รายชื่อค้างส่ง

function pendingMembers(){

const active=getActiveFuneral();

if(!active)return [];



return db.members.filter(member=>{

return !db.deliveries.find(

d=>

d.funeralId==active.id

&&

d.memberId==member.id

);

});

}



// ปิดงานศพ

function finishFuneral(){

const active=getActiveFuneral();

if(!active)return;



const pending=pendingMembers();



// เพิ่มจำนวนค้างส่ง

pending.forEach(m=>{

m.pending++;

});



active.active=false;



addActivity(

"ปิดงานศพ "+active.name

);



saveDB();

loadReceiveMembers();

updateDashboard();

notify("ปิดงานศพเรียบร้อย");

}



// ประวัติรับข้าวสาร

function loadHistory(){

const tbody=

document.getElementById("historyTable");

if(!tbody)return;



tbody.innerHTML="";



db.deliveries

.slice()

.reverse()

.forEach((d,i)=>{

const member=db.members.find(

m=>m.id==d.memberId

);

const funeral=db.funerals.find(

f=>f.id==d.funeralId

);



tbody.innerHTML+=`

<tr>

<td>${i+1}</td>

<td>${member?.name||"-"}</td>

<td>${funeral?.name||"-"}</td>

<td>

${new Date(d.date)

.toLocaleDateString("th-TH")}

</td>

<td>1 ถุง</td>

</tr>

`;

});

}



// พิมพ์ใบรับ

function printReceipt(memberId){

const member=db.members.find(

m=>m.id==memberId

);

const funeral=getActiveFuneral();



const w=window.open();

w.document.write(`

<h2>

ใบรับข้าวสาร

</h2>

<hr>

<p>

สมาชิก :

${member.name}

</p>

<p>

บ้านเลขที่ :

${member.houseNo}

</p>

<p>

งานศพ :

${funeral.name}

</p>

<p>

จำนวน :

1 ถุง

</p>

<p>

วันที่ :

${new Date().toLocaleDateString("th-TH")}

</p>

`);

w.print();

}



// โหลดหน้า

window.addEventListener(

"load",

()=>{

loadReceiveMembers();

loadHistory();

}

);
