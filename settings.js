import { db, auth, collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, writeBatch, serverTimestamp, state,
  $, esc, thDate, toast, openModal, confirmDel, guard, needAdmin, startClock, logAct }
  from './common.js';
import { setDoc, limit }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { sendPasswordResetEmail }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const COLS = ['members','funerals','riceRecords','announcements','users'];
let users = [];

guard(async st => {
  startClock();
  fillProfile(st);
  if (st.isAdmin) { loadGroup(); listenUsers(); listenLog(); countDB(); }
});

/* ---------- TABS ---------- */
document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => {
  document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  $('#tab-' + b.dataset.tab).classList.add('active');
});

/* ---------- โปรไฟล์ ---------- */
function fillProfile(st) {
  $('#pName').value     = st.profile.name || '';
  $('#pPosition').value = st.profile.position || '';
  $('#pPhone').value    = st.profile.phone || '';
  $('#pEmail').value    = st.user.email || '';
}
$('#btnSaveProfile').onclick = async () => {
  const name = $('#pName').value.trim();
  if (!name) return toast('กรุณากรอกชื่อ','err');
  await setDoc(doc(db,'users',state.user.uid), {
    name, position: $('#pPosition').value.trim(),
    phone: $('#pPhone').value.trim(), email: state.user.email
  }, { merge:true });
  state.profile = { ...state.profile, name };
  toast('บันทึกโปรไฟล์เรียบร้อย');
};
$('#btnResetPw').onclick = async () => {
  try { await sendPasswordResetEmail(auth, state.user.email);
    toast('ส่งลิงก์เปลี่ยนรหัสผ่านไปที่อีเมลแล้ว'); }
  catch { toast('ส่งอีเมลไม่สำเร็จ','err'); }
};

/* ---------- ข้อมูลกลุ่ม ---------- */
const CFG = doc(db,'config','group');
async function loadGroup() {
  const s = await getDoc(CFG);
  const g = s.exists() ? s.data() : {};
  $('#gName').value    = g.name    ?? 'กลุ่มข้าวสาร บ้านร่องเข็ม หมู่ที่ 6';
  $('#gAddress').value = g.address ?? 'ต.จำป่าหวาย อ.เมืองพะเยา จ.พะเยา';
  $('#gPlace').value   = g.place   ?? 'วัดร่องเข็ม ต.จำป่าหวาย อ.เมืองพะเยา จ.พะเยา';
  $('#gRiceKg').value  = g.riceKg  ?? 1;
  $('#gOverdue').value = g.overdueLimit ?? 2;
}
$('#btnSaveGroup').onclick = async () => {
  if (!needAdmin()) return;
  await setDoc(CFG, {
    name: $('#gName').value.trim(), address: $('#gAddress').value.trim(),
    place: $('#gPlace').value.trim(), riceKg: Number($('#gRiceKg').value)||1,
    overdueLimit: Number($('#gOverdue').value)||2, updatedAt: serverTimestamp()
  }, { merge:true });
  logAct('แก้ไขข้อมูลกลุ่ม','-');
  toast('บันทึกข้อมูลกลุ่มเรียบร้อย');
};

/* ---------- ผู้ใช้งาน ---------- */
function listenUsers() {
  onSnapshot(collection(db,'users'), s => {
    users = s.docs.map(d => ({ id:d.id, ...d.data() }));
    $('#userTbody').innerHTML = users.map(u => `
      <tr>
        <td>${esc(u.name) || '-'}</td>
        <td>${esc(u.email) || '-'}</td>
        <td><span class="pill ${u.role==='admin'?'on':'off'}">
          ${u.role==='admin'?'ผู้ดูแลระบบ':'สมาชิก'}</span></td>
        <td><span class="pill ${u.active===false?'off':'on'}">
          ${u.active===false?'ระงับ':'ใช้งาน'}</span></td>
        <td><div class="row-actions">
          <button class="icon-btn edit" data-uedit="${u.id}"><i class="fa-solid fa-pen"></i></button>
          ${u.id !== state.user.uid
            ? `<button class="icon-btn del" data-udel="${u.id}"><i class="fa-solid fa-trash"></i></button>` : ''}
        </div></td>
      </tr>`).join('') || '<tr><td colspan="5" class="empty">ยังไม่มีผู้ใช้งาน</td></tr>';
  });
}

const userForm = (u={}, isNew=false) => `
  ${isNew ? `<div class="form-group"><label>UID จาก Firebase Authentication *</label>
    <input id="uUid" placeholder="เช่น a1B2c3D4..."></div>` : ''}
  <div class="form-group"><label>ชื่อ-สกุล *</label><input id="uName" value="${esc(u.name)}"></div>
  <div class="form-group"><label>อีเมล</label><input id="uEmail" value="${esc(u.email)}"></div>
  <div class="form-group"><label>ตำแหน่ง</label><input id="uPos" value="${esc(u.position)}"></div>
  <div class="form-group"><label>บทบาท</label><select id="uRole">
    <option value="member" ${u.role!=='admin'?'selected':''}>สมาชิก (ดูอย่างเดียว)</option>
    <option value="admin"  ${u.role==='admin'?'selected':''}>ผู้ดูแลระบบ (แก้ไขได้)</option>
  </select></div>
  <div class="form-group"><label>สถานะ</label><select id="uActive">
    <option value="true"  ${u.active!==false?'selected':''}>ใช้งาน</option>
    <option value="false" ${u.active===false?'selected':''}>ระงับการใช้งาน</option>
  </select></div>`;

