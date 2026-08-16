const display = document.getElementById("display");
const subDisplay = document.getElementById("subDisplay");
const historyList = document.getElementById("historyList");
const scientificPanel = document.getElementById("scientificPanel");
const sciToggleBtn = document.getElementById("sciToggleBtn");

// 🔊 Web Audio API for Crisp Mechanical Clicks
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playClickSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(950, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.035);
    
    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.035);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.035);
}

// Auto attach sound to buttons
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("button").forEach(btn => {
        btn.addEventListener("click", playClickSound);
    });
});

// Scientific / Standard Input Handler
function addValue(val) {
    display.value += val;
}

function clearDisplay() {
    display.value = "";
    subDisplay.textContent = "";
}

function deleteLast() {
    display.value = display.value.slice(0, -1);
}

// Evaluation Logic with Error Handling
function calculate() {
    try {
        if (!display.value) return;
        let expression = display.value;
        
        // Auto-close open brackets before eval
        let openBrackets = (expression.match(/\(/g) || []).length;
        let closeBrackets = (expression.match(/\)/g) || []).length;
        while (openBrackets > closeBrackets) {
            expression += ')';
            closeBrackets++;
        }

        let result = Function('"use strict";return (' + expression + ')')();
        
        // Format float decimals
        if (typeof result === 'number' && !Number.isInteger(result)) {
            result = parseFloat(result.toFixed(6));
        }

        subDisplay.textContent = expression;
        addHistory(`${expression} = ${result}`);
        display.value = result;
    } catch (e) {
        display.value = "Error";
        setTimeout(() => {
            if (display.value === "Error") display.value = "";
        }, 1200);
    }
}

// 💵 Live Exchange Rates (1 USD = 83.5 INR)
const USD_TO_INR = 83.5;

function convertToINR() {
    let val = parseFloat(display.value);
    if (isNaN(val)) {
        display.value = "Enter Amount";
        setTimeout(clearDisplay, 1200);
        return;
    }
    let res = (val * USD_TO_INR).toFixed(2);
    subDisplay.textContent = `$${val} USD`;
    addHistory(`$${val} USD ➔ ₹${res} INR`);
    display.value = `₹ ${res}`;
}

function convertToUSD() {
    let val = parseFloat(display.value);
    if (isNaN(val)) {
        display.value = "Enter Amount";
        setTimeout(clearDisplay, 1200);
        return;
    }
    let res = (val / USD_TO_INR).toFixed(2);
    subDisplay.textContent = `₹${val} INR`;
    addHistory(`₹${val} INR ➔ $${res} USD`);
    display.value = `$ ${res}`;
}

// History Handling
function addHistory(entry) {
    let li = document.createElement("li");
    li.textContent = entry;
    historyList.prepend(li);
}

function clearHistory() {
    historyList.innerHTML = "";
}

// UI Toggles
function toggleScientific() {
    scientificPanel.classList.toggle("hidden");
    const isActive = !scientificPanel.classList.contains("hidden");
    sciToggleBtn.style.background = isActive ? "#6366f1" : "#1e293b";
    sciToggleBtn.style.borderColor = isActive ? "#818cf8" : "#334155";
}

function toggleTheme() {
    document.body.classList.toggle("light-mode");
}