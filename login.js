```javascript
/* =========================================================
   LOGIN.JS
   ระบบกลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6
   Firebase Authentication
   ========================================================= */

import {
  auth,
  db,
  state,
  authReady,
  toast,
  doc,
  getDoc
} from "./common.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";


/* =========================================================
   DOM
   ========================================================= */

const form =
  document.getElementById(
    "loginForm"
  );

const emailInput =
  document.getElementById(
    "email"
  );

const passwordInput =
  document.getElementById(
    "password"
  );

const loginButton =
  document.getElementById(
    "loginButton"
  );

const loginMessage =
  document.getElementById(
    "loginMessage"
  );

const togglePassword =
  document.getElementById(
    "togglePassword"
  );


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    /*
      ถ้าเข้าสู่ระบบอยู่แล้ว
      ตรวจสอบสิทธิ์ก่อนส่งไป Dashboard
    */

    await authReady;

    if (
      state.user
    ) {

      await checkExistingUser();

    }


    bindEvents();

  }
);


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {

  form?.addEventListener(
    "submit",
    handleLogin
  );


  togglePassword?.addEventListener(
    "click",
    () => {

      if (
        !passwordInput
      ) {

        return;

      }


      const isPassword =
        passwordInput.type ===
        "password";


      passwordInput.type =
        isPassword
          ? "text"
          : "password";


      togglePassword.textContent =
        isPassword
          ? "🙈"
          : "👁️";

    }
  );


  /*
    Enter ที่ช่องอีเมล
  */

  emailInput?.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Enter"
      ) {

        passwordInput?.focus();

      }

    }
  );

}


/* =========================================================
   LOGIN
   ========================================================= */

async function handleLogin(
  event
) {

  event.preventDefault();


  const email =
    emailInput?.value
      ?.trim()
      .toLowerCase();


  const password =
    passwordInput?.value ||
    "";


  if (!email) {

    showMessage(
      "กรุณากรอกอีเมล",
      "error"
    );


    emailInput?.focus();

    return;

  }


  if (!password) {

    showMessage(
      "กรุณากรอกรหัสผ่าน",
      "error"
    );


    passwordInput?.focus();

    return;

  }


  setLoading(
    true
  );


  try {

    /*
      Firebase Authentication
    */

    const credential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );


    const user =
      credential.user;


    /*
      ตรวจสอบข้อมูลผู้ใช้
      จาก users/{uid}
    */

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    const userSnapshot =
      await getDoc(
        userRef
      );


    if (
      !userSnapshot.exists()
    ) {

      /*
        ไม่มี profile ใน Firestore
        ไม่ให้เข้าหลังบ้าน
      */

      await signOut(
        auth
      );


      throw new Error(
        "บัญชีนี้ยังไม่ได้กำหนดสิทธิ์ผู้ดูแลระบบ"
      );

    }


    const profile =
      userSnapshot.data();


    /*
      ต้องเป็น admin
    */

    if (
      profile.role !==
      "admin"
    ) {

      await signOut(
        auth
      );


      throw new Error(
        "บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลระบบ"
      );

    }


    /*
      ตรวจสอบสถานะบัญชี
    */

    if (
      profile.active ===
      false
    ) {

      await signOut(
        auth
      );


      throw new Error(
        "บัญชีผู้ดูแลระบบถูกระงับการใช้งาน"
      );

    }


    /*
      ผ่านทั้งหมด
    */

    showMessage(
      "เข้าสู่ระบบสำเร็จ กำลังเข้าสู่หลังบ้าน...",
      "success"
    );


    /*
      ให้ Firebase/Auth listener
      อัปเดต state ก่อนเปลี่ยนหน้า
    */

    setTimeout(
      () => {

        location.href =
          "index.html";

      },
      600
    );

  } catch (error) {

    console.error(
      "LOGIN ERROR:",
      error
    );


    showMessage(
      translateFirebaseError(
        error
      ),
      "error"
    );


    setLoading(
      false
    );

  }

}


/* =========================================================
   CHECK EXISTING USER
   ========================================================= */

async function checkExistingUser() {

  try {

    if (
      !state.user
    ) {

      return;

    }


    const userRef =
      doc(
        db,
        "users",
        state.user.uid
      );


    const snapshot =
      await getDoc(
        userRef
      );


    if (
      !snapshot.exists()
    ) {

      await signOut(
        auth
      );

      return;

    }


    const profile =
      snapshot.data();


    if (
      profile.role !==
      "admin" ||
      profile.active ===
      false
    ) {

      await signOut(
        auth
      );

      return;

    }


    /*
      ถ้าเป็นแอดมินอยู่แล้ว
      ไม่ต้องกรอก Login ซ้ำ
    */

    showMessage(
      "คุณเข้าสู่ระบบอยู่แล้ว กำลังเข้าสู่ระบบ...",
      "success"
    );


    setTimeout(
      () => {

        location.href =
          "index.html";

      },
      400
    );

  } catch (error) {

    console.error(
      "CHECK USER ERROR:",
      error
    );

  }

}


/* =========================================================
   UI
   ========================================================= */

function setLoading(
  loading
) {

  if (
    loginButton
  ) {

    loginButton.disabled =
      loading;


    loginButton.innerHTML =
      loading

        ? `
          <span
            class="login-spinner"
          ></span>

          กำลังเข้าสู่ระบบ...
        `

        : `
          🔐 เข้าสู่ระบบ
        `;

  }


  if (
    emailInput
  ) {

    emailInput.disabled =
      loading;

  }


  if (
    passwordInput
  ) {

    passwordInput.disabled =
      loading;

  }

}


function showMessage(
  message,
  type = "error"
) {

  if (
    loginMessage
  ) {

    loginMessage.textContent =
      message;


    loginMessage.className =
      `login-message ${type}`;


    loginMessage.style.display =
      "block";


    return;

  }


  /*
    fallback
    ถ้า HTML ไม่มี loginMessage
  */

  toast(
    message,
    type === "success"
      ? "ok"
      : "err"
  );

}


/* =========================================================
   FIREBASE ERROR
   ========================================================= */

function translateFirebaseError(
  error
) {

  const code =
    error?.code ||
    "";


  switch (
    code
  ) {

    case
      "auth/invalid-email":

      return (
        "รูปแบบอีเมลไม่ถูกต้อง"
      );


    case
      "auth/user-not-found":

      return (
        "ไม่พบผู้ใช้งานนี้ในระบบ"
      );


    case
      "auth/wrong-password":

      return (
        "รหัสผ่านไม่ถูกต้อง"
      );


    case
      "auth/invalid-credential":

      return (
        "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
      );


    case
      "auth/user-disabled":

      return (
        "บัญชีนี้ถูกระงับการใช้งาน"
      );


    case
      "auth/too-many-requests":

      return (
        "มีการเข้าสู่ระบบผิดหลายครั้ง กรุณารอสักครู่แล้วลองใหม่"
      );


    case
      "auth/network-request-failed":

      return (
        "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้"
      );


    case
      "auth/operation-not-allowed":

      return (
        "ยังไม่ได้เปิดใช้งาน Email/Password ใน Firebase Authentication"
      );


    case
      "auth/internal-error":

      return (
        "Firebase เกิดข้อผิดพลาดภายใน"
      );


    default:

      return (
        error?.message ||
        "เข้าสู่ระบบไม่สำเร็จ"
      );

  }

}


/* =========================================================
   GLOBAL
   ========================================================= */

window.rongkhemLogin =
  handleLogin;
```
