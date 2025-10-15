// Variables del juego
let num1, num2, correctAnswer;
let correctCount = 0;
let incorrectCount = 0;
let records = [];

// Inicializar el juego
window.onload = function() {
    loadRecords();
    generateQuestion();
    
    // Permitir responder con Enter
    document.getElementById('answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
};

// Generar pregunta aleatoria
function generateQuestion() {
    num1 = Math.floor(Math.random() * 10) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    correctAnswer = num1 * num2;
    
    document.getElementById('question').textContent = `¿Cuánto es ${num1} × ${num2}?`;
    document.getElementById('answer').value = '';
    document.getElementById('feedback').textContent = '';
    document.getElementById('answer').focus();
}

// Comprobar respuesta
function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer').value);
    const feedback = document.getElementById('feedback');
    
    if (isNaN(userAnswer)) {
        feedback.textContent = '⚠️ Por favor ingresa un número';
        feedback.className = 'feedback';
        return;
    }
    
    if (userAnswer === correctAnswer) {
        correctCount++;
        feedback.textContent = '✅ ¡Correcto! ¡Muy bien!';
        feedback.className = 'feedback correct';
        saveRecord(num1, num2, userAnswer, true);
    } else {
        incorrectCount++;
        feedback.textContent = `❌ Incorrecto. La respuesta correcta es ${correctAnswer}`;
        feedback.className = 'feedback incorrect';
        saveRecord(num1, num2, userAnswer, false);
    }
    
    updateScore();
}

// Siguiente pregunta
function nextQuestion() {
    generateQuestion();
}

// Actualizar puntaje
function updateScore() {
    document.getElementById('correct').textContent = correctCount;
    document.getElementById('incorrect').textContent = incorrectCount;
}

// Guardar registro
function saveRecord(n1, n2, answer, isCorrect) {
    const record = {
        timestamp: new Date().toISOString(),
        question: `${n1} × ${n2}`,
        correctAnswer: n1 * n2,
        userAnswer: answer,
        isCorrect: isCorrect
    };
    
    records.push(record);
    localStorage.setItem('multiplicationRecords', JSON.stringify(records));
}

// Cargar registros guardados
function loadRecords() {
    const savedRecords = localStorage.getItem('multiplicationRecords');
    if (savedRecords) {
        records = JSON.parse(savedRecords);
        // Contar aciertos y errores de sesiones anteriores
        correctCount = records.filter(r => r.isCorrect).length;
        incorrectCount = records.filter(r => !r.isCorrect).length;
        updateScore();
    }
}
