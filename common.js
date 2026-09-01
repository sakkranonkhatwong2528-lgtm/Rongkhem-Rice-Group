```javascript
/* =========================================================
   COMMON.JS
   ศูนย์กลางระบบ กลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6
   Firebase / Auth / Firestore / UI
   ========================================================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyCme8E32QPySbSetpZP9_yAyiHpSGmlxlc",

  authDomain:
    "rongkhem-rice-group.firebaseapp.com",

  projectId:
    "rongkhem-rice-group",

  storageBucket:
    "rongkhem-rice-group.firebasestorage.app",

  messagingSenderId:
    "114954787725",

  appId:
    "1:114954787725:web:d18bb54ac53bc00db17bc4",

  measurementId:
    "G-70Z00XXB8Y"

};


/* =========================================================
   INITIALIZE
   ========================================================= */

const app =
  initializeApp(
    firebaseConfig
  );


const auth =
  getAuth(app);


const db =
  getFirestore(app);


const storage =
  getStorage(app);


/* =========================================================
   GLOBAL STATE
   ========================================================= */

const state = {

  user:
    null,

  profile:
    null,

  isAdmin:
    false,

  ready:
    false,

  loading:
    true

};


/* =========================================================
   AUTH READY
   ========================================================= */

let resolveAuthReady;

const authReady =
  new Promise(
    resolve => {

      resolveAuthReady =
        resolve;

    }
  );


/* =========================================================
   AUTH LISTENER
   ========================================================= */

onAuthStateChanged(
  auth,
  async user => {

    state.user =
      user || null;


    state.profile =
      null;


    state.isAdmin =
      false;


    if (!user) {

      state.ready =
        true;

      state.loading =
        false;

      resolveAuthReady(
        null
      );

      return;

    }


    /*
      โหลดข้อมูลผู้ใช้จาก Firestore
    */

    try {

      const userRef =
        doc(
          db,
          "users",
          user.uid
        );


      const snap =
        await getDoc(
          userRef
        );


      if (
        snap.exists()
      ) {

        state.profile =
          {
            id:
              snap.id,

            ...snap.data()
          };


        state.isAdmin =
          state.profile.role ===
            "admin" &&

          state.profile.active !==
            false;

      }

    } catch (error) {

      console.error(
        "โหลดข้อมูลผู้ใช้ไม่สำเร็จ:",
        error
      );

    }


    state.ready =
      true;

    state.loading =
      false;


    resolveAuthReady(
      user
    );


    /*
      แจ้งหน้าเว็บว่าระบบ Auth พร้อม
    */

    window.dispatchEvent(
      new CustomEvent(
        "rk-auth-ready",
        {
          detail:
            state
        }
      )
    );

  }
);


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function $(id) {

  return document.getElementById(
    id
  );

}


function esc(value) {

  return String(
    value ?? ""
  )
    .replace(
      /[&<>"']/g,
      char => ({

        "&":
          "&amp;",

        "<":
          "&lt;",

        ">":
          "&gt;",

        '"':
          "&quot;",

        "'":
          "&#039;"

      }[char])
    );

}


/* =========================================================
   TOAST
   ========================================================= */

function toast(
  message,
  type = "info"
) {

  let element =
    document.getElementById(
      "toast"
    );


  if (!element) {

    element =
      document.createElement(
        "div"
      );

    element.id =
      "toast";

    element.className =
      "toast";

    document.body.appendChild(
      element
    );

  }


  element.textContent =
    message;


  element.classList.remove(
    "show",
    "success",
    "error",
    "warning",
    "info",
    "ok",
    "err"
  );


  if (
    type === "ok" ||
    type === "success"
  ) {

    element.classList.add(
      "success"
    );

  } else if (
    type === "err" ||
    type === "error"
  ) {

    element.classList.add(
      "error"
    );

  } else if (
    type === "warning"
  ) {

    element.classList.add(
      "warning"
    );

  } else {

    element.classList.add(
      "info"
    );

  }


  requestAnimationFrame(
    () => {

      element.classList.add(
        "show"
      );

    }
  );


  clearTimeout(
    element._toastTimer
  );


  element._toastTimer =
    setTimeout(
      () => {

        element.classList.remove(
          "show"
        );

      },
      3500
    );

}


/* =========================================================
   AUTH GUARD
   ========================================================= */

async function guard(
  callback
) {

  await authReady;


  if (
    !state.user
  ) {

    const current =
      location.pathname
        .split("/")
        .pop();


    /*
      login.html ไม่ต้อง redirect ซ้ำ
    */

    if (
      current !==
      "login.html"
    ) {

      location.href =
        "login.html";

    }


    return;

  }


  try {

    await callback(
      state
    );

  } catch (error) {

    console.error(
      "Page error:",
      error
    );


    toast(
      error?.message ||
      "เกิดข้อผิดพลาด",
      "err"
    );

  }

}


/* =========================================================
   ADMIN GUARD
   ========================================================= */

function needAdmin() {

  if (
    !state.user
  ) {

    toast(
      "กรุณาเข้าสู่ระบบก่อน",
      "warning"
    );


    setTimeout(
      () => {

        location.href =
          "login.html";

      },
      700
    );


    return false;

  }


  if (
    !state.isAdmin
  ) {

    toast(
      "คุณไม่มีสิทธิ์ผู้ดูแลระบบ",
      "err"
    );


    return false;

  }


  return true;

}


/* =========================================================
   LOG ACTIVITY
   ========================================================= */

async function logAct(
  action,
  detail = ""
) {

  if (
    !state.user
  ) {

    return;

  }


  try {

    await addDoc(

      collection(
        db,
        "activityLog"
      ),

      {

        action:
          action,

        detail:
          detail,

        uid:
          state.user.uid,

        email:
          state.user.email ||
          "",

        userName:
          state.profile?.name ||
          state.user.displayName ||
          state.user.email ||
          "",

        createdAt:
          serverTimestamp()

      }

    );

  } catch (error) {

    /*
      Log ห้ามทำให้คำสั่งหลักล้ม
    */

    console.warn(
      "บันทึก Activity Log ไม่สำเร็จ:",
      error
    );

  }

}


/* =========================================================
   CLOCK
   ========================================================= */

function startClock() {

  const update =
    () => {

      const now =
        new Date();


      const time =
        now.toLocaleTimeString(
          "th-TH",
          {
            hour:
              "2-digit",

            minute:
              "2-digit",

            second:
              "2-digit"
          }
        );


      const date =
        now.toLocaleDateString(
          "th-TH",
          {
            weekday:
              "long",

            day:
              "numeric",

            month:
              "long",

            year:
              "numeric"
          }
        );


      document
        .querySelectorAll(
          "[data-clock]"
        )
        .forEach(
          element => {

            element.textContent =
              time;

          }
        );


      document
        .querySelectorAll(
          "[data-date]"
        )
        .forEach(
          element => {

            element.textContent =
              date;

          }
        );


      const clock =
        document.getElementById(
          "clock"
        );


      if (clock) {

        clock.textContent =
          time;

      }


      const dateElement =
        document.getElementById(
          "currentDate"
        );


      if (dateElement) {

        dateElement.textContent =
          date;

      }

    };


  update();


  return setInterval(
    update,
    1000
  );

}


/* =========================================================
   THAI DATE
   ========================================================= */

function thDate(
  value
) {

  if (!value) {

    return "-";

  }


  let date;


  if (
    typeof value ===
      "object" &&

    typeof value.toDate ===
      "function"
  ) {

    date =
      value.toDate();

  } else {

    date =
      new Date(
        value
      );

  }


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "-";

  }


  return date.toLocaleDateString(
    "th-TH",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric"
    }
  );

}


/* =========================================================
   THAI DATE TIME
   ========================================================= */

function thDateTime(
  value
) {

  if (!value) {

    return "-";

  }


  let date;


  if (
    typeof value ===
      "object" &&

    typeof value.toDate ===
      "function"
  ) {

    date =
      value.toDate();

  } else {

    date =
      new Date(
        value
      );

  }


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "-";

  }


  return date.toLocaleString(
    "th-TH",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short"
    }
  );

}


/* =========================================================
   FIREBASE IMAGE UPLOAD
   ========================================================= */

async function uploadPhoto(
  file,
  folder = "uploads"
) {

  if (!file) {

    return null;

  }


  if (
    !file.type.startsWith(
      "image/"
    )
  ) {

    throw new Error(
      "ไฟล์ที่เลือกต้องเป็นรูปภาพ"
    );

  }


  /*
    จำกัดขนาด 8 MB
  */

  if (
    file.size >
    8 * 1024 * 1024
  ) {

    throw new Error(
      "รูปภาพต้องมีขนาดไม่เกิน 8 MB"
    );

  }


  const safeName =
    file.name
      .replace(
        /[^a-zA-Z0-9ก-๙._-]/g,
        "_"
      );


  const fileName =
    `${Date.now()}_${safeName}`;


  const storageRef =
    ref(
      storage,
      `${folder}/${fileName}`
    );


  await uploadBytes(
    storageRef,
    file
  );


  const url =
    await getDownloadURL(
      storageRef
    );


  return {

    url,

    path:
      `${folder}/${fileName}`

  };

}


/* =========================================================
   COLLECTION HELPERS
   ========================================================= */

async function loadCollection(
  collectionName
) {

  await authReady;


  const snapshot =
    await getDocs(
      collection(
        db,
        collectionName
      )
    );


  return snapshot.docs.map(
    item => ({

      id:
        item.id,

      firestoreId:
        item.id,

      ...item.data()

    })
  );

}


/* =========================================================
   SAVE
   ========================================================= */

async function saveCollection(
  collectionName,
  data
) {

  await authReady;


  const cleaned =
    cleanData(
      data
    );


  const reference =
    await addDoc(

      collection(
        db,
        collectionName
      ),

      {

        ...cleaned,

        createdAt:
          cleaned.createdAt ||
          serverTimestamp()

      }

    );


  return reference.id;

}


/* =========================================================
   UPDATE
   ========================================================= */

async function updateCollection(
  collectionName,
  id,
  data
) {

  await authReady;


  if (!id) {

    throw new Error(
      "ไม่พบ Document ID"
    );

  }


  const cleaned =
    cleanData(
      data
    );


  delete cleaned.id;
  delete cleaned.firestoreId;


  await updateDoc(

    doc(
      db,
      collectionName,
      id
    ),

    {

      ...cleaned,

      updatedAt:
        serverTimestamp()

    }

  );


  return true;

}


/* =========================================================
   DELETE
   ========================================================= */

async function deleteCollection(
  collectionName,
  id
) {

  await authReady;


  if (!id) {

    throw new Error(
      "ไม่พบ Document ID"
    );

  }


  await deleteDoc(

    doc(
      db,
      collectionName,
      id
    )

  );


  return true;

}


/* =========================================================
   CLEAN DATA
   ========================================================= */

function cleanData(
  data
) {

  return Object.fromEntries(

    Object.entries(
      data || {}
    ).filter(
      ([, value]) =>
        value !==
        undefined
    )

  );

}


/* =========================================================
   REALTIME
   ========================================================= */

function subscribeData(
  collectionName,
  callback
) {

  let unsubscribe =
    () => {};


  authReady
    .then(
      () => {

        unsubscribe =
          onSnapshot(

            collection(
              db,
              collectionName
            ),

            snapshot => {

              const list =
                snapshot.docs.map(
                  item => ({

                    id:
                      item.id,

                    firestoreId:
                      item.id,

                    ...item.data()

                  })
                );


              callback(
                list
              );

            },

            error => {

              console.error(
                `Realtime ${collectionName}:`,
                error
              );

            }

          );

      }
    )
    .catch(
      console.error
    );


  return () => {

    unsubscribe();

  };

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

  try {

    await signOut(
      auth
    );


    location.href =
      "login.html";

  } catch (error) {

    console.error(
      error
    );


    toast(
      "ออกจากระบบไม่สำเร็จ",
      "err"
    );

  }

}


/* =========================================================
   GLOBAL LOGOUT BUTTONS
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        "[data-logout]"
      );


    if (button) {

      logout();

    }

  }
);


/* =========================================================
   EXPORT
   ========================================================= */

export {

  app,

  auth,

  db,

  storage,

  state,

  authReady,

  $,

  esc,

  toast,

  guard,

  needAdmin,

  logAct,

  startClock,

  thDate,

  thDateTime,

  uploadPhoto,

  loadCollection,

  saveCollection,

  updateCollection,

  deleteCollection,

  subscribeData,

  logout,

  collection,

  doc,

  addDoc,

  updateDoc,

  deleteDoc,

  getDoc,

  getDocs,

  onSnapshot,

  query,

  orderBy,

  where,

  serverTimestamp,

  ref,

  uploadBytes,

  getDownloadURL

};


/* =========================================================
   READY
   ========================================================= */

console.log(
  "🌾 Rongkhem Rice Group Common Ready"
);
```
