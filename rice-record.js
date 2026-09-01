```javascript
/* =========================================================
   RICE RECORD
   ระบบบันทึกรับข้าวสาร
   บ้านร่องเข็ม หมู่ที่ 6
   ========================================================= */

import {
  db,
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  serverTimestamp,

  state,
  $,
  esc,
  thDate,
  toast,
  guard,
  needAdmin,
  startClock,
  downloadCSV,
  logAct
} from './common.js';


/* =========================================================
   STATE
   ========================================================= */

let members = [];
let funerals = [];
let records = [];

let currentId = null;

let busy = new Set();

let unsubMembers = null;
let unsubFunerals = null;
let unsubRecords = null;


/* =========================================================
   START
   ========================================================= */

guard(() => {

  startClock();

  bindEvents();

  listenMembers();

  listenFunerals();

  listenRecords();

});


/* =========================================================
   LISTEN MEMBERS
   ========================================================= */

function listenMembers() {

  unsubMembers?.();


  const q =
    query(
      collection(
        db,
        'members'
      ),
      orderBy(
        'houseNo'
      )
    );


  unsubMembers =
    onSnapshot(

      q,

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
                member.active !== false
            );


        render();

      },

      error => {

        console.error(
          'members:',
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
   LISTEN FUNERALS
   ========================================================= */

function listenFunerals() {

  unsubFunerals?.();


  const q =
    query(
      collection(
        db,
        'funerals'
      ),
      orderBy(
        'cremationDate',
        'desc'
      )
    );


  unsubFunerals =
    onSnapshot(

      q,

      snapshot => {

        funerals =
          snapshot.docs.map(
            d => ({
              id: d.id,
              ...d.data()
            })
          );


        const previous =
          currentId;


        currentId =

          previous &&
          funerals.some(
            funeral =>
              funeral.id ===
              previous
          )

            ? previous

            : (

                funerals.find(
                  funeral =>
                    funeral.status ===
                    'active'
                )?.id

                ||

                funerals[0]?.id

                ||

                null

              );


        renderFuneralSelect();

        render();

      },

      error => {

        console.error(
          'funerals:',
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
   LISTEN RECORDS
   ========================================================= */

function listenRecords() {

  unsubRecords?.();


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
          'riceRecords:',
          error
        );


        toast(
          'โหลดประวัติรับข้าวไม่สำเร็จ',
          'err'
        );

      }

    );

}


/* =========================================================
   FUNERAL SELECT
   ========================================================= */

function renderFuneralSelect() {

  const select =
    $('#funeralSelect');


  if (!select) {
    return;
  }


  if (!funerals.length) {

    select.innerHTML =
      '<option value="">— ยังไม่มีงานศพ —</option>';

    return;

  }


  select.innerHTML =
    funerals
      .map(
        funeral => `

          <option
            value="${esc(
              funeral.id
            )}"
          >

            ${esc(
              funeral.name ||
              '-'
            )}

            —

            ${esc(
              thDate(
                funeral.cremationDate
              )
            )}

            ${
              funeral.status ===
              'active'

                ? ' (กำลังดำเนินการ)'

                : ''
            }

          </option>

        `
      )
      .join('');


  select.value =
    currentId || '';

}


/* =========================================================
   CURRENT RECORDS
   ========================================================= */

function recordsForCurrentFuneral() {

  if (!currentId) {
    return [];
  }


  return records.filter(
    record =>
      record.funeralId ===
      currentId
  );

}


/* =========================================================
   RECEIVED SET
   ========================================================= */

function receivedSet() {

  return new Set(

    recordsForCurrentFuneral()
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
      $('#searchInput')?.value ||
      ''
    )
      .toLowerCase()
      .trim();


  const filter =
    $('#filterStatus')?.value ||
    'all';


  const got =
    receivedSet();


  return members.filter(
    member => {

      const text = `

        ${member.houseNo || ''}

        ${member.name || ''}

        ${member.phone || ''}

      `
        .toLowerCase();


      const searchMatch =
        !keyword ||
        text.includes(
          keyword
        );


      let statusMatch =
        true;


      if (
        filter ===
        'got'
      ) {

        statusMatch =
          got.has(
            member.id
          );

      }


      if (
        filter ===
        'pending'
      ) {

        statusMatch =
          !got.has(
            member.id
          );

      }


      return (
        searchMatch &&
        statusMatch
      );

    }
  );

}


/* =========================================================
   RENDER
   ========================================================= */

function render() {

  renderStats();

  renderMembers();

}


/* =========================================================
   STATS
   ========================================================= */

function renderStats() {

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


  if (
    $('#rGot')
  ) {

    $('#rGot').textContent =
      got.toLocaleString(
        'th-TH'
      );

  }


  if (
    $('#rPending')
  ) {

    $('#rPending').textContent =
      pending.toLocaleString(
        'th-TH'
      );

  }


  if (
    $('#rPct')
  ) {

    $('#rPct').textContent =
      `${percent}%`;

  }


  if (
    $('#rBar')
  ) {

    $('#rBar').style.width =
      `${percent}%`;

  }

}


/* =========================================================
   MEMBERS
   ========================================================= */

function renderMembers() {

  const grid =
    $('#riceGrid');


  if (!grid) {
    return;
  }


  const list =
    filteredMembers();


  const got =
    receivedSet();


  if (!list.length) {

    grid.innerHTML = `

      <div
        class="empty-box"
        style="
          grid-column:1/-1;
          text-align:center;
          padding:40px;
        "
      >

        <i
          class="fa-solid fa-users-slash"
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

    grid.innerHTML =
      list
        .map(
          member =>
            renderMemberCard(
              member,
              got
            )
        )
        .join('');

  }


  if (
    $('#countText')
  ) {

    $('#countText').textContent =
      `แสดง ${list.length.toLocaleString('th-TH')} จาก ${members.length.toLocaleString('th-TH')} ครัวเรือน`;

  }

}


