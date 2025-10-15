/*
  Juego Matemático de Tablas
  Mejoras:
  - Botón PDF funcional en pantalla de resultados (usa jsPDF y autoTable opcional)
  - Integración con Google Sheets (hoja pública proporcionada)
  - Envío de resultados al terminar y lectura de ranking global
  - Código comentado y organizado
*/

// =============================
// Estado del juego
// =============================
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
const difficultyMultipliers = { facil: 5, medio: 10, dificil: 12, 'muy-dificil': 15 };

// Historial de preguntas para PDF: { a, b, respuestaUsuario, correcta, resultadoCorrecto }
let questionHistory = [];

// =============================
// Elementos del DOM
// =============================
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
const downloadPdfButton = document.getElementById('download-pdf');
const rankingContainer = document.getElementById('ranking');

// =============================
// Configuración de Google Sheets
// =============================
// Para escribir/leer a una hoja pública de forma segura, se recomienda un Google Apps Script
// (GAS) desplegado como Web App que escriba en esa hoja. Aquí usamos endpoints públicos.
// Debes crear en tu cuenta un Apps Script vinculado a esa hoja y publicar un Web App con acceso "Cualquiera".
// Usa la URL del Web App en SHEETS_WRITE_URL para registrar partidas y SHEETS_READ_URL para leer ranking.
// Nota: No es posible escribir directamente a la hoja solo con la URL de visualización pública.

// Reemplaza estas URL con las de tu Apps Script:
const SHEETS_WRITE_URL = 'https://script.google.com/macros/s/REEMPLAZA_AQUI/exec'; // POST {player, score, correct, incorrect, total, millis, difficulty, dateISO}
const SHEETS_READ_URL = 'https://script.google.com/macros/s/REEMPLAZA_AQUI/exec?action=leaderboard'; // GET devuelve ranking JSON

// Además, guarda la ID de la hoja por referencia (no se usa para fetch directo, solo documental)
const SHEET_DOC_URL = 'https://docs.google.com/spreadsheets/d/13W-VHTd0R_awvJ5JTGU9Ruu7j71U1QstFAt76McGmmk/edit?usp=sharing';

// =============================
// Utilidades
// =============================
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function startGame() {
  // Leer selección de tablas, jugador, dificultad, número de preguntas del DOM
  const nameInput = document.getElementById('player-name');
  const diffSelect = document.getElementById('difficulty');
  const qSelect = document.getElementById('questions-count');
  const tablesChecks = Array.from(document.querySelectorAll('input[name="tables"]:checked'));

  playerName = (nameInput?.value || '').trim() || 'Anónimo';
  difficulty = diffSelect?.value || 'medio';
  maxQuestions = parseInt(qSelect?.value || '10', 10);
  selectedTables = tablesChecks.map(c => parseInt(c.value, 10));
  if (selectedTables.length === 0) selectedTables = [1,2,3,4,5,6,7,8,9,10];

  score = 0; incorrectCount = 0; correctCount = 0; totalCount = 0; questionCount = 0;
  questionHistory = [];
  startTime = Date.now();

  setupScreen?.classList.add('hidden');
  gameScreen?.classList.remove('hidden');

  nextQuestion();
}

function nextQuestion() {
  if (questionCount >= maxQuestions) {
    endGame();
    return;
  }
  const a = selectedTables[randInt(0, selectedTables.length - 1)];
  const b = randInt(0, difficulty === 'facil' ? 10 : difficulty === 'medio' ? 12 : difficulty === 'dificil' ? 15 : 20);
  currentQuestion = { a, b };
  questionElement.textContent = `${a} × ${b} = ?`;
  answerInput.value = '';
  feedbackElement.textContent = '';
  questionCount++;
  updateProgress();
}

function updateProgress() {
  scoreElement.textContent = String(score);
  incorrectElement.textContent = String(incorrectCount);
  totalElement.textContent = `${correctCount + incorrectCount}/${maxQuestions}`;
  progressElement.style.width = `${((correctCount + incorrectCount) / maxQuestions) * 100}%`;
}

function submitAnswer() {
  const userVal = parseInt(answerInput.value, 10);
  const correctVal = currentQuestion.a * currentQuestion.b;
  const ok = userVal === correctVal;
  if (ok) { score += difficultyMultipliers[difficulty] || 10; correctCount++; feedbackElement.textContent = '¡Correcto!'; }
  else { incorrectCount++; feedbackElement.textContent = `Incorrecto. Era ${correctVal}`; }
  totalCount = correctCount + incorrectCount;

  // Guardamos en historial para PDF
  questionHistory.push({ a: currentQuestion.a, b: currentQuestion.b, respuestaUsuario: isNaN(userVal) ? '' : userVal, correcta: ok, resultadoCorrecto: correctVal });

  updateProgress();

  // Siguiente con pequeño retardo
  setTimeout(nextQuestion, 500);
}

function endGame() {
  const millis = Date.now() - startTime;
  gameScreen?.classList.add('hidden');
  resultsScreen?.classList.remove('hidden');
  finalScoreElement.textContent = `${score}`;
  finalCorrectElement.textContent = `${correctCount}`;
  finalIncorrectElement.textContent = `${incorrectCount}`;

  // Enviar resultado a Sheets y luego refrescar ranking
  sendResultToSheets({
    player: playerName,
    score,
    correct: correctCount,
    incorrect: incorrectCount,
    total: maxQuestions,
    millis,
    difficulty,
    dateISO: new Date().toISOString()
  }).finally(loadRankingFromSheets);
}

