// Game state variables
let num1, num2, correctAnswer;
let correctCount = 0;
let incorrectCount = 0;
let totalCount = 0;
let selectedTables = [];
let gameHistory = [];
let timerInterval;
let timeRemaining = 30;
const QUESTION_TIME = 30; // seconds per question

// Initialize on page load
window.addEventListener('DOMContentLoaded', function() {
    initializeTableSelector();
    loadDarkModePreference();
    setupEventListeners();
});

// Initialize table selector with all multiplication tables
function initializeTableSelector() {
    const selector = document.getElementById('tableSelector');
    for (let i = 1; i <= 10; i++) {
        const option = document.createElement('div');
        option.className = 'table-option';
        option.textContent = `Tabla del ${i}`;
        option.dataset.table = i;
        option.addEventListener('click', function() {
            toggleTableSelection(this);
        });
        selector.appendChild(option);
    }
}

// Toggle table selection
function toggleTableSelection(element) {
    const tableNum = parseInt(element.dataset.table);
    element.classList.toggle('selected');
    
    if (element.classList.contains('selected')) {
        selectedTables.push(tableNum);
    } else {
        selectedTables = selectedTables.filter(t => t !== tableNum);
    }
}

// Setup event listeners
function setupEventListeners() {
    const answerInput = document.getElementById('answerInput');
    if (answerInput) {
        answerInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkAnswer();
            }
        });
    }
}

// Start the game
function startGame() {
    if (selectedTables.length === 0) {
        alert('¡Por favor selecciona al menos una tabla para practicar!');
        return;
    }
    
    // Reset game state
    correctCount = 0;
    incorrectCount = 0;
    totalCount = 0;
    gameHistory = [];
    
    // Switch screens
    document.getElementById('setupScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    document.getElementById('resetBtn').style.display = 'inline-block';
    
    // Start first question
    updateScoreDisplay();
    generateQuestion();
}

// Generate a new question
function generateQuestion() {
    // Stop any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Select random table from selected tables
    const randomTable = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    num1 = randomTable;
    num2 = Math.floor(Math.random() * 10) + 1;
    correctAnswer = num1 * num2;
    
    // Update question display
    document.getElementById('question').textContent = `¿Cuánto es ${num1} × ${num2}?`;
    document.getElementById('answerInput').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('answerInput').focus();
    
    // Remove any animation classes
    const gameMain = document.querySelector('.game-main');
    gameMain.classList.remove('correct-animation', 'incorrect-animation');
    
    // Start timer
    timeRemaining = QUESTION_TIME;
    updateTimerDisplay();
    timerInterval = setInterval(updateTimer, 1000);
}

// Update timer
function updateTimer() {
    timeRemaining--;
    updateTimerDisplay();
    
    if (timeRemaining <= 0) {
        clearInterval(timerInterval);
        handleTimeout();
    }
}

// Update timer display
function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `⏱️ Tiempo: ${timeRemaining}s`;
    
    if (timeRemaining <= 5) {
        timerElement.classList.add('warning');
    } else {
        timerElement.classList.remove('warning');
    }
}

// Handle timeout
function handleTimeout() {
    const answerInput = document.getElementById('answerInput');
    answerInput.disabled = true;
    
    const feedback = document.getElementById('feedback');
    feedback.textContent = `⏰ ¡Tiempo agotado! La respuesta correcta era ${correctAnswer}`;
    feedback.style.color = '#ff9800';
    
    incorrectCount++;
    totalCount++;
    
    addToHistory(num1, num2, 'Tiempo agotado', correctAnswer, false);
    updateScoreDisplay();
    
    setTimeout(() => {
        answerInput.disabled = false;
        generateQuestion();
    }, 2000);
}

