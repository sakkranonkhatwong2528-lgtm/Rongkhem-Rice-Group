```javascript
/* =========================================================
   ANNOUNCEMENTS.JS
   ระบบจัดการประกาศ
   กลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6
   ========================================================= */

import {
  db,
  state,
  guard,
  needAdmin,
  $,
  esc,
  toast,
  logAct,
  startClock,

  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from './common.js';


/* =========================================================
   DATA
   ========================================================= */

let announcements = [];

let unsubscribe = null;


/* =========================================================
   DOM
   ========================================================= */

const list =
  document.getElementById(
    'announcementList'
  );

const btnAdd =
  document.getElementById(
    'btnAddAnnouncement'
  );

const search =
  document.getElementById(
    'searchAnnouncement'
  );


/* =========================================================
   START
   ========================================================= */

guard(() => {

  startClock();

  listenAnnouncements();

  bindEvents();

});


/* =========================================================
   FIRESTORE
   ========================================================= */

function listenAnnouncements() {

  unsubscribe?.();


  unsubscribe =
    onSnapshot(

      collection(
        db,
        'announcements'
      ),

      snapshot => {

        announcements =
          snapshot.docs.map(
            item => ({
              id: item.id,
              ...item.data()
            })
          );


        announcements.sort(
          (a, b) =>
            dateValue(
              b.createdAt ||
              b.date
            ) -
            dateValue(
              a.createdAt ||
              a.date
            )
        );


        render();

      },

      error => {

        console.error(
          'Announcements error:',
          error
        );


        render();


        toast(
          'โหลดประกาศไม่สำเร็จ',
          'err'
        );

      }

    );

}


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {

  btnAdd?.addEventListener(
    'click',
    () => {

      if (!needAdmin()) {
        return;
      }


      openAnnouncementForm();

    }
  );


  search?.addEventListener(
    'input',
    render
  );

}


/* =========================================================
   RENDER
   ========================================================= */

function render() {

  if (!list) {
    return;
  }


  const keyword =
    String(
      search?.value || ''
    )
      .toLowerCase()
      .trim();


  const filtered =
    announcements.filter(
      announcement => {

        if (!keyword) {
          return true;
        }


        const text = [

          announcement.title,

          announcement.message,

          announcement.content,

          announcement.detail,

          announcement.type

        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();


        return text.includes(
          keyword
        );

      }
    );


  if (!filtered.length) {

    list.innerHTML = `

      <div
        class="empty-state"
        style="
          padding:45px 20px;
          text-align:center;
          color:#888;
        "
      >

        <i
          class="fa-solid fa-bullhorn"
          style="
            font-size:40px;
            margin-bottom:12px;
          "
        ></i>

        <h3>
          ยังไม่มีประกาศ
        </h3>

        ${
          state.isAdmin
            ? `
              <p>
                กด “เพิ่มประกาศ”
                เพื่อสร้างประกาศใหม่
              </p>
            `
            : ''
        }

      </div>

    `;


    return;

  }


  list.innerHTML =
    filtered
      .map(
        announcement =>
          announcementCard(
            announcement
          )
      )
      .join('');

}


/* =========================================================
   ANNOUNCEMENT CARD
   ========================================================= */

function announcementCard(
  announcement
) {

  const title =
    announcement.title ||
    announcement.name ||
    'ประกาศ';


  const message =
    announcement.message ||
    announcement.content ||
    announcement.detail ||
    '';


  const type =
    announcement.type ||
    'ทั่วไป';


  const date =
    formatDate(
      announcement.createdAt ||
      announcement.date
    );


  return `

    <article
      class="announcement-card"
      data-id="${esc(
        announcement.id
      )}"
    >

      <div
        class="announcement-icon"
      >

        <i
          class="fa-solid fa-bullhorn"
        ></i>

      </div>


      <div
        class="announcement-content"
      >

        <div
          style="
            display:flex;
            gap:8px;
            align-items:center;
            flex-wrap:wrap;
          "
        >

          <h3>
            ${esc(title)}
          </h3>


          <span
            class="announcement-type"
          >
            ${esc(type)}
          </span>

        </div>


        <p>
          ${esc(message)}
        </p>


        <div
          class="announcement-meta"
        >

          <span>

            <i
              class="fa-regular fa-calendar"
            ></i>

            ${esc(date)}

          </span>


          ${
            announcement.createdBy
              ? `
                <span>

                  <i
                    class="fa-solid fa-user"
                  ></i>

                  ${esc(
                    announcement.createdBy
                  )}

                </span>
              `
              : ''
          }

        </div>

      </div>


      ${
        state.isAdmin
          ? `

            <div
              class="announcement-actions"
            >

              <button
                type="button"
                class="btn-edit-announcement"
                data-id="${esc(
                  announcement.id
                )}"
                title="แก้ไข"
              >

                <i
                  class="fa-solid fa-pen"
                ></i>

              </button>


              <button
                type="button"
                class="btn-delete-announcement"
                data-id="${esc(
                  announcement.id
                )}"
                title="ลบ"
              >

                <i
                  class="fa-solid fa-trash"
                ></i>

              </button>

            </div>

          `
          : ''
      }

    </article>

  `;

}


/* =========================================================
   CARD EVENTS
   ========================================================= */

list?.addEventListener(
  'click',
  event => {

    const edit =
      event.target.closest(
        '.btn-edit-announcement'
      );


    if (edit) {

      if (!needAdmin()) {
        return;
      }


      const item =
        announcements.find(
          announcement =>
            announcement.id ===
            edit.dataset.id
        );


      if (item) {

        openAnnouncementForm(
          item
        );

      }


      return;

    }


    const remove =
      event.target.closest(
        '.btn-delete-announcement'
      );


    if (remove) {

      if (!needAdmin()) {
        return;
      }


      const item =
        announcements.find(
          announcement =>
            announcement.id ===
            remove.dataset.id
        );


      if (item) {

        deleteAnnouncement(
          item
        );

      }

    }

  }
);


/* =========================================================
   FORM
   ========================================================= */

function openAnnouncementForm(
  announcement = {}
) {

  const editing =
    Boolean(
      announcement.id
    );


  const html = `

    <div class="form-group">

      <label>
        หัวข้อประกาศ *
      </label>

      <input
        id="announcementTitle"
        type="text"
        maxlength="200"
        value="${esc(
          announcement.title ||
          ''
        )}"
        placeholder="เช่น ประชุมประจำเดือน"
      >

    </div>


    <div class="form-group">

      <label>
        ประเภทประกาศ
      </label>

      <select
        id="announcementType"
      >

        <option
          value="ทั่วไป"
          ${
            (
              announcement.type ||
              'ทั่วไป'
            ) === 'ทั่วไป'
              ? 'selected'
              : ''
          }
        >
          ทั่วไป
        </option>


        <option
          value="สำคัญ"
          ${
            announcement.type === 'สำคัญ'
              ? 'selected'
              : ''
          }
        >
          สำคัญ
        </option>


        <option
          value="ประชุม"
          ${
            announcement.type === 'ประชุม'
              ? 'selected'
              : ''
          }
        >
          ประชุม
        </option>


        <option
          value="กิจกรรม"
          ${
            announcement.type === 'กิจกรรม'
              ? 'selected'
              : ''
          }
        >
          กิจกรรม
        </option>


        <option
          value="แจ้งเตือน"
          ${
            announcement.type === 'แจ้งเตือน'
              ? 'selected'
              : ''
          }
        >
          แจ้งเตือน
        </option>

      </select>

    </div>


    <div class="form-group">

      <label>
        รายละเอียด *
      </label>

      <textarea
        id="announcementMessage"
        rows="6"
        maxlength="5000"
        placeholder="รายละเอียดประกาศ"
      >${esc(
        announcement.message ||
        announcement.content ||
        ''
      )}</textarea>

    </div>

  `;


  /*
    ใช้ openModal จาก common.js
    ถ้ามีใน common
  */

  if (
    typeof window.openModal ===
    'function'
  ) {

    window.openModal(

      editing
        ? 'แก้ไขประกาศ'
        : 'เพิ่มประกาศ',

      html,

      async () => {

        await saveAnnouncement(
          announcement.id ||
          null
        );

      },

      editing
        ? 'บันทึกการแก้ไข'
        : 'เพิ่มประกาศ'

    );


    return;

  }


  /*
    Fallback
    กรณี common.js ไม่ได้ผูก openModal
  */

  const title =
    editing
      ? 'แก้ไขประกาศ'
      : 'เพิ่มประกาศ';


  const modal =
    document.createElement(
      'div'
    );


  modal.className =
    'modal-overlay';


  modal.innerHTML = `

    <div class="modal-box">

      <div class="modal-header">

        <h3>
          ${title}
        </h3>

        <button
          type="button"
          class="modal-close"
        >
          ×
        </button>

      </div>


      <div class="modal-body">

        ${html}

      </div>


      <div class="modal-footer">

        <button
          type="button"
          class="btn-cancel"
        >
          ยกเลิก
        </button>


        <button
          type="button"
          class="btn-save"
        >
          ${
            editing
              ? 'บันทึกการแก้ไข'
              : 'เพิ่มประกาศ'
          }
        </button>

      </div>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  modal
    .querySelector(
      '.modal-close'
    )
    ?.addEventListener(
      'click',
      () => modal.remove()
    );


  modal
    .querySelector(
      '.btn-cancel'
    )
    ?.addEventListener(
      'click',
      () => modal.remove()
    );


  modal
    .querySelector(
      '.btn-save'
    )
    ?.addEventListener(
      'click',
      async () => {

        try {

          await saveAnnouncement(
            announcement.id ||
            null
          );


          modal.remove();

        } catch (error) {

          console.error(
            error
          );

        }

      }
    );

}