/* =========================================================
   MEMBER CARD
   ========================================================= */

function renderMemberCard(
  member,
  got
) {

  const received =
    got.has(
      member.id
    );


  const isBusy =
    busy.has(
      member.id
    );


  return `

    <div
      class="
        rice-card
        ${received ? 'on' : ''}
        ${isBusy ? 'busy' : ''}
      "
      data-id="${esc(
        member.id
      )}"
      role="button"
      tabindex="0"
    >

      <div
        class="rice-check"
      >

        <i
          class="fa-solid ${
            received
              ? 'fa-circle-check'
              : 'fa-circle'
          }"
        ></i>

      </div>


      <div
        class="rice-info"
      >

        <strong>

          บ้านเลขที่
          ${esc(
            member.houseNo ||
            '-'
          )}

        </strong>


        <span>

          ${esc(
            member.name ||
            '-'
          )}

        </span>

      </div>


      <span
        class="
          pill
          ${received ? 'on' : 'off'}
        "
      >

        ${
          received
            ? 'รับแล้ว'
            : 'ค้างส่ง'
        }

      </span>

    </div>

  `;

}


/* =========================================================
   TOGGLE
   ========================================================= */

async function toggle(
  memberId
) {

  if (!currentId) {

    toast(
      'กรุณาเลือกงานศพก่อน',
      'err'
    );

    return;

  }


  if (
    !needAdmin()
  ) {

    return;

  }


  if (
    busy.has(
      memberId
    )
  ) {

    return;

  }


  const member =
    members.find(
      item =>
        item.id ===
        memberId
    );


  if (!member) {

    toast(
      'ไม่พบข้อมูลสมาชิก',
      'err'
    );

    return;

  }


  const existing =
    recordsForCurrentFuneral()
      .find(
        record =>
          record.memberId ===
          memberId
      );


  busy.add(
    memberId
  );


  render();


  try {

    if (existing) {

      /*
        ยกเลิกการรับข้าว
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

        `งานศพ ${currentFuneralName()} | บ้านเลขที่ ${member.houseNo} ${member.name}`

      );


      toast(
        `ยกเลิกรับข้าว บ้านเลขที่ ${member.houseNo}`,
        'ok'
      );

    } else {

      /*
        บันทึกรับข้าว
      */

      await addDoc(

        collection(
          db,
          'riceRecords'
        ),

        {

          funeralId:
            currentId,

          memberId:
            member.id,

          houseNo:
            member.houseNo ||
            '',

          memberName:
            member.name ||
            '',

          amount:
            1,

          recordedAt:
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

        `งานศพ ${currentFuneralName()} | บ้านเลขที่ ${member.houseNo} ${member.name}`

      );


      toast(
        `บันทึกรับข้าว บ้านเลขที่ ${member.houseNo}`,
        'ok'
      );

    }

  } catch (error) {

    console.error(
      'toggle rice record:',
      error
    );


    toast(
      error?.message ||
      'บันทึกไม่สำเร็จ',
      'err'
    );

  } finally {

    busy.delete(
      memberId
    );


    render();

  }

}


/* =========================================================
   BULK
   ========================================================= */

async function bulk(
  check
) {

  if (!currentId) {

    toast(
      'กรุณาเลือกงานศพก่อน',
      'err'
    );

    return;

  }


  if (
    !needAdmin()
  ) {

    return;

  }


  const got =
    receivedSet();


  const list =
    filteredMembers();


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
        ? 'สมาชิกที่แสดงรับข้าวครบแล้ว'
        : 'ไม่มีรายการรับข้าวให้ล้าง',
      'info'
    );

    return;

  }


  const actionText =
    check
      ? 'บันทึกรับข้าว'
      : 'ล้างการรับข้าว';


  const ok =
    window.confirm(

      `${actionText} ${targets.length} ครัวเรือนหรือไม่?`

    );


  if (!ok) {
    return;
  }


  try {

    /*
      Firestore Batch จำกัด 500 operations
      ใช้ 400 เพื่อเผื่อความปลอดภัย
    */

    for (
      let i = 0;
      i < targets.length;
      i += 400
    ) {

      const batch =
        writeBatch(
          db
        );


      const chunk =
        targets.slice(
          i,
          i + 400
        );


      chunk.forEach(
        member => {

          if (check) {

            const ref =
              doc(
                collection(
                  db,
                  'riceRecords'
                )
              );


            batch.set(
              ref,
              {

                funeralId:
                  currentId,

                memberId:
                  member.id,

                houseNo:
                  member.houseNo ||
                  '',

                memberName:
                  member.name ||
                  '',

                amount:
                  1,

                recordedAt:
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

            const record =
              recordsForCurrentFuneral()
                .find(
                  item =>
                    item.memberId ===
                    member.id
                );


            if (record) {

              batch.delete(
                doc(
                  db,
                  'riceRecords',
                  record.id
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
        ? 'ติ๊กรับข้าวทั้งหมด'
        : 'ล้างรับข้าวทั้งหมด',

      `งานศพ ${currentFuneralName()} | ${targets.length} รายการ`

    );


    toast(
      `${actionText} ${targets.length} รายการเรียบร้อย`,
      'ok'
    );

  } catch (error) {

    console.error(
      'bulk:',
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

function exportCSV() {

  if (!currentId) {

    toast(
      'กรุณาเลือกงานศพก่อน',
      'err'
    );

    return;

  }


  const funeral =
    funerals.find(
      item =>
        item.id ===
        currentId
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
      'ลำดับ',
      'บ้านเลขที่',
      'ชื่อ-สกุล',
      'สถานะ',
      'วันที่รับข้าว',
      'ผู้บันทึก'
    ]

  ];


  members.forEach(
    (
      member,
      index
    ) => {

      const record =
        recordsForCurrentFuneral()
          .find(
            item =>
              item.memberId ===
              member.id
          );


      let date =
        '';


      if (
        record?.recordedAt
      ) {

        const d =
          record.recordedAt
            ?.toDate
              ? record.recordedAt.toDate()
              : new Date(
                  record.recordedAt
                );


        if (
          !Number.isNaN(
            d.getTime()
          )
        ) {

          date =
            d.toLocaleString(
              'th-TH'
            );

        }

      }


      rows.push([

        index + 1,

        member.houseNo ||
          '',

        member.name ||
          '',

        got.has(member.id)
          ? 'รับแล้ว'
          : 'ค้างส่ง',

        date,

        record?.recordedBy ||
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

    `รับข้าว_${safeName}_${funeral.cremationDate || ''}.csv`,

    rows

  );


  toast(
    'ส่งออกข้อมูล CSV เรียบร้อย',
    'ok'
  );

}


/* =========================================================
   EVENTS
   ========================================================= */

function bindEvents() {

  $('#riceGrid')?.addEventListener(
    'click',
    event => {

      const card =
        event.target.closest(
          '.rice-card'
        );


      if (!card) {
        return;
      }


      toggle(
        card.dataset.id
      );

    }
  );


  $('#riceGrid')?.addEventListener(
    'keydown',
    event => {

      if (
        event.key !==
          'Enter' &&
        event.key !==
          ' '
      ) {

        return;

      }


      const card =
        event.target.closest(
          '.rice-card'
        );


      if (!card) {
        return;
      }


      event.preventDefault();


      toggle(
        card.dataset.id
      );

    }
  );


  $('#funeralSelect')?.addEventListener(
    'change',
    event => {

      currentId =
        event.target.value ||
        null;


      render();

    }
  );


  $('#searchInput')?.addEventListener(
    'input',
    render
  );


  $('#filterStatus')?.addEventListener(
    'change',
    render
  );


  $('#btnCheckAll')?.addEventListener(
    'click',
    () =>
      bulk(true)
  );


  $('#btnClearAll')?.addEventListener(
    'click',
    () =>
      bulk(false)
  );


  $('#btnExport')?.addEventListener(
    'click',
    exportCSV
  );

}


/* =========================================================
   CURRENT FUNERAL NAME
   ========================================================= */

function currentFuneralName() {

  return (

    funerals.find(
      funeral =>
        funeral.id ===
        currentId
    )?.name

    ||

    '-'

  );

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
