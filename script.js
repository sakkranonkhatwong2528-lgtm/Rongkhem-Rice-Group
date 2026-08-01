
// =====================
// ระบบเพลงเปิด/ปิด
// =====================

const music = document.getElementById("bgMusic");
const musicBtn = document.querySelector(".music-btn");


function playMusic(){

if(music.paused){

music.play();

musicBtn.innerHTML="🔊 ปิดเพลง";

localStorage.setItem("music","on");

}

else{

music.pause();

musicBtn.innerHTML="🎵 เปิดเพลง";

localStorage.setItem("music","off");

}

}



// จำสถานะเพลง

window.onload=function(){

if(localStorage.getItem("music")=="on"){

music.play()
.catch(()=>{});

musicBtn.innerHTML="🔊 ปิดเพลง";

}

};





// =====================
// ตัวเลข Dashboard วิ่งขึ้น
// =====================


function countUp(element,target){

let number=0;

let speed=20;


let timer=setInterval(()=>{


number+=1;


element.innerHTML=number;


if(number>=target){

clearInterval(timer);

}


},speed);


}



document.addEventListener("DOMContentLoaded",()=>{


document.querySelectorAll(".box strong")

.forEach((item)=>{


let value=parseInt(item.innerText);


item.innerText="0";


countUp(item,value);


});


});






// =====================
// กลีบดอกไม้ลอย
// =====================


function createFlower(){


const flower=document.createElement("div");


flower.innerHTML="🌸";


flower.className="fall-flower";


flower.style.left=

Math.random()*100+"vw";


flower.style.animationDuration=

(5+Math.random()*5)+"s";


document.body.appendChild(flower);



setTimeout(()=>{

flower.remove();

},10000);


}



setInterval(createFlower,1200);





// =====================
// Scroll Animation
// =====================


const cards=document.querySelectorAll(

".menu a,.box,.memorial-card"

);



window.addEventListener("scroll",()=>{


cards.forEach(card=>{


let top=

card.getBoundingClientRect().top;


if(top < window.innerHeight-80){


card.style.opacity="1";

card.style.transform="translateY(0)";


}


});


});
