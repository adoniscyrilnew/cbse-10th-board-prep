// CBSE 10th Board Prep - App Logic

// State
let currentMode = null; // 'mixed' or subject name
let currentQuestions = [];
let currentIndex = 0;
let answeredQuestions = new Set();
const QUESTIONS_PER_SESSION = 10;

// --- Initialization ---
function init() {
    updateQuestionCounts();
    document.getElementById('total-questions').textContent = QUESTION_BANK.length;
}

function updateQuestionCounts() {
    const subjects = ['mathematics', 'science', 'social_science', 'english', 'hindi'];
    subjects.forEach(subject => {
        const count = QUESTION_BANK.filter(q => q.subject === subject).length;
        const el = document.getElementById('count-' + subject);
        if (el) el.textContent = count + ' questions';
    });
}

// --- Navigation ---
function showSubjectPicker() {
    document.querySelector('.mode-selection').classList.add('hidden');
    document.getElementById('subject-picker').classList.remove('hidden');
}

function hideSubjectPicker() {
    document.querySelector('.mode-selection').classList.remove('hidden');
    document.getElementById('subject-picker').classList.add('hidden');
}

function goHome() {
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    document.querySelector('.mode-selection').classList.remove('hidden');
    document.getElementById('subject-picker').classList.add('hidden');
    currentQuestions = [];
    currentIndex = 0;
    answeredQuestions.clear();
}

// --- Start Quiz ---
function startMixedMode() {
    currentMode = 'mixed';
    const shuffled = shuffleArray([...QUESTION_BANK]);
    currentQuestions = shuffled.slice(0, QUESTIONS_PER_SESSION);
    startQuiz('Random Mix');
}

function startSubjectMode(subject) {
    currentMode = subject;
    const subjectQuestions = QUESTION_BANK.filter(q => q.subject === subject);
    const shuffled = shuffleArray([...subjectQuestions]);
    currentQuestions = shuffled.slice(0, Math.min(QUESTIONS_PER_SESSION, shuffled.length));
    startQuiz(SUBJECT_NAMES[subject]);
}

function startQuiz(modeLabel) {
    currentIndex = 0;
    answeredQuestions.clear();

    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('quiz-mode-label').textContent = modeLabel;

    renderDots();
    renderQuestion();
}

// --- Render Question ---
function renderQuestion() {
    const q = currentQuestions[currentIndex];
    const total = currentQuestions.length;

    // Progress
    document.getElementById('quiz-progress').textContent = `Question ${currentIndex + 1} of ${total}`;
    document.getElementById('progress-bar').style.width = ((currentIndex + 1) / total * 100) + '%';

    // Meta badges
    const card = document.getElementById('question-card');
    card.setAttribute('data-subject', q.subject);
    document.getElementById('q-subject').textContent = SUBJECT_NAMES[q.subject];
    document.getElementById('q-year').textContent = q.year;
    document.getElementById('q-type').textContent = q.type;
    document.getElementById('q-marks').textContent = q.marks + (q.marks === 1 ? ' Mark' : ' Marks');
    document.getElementById('q-chapter').textContent = q.chapter;

    // Question text
    document.getElementById('question-text').innerHTML = formatText(q.question);

    // MCQ options
    const mcqContainer = document.getElementById('mcq-options');
    if (q.options && q.options.length > 0) {
        mcqContainer.classList.remove('hidden');
        mcqContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        q.options.forEach((opt, i) => {
            if (opt.startsWith('__')) return; // skip placeholder options
            const div = document.createElement('div');
            div.className = 'mcq-option';
            div.onclick = () => selectOption(i);
            div.innerHTML = `
                <span class="option-letter">${letters[i]}</span>
                <span class="option-text">${formatText(opt)}</span>
            `;
            mcqContainer.appendChild(div);
        });
    } else {
        mcqContainer.classList.add('hidden');
    }

    // Answer section
    document.getElementById('answer-section').classList.remove('hidden');
    document.getElementById('answer-content').classList.add('hidden');
    document.getElementById('answer-toggle-icon').classList.remove('open');
    document.getElementById('answer-content').innerHTML = formatText(q.answer);

    // Nav buttons
    document.getElementById('prev-btn').disabled = currentIndex === 0;
    document.getElementById('next-btn').textContent = currentIndex === total - 1 ? 'Finish' : 'Next \u2192';

    // Update dots
    updateDots();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- MCQ Selection ---
function selectOption(index) {
    const q = currentQuestions[currentIndex];
    const options = document.querySelectorAll('#mcq-options .mcq-option');

    // Remove previous selections
    options.forEach(opt => {
        opt.classList.remove('selected', 'correct', 'incorrect');
    });

    // Mark selected
    options[index].classList.add('selected');

    // If has correct answer, show correct/incorrect
    if (q.correctOption !== undefined) {
        answeredQuestions.add(currentIndex);

        if (index === q.correctOption) {
            options[index].classList.add('correct');
        } else {
            options[index].classList.add('incorrect');
            options[q.correctOption].classList.add('correct');
        }

        // Auto-show answer
        showAnswer();
        updateDots();
    }
}

// --- Answer Toggle ---
function showAnswer() {
    document.getElementById('answer-content').classList.remove('hidden');
    document.getElementById('answer-toggle-icon').classList.add('open');
    answeredQuestions.add(currentIndex);
    updateDots();
}

function toggleAnswer() {
    const content = document.getElementById('answer-content');
    const icon = document.getElementById('answer-toggle-icon');
    content.classList.toggle('hidden');
    icon.classList.toggle('open');
}

// --- Navigation ---
function nextQuestion() {
    if (currentIndex < currentQuestions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        showResults();
    }
}

function prevQuestion() {
    if (currentIndex > 0) {
        currentIndex--;
        renderQuestion();
    }
}

function goToQuestion(index) {
    currentIndex = index;
    renderQuestion();
}

// --- Dots ---
function renderDots() {
    const container = document.getElementById('question-dots');
    container.innerHTML = '';
    currentQuestions.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.textContent = i + 1;
        dot.onclick = () => goToQuestion(i);
        container.appendChild(dot);
    });
}

function updateDots() {
    const dots = document.querySelectorAll('#question-dots .dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('active', 'answered');
        if (i === currentIndex) {
            dot.classList.add('active');
        } else if (answeredQuestions.has(i)) {
            dot.classList.add('answered');
        }
    });
}

// --- Results ---
function showResults() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.remove('hidden');

    const total = currentQuestions.length;
    const answered = answeredQuestions.size;
    document.getElementById('results-summary').textContent =
        `You practiced ${total} questions and viewed answers for ${answered} of them. Keep it up!`;
}

function restartSameMode() {
    if (currentMode === 'mixed') {
        startMixedMode();
    } else {
        startSubjectMode(currentMode);
    }
}

// --- Utilities ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function formatText(text) {
    if (!text) return '';
    // Convert newlines to <br> but preserve paragraph structure
    return text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

// --- Keyboard shortcuts ---
document.addEventListener('keydown', (e) => {
    if (document.getElementById('quiz-screen').classList.contains('hidden')) return;

    switch(e.key) {
        case 'ArrowRight':
        case 'n':
            nextQuestion();
            break;
        case 'ArrowLeft':
        case 'p':
            prevQuestion();
            break;
        case 's':
        case ' ':
            e.preventDefault();
            showAnswer();
            break;
        case '1':
        case '2':
        case '3':
        case '4':
            const optIndex = parseInt(e.key) - 1;
            const opts = document.querySelectorAll('#mcq-options .mcq-option');
            if (opts[optIndex]) selectOption(optIndex);
            break;
    }
});

// Initialize on load
init();
