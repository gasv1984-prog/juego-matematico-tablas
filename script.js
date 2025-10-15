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
const motivationalMessage = document.getElementById('motivational-message');

// LocalStorage functions
function getPlayerData() {
    const data = localStorage.getItem('multiplicationGameData');
    return data ? JSON.parse(data) : { players: [] };
}

function savePlayerData(data) {
    localStorage.setItem('multiplicationGameData', JSON.stringify(data));
}

function saveGameResult(playerName, score, correct, incorrect, total, difficulty, duration) {
    const data = getPlayerData();
    const player = data.players.find(p => p.name === playerName);
    
    const gameResult = {
        date: new Date().toISOString(),
        score,
        correct,
        incorrect,
        total,
        difficulty,
        duration,
        percentage: Math.round((correct / total) * 100)
    };
    
    if (player) {
        player.games.push(gameResult);
        player.totalGames++;
        player.bestScore = Math.max(player.bestScore, score);
        player.totalCorrect += correct;
        player.totalQuestions += total;
    } else {
        data.players.push({
            name: playerName,
            games: [gameResult],
            totalGames: 1,
            bestScore: score,
            totalCorrect: correct,
            totalQuestions: total
        });
    }
    
    savePlayerData(data);
}

function displayRanking() {
    const data = getPlayerData();
    const sortedPlayers = data.players
        .sort((a, b) => b.bestScore - a.bestScore)
        .slice(0, 10);
    
    if (sortedPlayers.length === 0) {
        rankingContainer.innerHTML = '<p class="no-ranking">🏆 Aún no hay jugadores en el ranking. ¡Sé el primero!</p>';
        return;
    }
    
    let rankingHTML = '<h3>🏆 Top 10 Jugadores</h3><div class="ranking-list">';
    sortedPlayers.forEach((player, index) => {
        const avgPercentage = Math.round((player.totalCorrect / player.totalQuestions) * 100);
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        rankingHTML += `
            <div class="ranking-item">
                <span class="ranking-position">${medal}</span>
                <span class="ranking-name">${player.name}</span>
                <span class="ranking-stats">
                    Mejor: ${player.bestScore} pts | Promedio: ${avgPercentage}% | Juegos: ${player.totalGames}
                </span>
            </div>
        `;
    });
    rankingHTML += '</div>';
    rankingContainer.innerHTML = rankingHTML;
}

function getMotivationalMessage(percentage, playerName) {
    const data = getPlayerData();
    const player = data.players.find(p => p.name === playerName);
    
    let message = '';
    let tips = '';
    
    if (percentage === 100) {
        message = `🌟 ¡PERFECTO, ${playerName}! ¡Has demostrado ser un maestro de las multiplicaciones!`;
        tips = '💡 Consejo: ¡Intenta aumentar la dificultad para un mayor desafío!';
    } else if (percentage >= 90) {
        message = `🎉 ¡Excelente trabajo, ${playerName}! Estás muy cerca de la perfección.`;
        tips = '💡 Consejo: Repasa las tablas donde fallaste para lograr el 100%.';
    } else if (percentage >= 75) {
        message = `👍 ¡Muy bien, ${playerName}! Vas por buen camino.`;
        tips = '💡 Consejo: Practica las tablas más difíciles un poco más cada día.';
    } else if (percentage >= 50) {
        message = `💪 ¡Sigue esforzándote, ${playerName}! Cada intento te hace mejor.`;
        tips = '💡 Consejo: Intenta memorizar las tablas que más se te dificultan. ¡Tú puedes!';
    } else {
        message = `🌱 No te desanimes, ${playerName}. Todos empezamos desde abajo.`;
        tips = '💡 Consejo: Empieza con una dificultad más fácil y practica todos los días.';
    }
    
    if (player && player.totalGames > 1) {
        const lastGame = player.games[player.games.length - 2];
        if (percentage > lastGame.percentage) {
            message += ` <br><strong>📈 ¡Mejoraste ${Math.round(percentage - lastGame.percentage)}% desde tu último juego!</strong>`;
        }
    }
    
    return `${message}<br><br>${tips}`;
}

function initializeDarkMode() {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
    }
}

darkModeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
});

const tableButtons = document.querySelectorAll('.table-button');
tableButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.classList.toggle('active');
        updateSelectedTables();
    });
});

