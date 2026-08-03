// ==========================================
// report.js V5.0
// ระบบรายงาน
// ==========================================

function loadReport(){

    document.getElementById("reportMembers").innerHTML =
        db.members.length;

    document.getElementById("reportFunerals").innerHTML =
        db.funerals.length;

    document.getElementById("reportReceive").innerHTML =
        db.deliveries.length;

    const pending =
        db.members.filter(m => (m.pending || 0) > 0);

    document.getElementById("reportPending").innerHTML =
        pending.length;

    const tbody =
        document.getElementById("reportTable");

    tbody.innerHTML = "";

    pending.forEach(member => {

        tbody.innerHTML += `

<tr>

<td>${member.houseNo}</td>

<td>${member.name}</td>

<td>${member.pending} ครั้ง</td>

</tr>

`;

    });

}



// ==========================================
// พิมพ์รายงาน
// ==========================================

function printReport(){

    window.print();

}



// ==========================================
// Export CSV (เปิดด้วย Excel ได้)
// ==========================================

function exportExcel(){

    let csv =
"บ้านเลขที่,ชื่อสมาชิก,ค้างส่ง\n";

    db.members.forEach(member=>{

        csv +=
`${member.houseNo},${member.name},${member.pending}\n`;

    });

    const blob = new Blob(
        [csv],
        {
            type:"text/csv;charset=utf-8;"
        }
    );

    const a = document.createElement("a");

    a.href = URL.createObjectURL(blob);

    a.download = "รายงานสมาชิก.csv";

    a.click();

}



// ==========================================
// Export PDF
// ==========================================

function exportPDF(){

    window.print();

}



// ==========================================
// โหลดหน้า
// ==========================================

window.addEventListener("load",()=>{

    loadReport();

});
