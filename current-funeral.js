```javascript
/* =========================================================
   CURRENT-FUNERAL.JS
   งานศพปัจจุบัน / กำลังดำเนินการ
   กลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6

   ใช้ Firebase Firestore จริง
   ========================================================= */

import {
  db,
  state,
  guard,
  needAdmin,
  toast,
  esc,
  thDate,
  downloadCSV,
  logAct,
  uploadPhoto,
  removePhoto,
  openModal,
  confirmDel,
  startClock,

  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp
} from './common.js';


/* =========================================================
   DATA
   ========================================================= */

let members = [];

let funerals = [];

let records = [];

let currentFuneral = null;

let unsubMembers = null;

let unsubFunerals = null;

let unsubRecords = null;


/* =========================================================
   DOM
   ========================================================= */

const funeralBody =
  document.getElementById('funeralBody');

const funeralStats =
  document.getElementById('funeralStats');

const pendingGrid =
  document.getElementById('pendingGrid');

const pendingCard =
  document.getElementById('pendingCard');

const btnNew =
  document.getElementById('btnNew');


/* =========================================================
   START
   ========================================================= */

guard(async () => {

  startClock();

  listenMembers();

  listenFunerals();

  listenRiceRecords();

});


/* =========================================================
   MEMBERS
   ========================================================= */

function listenMembers() {

  if (unsubMembers) {
    unsubMembers();
  }


  /*
    ไม่ใช้ orderBy เพื่อป้องกัน
    ข้อมูลเก่าที่ไม่มี houseNo
    ทำให้ query ล้มเหลว
  */

  unsubMembers =
    onSnapshot(

      collection(
        db,
        'members'
      ),

      snapshot => {

        members =
          snapshot.docs
            .map(
              d => ({
                id: d.id,
                ...d.data()
              })
            )
            .filter(
              member =>
                member.active !== false &&
                member.status !== 'inactive'
            );


        sortMembers();

        chooseCurrentFuneral();

        render();

      },

      error => {

        console.error(
          'Members error:',
          error
        );


        toast(
          'โหลดข้อมูลสมาชิกไม่สำเร็จ',
          'err'
        );

      }

    );

}


/* =========================================================
   FUNERALS
   ========================================================= */

function listenFunerals() {

  if (unsubFunerals) {
    unsubFunerals();
  }


  unsubFunerals =
    onSnapshot(

      collection(
        db,
        'funerals'
      ),

      snapshot => {

        funerals =
          snapshot.docs.map(
            d => ({
              id: d.id,
              ...d.data()
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


        chooseCurrentFuneral();

        render();

      },

      error => {

        console.error(
          'Funerals error:',
          error
        );


        toast(
          'โหลดข้อมูลงานศพไม่สำเร็จ',
          'err'
        );

      }

    );

}


/* =========================================================
   RICE RECORDS
   ========================================================= */

function listenRiceRecords() {

  if (unsubRecords) {
    unsubRecords();
  }


  unsubRecords =
    onSnapshot(

      collection(
        db,
        'riceRecords'
      ),

      snapshot => {

        records =
          snapshot.docs.map(
            d => ({
              id: d.id,
              ...d.data()
            })
          );


        render();

      },

      error => {

        console.error(
          'Rice records error:',
          error
        );


        toast(
          'โหลดข้อมูลการรับข้าวไม่สำเร็จ',
          'err'
        );

      }

    );

}


/* =========================================================
   SORT MEMBERS
   ========================================================= */

function sortMembers() {

  members.sort(
    (a, b) => {

      const ah =
        String(
          a.houseNo ??
          a.house ??
          ''
        );


      const bh =
        String(
          b.houseNo ??
          b.house ??
          ''
        );


      const compare =
        ah.localeCompare(
          bh,
          'th',
          {
            numeric: true
          }
        );


      if (compare !== 0) {
        return compare;
      }


      return String(
        a.name || ''
      ).localeCompare(
        String(
          b.name || ''
        ),
        'th'
      );

    }
  );

}


/* =========================================================
   CHOOSE CURRENT FUNERAL
   ========================================================= */

function chooseCurrentFuneral() {

  /*
    ลำดับความสำคัญ

    1. งานที่ status = active
    2. ถ้าไม่มี ให้ใช้งานล่าสุด
  */

  currentFuneral =
    funerals.find(
      f =>
        f.status === 'active'
    ) || null;


  if (!currentFuneral) {

    currentFuneral =
      funerals
        .slice()
        .sort(
          (a, b) =>
            dateValue(
              b.cremationDate
            ) -
            dateValue(
              a.cremationDate
            )
        )[0] || null;

  }

}


/* =========================================================
   RENDER ALL
   ========================================================= */

function render() {

  renderFuneral();

  renderStats();

  renderPending();

}


/* =========================================================
   RENDER CURRENT FUNERAL
   ========================================================= */

function renderFuneral() {

  if (!funeralBody) {
    return;
  }


  if (!currentFuneral) {

    funeralBody.innerHTML = `

      <div class="empty-box"
           style="
             padding:50px 20px;
             text-align:center;
           ">

        <i
          class="fa-solid fa-dove"
          style="
            font-size:42px;
            color:#aaa;
            margin-bottom:15px;
          "
        ></i>

        <h3>
          ขณะนี้ไม่มีงานศพที่กำลังดำเนินการ
        </h3>

        <p style="
          color:#888;
          margin-top:8px;
        ">
          ${
            state.isAdmin
              ? 'กด “แจ้งงานศพใหม่” เพื่อเพิ่มข้อมูล'
              : 'เมื่อมีการแจ้งงานศพ ข้อมูลจะแสดงที่หน้านี้'
          }
        </p>

      </div>

    `;


    return;

  }


  const f =
    currentFuneral;


  const got =
    getReceivedMemberIds(
      f.id
    );


  const total =
    members.length;


  const received =
    countReceived(
      f.id
    );


  const pending =
    Math.max(
      0,
      total - received
    );


  const percent =
    total > 0
      ? Math.round(
          received /
          total *
          100
        )
      : 0;


  const photo =
    f.photoURL ||
    'https://placehold.co/220x260/e8e0d0/555?text=รูปผู้เสียชีวิต';


  funeralBody.innerHTML = `

    <div
      class="funeral-current-content"
      style="
        display:flex;
        gap:24px;
        padding:24px;
        flex-wrap:wrap;
      "
    >

      <div
        class="funeral-photo"
        style="
          flex:0 0 220px;
        "
      >

        <img
          src="${esc(photo)}"
          alt="${esc(f.name || 'ผู้เสียชีวิต')}"
          style="
            width:220px;
            height:260px;
            object-fit:cover;
            border-radius:14px;
            box-shadow:0 8px 20px rgba(0,0,0,.10);
          "
          onerror="
            this.src='https://placehold.co/220x260/e8e0d0/555?text=ไม่มีรูป'
          "
        >

      </div>


      <div
        class="funeral-info"
        style="
          flex:1;
          min-width:280px;
        "
      >

        <div
          style="
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            gap:10px;
            flex-wrap:wrap;
          "
        >

          <div>

            <h2
              style="
                margin:0 0 6px;
                font-size:26px;
              "
            >
              ${esc(f.name || '-')}
            </h2>


            ${
              f.age
                ? `
                  <p style="
                    color:#777;
                    margin:0 0 15px;
                  ">
                    อายุ ${esc(f.age)} ปี
                  </p>
                `
                : ''
            }

          </div>


          <span
            style="
              background:${
                f.status === 'active'
                  ? '#dc2626'
                  : '#777'
              };
              color:white;
              padding:6px 14px;
              border-radius:20px;
              font-size:12px;
              font-weight:600;
            "
          >

            <i
              class="fa-solid fa-circle"
              style="
                font-size:7px;
                margin-right:5px;
              "
            ></i>

            ${
              f.status === 'active'
                ? 'กำลังดำเนินการ'
                : 'เสร็จสิ้น'
            }

          </span>

        </div>


        <div
          style="
            display:grid;
            grid-template-columns:
              repeat(auto-fit,minmax(220px,1fr));
            gap:14px;
            margin:15px 0;
          "
        >

          <div class="info-item">

            <i class="fa-solid fa-calendar"></i>

            <div>

              <small>
                วันฌาปนกิจ
              </small>

              <strong>
                ${thDate(f.cremationDate)}
              </strong>

            </div>

          </div>


          <div class="info-item">

            <i class="fa-solid fa-location-dot"></i>

            <div>

              <small>
                สถานที่
              </small>

              <strong>
                ${esc(f.place || '-')}
              </strong>

            </div>

          </div>


          <div class="info-item">

            <i class="fa-solid fa-bowl-rice"></i>

            <div>

              <small>
                การรับข้าว
              </small>

              <strong>
                ${received} / ${total} ครัวเรือน
              </strong>

            </div>

          </div>

        </div>


        <div
          style="
            margin:18px 0;
          "
        >

          <div
            style="
              display:flex;
              justify-content:space-between;
              margin-bottom:7px;
              font-size:13px;
            "
          >

            <strong>
              ความคืบหน้าการรับข้าว
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
                border-radius:20px;
                transition:width .4s ease;
              "
            ></div>

          </div>

        </div>


        ${
          f.note
            ? `
              <div
                style="
                  background:#f8f9fa;
                  padding:12px 15px;
                  border-radius:10px;
                  color:#666;
                  margin-bottom:15px;
                "
              >

                <strong>
                  หมายเหตุ:
                </strong>

                ${esc(f.note)}

              </div>
            `
            : ''
        }


        <div
          style="
            display:flex;
            gap:10px;
            flex-wrap:wrap;
            margin-top:15px;
          "
        >

          <a
            href="rice-record.html"
            class="action-btn abtn-green"
            style="
              text-decoration:none;
            "
          >

            <i class="fa-solid fa-bowl-rice"></i>

            บันทึกรับข้าว

          </a>


          ${
            state.isAdmin
              ? `

                <button
                  type="button"
                  class="action-btn"
                  id="btnEditCurrent"
                >

                  <i class="fa-solid fa-pen"></i>

                  แก้ไขงานศพ

                </button>


                <button
                  type="button"
                  class="action-btn"
                  id="btnFinishCurrent"
                  style="
                    background:#6b7280;
                    color:white;
                  "
                >

                  <i class="fa-solid fa-check"></i>

                  ปิดงานศพ

                </button>

              `
              : ''
          }

        </div>

      </div>

    </div>

  `;


  document
    .getElementById(
      'btnEditCurrent'
    )
    ?.addEventListener(
      'click',
      () => {

        if (!needAdmin()) {
          return;
        }


        openFuneralForm(
          currentFuneral
        );

      }
    );


  document
    .getElementById(
      'btnFinishCurrent'
    )
    ?.addEventListener(
      'click',
      () => {

        if (!needAdmin()) {
          return;
        }


        finishFuneral();

      }
    );

}


/* =========================================================
   RENDER STATS
   ========================================================= */

function renderStats() {

  if (!funeralStats) {
    return;
  }


  if (!currentFuneral) {

    funeralStats.innerHTML = '';

    return;

  }


  const total =
    members.length;


  const received =
    countReceived(
      currentFuneral.id
    );


  const pending =
    Math.max(
      0,
      total - received
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
      class="summary-grid four-col"
      style="
        display:grid;
        grid-template-columns:
          repeat(4,1fr);
        gap:14px;
        padding:0 20px 20px;
      "
    >

      <div class="summary-card">

        <div class="summary-icon">
          <i class="fa-solid fa-users"></i>
        </div>

        <div>

          <small>
            ครัวเรือนทั้งหมด
          </small>

          <strong>
            ${total.toLocaleString('th-TH')}
          </strong>

        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon">
          <i class="fa-solid fa-check"></i>
        </div>

        <div>

          <small>
            รับแล้ว
          </small>

          <strong>
            ${received.toLocaleString('th-TH')}
          </strong>

        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon">
          <i class="fa-solid fa-clock"></i>
        </div>

        <div>

          <small>
            ค้างรับ
          </small>

          <strong>
            ${pending.toLocaleString('th-TH')}
          </strong>

        </div>

      </div>


      <div class="summary-card">

        <div class="summary-icon">
          <i class="fa-solid fa-chart-pie"></i>
        </div>

        <div>

          <small>
            ความคืบหน้า
          </small>

          <strong>
            ${percent}%
          </strong>

        </div>

      </div>

    </div>

  `;

}