// Check answer
function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answerInput').value);
    
    if (isNaN(userAnswer)) {
        alert('¡Por favor ingresa un número!');
        return;
    }
    
    // Clear timer
    clearInterval(timerInterval);
    
    const feedback = document.getElementById('feedback');
    const gameMain = document.querySelector('.game-main');
    
    totalCount++;
    
    if (userAnswer === correctAnswer) {
        // Correct answer
        correctCount++;
        feedback.textContent = '✅ ¡Correcto! ¡Excelente trabajo!';
        feedback.style.color = '#4CAF50';
        gameMain.classList.add('correct-animation');
        addToHistory(num1, num2, userAnswer, correctAnswer, true);
    } else {
        // Incorrect answer
        incorrectCount++;
        feedback.textContent = `❌ Incorrecto. La respuesta correcta es ${correctAnswer}`;
        feedback.style.color = '#f44336';
        gameMain.classList.add('incorrect-animation');
        addToHistory(num1, num2, userAnswer, correctAnswer, false);
    }
    
    updateScoreDisplay();
    
    // Generate next question after delay
    setTimeout(() => {
        generateQuestion();
    }, 2000);
}

// Add to history
function addToHistory(n1, n2, userAns, correctAns, isCorrect) {
    const historyItem = {
        question: `${n1} × ${n2}`,
        userAnswer: userAns,
        correctAnswer: correctAns,
        isCorrect: isCorrect,
        timestamp: new Date().toLocaleTimeString()
    };
    
    gameHistory.unshift(historyItem); // Add to beginning
    updateHistoryDisplay();
}

// Update history display
function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    
    if (gameHistory.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No hay respuestas aún...</p>';
        return;
    }
    
    historyList.innerHTML = '';
    
    // Show last 20 items
    const itemsToShow = gameHistory.slice(0, 20);
    
    itemsToShow.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${item.isCorrect ? 'correct' : 'incorrect'}`;
        
        const questionSpan = document.createElement('span');
        questionSpan.textContent = `${item.question} = ${item.correctAnswer}`;
        
        const answerSpan = document.createElement('span');
        if (item.isCorrect) {
            answerSpan.innerHTML = `✅ ${item.userAnswer}`;
        } else {
            answerSpan.innerHTML = `❌ ${item.userAnswer}`;
        }
        
        const timeSpan = document.createElement('div');
        timeSpan.className = 'history-time';
        timeSpan.textContent = item.timestamp;
        
        const leftDiv = document.createElement('div');
        leftDiv.appendChild(questionSpan);
        leftDiv.appendChild(timeSpan);
        
        historyItem.appendChild(leftDiv);
        historyItem.appendChild(answerSpan);
        
        historyList.appendChild(historyItem);
    });
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('correctScore').textContent = correctCount;
    document.getElementById('incorrectScore').textContent = incorrectCount;
    document.getElementById('totalScore').textContent = totalCount;
    
    // Animate score update
    const scoreNumbers = document.querySelectorAll('.score-number');
    scoreNumbers.forEach(num => {
        num.style.transform = 'scale(1.2)';
        setTimeout(() => {
            num.style.transform = 'scale(1)';
        }, 200);
    });
}

// Reset game
function resetGame() {
    if (!confirm('¿Estás seguro de que quieres reiniciar el juego y el historial?')) {
        return;
    }
    
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Reset all variables
    correctCount = 0;
    incorrectCount = 0;
    totalCount = 0;
    gameHistory = [];
    selectedTables = [];
    
    // Clear table selections
    document.querySelectorAll('.table-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Switch back to setup screen
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('setupScreen').classList.add('active');
    document.getElementById('resetBtn').style.display = 'none';
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    const btn = document.getElementById('darkModeBtn');
    if (isDark) {
        btn.textContent = '☀️ Modo Claro';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        btn.textContent = '🌙 Modo Oscuro';
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Load dark mode preference
function loadDarkModePreference() {
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'enabled') {
        document.body.classList.add('dark-mode');
        const btn = document.getElementById('darkModeBtn');
        if (btn) {
            btn.textContent = '☀️ Modo Claro';
        }
    }
}

// Add smooth transitions
document.addEventListener('DOMContentLoaded', function() {
    document.body.style.transition = 'all 0.3s ease';
});

// Accessibility: Announce score changes for screen readers
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
