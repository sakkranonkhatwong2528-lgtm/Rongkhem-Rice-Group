// ฐานข้อมูลสมาชิกกลุ่มข้าวสารบ้านร่องเข็ม

let members = JSON.parse(
localStorage.getItem("members")
) || [

{
id:1,
name:"นายจักรวัตร ประพลรัตนัง",
house:"2",
rice:"12"
}

];


// บันทึกข้อมูล
function saveData(){

localStorage.setItem(
"members",
JSON.stringify(members)
);

}


// เพิ่มสมาชิก
function addData(name,house,rice){

let newMember={

id:Date.now(),

name:name,

house:house,

rice:rice

};


members.push(newMember);

saveData();

}


// ลบสมาชิก
function deleteData(id){

members = members.filter(
m => m.id != id
);

saveData();

}


// แก้ไขสมาชิก
function editData(id,name,house,rice){

let member = members.find(
m=>m.id==id
);


if(member){

member.name=name;
member.house=house;
member.rice=rice;

saveData();

}

}


// ดึงข้อมูลสมาชิก
function getMembers(){

return members;

}