/* =========================================================
   RENDER PENDING MEMBERS
   ========================================================= */

function renderPending() {

  if (!pendingGrid) {
    return;
  }


  if (!currentFuneral) {

    pendingGrid.innerHTML = `

      <div
        style="
          grid-column:1/-1;
          padding:30px;
          text-align:center;
          color:#888;
        "
      >
        ไม่มีงานศพปัจจุบัน
      </div>

    `;


    return;

  }


  const got =
    getReceivedMemberIds(
      currentFuneral.id
    );


  const pending =
    members.filter(
      member =>
        !got.has(member.id)
    );


  if (!pending.length) {

    pendingGrid.innerHTML = `

      <div
        style="
          grid-column:1/-1;
          padding:35px;
          text-align:center;
        "
      >

        <i
          class="fa-solid fa-circle-check"
          style="
            font-size:40px;
            color:#2d6a4f;
            margin-bottom:10px;
          "
        ></i>

        <h3>
          รับข้าวครบทุกครัวเรือนแล้ว
        </h3>

        <p style="
          color:#777;
          margin-top:5px;
        ">
          ทั้ง ${members.length} ครัวเรือน
          ได้รับข้าวสารเรียบร้อยแล้ว
        </p>

      </div>

    `;


    return;

  }


  pendingGrid.innerHTML =
    pending.map(
      member => {

        const house =
          member.houseNo ??
          member.house ??
          '-';


        return `

          <div
            class="pending-member"
            style="
              display:flex;
              align-items:center;
              gap:12px;
              padding:12px;
              background:#fff;
              border:1px solid #eee;
              border-radius:10px;
              margin-bottom:8px;
            "
          >

            <div
              style="
                width:38px;
                height:38px;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
                background:#fff0f0;
                color:#dc2626;
                flex-shrink:0;
              "
            >

              <i class="fa-solid fa-clock"></i>

            </div>


            <div>

              <strong>
                บ้านเลขที่ ${esc(house)}
              </strong>

              <div
                style="
                  color:#777;
                  font-size:13px;
                "
              >
                ${esc(member.name || '-')}
              </div>

            </div>

          </div>

        `;

      }
    ).join('');

}


