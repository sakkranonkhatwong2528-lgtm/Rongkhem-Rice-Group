/* =========================================================
   SCRIPT.JS
   หน้าแรกระบบกลุ่มข้าวสาร
   บ้านร่องเข็ม หมู่ที่ 6
   Firebase Firestore จริง
   ========================================================= */

import {
  db,
  state,
  guard,
  needAdmin,
  $,
  $$,
  esc,
  thDate,
  toast,
  startClock,
  collection,
  onSnapshot
} from './common.js';


/* =========================================================
   DATA
   ========================================================= */

let members = [];
let funerals = [];
let records = [];
let announcements = [];

let unsubMembers = null;
let unsubFunerals = null;
let unsubRecords = null;
let unsubAnnouncements = null;


/* =========================================================
   START
   ========================================================= */

guard(() => {

  startClock();

  initNavigation();

  initDashboard();

  initAnnouncements();

  initActionButtons();

});


/* =========================================================
   DASHBOARD
   ========================================================= */

function initDashboard() {

  listenMembers();

  listenFunerals();

  listenRecords();

}


/* =========================================================
   MEMBERS
   ========================================================= */

function listenMembers() {

  unsubMembers?.();


  unsubMembers =
    onSnapshot(

      collection(
        db,
        'members'
      ),

      snapshot => {

        members =
          snapshot.docs
            .map(d => ({
              id: d.id,
              ...d.data()
            }))
            .filter(isActiveMember);


        sortMembers();

        renderMemberSummary();

        renderOverdueMembers();

        renderFuneralProgress();

      },

      error => {

        console.error(
          'Members:',
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

  unsubFunerals?.();


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


        renderFuneralCount();

        renderCurrentFuneral();

        renderLatestFunerals();

        renderFuneralProgress();

      },

      error => {

        console.error(
          'Funerals:',
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


        renderCurrentFuneral();

        renderLatestFunerals();

        renderFuneralProgress();

      },

      error => {

        console.error(
          'Rice Records:',
          error
        );

        toast(
          'โหลดข้อมูลรับข้าวไม่สำเร็จ',
          'err'
        );

      }

    );

}


/* =========================================================
   ANNOUNCEMENTS
   ========================================================= */

function initAnnouncements() {

  unsubAnnouncements?.();


  unsubAnnouncements =
    onSnapshot(

      collection(
        db,
        'announcements'
      ),

      snapshot => {

        announcements =
          snapshot.docs.map(
            d => ({
              id: d.id,
              ...d.data()
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


        renderNotifications();

        renderAnnouncements();

      },

      error => {

        console.error(
          'Announcements:',
          error
        );

        /*
          ไม่ทำให้หน้าเว็บพัง
          หาก collection ยังไม่มี
        */

        renderNotifications();

        renderAnnouncements();

      }

    );

}


/* =========================================================
   MEMBER HELPERS
   ========================================================= */

function isActiveMember(member) {

  if (
    member.active === false
  ) {

    return false;

  }


  const status =
    String(
      member.status ?? ''
    )
      .toLowerCase()
      .trim();


  if (
    status === 'inactive' ||
    status === 'พักสมาชิก' ||
    status === 'พัก'
  ) {

    return false;

  }


  return true;

}


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
   CURRENT FUNERAL
   ========================================================= */

function getCurrentFuneral() {

  return (

    funerals.find(
      funeral =>
        funeral.status === 'active'
    )

    ||

    funerals[0]

    ||

    null

  );

}


/* =========================================================
   RECEIVED
   ========================================================= */

function getReceivedForFuneral(
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


/* =========================================================
   MEMBER SUMMARY
   ========================================================= */

function renderMemberSummary() {

  const total =
    members.length;


  setText(
    'totalMembers',
    total
  );


  setText(
    'totalMembersSmall',
    total
  );

}


/* =========================================================
   FUNERAL COUNT
   ========================================================= */

function renderFuneralCount() {

  setText(
    'totalFunerals',
    funerals.length
  );

}


/* =========================================================
   CURRENT FUNERAL
   ========================================================= */

function renderCurrentFuneral() {

  const funeral =
    getCurrentFuneral();


  const body =
    document.querySelector(
      '.funeral-current-card .funeral-body'
    );


  if (!body) {
    return;
  }


  if (!funeral) {

    body.innerHTML = `

      <div
        style="
          width:100%;
          padding:35px 20px;
          text-align:center;
        "
      >

        <i
          class="fa-solid fa-dove"
          style="
            font-size:42px;
            color:#aaa;
            margin-bottom:12px;
          "
        ></i>

        <h2>
          ขณะนี้ไม่มีงานศพที่กำลังดำเนินการ
        </h2>

        <p
          style="
            color:#888;
            margin-top:8px;
          "
        >
          เมื่อมีการแจ้งงานศพ
          ข้อมูลจะแสดงที่หน้านี้
        </p>

      </div>

    `;


    setText(
      'receivedCount',
      0
    );


    setText(
      'totalMembersSmall',
      members.length
    );


    setText(
      'percentNumber',
      0
    );


    updateProgressCircle(0);

    return;

  }


  const photo =
    funeral.photoURL ||
    'https://placehold.co/220x260/e8e0d0/555?text=รูปผู้เสียชีวิต';


  body.innerHTML = `

    <div class="funeral-photo">

      <img
        src="${esc(photo)}"
        alt="${esc(
          funeral.name ||
          'ผู้เสียชีวิต'
        )}"
        onerror="
          this.src='https://placehold.co/220x260/e8e0d0/555?text=ไม่มีรูป'
        "
      >

    </div>


    <div class="funeral-info">

      <h2>
        ${esc(
          funeral.name ||
          '-'
        )}
      </h2>


      ${
        funeral.age
          ? `
            <p class="funeral-age">
              อายุ ${esc(funeral.age)} ปี
            </p>
          `
          : ''
      }


      <p class="funeral-date">

        <i
          class="fa-solid fa-calendar"
        ></i>

        ฌาปนกิจ :
        ${esc(
          thaiDateLong(
            funeral.cremationDate
          )
        )}

      </p>


      <p class="funeral-place">

        <i
          class="fa-solid fa-location-dot"
        ></i>

        ${esc(
          funeral.place ||
          '-'
        )}

      </p>


      <div class="condolence-box">

        🕊️ ขอแสดงความอาลัย
        และร่วมไว้อาลัยเป็นครั้งสุดท้าย 🕊️

      </div>

    </div>

  `;


  const received =
    getReceivedForFuneral(
      funeral.id
    ).size;


  const total =
    members.length;


  const percent =
    total > 0

      ? Math.round(
          received /
          total *
          100
        )

      : 0;


  setText(
    'receivedCount',
    received
  );


  setText(
    'totalMembersSmall',
    total
  );


  setText(
    'percentNumber',
    percent
  );


  updateProgressCircle(
    percent
  );

}


/* =========================================================
   PROGRESS CIRCLE
   ========================================================= */

function updateProgressCircle(
  percent
) {

  const circle =
    document.querySelector(
      '.progress-ring .fill'
    );


  if (!circle) {
    return;
  }


  const radius = 46;

  const circumference =
    2 *
    Math.PI *
    radius;


  circle.style.strokeDasharray =
    `${circumference} ${circumference}`;


  circle.style.strokeDashoffset =
    circumference -
    (
      percent /
      100
    ) *
    circumference;


  circle.dataset.percent =
    percent;

}


/* =========================================================
   FUNERAL PROGRESS
   ========================================================= */

function renderFuneralProgress() {

  const funeral =
    getCurrentFuneral();


  if (!funeral) {

    setText(
      'receivedSummary',
      0
    );


    setText(
      'pendingCount',
      members.length
    );


    setText(
      'percentNumber',
      0
    );


    updateProgressCircle(0);

    return;

  }


  const received =
    getReceivedForFuneral(
      funeral.id
    ).size;


  const total =
    members.length;


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


  setText(
    'receivedCount',
    received
  );


  setText(
    'receivedSummary',
    received
  );


  setText(
    'pendingCount',
    pending
  );


  setText(
    'percentNumber',
    percent
  );


  updateProgressCircle(
    percent
  );

}


/* =========================================================
   LATEST FUNERALS
   ========================================================= */

function renderLatestFunerals() {

  const container =
    document.querySelector(
      '.funeral-thumb-list'
    );


  if (!container) {
    return;
  }


  const latest =
    funerals.slice(
      0,
      3
    );


  if (!latest.length) {

    container.innerHTML = `

      <div
        style="
          text-align:center;
          padding:30px;
          color:#888;
        "
      >
        ยังไม่มีข้อมูลงานศพ
      </div>

    `;


    return;

  }


  container.innerHTML =
    latest
      .map(
        funeral =>
          renderFuneralThumb(
            funeral
          )
      )
      .join('');

}


/* =========================================================
   FUNERAL THUMB
   ========================================================= */

function renderFuneralThumb(
  funeral
) {

  const received =
    getReceivedForFuneral(
      funeral.id
    ).size;


  const total =
    members.length;


  const percent =
    total > 0

      ? Math.round(
          received /
          total *
          100
        )

      : 0;


  const photo =
    funeral.photoURL ||
    'https://placehold.co/90x90/e8e0d0/555?text=รูป';


  return `

    <div class="funeral-thumb-card">

      <img
        src="${esc(photo)}"
        alt="${esc(funeral.name || '')}"
        onerror="
          this.src='https://placehold.co/90x90/e8e0d0/555?text=รูป'
        "
      >


      <div class="thumb-info">

        <strong>
          ${esc(
            funeral.name ||
            '-'
          )}
        </strong>


        <span>
          ฌาปนกิจ
          ${esc(
            formatShortDate(
              funeral.cremationDate
            )
          )}
        </span>


        <span>
          รับแล้ว ${received}
          ครัวเรือน
          จากทั้งหมด ${total}
          ครัวเรือน
        </span>


        <div class="progress-bar">

          <div
            class="progress-fill"
            style="
              width:${percent}%;
            "
          ></div>

        </div>


        <span class="progress-percent">

          ${percent}%

        </span>

      </div>

    </div>

  `;

}


/* =========================================================
   OVERDUE MEMBERS
   ========================================================= */

function renderOverdueMembers() {

  const section =
    document.querySelector(
      '.card .section-title-bar.red + .list-simple'
    );


  if (!section) {
    return;
  }


  const overdue =
    members
      .filter(
        member => {

          const count =
            Number(
              member.overdue ??
              member.overdueCount ??
              0
            );


          return count >= 2;

        }
      )
      .sort(
        (a, b) =>
          Number(
            b.overdue ??
            b.overdueCount ??
            0
          )
          -
          Number(
            a.overdue ??
            a.overdueCount ??
            0
          )
      )
      .slice(0, 5);


  if (!overdue.length) {

    section.innerHTML = `

      <div
        style="
          text-align:center;
          padding:25px;
          color:#888;
        "
      >

        <i
          class="fa-solid fa-circle-check"
        ></i>

        ไม่มีสมาชิกค้างส่งเกิน 2 ครั้ง

      </div>

    `;


    return;

  }


  section.innerHTML =
    overdue
      .map(
        member => {

          const count =
            Number(
              member.overdue ??
              member.overdueCount ??
              0
            );


          return `

            <div class="list-item">

              <div class="avatar-circle">

                <i
                  class="fa-solid fa-user"
                ></i>

              </div>


              <div class="list-item-text">

                <strong>

                  บ้านเลขที่
                  ${esc(
                    houseOf(member)
                  )}

                  &nbsp;

                  ${esc(
                    nameOf(member)
                  )}

                </strong>

              </div>


              <span
                class="tag-overdue ${
                  count >= 3
                    ? 'urgent'
                    : ''
                }"
              >

                ค้างส่ง
                ${count}
                ครั้ง

              </span>

            </div>

          `;

        }
      )
      .join('');

}


/* =========================================================
   ANNOUNCEMENTS
   ========================================================= */

function renderAnnouncements() {

  const containers =
    document.querySelectorAll(
      '.section-title-bar.red + .list-simple'
    );


  /*
    ตัวแรกคือประกาศ
    ตัวที่สองคือสมาชิกค้างส่ง
  */

  if (!containers.length) {
    return;
  }


  const announcementBox =
    containers[0];


  if (!announcementBox) {
    return;
  }


  const latest =
    announcements.slice(
      0,
      3
    );


  if (!latest.length) {

    announcementBox.innerHTML = `

      <div
        style="
          text-align:center;
          padding:25px;
          color:#888;
        "
      >
        ยังไม่มีประกาศ
      </div>

    `;


    return;

  }


  announcementBox.innerHTML =
    latest
      .map(
        announcement =>
          `

            <div class="list-item">

              <i
                class="fa-solid fa-bullhorn icon-red"
              ></i>


              <div class="list-item-text">

                <strong>

                  ${esc(
                    announcement.title ||
                    announcement.name ||
                    'ประกาศ'
                  )}

                </strong>


                <span>

                  ${esc(
                    announcement.message ||
                    announcement.content ||
                    announcement.detail ||
                    ''
                  )}

                </span>

              </div>


              <span class="list-date">

                ${formatAnnouncementDate(
                  announcement.createdAt ||
                  announcement.date
                )}

              </span>

            </div>

          `
      )
      .join('');

}


/* =========================================================
   NOTIFICATION BELL
   ========================================================= */

function renderNotifications() {

  const badge =
    $('#notifCount');


  if (badge) {

    badge.textContent =
      announcements.length;

  }


  const dropdown =
    $('#notifDropdown');


  if (!dropdown) {
    return;
  }


  const latest =
    announcements.slice(
      0,
      5
    );


  dropdown.innerHTML = `

    <div class="notif-head">

      การแจ้งเตือน

    </div>

    ${
      latest.length

        ? latest
            .map(
              announcement =>
                `

                  <div class="notif-item">

                    <i
                      class="fa-solid fa-bullhorn"
                    ></i>

                    <div>

                      <strong>

                        ${esc(
                          announcement.title ||
                          announcement.name ||
                          'ประกาศ'
                        )}

                      </strong>

                      <span>

                        ${formatAnnouncementDate(
                          announcement.createdAt ||
                          announcement.date
                        )}

                      </span>

                    </div>

                  </div>

                `
            )
            .join('')

        : `

          <div
            style="
              padding:20px;
              text-align:center;
              color:#888;
            "
          >

            ไม่มีประกาศ

          </div>

        `
    }

  `;

}


/* =========================================================
   NAVIGATION
   ========================================================= */

function initNavigation() {

  $$('.menu-item').forEach(
    item => {

      item.addEventListener(
        'click',
        event => {

          event.preventDefault();


          const page =
            item.dataset.page;


          navigatePage(
            page
          );

        }
      );

    }
  );


  $$('.link-all').forEach(
    link => {

      link.addEventListener(
        'click',
        event => {

          event.preventDefault();

          const text =
            link.textContent
              .trim();


          if (
            text.includes(
              'ประกาศ'
            )
          ) {

            navigatePage(
              'announcements'
            );

          } else if (
            text.includes(
              'สมาชิก'
            )
          ) {

            navigatePage(
              'members'
            );

          } else {

            navigatePage(
              'history'
            );

          }

        }
      );

    }
  );

}


/* =========================================================
   NAVIGATE
   ========================================================= */

function navigatePage(
  page
) {

  const pages = {

    home:
      'index.html',

    'current-funeral':
      'current-funeral.html',

    members:
      'members.html',

    'rice-record':
      'rice-record.html',

    history:
      'history.html',

    announcements:
      'announcements.html',

    reports:
      'reports.html',

    settings:
      'settings.html'

  };


  const url =
    pages[page];


  if (!url) {
    return;
  }


  if (
    page === 'settings' &&
    !state.isAdmin
  ) {

    needAdmin();

    return;

  }


  location.href =
    url;

}


/* =========================================================
   ACTION BUTTONS
   ========================================================= */

function initActionButtons() {

  const buttons =
    document.querySelectorAll(
      '.action-bar .action-btn'
    );


  if (buttons[0]) {

    buttons[0].addEventListener(
      'click',
      () => {

        if (!needAdmin()) {
          return;
        }


        navigatePage(
          'current-funeral'
        );

      }
    );

  }


  if (buttons[1]) {

    buttons[1].addEventListener(
      'click',
      () => {

        navigatePage(
          'rice-record'
        );

      }
    );

  }


  if (buttons[2]) {

    buttons[2].addEventListener(
      'click',
      () => {

        if (!needAdmin()) {
          return;
        }


        navigatePage(
          'members'
        );

      }
    );

  }


  if (buttons[3]) {

    buttons[3].addEventListener(
      'click',
      () => {

        navigatePage(
          'reports'
        );

      }
    );

  }


  if (buttons[4]) {

    buttons[4].addEventListener(
      'click',
      () => {

        if (!needAdmin()) {
          return;
        }


        navigatePage(
          'announcements'
        );

      }
    );

  }


  const detail =
    document.querySelector(
      '.btn-detail'
    );


  detail?.addEventListener(
    'click',
    () => {

      navigatePage(
        'rice-record'
      );

    }
  );

}


/* =========================================================
   TEXT
   ========================================================= */

function setText(
  id,
  value
) {

  const element =
    document.getElementById(id);


  if (element) {

    element.textContent =
      Number(value)
        .toLocaleString(
          'th-TH'
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


function formatShortDate(
  value
) {

  if (!value) {
    return '-';
  }


  const d =
    toDate(value);


  if (!d) {
    return '-';
  }


  return d.toLocaleDateString(
    'th-TH',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }
  );

}


function thaiDateLong(
  value
) {

  if (!value) {
    return '-';
  }


  const d =
    toDate(value);


  if (!d) {
    return '-';
  }


  return d.toLocaleDateString(
    'th-TH',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }
  );

}


function formatAnnouncementDate(
  value
) {

  if (!value) {
    return '-';
  }


  const d =
    toDate(value);


  if (!d) {
    return '-';
  }


  return d.toLocaleDateString(
    'th-TH',
    {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }
  );

}


function toDate(
  value
) {

  if (
    value &&
    typeof value.toDate === 'function'
  ) {

    return value.toDate();

  }


  const d =
    new Date(value);


  return Number.isNaN(
    d.getTime()
  )
    ? null
    : d;

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

    unsubAnnouncements?.();

  }
);
