// ==========================================
// auth.js
// Rongkhem Rice Group V5.0 (Full Completed)
// ระบบเข้าสู่ระบบ และ ตรวจสอบสิทธิ์การใช้งาน
// ==========================================

/**
 * 1. ตั้งค่าผู้ใช้งานเริ่มต้นลงใน localStorage
 * (จะทำงานเฉพาะตอนที่ยังไม่มีข้อมูลผู้ใช้งานในระบบ)
 */
function initDefaultUsers() {
    const localUsers = JSON.parse(localStorage.getItem("users")) || [];
    
    if (localUsers.length === 0) {
        const defaultUsers = [
            {
                userName: "admin",
                userPassword: "1234",
                fullName: "นายศักรนนทน์ ขัติย์วงศ์",
                role: "admin"
            },
            {
                userName: "committee",
                userPassword: "1234",
                fullName: "คณะกรรมการ",
                role: "committee"
            },
            {
                userName: "user",
                userPassword: "1234",
                fullName: "สมาชิกทั่วไป",
                role: "member"
            }
        ];
        localStorage.setItem("users", JSON.stringify(defaultUsers));
        console.log("✅ ตั้งค่าผู้ใช้เริ่มต้นเรียบร้อยแล้ว (admin, committee, user)");
    }
}

/**
 * 2. ฟังก์ชันเข้าสู่ระบบหลัก (Handle Login)
 * รองรับทั้งการส่งจาก <form onsubmit="handleLogin(event)"> หรือปุ่ม <button onclick="login()">
 */
function handleLogin(event) {
    if (event) event.preventDefault();

    const usernameInput = document.getElementById("username") ? document.getElementById("username").value.trim() : "";
    const passwordInput = document.getElementById("password") ? document.getElementById("password").value.trim() : "";
    const errorMsg = document.getElementById("errorMsg");

    if (!usernameInput || !passwordInput) {
        if (errorMsg) {
            errorMsg.innerText = "❌ กรุณากรอกชื่อผู้ใช้และรหัสผ่าน";
            errorMsg.style.display = "block";
        } else {
            alert("❌ กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
        }
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // ค้นหาผู้ใช้ที่ Username และ Password ตรงกัน
    const foundUser = users.find(
        u => (u.userName === usernameInput || u.username === usernameInput) && 
             (u.userPassword === passwordInput || u.password === passwordInput)
    );

    if (foundUser) {
        // บันทึก Session ให้รองรับทั้งคีย์ใหม่และคีย์เดิม
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem("currentUser", JSON.stringify(foundUser));
        sessionStorage.setItem("user", JSON.stringify(foundUser));

        alert("✅ เข้าสู่ระบบสำเร็จ");

        // ย้ายไปยังหน้า Dashboard หรือ หน้าหลัก
        window.location.href = "dashboard.html";
    } else {
        if (errorMsg) {
            errorMsg.innerText = "❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
            errorMsg.style.display = "block";
        } else {
            alert("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        }
    }
}

// ฟังก์ชัน Login สำรองสำหรับปุ่มที่เรียก onclick="login()"
function login() {
    handleLogin(null);
}

/**
 * 3. ฟังก์ชันออกจากระบบ (Logout)
 */
function logout() {
    if (confirm("ต้องการออกจากระบบใช่หรือไม่?")) {
        sessionStorage.clear();
        window.location.href = "login.html";
    }
}

/**
 * 4. ตรวจสอบสถานะการเข้าสู่ระบบ (Check Login)
 * ป้องกันการแอบเข้าผ่าน URL โดยไม่ได้ล็อกอิน
 */
function checkLogin() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true" || sessionStorage.getItem("loggedIn") === "true";
    if (!isLoggedIn) {
        window.location.href = "login.html";
    }
}

/**
 * 5. ดึงข้อมูลผู้ใช้ปัจจุบันมาแสดงบนหน้าจอ
 */
function loadUser() {
    const user = getCurrentUser();
    if (!user) return;

    const nameEl = document.getElementById("userName");
    const roleEl = document.getElementById("userRole");

    if (nameEl) nameEl.innerHTML = user.fullName || user.name || user.userName;
    if (roleEl) roleEl.innerHTML = getRoleText(user.role);
}

/**
 * แปลงชื่อสิทธิ์การใช้งานเป็นภาษาไทย
 */
function getRoleText(role) {
    switch (role) {
        case "admin": return "ผู้ดูแลระบบ";
        case "committee": return "คณะกรรมการ";
        case "member":
        case "user": return "สมาชิก";
        default: return role || "ผู้ใช้งาน";
    }
}

/**
 * 6. ฟังก์ชันดึงข้อมูลผู้ใช้ปัจจุบัน
 */
function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem("currentUser") || sessionStorage.getItem("user"));
}

/**
 * 7. ตรวจสอบระดับสิทธิ์ (Role Checks)
 */
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === "admin";
}