/* =========================================================
   RECEIVED RECORDS
   ========================================================= */

function getReceivedMemberIds(
  funeralId
) {

  return new Set(

    records

      .filter(
        record =>
          record.funeralId === funeralId
      )

      .map(
        record =>
          record.memberId
      )

      .filter(Boolean)

  );

}


function countReceived(
  funeralId
) {

  return getReceivedMemberIds(
    funeralId
  ).size;

}


/* =========================================================
   NEW FUNERAL
   ========================================================= */

if (btnNew) {

  btnNew.addEventListener(
    'click',
    () => {

      if (!needAdmin()) {
        return;
      }


      openFuneralForm({

        status: 'active',

        place:
          'วัดร่องเข็ม ต.จำป่าหวาย อ.เมืองพะเยา จ.พะเยา'

      });

    }
  );

}


/* =========================================================
   FUNERAL FORM
   ========================================================= */

function openFuneralForm(
  funeral = {}
) {

  if (!needAdmin()) {
    return;
  }


  const isEdit =
    Boolean(funeral.id);


  const html = `

    <div class="form-group">

      <label>
        ชื่อ-สกุลผู้เสียชีวิต *
      </label>

      <input
        id="fName"
        type="text"
        value="${esc(funeral.name || '')}"
        placeholder="กรอกชื่อ-สกุล"
      >

    </div>


    <div class="form-group">

      <label>
        อายุ (ปี)
      </label>

      <input
        id="fAge"
        type="number"
        min="0"
        value="${esc(funeral.age || '')}"
        placeholder="อายุ"
      >

    </div>


    <div class="form-group">

      <label>
        วันฌาปนกิจ *
      </label>

      <input
        id="fDate"
        type="date"
        value="${esc(
          funeral.cremationDate || ''
        )}"
      >

    </div>


    <div class="form-group">

      <label>
        สถานที่
      </label>

      <input
        id="fPlace"
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
        id="fNote"
        rows="3"
        placeholder="หมายเหตุเพิ่มเติม"
      >${esc(funeral.note || '')}</textarea>

    </div>


    <div class="form-group">

      <label>
        สถานะ
      </label>

      <select id="fStatus">

        <option
          value="active"
          ${
            funeral.status === 'active'
              ? 'selected'
              : ''
          }
        >
          กำลังดำเนินการ
        </option>

        <option
          value="done"
          ${
            funeral.status !== 'active'
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
        id="fPhoto"
        type="file"
        accept="image/*"
      >


      ${
        funeral.photoURL
          ? `

            <div style="
              margin-top:10px;
            ">

              <img
                src="${esc(funeral.photoURL)}"
                alt="รูปปัจจุบัน"
                style="
                  width:110px;
                  height:130px;
                  object-fit:cover;
                  border-radius:10px;
                "
              >

            </div>

          `
          : ''
      }

    </div>

  `;


  openModal(

    isEdit
      ? 'แก้ไขข้อมูลงานศพ'
      : 'แจ้งงานศพใหม่',

    html,

    async () => {

      await saveFuneral(
        funeral.id || null,
        funeral
      );

    },

    isEdit
      ? 'บันทึกการแก้ไข'
      : 'แจ้งงานศพ'

  );

}


