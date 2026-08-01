<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">

<title>ติดตามสมาชิกกลุ่มข้าวสาร</title>

<style>

body{
font-family:Arial,"Tahoma";
background:#f5f7f5;
padding:15px;
}

h1{
text-align:center;
color:#2e7d32;
}

.box{
background:white;
padding:15px;
margin:10px auto;
border-radius:15px;
max-width:900px;
box-shadow:0 3px 10px #ccc;
}

.member{
background:#fff;
padding:12px;
margin:10px 0;
border-radius:10px;
border-left:6px solid green;
}

.warn{
border-left-color:orange;
}

.danger{
border-left-color:red;
}


button{
padding:8px 12px;
border:0;
border-radius:8px;
background:#2e7d32;
color:white;
}

input{
width:100%;
padding:10px;
border-radius:8px;
border:1px solid #ccc;
}

</style>


</head>

<body>


<h1>
👥 ติดตามสมาชิกกลุ่มข้าวสาร<br>
บ้านร่องเข็ม หมู่ที่ 6
</h1>


<div class="box">

สมาชิกทั้งหมด :
<b id="total">0</b>

<br>

ค้างส่ง :
<b id="pending">0</b>

</div>


<div class="box">

<input id="search"
placeholder="ค้นหาชื่อ หรือ บ้านเลขที่"
onkeyup="show()">

</div>


<div class="box" id="list"></div>



<script src="ข้อมูล.js"></script>


<script>


let members = membersData || [];



function show(){


let key =
document.getElementById("search")
.value
.toLowerCase();


let html="";

let pending=0;



members.forEach((m,i)=>{


if(m.pending>0){
pending++;
}



let txt =
(m.name+m.house)
.toLowerCase();



if(txt.includes(key)){


let cls="member";


let status="🟢 ปกติ";


if(m.pending==1){

cls+=" warn";

status="🟡 แจ้งเตือน 1 ครั้ง";

}


if(m.pending>=2){

cls+=" danger";

status="🔴 เสนอพิจารณาตัดสมาชิก";

}



html+=`

<div class="${cls}">

<b>
${i+1}. ${m.name}
</b>

<br>

🏠 บ้านเลขที่ : ${m.house}

<br>

📦 ค้างส่ง : ${m.pending} ครั้ง

<br>

${status}

<br><br>


<button onclick="add(${i})">
📦 บันทึกค้างส่งศพ
</button>


</div>

`;

}


});


document.getElementById("list").innerHTML=html;


document.getElementById("total").innerHTML=
members.length;


document.getElementById("pending").innerHTML=
pending;


}



function add(i){

members[i].pending++;

localStorage.setItem(
"members",
JSON.stringify(members)
);

show();

}



show();


</script>


</body>
</html>
