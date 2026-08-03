// ==========================================
// stock.js
// ระบบคลังข้าวสาร V5.0
// ==========================================

// โหลดข้อมูลคลัง
function loadStock(){

    const tbody=document.getElementById("stockTable");

    if(!tbody) return;

    tbody.innerHTML="";

    let receive=0;
    let out=0;

    db.stockHistory.forEach(item=>{

        if(item.type=="receive") receive+=item.qty;

        if(item.type=="out") out+=item.qty;

        tbody.innerHTML+=`

<tr>

<td>${item.date}</td>

<td>${item.detail}</td>

<td>${item.qty}</td>

<td>${item.balance}</td>

</tr>

`;

    });

    document.getElementById("totalRice").innerHTML=receive;

    document.getElementById("outRice").innerHTML=out;

    document.getElementById("stockRice").innerHTML=receive-out;

    document.getElementById("funeralCount").innerHTML=db.funerals.length;

}



// รับเข้าคลัง

function addStock(){

    const qty=parseInt(prompt("จำนวนถุง"));

    if(isNaN(qty)||qty<=0) return;

    const balance=(db.stockHistory.length==0)

        ? qty

        : db.stockHistory[db.stockHistory.length-1].balance+qty;

    db.stockHistory.push({

        id:Date.now(),

        date:new Date().toLocaleDateString("th-TH"),

        detail:"รับเข้าคลัง",

        qty:qty,

        balance:balance,

        type:"receive"

    });

    saveDB();

    loadStock();

}



// เบิกออก

function outStock(){

    const qty=parseInt(prompt("จำนวนถุง"));

    if(isNaN(qty)||qty<=0) return;

    const last=(db.stockHistory.length==0)

        ? 0

        : db.stockHistory[db.stockHistory.length-1].balance;

    if(last<qty){

        alert("ข้าวสารไม่เพียงพอ");

        return;

    }

    db.stockHistory.push({

        id:Date.now(),

        date:new Date().toLocaleDateString("th-TH"),

        detail:"เบิกช่วยงานศพ",

        qty:qty,

        balance:last-qty,

        type:"out"

    });

    saveDB();

    loadStock();

}



// โหลดหน้า

window.addEventListener("load",function(){

    if(!db.stockHistory)

        db.stockHistory=[];

    loadStock();

});
