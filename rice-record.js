import { db, collection, doc, addDoc, deleteDoc, onSnapshot, query, orderBy,
  writeBatch, serverTimestamp, state,
  $, esc, thDate, toast, guard, needAdmin, startClock, downloadCSV, logAct }
  from './common.js';

let members = [], funerals = [], records = [], currentId = null, busy = new Set();

guard(() => { startClock(); listen(); });

function listen() {
  onSnapshot(query(collection(db,'members'), orderBy('houseNo')), s => {
    members = s.docs.map(d => ({ id:d.id, ...d.data() })).filter(m => m.active !== false);
    render();
  });
  onSnapshot(query(collection(db,'funerals'), orderBy('cremationDate','desc')), s => {
    funerals = s.docs.map(d => ({ id:d.id, ...d.data() }));
    const keep = currentId;
    $('#funeralSelect').innerHTML = funerals.map(f =>
      `<option value="${f.id}">${esc(f.name)} — ${thDate(f.cremationDate)}${
        f.status==='active' ? ' (กำลังดำเนินการ)' : ''}</option>`).join('')
      || '<option value="">— ยังไม่มีงานศพ —</option>';
    currentId = (keep && funerals.some(f=>f.id===keep)) ? keep
      : (funerals.find(f=>f.status==='active')?.id || funerals[0]?.id || null);
    if (currentId) $('#funeralSelect').value = currentId;
    render();
  });
  onSnapshot(collection(db,'riceRecords'), s => {
    records = s.docs.map(d => ({ id:d.id, ...d.data() }));
    render();
  });
}

const recOf  = () => records.filter(r => r.funeralId === currentId);
const gotSet = () => new Set(recOf().map(r => r.memberId));

function filtered() {
  const k = ($('#searchInput').value||'').toLowerCase().trim();
  const f = $('#filterStatus').value, got = gotSet();
  return members.filter(m => {
    const hit = !k || `${m.houseNo} ${m.name}`.toLowerCase().includes(k);
    const st  = f==='all' || (f==='got' ? got.has(m.id) : !got.has(m.id));
    return hit && st;
  });
}

function render() {
  const got = gotSet(), total = members.length;
  const n = got.size, pct = total ? Math.round(n/total*100) : 0;
  $('#rGot').textContent = n;
  $('#rPending').textContent = Math.max(0, total-n);
  $('#rPct').textContent = pct + '%';
  $('#rBar').style.width = pct + '%';

  const list = filtered();
  $('#riceGrid').innerHTML = list.map(m => {
    const on = got.has(m.id);
    return `<div class="rice-card ${on?'on':''} ${busy.has(m.id)?'busy':''}" data-id="${m.id}">
      <div class="rice-check"><i class="fa-solid ${on?'fa-circle-check':'fa-circle'}"></i></div>
      <div class="rice-info">
        <strong>บ้านเลขที่ ${esc(m.houseNo)}</strong>
        <span>${esc(m.name)}</span>
      </div>
      <span class="pill ${on?'on':'off'}">${on?'รับแล้ว':'ค้างส่ง'}</span>
    </div>`;
  }).join('') || '<p class="empty-box">ไม่พบรายชื่อสมาชิก</p>';
  $('#countText').textContent = `แสดง ${list.length} จาก ${total} ครัวเรือน`;
}

/* ---------- TOGGLE ---------- */
async function toggle(memberId) {
  if (!currentId) return toast('กรุณาเลือกงานศพก่อน','err');
  if (!needAdmin() || busy.has(memberId)) return;
  const m = members.find(x => x.id === memberId);
  const exist = recOf().find(r => r.memberId === memberId);
  busy.add(memberId); render();
  try {
    if (exist) {
      await deleteDoc(doc(db,'riceRecords', exist.id));
      logAct('ยกเลิกรับข้าว', `${m.houseNo} ${m.name}`);
    } else {
      await addDoc(collection(db,'riceRecords'), {
        funeralId: currentId, memberId: m.id, houseNo: m.houseNo,
        memberName: m.name, amount: 1,
        recordedAt: serverTimestamp(),
        recordedBy: state.user?.email || '-' });
      logAct('บันทึกรับข้าว', `${m.houseNo} ${m.name}`);
    }
  } catch { toast('บันทึกไม่สำเร็จ','err'); }
  finally { busy.delete(memberId); render(); }
}

/* ---------- BULK ---------- */
async function bulk(check) {
  if (!currentId || !needAdmin()) return;
  const got = gotSet(), list = filtered();
  const targets = list.filter(m => check ? !got.has(m.id) : got.has(m.id));
  if (!targets.length) return toast('ไม่มีรายการต้องเปลี่ยน');
  for (let i=0; i<targets.length; i+=400) {
    const b = writeBatch(db);
    targets.slice(i,i+400).forEach(m => {
      if (check) b.set(doc(collection(db,'riceRecords')), {
        funeralId: currentId, memberId: m.id, houseNo: m.houseNo,
        memberName: m.name, amount: 1, recordedAt: serverTimestamp(),
        recordedBy: state.user?.email || '-' });
      else {
        const r = recOf().find(x => x.memberId === m.id);
        if (r) b.delete(doc(db,'riceRecords', r.id));
      }
    });
    await b.commit();
  }
  logAct(check?'ติ๊กรับข้าวทั้งหมด':'ล้างรับข้าวทั้งหมด', `${targets.length} รายการ`);
  toast(`${check?'บันทึก':'ล้าง'} ${targets.length} รายการเรียบร้อย`);
}

/* ---------- EVENTS ---------- */
$('#riceGrid').onclick = e => {
  const c = e.target.closest('.rice-card'); if (c) toggle(c.dataset.id);
};
$('#funeralSelect').onchange = e => { currentId = e.target.value; render(); };
$('#searchInput').oninput = render;
$('#filterStatus').onchange = render;
$('#btnCheckAll').onclick = () => bulk(true);
$('#btnClearAll').onclick = () => bulk(false);
$('#btnExport').onclick = () => {
  const f = funerals.find(x=>x.id===currentId); if (!f) return toast('ไม่มีข้อมูล','err');
  const got = gotSet();
  const rows = [['บ้านเลขที่','ชื่อ-สกุล','สถานะ']];
  members.forEach(m => rows.push([m.houseNo, m.name, got.has(m.id)?'รับแล้ว':'ค้างส่ง']));
  downloadCSV(`รับข้าว_${f.name}_${f.cremationDate}.csv`, rows);
  toast('ส่งออกไฟล์แล้ว');
};
