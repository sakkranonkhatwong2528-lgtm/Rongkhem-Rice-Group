```javascript
/* =========================================================
   COMMON.JS
   ระบบกลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6
   Firebase + Auth + Firestore + Storage
   ========================================================= */

import { db, storage, auth } from './firebase-config.js';

import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";


/* =========================================================
   EXPORT FIREBASE
   ========================================================= */

export {
  db,
  storage,
  auth,

  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  writeBatch,
  serverTimestamp,

  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,

  signOut
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

/* เลือก element ตัวแรก */
export const $ = (selector, parent = document) => {
  return parent.querySelector(selector);
};


/* เลือกหลาย element */
export const $$ = (selector, parent = document) => {
  return [...parent.querySelectorAll(selector)];
};


/* =========================================================
   SECURITY / HTML ESCAPE
   ========================================================= */

export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };

    return map[char];
  });
}


/* =========================================================
   NUMBER
   ========================================================= */

export function num(value) {
  const n = Number(value);

  return Number.isFinite(n) ? n : 0;
}


export function formatNumber(value) {
  return num(value).toLocaleString('th-TH');
}


/* =========================================================
   THAI DATE
   ========================================================= */

export function thDate(value) {

  if (!value) return '-';

  try {

    let date;

    if (
      typeof value === 'object' &&
      value !== null &&
      typeof value.toDate === 'function'
    ) {
      date = value.toDate();
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

  } catch {
    return '-';
  }
}


/* =========================================================
   THAI DATE TIME
   ========================================================= */

export function thDateTime(value) {

  if (!value) return '-';

  try {

    let date;

    if (
      typeof value === 'object' &&
      value !== null &&
      typeof value.toDate === 'function'
    ) {
      date = value.toDate();
    } else {
      date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

  } catch {
    return '-';
  }
}


/* =========================================================
   TOAST
   ========================================================= */

export function toast(message, type = 'ok') {

  let container = $('#toastContainer');

  if (!container) {

    container = document.createElement('div');

    container.id = 'toastContainer';

    container.className = 'toast-container';

    document.body.appendChild(container);
  }

  const item = document.createElement('div');

  item.className = `toast ${type}`;

  item.textContent = message;

  container.appendChild(item);

  setTimeout(() => {

    item.style.opacity = '0';
    item.style.transform = 'translateY(10px)';

    setTimeout(() => item.remove(), 250);

  }, 3000);
}


/* =========================================================
   ERROR MESSAGE
   ========================================================= */

export function firebaseErrorMessage(error) {

  const code = error?.code || '';

  const messages = {

    'permission-denied':
      'ไม่มีสิทธิ์ดำเนินการ กรุณาตรวจสอบสิทธิ์ผู้ดูแลระบบ',

    'unauthenticated':
      'กรุณาเข้าสู่ระบบก่อนดำเนินการ',

    'not-found':
      'ไม่พบข้อมูลที่ต้องการ',

    'already-exists':
      'มีข้อมูลนี้อยู่แล้ว',

    'failed-precondition':
      'ไม่สามารถดำเนินการได้ เนื่องจากข้อมูลยังไม่พร้อม',

    'network-request-failed':
      'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้',

    'storage/unauthorized':
      'ไม่มีสิทธิ์อัปโหลดไฟล์',

    'storage/canceled':
      'ยกเลิกการอัปโหลด',

    'storage/quota-exceeded':
      'พื้นที่จัดเก็บไฟล์เต็ม',

    'storage/unknown':
      'เกิดข้อผิดพลาดในการจัดเก็บไฟล์',

    'auth/network-request-failed':
      'ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้'

  };

  return messages[code] ||
    error?.message ||
    'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
}


/* =========================================================
   MODAL
   ========================================================= */

let saveHandler = null;


export function ensureModal() {

  if ($('#modalBackdrop')) return;


  document.body.insertAdjacentHTML('beforeend', `

    <div class="modal-backdrop" id="modalBackdrop">

      <div class="modal-box">

        <div class="modal-head">

          <h3 id="modalTitle"></h3>

          <button
            type="button"
            class="modal-close"
            id="modalClose"
            aria-label="ปิด">
            &times;
          </button>

        </div>

        <div
          class="modal-body"
          id="modalBody">
        </div>

        <div class="modal-foot">

          <button
            type="button"
            class="btn-cancel"
            id="modalCancel">
            ยกเลิก
          </button>

          <button
            type="button"
            class="btn-save"
            id="modalSave">
            บันทึก
          </button>

        </div>

      </div>

    </div>

  `);


  $('#modalClose').addEventListener(
    'click',
    closeModal
  );


  $('#modalCancel').addEventListener(
    'click',
    closeModal
  );


  $('#modalBackdrop').addEventListener(
    'click',
    event => {

      if (event.target.id === 'modalBackdrop') {
        closeModal();
      }

    }
  );


  $('#modalSave').addEventListener(
    'click',
    async () => {

      if (!saveHandler) return;

      const button = $('#modalSave');

      const oldText = button.textContent;

      button.disabled = true;

      button.textContent = 'กำลังบันทึก...';


      try {

        await saveHandler();

        closeModal();

      } catch (error) {

        console.error(error);

        toast(
          firebaseErrorMessage(error),
          'err'
        );

      } finally {

        button.disabled = false;

        button.textContent = oldText;

      }

    }
  );

}


export function openModal(
  title,
  html,
  onSave = null,
  saveText = 'บันทึก'
) {

  ensureModal();

  $('#modalTitle').textContent = title;

  $('#modalBody').innerHTML = html;

  $('#modalSave').textContent = saveText;

  $('#modalSave').style.display =
    typeof onSave === 'function'
      ? ''
      : 'none';

  saveHandler = onSave;

  $('#modalBackdrop').classList.add('show');

}


export function closeModal() {

  const modal = $('#modalBackdrop');

  if (modal) {
    modal.classList.remove('show');
  }

  saveHandler = null;

}


/* =========================================================
   CONFIRM DELETE
   ========================================================= */

export function confirmDel(
  text,
  callback
) {

  openModal(

    'ยืนยันการลบ',

    `
      <div class="confirm-delete">

        <p>
          ${esc(text)}
        </p>

        <p style="
          margin-top:10px;
          color:#b42318;
          font-weight:600;
        ">
          ⚠️ การลบข้อมูลไม่สามารถย้อนกลับได้
        </p>

      </div>
    `,

    async () => {

      await callback();

      toast(
        'ลบข้อมูลเรียบร้อยแล้ว',
        'ok'
      );

    },

    'ยืนยันการลบ'

  );

}


/* =========================================================
   IMAGE COMPRESS
   ========================================================= */

export function compress(
  file,
  max = 1000,
  quality = 0.78
) {

  return new Promise(
    (resolve, reject) => {

      if (!file) {
        reject(new Error('ไม่พบไฟล์'));
        return;
      }


      const image = new Image();

      image.onload = () => {

        try {

          const scale = Math.min(
            1,
            max /
              Math.max(
                image.width,
                image.height
              )
          );


          const canvas =
            document.createElement('canvas');


          canvas.width =
            Math.round(image.width * scale);

          canvas.height =
            Math.round(image.height * scale);


          const context =
            canvas.getContext('2d');


          context.drawImage(
            image,
            0,
            0,
            canvas.width,
            canvas.height
          );


          canvas.toBlob(
            blob => {

              URL.revokeObjectURL(
                image.src
              );

              if (!blob) {
                reject(
                  new Error(
                    'ไม่สามารถบีบอัดรูปภาพได้'
                  )
                );

                return;
              }

              resolve(blob);

            },
            'image/jpeg',
            quality
          );

        } catch (error) {

          URL.revokeObjectURL(
            image.src
          );

          reject(error);

        }

      };


      image.onerror = () => {

        URL.revokeObjectURL(
          image.src
        );

        reject(
          new Error(
            'ไม่สามารถอ่านรูปภาพได้'
          )
        );

      };


      image.src =
        URL.createObjectURL(file);

    }
  );

}


/* =========================================================
   UPLOAD PHOTO
   ========================================================= */

export async function uploadPhoto(
  file,
  folder = 'uploads'
) {

  if (!file) {
    throw new Error(
      'กรุณาเลือกรูปภาพ'
    );
  }


  const blob =
    await compress(file);


  const filename =
    `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}.jpg`;


  const path =
    `${folder}/${filename}`;


  const storageRef =
    ref(storage, path);


  await uploadBytes(
    storageRef,
    blob,
    {
      contentType: 'image/jpeg'
    }
  );


  const url =
    await getDownloadURL(
      storageRef
    );


  return {
    url,
    path
  };

}


/* =========================================================
   DELETE PHOTO
   ========================================================= */

export async function removePhoto(path) {

  if (!path) return;

  try {

    await deleteObject(
      ref(storage, path)
    );

  } catch (error) {

    /*
      ถ้ารูปถูกลบไปแล้ว
      ไม่ให้ระบบหลักพัง
    */

    console.warn(
      'ลบรูปไม่สำเร็จ:',
      error
    );

  }

}


/* =========================================================
   ACTIVITY LOG
   ========================================================= */

export async function logAct(
  action,
  detail
) {

  try {

    await addDoc(
      collection(
        db,
        'activityLog'
      ),
      {

        action:
          String(action || ''),

        detail:
          String(detail || ''),

        by:
          auth.currentUser?.email || '-',

        uid:
          auth.currentUser?.uid || null,

        at:
          serverTimestamp()

      }
    );

  } catch (error) {

    /*
      Log ล้มเหลวไม่ควรทำให้
      การบันทึกข้อมูลหลักล้มเหลว
    */

    console.warn(
      'Activity log error:',
      error
    );

  }

}


/* =========================================================
   AUTH STATE
   ========================================================= */

export const state = {

  user: null,

  profile: null,

  isAdmin: false,

  ready: false

};


/* =========================================================
   AUTH GUARD
   ========================================================= */

export function guard(
  onReady
) {

  let handled = false;


  return onAuthStateChanged(
    auth,
    async user => {

      if (!user) {

        if (!handled) {

          handled = true;

          location.replace(
            'login.html'
          );

        }

        return;

      }


      try {

        state.user = user;


        const userRef =
          doc(
            db,
            'users',
            user.uid
          );


        const snapshot =
          await getDoc(userRef);


        if (snapshot.exists()) {

          state.profile =
            snapshot.data();

        } else {

          state.profile = {

            role: 'member',

            name:
              user.displayName ||
              user.email ||
              'สมาชิก',

            email:
              user.email || '',

            active: true

          };

        }


        /* บัญชีถูกปิด */
        if (
          state.profile.active === false
        ) {

          await signOut(auth);

          location.replace(
            'login.html'
          );

          return;

        }


        state.isAdmin =
          state.profile.role === 'admin';


        state.ready = true;


        paintUser();


        if (!state.isAdmin) {

          document.body.classList.add(
            'is-member'
          );

        }


        if (
          typeof onReady === 'function'
        ) {

          await onReady(state);

        }

      } catch (error) {

        console.error(
          'Auth guard error:',
          error
        );

        toast(
          'ไม่สามารถตรวจสอบสิทธิ์ได้',
          'err'
        );

      }

    }
  );

}


/* =========================================================
   PAINT USER
   ========================================================= */

export function paintUser() {

  const userInfo =
    $('.user-info');


  if (userInfo) {

    const position =
      state.profile?.position ||
      (
        state.isAdmin
          ? 'ผู้ดูแลระบบ'
          : 'สมาชิกกลุ่มข้าวสาร'
      );


    const name =
      state.profile?.name ||
      state.user?.displayName ||
      state.user?.email ||
      'ผู้ใช้งาน';


    userInfo.innerHTML = `

      <strong>
        ${esc(position)}
      </strong>

      <span>
        ${esc(name)}
      </span>

      <span class="badge-role">
        ${
          state.isAdmin
            ? 'ผู้ดูแลระบบ'
            : 'สมาชิก'
        }
      </span>

    `;

  }


  const logoutButton =
    $('.btn-logout');


  if (
    logoutButton &&
    !logoutButton.dataset.bound
  ) {

    logoutButton.dataset.bound = '1';


    logoutButton.addEventListener(
      'click',
      async () => {

        try {

          logoutButton.disabled = true;

          await signOut(auth);

          location.replace(
            'login.html'
          );

        } catch (error) {

          logoutButton.disabled = false;

          toast(
            'ออกจากระบบไม่สำเร็จ',
            'err'
          );

        }

      }
    );

  }

}


/* =========================================================
   ADMIN CHECK
   ========================================================= */

export function needAdmin() {

  if (!state.isAdmin) {

    toast(
      'เฉพาะผู้ดูแลระบบเท่านั้น',
      'err'
    );

    return false;

  }

  return true;

}


/* =========================================================
   CLOCK
   ========================================================= */

export function startClock() {

  const tick = () => {

    const now =
      new Date();


    const clock =
      $('#liveClock');


    if (clock) {

      clock.textContent =
        now.toLocaleTimeString(
          'th-TH',
          {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }
        );

    }


    const date =
      $('#liveDate');


    if (date) {

      date.textContent =
        now.toLocaleDateString(
          'th-TH',
          {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }
        );

    }

  };


  tick();


  if (!window.__rongkhemClockStarted) {

    window.__rongkhemClockStarted = true;

    setInterval(
      tick,
      1000
    );

  }


  const bell =
    $('#bellIcon');


  if (
    bell &&
    !bell.dataset.bound
  ) {

    bell.dataset.bound = '1';


    bell.addEventListener(
      'click',
      event => {

        event.stopPropagation();

        $('#notifDropdown')
          ?.classList
          .toggle('show');

      }
    );


    document.addEventListener(
      'click',
      () => {

        $('#notifDropdown')
          ?.classList
          .remove('show');

      }
    );

  }

}


/* =========================================================
   CSV EXPORT
   ========================================================= */

function csvCell(value) {

  return `"${String(
    value ?? ''
  )
    .replace(/"/g, '""')}"`;

}


export function downloadCSV(
  filename,
  rows
) {

  const csv =
    '\uFEFF' +
    rows
      .map(row =>
        row
          .map(csvCell)
          .join(',')
      )
      .join('\r\n');


  const blob =
    new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8'
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement('a');


  link.href = url;

  link.download =
    filename;


  document.body.appendChild(link);

  link.click();

  link.remove();


  setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );

}


/* =========================================================
   CSV PARSER
   ========================================================= */

export function parseCSV(text) {

  const rows = [];

  let row = [];

  let cell = '';

  let insideQuotes = false;


  for (
    let i = 0;
    i < text.length;
    i++
  ) {

    const char =
      text[i];

    const next =
      text[i + 1];


    if (char === '"') {

      if (
        insideQuotes &&
        next === '"'
      ) {

        cell += '"';

        i++;

      } else {

        insideQuotes =
          !insideQuotes;

      }

    } else if (
      char === ',' &&
      !insideQuotes
    ) {

      row.push(cell);

      cell = '';

    } else if (
      (
        char === '\n' ||
        char === '\r'
      ) &&
      !insideQuotes
    ) {

      if (
        char === '\r' &&
        next === '\n'
      ) {
        i++;
      }

      row.push(cell);

      rows.push(row);

      row = [];

      cell = '';

    } else {

      cell += char;

    }

  }


  if (
    cell !== '' ||
    row.length
  ) {

    row.push(cell);

    rows.push(row);

  }


  return rows;

}


/* =========================================================
   FIREBASE TIMESTAMP → DATE
   ========================================================= */

export function toDate(value) {

  if (!value) return null;


  if (
    typeof value === 'object' &&
    typeof value.toDate === 'function'
  ) {

    return value.toDate();

  }


  const date =
    new Date(value);


  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;

}


/* =========================================================
   INITIALIZE COMMON FEATURES
   ========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  () => {

    startClock();

  }
);
```
