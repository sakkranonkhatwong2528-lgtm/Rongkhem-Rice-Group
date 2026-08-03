// ==========================================
// backup.js V5.0
// ระบบสำรองข้อมูล
// ==========================================

// ดาวน์โหลด Backup
function backupData(){

    const backup={

        members:db.members,

        funerals:db.funerals,

        deliveries:db.deliveries,

        stockHistory:db.stockHistory,

        settings:db.settings||{},

        activities:db.activities||[],

        backupDate:new Date().toLocaleString("th-TH"),

        version:"5.0"

    };

    const blob=new Blob(

        [JSON.stringify(backup,null,2)],

        {type:"application/json"}

    );

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download="Rongkhem-Rice-Backup.json";

    a.click();

    alert("สำรองข้อมูลเรียบร้อย");

}



// ==========================================
// กู้คืนข้อมูล
// ==========================================

function restoreData(){

    const file=document.getElementById("restoreFile").files[0];

    if(!file){

        alert("กรุณาเลือกไฟล์ Backup");

        return;

    }

    const reader=new FileReader();

    reader.onload=function(e){

        try{

            const data=JSON.parse(e.target.result);

            db.members=data.members||[];

            db.funerals=data.funerals||[];

            db.deliveries=data.deliveries||[];

            db.stockHistory=data.stockHistory||[];

            db.activities=data.activities||[];

            db.settings=data.settings||{};

            saveDB();

            alert("กู้คืนข้อมูลสำเร็จ");

            location.reload();

        }catch(error){

            alert("ไฟล์ Backup ไม่ถูกต้อง");

        }

    };

    reader.readAsText(file);

}



// ==========================================
// ล้างข้อมูลทั้งหมด
// ==========================================

function resetData(){

    if(!confirm("ต้องการล้างข้อมูลทั้งหมดใช่หรือไม่?")){

        return;

    }

    if(!confirm("ยืนยันอีกครั้ง ข้อมูลทั้งหมดจะถูกลบ")){

        return;

    }

    db.members=[];

    db.funerals=[];

    db.deliveries=[];

    db.stockHistory=[];

    db.activities=[];

    db.settings={};

    saveDB();

    alert("ล้างข้อมูลเรียบร้อย");

    location.reload();

}



// ==========================================
// Auto Backup
// ==========================================

function autoBackup(){

    localStorage.setItem(

        "lastBackup",

        new Date().toLocaleString("th-TH")

    );

}



// ==========================================
// โหลดระบบ
// ==========================================

window.addEventListener("load",function(){

    autoBackup();

});
