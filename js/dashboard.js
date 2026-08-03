// ========================================
// Dashboard V6.0
// Rongkhem Rice Group
// ========================================

// โหลด Dashboard
function loadDashboard(){

    // สมาชิก
    document.getElementById("totalMembers").innerHTML =
        db.members.length;

    // งานศพที่เปิด
    document.getElementById("funeralOpen").innerHTML =
        db.funerals.filter(f=>f.status=="open").length;

    // รับข้าวสาร
    document.getElementById("totalReceive").innerHTML =
        db.deliveries.length;

    // คลังข้าวสาร
    let stock=0;

    if(db.stockHistory){

        db.stockHistory.forEach(item=>{

            if(item.type=="receive")
                stock+=item.qty;

            if(item.type=="out")
                stock-=item.qty;

        });

    }

    document.getElementById("stockRemain").innerHTML=stock;

    loadFuneral();

    loadActivities();

    loadNews();

    loadPending();

}