/* =========================================================
   SAVE
   ========================================================= */

async function saveAnnouncement(
  id
) {

  if (!needAdmin()) {

    throw new Error(
      'ไม่มีสิทธิ์จัดการประกาศ'
    );

  }


  const title =
    document
      .getElementById(
        'announcementTitle'
      )
      ?.value
      .trim();


  const type =
    document
      .getElementById(
        'announcementType'
      )
      ?.value ||
    'ทั่วไป';


  const message =
    document
      .getElementById(
        'announcementMessage'
      )
      ?.value
      .trim();


  if (!title) {

    throw new Error(
      'กรุณากรอกหัวข้อประกาศ'
    );

  }


  if (!message) {

    throw new Error(
      'กรุณากรอกรายละเอียดประกาศ'
    );

  }


  const data = {

    title,

    message,

    /*
      เก็บ content ด้วย
      เพื่อรองรับโค้ดเก่าของระบบ
    */

    content:
      message,

    type,

    updatedAt:
      serverTimestamp(),

    updatedBy:
      state.user?.email ||
      '-',

    updatedByUid:
      state.user?.uid ||
      null

  };


  if (id) {

    await updateDoc(

      doc(
        db,
        'announcements',
        id
      ),

      data

    );


    await logAct(

      'แก้ไขประกาศ',

      title

    );


    toast(
      'แก้ไขประกาศสำเร็จ',
      'ok'
    );

  } else {

    await addDoc(

      collection(
        db,
        'announcements'
      ),

      {

        ...data,

        createdAt:
          serverTimestamp(),

        createdBy:
          state.user?.email ||
          '-',

        createdByUid:
          state.user?.uid ||
          null

      }

    );


    await logAct(

      'เพิ่มประกาศ',

      title

    );


    toast(
      'เพิ่มประกาศสำเร็จ',
      'ok'
    );

  }

}


