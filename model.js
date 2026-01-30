const URL = "https://teachablemachine.withgoogle.com/models/aSyXl0QKe/"; 

let model, webcam, labelContainer, maxPredictions;

// ฟังก์ชันเริ่มต้นทำงาน (Init)
async function init(button) {
    // ซ่อนปุ่ม และแสดงกล่องรอโหลด
    button.style.display = "none";
    document.getElementById("webcam-container").classList.remove("hidden");
    document.getElementById("result-card").classList.remove("hidden");
    document.getElementById("label-container").innerHTML = '<span style="color:#94a3b8;">Loading Camera...</span>';

    // โหลดโมเดล
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // ตั้งค่ากล้อง
    const flip = true; 
    webcam = new tmImage.Webcam(350, 350, flip); 
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    // เอาภาพจากกล้องไปแปะใน HTML
    document.getElementById("webcam-container").innerHTML = "";
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
}

// ฟังก์ชันวนลูป (Loop) เพื่ออัปเดตภาพ
async function loop() {
    webcam.update(); 
    await predict();
    window.requestAnimationFrame(loop);
}

// ฟังก์ชันพยากรณ์ 
async function predict() {
    const prediction = await model.predict(webcam.canvas);
    
    // หาค่าที่มั่นใจที่สุด
    let bestPrediction = prediction[0];
    for (let i = 1; i < maxPredictions; i++) {
        if (prediction[i].probability > bestPrediction.probability) {
            bestPrediction = prediction[i];
        }
    }

    // ดึงชื่อ Class และกำหนดการแสดงผล
    let originalName = bestPrediction.className;
    let displayName = "";
    let colorClass = "";
    
    if (originalName === "Class 2") {
        displayName = "✅ MASK ON"; 
        colorClass = "mask"; 
    } else {
        displayName = "⛔ MASK OFF"; 
        colorClass = "no-mask";
    }
    
    const probability = (bestPrediction.probability * 100).toFixed(1); 
    
    // ส่งค่ากลับไปที่ HTML
    labelContainer.innerHTML = `
        <div class="${colorClass}">
            ${displayName}
            <span class="probability-text">Confidence ${probability}%</span>
        </div>
    `;
}