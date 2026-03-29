let currentVoice = null;
const bgMusic = document.getElementById('bgMusic');
if (bgMusic) bgMusic.volume = 0.3;

// 1. ข้อมูลชุดคำพูดและเสียง
const encouragements = [
    { text: "เป็นไงบ้างลูก กินข้าวยัง", sound: "เป็นไงบ้างลูก.mp3" },
    { text: "เหนื่อยมั้ยลูก แม่ภูมิใจในตัวลูกมากๆ", sound: "เหนื่อยไหมลูก.mp3" },
    { text: "น้องทำไรอยู่อะลูก", sound: "น้องทำไรอยู่อะลูก.mp3" },
    { text: "วันนี้คุณทำเก่งที่สุดแล้ว... พักผ่อนบ้างนะ", sound: "หลานกินเนื้อ.mp3" },
    { text: "วันนี้คุณทำเก่งที่สุดแล้ว... พักผ่อนบ้างนะ", sound: "กินมะม่วงไหม.mp3" },
    { text: "รอยยิ้มของเด็กคนนั้น ยังอยู่ในตัวคุณเสมอ", sound: "ไปไสมาลูก.mp3" }
];


// 2. ตั้งค่า Canvas หลัก
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let points = [];

function initCanvas() {
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
initCanvas();

// 3. ระบบจัดการหน้าจอ (Modal)
function openModal() {
    goToStep(1);
    document.getElementById('modalArt').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalArt').style.display = 'none';
}

function goToStep(step) {
    const s1 = document.getElementById('step1');
    const s2 = document.getElementById('step2');
    if (step === 1) {
        s1.style.display = 'block';
        s2.style.display = 'none';
    } else {
        s1.style.display = 'none';
        s2.style.display = 'block';
        const previewArea = document.getElementById('previewArea');
        previewArea.innerHTML = `
            <p style="font-size: 2rem; color: #666;">ผลงานของคุณ:</p>
            <img src="${canvas.toDataURL()}" style="width: 80px; border: 4px solid white; box-shadow: 0 5px 15px rgba(0,0,0,0.1); border-radius: 15px;">
        `;
    }
}

// 4. ระบบวาดรูป (Desktop & Touch)
function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // กันหน้าจอเลื่อนขณะวาด
        startDraw(e);
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); // กันหน้าจอเลื่อนขณะวาด
        if (!isDrawing) return;
        const pos = getPos(e);
        points.push(pos);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    }, { passive: false });

canvas.addEventListener('touchend', () => {
    if (isDrawing) { fillArea(); isDrawing = false; }
});

function startDraw(e) {
    isDrawing = true;
    points = [];
    const pos = getPos(e);
    points.push(pos);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
}

window.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const pos = getPos(e);
    points.push(pos);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
});

window.addEventListener('mouseup', () => {
    if (isDrawing) { fillArea(); isDrawing = false; }
});

function fillArea() {
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.fill();
    ctx.stroke();
}

function clearCanvas() { initCanvas(); }

// 5. ระบบสี
const colorsPen = ['#000000'];
const colorsFill = ['#ffffff', '#f1c40f', '#e84393', '#00cec9', '#badc58'];

function createPalette(id, colors, type) {
    const el = document.getElementById(id);
    if(!el) return;
    colors.forEach(color => {
        const btn = document.createElement('button');
        btn.style.backgroundColor = color;
        btn.onclick = () => {
            if (type === 'pen') ctx.strokeStyle = color;
            else ctx.fillStyle = color;
        };
        el.appendChild(btn);
    });
}
createPalette('penColors', colorsPen, 'pen');
createPalette('fillColors', colorsFill, 'fill');

