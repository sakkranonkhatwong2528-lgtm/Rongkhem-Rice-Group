// ฟังก์ชันบันทึกข้อมูลแจ้งเสียชีวิต
function saveFuneralData(deceasedName) {
    if (deceasedName && deceasedName.trim() !== "") {
        // บันทึกชื่อผู้เสียชีวิตลงใน LocalStorage เพื่อให้ news.html ดึงไปใช้
        localStorage.setItem("latest_deceased_name", deceasedName.trim());
        alert("บันทึกข้อมูลและอัปเดตระบบไว้อาลัยเรียบร้อยแล้ว");
    } else {
        // หากไม่มีการระบุ ให้ล้างค่าออก
        localStorage.removeItem("latest_deceased_name");
    }
}

// ตัวอย่างการกดปุ่มบันทึกในหน้างานศพ (ฟอร์มบันทึกแจ้งตาย)
// document.getElementById("btnSaveFuneral").addEventListener("click", function() {
//     let inputName = document.getElementById("inputDeceasedName").value;
//     saveFuneralData(inputName);
// });
