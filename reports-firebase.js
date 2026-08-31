import { db } from "./firebase-config.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

/* ===== ดึงข้อมูลสรุปตามปีที่เลือก สำหรับสร้างกราฟ ===== */
async function fetchYearlyReport(yearBE) {
  const funeralCol = collection(db, "funerals");
  const q = query(funeralCol, where("yearBE", "==", yearBE));
  const snapshot = await getDocs(q);

  const funerals = snapshot.docs.map(d => d.data());

  const monthly = new Array(12).fill(0);
  let totalRice = 0;
  let totalReceived = 0;
  let totalHouseholds = 0;

  funerals.forEach(f => {
    const monthIndex = new Date(f.date).getMonth();
    monthly[monthIndex] += f.totalRiceCollected || 0;
    totalRice += f.totalRiceCollected || 0;
    totalReceived += f.receivedCount || 0;
    totalHouseholds += f.totalHouseholds || 0;
  });

  const avgPercent = totalHouseholds
    ? Math.round((totalReceived / totalHouseholds) * 100)
    : 0;

  return {
    totalFunerals: funerals.length,
    totalRice,
    avgPercent,
    monthly,
    received: avgPercent,
    notReceived: 100 - avgPercent
  };
}

/* ===== ดึงครัวเรือนค้างส่งบ่อยที่สุด (aggregate จาก members) ===== */
async function fetchLaggingHouseholds() {
  const membersCol = collection(db, "members");
  const snapshot = await getDocs(membersCol);

  const members = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

  return members
    .map(m => ({
      name: m.name,
      house: m.houseNumber,
      count: m.missedCount || 0
    }))
    .filter(m => m.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export { fetchYearlyReport, fetchLaggingHouseholds };
