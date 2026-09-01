import { db, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, writeBatch, serverTimestamp,
  $, esc, thDate, toast, openModal, confirmDel, guard, needAdmin, startClock,
  uploadPhoto, removePhoto, downloadCSV, logAct } from './common.js';

let members = [], funerals = [], records = [];

guard(() => { startClock(); listen(); });

function listen() {
  onSnapshot(query(collection(db,'members'), orderBy('houseNo')), s => {
    members = s.docs.map(d=>({id:d.id,...d.data()})).filter(m=>m.active!==false); render();
  });
  onSnapshot(query(collection(db,'funerals'), orderBy('cremationDate','desc')), s => {
    funerals = s.docs.map(d=>({id:d.id,...d.data()}));
    const years = [...new Set(funerals.map(f => new Date(f.cremationDate).getFullYear()+543))]
      .sort((a,b)=>b-a);
    const cur = $('#filterYear').value;
    $('#filterYear').innerHTML = '<option value="all">ทุกปี</option>' +
      years.map(y => `<option value="${y}">พ.ศ. ${y}</option>`).join('');
    if (cur) $('#filterYear').value = cur;
    render();
  });
  onSnapshot(collection(db,'riceRecords'), s => {
    records = s.docs.map(d=>({id:d.id,...d.data()})); render();
  });
}

const recOf = fid => records.filter(r => r.funeralId === fid);

function render() {
  const k = ($('#searchInput').value||'').toLowerCase().trim();
  const y = $('#filterYear').value, st = $('#filterStatus').value;
  const total = members.length || 1;

  const list = funerals.filter(f => {
    const okK = !k || (f.name||'').toLowerCase().includes(k);
    const okY = y==='all' || (new Date(f.cremationDate).getFullYear()+543) == y;
    const okS = st==='all' || (f.status||'done') === st;
    return okK && okY && okS;
  });

  $('#timeline').innerHTML = list.map(f => {
    const n = recOf(f.id).length, pct = Math.round(n/total*100);
    return `<div class="tl-item">
      <div class="tl-dot ${f.status==='active'?'live':''}"></div>
      <div class="tl-card">
        <img src="${f.photoURL || 'https://placehold.co/90x110/e8e0d0/555?text=รูป'}" alt="">
        <div class="tl-info">
          <div class="tl-head">
            <strong>${esc(f.name)}</strong>
            <span class="pill ${f.status==='active'?'on':'off'}">
              ${f.status==='active'?'กำลังดำเนินการ':'เสร็จสิ้น'}</span>
          </div>
          <span class="tl-meta"><i class="fa-solid fa-calendar"></i> ฌาปนกิจ ${thDate(f.cremationDate)}
            ${f.age ? ` · อายุ ${esc(f.age)} ปี` : ''}</span>
          <span class="tl-meta"><i class="fa-solid fa-location-dot"></i> ${esc(f.place)||'-'}</span>
          <span class="tl-meta"><i class="fa-solid fa-bowl-rice"></i>
            รับแล้ว <strong>${n}</strong> จาก ${total} ครัวเรือน</span>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <span class="progress-percent">${pct}%</span>
        </div>
        <div class="tl-actions">
          <button class="icon-btn" data-view="${f.id}" title="ดูรายชื่อ"><i class="fa-solid fa-eye"></i></button>
          <button class="icon-btn" data-csv="${f.id}" title="ส่งออก"><i class="fa-solid fa-file-export"></i></button>
          <button class="icon-btn edit admin-only" data-edit="${f.id}"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn del admin-only"  data-del="${f.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>`;
  }).join('') || '<p class="empty-box">ไม่พบข้อมูลงานศพ</p>';
}

/* ---------- DETAIL ---------- */
function viewDetail(fid) {
  const f = funerals.find(x=>x.id===fid);
  const got = new Set(recOf(fid).map(r=>r.memberId));
  const html = `
    <p style="margin:0 0 10px"><strong>${esc(f.name)}</strong> · ${thDate(f.cremationDate)}</p>
    <input id="dSearch" placeholder="ค้นหา..." style="width:100%;padding:10px;border:1px solid #ddd;border-radius:10px;margin-bottom:10px">
    <div id="dList">${members.map(m => `
      <div class="check-row" data-key="${esc(m.houseNo)} ${esc(m.name)}">
        <i class="fa-solid ${got.has(m.id)?'fa-circle-check':'fa-circle-xmark'}"
           style="color:${got.has(m.id)?'#2e7d32':'#e57373'}"></i>
        <span>บ้านเลขที่ ${esc(m.houseNo)} — ${esc(m.name)}</span>
      </div>`).join('')}</div>`;
  openModal('รายชื่อการรับข้าว', html, null);
  $('#dSearch').oninput = e => {
    const k = e.target.value.toLowerCase();
    document.querySelectorAll('#dList .check-row').forEach(r =>
      r.style.display = r.dataset.key.toLowerCase().includes(k) ? '' : 'none');
  };
}