function updateSelectedTables() {
    selectedTables = [];
    tableButtons.forEach(button => {
        if (button.classList.contains('active')) {
            selectedTables.push(parseInt(button.dataset.table));
        }
    });
    startButton.disabled = selectedTables.length === 0 || !playerNameInput.value.trim();
}

playerNameInput.addEventListener('input', () => {
    updateSelectedTables();
});

difficultySelect.addEventListener('change', (e) => {
    difficulty = e.target.value;
});

startButton.addEventListener('click', startGame);

function startGame() {
    playerName = playerNameInput.value.trim();
    if (selectedTables.length === 0 || !playerName) {
        alert('Por favor, ingresa tu nombre y selecciona al menos una tabla.');
        return;
    }
    
    score = 0;
    incorrectCount = 0;
    correctCount = 0;
    totalCount = 0;
    questionCount = 0;
    startTime = Date.now();
    
    setupScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resultsScreen.classList.add('hidden');
    
    nextQuestion();
}

function generateQuestion() {
    const table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    const multiplier = Math.floor(Math.random() * difficultyMultipliers[difficulty]) + 1;
    return {
        num1: table,
        num2: multiplier,
        answer: table * multiplier
    };
}

function nextQuestion() {
    if (questionCount >= maxQuestions) {
        endGame();
        return;
    }
    
    currentQuestion = generateQuestion();
    questionCount++;
    
    questionElement.textContent = `${currentQuestion.num1} × ${currentQuestion.num2} = ?`;
    answerInput.value = '';
    answerInput.focus();
    feedbackElement.textContent = '';
    feedbackElement.className = 'feedback';
    
    updateProgress();
}

function updateProgress() {
    progressElement.textContent = `Pregunta ${questionCount} de ${maxQuestions}`;
}

function updateScore() {
    scoreElement.textContent = correctCount;
    incorrectElement.textContent = incorrectCount;
    totalElement.textContent = totalCount;
    announceScore();
}

submitButton.addEventListener('click', checkAnswer);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    
    if (isNaN(userAnswer)) {
        feedbackElement.textContent = '⚠️ Por favor, ingresa un número válido';
        feedbackElement.className = 'feedback warning';
        return;
    }
    
    totalCount++;
    
    if (userAnswer === currentQuestion.answer) {
        correctCount++;
        score += 10;
        feedbackElement.textContent = '✅ ¡Correcto! ¡Excelente!';
        feedbackElement.className = 'feedback correct';
    } else {
        incorrectCount++;
        feedbackElement.textContent = `❌ Incorrecto. La respuesta correcta es ${currentQuestion.answer}`;
        feedbackElement.className = 'feedback incorrect';
    }
    
    updateScore();
    
    setTimeout(() => {
        nextQuestion();
    }, 1500);
}

function endGame() {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const percentage = Math.round((correctCount / totalCount) * 100);
    
    saveGameResult(playerName, score, correctCount, incorrectCount, totalCount, difficulty, duration);
    
    gameScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    
    finalScoreElement.textContent = score;
    finalCorrectElement.textContent = correctCount;
    finalIncorrectElement.textContent = incorrectCount;
    
    motivationalMessage.innerHTML = getMotivationalMessage(percentage, playerName);
    
    displayRanking();
}

restartButton.addEventListener('click', () => {
    resultsScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    
    tableButtons.forEach(button => button.classList.remove('active'));
    selectedTables = [];
    playerNameInput.value = '';
    difficultySelect.value = 'medio';
    difficulty = 'medio';
    startButton.disabled = true;
    
    displayRanking();
});

document.addEventListener('DOMContentLoaded', function() {
    document.body.style.transition = 'all 0.3s ease';
    initializeDarkMode();
    displayRanking();
});

function announceScore() {
    const announcement = `Aciertos: ${correctCount}, Errores: ${incorrectCount}, Total: ${totalCount}`;
    const srOnly = document.createElement('div');
    srOnly.className = 'visually-hidden';
    srOnly.setAttribute('role', 'status');
    srOnly.setAttribute('aria-live', 'polite');
    srOnly.textContent = announcement;
    document.body.appendChild(srOnly);
    setTimeout(() => srOnly.remove(), 1000);
}
