```javascript
/* =========================================================
   MEMBERS.JS
   ทะเบียนสมาชิกกลุ่มข้าวสาร
   บ้านร่องเข็ม หมู่ที่ 6
   Firebase Firestore
   ========================================================= */

import {
  db,
  state,
  guard,
  needAdmin,
  toast,
  esc,
  formatNumber,
  downloadCSV,
  parseCSV,
  logAct,
  startClock,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from './common.js';


/* =========================================================
   STATE
   ========================================================= */

let members = [];

let currentFilter = 'all';

let searchText = '';

let currentPage = 1;

const pageSize = 20;

let editTargetId = null;

let deleteTargetId = null;

let unsubscribeMembers = null;


/* =========================================================
   DOM
   ========================================================= */

const tbody =
  document.getElementById('memberTbody');

const searchInput =
  document.getElementById('searchInput');

const filterStatus =
  document.getElementById('filterStatus');

const btnAdd =
  document.getElementById('btnAdd');

const btnImport =
  document.getElementById('btnImport');

const btnExport =
  document.getElementById('btnExport');

const csvFile =
  document.getElementById('csvFile');

const prevPage =
  document.getElementById('prevPage');

const nextPage =
  document.getElementById('nextPage');

const pageText =
  document.getElementById('pageText');

const countText =
  document.getElementById('countText');


/* =========================================================
   FIRESTORE
   ========================================================= */

const membersCollection =
  collection(db, 'members');


/* =========================================================
   NORMALIZE MEMBER
   รองรับชื่อ field หลายแบบจากข้อมูลเก่า
   ========================================================= */

function normalizeMember(id, data) {

  return {

    id,

    house:
      String(
        data.house ??
        data.houseNo ??
        data.houseNumber ??
        ''
      ),

    name:
      String(
        data.name ??
        data.fullName ??
        data.memberName ??
        ''
      ),

    phone:
      String(
        data.phone ??
        data.tel ??
        data.mobile ??
        ''
      ),

    status:
      normalizeStatus(
        data.status
      ),

    overdue:
      Number(
        data.overdue ??
        data.overdueCount ??
        0
      ),

    createdAt:
      data.createdAt ?? null,

    updatedAt:
      data.updatedAt ?? null

  };

}


/* =========================================================
   STATUS
   ========================================================= */

function normalizeStatus(status) {

  const value =
    String(status ?? '')
      .toLowerCase()
      .trim();


  if (
    value === 'inactive' ||
    value === 'พักสมาชิก' ||
    value === 'พัก' ||
    value === 'disabled'
  ) {

    return 'inactive';

  }


  return 'active';

}


/* =========================================================
   LISTEN FIRESTORE
   ========================================================= */

function listenMembers() {

  if (unsubscribeMembers) {
    unsubscribeMembers();
  }


  unsubscribeMembers =
    onSnapshot(

      membersCollection,

      snapshot => {

        members =
          snapshot.docs.map(
            item =>
              normalizeMember(
                item.id,
                item.data()
              )
          );


        sortMembers();

        currentPage = 1;

        renderSummary();

        renderMembers();

      },

      error => {

        console.error(
          'Firestore members error:',
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
   SORT
   ========================================================= */

function sortMembers() {

  members.sort(
    (a, b) => {

      const ah =
        String(a.house)
          .localeCompare(
            String(b.house),
            'th',
            {
              numeric: true
            }
          );

      if (ah !== 0) {
        return ah;
      }

      return String(a.name)
        .localeCompare(
          String(b.name),
          'th'
        );

    }
  );

}


/* =========================================================
   FILTER
   ========================================================= */

function getFilteredMembers() {

  const keyword =
    searchText
      .toLowerCase()
      .trim();


  return members.filter(
    member => {

      const matchStatus =
        currentFilter === 'all' ||
        member.status === currentFilter;


      const matchSearch =
        !keyword ||

        member.house
          .toLowerCase()
          .includes(keyword) ||

        member.name
          .toLowerCase()
          .includes(keyword) ||

        member.phone
          .toLowerCase()
          .includes(keyword);


      return (
        matchStatus &&
        matchSearch
      );

    }
  );

}


/* =========================================================
   SUMMARY
   ========================================================= */

function renderSummary() {

  const total =
    members.length;


  const active =
    members.filter(
      m => m.status === 'active'
    ).length;


  const inactive =
    members.filter(
      m => m.status === 'inactive'
    ).length;


  const houses =
    new Set(
      members
        .map(m => m.house)
        .filter(Boolean)
    ).size;


  setText(
    'sTotal',
    formatNumber(total)
  );


  setText(
    'sActive',
    formatNumber(active)
  );


  setText(
    'sInactive',
    formatNumber(inactive)
  );


  setText(
    'sHouse',
    formatNumber(houses)
  );

}


/* =========================================================
   RENDER TABLE
   ========================================================= */

function renderMembers() {

  if (!tbody) return;


  const filtered =
    getFilteredMembers();


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
        pageSize
      )
    );


  if (currentPage > totalPages) {
    currentPage = totalPages;
  }


  const start =
    (currentPage - 1) *
    pageSize;


  const pageItems =
    filtered.slice(
      start,
      start + pageSize
    );


  tbody.innerHTML = '';


  if (!pageItems.length) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="6"
          style="
            text-align:center;
            padding:40px 20px;
            color:#777;
          "
        >

          <i
            class="fa-solid fa-users-slash"
            style="
              font-size:32px;
              margin-bottom:10px;
              display:block;
            "
          ></i>

          ไม่พบข้อมูลสมาชิก

        </td>

      </tr>

    `;

  } else {

    pageItems.forEach(
      (member, index) => {

        const tr =
          document.createElement('tr');


        const number =
          start + index + 1;


        const status =
          member.status === 'active'

            ? `
              <span class="status-pill paid">
                <i class="fa-solid fa-check"></i>
                ใช้งานอยู่
              </span>
            `

            : `
              <span class="status-pill pending">
                <i class="fa-solid fa-pause"></i>
                พักสมาชิก
              </span>
            `;


        tr.innerHTML = `

          <td>
            ${number}
          </td>

          <td>
            <strong>
              ${esc(member.house || '-')}
            </strong>
          </td>

          <td>
            ${esc(member.name || '-')}
          </td>

          <td>
            ${
              member.phone
                ? esc(member.phone)
                : '-'
            }
          </td>

          <td>
            ${status}
          </td>

          <td class="admin-only">

            ${
              state.isAdmin

                ? `

                  <button
                    type="button"
                    class="icon-btn edit"
                    data-id="${member.id}"
                    title="แก้ไข"
                  >
                    <i class="fa-solid fa-pen"></i>
                  </button>

                  <button
                    type="button"
                    class="icon-btn delete"
                    data-id="${member.id}"
                    title="ลบ"
                  >
                    <i class="fa-solid fa-trash"></i>
                  </button>

                `

                : ''

            }

          </td>

        `;


        tbody.appendChild(tr);

      }
    );

  }


  updatePager(
    filtered.length,
    totalPages
  );


  attachRowEvents();

}