/* =========================================================
   SAVE FUNERAL
   ========================================================= */

async function saveFuneral(
  id = null,
  old = {}
) {

  if (!needAdmin()) {

    throw new Error(
      'ไม่มีสิทธิ์จัดการงานศพ'
    );

  }


  const name =
    document
      .getElementById('fName')
      ?.value
      .trim();


  const age =
    Number(
      document
        .getElementById('fAge')
        ?.value
    ) || null;


  const cremationDate =
    document
      .getElementById('fDate')
      ?.value;


  const place =
    document
      .getElementById('fPlace')
      ?.value
      .trim();


  const note =
    document
      .getElementById('fNote')
      ?.value
      .trim();


  const status =
    document
      .getElementById('fStatus')
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

    age,

    cremationDate,

    place,

    note,

    status,

    updatedAt:
      serverTimestamp()

  };


  /*
    อัปโหลดรูป
  */

  const file =
    document
      .getElementById('fPhoto')
      ?.files?.[0];


  if (file) {

    const uploaded =
      await uploadPhoto(
        file,
        'funerals'
      );


    data.photoURL =
      uploaded.url;


    data.photoPath =
      uploaded.path;


    if (
      old.photoPath
    ) {

      await removePhoto(
        old.photoPath
      );

    }

  }


  /*
    ถ้าตั้งงานใหม่เป็น active
    ปิดงาน active เดิมก่อน
  */

  if (
    status === 'active'
  ) {

    const batch =
      writeBatch(db);


    funerals

      .filter(
        funeral =>
          funeral.status === 'active' &&
          funeral.id !== id
      )

      .forEach(
        funeral => {

          batch.update(

            doc(
              db,
              'funerals',
              funeral.id
            ),

            {
              status: 'done',

              updatedAt:
                serverTimestamp()

            }

          );

        }
      );


    await batch.commit();

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
      name
    );


    toast(
      'แก้ไขข้อมูลงานศพสำเร็จ',
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
          serverTimestamp()

      }

    );


    await logAct(
      'แจ้งงานศพใหม่',
      name
    );


    toast(
      'แจ้งงานศพใหม่สำเร็จ',
      'ok'
    );

  }

}


