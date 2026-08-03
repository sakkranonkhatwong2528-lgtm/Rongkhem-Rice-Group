// ===============================
// app.js
// Rongkhem Rice Group V4.0
// ===============================

// ---------- Default Database ----------

const DEFAULT_DB = {

members:[],

funerals:[],

deliveries:[],

stock:0,

activity:[]

};

// ---------- Load Database ----------

let db = JSON.parse(

localStorage.getItem("rice_db")

) || DEFAULT_DB;


// ---------- Save Database ----------

function saveDB(){

localStorage.setItem(

"rice_db",

JSON.stringify(db)

);

updateDashboard();

}



// ---------- Clock ----------

function updateClock(){

const now = new Date();

const clock = document.getElementById("clock");

const today = document.getElementById("today");

if(clock){

clock.innerHTML=

now.toLocaleTimeString("th-TH");

}

if(today){

today.innerHTML=

now.toLocaleDateString(

"th-TH",

{

weekday:"long",

day:"numeric",

month:"long",

year:"numeric"

}

);

}

}

setInterval(updateClock,1000);

updateClock();



// ---------- Dashboard ----------

function updateDashboard(){

const members=db.members.length;

const funerals=db.funerals.filter(

f=>f.active

).length;

const stock=db.stock;

const pending=db.members.filter(

m=>m.pending>=1

).length;

setText("stat-members",members);

setText("stat-funerals",funerals);

setText("stat-rice",stock);

setText("stat-pending",pending);

drawChart();

}



// ---------- Helper ----------

function setText(id,value){

const el=document.getElementById(id);

if(el){

el.innerHTML=value;

}

}



// ---------- Activity ----------

function addActivity(message){

db.activity.unshift({

date:new Date(),

message

});

if(db.activity.length>50){

db.activity.pop();

}

saveDB();

}



// ---------- Stock ----------

function addRice(qty){

db.stock+=qty;

addActivity(

"รับข้าวสาร "+qty+" ถุง"

);

saveDB();

}



function removeRice(qty){

db.stock-=qty;

if(db.stock<0){

db.stock=0;

}

addActivity(

"จ่ายข้าวสาร "+qty+" ถุง"

);

saveDB();

}



// ---------- Notification ----------

function notify(text){

alert(text);

}



// ---------- Backup ----------

function backupData(){

const blob=new Blob(

[JSON.stringify(db)],

{type:"application/json"}

);

const a=document.createElement("a");

a.href=URL.createObjectURL(blob);

a.download="backup.json";

a.click();

}



// ---------- Restore ----------

function restoreData(file){

const reader=new FileReader();

reader.onload=function(e){

db=JSON.parse(e.target.result);

saveDB();

notify("กู้คืนข้อมูลสำเร็จ");

}

reader.readAsText(file);

}



// ---------- Chart ----------

function drawChart(){

const canvas=document.getElementById("myChart");

if(!canvas)return;

new Chart(canvas,{

type:"bar",

data:{

labels:["สมาชิก","งานศพ","ข้าวสาร"],

datasets:[{

data:[

db.members.length,

db.funerals.length,

db.stock

],

backgroundColor:[

"#0d6efd",

"#dc3545",

"#198754"

]

}]

},

options:{

plugins:{

legend:{

display:false

}

}

}

});

}



// ---------- Search ----------

function search(keyword,list){

keyword=keyword.toLowerCase();

return list.filter(item=>

JSON.stringify(item)

.toLowerCase()

.includes(keyword)

);

}



// ---------- Loading ----------

window.onload=function(){

updateDashboard();

setTimeout(()=>{

const load=document.getElementById("loading");

if(load){

load.style.display="none";

}

},800);

};
