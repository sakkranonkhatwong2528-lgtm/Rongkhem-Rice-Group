const CACHE_NAME = "rice-group-v1";

const files = [

"index.html",
"admin-member.html",
"งานศพ.html",
"รับ.html",
"รายงาน.html",
"สต็อก.html",
"แจ้งเตือน.html",
"manifest.json"

];


self.addEventListener("install",event=>{


event.waitUntil(

caches.open(CACHE_NAME)
.then(cache=>{

return cache.addAll(files);

})

);


});




self.addEventListener("fetch",event=>{


event.respondWith(

caches.match(event.request)
.then(response=>{


return response || fetch(event.request);


})

);


});