/* =========================================================
   FINISH FUNERAL
   ========================================================= */

function finishFuneral() {

  if (!currentFuneral) {

    toast(
      'ไม่มีงานศพปัจจุบัน',
      'err'
    );

    return;

  }


  openModal(

    'ปิดงานศพ',

    `

      <div
        style="
          text-align:center;
          padding:10px;
        "
      >

        <div
          style="
            font-size:45px;
            margin-bottom:12px;
          "
        >
          ⚠️
        </div>

        <strong>
          ต้องการปิดงานศพนี้หรือไม่?
        </strong>

        <p
          style="
            margin-top:10px;
            color:#777;
          "
        >
          ${esc(currentFuneral.name)}
        </p>

        <p
          style="
            margin-top:8px;
            color:#b42318;
          "
        >
          เมื่อปิดแล้ว งานนี้จะไปอยู่ใน
          “งานศพย้อนหลัง”
        </p>

      </div>

    `,

    async () => {

      await updateDoc(

        doc(
          db,
          'funerals',
          currentFuneral.id
        ),

        {
          status: 'done',

          updatedAt:
            serverTimestamp()

        }

      );


      await logAct(
        'ปิดงานศพ',
        currentFuneral.name
      );


      toast(
        'ปิดงานศพเรียบร้อยแล้ว',
        'ok'
      );

    },

    'ยืนยันปิดงาน'

  );

}


/* =========================================================
   DATE VALUE
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


/* =========================================================
   CLEANUP
   ========================================================= */

window.addEventListener(
  'beforeunload',
  () => {

    unsubMembers?.();

    unsubFunerals?.();

    unsubRecords?.();

  }
);
```
