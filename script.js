document.addEventListener('DOMContentLoaded', () => {
    initNaranjo();
    initLiverpool();
    
    // Set Print Date
    const today = new Date();
    document.getElementById('printDate').innerText = today.toLocaleDateString('th-TH');
});

// --- 1. TIMELINE LOGIC (PARALLEL) ---
let timelineData = [];

function addTimelineItem() {
    const date = document.getElementById('tDate').value;
    const time = document.getElementById('tTime').value;
    const type = document.getElementById('tType').value;
    const desc = document.getElementById('tDesc').value;

    if (!date || !desc) {
        alert("กรุณาระบุวันที่และรายละเอียด (Date & Description required)");
        return;
    }

    timelineData.push({
        id: Date.now(),
        date: date,
        time: time || "00:00",
        type: type,
        desc: desc,
        timestamp: new Date(`${date}T${time || "00:00"}`)
    });

    // Sort by timestamp
    timelineData.sort((a, b) => a.timestamp - b.timestamp);

    // Clear Inputs
    document.getElementById('tDesc').value = "";
    
    renderTimeline();
}

function renderTimeline() {
    const container = document.getElementById('visualTimeline');
    // Keep the center line, remove items
    container.innerHTML = '<div class="timeline-line"></div>';

    if (timelineData.length === 0) {
        container.innerHTML += '<div class="timeline-empty-state" style="text-align:center; padding:20px; color:#888;">ยังไม่มีข้อมูล</div>';
        return;
    }

    timelineData.forEach(item => {
        const div = document.createElement('div');
        div.className = `timeline-item ${item.type}`; // drug or symptom
        
        // Format Date Time
        const dateStr = new Date(item.date).toLocaleDateString('th-TH', {day:'numeric', month:'short'});
        
        div.innerHTML = `
            <button class="btn-del-time no-print" onclick="removeTimeline(${item.id})">x</button>
            <span class="time-badge">${dateStr} ${item.time} น.</span>
            <strong>${item.desc}</strong>
        `;
        
        container.appendChild(div);
    });
}

function removeTimeline(id) {
    timelineData = timelineData.filter(i => i.id !== id);
    renderTimeline();
}

