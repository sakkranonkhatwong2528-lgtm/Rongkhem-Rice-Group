import { db, storage, auth } from './firebase-config.js';
import { collection, doc, getDoc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, where, getDocs, writeBatch, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL, deleteObject }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export { db, storage, auth, collection, doc, getDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, where, getDocs, writeBatch, serverTimestamp,
  ref, uploadBytes, getDownloadURL, deleteObject, signOut };

export const $  = s => document.querySelector(s);
export const $ = s => [...document.querySelectorAll(s)];
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const thDate = d => d ? new Date(d).toLocaleDateString('th-TH',
  { day:'2-digit', month:'short', year:'numeric' }) : '-';

export function toast(msg, type='ok') {
  let c = $('#toastContainer');
  if (!c) { c = document.createElement('div'); c.id='toastContainer';
    c.className='toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = `toast ${type}`; t.textContent = msg;
  c.appendChild(t); setTimeout(() => t.remove(), 3000);
}

/* ---------- MODAL ---------- */
let saveHandler = null;
export function ensureModal() {
  if ($('#modalBackdrop')) return;
  document.body.insertAdjacentHTML('beforeend', `
  <div class="modal-backdrop" id="modalBackdrop"><div class="modal-box">
    <div class="modal-head"><h3 id="modalTitle"></h3>
      <button class="modal-close" id="modalClose">&times;</button></div>
    <div class="modal-body" id="modalBody"></div>
    <div class="modal-foot">
      <button class="btn-cancel" id="modalCancel">ยกเลิก</button>
      <button class="btn-save" id="modalSave">บันทึก</button></div>
  </div></div>`);
  $('#modalClose').onclick = closeModal;
  $('#modalCancel').onclick = closeModal;
  $('#modalBackdrop').onclick = e => { if (e.target.id==='modalBackdrop') closeModal(); };
  $('#modalSave').onclick = async () => {
    if (!saveHandler) return;
    const b = $('#modalSave'); const old = b.textContent;
    b.disabled = true; b.textContent = 'กำลังบันทึก...';
    try { await saveHandler(); closeModal(); }
    catch (e) { toast(e.message || 'บันทึกไม่สำเร็จ', 'err'); }
    finally { b.disabled = false; b.textContent = old; }
  };
}
export function openModal(title, html, onSave, saveText='บันทึก') {
  ensureModal();
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = html;
  $('#modalSave').textContent = saveText;
  $('#modalSave').style.display = onSave ? '' : 'none';
  saveHandler = onSave;
  $('#modalBackdrop').classList.add('show');
}
export function closeModal() {
  $('#modalBackdrop')?.classList.remove('show'); saveHandler = null;
}
export const confirmDel = (text, fn) =>
  openModal('ยืนยันการลบ', `<p>${text}</p>`,
    async () => { await fn(); toast('ลบเรียบร้อย'); }, 'ลบ');

/* ---------- IMAGE ---------- */
export function compress(file, max=800, q=0.75) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const sc = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = img.width*sc; c.height = img.height*sc;
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(b => res(b), 'image/jpeg', q);
    };
    img.src = URL.createObjectURL(file);
  });
}
export async function uploadPhoto(file, folder='uploads') {
  const blob = await compress(file);
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const r = ref(storage, path);
  await uploadBytes(r, blob);
  return { url: await getDownloadURL(r), path };
}
export const removePhoto = p => p ? deleteObject(ref(storage, p)).catch(()=>{}) : null;

/* ---------- LOG ---------- */
export const logAct = (action, detail) =>
  addDoc(collection(db,'activityLog'), {
    action, detail, by: auth.currentUser?.email || '-', at: serverTimestamp()
  }).catch(()=>{});

/* ---------- AUTH GUARD ---------- */
export const state = { user:null, profile:null, isAdmin:false };
export function guard(onReady) {
  onAuthStateChanged(auth, async user => {
    if (!user) { location.replace('login.html'); return; }
    state.user = user;
    const s = await getDoc(doc(db,'users',user.uid));
    state.profile = s.exists() ? s.data() : { role:'member', name:user.email };
    if (state.profile.active === false) {
      await signOut(auth); location.replace('login.html'); return;
    }
    state.isAdmin = state.profile.role === 'admin';
    paintUser();
    if (!state.isAdmin) document.body.classList.add('is-member');
    onReady(state);
  });
}
function paintUser() {
  const ui = $('.user-info');
  if (ui) ui.innerHTML =
    `<strong>${esc(state.profile.position || 'ผู้ใช้งาน')}</strong>
     <span>${esc(state.profile.name || state.user.email)}</span>
     <span class="badge-role">${state.isAdmin ? 'ผู้ดูแลระบบ' : 'สมาชิก'}</span>`;
  $('.btn-logout')?.addEventListener('click', async () => {
    await signOut(auth); location.replace('login.html');
  });
}
export const needAdmin = () => {
  if (!state.isAdmin) { toast('เฉพาะผู้ดูแลระบบเท่านั้น','err'); return false; }
  return true;
};

/* ---------- นาฬิกา + กระดิ่ง ---------- */
export function startClock() {
  const tick = () => {
    const n = new Date();
    $('#liveClock') && ($('#liveClock').textContent = n.toLocaleTimeString('th-TH'));
    $('#liveDate')  && ($('#liveDate').textContent  = n.toLocaleDateString('th-TH',
      { weekday:'long', day:'numeric', month:'long', year:'numeric' }));
  };
  tick(); setInterval(tick, 1000);
  $('#bellIcon')?.addEventListener('click', e => {
    e.stopPropagation(); $('#notifDropdown')?.classList.toggle('show');
  });
  document.addEventListener('click', () => $('#notifDropdown')?.classList.remove('show'));
}

/* ---------- CSV ---------- */
export function downloadCSV(filename, rows) {
  const csv = '\uFEFF' + rows.map(r => r.map(c=>`"${String(c??'')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
  a.download = filename; a.click();
}
