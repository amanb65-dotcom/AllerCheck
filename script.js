// Naranjo Questions Data
// Scores: [Yes, No, Don't Know]
const questions = [
    { id: 1, text: "1. Are there previous conclusive reports on this reaction? (เคยมีรายงานสรุปเกี่ยวกับปฏิกิริยานี้มาก่อนหรือไม่)", scores: [1, 0, 0] },
    { id: 2, text: "2. Did the adverse event appear after the suspected drug was administered? (อาการไม่พึงประสงค์เกิดขึ้นหลังได้รับยาหรือไม่)", scores: [2, -1, 0] },
    { id: 3, text: "3. Did the adverse reaction improve when the drug was discontinued? (อาการดีขึ้นเมื่อหยุดยาหรือไม่)", scores: [1, 0, 0] },
    { id: 4, text: "4. Did the adverse reaction reappear when the drug was re-administered? (อาการกลับมาเป็นอีกเมื่อได้รับยาซ้ำหรือไม่)", scores: [2, -1, 0] },
    { id: 5, text: "5. Are there alternative causes (other than the drug)? (มีสาเหตุอื่นนอกจากยาที่สงสัยหรือไม่)", scores: [-1, 2, 0] },
    { id: 6, text: "6. Did the reaction reappear when a placebo was given? (เกิดอาการเมื่อได้รับยาหลอกหรือไม่)", scores: [-1, 1, 0] },
    { id: 7, text: "7. Was the drug detected in the blood (or other fluids) in concentrations known to be toxic? (ตรวจพบระดับยาในเลือดสูงถึงระดับเป็นพิษหรือไม่)", scores: [1, 0, 0] },
    { id: 8, text: "8. Was the reaction more severe when the dose was increased or less severe when the dose was decreased? (อาการรุนแรงขึ้นเมื่อเพิ่มยา หรือลดลงเมื่อลดยาหรือไม่)", scores: [1, 0, 0] },
    { id: 9, text: "9. Did the patient have a similar reaction to the same or similar drugs in any previous exposure? (ผู้ป่วยเคยมีอาการคล้ายกันกับยาเดิมหรือยาที่คล้ายกันมาก่อนหรือไม่)", scores: [1, 0, 0] },
    { id: 10, text: "10. Was the adverse event confirmed by any objective evidence? (ยืนยันอาการด้วยหลักฐานเชิงประจักษ์หรือไม่)", scores: [1, 0, 0] }
];

// State to store current scores
let currentScores = new Array(10).fill(0);

// Initialize Function
document.addEventListener('DOMContentLoaded', () => {
    renderNaranjoTable();
    setupPhotoUpload();
    
    // Set today's date for print view
    const today = new Date();
    document.getElementById('printDate').innerText = today.toLocaleDateString('th-TH');
});

// Render Table Rows
function renderNaranjoTable() {
    const tbody = document.getElementById('naranjoQuestions');
    
    questions.forEach((q, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${q.text}</td>
            <td><input type="radio" name="q${index}" value="${q.scores[0]}" onchange="updateScore(${index}, ${q.scores[0]})"></td>
            <td><input type="radio" name="q${index}" value="${q.scores[1]}" onchange="updateScore(${index}, ${q.scores[1]})"></td>
            <td><input type="radio" name="q${index}" value="${q.scores[2]}" onchange="updateScore(${index}, ${q.scores[2]})" checked></td>
        `;
        tbody.appendChild(row);
    });
}

// Update Score Logic
window.updateScore = (index, score) => {
    currentScores[index] = score;
    calculateTotal();
};

function calculateTotal() {
    const total = currentScores.reduce((a, b) => a + b, 0);
    const totalEl = document.getElementById('totalScore');
    const interpEl = document.getElementById('interpretation');
    
    totalEl.innerText = total;
    
    // Naranjo Interpretation
    let text = "";
    let color = "";
    
    if (total >= 9) {
        text = "Definite (ใช่แน่)";
        color = "#e74c3c"; // Red
    } else if (total >= 5) {
        text = "Probable (น่าจะใช่)";
        color = "#e67e22"; // Orange
    } else if (total >= 1) {
        text = "Possible (อาจจะใช่)";
        color = "#f1c40f"; // Yellow
    } else {
        text = "Doubtful (สงสัย)";
        color = "#2ecc71"; // Green
    }
    
    interpEl.innerText = text;
    interpEl.style.color = color;
}

// Photo Upload Preview Handler
function setupPhotoUpload() {
    const input = document.getElementById('photoInput');
    const previewBox = document.getElementById('photoPreviewContainer');
    const previewImg = document.getElementById('photoPreview');

    input.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.addEventListener('load', function() {
                previewImg.setAttribute('src', this.result);
                previewBox.style.display = 'block';
            });
            
            reader.readAsDataURL(file);
        } else {
            previewBox.style.display = 'none';
        }
    });
}