// --- 2. TABS LOGIC ---
function openTab(id) {
    document.querySelectorAll('.algo-content').forEach(d => d.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(id).style.display = 'block';
    event.target.classList.add('active');
}

// --- 3. ALGORITHMS ---

// 3.1 Naranjo
const naranjoQ = [
    {q: "1. Previous conclusive reports?", y:1, n:0, u:0},
    {q: "2. Appeared after suspected drug?", y:2, n:-1, u:0},
    {q: "3. Improved when discontinued?", y:1, n:0, u:0},
    {q: "4. Reappear when re-administered?", y:2, n:-1, u:0},
    {q: "5. Alternative causes?", y:-1, n:2, u:0},
    {q: "6. Reaction with placebo?", y:-1, n:1, u:0},
    {q: "7. Toxic concentration detected?", y:1, n:0, u:0},
    {q: "8. Severity changed with dose?", y:1, n:0, u:0},
    {q: "9. Similar reaction in past?", y:1, n:0, u:0},
    {q: "10. Confirmed by objective evidence?", y:1, n:0, u:0}
];

function initNaranjo() {
    const tbody = document.getElementById('naranjoList');
    naranjoQ.forEach((q, i) => {
        tbody.innerHTML += `
            <tr>
                <td>${q.q}</td>
                <td class="center"><input type="radio" name="nq${i}" value="${q.y}" onchange="calcNaranjo()"></td>
                <td class="center"><input type="radio" name="nq${i}" value="${q.n}" onchange="calcNaranjo()"></td>
                <td class="center"><input type="radio" name="nq${i}" value="${q.u}" checked onchange="calcNaranjo()"></td>
            </tr>`;
    });
}

function calcNaranjo() {
    let score = 0;
    naranjoQ.forEach((_, i) => {
        document.getElementsByName(`nq${i}`).forEach(r => { if(r.checked) score += parseInt(r.value); });
    });
    document.getElementById('naranjoScore').innerText = score;
    let res = "Doubtful";
    if(score>=9) res="Definite"; else if(score>=5) res="Probable"; else if(score>=1) res="Possible";
    document.getElementById('naranjoResult').innerText = res;
}

// 3.2 Liverpool (LCAT) - Simplified Logic
const liverpoolQ = [
    "1. อาการทางคลินิกสอดคล้องกับยาที่สงสัยหรือไม่? (Clinical/Lab consistent?)",
    "2. อาการเกิดขึ้นในช่วงเวลาที่เหมาะสมหลังได้รับยา? (Temporal relationship?)",
    "3. อาการดีขึ้นเมื่อหยุดยา? (Dechallenge positive?)",
    "4. อาการเกิดซ้ำเมื่อได้รับยาใหม่? (Rechallenge positive?)"
];

function initLiverpool() {
    const tbody = document.getElementById('liverpoolList');
    liverpoolQ.forEach((q, i) => {
        tbody.innerHTML += `
            <tr>
                <td>${q}</td>
                <td width="100" class="center">
                    <select id="lq${i}" onchange="calcLiverpool()">
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                </td>
            </tr>`;
    });
}

function calcLiverpool() {
    const q1 = document.getElementById('lq0').value === 'yes';
    const q2 = document.getElementById('lq1').value === 'yes';
    const q3 = document.getElementById('lq2').value === 'yes';
    const q4 = document.getElementById('lq3').value === 'yes';
    
    let res = "Unlikely";
    // Logic แบบย่อ (Flowchart Logic)
    if (!q1 || !q2) {
        res = "Unlikely";
    } else {
        if (q4) res = "Definite";
        else if (q3) res = "Probable";
        else res = "Possible";
    }
    document.getElementById('liverpoolResult').innerText = res;
}

// 3.3 Thai Algorithm
function calcThai() {
    const t1 = document.getElementById('thai1').checked; // Temporal
    const t2 = document.getElementById('thai2').checked; // Dechallenge
    const t3 = document.getElementById('thai3').checked; // Rechallenge
    const t4 = document.getElementById('thai4').checked; // No other cause
    const t5 = document.getElementById('thai5').checked; // Plausible

    let res = "Unlikely (ไม่น่าใช่)";
    
    // Thai FDA/HPVC Simple Logic criteria:
    // Certain: Temporal + Dechallenge + Rechallenge + No other cause
    // Probable: Temporal + Dechallenge + No other cause
    // Possible: Temporal + (No other cause OR Dechallenge)
    
    if (t1 && t2 && t3 && t4) res = "Certain (ใช่แน่นอน)";
    else if (t1 && t2 && t4) res = "Probable (น่าจะใช่)";
    else if (t1 && t5) res = "Possible (อาจจะใช่)";
    
    document.getElementById('thaiResult').innerText = res;
}

// 3.4 SCORTEN
function calcScorten() {
    let score = 0;
    document.querySelectorAll('.sc-chk').forEach(c => { if(c.checked) score++; });
    
    document.getElementById('scScore').innerText = score;
    let mort = "3.2%";
    if(score===2) mort="12.1%"; else if(score===3) mort="35.3%"; 
    else if(score===4) mort="58.3%"; else if(score>=5) mort="> 90%";
    
    document.getElementById('scMortality').innerText = mort;
}

// Utils
function updateSign() {
    document.getElementById('printName').innerText = document.getElementById('pharmaName').value;
    document.getElementById('printDept').innerText = document.getElementById('pharmaDept').value;
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('photoPreview').src = e.target.result;
            document.getElementById('photoPreviewContainer').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// API Call (FDA)
async function checkDrugInfo() {
    const drug = document.getElementById('tDesc').value; // เอาจากช่องรายละเอียด
    if(!drug) return alert("พิมพ์ชื่อยาภาษาอังกฤษในช่องรายละเอียดก่อนครับ");
    
    const box = document.getElementById('apiResultBox');
    box.style.display = 'block';
    box.innerText = "Loading...";
    
    try {
        const res = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drug}"&limit=1`);
        const data = await res.json();
        const info = data.results[0].adverse_reactions ? data.results[0].adverse_reactions[0] : "No specific adverse reaction section found.";
        box.innerHTML = `<strong>${drug}:</strong><br>${info.substring(0,500)}...`;
    } catch(e) {
        box.innerHTML = `<span style="color:red">ไม่พบข้อมูลยา ${drug} (ลองใช้ชื่อ Generic Name)</span>`;
    }
}