// 6. ระบบคำพูดลอย (Floating Quote)
function createFloatingQuote(quoteObj) {
    const bgWall = document.getElementById('bgGalleryRef');
    if (!bgWall) return;

    const quoteEl = document.createElement('div');
    quoteEl.className = 'floating-quote';
    quoteEl.innerText = quoteObj.text; 

    quoteEl.onclick = (e) => {
        e.stopPropagation();
        if (currentVoice) { currentVoice.pause(); currentVoice.currentTime = 0; }
        currentVoice = new Audio(quoteObj.sound);
        currentVoice.play().catch(err => console.log("คลิกหน้าจอก่อนเพื่อเล่นเสียง"));

        Swal.fire({
            title: '<span style="font-family: \'Athiti\'; font-weight: bold; color: #bf9b30;">ข้อความจากหัวใจ...</span>',
            width: '300px',
            padding: '1em',
        html: `
            <div style="font-family: 'Athiti'; padding: 10px;">
                <p style="font-size: 1.5rem; color: #333; margin-bottom: 15px; line-height: 1.4;">
                    "${quoteObj.healText}"
                </p>
                <hr style="border: 0; border-top: 1px dashed #ccc; margin: 15px 0;">
                <p style="font-size: 1.0rem; color: #888;">
                    คำปลอบโยนนี้ถูกส่งต่อมาเพื่อเป็นกำลังใจให้คุณในวันนี้
                </p>
            </div>
        `,
        background: '#fffdf9', // สีขาวนวลแบบกระดาษ
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true, // เพิ่มแถบเวลาวิ่งด้านล่าง
        showClass: {
            popup: 'animate__animated animate__fadeInUp' // ถ้ามี Animate.css จะสวยมาก
        },
        didOpen: () => {
            const popup = Swal.getPopup();
            popup.style.borderRadius = '30px';
            popup.style.border = '5px solid #fdf0d5';
        }
    });
};

    const duration = (Math.random() * 13 + 18).toFixed(1);
    quoteEl.style.left = `${Math.random() * 80}%`;
    quoteEl.style.top = `${Math.random() * 80}%`;
    quoteEl.style.setProperty('--duration', `${duration}s`);
    quoteEl.style.pointerEvents = 'auto'; // บังคับให้รับการคลิก
    quoteEl.style.cursor = 'pointer';    // เปลี่ยนรูปเมาส์
    bgWall.appendChild(quoteEl);
    setTimeout(() => { if(quoteEl.parentNode) quoteEl.remove(); }, duration * 1000);
}

// ฟังก์ชันสร้างรูปวาดเวอร์ชันลอยจางๆ อยู่พื้นหลัง
function createFloatingArtwork(drawingDataUrl) {
    const bgWall = document.getElementById('bgGalleryRef'); // หรือ id ของกล่องพื้นหลังคุณ
    if (!bgWall) return;

    const artEl = document.createElement('img');
    artEl.src = drawingDataUrl;
    artEl.className = 'artwork-item'; // ต้องตั้งค่า CSS .artwork-item ให้ opacity จางๆ
    
    bgWall.appendChild(artEl);

    // ลบออกหลังจากแอนิเมชันจบ (เช่น 20 วินาที)
    setTimeout(() => {
        if (artEl.parentNode) artEl.remove();
    }, 5000);
}

// 7. ระบบส่งผลงาน (บันทึกรูป + ส่งคำลอยพร้อมเสียง)
function submitArt() {
    const name = document.getElementById('nameInput').value.trim() || "ศิลปินนิรนาม";
    const quote = document.getElementById('quoteInput').value.trim() || "ฝันให้ไกล ไปให้ถึง";
    const track = document.getElementById('trackRef');
    const imageData = canvas.toDataURL('image/png');
    createFloatingArtwork(imageData);

    // สุ่มเสียงมาผูกกับข้อความที่เราพิมพ์
    const luckyHeal = encouragements[Math.floor(Math.random() * encouragements.length)];
    const container = document.createElement('div');
    container.className = 'art-container';
    container.onclick = () => generateArtCard(imageData, name, quote);
    container.innerHTML = `
        <div class="art-frame"><img src="${imageData}"><div class="click-hint">กดเพื่อบันทึก</div></div>
        <div class="art-info"><strong>${name}</strong><br>${quote}</div>
    `;
    track.appendChild(container);

    // สร้างคำลอย (ใช้เสียงที่สุ่มมา)
    const userObj = { 
        text: quote,            // ข้อความที่เราพิมพ์ (ให้เอาไปลอยบนจอ)
        healText: luckyHeal.text, // ข้อความให้กำลังใจจากระบบ (ให้ไปโชว์ในกล่อง Pop-up)
        sound: luckyHeal.sound    // เสียงจากระบบ
    };
    for(let i=0; i<3; i++) setTimeout(() => createFloatingQuote(userObj), i * 500);

    closeModal();
    clearCanvas();
    document.getElementById('nameInput').value = "";
    document.getElementById('quoteInput').value = "";
}

