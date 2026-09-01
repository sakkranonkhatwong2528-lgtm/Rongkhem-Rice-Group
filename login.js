// login.js
// ไฟล์จัดการการเข้าสู่ระบบสำหรับ Rongkhem Rice Group

// ============================================
// ฟังก์ชันแสดงข้อความ error
// ============================================
function showError(message) {
    console.error("Login Error:", message);
    
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.style.color = 'red';
        errorDiv.style.padding = '10px';
        errorDiv.style.margin = '10px 0';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.backgroundColor = '#ffe6e6';
        errorDiv.style.border = '1px solid #ff9999';
        
        // ซ่อนข้อความ error หลังจาก 5 วินาที
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    } else {
        // ถ้าไม่มี errorDiv ใน HTML ให้สร้างใหม่
        const newErrorDiv = document.createElement('div');
        newErrorDiv.id = 'errorMessage';
        newErrorDiv.textContent = message;
        newErrorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(newErrorDiv);
        
        setTimeout(() => {
            newErrorDiv.remove();
        }, 5000);
    }
}

// ============================================
// ฟังก์ชันแสดงข้อความสำเร็จ
// ============================================
function showSuccess(message) {
    console.log("Login Success:", message);
    
    const successDiv = document.createElement('div');
    successDiv.textContent = message;
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// ============================================
// ฟังก์ชันตรวจสอบ Firebase พร้อมใช้งาน
// ============================================
function isFirebaseReady() {
    if (typeof firebase === 'undefined') {
        showError("Firebase SDK ไม่ได้โหลด กรุณาตรวจสอบอินเทอร์เน็ต");
        return false;
    }
    
    if (!window.auth) {
        showError("ระบบ Authentication ยังไม่พร้อม");
        return false;
    }
    
    return true;
}

// ============================================
// ฟังก์ชันหลักสำหรับล็อกอิน
// ============================================
async function loginUser(email, password) {
    console.log("Attempting login with email:", email);
    
    // ตรวจสอบข้อมูลเบื้องต้น
    if (!email || !password) {
        showError("กรุณากรอกอีเมลและรหัสผ่าน");
        return false;
    }
    
    // ตรวจสอบรูปแบบอีเมล
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError("รูปแบบอีเมลไม่ถูกต้อง");
        return false;
    }
    
    // ตรวจสอบว่า Firebase พร้อมใช้งาน
    if (!isFirebaseReady()) {
        return false;
    }
    
    try {
        console.log("Calling Firebase signInWithEmailAndPassword...");
        
        // ล็อกอินด้วย Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        console.log("✅ Firebase login successful!");
        console.log("User:", userCredential.user);
        
        // ตรวจสอบว่ายืนยันอีเมลแล้วหรือยัง
        if (!userCredential.user.emailVerified) {
            console.warn("⚠️ Email not verified");
            showError("⚠️ กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ");
            
            // สามารถส่งอีเมลยืนยันซ้ำได้ที่นี่
            // await userCredential.user.sendEmailVerification();
            // showSuccess("ส่งอีเมลยืนยันใหม่แล้ว กรุณาตรวจสอบอีเมลของคุณ");
            
            // ออกจากระบบชั่วคราว
            await auth.signOut();
            return false;
        }
        
        // แสดงข้อความสำเร็จ
        showSuccess("✅ เข้าสู่ระบบสำเร็จ!");
        
        // บันทึกข้อมูลผู้ใช้ใน localStorage (optional)
        localStorage.setItem('userEmail', userCredential.user.email);
        localStorage.setItem('userId', userCredential.user.uid);
        
        // รอ 1.5 วินาทีแล้วเปลี่ยนหน้า
        setTimeout(() => {
            console.log("Redirecting to dashboard...");
            window.location.href = 'dashboard.html';
        }, 1500);
        
        return true;
        
    } catch (error) {
        console.error("🔥 Firebase Login Error Details:");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("Full Error:", error);
        
        // แปลงข้อความ error ให้เป็นภาษาไทย
        let errorMessage = "เข้าสู่ระบบไม่สำเร็จ";
        
        switch (error.code) {
            case 'auth/invalid-email':
                errorMessage = "❌ อีเมลไม่ถูกต้อง";
                break;
            case 'auth/user-disabled':
                errorMessage = "❌ บัญชีนี้ถูกระงับการใช้งาน";
                break;
            case 'auth/user-not-found':
                errorMessage = "❌ ไม่พบบัญชีผู้ใช้นี้";
                break;
            case 'auth/wrong-password':
                errorMessage = "❌ รหัสผ่านไม่ถูกต้อง";
                break;
            case 'auth/too-many-requests':
                errorMessage = "⚠️ ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่";
                break;
            case 'auth/network-request-failed':
                errorMessage = "🌐 ปัญหาเครือข่าย กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
                break;
            case 'auth/operation-not-allowed':
                errorMessage = "🚫 ระบบล็อกอินด้วยอีเมลยังไม่เปิดใช้งาน";
                console.error("IMPORTANT: ใน Firebase Console > Authentication > Sign-in method ต้องเปิดใช้งาน Email/Password");
                break;
            default:
                errorMessage = `❌ ${error.message}`;
        }
        
        showError(errorMessage);
        
        // ลองตรวจสอบสถานะ Firebase
        setTimeout(() => {
            if (!window.auth) {
                showError("ตรวจพบปัญหา: Firebase Auth ไม่พร้อมใช้งาน");
            }
        }, 100);
        
        return false;
    }
}

