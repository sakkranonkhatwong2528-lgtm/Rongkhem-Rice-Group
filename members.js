```javascript
/* =========================================================
   MEMBERS.JS
   ระบบจัดการสมาชิกกลุ่มข้าวสาร
   บ้านร่องเข็ม หมู่ที่ 6
   Firebase Firestore
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
   STATE
   ========================================================= */

let members = [];

let unsubscribe = null;


/* =========================================================
   DOM
   ========================================================= */

const table =
  document.getElementById(
    'memberTable'
  ) ||
  document.querySelector(
    'tbody'
  );

const search =
  document.getElementById(
    'memberSearch'
  ) ||
  document.getElementById(
    'searchInput'
  );

const statusFilter =
  document.getElementById(
    'memberStatus'
  ) ||
  document.getElementById(
    'filterStatus'
  );

const addButton =
  document.getElementById(
    'btnAddMember'
  ) ||
  document.getElementById(
    'addMemberBtn'
  );


/* =========================================================
   START
   ========================================================= */

guard(() => {

  startClock();

  listenMembers();

  bindEvents();

});


/* =========================================================
   FIRESTORE
   ========================================================= */

function listenMembers() {

  unsubscribe?.();


  unsubscribe =
    onSnapshot(

      collection(
        db,
        'members'
      ),

      snapshot => {

        members =
          snapshot.docs.map(
            d => ({
              id: d.id,
              ...d.data()
            })
          );


        sortMembers();

        render();

        updateSummary();

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
   EVENTS
   ========================================================= */

function bindEvents() {

  addButton?.addEventListener(
    'click',
    () => {

      if (!needAdmin()) {
        return;
      }


      openMemberForm();

    }
  );


  search?.addEventListener(
    'input',
    render
  );


  statusFilter?.addEventListener(
    'change',
    render
  );

}


/* =========================================================
   SORT
   ========================================================= */

function sortMembers() {

  members.sort(
    (a, b) => {

      return houseOf(a)
        .localeCompare(
          houseOf(b),
          'th',
          {
            numeric: true
          }
        );

    }
  );

}


/* =========================================================
   HELPERS
   ========================================================= */

function houseOf(member) {

  return String(

    member.houseNo ??
    member.house ??
    member.houseNumber ??
    ''

  );

}


function nameOf(member) {

  return String(

    member.name ??
    member.fullName ??
    member.memberName ??
    ''

  );

}


function phoneOf(member) {

  return String(

    member.phone ??
    member.tel ??
    member.mobile ??
    ''

  );

}


function statusOf(member) {

  if (
    member.active === false
  ) {

    return 'inactive';

  }


  const status =
    String(
      member.status ??
      'active'
    )
      .toLowerCase()
      .trim();


  if (
    status === 'inactive' ||
    status === 'พักสมาชิก' ||
    status === 'พัก'
  ) {

    return 'inactive';

  }


  return 'active';

}


function statusText(member) {

  return statusOf(member) ===
    'active'

    ? 'เป็นสมาชิก'

    : 'พักสมาชิก';

}


/* =========================================================
   FILTER
   ========================================================= */

function filteredMembers() {

  const keyword =
    String(
      search?.value || ''
    )
      .toLowerCase()
      .trim();


  const status =
    statusFilter?.value ||
    'all';


  return members.filter(
    member => {

      const text = [

        houseOf(member),

        nameOf(member),

        phoneOf(member),

        member.note || ''

      ]
        .join(' ')
        .toLowerCase();


      const searchHit =
        !keyword ||
        text.includes(keyword);


      const statusHit =
        status === 'all' ||
        statusOf(member) ===
          status;


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

  if (!table) {
    return;
  }


  const list =
    filteredMembers();


  if (!list.length) {

    table.innerHTML = `

      <tr>

        <td
          colspan="10"
          style="
            text-align:center;
            padding:40px 20px;
            color:#888;
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
            ไม่พบข้อมูลสมาชิก
          </div>

        </td>

      </tr>

    `;


    return;

  }


  /*
    รองรับทั้ง tbody
    และ container ที่เป็น div
  */

  if (
    table.tagName ===
    'TBODY'
  ) {

    table.innerHTML =
      list
        .map(
          member =>
            tableRow(
              member
            )
        )
        .join('');

  } else {

    table.innerHTML =
      list
        .map(
          member =>
            memberCard(
              member
            )
        )
        .join('');

  }

}


/* =========================================================
   TABLE ROW
   ========================================================= */

function tableRow(
  member
) {

  const status =
    statusOf(member);


  const overdue =
    Number(
      member.overdue ??
      member.overdueCount ??
      0
    );


  return `

    <tr>

      <td>
        ${esc(
          houseOf(member) ||
          '-'
        )}
      </td>


      <td>
        <strong>
          ${esc(
            nameOf(member) ||
            '-'
          )}
        </strong>
      </td>


      <td>
        ${esc(
          phoneOf(member) ||
          '-'
        )}
      </td>


      <td>

        <span
          class="status-badge ${
            status === 'active'
              ? 'active'
              : 'inactive'
          }"
        >

          ${
            status === 'active'
              ? 'เป็นสมาชิก'
              : 'พักสมาชิก'
          }

        </span>

      </td>


      <td>

        <span
          class="${
            overdue >= 2
              ? 'text-danger'
              : ''
          }"
        >

          ${overdue}

        </span>

      </td>


      ${
        state.isAdmin
          ? `

            <td>

              <div
                class="member-actions"
              >

                <button
                  type="button"
                  class="btn-edit-member"
                  data-id="${esc(
                    member.id
                  )}"
                  title="แก้ไข"
                >

                  <i
                    class="fa-solid fa-pen"
                  ></i>

                </button>


                <button
                  type="button"
                  class="btn-delete-member"
                  data-id="${esc(
                    member.id
                  )}"
                  title="ลบ"
                >

                  <i
                    class="fa-solid fa-trash"
                  ></i>

                </button>

              </div>

            </td>

          `
          : ''
      }

    </tr>

  `;

}


/* =========================================================
   CARD
   ========================================================= */

function memberCard(
  member
) {

  return `

    <div
      class="member-card"
      data-id="${esc(
        member.id
      )}"
    >

      <div>

        <strong>

          บ้านเลขที่
          ${esc(
            houseOf(member)
          )}

        </strong>


        <div>
          ${esc(
            nameOf(member)
          )}
        </div>


        <small>

          ${esc(
            phoneOf(member) ||
            'ไม่มีเบอร์โทรศัพท์'
          )}

        </small>

      </div>


      <span>

        ${esc(
          statusText(member)
        )}

      </span>


      ${
        state.isAdmin
          ? `

            <div>

              <button
                type="button"
                class="btn-edit-member"
                data-id="${esc(
                  member.id
                )}"
              >
                แก้ไข
              </button>


              <button
                type="button"
                class="btn-delete-member"
                data-id="${esc(
                  member.id
                )}"
              >
                ลบ
              </button>

            </div>

          `
          : ''
      }

    </div>

  `;

}


/* =========================================================
   ACTION EVENTS
   ========================================================= */

table?.addEventListener(
  'click',
  event => {

    const edit =
      event.target.closest(
        '.btn-edit-member'
      );


    if (edit) {

      if (!needAdmin()) {
        return;
      }


      const member =
        members.find(
          item =>
            item.id ===
            edit.dataset.id
        );


      if (member) {

        openMemberForm(
          member
        );

      }


      return;

    }


    const remove =
      event.target.closest(
        '.btn-delete-member'
      );


    if (remove) {

      if (!needAdmin()) {
        return;
      }


      const member =
        members.find(
          item =>
            item.id ===
            remove.dataset.id
        );


      if (member) {

        deleteMember(
          member
        );

      }

    }

  }
);


/* =========================================================
   FORM
   ========================================================= */

function openMemberForm(
  member = {}
) {

  const editing =
    Boolean(
      member.id
    );


  const html = `

    <div class="form-group">

      <label>
        บ้านเลขที่ *
      </label>

      <input
        id="memberHouse"
        type="text"
        maxlength="30"
        value="${esc(
          houseOf(member)
        )}"
        placeholder="เช่น 123"
      >

    </div>


    <div class="form-group">

      <label>
        ชื่อ-สกุล *
      </label>

      <input
        id="memberName"
        type="text"
        maxlength="200"
        value="${esc(
          nameOf(member)
        )}"
        placeholder="ชื่อสมาชิก"
      >

    </div>


    <div class="form-group">

      <label>
        เบอร์โทรศัพท์
      </label>

      <input
        id="memberPhone"
        type="tel"
        maxlength="30"
        value="${esc(
          phoneOf(member)
        )}"
        placeholder="เบอร์โทรศัพท์"
      >

    </div>


    <div class="form-group">

      <label>
        สถานะ
      </label>

      <select
        id="memberStatusInput"
      >

        <option
          value="active"
          ${
            statusOf(member) ===
            'active'
              ? 'selected'
              : ''
          }
        >
          เป็นสมาชิก
        </option>


        <option
          value="inactive"
          ${
            statusOf(member) ===
            'inactive'
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
        หมายเหตุ
      </label>

      <textarea
        id="memberNote"
        rows="4"
        maxlength="1000"
        placeholder="หมายเหตุเพิ่มเติม"
      >${esc(
        member.note ||
        ''
      )}</textarea>

    </div>

  `;


  /*
    ใช้ modal ที่ระบบเดิมมี
  */

  if (
    typeof window.openModal ===
    'function'
  ) {

    window.openModal(

      editing
        ? 'แก้ไขสมาชิก'
        : 'เพิ่มสมาชิก',

      html,

      async () => {

        await saveMember(
          member.id ||
          null
        );

      },

      editing
        ? 'บันทึกการแก้ไข'
        : 'เพิ่มสมาชิก'

    );


    return;

  }


  /*
    fallback modal
  */

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

          ${
            editing
              ? 'แก้ไขสมาชิก'
              : 'เพิ่มสมาชิก'
          }

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
              : 'เพิ่มสมาชิก'
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

          await saveMember(
            member.id ||
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
   SAVE MEMBER
   ========================================================= */

async function saveMember(
  id
) {

  if (!needAdmin()) {

    throw new Error(
      'ไม่มีสิทธิ์จัดการสมาชิก'
    );

  }


  const house =
    document
      .getElementById(
        'memberHouse'
      )
      ?.value
      .trim();


  const name =
    document
      .getElementById(
        'memberName'
      )
      ?.value
      .trim();


  const phone =
    document
      .getElementById(
        'memberPhone'
      )
      ?.value
      .trim();


  const status =
    document
      .getElementById(
        'memberStatusInput'
      )
      ?.value ||
    'active';


  const note =
    document
      .getElementById(
        'memberNote'
      )
      ?.value
      .trim();


  if (!house) {

    throw new Error(
      'กรุณากรอกบ้านเลขที่'
    );

  }


  if (!name) {

    throw new Error(
      'กรุณากรอกชื่อสมาชิก'
    );

  }


  /*
    ป้องกันบ้านเลขที่ซ้ำ
    แต่ยอมให้แก้สมาชิกเดิมได้
  */

  const duplicate =
    members.find(
      member =>

        houseOf(member) ===
        house &&

        member.id !== id

    );


  if (duplicate) {

    throw new Error(
      `บ้านเลขที่ ${house} มีอยู่ในระบบแล้ว`
    );

  }


  const data = {

    houseNo:
      house,

    house:
      house,

    name:
      name,

    fullName:
      name,

    phone:
      phone,

    status:
      status,

    active:
      status === 'active',

    note:
      note,

    overdue:
      Number(
        members.find(
          member =>
            member.id === id
        )?.overdue ??
        0
      ),

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
        'members',
        id
      ),

      data

    );


    await logAct(

      'แก้ไขสมาชิก',

      `บ้านเลขที่ ${house} ${name}`

    );


    toast(
      'แก้ไขสมาชิกสำเร็จ',
      'ok'
    );

  } else {

    await addDoc(

      collection(
        db,
        'members'
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

      'เพิ่มสมาชิก',

      `บ้านเลขที่ ${house} ${name}`

    );


    toast(
      'เพิ่มสมาชิกสำเร็จ',
      'ok'
    );

  }

}


/* =========================================================
   DELETE MEMBER
   ========================================================= */

async function deleteMember(
  member
) {

  if (!needAdmin()) {
    return;
  }


  const house =
    houseOf(member);


  const name =
    nameOf(member);


  const confirmed =
    window.confirm(

      `ต้องการลบสมาชิก\n\n` +

      `บ้านเลขที่ ${house}\n` +

      `${name}\n\n` +

      `ออกจากระบบหรือไม่?\n\n` +

      `การลบสมาชิกจะไม่ลบประวัติการรับข้าว`

    );


  if (!confirmed) {
    return;
  }


  try {

    await deleteDoc(

      doc(
        db,
        'members',
        member.id
      )

    );


    await logAct(

      'ลบสมาชิก',

      `บ้านเลขที่ ${house} ${name}`

    );


    toast(
      'ลบสมาชิกสำเร็จ',
      'ok'
    );

  } catch (error) {

    console.error(
      'Delete member:',
      error
    );


    toast(
      error?.message ||
      'ลบสมาชิกไม่สำเร็จ',
      'err'
    );

  }

}


/* =========================================================
   SUMMARY
   ========================================================= */

function updateSummary() {

  const total =
    members.length;


  const active =
    members.filter(
      member =>
        statusOf(member) ===
        'active'
    ).length;


  const inactive =
    total -
    active;


  const overdue =
    members.filter(
      member =>
        Number(
          member.overdue ??
          member.overdueCount ??
          0
        ) >= 2
    ).length;


  setNumber(
    'totalMembers',
    total
  );


  setNumber(
    'activeMembers',
    active
  );


  setNumber(
    'inactiveMembers',
    inactive
  );


  setNumber(
    'overdueMembers',
    overdue
  );

}


/* =========================================================
   NUMBER
   ========================================================= */

function setNumber(
  id,
  value
) {

  const element =
    document.getElementById(
      id
    );


  if (element) {

    element.textContent =
      Number(value)
        .toLocaleString(
          'th-TH'
        );

  }

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