async function saveUser(uid) {
  const id = uid || $('#uUid').value.trim();
  const name = $('#uName').value.trim();
  if (!id || !name) throw new Error('กรุณากรอก UID และชื่อ');
  await setDoc(doc(db,'users',id), {
    name, email: $('#uEmail').value.trim(), position: $('#uPos').value.trim(),
    role: $('#uRole').value, active: $('#uActive').value==='true',
    updatedAt: serverTimestamp()
  }, { merge:true });
  logAct(uid ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้', name);
  toast('บันทึกผู้ใช้เรียบร้อย');
}

$('#btnAddUser').onclick = () => needAdmin() &&
  openModal('เพิ่มสิทธิ์ผู้ใช้', userForm({}, true), () => saveUser(null));

document.addEventListener('click', e => {
  const b = e.target.closest('[data-uedit],[data-udel]'); if (!b) return;
  if (!needAdmin()) return;
  if (b.dataset.uedit) {
    const u = users.find(x=>x.id===b.dataset.uedit);
    openModal('แก้ไขผู้ใช้', userForm(u), () => saveUser(u.id));
  } else {
    const u = users.find(x=>x.id===b.dataset.udel);
    confirmDel(`ลบสิทธิ์ผู้ใช้ <strong>${esc(u.name)}</strong>?<br>
      <small style="color:#888">บัญชี Authentication ยังคงอยู่ ต้องลบใน Firebase Console</small>`,
      async () => { await deleteDoc(doc(db,'users',u.id)); logAct('ลบผู้ใช้', u.name); });
  }
});

/* ---------- สำรอง / กู้คืน ---------- */
async function countDB() {
  const out = [];
  for (const c of COLS) {
    const s = await getDocs(collection(db,c));
    out.push(`${c}: <strong>${s.size}</strong>`);
  }
  $('#dbStat').innerHTML = '<i class="fa-solid fa-database"></i> ' + out.join(' · ');
}

$('#btnBackup').onclick = async () => {
  if (!needAdmin()) return;
  toast('กำลังรวบรวมข้อมูล...');
  const dump = { exportedAt: new Date().toISOString(), data: {} };
  for (const c of COLS) {
    const s = await getDocs(collection(db,c));
    dump.data[c] = s.docs.map(d => ({ id:d.id, ...d.data() }));
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(dump,null,2)],
    { type:'application/json' }));
  a.download = `backup_ricegroup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  logAct('สำรองข้อมูล','-');
  toast('ดาวน์โหลดไฟล์สำรองแล้ว');
};

$('#btnRestore').onclick = () => needAdmin() && $('#jsonFile').click();
$('#jsonFile').onchange = async e => {
  const file = e.target.files[0]; if (!file) return;
  let dump;
  try { dump = JSON.parse(await file.text()); }
  catch { return toast('ไฟล์ไม่ถูกต้อง','err'); }
  const cols = Object.keys(dump.data || {});
  if (!cols.length) return toast('ไม่พบข้อมูลในไฟล์','err');

  openModal('ยืนยันการกู้คืน',
    `<p>พบข้อมูล: ${cols.map(c=>`${c} (${dump.data[c].length})`).join(', ')}</p>
     <p style="color:#c62828">⚠️ ระบบจะเขียนทับเอกสารที่มี ID ตรงกัน</p>`,
    async () => {
      for (const c of cols) {
        const rows = dump.data[c];
        for (let i=0; i<rows.length; i+=400) {
          const b = writeBatch(db);
          rows.slice(i,i+400).forEach(r => {
            const { id, ...rest } = r;
            b.set(doc(db,c,id), rest, { merge:true });
          });
          await b.commit();
        }
      }
      logAct('กู้คืนข้อมูล', cols.join(','));
      toast('กู้คืนข้อมูลเรียบร้อย');
      countDB();
    }, 'กู้คืน');
  e.target.value = '';
};

$('#btnClearRice').onclick = () => needAdmin() &&
  confirmDel('ลบข้อมูลการรับข้าวทั้งหมด?<br><small style="color:#c62828">การกระทำนี้ย้อนกลับไม่ได้</small>',
    async () => {
      const s = await getDocs(collection(db,'riceRecords'));
      const docs = s.docs;
      for (let i=0; i<docs.length; i+=400) {
        const b = writeBatch(db);
        docs.slice(i,i+400).forEach(d => b.delete(d.ref));
        await b.commit();
      }
      logAct('ล้างข้อมูลรับข้าว', `${docs.length} รายการ`);
      countDB();
    });

/* ---------- ประวัติการใช้งาน ---------- */
function listenLog() {
  onSnapshot(query(collection(db,'activityLog'), orderBy('at','desc'), limit(60)), s => {
    $('#logList').innerHTML = s.docs.map(d => {
      const l = d.data();
      const t = l.at?.toDate ? l.at.toDate() : null;
      return `<div class="log-item">
        <div class="log-dot"></div>
        <div class="log-text"><strong>${esc(l.action)}</strong>
          <span>${esc(l.detail)} · โดย ${esc(l.by)}</span></div>
        <span class="log-time">${t ? t.toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short'}) : '-'}</span>
      </div>`;
    }).join('') || '<p class="empty-box">ยังไม่มีประวัติ</p>';
  });
}
