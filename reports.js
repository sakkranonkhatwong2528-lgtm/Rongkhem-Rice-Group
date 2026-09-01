import { db, collection, onSnapshot, query, orderBy,
  $, esc, thDate, toast, guard, startClock, downloadCSV } from './common.js';

let members = [], funerals = [], records = [];
let cBar, cPie, cLine;

Chart.defaults.font.family = 'Kanit, sans-serif';

guard(() => { startClock(); listen(); });

function listen() {
  onSnapshot(query(collection(db,'members'), orderBy('houseNo')), s => {
    members = s.docs.map(d=>({id:d.id,...d.data()})).filter(m=>m.active!==false); render();
  });
  onSnapshot(query(collection(db,'funerals'), orderBy('cremationDate','asc')), s => {
    funerals = s.docs.map(d=>({id:d.id,...d.data()}));
    const years = [...new Set(funerals.map(f=>new Date(f.cremationDate).getFullYear()+543))].sort((a,b)=>b-a);
    const cur = $('#filterYear').value;
    $('#filterYear').innerHTML = '<option value="all">ทุกปี</option>' +
      years.map(y=>`<option value="${y}">พ.ศ. ${y}</option>`).join('');
    if (cur) $('#filterYear').value = cur;
    render();
  });
  onSnapshot(collection(db,'riceRecords'), s => {
    records = s.docs.map(d=>({id:d.id,...d.data()})); render();
  });
}

const scope = () => {
  const y = $('#filterYear').value;
  return y==='all' ? funerals
    : funerals.filter(f => (new Date(f.cremationDate).getFullYear()+543) == y);
};
const recOf = fid => records.filter(r => r.funeralId === fid);

function render() {
  const fs = scope(), total = members.length || 1;
  const rows = fs.map(f => {
    const n = recOf(f.id).length;
    return { ...f, n, pct: Math.round(n/total*100) };
  });

  $('#kMembers').textContent  = members.length;
  $('#kFunerals').textContent = fs.length;
  $('#kRecords').textContent  = rows.reduce((a,b)=>a+b.n, 0);
  $('#kAvg').textContent = (rows.length
    ? Math.round(rows.reduce((a,b)=>a+b.pct,0)/rows.length) : 0) + '%';
  $('#reportPeriod').textContent =
    `ข้อมูล ${$('#filterYear').value==='all' ? 'ทั้งหมด' : 'ปี พ.ศ. '+$('#filterYear').value} · ` +
    `ออกรายงานวันที่ ${thDate(new Date())}`;

  drawBar(rows); drawPie(rows, total); drawLine(rows); drawTable(fs);
}

function drawBar(rows) {
  const d = rows.slice(-12);
  cBar?.destroy();
  cBar = new Chart($('#chartBar'), {
    type:'bar',
    data:{ labels: d.map(f=>f.name), datasets:[{ label:'ครัวเรือนที่รับข้าว',
      data: d.map(f=>f.n), backgroundColor:'#66bb6a', borderRadius:8 }]},
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false},
        tooltip:{ callbacks:{ afterLabel: c => `คิดเป็น ${d[c.dataIndex].pct}%` }}},
      scales:{ y:{ beginAtZero:true, ticks:{precision:0} },
        x:{ ticks:{ maxRotation:45, minRotation:0, font:{size:11} } } } }
  });
}

function drawPie(rows, total) {
  const join = rows.reduce((a,b)=>a+b.n, 0);
  const miss = Math.max(0, rows.length*total - join);
  cPie?.destroy();
  cPie = new Chart($('#chartPie'), {
    type:'doughnut',
    data:{ labels:['เข้าร่วม','ไม่เข้าร่วม'], datasets:[{
      data:[join, miss], backgroundColor:['#43a047','#ef9a9a'], borderWidth:0 }]},
    options:{ responsive:true, maintainAspectRatio:false, cutout:'62%',
      plugins:{ legend:{ position:'bottom' } } }
  });
}

function drawLine(rows) {
  const M = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const cnt = Array(12).fill(0), sum = Array(12).fill(0);
  rows.forEach(f => { const m = new Date(f.cremationDate).getMonth();
    cnt[m]++; sum[m] += f.pct; });
  cLine?.destroy();
  cLine = new Chart($('#chartLine'), {
    type:'line',
    data:{ labels:M, datasets:[{ label:'อัตราเข้าร่วมเฉลี่ย (%)',
      data: sum.map((s,i)=> cnt[i] ? Math.round(s/cnt[i]) : 0),
      borderColor:'#2e7d32', backgroundColor:'rgba(102,187,106,.18)',
      fill:true, tension:.35, pointRadius:4 }]},
    options:{ responsive:true, maintainAspectRatio:false,
      scales:{ y:{ beginAtZero:true, max:100 } } }
  });
}

function drawTable(fs) {
  const ids = fs.map(f=>f.id), n = ids.length || 1;
  const stat = members.map(m => {
    const join = ids.filter(id =>
      records.some(r => r.funeralId===id && r.memberId===m.id)).length;
    return { ...m, join, miss: n-join, pct: Math.round(join/n*100) };
  });

  $('#reportTbody').innerHTML = [...stat].sort((a,b)=>b.miss-a.miss).map((m,i) => `
    <tr>
      <td>${i+1}</td><td><strong>${esc(m.houseNo)}</strong></td><td>${esc(m.name)}</td>
      <td>${m.join}</td><td>${m.miss}</td>
      <td><div class="mini-bar"><div style="width:${m.pct}%;background:${
        m.pct>=80?'#43a047':m.pct>=50?'#ffa726':'#ef5350'}"></div></div>
        <small>${m.pct}%</small></td>
    </tr>`).join('') || '<tr><td colspan="6" class="empty">ไม่มีข้อมูล</td></tr>';

  $('#rankList').innerHTML = [...stat].sort((a,b)=>b.join-a.join).slice(0,10)
    .map((m,i) => `<div class="rank-item">
      <span class="rank-no ${i<3?'top':''}">${i+1}</span>
      <div class="rank-info"><strong>บ้านเลขที่ ${esc(m.houseNo)}</strong><span>${esc(m.name)}</span></div>
      <span class="pill on">${m.join}/${n}</span></div>`).join('')
    || '<p class="empty-box">ไม่มีข้อมูล</p>';

  window.__stat = stat;
}

/* ---------- EXPORT ---------- */
$('#filterYear').onchange = render;

$('#btnCSV').onclick = () => {
  const rows = [['บ้านเลขที่','ชื่อ-สกุล','เข้าร่วม (ครั้ง)','ค้างส่ง (ครั้ง)','อัตรา (%)']];
  (window.__stat||[]).forEach(m => rows.push([m.houseNo, m.name, m.join, m.miss, m.pct]));
  downloadCSV(`รายงานสรุป_${$('#filterYear').value}.csv`, rows);
  toast('ส่งออก CSV แล้ว');
};

$('#btnPDF').onclick = () => {
  toast('กำลังสร้างไฟล์ PDF...');
  html2pdf().set({
    margin: 8,
    filename: `รายงานกลุ่มข้าวสาร_${$('#filterYear').value}.pdf`,
    image: { type:'jpeg', quality:.95 },
    html2canvas: { scale:2, useCORS:true },
    jsPDF: { unit:'mm', format:'a4', orientation:'portrait' }
  }).from($('#reportArea')).save().then(() => toast('บันทึก PDF เรียบร้อย'));
};
