// Game state variables
let currentQuestion = {};
let score = 0;
let incorrectCount = 0;
let correctCount = 0;
let totalCount = 0;
let selectedTables = [];
let questionCount = 0;
let maxQuestions = 10;
let isDarkMode = false;
let startTime = null;
let playerName = '';
let difficulty = 'medio';
let difficultyMultipliers = { facil: 5, medio: 10, dificil: 12, 'muy-dificil': 15 };

// NUEVO: historial de preguntas para PDF y análisis
// Cada entrada tendrá: { a, b, respuestaUsuario, correcta, resultadoCorrecto }
let questionHistory = [];

// DOM Elements
const setupScreen = document.getElementById('setup-screen');
const gameScreen = document.getElementById('game-screen');
const resultsScreen = document.getElementById('results-screen');
const questionElement = document.getElementById('question');
const answerInput = document.getElementById('answer');
const feedbackElement = document.getElementById('feedback');
const scoreElement = document.getElementById('score');
const incorrectElement = document.getElementById('incorrect');
const totalElement = document.getElementById('total');
const progressElement = document.getElementById('progress');
const finalScoreElement = document.getElementById('final-score');
const finalCorrectElement = document.getElementById('final-correct');
const finalIncorrectElement = document.getElementById('final-incorrect');
const startButton = document.getElementById('start-button');
const submitButton = document.getElementById('submit');
const restartButton = document.getElementById('restart');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const playerNameInput = document.getElementById('player-name');
const difficultySelect = document.getElementById('difficulty-select');
const rankingContainer = document.getElementById('ranking-container');
// NUEVO: botón para descargar PDF en la pantalla de resultados
const downloadPdfButton = document.getElementById('download-pdf');

// Utilidades
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toggleScreens(showGame) {
  setupScreen.classList.toggle('hidden', showGame);
  gameScreen.classList.toggle('hidden', !showGame);
}

function showResultsScreen() {
  setupScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  resultsScreen.classList.remove('hidden');
}

function resetGameState() {
  score = 0;
  incorrectCount = 0;
  correctCount = 0;
  totalCount = 0;
  questionCount = 0;
  questionHistory = []; // NUEVO: vaciar historial al reiniciar
  feedbackElement.textContent = '';
  scoreElement.textContent = '0';
  incorrectElement.textContent = '0';
  totalElement.textContent = '0';
  progressElement.textContent = `Pregunta 0 de ${maxQuestions}`;
}

// Inicialización
playerNameInput.addEventListener('input', () => {
  playerName = playerNameInput.value.trim();
  startButton.disabled = !(playerName && selectedTables.length > 0);
});

difficultySelect.addEventListener('change', () => {
  difficulty = difficultySelect.value;
});

// Selección de tablas
const tablesContainer = document.getElementById('tables');
tablesContainer.addEventListener('click', (e) => {
  const btn = e.target.closest('.table-button');
  if (!btn) return;
  const t = Number(btn.dataset.table);
  if (selectedTables.includes(t)) {
    selectedTables = selectedTables.filter(x => x !== t);
    btn.classList.remove('active');
  } else {
    selectedTables.push(t);
    btn.classList.add('active');
  }
  startButton.disabled = !(playerName && selectedTables.length > 0);
});

// Generación de una nueva pregunta
function nextQuestion() {
  const max = difficultyMultipliers[difficulty] || 10;
  const a = selectedTables[Math.floor(Math.random() * selectedTables.length)];
  const b = rand(1, max);
  currentQuestion = { a, b, answer: a * b };
  questionElement.textContent = `¿Cuánto es ${a} × ${b}?`;
  answerInput.value = '';
  answerInput.focus();
}

function startGame() {
  resetGameState();
  startTime = Date.now();
  toggleScreens(true);
  nextQuestion();
}

function finishGame() {
  // Mostrar resultados finales
  finalScoreElement.textContent = String(score);
  finalCorrectElement.textContent = String(correctCount);
  finalIncorrectElement.textContent = String(incorrectCount);
  showResultsScreen();
  // Guardar resultado en ranking/localStorage si ya estaba implementado
  try { saveGameResult && saveGameResult({ playerName, score, correctCount, incorrectCount, totalCount, difficulty, selectedTables }); } catch {}
}