/* ---------- FORM (ใช้ร่วมกับ current-funeral) ---------- */
const form = (f={}) => `
  <div class="form-group"><label>ชื่อ-สกุลผู้เสียชีวิต *</label><input id="fName" value="${esc(f.name)}"></div>
  <div class="form-group"><label>อายุ (ปี)</label><input id="fAge" type="number" value="${esc(f.age)}"></div>
  <div class="form-group"><label>วันฌาปนกิจ *</label><input id="fDate" type="date" value="${f.cremationDate||''}"></div>
  <div class="form-group"><label>สถานที่</label>
    <input id="fPlace" value="${esc(f.place ?? 'วัดร่องเข็ม ต.จำป่าหวาย อ.เมืองพะเยา จ.พะเยา')}"></div>
  <div class="form-group"><label>หมายเหตุ</label><textarea id="fNote" rows="2">${esc(f.note)}</textarea></div>
  <div class="form-group"><label>สถานะ</label><select id="fStatus">
    <option value="active" ${f.status==='active'?'selected':''}>กำลังดำเนินการ</option>
    <option value="done"   ${f.status!=='active'?'selected':''}>เสร็จสิ้น</option></select></div>
  <div class="form-group"><label>รูปผู้เสียชีวิต</label>
    <input id="fPhoto" type="file" accept="image/*">
    ${f.photoURL ? `<img class="img-preview" src="${f.photoURL}">` : ''}</div>`;

async function save(id, old={}) {
  const name = $('#fName').value.trim(), date = $('#fDate').value;
  if (!name || !date) throw new Error('กรุณากรอกชื่อและวันฌาปนกิจ');
  const data = { name, age:Number($('#fAge').value)||null, cremationDate:date,
    place:$('#fPlace').value.trim(), note:$('#fNote').value.trim(),
    status:$('#fStatus').value, updatedAt: serverTimestamp() };
  const file = $('#fPhoto').files[0];
  if (file) {
    const up = await uploadPhoto(file, 'funerals');
    data.photoURL = up.url; data.photoPath = up.path;
    await removePhoto(old.photoPath);
  }
  if (data.status === 'active') {
    const b = writeBatch(db);
    funerals.filter(x => x.status==='active' && x.id!==id)
      .forEach(x => b.update(doc(db,'funerals',x.id), { status:'done' }));
    await b.commit();
  }
  if (id) { await updateDoc(doc(db,'funerals',id), data); logAct('แก้ไขงานศพ', name); }
  else { await addDoc(collection(db,'funerals'), {...data, createdAt:serverTimestamp()});
         logAct('แจ้งงานศพใหม่', name); }
  toast('บันทึกเรียบร้อย');
}

/* ---------- EVENTS ---------- */
$('#searchInput').oninput = render;
$('#filterYear').onchange = render;
$('#filterStatus').onchange = render;
$('#btnNew').onclick = () => needAdmin() &&
  openModal('แจ้งงานศพใหม่', form({status:'active'}), () => save(null));

document.addEventListener('click', e => {
  const b = e.target.closest('[data-view],[data-csv],[data-edit],[data-del]');
  if (!b) return;
  if (b.dataset.view) return viewDetail(b.dataset.view);
  if (b.dataset.csv) {
    const f = funerals.find(x=>x.id===b.dataset.csv);
    const got = new Set(recOf(f.id).map(r=>r.memberId));
    const rows = [['บ้านเลขที่','ชื่อ-สกุล','สถานะ']];
    members.forEach(m => rows.push([m.houseNo, m.name, got.has(m.id)?'รับแล้ว':'ค้างส่ง']));
    downloadCSV(`${f.name}_${f.cremationDate}.csv`, rows);
    return toast('ส่งออกไฟล์แล้ว');
  }
  if (!needAdmin()) return;
  if (b.dataset.edit) {
    const f = funerals.find(x=>x.id===b.dataset.edit);
    openModal('แก้ไขงานศพ', form(f), () => save(f.id, f));
  } else {
    const f = funerals.find(x=>x.id===b.dataset.del);
    confirmDel(`ลบงานศพ <strong>${esc(f.name)}</strong> และข้อมูลการรับข้าวทั้งหมด?`, async () => {
      const bt = writeBatch(db);
      recOf(f.id).forEach(r => bt.delete(doc(db,'riceRecords', r.id)));
      bt.delete(doc(db,'funerals', f.id));
      await bt.commit();
      await removePhoto(f.photoPath);
      logAct('ลบงานศพ', f.name);
    });
  }
});
