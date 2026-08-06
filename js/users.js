let editIndex = null; // ตัวแปรเก็บตำแหน่งผู้ใช้ที่กำลังแก้ไข (-1 หรือ null หมายถึงโหมดเพิ่มใหม่)

document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
});

// ดึงข้อมูลผู้ใช้และแสดงผลในตาราง (รองรับการค้นหา)
function loadUsers(searchTerm = "", roleFilter = "all") {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const tbody = document.getElementById("userTable");
    tbody.innerHTML = "";

    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (filteredUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">ไม่พบข้อมูลผู้ใช้งาน</td></tr>`;
        return;
    }

    filteredUsers.forEach((user, index) => {
        // หา Index จริงใน Array หลัก
        const originalIndex = users.findIndex(u => u.userName === user.userName);

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${user.userName}</strong></td>
            <td>${user.fullName}</td>
            <td><span class="badge ${user.role}">${getRoleName(user.role)}</span></td>
            <td>
                <button class="btn-edit" onclick="editUser(${originalIndex})">✏️ แก้ไข</button>
                <button class="btn-delete" onclick="deleteUser(${originalIndex})">🗑️ ลบ</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// เพิ่มหรืออัปเดตข้อมูลผู้ใช้
function saveUser() {
    const userNameInput = document.getElementById("userName");
    const userPasswordInput = document.getElementById("userPassword");
    const fullNameInput = document.getElementById("fullName");
    const roleInput = document.getElementById("role");

    const userName = userNameInput.value.trim();
    const userPassword = userPasswordInput.value.trim();
    const fullName = fullNameInput.value.trim();
    const role = roleInput.value;

    if (!userName || !fullName) {
        alert("กรุณากรอกชื่อผู้ใช้ และชื่อ-นามสกุล");
        return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (editIndex === null) {
        // --- โหมดเพิ่มผู้ใช้ใหม่ ---
        if (!userPassword) {
            alert("กรุณากรอกรหัสผ่านสำหรับผู้ใช้ใหม่");
            return;
        }
        if (users.some(u => u.userName === userName)) {
            alert("ชื่อผู้ใช้งานนี้มีอยู่ในระบบแล้ว");
            return;
        }

        users.push({ userName, userPassword, fullName, role });
        alert("เพิ่มผู้ใช้งานเรียบร้อยแล้ว");
    } else {
        // --- โหมดแก้ไขผู้ใช้ ---
        users[editIndex].fullName = fullName;
        users[editIndex].role = role;
        
        // ถ้าระบุรหัสผ่านใหม่ ให้ทำการเปลี่ยนรหัสผ่าน
        if (userPassword) {
            users[editIndex].userPassword = userPassword;
        }

        alert("อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว");
        cancelEdit(); // รีเซ็ตโหมดการแก้ไข
    }

    localStorage.setItem("users", JSON.stringify(users));
    clearForm();
    loadUsers();
}

// ดึงข้อมูลผู้ใช้ขึ้นมาบนฟอร์มเพื่อแก้ไข
function editUser(index) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users[index];

    if (!user) return;

    editIndex = index;
    document.getElementById("userName").value = user.userName;
    document.getElementById("userName").disabled = true; // ห้ามเปลี่ยน Username
    document.getElementById("userPassword").value = ""; // เว้นว่างไว้ หากไม่ต้องการเปลี่ยน
    document.getElementById("userPassword").placeholder = "เว้นว่างไว้หากไม่เปลี่ยนรหัสผ่าน";
    document.getElementById("fullName").value = user.fullName;
    document.getElementById("role").value = user.role;

    // เปลี่ยนปุ่ม บันทึก/ยกเลิก
    const btnSave = document.getElementById("btnSave");
    btnSave.innerHTML = "💾 บันทึกการแก้ไข";
    btnSave.style.background = "#ffc107";
    btnSave.style.color = "#000";

    document.getElementById("btnCancel").style.display = "inline-block";
}

// ยกเลิกโหมดแก้ไข
function cancelEdit() {
    editIndex = null;
    clearForm();
    
    const userNameInput = document.getElementById("userName");
    userNameInput.disabled = false;
    document.getElementById("userPassword").placeholder = "รหัสผ่าน";

    const btnSave = document.getElementById("btnSave");
    btnSave.innerHTML = "➕ เพิ่มผู้ใช้";
    btnSave.style.background = "#198754";
    btnSave.style.color = "#fff";

    document.getElementById("btnCancel").style.display = "none";
}

// ล้างค่าในฟอร์ม
function clearForm() {
    document.getElementById("userName").value = "";
    document.getElementById("userPassword").value = "";
    document.getElementById("fullName").value = "";
    document.getElementById("role").value = "admin";
}

// ลบผู้ใช้งาน
function deleteUser(index) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users[index];

    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${user.fullName}"?`)) {
        users.splice(index, 1);
        localStorage.setItem("users", JSON.stringify(users));
        loadUsers();
    }
}

// ค้นหาและกรองข้อมูล
function filterUsers() {
    const searchVal = document.getElementById("searchInput").value;
    const roleVal = document.getElementById("roleFilter").value;
    loadUsers(searchVal, roleVal);
}

// แปลงชื่อสิทธิ์เป็นภาษาไทย
function getRoleName(role) {
    switch (role) {
        case "admin": return "ผู้ดูแลระบบ";
        case "committee": return "คณะกรรมการ";
        case "member": return "สมาชิก";
        default: return role;
    }
}
