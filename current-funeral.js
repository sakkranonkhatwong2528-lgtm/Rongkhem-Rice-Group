```javascript
/* =========================================================
   CURRENT-FUNERAL.JS
   งานศพปัจจุบัน / จัดการงานศพ
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
  thDate,
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
   STATE
   ========================================================= */

let funerals = [];

let members = [];

let records = [];

let unsubscribeFunerals = null;
let unsubscribeMembers = null;
let unsubscribeRecords = null;


/* =========================================================
   DOM
   ========================================================= */

const funeralBody =
  document.getElementById(
    'funeralBody'
  );

const funeralStats =
  document.getElementById(
    'funeralStats'
  );

const pendingGrid =
  document.getElementById(
    'pendingGrid'
  );

const btnNew =
  document.getElementById(
    'btnNew'
  );


/* =========================================================
   START
   ========================================================= */

guard(() => {

  startClock();

  loadFunerals();

  loadMembers();

  loadRecords();

  bindEvents();

});


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {

  btnNew?.addEventListener(
    'click',
    () => {

      if (!needAdmin()) {
        return;
      }


      openFuneralForm();

    }
  );

}


/* =========================================================
   LOAD FUNERALS
   ========================================================= */

function loadFunerals() {

  unsubscribeFunerals?.();


  unsubscribeFunerals =
    onSnapshot(

      collection(
        db,
        'funerals'
      ),

      snapshot => {

        funerals =
          snapshot.docs.map(
            item => ({
              id: item.id,
              ...item.data()
            })
          );


        funerals.sort(
          (a, b) =>
            dateValue(
              b.cremationDate
            ) -
            dateValue(
              a.cremationDate
            )
        );


        render();

      },

      error => {

        console.error(
          error
        );


        toast(
          'ไม่สามารถโหลดข้อมูลงานศพได้',
          'err'
        );

      }

    );

}


/* =========================================================
   LOAD MEMBERS
   ========================================================= */

function loadMembers() {

  unsubscribeMembers?.();


  unsubscribeMembers =
    onSnapshot(

      collection(
        db,
        'members'
      ),

      snapshot => {

        members =
          snapshot.docs

            .map(
              item => ({
                id: item.id,
                ...item.data()
              })
            )

            .filter(
              member =>
                member.active !== false
            );


        render();

      },

      error => {

        console.error(
          error
        );

        toast(
          'ไม่สามารถโหลดสมาชิกได้',
          'err'
        );

      }

    );

}


/* =========================================================
   LOAD RICE RECORDS
   ========================================================= */

function loadRecords() {

  unsubscribeRecords?.();


  unsubscribeRecords =
    onSnapshot(

      collection(
        db,
        'riceRecords'
      ),

      snapshot => {

        records =
          snapshot.docs.map(
            item => ({
              id: item.id,
              ...item.data()
            })
          );


        render();

      },

      error => {

        console.error(
          error
        );

        toast(
          'ไม่สามารถโหลดข้อมูลรับข้าวได้',
          'err'
        );

      }

    );

}


/* =========================================================
   CURRENT FUNERAL
   ========================================================= */

function getCurrentFuneral() {

  return (

    funerals.find(
      funeral =>
        funeral.status ===
        'active'
    )

    ||

    funerals[0]

    ||

    null

  );

}


/* =========================================================
   RENDER
   ========================================================= */

function render() {

  renderCurrent();

  renderStats();

  renderPending();

}


/* =========================================================
   CURRENT FUNERAL
   ========================================================= */

function renderCurrent() {

  if (!funeralBody) {
    return;
  }


  const funeral =
    getCurrentFuneral();


  if (!funeral) {

    funeralBody.innerHTML = `

      <div
        style="
          width:100%;
          text-align:center;
          padding:60px 20px;
        "
      >

        <i
          class="fa-solid fa-dove"
          style="
            font-size:45px;
            color:#aaa;
            margin-bottom:15px;
          "
        ></i>


        <h2>
          ยังไม่มีงานศพ
        </h2>


        <p
          style="
            color:#888;
            margin-top:8px;
          "
        >
          ${
            state.isAdmin
              ? 'กด “แจ้งงานศพใหม่” เพื่อเพิ่มข้อมูล'
              : 'ยังไม่มีงานศพที่กำลังดำเนินการ'
          }
        </p>

      </div>

    `;


    return;

  }


  const received =
    receivedSet(
      funeral.id
    ).size;


  const total =
    members.length;


  const pending =
    Math.max(
      0,
      total -
      received
    );


  const percent =
    total
      ? Math.round(
          received /
          total *
          100
        )
      : 0;


  const photo =
    funeral.photoURL ||
    'https://placehold.co/220x260/e8e0d0/555?text=รูปผู้เสียชีวิต';


  funeralBody.innerHTML = `

    <div
      style="
        display:flex;
        gap:25px;
        flex-wrap:wrap;
        padding:25px;
      "
    >

      <div
        style="
          flex:0 0 220px;
        "
      >

        <img
          src="${esc(photo)}"
          alt="${esc(
            funeral.name ||
            ''
          )}"
          style="
            width:220px;
            height:260px;
            object-fit:cover;
            border-radius:14px;
            box-shadow:0 6px 18px rgba(0,0,0,.12);
          "
          onerror="
            this.src='https://placehold.co/220x260/e8e0d0/555?text=ไม่มีรูป'
          "
        >

      </div>


      <div
        style="
          flex:1;
          min-width:280px;
        "
      >

        <div
          style="
            display:flex;
            justify-content:space-between;
            gap:10px;
            flex-wrap:wrap;
          "
        >

          <div>

            <h2
              style="
                margin:0;
                font-size:27px;
              "
            >
              ${esc(
                funeral.name ||
                '-'
              )}
            </h2>


            ${
              funeral.age
                ? `
                  <p
                    style="
                      margin:6px 0 0;
                      color:#777;
                    "
                  >
                    อายุ ${esc(
                      funeral.age
                    )} ปี
                  </p>
                `
                : ''
            }

          </div>


          <span
            style="
              height:max-content;
              padding:7px 14px;
              border-radius:20px;
              color:white;
              background:${
                funeral.status === 'active'
                  ? '#dc2626'
                  : '#6b7280'
              };
              font-size:12px;
            "
          >

            ${
              funeral.status === 'active'
                ? 'กำลังดำเนินการ'
                : 'เสร็จสิ้น'
            }

          </span>

        </div>


        <div
          style="
            margin-top:18px;
            line-height:2;
          "
        >

          <div>

            <i
              class="fa-solid fa-calendar"
            ></i>

            <strong>
              วันฌาปนกิจ:
            </strong>

            ${esc(
              thaiDateLong(
                funeral.cremationDate
              )
            )}

          </div>


          <div>

            <i
              class="fa-solid fa-location-dot"
            ></i>

            <strong>
              สถานที่:
            </strong>

            ${esc(
              funeral.place ||
              '-'
            )}

          </div>


          ${
            funeral.note
              ? `
                <div>

                  <i
                    class="fa-solid fa-note-sticky"
                  ></i>

                  <strong>
                    หมายเหตุ:
                  </strong>

                  ${esc(
                    funeral.note
                  )}

                </div>
              `
              : ''
          }

        </div>


        <div
          style="
            margin-top:20px;
          "
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              margin-bottom:6px;
            "
          >

            <strong>
              การรับข้าว
            </strong>

            <strong>
              ${percent}%
            </strong>

          </div>


          <div
            style="
              height:12px;
              background:#e5e7eb;
              border-radius:20px;
              overflow:hidden;
            "
          >

            <div
              style="
                width:${percent}%;
                height:100%;
                background:#2d6a4f;
                transition:width .4s;
              "
            ></div>

          </div>


          <div
            style="
              margin-top:7px;
              color:#666;
              font-size:13px;
            "
          >

            รับแล้ว
            <strong>
              ${received}
            </strong>

            จาก
            <strong>
              ${total}
            </strong>

            ครัวเรือน

            ${
              pending
                ? `
                  — ค้าง
                  <strong>
                    ${pending}
                  </strong>
                `
                : ''
            }

          </div>

        </div>


        ${
          state.isAdmin
            ? `

              <div
                style="
                  display:flex;
                  gap:8px;
                  flex-wrap:wrap;
                  margin-top:20px;
                "
              >

                <button
                  type="button"
                  class="action-btn"
                  id="editCurrentFuneral"
                >

                  <i
                    class="fa-solid fa-pen"
                  ></i>

                  แก้ไข

                </button>


                ${
                  funeral.status === 'active'
                    ? `
                      <button
                        type="button"
                        class="action-btn"
                        id="finishCurrentFuneral"
                      >

                        <i
                          class="fa-solid fa-check"
                        ></i>

                        ปิดงานศพ

                      </button>
                    `
                    : ''
                }


                <button
                  type="button"
                  class="action-btn danger"
                  id="deleteCurrentFuneral"
                >

                  <i
                    class="fa-solid fa-trash"
                  ></i>

                  ลบ

                </button>

              </div>

            `
            : ''
        }

      </div>

    </div>

  `;


  document
    .getElementById(
      'editCurrentFuneral'
    )
    ?.addEventListener(
      'click',
      () => {

        if (!needAdmin()) {
          return;
        }


        openFuneralForm(
          funeral
        );

      }
    );


  document
    .getElementById(
      'finishCurrentFuneral'
    )
    ?.addEventListener(
      'click',
      () => {

        finishFuneral(
          funeral
        );

      }
    );


  document
    .getElementById(
      'deleteCurrentFuneral'
    )
    ?.addEventListener(
      'click',
      () => {

        deleteFuneral(
          funeral
        );

      }
    );

}


/* =========================================================
   STATS
   ========================================================= */

function renderStats() {

  if (!funeralStats) {
    return;
  }


  const funeral =
    getCurrentFuneral();


  if (!funeral) {

    funeralStats.innerHTML =
      '';

    return;

  }


  const received =
    receivedSet(
      funeral.id
    ).size;


  const total =
    members.length;


  const pending =
    Math.max(
      0,
      total -
      received
    );


  const percent =
    total
      ? Math.round(
          received /
          total *
          100
        )
      : 0;


  funeralStats.innerHTML = `

    <div
      style="
        display:grid;
        grid-template-columns:
          repeat(4,minmax(0,1fr));
        gap:12px;
      "
    >

      ${statCard(
        'fa-users',
        'สมาชิกทั้งหมด',
        total
      )}


      ${statCard(
        'fa-circle-check',
        'รับแล้ว',
        received
      )}


      ${statCard(
        'fa-clock',
        'ค้างส่ง',
        pending
      )}


      ${statCard(
        'fa-chart-pie',
        'ความคืบหน้า',
        `${percent}%`
      )}

    </div>

  `;

}


function statCard(
  icon,
  label,
  value
) {

  return `

    <div
      class="summary-card"
      style="
        padding:16px;
        border-radius:12px;
      "
    >

      <i
        class="fa-solid ${icon}"
      ></i>


      <div>

        <small>
          ${esc(label)}
        </small>


        <strong>
          ${esc(value)}
        </strong>

      </div>

    </div>

  `;

}


/* =========================================================
   PENDING
   ========================================================= */

function renderPending() {

  if (!pendingGrid) {
    return;
  }


  const funeral =
    getCurrentFuneral();


  if (!funeral) {

    pendingGrid.innerHTML =
      '';

    return;

  }


  const got =
    receivedSet(
      funeral.id
    );


  const pending =
    members.filter(
      member =>
        !got.has(
          member.id
        )
    );


  if (!pending.length) {

    pendingGrid.innerHTML = `

      <div
        style="
          grid-column:1/-1;
          text-align:center;
          padding:30px;
        "
      >

        <i
          class="fa-solid fa-circle-check"
          style="
            font-size:40px;
            color:#2d6a4f;
          "
        ></i>


        <h3>
          รับข้าวครบทุกครัวเรือนแล้ว
        </h3>

      </div>

    `;


    return;

  }


  pendingGrid.innerHTML =
    pending
      .map(
        member => `

          <div
            class="pending-member"
            style="
              display:flex;
              align-items:center;
              gap:12px;
              padding:12px;
              margin-bottom:8px;
              border:1px solid #eee;
              border-radius:10px;
            "
          >

            <div
              style="
                width:38px;
                height:38px;
                display:flex;
                align-items:center;
                justify-content:center;
                border-radius:50%;
                background:#fff0f0;
                color:#dc2626;
              "
            >

              <i
                class="fa-solid fa-clock"
              ></i>

            </div>


            <div>

              <strong>
                บ้านเลขที่
                ${esc(
                  houseOf(member)
                )}
              </strong>


              <div
                style="
                  color:#777;
                  font-size:13px;
                "
              >
                ${esc(
                  nameOf(member)
                )}
              </div>

            </div>

          </div>

        `
      )
      .join('');

}


/* =========================================================
   RECEIVED SET
   ========================================================= */

function receivedSet(
  funeralId
) {

  return new Set(

    records

      .filter(
        record =>
          record.funeralId ===
          funeralId
      )

      .map(
        record =>
          record.memberId
      )

      .filter(Boolean)

  );

}


/* =========================================================
   FORM
   ========================================================= */

function openFuneralForm(
  funeral = {}
) {

  if (!needAdmin()) {
    return;
  }


  const editing =
    Boolean(
      funeral.id
    );


  const html = `

    <div class="form-group">

      <label>
        ชื่อ-สกุลผู้เสียชีวิต *
      </label>

      <input
        id="funeralName"
        type="text"
        maxlength="200"
        value="${esc(
          funeral.name ||
          ''
        )}"
        placeholder="ชื่อ-สกุล"
      >

    </div>


    <div class="form-group">

      <label>
        อายุ
      </label>

      <input
        id="funeralAge"
        type="number"
        min="0"
        max="150"
        value="${esc(
          funeral.age ||
          ''
        )}"
      >

    </div>


    <div class="form-group">

      <label>
        วันฌาปนกิจ *
      </label>

      <input
        id="funeralDate"
        type="date"
        value="${esc(
          funeral.cremationDate ||
          ''
        )}"
      >

    </div>


    <div class="form-group">

      <label>
        สถานที่
      </label>

      <input
        id="funeralPlace"
        type="text"
        value="${esc(
          funeral.place ||
          'วัดร่องเข็ม ต.จำป่าหวาย อ.เมืองพะเยา จ.พะเยา'
        )}"
      >

    </div>


    <div class="form-group">

      <label>
        หมายเหตุ
      </label>

      <textarea
        id="funeralNote"
        rows="4"
        maxlength="2000"
      >${esc(
        funeral.note ||
        ''
      )}</textarea>

    </div>


    <div class="form-group">

      <label>
        สถานะ
      </label>

      <select
        id="funeralStatus"
      >

        <option
          value="active"
          ${
            (
              funeral.status ||
              'active'
            ) === 'active'
              ? 'selected'
              : ''
          }
        >
          กำลังดำเนินการ
        </option>


        <option
          value="done"
          ${
            funeral.status ===
            'done'
              ? 'selected'
              : ''
          }
        >
          เสร็จสิ้น
        </option>

      </select>

    </div>


    <div class="form-group">

      <label>
        รูปผู้เสียชีวิต
      </label>

      <input
        id="funeralPhoto"
        type="file"
        accept="image/*"
      >


      ${
        funeral.photoURL
          ? `
            <img
              src="${esc(
                funeral.photoURL
              )}"
              style="
                width:100px;
                height:120px;
                object-fit:cover;
                border-radius:10px;
                margin-top:10px;
              "
            >
          `
          : ''
      }

    </div>

  `;


  showModal(
    editing
      ? 'แก้ไขงานศพ'
      : 'แจ้งงานศพใหม่',
    html,
    async () => {

      await saveFuneral(
        funeral.id ||
        null,
        funeral
      );

    },
    editing
      ? 'บันทึกการแก้ไข'
      : 'แจ้งงานศพ'
  );

}


/* =========================================================
   MODAL
   ========================================================= */

function showModal(
  title,
  body,
  onSave,
  saveText
) {

  const old =
    document.querySelector(
      '.rk-modal'
    );


  old?.remove();


  const modal =
    document.createElement(
      'div'
    );


  modal.className =
    'rk-modal';


  modal.innerHTML = `

    <div
      class="rk-modal-overlay"
    >

      <div
        class="rk-modal-box"
      >

        <div
          class="rk-modal-header"
        >

          <h3>
            ${esc(title)}
          </h3>


          <button
            type="button"
            class="rk-close"
          >
            ×
          </button>

        </div>


        <div
          class="rk-modal-body"
        >

          ${body}

        </div>


        <div
          class="rk-modal-footer"
        >

          <button
            type="button"
            class="rk-cancel"
          >
            ยกเลิก
          </button>


          <button
            type="button"
            class="rk-save"
          >
            ${esc(saveText)}
          </button>

        </div>

      </div>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  const close = () =>
    modal.remove();


  modal
    .querySelector(
      '.rk-close'
    )
    ?.addEventListener(
      'click',
      close
    );


  modal
    .querySelector(
      '.rk-cancel'
    )
    ?.addEventListener(
      'click',
      close
    );


  modal
    .querySelector(
      '.rk-save'
    )
    ?.addEventListener(
      'click',
      async () => {

        const button =
          modal.querySelector(
            '.rk-save'
          );


        if (button) {

          button.disabled =
            true;

          button.textContent =
            'กำลังบันทึก...';

        }


        try {

          await onSave();

          close();

        } catch (error) {

          console.error(
            error
          );


          toast(
            error?.message ||
            'บันทึกข้อมูลไม่สำเร็จ',
            'err'
          );


          if (button) {

            button.disabled =
              false;

            button.textContent =
              saveText;

          }

        }

      }
    );

}