function checkAnswer() {
  const val = Number(answerInput.value);
  if (Number.isNaN(val)) {
    feedbackElement.textContent = 'Ingresa un número válido.';
    feedbackElement.className = 'feedback warning';
    return;
  }

  const isCorrect = val === currentQuestion.answer;

  // NUEVO: registrar esta pregunta en el historial para el PDF
  questionHistory.push({
    a: currentQuestion.a,
    b: currentQuestion.b,
    respuestaUsuario: val,
    correcta: isCorrect,
    resultadoCorrecto: currentQuestion.answer
  });

  if (isCorrect) {
    score += 10; // o la lógica existente
    correctCount += 1;
    feedbackElement.textContent = '✅ ¡Correcto!';
    feedbackElement.className = 'feedback correct';
  } else {
    incorrectCount += 1;
    feedbackElement.textContent = `❌ Incorrecto. La respuesta correcta era ${currentQuestion.answer}.`;
    feedbackElement.className = 'feedback incorrect';
  }

  totalCount += 1;
  questionCount += 1;

  // Actualizar UI
  scoreElement.textContent = String(score);
  incorrectElement.textContent = String(incorrectCount);
  totalElement.textContent = String(totalCount);
  progressElement.textContent = `Pregunta ${questionCount} de ${maxQuestions}`;

  // Continuar o finalizar
  if (questionCount >= maxQuestions) {
    finishGame();
  } else {
    nextQuestion();
  }
}

// Modo oscuro
function applyDarkMode() {
  document.body.classList.toggle('dark-mode', isDarkMode);
}

darkModeToggle.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  applyDarkMode();
});

// Eventos principales
startButton.addEventListener('click', startGame);
submitButton.addEventListener('click', checkAnswer);
answerInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkAnswer();
});

restartButton.addEventListener('click', () => {
  resultsScreen.classList.add('hidden');
  setupScreen.classList.remove('hidden');
});

// NUEVO: generación de PDF usando jsPDF
// Esta función crea un PDF con: nombre, tablas, dificultad, puntaje, aciertos, errores e historial
async function generateResultsPDF() {
  // jsPDF está expuesto en window.jspdf.jsPDF cuando se carga desde CDN
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    alert('No se pudo cargar jsPDF. Revisa tu conexión a Internet.');
    return;
  }

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = margin;

  // Encabezado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Resultados - Juego de Tablas de Multiplicar', margin, y);
  y += 24;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const fecha = new Date().toLocaleString();
  doc.text(`Fecha: ${fecha}`, margin, y);
  y += 18;

  // Datos principales
  const tablasTxt = selectedTables.length ? selectedTables.sort((a,b)=>a-b).join(', ') : 'N/A';
  doc.text(`Nombre: ${playerName || 'Sin nombre'}`, margin, y); y += 16;
  doc.text(`Dificultad: ${difficulty}`, margin, y); y += 16;
  doc.text(`Tablas: ${tablasTxt}`, margin, y); y += 16;
  doc.text(`Puntaje: ${score}`, margin, y); y += 16;
  doc.text(`Aciertos: ${correctCount}`, margin, y); y += 16;
  doc.text(`Errores: ${incorrectCount}`, margin, y); y += 24;

  // Subtítulo historial
  doc.setFont('helvetica', 'bold');
  doc.text('Historial de preguntas', margin, y); y += 16;
  doc.setFont('helvetica', 'normal');

  // Columnas
  const colX = [margin, margin + 140, margin + 300, margin + 420];
  doc.setFontSize(10);
  doc.text('Pregunta', colX[0], y);
  doc.text('Tu respuesta', colX[1], y);
  doc.text('Correcta', colX[2], y);
  doc.text('Resultado', colX[3], y);
  y += 12;
  doc.setLineWidth(0.5);
  doc.line(margin, y, 555, y);
  y += 10;

  // Filas con salto de página cuando se acerque al final
  const lineHeight = 14;
  const maxY = 780; // límite aprox para A4 en pt con margen
  questionHistory.forEach((q) => {
    const pregunta = `${q.a} × ${q.b}`;
    const tuResp = String(q.respuestaUsuario);
    const esCorr = q.correcta ? '✅' : '❌';
    const resultado = String(q.resultadoCorrecto);

    if (y + lineHeight > maxY) {
      doc.addPage();
      y = margin;
    }

    doc.text(pregunta, colX[0], y);
    doc.text(tuResp, colX[1], y);
    doc.text(esCorr, colX[2], y);
    doc.text(resultado, colX[3], y);
    y += lineHeight;
  });

  // Nombre de archivo amigable: nombre_dificultad_fecha.pdf
  const safeName = (playerName || 'sin-nombre').toLowerCase().replace(/\s+/g, '-');
  const safeDiff = (difficulty || 'medio').replace(/\s+/g, '-');
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-');
  const fileName = `${safeName}_${safeDiff}_${stamp}.pdf`;

  doc.save(fileName);
}

// Enlazar botón de descarga en resultados (si existe en el DOM actual)
if (downloadPdfButton) {
  downloadPdfButton.addEventListener('click', generateResultsPDF);
}
