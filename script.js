// ==========================
// Rongkhem Rice Group v1.0
// ==========================

// โหลดข้อมูล
function loadData(key){
    return JSON.parse(localStorage.getItem(key)) || [];
}

// บันทึกข้อมูล
function saveData(key,data){
    localStorage.setItem(key,JSON.stringify(data));
}

// ลบข้อมูล
function clearData(key){
    localStorage.removeItem(key);
}

// Export JSON
function exportJSON(key,fileName){

    const data = loadData(key);

    const blob = new Blob(
        [JSON.stringify(data,null,2)],
        {type:"application/json"}
    );

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download=fileName+".json";

    a.click();

}

// Import JSON
function importJSON(key,file,callback){

    const reader=new FileReader();

    reader.onload=function(e){

        try{

            const data=JSON.parse(e.target.result);

            saveData(key,data);

            alert("นำเข้าข้อมูลสำเร็จ");

            if(callback) callback();

        }catch{

            alert("ไฟล์ไม่ถูกต้อง");

        }

    }

    reader.readAsText(file);

}

// สร้างรหัสสมาชิก
function createID(){

    return Date.now();

}

// ค้นหา
function searchData(data,keyword){

    keyword=keyword.toLowerCase();

    return data.filter(item=>

        JSON.stringify(item)
        .toLowerCase()
        .includes(keyword)

    );

}
