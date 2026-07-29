let members = JSON.parse(localStorage.getItem("members")) || [

{
    id:1,
    name:"นายจักร์กวัส ประพลรัตนัง",
    house:"2",
    rice:"12"
}

];


function saveMembers(){

localStorage.setItem(
"members",
JSON.stringify(members)
);

}