// =============================
// PDF: generación y descarga
// =============================
// Requiere que en index.html esté cargado jsPDF (y opcionalmente autoTable)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>

function generateResultsPDF() {
  try {
    // Detectar jsPDF
    const jsPDF = window.jspdf?.jsPDF || window.jsPDF; // compatibilidad
    if (!jsPDF) {
      alert('No se encontró jsPDF. Verifica el script en index.html.');
      return;
    }
    const doc = new jsPDF('p', 'pt', 'a4');
    const margin = 40;
    let y = margin;

    // Encabezado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Reporte de Partida - Juego de Tablas', margin, y);
    y += 20;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Jugador: ${playerName}`, margin, y); y += 14;
    doc.text(`Dificultad: ${difficulty}`, margin, y); y += 14;
    doc.text(`Puntaje: ${score} | Aciertos: ${correctCount} | Errores: ${incorrectCount}`, margin, y); y += 14;
    doc.text(`Total preguntas: ${maxQuestions} | Fecha: ${new Date().toLocaleString()}`, margin, y); y += 20;

    // Tabla simple con historial
    const useAutoTable = !!doc.autoTable; // si está disponible
    if (useAutoTable) {
      const rows = questionHistory.map(q => [ `${q.a} × ${q.b}`, String(q.respuestaUsuario), String(q.resultadoCorrecto), q.correcta ? '✅' : '❌' ]);
      doc.autoTable({
        head: [['Pregunta', 'Tu respuesta', 'Correcta', 'Resultado']],
        body: rows,
        startY: y,
        theme: 'grid',
        styles: { fontSize: 10 }
      });
    } else {
      // Dibujo manual si no está autotable
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

      const lineHeight = 14;
      const maxY = 780; // límite aprox
      questionHistory.forEach(q => {
        const pregunta = `${q.a} × ${q.b}`;
        const tuResp = String(q.respuestaUsuario);
        const esCorr = q.correcta ? '✅' : '❌';
        const resultado = String(q.resultadoCorrecto);
        if (y + lineHeight > maxY) { doc.addPage(); y = margin; }
        doc.text(pregunta, colX[0], y);
        doc.text(tuResp, colX[1], y);
        doc.text(esCorr, colX[2], y);
        doc.text(resultado, colX[3], y);
        y += lineHeight;
      });
    }

    // Nombre de archivo amigable
    const safeName = (playerName || 'sin-nombre').toLowerCase().replace(/\s+/g, '-');
    const safeDiff = (difficulty || 'medio').replace(/\s+/g, '-');
    const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-');
    const fileName = `${safeName}_${safeDiff}_${stamp}.pdf`;

    doc.save(fileName);
  } catch (err) {
    console.error('Error generando PDF', err);
    alert('Ocurrió un error al generar el PDF. Revisa la consola.');
  }
}

// Enlazar botón de descarga si existe
if (downloadPdfButton) {
  downloadPdfButton.addEventListener('click', generateResultsPDF);
}

// =============================
// Integración con Google Sheets (vía Apps Script Web App)
// =============================
// sendResultToSheets: envía los datos de la partida al endpoint (POST JSON)
async function sendResultToSheets(payload) {
  if (!SHEETS_WRITE_URL.includes('script.google.com')) {
    console.warn('SHEETS_WRITE_URL no configurada. Omite envío.');
    return;
  }
  try {
    const res = await fetch(SHEETS_WRITE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json().catch(() => ({}));
    console.log('Resultado enviado a Sheets', data);
  } catch (e) {
    console.error('Error enviando a Sheets:', e);
  }
}

// loadRankingFromSheets: obtiene ranking y lo pinta
async function loadRankingFromSheets() {
  if (!SHEETS_READ_URL.includes('script.google.com')) {
    console.warn('SHEETS_READ_URL no configurada. Omite lectura.');
    return;
  }
  try {
    const res = await fetch(SHEETS_READ_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Se espera un JSON tipo: { leaderboard: [ { player, score, correct, incorrect, total, millis, difficulty, dateISO }, ... ] }
    const list = Array.isArray(data.leaderboard) ? data.leaderboard : [];
    renderRanking(list);
  } catch (e) {
    console.error('Error leyendo ranking de Sheets:', e);
  }
}

function renderRanking(list) {
  if (!rankingContainer) return;
  rankingContainer.innerHTML = '';
  if (list.length === 0) {
    rankingContainer.textContent = 'Sin datos de ranking aún.';
    return;
  }
  const ol = document.createElement('ol');
  list
    .sort((a,b) => (b.score||0) - (a.score||0))
    .slice(0, 20)
    .forEach((row) => {
      const li = document.createElement('li');
      const name = row.player || 'Anónimo';
      const diff = row.difficulty || 'medio';
      const scoreTxt = row.score ?? 0;
      const acc = row.total ? Math.round((row.correct||0)/row.total*100) : 0;
      li.textContent = `${name} — ${scoreTxt} pts — ${acc}% acierto — ${diff}`;
      ol.appendChild(li);
    });
  rankingContainer.appendChild(ol);
}

// =============================
// Eventos
// =============================
startButton?.addEventListener('click', startGame);
submitButton?.addEventListener('click', submitAnswer);
answerInput?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submitAnswer(); });
restartButton?.addEventListener('click', () => { location.reload(); });

// Cargar ranking al inicio (si ya hay backend)
loadRankingFromSheets();