/* =========================================================
   SAVE FUNERAL
   ========================================================= */

async function saveFuneral(
  id,
  old
) {

  if (!needAdmin()) {

    throw new Error(
      'ไม่มีสิทธิ์จัดการงานศพ'
    );

  }


  const name =
    document
      .getElementById(
        'funeralName'
      )
      ?.value
      .trim();


  const age =
    document
      .getElementById(
        'funeralAge'
      )
      ?.value;


  const cremationDate =
    document
      .getElementById(
        'funeralDate'
      )
      ?.value;


  const place =
    document
      .getElementById(
        'funeralPlace'
      )
      ?.value
      .trim();


  const note =
    document
      .getElementById(
        'funeralNote'
      )
      ?.value
      .trim();


  const status =
    document
      .getElementById(
        'funeralStatus'
      )
      ?.value ||
    'active';


  if (!name) {

    throw new Error(
      'กรุณากรอกชื่อผู้เสียชีวิต'
    );

  }


  if (!cremationDate) {

    throw new Error(
      'กรุณาระบุวันฌาปนกิจ'
    );

  }


  const data = {

    name,

    age:
      age
        ? Number(age)
        : null,

    cremationDate,

    place,

    note,

    status,

    updatedAt:
      serverTimestamp(),

    updatedBy:
      state.user?.email ||
      '-',

    updatedByUid:
      state.user?.uid ||
      null

  };


  /*
    อัปโหลดรูป
    รองรับ uploadPhoto
    จาก common.js ถ้ามี
  */

  const photoInput =
    document
      .getElementById(
        'funeralPhoto'
      );


  const photoFile =
    photoInput?.files?.[0];


  if (photoFile) {

    const upload =
      await uploadImage(
        photoFile,
        id
      );


    if (upload?.url) {

      data.photoURL =
        upload.url;

    }

  }


  /*
    ถ้าตั้งเป็นงานปัจจุบัน
    ปิดงานปัจจุบันเดิมก่อน
  */

  if (
    status === 'active'
  ) {

    const updates =
      funerals.filter(
        funeral =>
          funeral.status ===
            'active' &&
          funeral.id !== id
      );


    for (
      const funeral
      of updates
    ) {

      await updateDoc(

        doc(
          db,
          'funerals',
          funeral.id
        ),

        {
          status:
            'done',

          updatedAt:
            serverTimestamp()

        }

      );

    }

  }


  if (id) {

    await updateDoc(

      doc(
        db,
        'funerals',
        id
      ),

      data

    );


    await logAct(

      'แก้ไขงานศพ',

      `${name} (${cremationDate})`

    );


    toast(
      'แก้ไขข้อมูลงานศพแล้ว',
      'ok'
    );

  } else {

    await addDoc(

      collection(
        db,
        'funerals'
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

      'แจ้งงานศพใหม่',

      `${name} (${cremationDate})`

    );


    toast(
      'แจ้งงานศพใหม่แล้ว',
      'ok'
    );

  }

}


/* =========================================================
   IMAGE
   ========================================================= */

async function uploadImage(
  file,
  funeralId
) {

  /*
    ถ้ามี uploadPhoto ใน common
    ใช้ของระบบเดิม
  */

  try {

    const module =
      await import(
        './common.js'
      );


    if (
      typeof module.uploadPhoto ===
      'function'
    ) {

      return await module.uploadPhoto(
        file,
        `funerals/${funeralId || 'new'}`
      );

    }

  } catch (error) {

    console.warn(
      'uploadPhoto unavailable',
      error
    );

  }


  /*
    ถ้าไม่มีระบบ upload
    ไม่ทำให้การบันทึกข้อมูลพัง
  */

  return null;

}


/* =========================================================
   FINISH
   ========================================================= */

async function finishFuneral(
  funeral
) {

  if (!needAdmin()) {
    return;
  }


  const ok =
    window.confirm(

      `ต้องการปิดงานศพ "${funeral.name}" หรือไม่?\n\n` +

      `หลังจากปิด งานนี้จะถือเป็นงานศพย้อนหลัง`

    );


  if (!ok) {
    return;
  }


  try {

    await updateDoc(

      doc(
        db,
        'funerals',
        funeral.id
      ),

      {

        status:
          'done',

        updatedAt:
          serverTimestamp()

      }

    );


    await logAct(

      'ปิดงานศพ',

      funeral.name

    );


    toast(
      'ปิดงานศพเรียบร้อยแล้ว',
      'ok'
    );

  } catch (error) {

    console.error(
      error
    );


    toast(
      error?.message ||
      'ปิดงานศพไม่สำเร็จ',
      'err'
    );

  }

}


/* =========================================================
   DELETE
   ========================================================= */

async function deleteFuneral(
  funeral
) {

  if (!needAdmin()) {
    return;
  }


  const ok =
    window.confirm(

      `⚠️ ยืนยันการลบงานศพ\n\n` +

      `${funeral.name}\n` +

      `วันที่ฌาปนกิจ ${
        thaiDateLong(
          funeral.cremationDate
        )
      }\n\n` +

      `ข้อมูลจะถูกลบออกจากระบบ`

    );


  if (!ok) {
    return;
  }


  try {

    await deleteDoc(

      doc(
        db,
        'funerals',
        funeral.id
      )

    );


    await logAct(

      'ลบงานศพ',

      funeral.name

    );


    toast(
      'ลบงานศพแล้ว',
      'ok'
    );

  } catch (error) {

    console.error(
      error
    );


    toast(
      error?.message ||
      'ลบงานศพไม่สำเร็จ',
      'err'
    );

  }

}


/* =========================================================
   HELPERS
   ========================================================= */

function houseOf(
  member
) {

  return String(

    member.houseNo ??
    member.house ??
    member.houseNumber ??
    ''

  );

}


function nameOf(
  member
) {

  return String(

    member.name ??
    member.fullName ??
    member.memberName ??
    ''

  );

}


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


  const valueTime =
    new Date(value).getTime();


  return Number.isNaN(
    valueTime
  )
    ? 0
    : valueTime;

}


function thaiDateLong(
  value
) {

  if (!value) {
    return '-';
  }


  let date;


  if (
    typeof value === 'object' &&
    typeof value.toDate === 'function'
  ) {

    date =
      value.toDate();

  } else {

    date =
      new Date(value);

  }


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
      month: 'long',
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

    unsubscribeFunerals?.();

    unsubscribeMembers?.();

    unsubscribeRecords?.();

  }
);
```
