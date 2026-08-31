import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const form = document.getElementById("loginForm");
const errorBox = document.getElementById("loginError");
const errorText = document.getElementById("loginErrorText");
const btnSubmit = document.getElementById("btnLoginSubmit");
const btnText = document.getElementById("loginBtnText");
const spinner = document.getElementById("loginSpinner");

/* แสดง/ซ่อนรหัสผ่าน */
document.getElementById("togglePass").addEventListener("click", () => {
  const pass = document.getElementById("loginPassword");
  const icon = document.querySelector("#togglePass i");
  const isHidden = pass.type === "password";
  pass.type = isHidden ? "text" : "password";
  icon.className = isHidden ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
});

/* แปลง error code เป็นภาษาไทย */
function translateError(code) {
  const map = {
    "auth/invalid-email": "รูปแบบอีเมลไม่ถูกต้อง",
    "auth/user-not-found": "ไม่พบบัญชีผู้ใช้งานนี้ในระบบ",
    "auth/wrong-password": "รหัสผ่านไม่ถูกต้อง",
    "auth/invalid-credential": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    "auth/too-many-requests": "พยายามเข้าสู่ระบบผิดหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง",
  };
  return map[code] || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.style.display = "none";

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  btnSubmit.disabled = true;
  btnText.textContent = "กำลังเข้าสู่ระบบ...";
  spinner.style.display = "inline-block";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // สำเร็จ -> ไปหน้าหลัก
    window.location.href = "index.html";
  } catch (err) {
    errorText.textContent = translateError(err.code);
    errorBox.style.display = "flex";
    btnSubmit.disabled = false;
    btnText.textContent = "เข้าสู่ระบบ";
    spinner.style.display = "none";
  }
});
