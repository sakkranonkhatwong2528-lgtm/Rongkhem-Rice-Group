import { db, auth } from "./firebase-config.js";
import {
  collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, where
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const logsCol = collection(db, "activityLogs");

/**
 * บันทึก Log ทุกครั้งที่มีการ เพิ่ม/แก้ไข/ลบ ข้อมูล
 * @param {string} action - "create" | "update" | "delete"
 * @param {string} module - เช่น "members", "announcements", "funerals", "riceRecords"
 * @param {string} targetName - ชื่อ/รายละเอียดของรายการที่ถูกแก้ไข
 * @param {object} extra - ข้อมูลเพิ่มเติม (optional เช่น ค่าก่อน-หลัง)
 */
async function logActivity(action, module, targetName, extra = {}) {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(logsCol, {
    action,             // create / update / delete
    module,             // members / announcements / funerals / riceRecords / settings
    targetName,
    extra,
    userId: user.uid,
    userEmail: user.email,
    userName: user.displayName || user.email,
    timestamp: serverTimestamp()
  });
}

/**
 * ดึง Log ล่าสุด (real-time) สำหรับหน้า "ประวัติการใช้งาน"
 * @param {function} callback
 * @param {number} maxItems - จำนวนรายการสูงสุด default 100
 */
function listenActivityLogs(callback, maxItems = 100) {
  const q = query(logsCol, orderBy("timestamp", "desc"), limit(maxItems));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

/**
 * กรอง Log ตาม module เฉพาะ เช่น ดูแค่ log ของ "members"
 */
function listenActivityLogsByModule(module, callback, maxItems = 50) {
  const q = query(logsCol, where("module", "==", module), orderBy("timestamp", "desc"), limit(maxItems));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

export { logActivity, listenActivityLogs, listenActivityLogsByModule };