/* =========================================================
   DELETE
   ========================================================= */

async function deleteAnnouncement(
  announcement
) {

  const title =
    announcement.title ||
    'ประกาศนี้';


  const confirmed =
    window.confirm(
      `ต้องการลบ "${title}" หรือไม่?\n\nการลบจะไม่สามารถกู้คืนได้`
    );


  if (!confirmed) {
    return;
  }


  try {

    await deleteDoc(

      doc(
        db,
        'announcements',
        announcement.id
      )

    );


    await logAct(

      'ลบประกาศ',

      title

    );


    toast(
      'ลบประกาศสำเร็จ',
      'ok'
    );

  } catch (error) {

    console.error(
      'Delete announcement:',
      error
    );


    toast(
      error?.message ||
      'ลบประกาศไม่สำเร็จ',
      'err'
    );

  }

}


/* =========================================================
   DATE
   ========================================================= */

function dateValue(
  value
) {

  if (!value) {
    return 0;
  }


  if (
    typeof value === 'object' &&
    typeof value.toDate === 'function'
  ) {

    return value
      .toDate()
      .getTime();

  }


  const time =
    new Date(value).getTime();


  return Number.isNaN(time)
    ? 0
    : time;

}


function formatDate(
  value
) {

  if (!value) {
    return '-';
  }


  const date =
    value &&
    typeof value.toDate ===
      'function'

      ? value.toDate()

      : new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return '-';

  }


  return date.toLocaleDateString(
    'th-TH',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  );

}


/* =========================================================
   CLEANUP
   ========================================================= */

window.addEventListener(
  'beforeunload',
  () => {

    unsubscribe?.();

  }
);
```