/* =========================================================
   PAGER
   ========================================================= */

function updatePager(
  totalItems,
  totalPages
) {

  if (countText) {

    const start =
      totalItems === 0
        ? 0
        : (
          (currentPage - 1) *
          pageSize
        ) + 1;


    const end =
      Math.min(
        currentPage * pageSize,
        totalItems
      );


    countText.textContent =
      totalItems === 0

        ? 'แสดง 0 รายการ'

        : `แสดง ${start}-${end} จาก ${totalItems} รายการ`;

  }


  if (pageText) {

    pageText.textContent =
      `${currentPage} / ${totalPages}`;

  }


  if (prevPage) {

    prevPage.disabled =
      currentPage <= 1;

  }


  if (nextPage) {

    nextPage.disabled =
      currentPage >= totalPages;

  }

}


/* =========================================================
   ROW EVENTS
   ========================================================= */

function attachRowEvents() {

  document
    .querySelectorAll(
      '.icon-btn.edit'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            if (!needAdmin()) {
              return;
            }


            openEditModal(
              button.dataset.id
            );

          }
        );

      }
    );


  document
    .querySelectorAll(
      '.icon-btn.delete'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            if (!needAdmin()) {
              return;
            }


            openDeleteModal(
              button.dataset.id
            );

          }
        );

      }
    );

}


/* =========================================================
   ADD / EDIT MODAL
   ========================================================= */

