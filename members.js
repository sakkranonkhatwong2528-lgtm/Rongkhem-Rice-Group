/* ==========================================
   Rongkhem Rice Group
   members.js (ฉบับสมบูรณ์: ดูได้ทุกคน / จัดการเฉพาะแอดมิน)
========================================== */

import { loadData, saveData, deleteData } from './database.js';

const STORAGE_KEY = "Rongkhem_Members_Local";

// 1. ฟังก์ชันตรวจสอบสิทธิ์แอดมิน (ตรวจสอบจาก localStorage ถ้ามีค่าเป็น admin)
function checkAdminPermission() {
    const userRole = localStorage.getItem("user_role"); // ตัวอย่างค่า: 'admin' หรือไม่มีค่า
    return userRole === "admin";
}

// 2. ฟังก์ชันดึงข้อมูลสมาชิกทั้งหมด (ทุกคนเปิดเข้ามาดูได้ทันทีโดยไม่ต้องล็อกอิน)
export async function getRongkhemMembers() {
    try {
        const cloudMembers = await loadData('members');
        if (cloudMembers && cloudMembers.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudMembers));
            return cloudMembers;
        }
    } catch (error) {
        console.warn("ไม่สามารถเชื่อมต่อ Cloud ได้, ใช้ข้อมูลสำรองในเครื่องแทน", error);
    }

    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
        try {
            return JSON.parse(localData);
        } catch (e) {
            console.error("Error parsing local storage members:", e);
        }
    }
    return [];
}

// 3. ฟังก์ชันเพิ่มสมาชิกใหม่ (ทำงานเฉพาะเมื่อเป็นแอดมินเท่านั้น)
export async function addNewMember(memberData) {
    if (!checkAdminPermission()) {
        alert("❌ คุณไม่มีสิทธิ์เพิ่มข้อมูล เนื่องจากสถานะของคุณเป็นผู้เยี่ยมชม (สำหรับแอดมินระบบเท่านั้น)");
        return { success: false, error: "Permission Denied" };
    }

    const result = await saveData('members', memberData);
    if (result.success) {
        alert("✅ แอดมินบันทึกข้อมูลสมาชิกใหม่สำเร็จ");
        return { success: true, id: result.id };
    } else {
        alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        return { success: false, error: result.error };
    }
}

// 4. ฟังก์ชันลบสมาชิก (ทำงานเฉพาะเมื่อเป็นแอดมินเท่านั้น)
export async function removeMember(docId) {
    if (!checkAdminPermission()) {
        alert("❌ คุณไม่มีสิทธิ์ลบข้อมูล เนื่องจากสถานะของคุณเป็นผู้เยี่ยมชม (สำหรับแอดมินระบบเท่านั้น)");
        return { success: false, error: "Permission Denied" };
    }

    const result = await deleteData('members', docId);
    if (result.success) {
        alert("✅ แอดมินลบข้อมูลสมาชิกสำเร็จ");
        return { success: true };
    } else {
        alert("❌ ไม่สามารถลบข้อมูลได้");
        return { success: false, error: result.error };
    }
}

// 5. ฟังก์ชันซ่อน/แสดงปุ่มจัดการอัตโนมัติตามสิทธิ์ผู้ใช้
export function applyRoleBasedUI() {
    const isAdmin = checkAdminPermission();
    const adminElements = document.querySelectorAll(".admin-only");
    
    adminElements.forEach(el => {
        if (!isAdmin) {
            el.style.display = "none"; // ซ่อนปุ่มเพิ่ม/ลบ สำหรับบุคคลทั่วไป
        } else {
            el.style.display = "block"; // แสดงปุ่มให้แอดมิน
        }
    });
}

// ทำงานอัตโนมัติเมื่อเปิดหน้าเว็บขึ้นมา
document.addEventListener("DOMContentLoaded", () => {
    applyRoleBasedUI();
});
