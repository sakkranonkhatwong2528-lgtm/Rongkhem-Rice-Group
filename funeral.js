/* ==========================================
   Rongkhem Rice Group
   funeral.js
   Version 3.0 (ระบบบันทึกงานศพเชื่อมต่อ Firebase Cloud)
========================================== */

import { saveData, loadData, deleteData } from './database.js';

/**
 * ฟังก์ชันบันทึกข้อมูลแจ้งเสียชีวิต (บันทึกลง Cloud Firestore และ LocalStorage)
 * @param {string} deceasedName - ชื่อผู้เสียชีวิต
 * @param {Object} additionalInfo - ข้อมูลเพิ่มเติม (เช่น วันที่เสียชีวิต, บ้านเลขที่, หมายเหตุ)
 */
export async function saveFuneralData(deceasedName, additionalInfo = {}) {
    if (deceasedName && deceasedName.trim() !== "") {
        const cleanName = deceasedName.trim();
        
        // 1. เตรียมโครงสร้างข้อมูลสำหรับบันทึกลง Cloud
        const funeralRecord = {
            deceasedName: cleanName,
            date: new Date().toISOString(),
            ...additionalInfo
        };

        // 2. บันทึกลง Firebase Firestore (Collection: 'funerals')
        const result = await saveData('funerals', funeralRecord);

        if (result.success) {
            // 3. สำรองข้อมูลล่าสุดลง LocalStorage เพื่อให้หน้าอื่นๆ (เช่น news.html) ดึงไปแสดงผลได้ทันที
            localStorage.setItem("latest_deceased_name", cleanName);
            localStorage.setItem("latest_funeral_id", result.id);
            
            alert("บันทึกข้อมูลและอัปเดตระบบไว้อาลัยขึ้น Cloud เรียบร้อยแล้ว");
            return { success: true, id: result.id };
        } else {
            alert("เกิดข้อผิดพลาดในการบันทึกข้อมูลลง Cloud กรุณาลองใหม่อีกครั้ง");
            return { success: false, error: result.error };
        }
    } else {
        // หากไม่มีการระบุชื่อ ให้ล้างค่าออก
        localStorage.removeItem("latest_deceased_name");
        localStorage.removeItem("latest_funeral_id");
        alert("กรุณาระบุชื่อผู้เสียชีวิต");
        return { success: false, error: "Empty name" };
    }
}

/**
 * ฟังก์ชันดึงประวัติการแจ้งเสียชีวิตทั้งหมดจาก Cloud
 */
export async function getAllFunerals() {
    try {
        const funeralsList = await loadData('funerals');
        return funeralsList;
    } catch (error) {
        console.error("ไม่สามารถดึงข้อมูลรายการงานศพได้:", error);
        return [];
    }
}

/**
 * ฟังก์ชันลบข้อมูลการแจ้งเสียชีวิตจาก Cloud
 * @param {string} docId - ID ของเอกสารใน Firestore
 */
export async function removeFuneralData(docId) {
    if (!docId) return { success: false, error: "No ID provided" };
    
    const result = await deleteData('funerals', docId);
    if (result.success) {
        alert("ลบข้อมูลเรียบร้อยแล้ว");
        return { success: true };
    } else {
        alert("ไม่สามารถลบข้อมูลได้");
        return { success: false, error: result.error };
    }
}

// -------------------------------------------------------------
// ตัวอย่างการผูกอีเวนต์กับปุ่มในหน้า HTML (funeral.html)
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const btnSave = document.getElementById("btnSaveFuneral");
    if (btnSave) {
        btnSave.addEventListener("click", async function(e) {
            e.preventDefault();
            const inputElement = document.getElementById("inputDeceasedName");
            if (inputElement) {
                let inputName = inputElement.value;
                await saveFuneralData(inputName);
                // รีเฟรชหน้าจอเพื่อแสดงผลข้อมูลล่าสุด
                location.reload();
            }
        });
    }
});
