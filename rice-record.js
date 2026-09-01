```javascript
/* =========================================================
   RICE-RECORD.JS
   ระบบบันทึกรับข้าวสาร
   กลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6

   Firebase Firestore จริง
   ========================================================= */

import {
  db,
  state,
  guard,
  needAdmin,
  $,
  esc,
  thDate,
  toast,
  downloadCSV,
  logAct,
  startClock,

  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp
} from './common.js';


/* =========================================================
   STATE
   ========================================================= */

let members = [];

let funerals = [];

let records = [];

let currentFuneralId = null;

let busy = new Set();

let unsubMembers = null;

let unsubFunerals = null;

let unsubRecords = null;


/* =========================================================
   DOM
   ========================================================= */

const funeralSelect =
  $('#funeralSelect');

const searchInput =
  $('#searchInput');

const filterStatus =
  $('#filterStatus');

const riceGrid =
  $('#riceGrid');

const rGot =
  $('#rGot');

const rPending =
  $('#rPending');

const rPct =
  $('#rPct');

const rBar =
  $('#rBar');

const countText =
  $('#countText');

const btnCheckAll =
  $('#btnCheckAll');

const btnClearAll =
  $('#btnClearAll');

const btnExport =
  $('#btnExport');


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
              member => {

                /*
                  รองรับข้อมูลเก่า
                  ที่ใช้ active
                  และข้อมูลใหม่
                  ที่ใช้ status
                */

                const active =
                  member.active !== false;


                const status =
                  String(
                    member.status ?? ''
                  ).toLowerCase();


                const inactive =
                  status === 'inactive' ||
                  status === 'พักสมาชิก' ||
                  status === 'พัก';


                return (
                  active &&
                  !inactive
                );

              }
            );


        sortMembers();

        render();

      },

      error => {

        console.error(
          'Members snapshot error:',
          error
        );


        toast(
          'โหลดรายชื่อสมาชิกไม่สำเร็จ',
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


  /*
    ไม่ใช้ orderBy จาก Firestore
    เพื่อให้รองรับข้อมูลเก่าที่ field
    อาจไม่ครบ
  */

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


        renderFuneralSelect();

        chooseFuneral();

        render();

      },

      error => {

        console.error(
          'Funerals snapshot error:',
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
          'Rice records snapshot error:',
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
          a.houseNumber ??
          ''
        );


      const bh =
        String(
          b.houseNo ??
          b.house ??
          b.houseNumber ??
          ''
        );


      const result =
        ah.localeCompare(
          bh,
          'th',
          {
            numeric: true
          }
        );


      if (result !== 0) {
        return result;
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
   GET HOUSE NUMBER
   ========================================================= */

function houseOf(member) {

  return String(

    member.houseNo ??
    member.house ??
    member.houseNumber ??
    ''

  );

}


/* =========================================================
   GET NAME
   ========================================================= */

function nameOf(member) {

  return String(

    member.name ??
    member.fullName ??
    member.memberName ??
    ''

  );

}


/* =========================================================
   SELECT FUNERAL
   ========================================================= */

function renderFuneralSelect() {

  if (!funeralSelect) {
    return;
  }


  const oldValue =
    currentFuneralId;


  funeralSelect.innerHTML = '';


  if (!funerals.length) {

    funeralSelect.innerHTML = `

      <option value="">
        — ยังไม่มีงานศพ —
      </option>

    `;


    currentFuneralId = null;

    return;

  }


  funerals.forEach(
    funeral => {

      const option =
        document.createElement(
          'option'
        );


      option.value =
        funeral.id;


      const status =
        funeral.status === 'active'
          ? ' — กำลังดำเนินการ'
          : '';


      option.textContent =
        `${funeral.name || '-'} — ${
          thDate(
            funeral.cremationDate
          )
        }${status}`;


      funeralSelect.appendChild(
        option
      );

    }
  );


  if (
    oldValue &&
    funerals.some(
      f => f.id === oldValue
    )
  ) {

    funeralSelect.value =
      oldValue;

  }

}


/* =========================================================
   CHOOSE FUNERAL
   ========================================================= */

function chooseFuneral() {

  if (!funerals.length) {

    currentFuneralId = null;

    return;

  }


  if (
    currentFuneralId &&
    funerals.some(
      f =>
        f.id === currentFuneralId
    )
  ) {

    funeralSelect.value =
      currentFuneralId;

    return;

  }


  const active =
    funerals.find(
      f =>
        f.status === 'active'
    );


  currentFuneralId =
    active?.id ||
    funerals[0]?.id ||
    null;


  if (funeralSelect) {

    funeralSelect.value =
      currentFuneralId || '';

  }

}


/* =========================================================
   CURRENT RECORDS
   ========================================================= */

function currentRecords() {

  if (!currentFuneralId) {
    return [];
  }


  return records.filter(
    record =>
      record.funeralId ===
      currentFuneralId
  );

}


/* =========================================================
   RECEIVED SET
   ========================================================= */

function receivedSet() {

  return new Set(

    currentRecords()

      .map(
        record =>
          record.memberId
      )

      .filter(Boolean)

  );

}


/* =========================================================
   FILTER
   ========================================================= */

function filteredMembers() {

  const keyword =
    String(
      searchInput?.value || ''
    )
      .toLowerCase()
      .trim();


  const status =
    filterStatus?.value ||
    'all';


  const got =
    receivedSet();


  return members.filter(
    member => {

      const house =
        houseOf(member);


      const name =
        nameOf(member);


      const searchHit =
        !keyword ||

        `${house} ${name}`
          .toLowerCase()
          .includes(keyword);


      let statusHit = true;


      if (status === 'got') {

        statusHit =
          got.has(member.id);

      }


      if (status === 'pending') {

        statusHit =
          !got.has(member.id);

      }


      return (
        searchHit &&
        statusHit
      );

    }
  );

}


/* =========================================================
   RENDER
   ========================================================= */

function render() {

  renderSummary();

  renderGrid();

}


/* =========================================================
   SUMMARY
   ========================================================= */

function renderSummary() {

  const total =
    members.length;


  const got =
    receivedSet().size;


  const pending =
    Math.max(
      0,
      total - got
    );


  const percent =
    total > 0

      ? Math.round(
          got /
          total *
          100
        )

      : 0;


  if (rGot) {

    rGot.textContent =
      got.toLocaleString(
        'th-TH'
      );

  }


  if (rPending) {

    rPending.textContent =
      pending.toLocaleString(
        'th-TH'
      );

  }


  if (rPct) {

    rPct.textContent =
      `${percent}%`;

  }


  if (rBar) {

    rBar.style.width =
      `${percent}%`;

  }

}


/* =========================================================
   RENDER GRID
   ========================================================= */

function renderGrid() {

  if (!riceGrid) {
    return;
  }


  if (!currentFuneralId) {

    riceGrid.innerHTML = `

      <div
        class="empty-box"
        style="
          grid-column:1/-1;
          text-align:center;
          padding:50px 20px;
        "
      >

        <i
          class="fa-solid fa-bowl-rice"
          style="
            font-size:42px;
            color:#aaa;
            margin-bottom:12px;
          "
        ></i>

        <h3>
          ยังไม่มีงานศพ
        </h3>

        <p style="
          color:#888;
          margin-top:7px;
        ">
          กรุณาแจ้งงานศพก่อน
        </p>

      </div>

    `;


    if (countText) {

      countText.textContent =
        'แสดง 0 รายการ';

    }


    return;

  }


  const got =
    receivedSet();


  const list =
    filteredMembers();


  if (!list.length) {

    riceGrid.innerHTML = `

      <div
        class="empty-box"
        style="
          grid-column:1/-1;
          text-align:center;
          padding:40px;
          color:#777;
        "
      >

        <i
          class="fa-solid fa-user-slash"
          style="
            font-size:35px;
            margin-bottom:10px;
          "
        ></i>

        <div>
          ไม่พบรายชื่อสมาชิก
        </div>

      </div>

    `;

  } else {

    riceGrid.innerHTML =
      list
        .map(
          member =>
            memberCard(
              member,
              got.has(member.id)
            )
        )
        .join('');

  }


  if (countText) {

    countText.textContent =
      `แสดง ${list.length} จาก ${members.length} ครัวเรือน`;

  }

}


/* =========================================================
   MEMBER CARD
   ========================================================= */

function memberCard(
  member,
  received
) {

  const house =
    houseOf(member);


  const name =
    nameOf(member);


  const isBusy =
    busy.has(member.id);


  return `

    <button
      type="button"
      class="rice-card ${
        received
          ? 'on'
          : ''
      } ${
        isBusy
          ? 'busy'
          : ''
      }"
      data-member-id="${esc(member.id)}"
      ${
        !state.isAdmin
          ? 'disabled'
          : ''
      }
      style="
        border:0;
        text-align:left;
        width:100%;
        cursor:${
          state.isAdmin
            ? 'pointer'
            : 'default'
        };
      "
    >

      <div class="rice-check">

        <i
          class="fa-solid ${
            received
              ? 'fa-circle-check'
              : 'fa-circle'
          }"
        ></i>

      </div>


      <div class="rice-info">

        <strong>
          บ้านเลขที่ ${esc(house || '-')}
        </strong>

        <span>
          ${esc(name || '-')}
        </span>

      </div>


      <span
        class="pill ${
          received
            ? 'on'
            : 'off'
        }"
      >

        ${
          isBusy
            ? 'กำลังบันทึก...'
            : (
              received
                ? 'รับแล้ว'
                : 'ค้างส่ง'
            )
        }

      </span>

    </button>

  `;

}


/* =========================================================
   TOGGLE
   ========================================================= */

async function toggleMember(
  memberId
) {

  if (!currentFuneralId) {

    toast(
      'กรุณาเลือกงานศพก่อน',
      'err'
    );

    return;

  }


  if (!needAdmin()) {
    return;
  }


  if (busy.has(memberId)) {
    return;
  }


  const member =
    members.find(
      m =>
        m.id === memberId
    );


  if (!member) {

    toast(
      'ไม่พบข้อมูลสมาชิก',
      'err'
    );

    return;

  }


  const existing =
    currentRecords().find(
      record =>
        record.memberId ===
        memberId
    );


  busy.add(memberId);

  render();


  try {

    if (existing) {

      /*
        ยกเลิกสถานะรับแล้ว
      */

      await deleteDoc(

        doc(
          db,
          'riceRecords',
          existing.id
        )

      );


      await logAct(

        'ยกเลิกรับข้าว',

        `บ้านเลขที่ ${
          houseOf(member)
        } ${nameOf(member)}`

      );


      toast(
        `ยกเลิกรับข้าว บ้านเลขที่ ${houseOf(member)}`,
        'ok'
      );

    } else {

      /*
        ป้องกันการกดซ้ำ
        ก่อนเพิ่มตรวจอีกครั้ง
      */

      const duplicate =
        currentRecords().find(
          record =>
            record.memberId ===
            memberId
        );


      if (duplicate) {

        toast(
          'รายการนี้ถูกบันทึกไปแล้ว',
          'err'
        );

        return;

      }


      await addDoc(

        collection(
          db,
          'riceRecords'
        ),

        {

          funeralId:
            currentFuneralId,

          memberId:
            member.id,

          houseNo:
            houseOf(member),

          memberName:
            nameOf(member),

          amount:
            1,

          recordedAt:
            serverTimestamp(),

          receivedAt:
            serverTimestamp(),

          recordedBy:
            state.user?.email ||
            '-',

          recordedByUid:
            state.user?.uid ||
            null

        }

      );


      await logAct(

        'บันทึกรับข้าว',

        `บ้านเลขที่ ${
          houseOf(member)
        } ${nameOf(member)}`

      );


      toast(
        `บันทึกรับข้าว บ้านเลขที่ ${houseOf(member)} แล้ว`,
        'ok'
      );

    }

  } catch (error) {

    console.error(
      'Toggle rice error:',
      error
    );


    toast(
      error?.message ||
      'บันทึกข้อมูลไม่สำเร็จ',
      'err'
    );

  } finally {

    busy.delete(memberId);

    render();

  }

}


/* =========================================================
   CLICK GRID
   ========================================================= */

if (riceGrid) {

  riceGrid.addEventListener(
    'click',
    event => {

      const card =
        event.target.closest(
          '.rice-card'
        );


      if (!card) {
        return;
      }


      const memberId =
        card.dataset.memberId;


      if (!memberId) {
        return;
      }


      toggleMember(
        memberId
      );

    }
  );

}


/* =========================================================
   FUNERAL CHANGE
   ========================================================= */

if (funeralSelect) {

  funeralSelect.addEventListener(
    'change',
    event => {

      currentFuneralId =
        event.target.value ||
        null;


      render();

    }
  );

}


/* =========================================================
   SEARCH
   ========================================================= */

if (searchInput) {

  searchInput.addEventListener(
    'input',
    renderGrid
  );

}


/* =========================================================
   FILTER
   ========================================================= */

if (filterStatus) {

  filterStatus.addEventListener(
    'change',
    renderGrid
  );

}


/* =========================================================
   CHECK ALL
   ========================================================= */

if (btnCheckAll) {

  btnCheckAll.addEventListener(
    'click',
    () => {

      bulkChange(
        true
      );

    }
  );

}


/* =========================================================
   CLEAR ALL
   ========================================================= */

if (btnClearAll) {

  btnClearAll.addEventListener(
    'click',
    () => {

      bulkChange(
        false
      );

    }
  );

}


/* =========================================================
   BULK CHANGE
   ========================================================= */

async function bulkChange(
  check
) {

  if (!currentFuneralId) {

    toast(
      'กรุณาเลือกงานศพก่อน',
      'err'
    );

    return;

  }


  if (!needAdmin()) {
    return;
  }


  const list =
    filteredMembers();


  const got =
    receivedSet();


  const targets =
    list.filter(
      member =>
        check
          ? !got.has(member.id)
          : got.has(member.id)
    );


  if (!targets.length) {

    toast(
      check
        ? 'ไม่มีสมาชิกที่ต้องติ๊กเพิ่ม'
        : 'ไม่มีรายการที่ต้องล้าง',
      'ok'
    );

    return;

  }


  /*
    แบ่ง batch ไม่เกิน 400
    เพื่อเผื่อพื้นที่สำหรับ operation อื่น
  */

  try {

    for (
      let i = 0;
      i < targets.length;
      i += 400
    ) {

      const batch =
        writeBatch(db);


      const chunk =
        targets.slice(
          i,
          i + 400
        );


      chunk.forEach(
        member => {

          if (check) {

            const recordRef =
              doc(
                collection(
                  db,
                  'riceRecords'
                )
              );


            batch.set(
              recordRef,
              {

                funeralId:
                  currentFuneralId,

                memberId:
                  member.id,

                houseNo:
                  houseOf(member),

                memberName:
                  nameOf(member),

                amount:
                  1,

                recordedAt:
                  serverTimestamp(),

                receivedAt:
                  serverTimestamp(),

                recordedBy:
                  state.user?.email ||
                  '-',

                recordedByUid:
                  state.user?.uid ||
                  null

              }
            );

          } else {

            const existing =
              currentRecords().find(
                record =>
                  record.memberId ===
                  member.id
              );


            if (existing) {

              batch.delete(

                doc(
                  db,
                  'riceRecords',
                  existing.id
                )

              );

            }

          }

        }
      );


      await batch.commit();

    }


    await logAct(

      check
        ? 'ติ๊กรับข้าวหลายรายการ'
        : 'ล้างรับข้าวหลายรายการ',

      `${check ? 'บันทึก' : 'ล้าง'} ${
        targets.length
      } รายการ`

    );


    toast(

      check
        ? `บันทึกรับข้าว ${targets.length} ครัวเรือนแล้ว`
        : `ล้างรายการ ${targets.length} ครัวเรือนแล้ว`,

      'ok'

    );

  } catch (error) {

    console.error(
      'Bulk rice error:',
      error
    );


    toast(
      error?.message ||
      'ดำเนินการไม่สำเร็จ',
      'err'
    );

  }

}


/* =========================================================
   EXPORT CSV
   ========================================================= */

if (btnExport) {

  btnExport.addEventListener(
    'click',
    () => {

      if (!currentFuneralId) {

        toast(
          'กรุณาเลือกงานศพก่อน',
          'err'
        );

        return;

      }


      const funeral =
        funerals.find(
          f =>
            f.id ===
            currentFuneralId
        );


      if (!funeral) {

        toast(
          'ไม่พบข้อมูลงานศพ',
          'err'
        );

        return;

      }


      const got =
        receivedSet();


      const rows = [

        [
          'บ้านเลขที่',
          'ชื่อ-สกุล',
          'สถานะ',
          'งานศพ',
          'วันฌาปนกิจ'
        ]

      ];


      members.forEach(
        member => {

          rows.push([

            houseOf(member),

            nameOf(member),

            got.has(member.id)
              ? 'รับแล้ว'
              : 'ค้างส่ง',

            funeral.name ||
              '',

            funeral.cremationDate ||
              ''

          ]);

        }
      );


      const safeName =
        String(
          funeral.name ||
          'งานศพ'
        )
          .replace(
            /[\\/:*?"<>|]/g,
            '_'
          );


      downloadCSV(

        `รับข้าว_${safeName}.csv`,

        rows

      );


      toast(
        'ส่งออกข้อมูล CSV สำเร็จ',
        'ok'
      );

    }
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