// ============================================
// ฟังก์ชันตรวจสอบสถานะล็อกอินปัจจุบัน
// ============================================
function checkCurrentLoginStatus() {
    if (window.isUserLoggedIn && window.isUserLoggedIn()) {
        console.log("User is already logged in");
        console.log("User email:", window.getCurrentUserEmail());
        
        // ถ้าล็อกอินอยู่แล้วและอยู่หน้า login.html ให้เปลี่ยนหน้า
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname === '/' ||
            window.location.pathname.includes('index.html')) {
            
            console.log("Redirecting to dashboard...");
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        }
    } else {
        console.log("User is not logged in");
    }
}

// ============================================
// ฟังก์ชันรีเซ็ตรหัสผ่าน
// ============================================
async function resetPassword(email) {
    if (!email) {
        showError("กรุณากรอกอีเมลสำหรับรีเซ็ตรหัสผ่าน");
        return false;
    }
    
    if (!isFirebaseReady()) {
        return false;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        showSuccess("✅ ส่งอีเมลรีเซ็ตรหัสผ่านเรียบร้อยแล้ว กรุณาตรวจสอบอีเมลของคุณ");
        return true;
    } catch (error) {
        console.error("Password reset error:", error);
        showError("❌ ส่งอีเมลรีเซ็ตไม่สำเร็จ: " + error.message);
        return false;
    }
}

// ============================================
// เมื่อหน้าเว็บโหลดเสร็จ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("Login page loaded");
    console.log("Firebase available:", typeof firebase !== 'undefined');
    console.log("Auth available:", !!window.auth);
    
    // ตรวจสอบสถานะล็อกอินปัจจุบัน
    setTimeout(checkCurrentLoginStatus, 500);
    
    // หาอิลิเมนต์ต่างๆ ในหน้า
    const loginBtn = document.getElementById('loginBtn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    
    // ถ้ามีปุ่มล็อกอิน
    if (loginBtn) {
        loginBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';
            
            console.log("Login button clicked");
            console.log("Email:", email);
            console.log("Password length:", password.length);
            
            // เปลี่ยนสถานะปุ่ม
            const originalText = loginBtn.textContent;
            loginBtn.textContent = "กำลังเข้าสู่ระบบ...";
            loginBtn.disabled = true;
            
            // ล็อกอิน
            const success = await loginUser(email, password);
            
            // คืนสถานะปุ่ม
            if (!success) {
                loginBtn.textContent = originalText;
                loginBtn.disabled = false;
            }
        });
    }
    
    // ถ้ามีปุ่มรีเซ็ตรหัสผ่าน
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', async function() {
            const email = emailInput ? emailInput.value.trim() : '';
            if (!email) {
                showError("กรุณากรอกอีเมลของคุณก่อนกดรีเซ็ตรหัสผ่าน");
                return;
            }
            
            await resetPassword(email);
        });
    }
    
    // กด Enter ในช่องรหัสผ่านเพื่อล็อกอิน
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && loginBtn) {
                loginBtn.click();
            }
        });
    }
    
    // กด Enter ในช่องอีเมลเพื่อล็อกอิน
    if (emailInput) {
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && passwordInput) {
                passwordInput.focus();
            }
        });
    }
    
    // แสดงสถานะ Firebase ใน Console
    setTimeout(() => {
        console.group("📊 Firebase Debug Info");
        console.log("Firebase SDK loaded:", typeof firebase !== 'undefined');
        console.log("Firebase Auth:", window.auth ? "✅ Ready" : "❌ Not ready");
        console.log("Current User:", window.getCurrentUser ? window.getCurrentUser() : "No user");
        console.groupEnd();
    }, 1000);
});

// ============================================
// ฟังก์ชันสำหรับเรียกใช้จากหน้าอื่น (optional)
// ============================================
window.performLogin = loginUser;
window.checkLoginStatus = checkCurrentLoginStatus;
window.requestPasswordReset = resetPassword;
