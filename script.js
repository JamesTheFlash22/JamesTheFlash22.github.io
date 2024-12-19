const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const colors = ["#FF5733", "#FFC300", "#FF33FF", "#33FF57", "#33A1FF", "#FF3333", "#33FFA1", "#FF8C33", "#8D33FF", "#33FFF3"];
const names = Array.from({ length: 22 }, (_, i) => (i + 1).toString());
let currentAngle = 0;
let isSpinning = false;
let spinCount = 0;  // Contatore delle rotazioni
const winnerPopup = document.getElementById('winnerPopup');
const resultsPopup = document.getElementById('resultsPopup');
const resultsList = document.getElementById('resultsList');
const winnerName = document.getElementById('winnerName');

// Carica i risultati della sessione corrente
function loadSessionResults() {
    const results = JSON.parse(localStorage.getItem("sessionResults") || "[]");
    results.forEach(result => addResultToUI(result));
}

function saveResult(result) {
    let results = JSON.parse(localStorage.getItem("sessionResults") || "[]");
    results.push(result);
    localStorage.setItem("sessionResults", JSON.stringify(results));
    addResultToUI(result);
}

function addResultToUI(result) {
    const listItem = document.createElement("li");
    listItem.textContent = result;
    resultsList.appendChild(listItem);
}

function clearSessionResults() {
    localStorage.removeItem("sessionResults");
    resultsList.innerHTML = "";
}

function drawWheel() {
    const numberOfSegments = names.length;
    const anglePerSegment = (2 * Math.PI) / numberOfSegments;
    for (let i = 0; i < numberOfSegments; i++) {
        const angle = i * anglePerSegment + currentAngle;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, angle, angle + anglePerSegment);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        ctx.stroke();
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle + anglePerSegment / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "white";
        ctx.font = "bold 12px Arial";
        ctx.fillText(names[i], canvas.width / 2 - 10, 10);
        ctx.restore();
    }
}

function spinWheel() {
    if (isSpinning || names.length === 0) return;
    isSpinning = true;
    spinCount++;
    let spinTime = 3000;
    let spinAngle = Math.random() * 10 + 10;
    const startTime = performance.now();

    function animate(time) {
        const elapsed = time - startTime;
        currentAngle += spinAngle * (1 - elapsed / spinTime);
        if (elapsed < spinTime) {
            requestAnimationFrame(animate);
        } else {
            stopWheel();
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawWheel();
    }
    requestAnimationFrame(animate);
}

function stopWheel() {
    isSpinning = false;
    let winningSegmentIndex;

    // Logica per determinare i numeri speciali nelle rotazioni specifiche
    if (spinCount === 7) {
        winningSegmentIndex = names.indexOf("4");
    } else if (spinCount === 8) {
        winningSegmentIndex = names.indexOf("12");
    } else if (spinCount === 9) {
        winningSegmentIndex = names.indexOf("21");
    } else if (spinCount === 10) {
        winningSegmentIndex = names.indexOf("15");
    } else {
        winningSegmentIndex = Math.floor(Math.random() * names.length);
    }

    const winningName = names[winningSegmentIndex] || "Sconosciuto";
    winnerName.textContent = `${winningName} ha vinto!`;
    saveResult(winningName);
    winnerPopup.style.display = 'block';
}

function closePopup() {
    winnerPopup.style.display = 'none';
}

function removeName() {
    const winningName = winnerName.textContent.split(' ')[0];
    const index = names.indexOf(winningName);
    if (index !== -1) {
        names.splice(index, 1);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWheel();
    closePopup();
}

function toggleResultsPopup() {
    resultsPopup.style.display = resultsPopup.style.display === 'none' || resultsPopup.style.display === '' ? 'block' : 'none';
}

document.getElementById('spinButton').addEventListener('click', spinWheel);
document.getElementById('closePopup').addEventListener('click', closePopup);
document.getElementById('removeNameButton').addEventListener('click', removeName);
document.getElementById('showResultsButton').addEventListener('click', toggleResultsPopup);
document.getElementById('closeResultsPopup').addEventListener('click', toggleResultsPopup);

window.onload = () => {
    clearSessionResults();
    loadSessionResults();
    drawWheel();
};
