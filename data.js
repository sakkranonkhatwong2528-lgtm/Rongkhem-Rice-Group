let members = JSON.parse(localStorage.getItem("members")) || [

{
id:1,
name:"นายจักรวัตร ประพลรัตนัง",
house:"2",
rice:"12"
}

];


function saveData(){

localStorage.setItem(
"members",
JSON.stringify(members)
);

}