function openMemberModal(
  member = null
) {

  if (!needAdmin()) {
    return;
  }


  editTargetId =
    member?.id || null;


  const title =
    member
      ? 'แก้ไขข้อมูลสมาชิก'
      : 'เพิ่มสมาชิกใหม่';


  const html = `

    <div class="form-grid">

      <div class="form-group">

        <label>
          บ้านเลขที่
        </label>

        <input
          id="memberHouse"
          type="text"
          value="${esc(member?.house || '')}"
          placeholder="เช่น 123"
          autocomplete="off"
        >

      </div>


      <div class="form-group">

        <label>
          ชื่อ-สกุล
        </label>

        <input
          id="memberName"
          type="text"
          value="${esc(member?.name || '')}"
          placeholder="กรอกชื่อ-สกุล"
          autocomplete="off"
        >

      </div>


      <div class="form-group">

        <label>
          เบอร์โทรศัพท์
        </label>

        <input
          id="memberPhone"
          type="tel"
          value="${esc(member?.phone || '')}"
          placeholder="เช่น 0812345678"
          autocomplete="tel"
        >

      </div>


      <div class="form-group">

        <label>
          สถานะสมาชิก
        </label>

        <select id="memberStatus">

          <option
            value="active"
            ${
              !member ||
              member.status === 'active'
                ? 'selected'
                : ''
            }
          >
            ใช้งานอยู่
          </option>

          <option
            value="inactive"
            ${
              member?.status === 'inactive'
                ? 'selected'
                : ''
            }
          >
            พักสมาชิก
          </option>

        </select>

      </div>


      <div class="form-group">

        <label>
          ค้างส่งข้าวกี่ครั้ง
        </label>

        <input
          id="memberOverdue"
          type="number"
          min="0"
          step="1"
          value="${Number(member?.overdue || 0)}"
        >

      </div>

    </div>

  `;


  import('./common.js')
    .then(({ openModal }) => {

      openModal(

        title,

        html,

        async () => {

          await saveMember();

        },

        member
          ? 'บันทึกการแก้ไข'
          : 'เพิ่มสมาชิก'

      );

    });

}


/* =========================================================
   SAVE MEMBER
   ========================================================= */

async function saveMember() {

  if (!needAdmin()) {
    throw new Error(
      'ไม่มีสิทธิ์แก้ไขข้อมูล'
    );
  }


  const house =
    document
      .getElementById('memberHouse')
      ?.value
      .trim();


  const name =
    document
      .getElementById('memberName')
      ?.value
      .trim();


  const phone =
    document
      .getElementById('memberPhone')
      ?.value
      .trim();


  const status =
    document
      .getElementById('memberStatus')
      ?.value || 'active';


  const overdue =
    Math.max(
      0,
      parseInt(
        document
          .getElementById('memberOverdue')
          ?.value || 0,
        10
      )
    );


  if (!house) {

    throw new Error(
      'กรุณากรอกบ้านเลขที่'
    );

  }


  if (!name) {

    throw new Error(
      'กรุณากรอกชื่อ-สกุล'
    );

  }


  const duplicate =
    members.find(
      member =>
        member.house === house &&
        member.id !== editTargetId
    );


  if (duplicate) {

    throw new Error(
      `บ้านเลขที่ ${house} มีอยู่ในระบบแล้ว`
    );

  }


  const data = {

    house,

    name,

    phone,

    status,

    overdue,

    updatedAt:
      serverTimestamp()

  };


  if (editTargetId) {

    await updateDoc(

      doc(
        db,
        'members',
        editTargetId
      ),

      data

    );


    await logAct(
      'แก้ไขสมาชิก',
      `แก้ไข ${name} บ้านเลขที่ ${house}`
    );


    toast(
      'แก้ไขข้อมูลสมาชิกสำเร็จ',
      'ok'
    );

  } else {

    data.createdAt =
      serverTimestamp();


    const created =
      await addDoc(
        membersCollection,
        data
      );


    await logAct(
      'เพิ่มสมาชิก',
      `เพิ่ม ${name} บ้านเลขที่ ${house}`
    );


    console.log(
      'Created member:',
      created.id
    );


    toast(
      'เพิ่มสมาชิกใหม่สำเร็จ',
      'ok'
    );

  }


  editTargetId = null;

}


/* =========================================================
   DELETE
   ========================================================= */