function isCommittee() {
    const user = getCurrentUser();
    return user && (user.role === "committee" || user.role === "admin");
}

function isUser() {
    const user = getCurrentUser();
    return user && (user.role === "member" || user.role === "user" || user.role === "committee" || user.role === "admin");
}

/**
 * ซ่อนเมนูสำหรับเฉพาะผู้ดูแลระบบ (Admin Only)
 */
function checkPermission() {
    if (isAdmin()) return;

    document.querySelectorAll(".admin-only").forEach(el => {
        el.style.display = "none";
    });
}

/**
 * 8. ฟังก์ชันเปลี่ยนรหัสผ่าน
 */
function changePassword() {
    const oldPass = prompt("กรุณากรอกรหัสผ่านเดิม:");
    if (!oldPass) return;

    const newPass = prompt("กรุณากรอกรหัสผ่านใหม่:");
    if (!newPass) return;

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // หาตำแหน่งผู้ใช้ในระบบ
    const index = users.findIndex(u => (u.userName || u.username) === (currentUser.userName || currentUser.username));

    const currentPass = users[index].userPassword || users[index].password;

    if (index === -1 || currentPass !== oldPass) {
        alert("❌ รหัสผ่านเดิมไม่ถูกต้อง");
        return;
    }

    // อัปเดตรหัสผ่านใหม่
    users[index].userPassword = newPass;
    users[index].password = newPass;
    currentUser.userPassword = newPass;
    currentUser.password = newPass;

    localStorage.setItem("users", JSON.stringify(users));
    sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
    sessionStorage.setItem("user", JSON.stringify(currentUser));

    alert("✅ เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
}

/**
 * 9. แสดงรายละเอียดข้อมูลระบบ
 */
function systemInfo() {
    const user = getCurrentUser();
    const userName = user ? (user.fullName || user.name || user.userName) : "ไม่ระบุ";
    const userRole = user ? getRoleText(user.role) : "ไม่ระบุ";

    alert(
`🌾 ระบบกลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6

ผู้ใช้งาน : ${userName}
สิทธิ์ : ${userRole}
Version : 5.0

พัฒนาโดย
นายศักรนนทน์ ขัติย์วงศ์
ผู้ใหญ่บ้าน บ้านร่องเข็ม หมู่ที่ 6`
    );
}

/**
 * 10. ทำงานอัตโนมัติเมื่อโหลดหน้าเว็บเรียบร้อย
 */
document.addEventListener("DOMContentLoaded", () => {
    initDefaultUsers();

    // หากเป็นหน้า login.html ไม่ต้องตรวจสอบการเข้าสู่ระบบ
    const isLoginPage = window.location.pathname.endsWith("login.html") || window.location.pathname.includes("login.html");
    if (isLoginPage) return;

    // ตรวจสอบล็อกอินและโหลดข้อมูลผู้ใช้สำหรับหน้าอื่นๆ
    checkLogin();
    loadUser();
    checkPermission();
});
