// ==========================================
// auth.js
// Rongkhem Rice Group V4.0
// ระบบเข้าสู่ระบบ
// ==========================================

// ==========================
// ผู้ใช้งานเริ่มต้น
// ==========================

const USERS = [
    {
        username: "admin",
        password: "1234",
        name: "นายศักรนนทน์ ขัติย์วงศ์",
        role: "admin"
    },
    {
        username: "committee",
        password: "1234",
        name: "คณะกรรมการ",
        role: "committee"
    },
    {
        username: "user",
        password: "1234",
        name: "สมาชิก",
        role: "user"
    }
];


// ==========================
// Login
// ==========================

function login() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const user = USERS.find(u =>
        u.username === username &&
        u.password === password
    );

    if (!user) {
        alert("❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return;
    }

    sessionStorage.setItem("loggedIn", "true");
    sessionStorage.setItem("user", JSON.stringify(user));

    alert("✅ เข้าสู่ระบบสำเร็จ");

    // ไปหน้า Dashboard
    window.location.href = "dashboard.html";
}



// ==========================
// Logout
// ==========================

function logout() {

    if (!confirm("ต้องการออกจากระบบใช่หรือไม่?"))
        return;

    sessionStorage.clear();

    window.location.href = "login.html";

}



// ==========================
// ตรวจสอบ Login
// ==========================

function checkLogin() {

    if (sessionStorage.getItem("loggedIn") !== "true") {

        window.location.href = "login.html";

    }

}



// ==========================
// โหลดข้อมูลผู้ใช้
// ==========================

function loadUser() {

    const user = JSON.parse(
        sessionStorage.getItem("user")
    );

    if (!user) return;

    const name = document.getElementById("userName");
    const role = document.getElementById("userRole");

    if (name)
        name.innerHTML = user.name;

    if (role)
        role.innerHTML = user.role;

}



// ==========================
// ตรวจสอบสิทธิ์
// ==========================

function isAdmin() {

    const user = JSON.parse(
        sessionStorage.getItem("user")
    );

    return user && user.role === "admin";

}

function isCommittee() {

    const user = JSON.parse(
        sessionStorage.getItem("user")
    );

    return user && user.role === "committee";

}

function isUser() {

    const user = JSON.parse(
        sessionStorage.getItem("user")
    );

    return user && user.role === "user";

}



// ==========================
// ซ่อนเมนู Admin
// ==========================

function checkPermission() {

    if (isAdmin()) return;

    document.querySelectorAll(".admin-only")
        .forEach(el => {

            el.style.display = "none";

        });

}



// ==========================
// เปลี่ยนรหัสผ่าน
// ==========================

function changePassword() {

    const oldPass = prompt("รหัสผ่านเดิม");

    const newPass = prompt("รหัสผ่านใหม่");

    if (!oldPass || !newPass)
        return;

    const user = JSON.parse(
        sessionStorage.getItem("user")
    );

    const index = USERS.findIndex(
        x => x.username === user.username
    );

    if (USERS[index].password !== oldPass) {

        alert("รหัสผ่านเดิมไม่ถูกต้อง");

        return;

    }

    USERS[index].password = newPass;

    alert("เปลี่ยนรหัสผ่านเรียบร้อย");

}



// ==========================
// ข้อมูลระบบ
// ==========================

function systemInfo() {

    const user = JSON.parse(
        sessionStorage.getItem("user")
    );

    alert(

`🌾 ระบบกลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6

ผู้ใช้งาน : ${user.name}

สิทธิ์ : ${user.role}

Version : 4.0

พัฒนาโดย
นายศักรนนทน์ ขัติย์วงศ์
ผู้ใหญ่บ้าน บ้านร่องเข็ม หมู่ที่ 6`

    );

}



// ==========================
// Auto Start
// ==========================

window.addEventListener("load", () => {

    // ถ้าเป็นหน้า Login ไม่ต้องตรวจสอบ
    if (
        window.location.pathname.includes("login.html")
    ) return;

    checkLogin();

    loadUser();

    checkPermission();

});