function openDeleteModal(id) {

  if (!needAdmin()) {
    return;
  }


  const member =
    members.find(
      item => item.id === id
    );


  if (!member) {

    toast(
      'ไม่พบข้อมูลสมาชิก',
      'err'
    );

    return;

  }


  deleteTargetId =
    id;


  import('./common.js')
    .then(({ openModal }) => {

      openModal(

        'ยืนยันการลบสมาชิก',

        `

          <div style="
            line-height:1.8;
            text-align:center;
          ">

            <div style="
              font-size:48px;
              margin-bottom:10px;
            ">
              ⚠️
            </div>

            <strong>
              ต้องการลบสมาชิกคนนี้หรือไม่?
            </strong>

            <div style="
              margin-top:15px;
              padding:15px;
              background:#f6f7f8;
              border-radius:10px;
            ">

              บ้านเลขที่
              <strong>
                ${esc(member.house)}
              </strong>

              <br>

              ${esc(member.name)}

              ${
                member.phone
                  ? `<br>${esc(member.phone)}`
                  : ''
              }

            </div>

            <p style="
              color:#b42318;
              margin-top:15px;
            ">
              การลบข้อมูลจะไม่สามารถย้อนกลับได้
            </p>

          </div>

        `,

        async () => {

          await deleteMember();

        },

        'ยืนยันการลบ'

      );

    });

}


/* =========================================================
   DELETE MEMBER
   ========================================================= */

async function deleteMember() {

  if (!needAdmin()) {
    throw new Error(
      'ไม่มีสิทธิ์ลบข้อมูล'
    );
  }


  const member =
    members.find(
      item =>
        item.id === deleteTargetId
    );


  if (!member) {

    throw new Error(
      'ไม่พบข้อมูลสมาชิก'
    );

  }


  await deleteDoc(

    doc(
      db,
      'members',
      deleteTargetId
    )

  );


  await logAct(
    'ลบสมาชิก',
    `ลบ ${member.name} บ้านเลขที่ ${member.house}`
  );


  deleteTargetId = null;


  toast(
    'ลบสมาชิกเรียบร้อยแล้ว',
    'ok'
  );

}


/* =========================================================
   SEARCH
   ========================================================= */

if (searchInput) {

  searchInput.addEventListener(
    'input',
    event => {

      searchText =
        event.target.value;

      currentPage = 1;

      renderMembers();

    }
  );

}


/* =========================================================
   FILTER
   ========================================================= */

if (filterStatus) {

  filterStatus.addEventListener(
    'change',
    event => {

      currentFilter =
        event.target.value;

      currentPage = 1;

      renderMembers();

    }
  );

}


/* =========================================================
   ADD BUTTON
   ========================================================= */

if (btnAdd) {

  btnAdd.addEventListener(
    'click',
    () => {

      if (!needAdmin()) {
        return;
      }


      openMemberModal();

    }
  );

}


/* =========================================================
   PREVIOUS PAGE
   ========================================================= */

if (prevPage) {

  prevPage.addEventListener(
    'click',
    () => {

      if (currentPage > 1) {

        currentPage--;

        renderMembers();

      }

    }
  );

}


/* =========================================================
   NEXT PAGE
   ========================================================= */

if (nextPage) {

  nextPage.addEventListener(
    'click',
    () => {

      const total =
        getFilteredMembers().length;


      const totalPages =
        Math.max(
          1,
          Math.ceil(
            total /
            pageSize
          )
        );


      if (
        currentPage <
        totalPages
      ) {

        currentPage++;

        renderMembers();

      }

    }
  );

}


/* =========================================================
   EXPORT CSV
   ========================================================= */

