import { auth, db, doc, getDoc, toast, $ } from './common.js';
import { signInWithEmailAndPassword, sendPasswordResetEmail,
  setPersistence, browserLocalPersistence, browserSessionPersistence,
  onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

onAuthStateChanged(auth, u => { if (u) location.replace('index.html'); });

$('#togglePw').onclick = () => {
  const p = $('#password');
  p.type = p.type === 'password' ? 'text' : 'password';
};

const ERR = {
  'auth/invalid-email'       : 'รูปแบบอีเมลไม่ถูกต้อง',
  'auth/user-not-found'      : 'ไม่พบบัญชีผู้ใช้นี้',
  'auth/wrong-password'      : 'รหัสผ่านไม่ถูกต้อง',
  'auth/invalid-credential'  : 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'auth/too-many-requests'   : 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณารอสักครู่',
  'auth/network-request-failed':'เชื่อมต่ออินเทอร์เน็ตไม่ได้',
  'auth/unauthorized-domain' : 'โดเมนนี้ยังไม่ได้รับอนุญาตใน Firebase'
};

$('#loginForm').onsubmit = async e => {
  e.preventDefault();
  const btn = $('#btnLogin'), err = $('#loginError');
  err.textContent = ''; btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังเข้าสู่ระบบ...';
  try {
    await setPersistence(auth, $('#remember').checked
      ? browserLocalPersistence : browserSessionPersistence);
    const cred = await signInWithEmailAndPassword(auth,
      $('#email').value.trim(), $('#password').value);
    const snap = await getDoc(doc(db,'users',cred.user.uid));
    if (snap.exists() && snap.data().active === false)
      throw { code:'disabled' };
    location.replace('index.html');
  } catch (ex) {
    err.textContent = ex.code === 'disabled'
      ? 'บัญชีนี้ถูกระงับการใช้งาน'
      : (ERR[ex.code] || 'เข้าสู่ระบบไม่สำเร็จ');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบ';
  }
};

$('#btnForgot').onclick = async () => {
  const em = $('#email').value.trim();
  if (!em) return toast('กรุณากรอกอีเมลก่อน', 'err');
  try {
    await sendPasswordResetEmail(auth, em);
    toast('ส่งลิงก์รีเซ็ตรหัสผ่านไปที่อีเมลแล้ว');
  } catch { toast('ส่งอีเมลไม่สำเร็จ', 'err'); }
};
