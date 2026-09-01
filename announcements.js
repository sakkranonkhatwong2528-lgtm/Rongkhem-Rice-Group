import { db, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, serverTimestamp,
  $, esc, thDate, toast, openModal, confirmDel, guard, needAdmin, startClock,
  uploadPhoto, removePhoto, logAct } from './common.js';

const TYPES = {
  general: { label:'ทั่วไป',    icon:'fa-circle-info',            color:'blue'   },
  meeting: { label:'ประชุม',    icon:'fa-people-group',           color:'green'  },
  fee:     { label:'เงินสมทบ',  icon:'fa-hand-holding-dollar',    color:'orange' },
  urgent:  { label:'ด่วน',      icon:'fa-triangle-exclamation',   color:'red'    }
};

let items = [];
guard(() => { startClock(); listen(); });

function listen() {
  onSnapshot(query(collection(db,'announcements'), orderBy('date','desc')), s => {
    items = s.docs.map(d => ({ id:d.id, ...d.data() }));
    render();
  });
}

function isNew(a) {
  if (!a.date) return false;
  return (Date.now() - new Date(a.date).getTime()) / 86400000 <= 7;
}

function render() {
  const k = ($('#searchInput').value||'').toLowerCase().trim();
  const t = $('#filterType').value, p = $('#filterPin').value;

  const list = items.filter(a => {
    const okK = !k || `${a.title} ${a.detail}`.toLowerCase().includes(k);
    const okT = t==='all' || (a.type||'general') === t;
    const okP = p==='all' || a.pinned === true;
    return okK && okT && okP;
  }).sort((a,b) => (b.pinned?1:0) - (a.pinned?1:0));

  $('#annList').innerHTML = list.map(a => {
    const ty = TYPES[a.type || 'general'];
    return `<article class="ann-card ${a.pinned?'pinned':''}">
      <div class="ann-icon ${ty.color}"><i class="fa-solid ${ty.icon}"></i></div>
      <div class="ann-body">
        <div class="ann-head">
          <h3>${esc(a.title)}</h3>
          ${a.pinned ? '<span class="pill pin"><i class="fa-solid fa-thumbtack"></i> ปักหมุด</span>' : ''}
          ${isNew(a) ? '<span class="tag-new">ใหม่</span>' : ''}
          <span class="pill ${ty.color}">${ty.label}</span>
        </div>
        <p class="ann-detail">${esc(a.detail).replace(/\n/g,'<br>')}</p>
        ${a.imageURL ? `<img class="ann-img" src="${a.imageURL}" alt="">` : ''}
        <div class="ann-foot">
          <span><i class="fa-regular fa-calendar"></i> ${thDate(a.date)}</span>
          ${a.by ? `<span><i class="fa-regular fa-user"></i> ${esc(a.by)}</span>` : ''}
        </div>
      </div>
      <div class="ann-actions admin-only">
        <button class="icon-btn" data-pin="${a.id}" title="ปักหมุด">
          <i class="fa-solid fa-thumbtack" style="color:${a.pinned?'#ef6c00':'#999'}"></i></button>
        <button class="icon-btn edit" data-edit="${a.id}"><i class="fa-solid fa-pen"></i></button>
        <button class="icon-btn del"  data-del="${a.id}"><i class="fa-solid fa-trash"></i></button>
      </div>
    </article>`;
  }).join('') || '<p class="empty-box">ยังไม่มีประกาศ</p>';

  $('#countText').textContent = `แสดง ${list.length} รายการ`;
}

/* ---------- FORM ---------- */
const form = (a={}) => `
  <div class="form-group"><label>หัวข้อประกาศ *</label>
    <input id="aTitle" value="${esc(a.title)}" placeholder="เช่น ประชุมสมาชิกประจำเดือน"></div>
  <div class="form-group"><label>รายละเอียด</label>
    <textarea id="aDetail" rows="4">${esc(a.detail)}</textarea></div>
  <div class="form-group"><label>ประเภท</label>
    <select id="aType">${Object.entries(TYPES).map(([k,v]) =>
      `<option value="${k}" ${(a.type||'general')===k?'selected':''}>${v.label}</option>`).join('')}
    </select></div>
  <div class="form-group"><label>วันที่ประกาศ *</label>
    <input id="aDate" type="date" value="${a.date || new Date().toISOString().slice(0,10)}"></div>
  <div class="form-group">
    <label><input type="checkbox" id="aPin" ${a.pinned?'checked':''}> ปักหมุดไว้ด้านบน</label></div>
  <div class="form-group"><label>รูปประกอบ (ถ้ามี)</label>
    <input id="aImg" type="file" accept="image/*">
    ${a.imageURL ? `<img class="img-preview" src="${a.imageURL}">` : ''}</div>`;

async function save(id, old={}) {
  const title = $('#aTitle').value.trim();
  const date  = $('#aDate').value;
  if (!title || !date) throw new Error('กรุณากรอกหัวข้อและวันที่');
  const data = {
    title, detail: $('#aDetail').value.trim(), type: $('#aType').value,
    date, pinned: $('#aPin').checked, updatedAt: serverTimestamp()
  };
  const file = $('#aImg').files[0];
  if (file) {
    const up = await uploadPhoto(file, 'announcements');
    data.imageURL = up.url; data.imagePath = up.path;
    await removePhoto(old.imagePath);
  }
  if (id) { await updateDoc(doc(db,'announcements',id), data); logAct('แก้ไขประกาศ', title); }
  else {
    await addDoc(collection(db,'announcements'),
      { ...data, by: (await import('./common.js')).state.profile?.name || '', createdAt: serverTimestamp() });
    logAct('เพิ่มประกาศ', title);
  }
  toast('บันทึกประกาศเรียบร้อย');
}

/* ---------- EVENTS ---------- */
$('#searchInput').oninput = render;
$('#filterType').onchange = render;
$('#filterPin').onchange  = render;
$('#btnNew').onclick = () => needAdmin() && openModal('เพิ่มประกาศใหม่', form(), () => save(null));

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-edit],[data-del],[data-pin]'); if (!b) return;
  if (!needAdmin()) return;
  if (b.dataset.pin) {
    const a = items.find(x=>x.id===b.dataset.pin);
    await updateDoc(doc(db,'announcements',a.id), { pinned: !a.pinned });
    toast(a.pinned ? 'ยกเลิกปักหมุดแล้ว' : 'ปักหมุดแล้ว');
  } else if (b.dataset.edit) {
    const a = items.find(x=>x.id===b.dataset.edit);
    openModal('แก้ไขประกาศ', form(a), () => save(a.id, a));
  } else {
    const a = items.find(x=>x.id===b.dataset.del);
    confirmDel(`ลบประกาศ <strong>${esc(a.title)}</strong>?`, async () => {
      await deleteDoc(doc(db,'announcements',a.id));
      await removePhoto(a.imagePath);
      logAct('ลบประกาศ', a.title);
    });
  }
});
