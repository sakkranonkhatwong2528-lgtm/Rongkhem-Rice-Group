// ==========================================
// report.js
// ระบบรายงาน V4.0
// ==========================================

// โหลด Dashboard รายงาน
function loadReport() {

    reportSummary();

    reportChart();

    reportPending();

}



// =============================
// สรุปภาพรวม
// =============================

function reportSummary() {

    setText("rpMembers", db.members.length);

    setText("rpFunerals", db.funerals.length);

    setText("rpDeliveries", db.deliveries.length);

    setText("rpStock", db.stock);

}



// =============================
// สมาชิกค้างส่ง
// =============================

function reportPending() {

    const tbody = document.getElementById("pendingTable");

    if (!tbody) return;

    tbody.innerHTML = "";



    const list = db.members.filter(m => m.pending >= 1);



    list.forEach((m, i) => {

        tbody.innerHTML += `

<tr>

<td>${i + 1}</td>

<td>${m.houseNo}</td>

<td>${m.name}</td>

<td>${m.pending}</td>

</tr>

`;

    });

}



// =============================
// กราฟ
// =============================

function reportChart() {

    const canvas = document.getElementById("reportChart");

    if (!canvas) return;



    new Chart(canvas, {

        type: "doughnut",

        data: {

            labels: [

                "สมาชิก",

                "งานศพ",

                "รับข้าวสาร",

                "คลัง"

            ],

            datasets: [{

                data: [

                    db.members.length,

                    db.funerals.length,

                    db.deliveries.length,

                    db.stock

                ],

                backgroundColor: [

                    "#198754",

                    "#dc3545",

                    "#0d6efd",

                    "#ffc107"

                ]

            }]

        },

        options: {

            responsive: true

        }

    });

}



// =============================
// รายงานสมาชิก
// =============================

function printMembersReport() {

    const w = window.open();



    w.document.write(`

<h2>รายงานสมาชิก</h2>

<table border="1"

width="100%"

cellpadding="8"

cellspacing="0">

<tr>

<th>บ้านเลขที่</th>

<th>ชื่อ</th>

<th>ส่งแล้ว</th>

<th>ค้างส่ง</th>

</tr>

${

db.members.map(m => `

<tr>

<td>${m.houseNo}</td>

<td>${m.name}</td>

<td>${m.sent}</td>

<td>${m.pending}</td>

</tr>

`).join("")

}

</table>

`);

    w.print();

}



// =============================
// รายงานงานศพ
// =============================

function printFuneralReport() {

    const w = window.open();



    w.document.write(`

<h2>รายงานงานศพ</h2>

<table border="1"

width="100%"

cellpadding="8"

cellspacing="0">

<tr>

<th>ผู้เสียชีวิต</th>

<th>บ้านเลขที่</th>

<th>วันฌาปนกิจ</th>

</tr>

${

db.funerals.map(f => `

<tr>

<td>${f.name}</td>

<td>${f.houseNo}</td>

<td>${f.cremationDate}</td>

</tr>

`).join("")

}

</table>

`);

    w.print();

}



// =============================
// รายงานคลัง
// =============================

function printStockReport() {

    const w = window.open();



    w.document.write(`

<h2>รายงานคลังข้าวสาร</h2>

<h3>คงเหลือ ${db.stock} ถุง</h3>

`);

    w.print();

}



// =============================
// Export JSON
// =============================

function exportReport() {

    const report = {

        members: db.members.length,

        funerals: db.funerals.length,

        deliveries: db.deliveries.length,

        stock: db.stock,

        pending: db.members.filter(

            m => m.pending >= 1

        ).length,

        createDate: new Date()

    };



    const blob = new Blob(

        [

            JSON.stringify(report, null, 2)

        ],

        {

            type: "application/json"

        }

    );



    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = "report.json";

    a.click();

}



// =============================
// Export CSV (Excel)
// =============================

function exportCSV(){

let csv="บ้านเลขที่,ชื่อ,ส่งแล้ว,ค้างส่ง\n";

db.members.forEach(m=>{

csv+=`${m.houseNo},${m.name},${m.sent},${m.pending}\n`;

});

const blob=new Blob([csv],{

type:"text/csv"

});

const a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="members.csv";

a.click();

}



// =============================
// โหลดหน้า
// =============================

window.addEventListener(

"load",

loadReport

);
