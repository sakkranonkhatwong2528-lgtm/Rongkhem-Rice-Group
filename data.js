let members = JSON.parse(localStorage.getItem("members")) || [];


/* เพิ่มสมาชิกค้างส่ง */

members.push({

name:"น.ส. ปวีณา มิ่งขวัญ",

house:"",

rice:"0",

status:"ยังไม่ส่ง",

pending:2

});


localStorage.setItem(
"members",
JSON.stringify(members)
);


console.log("เพิ่มข้อมูลเรียบร้อย");
