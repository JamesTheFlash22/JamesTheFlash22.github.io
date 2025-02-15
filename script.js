const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');

// Palette vivace per la ruota
const colors = [
  "#FF0000", "#FF7F00", "#FFFF00", "#7FFF00", 
  "#00FF00", "#00FF7F", "#00FFFF", "#007FFF", 
  "#0000FF", "#7F00FF", "#FF00FF", "#FF007F", 
  "#FF4500", "#40E0D0", "#FFD700", "#DC143C"
];

let names = Array.from({ length: 22 }, (_, i) => (i + 1).toString());
let currentAngle = 0;
let isSpinning = false;
let spinCount = 0;

const winnerPopup = document.getElementById('winnerPopup');
const resultsPopup = document.getElementById('resultsPopup');
const resultsList = document.getElementById('resultsList');
const winnerNumber = document.getElementById('winnerNumber');
const removeWinnerNumberButton = document.getElementById('removeWinnerNumberButton');
const removeNumberPopup = document.getElementById('removeNumberPopup');
const numberSelect = document.getElementById('numberSelect');

let lastExtractedNumber = null;

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
  // Il numero e il pulsante reinserisci saranno affiancati grazie al flex
  const spanText = document.createElement("span");
  spanText.textContent = result;
  
  // Pulsante "Reinserisci" inline
  const reinserisciButton = document.createElement("button");
  reinserisciButton.textContent = "Reinserisci";
  reinserisciButton.classList.add("custom-button", "inline-button");
  reinserisciButton.addEventListener('click', () => {
    if (!names.includes(result)) {
      names.push(result);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawWheel();
      // Rimuovo l'elemento dalla lista
      listItem.remove();
    }
  });
  
  listItem.appendChild(spanText);
  listItem.appendChild(reinserisciButton);
  
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

    // Disegno il numero con un font più grande ed effetto ombra per migliorarne la leggibilità
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle + anglePerSegment / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 16px Arial";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 4;
    ctx.fillText(names[i], canvas.width / 2 - 10, 10);
    ctx.restore();
  }
}

function spinWheel() {
  if (isSpinning || names.length === 0) return;
  isSpinning = true;
  spinCount++;
  const spinTime = 3000;
  const spinAngle = Math.random() * 10 + 10;
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
  const winningSegmentIndex = Math.floor(Math.random() * names.length);
  const winningNumberValue = names[winningSegmentIndex];
  if (winningNumberValue) {
    lastExtractedNumber = winningNumberValue;
    winnerNumber.textContent = `${winningNumberValue} è stato estratto!`;
    saveResult(winningNumberValue);
    winnerPopup.style.display = 'block';
  }
}

function closePopup() {
  winnerPopup.style.display = 'none';
}

// Rimuove il numero estratto dalla ruota (dal popup vincitore)
removeWinnerNumberButton.addEventListener('click', () => {
  if (lastExtractedNumber) {
    const index = names.indexOf(lastExtractedNumber);
    if (index !== -1) {
      names.splice(index, 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawWheel();
    }
    winnerPopup.style.display = 'none';
  }
});

function toggleResultsPopup() {
  resultsPopup.style.display = (resultsPopup.style.display === 'none' || resultsPopup.style.display === '') ? 'block' : 'none';
}

function toggleRemoveNumberPopup() {
  removeNumberPopup.style.display = (removeNumberPopup.style.display === 'none' || removeNumberPopup.style.display === '') ? 'block' : 'none';
  updateNumberSelect();
}

function updateNumberSelect() {
  numberSelect.innerHTML = '';
  names.forEach(number => {
    const option = document.createElement('option');
    option.value = number;
    option.textContent = number;
    numberSelect.appendChild(option);
  });
}

function confirmRemoveNumber() {
  const selectedNumber = numberSelect.value;
  const index = names.indexOf(selectedNumber);
  if (index !== -1) {
    names.splice(index, 1);
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWheel();
  toggleRemoveNumberPopup();
}

document.getElementById('spinButton').addEventListener('click', spinWheel);
document.getElementById('closePopup').addEventListener('click', closePopup);
document.getElementById('showResultsButton').addEventListener('click', toggleResultsPopup);
document.getElementById('closeResultsPopup').addEventListener('click', toggleResultsPopup);
document.getElementById('openRemoveNumberPopup').addEventListener('click', toggleRemoveNumberPopup);
document.getElementById('confirmRemoveButton').addEventListener('click', confirmRemoveNumber);
document.getElementById('closeRemovePopup').addEventListener('click', toggleRemoveNumberPopup);

window.onload = () => {
  clearSessionResults();
  loadSessionResults();
  drawWheel();
};