if (btnExport) {

  btnExport.addEventListener(
    'click',
    () => {

      if (!needAdmin()) {
        return;
      }


      const rows = [

        [
          'บ้านเลขที่',
          'ชื่อ-สกุล',
          'เบอร์โทร',
          'สถานะ',
          'ค้างส่ง'
        ]

      ];


      members.forEach(
        member => {

          rows.push([

            member.house,

            member.name,

            member.phone,

            member.status === 'active'
              ? 'ใช้งานอยู่'
              : 'พักสมาชิก',

            member.overdue

          ]);

        }
      );


      const filename =
        `สมาชิกกลุ่มข้าวสาร_${new Date()
          .toISOString()
          .slice(0,10)}.csv`;


      downloadCSV(
        filename,
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
   IMPORT CSV
   ========================================================= */

if (btnImport) {

  btnImport.addEventListener(
    'click',
    () => {

      if (!needAdmin()) {
        return;
      }


      csvFile?.click();

    }
  );

}


if (csvFile) {

  csvFile.addEventListener(
    'change',
    async event => {

      const file =
        event.target.files?.[0];


      if (!file) {
        return;
      }


      try {

        await importCSV(
          file
        );

      } catch (error) {

        console.error(
          error
        );


        toast(
          error.message ||
          'นำเข้า CSV ไม่สำเร็จ',
          'err'
        );

      } finally {

        event.target.value = '';

      }

    }
  );

}


/* =========================================================
   IMPORT CSV
   ========================================================= */

async function importCSV(file) {

  if (!needAdmin()) {
    return;
  }


  const text =
    await file.text();


  const rows =
    parseCSV(text);


  if (!rows.length) {

    throw new Error(
      'ไฟล์ CSV ไม่มีข้อมูล'
    );

  }


  /*
    รองรับหัวตาราง:
    บ้านเลขที่
    ชื่อ-สกุล
    เบอร์โทร
    สถานะ
    ค้างส่ง
  */


  const header =
    rows[0].map(
      item =>
        String(item)
          .replace(/^\uFEFF/, '')
          .trim()
    );


  const findColumn = (
    names
  ) => {

    const index =
      header.findIndex(
        item =>
          names.includes(item)
      );

    return index;

  };


  const houseIndex =
    findColumn([
      'บ้านเลขที่',
      'บ้าน',
      'house',
      'houseNo'
    ]);


  const nameIndex =
    findColumn([
      'ชื่อ-สกุล',
      'ชื่อ',
      'name',
      'fullName'
    ]);


  const phoneIndex =
    findColumn([
      'เบอร์โทร',
      'โทรศัพท์',
      'phone',
      'tel'
    ]);


  const statusIndex =
    findColumn([
      'สถานะ',
      'status'
    ]);


  const overdueIndex =
    findColumn([
      'ค้างส่ง',
      'ค้างส่งกี่ครั้ง',
      'overdue'
    ]);


  if (
    houseIndex < 0 ||
    nameIndex < 0
  ) {

    throw new Error(
      'CSV ต้องมีคอลัมน์ บ้านเลขที่ และ ชื่อ-สกุล'
    );

  }


  const validRows =
    rows
      .slice(1)
      .map(row => {

        const house =
          String(
            row[houseIndex] || ''
          ).trim();


        const name =
          String(
            row[nameIndex] || ''
          ).trim();


        const phone =
          phoneIndex >= 0
            ? String(
                row[phoneIndex] || ''
              ).trim()
            : '';


        const rawStatus =
          statusIndex >= 0
            ? String(
                row[statusIndex] || ''
              ).trim()
            : 'active';


        const overdue =
          overdueIndex >= 0
            ? Math.max(
                0,
                parseInt(
                  row[overdueIndex] || 0,
                  10
                ) || 0
              )
            : 0;


        if (!house || !name) {
          return null;
        }


        return {

          house,

          name,

          phone,

          status:
            normalizeStatus(
              rawStatus
            ),

          overdue,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()

        };

      })
      .filter(Boolean);


  if (!validRows.length) {

    throw new Error(
      'ไม่พบแถวข้อมูลที่ถูกต้องใน CSV'
    );

  }


  /*
    ป้องกันการเพิ่มบ้านเลขที่ซ้ำ
  */

  const existingHouses =
    new Set(
      members.map(
        member => member.house
      )
    );


  const newRows =
    validRows.filter(
      row =>
        !existingHouses.has(
          row.house
        )
    );


  if (!newRows.length) {

    throw new Error(
      'ข้อมูลใน CSV มีบ้านเลขที่ที่อยู่ในระบบทั้งหมดแล้ว'
    );

  }


  /*
    Firestore batch สูงสุด 500 รายการ
    แบ่งเป็นชุดละ 450
  */

  for (
    let i = 0;
    i < newRows.length;
    i += 450
  ) {

    const batchRows =
      newRows.slice(
        i,
        i + 450
      );


    const batch =
      writeBatch(
        db
      );


    batchRows.forEach(
      row => {

        const ref =
          doc(
            membersCollection
          );


        batch.set(
          ref,
          row
        );

      }
    );


    await batch.commit();

  }


  await logAct(
    'นำเข้าสมาชิก CSV',
    `นำเข้าสมาชิกใหม่ ${newRows.length} รายการ`
  );


  toast(
    `นำเข้าสำเร็จ ${newRows.length} รายการ`,
    'ok'
  );

}


/* =========================================================
   HELPER SET TEXT
   ========================================================= */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      value;

  }

}


/* =========================================================
   START
   ========================================================= */

guard(
  async () => {

    startClock();

    listenMembers();

    renderSummary();

    renderMembers();

  }
);
```