// 8. ระบบสร้างการ์ดรูปภาพ (ดาวน์โหลด)
function generateArtCard(drawingDataUrl, artistName, artistQuote) {
    const randomEncourage = encouragements[Math.floor(Math.random() * encouragements.length)];
    const cardCanvas = document.createElement('canvas');
    const cctx = cardCanvas.getContext('2d');
    cardCanvas.width = 800; cardCanvas.height = 1100;

    const img = new Image();
    img.src = drawingDataUrl;
    img.onload = () => {
        cctx.fillStyle = "#fffdf9"; cctx.fillRect(0, 0, 800, 1100);
        cctx.fillStyle = "#2c3e50"; cctx.fillRect(100, 80, 600, 600);
        cctx.drawImage(img, 110, 90, 580, 580);
        cctx.textAlign = "center";
        
        // แก้ไขจุด [object Object] โดยใช้ .text
        cctx.fillStyle = "#bf9b30"; cctx.font = "italic 32px 'Athiti'";
        wrapText(cctx, `"${randomEncourage.text}"`, 400, 750, 600, 45);

        cctx.fillStyle = "#333"; cctx.font = "bold 45px 'Athiti'";
        cctx.fillText(artistName, 400, 930);
        cctx.font = "28px 'Athiti'"; cctx.fillStyle = "#666";
        wrapText(cctx, artistQuote, 400, 1000, 600, 35);

        const link = document.createElement('a');
        link.download = `Dream-${artistName}.png`;
        link.href = cardCanvas.toDataURL();
        link.click();
    };
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n];
        if (context.measureText(testLine).width > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n];
            y += lineHeight;
        } else { line = testLine; }
    }
    context.fillText(line, x, y);
}

// 9. ระบบสุ่มคำพูดลอยอัตโนมัติ
function autoFloat() {
    const harshMsgs = ["เด็กคนนั้นจะผิดหวังไหม ถ้าเราไม่ได้ทำตามฝัน", 
                       "ตอนเด็กฝันไว้ตั้งมากมาย ทำไมโตมาได้แค่นี้?", 
                       "ขอโทษนะ ที่ไม่ได้ทำตามฝัน :) ", 
                       "ทิ้งความฝันแล้วยอมรับความจริงเถอะ ",
                       "ได้คิดหรือยังว่าจะทำอะไรต่อ",
                       "เคยอยากมีฝันนะ แต่ตอนนี้หมดไฟแล้ว"];
    const randomHarsh = harshMsgs[Math.floor(Math.random() * harshMsgs.length)];
    const luckyHeal = encouragements[Math.floor(Math.random() * encouragements.length)];
    
    createFloatingQuote({
        text: randomHarsh,
        healText: luckyHeal.text,
        sound: luckyHeal.sound
    });
    setTimeout(autoFloat, 5000);
}

// เริ่มต้นระบบ
document.addEventListener('DOMContentLoaded', () => {
    autoFloat();
    document.addEventListener('click', () => bgMusic.play(), { once: true });
});

// สร้างฟังก์ชันปลดล็อกเสียง
function unlockAudio() {
    if (bgMusic) {
        bgMusic.play().then(() => {
            // ถ้าเล่นได้แล้ว ให้เอา Event นี้ออก
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
        }).catch(err => console.log("Waiting for user interaction..."));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    autoFloat();
    // เพิ่ม touchstart เพื่อรองรับมือถือ
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
});
