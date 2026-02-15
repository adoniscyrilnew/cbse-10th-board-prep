// CBSE 10th Maths Prep - App Logic

// State
let currentMode = null; // 'random' or chapter id
let selectedChapter = null;
let currentQuestions = [];
let currentIndex = 0;
let answeredQuestions = new Set();
let questionCount = 10;

// Chapter names
const CHAPTERS = [
    { id: 1, name: "Real Numbers" },
    { id: 2, name: "Polynomials" },
    { id: 3, name: "Pair of Linear Equations in Two Variables" },
    { id: 4, name: "Quadratic Equations" },
    { id: 5, name: "Arithmetic Progressions" },
    { id: 6, name: "Triangles" },
    { id: 7, name: "Coordinate Geometry" },
    { id: 8, name: "Introduction to Trigonometry" },
    { id: 9, name: "Some Applications of Trigonometry" },
    { id: 10, name: "Circles" },
    { id: 11, name: "Areas Related to Circles" },
    { id: 12, name: "Surface Areas and Volumes" },
    { id: 13, name: "Statistics" },
    { id: 14, name: "Probability" }
];

// --- Initialization ---
function init() {
    document.getElementById('total-questions').textContent = QUESTION_BANK.length;
    document.getElementById('total-chapters').textContent = CHAPTERS.length;
    buildChapterGrid();
}

function buildChapterGrid() {
    const grid = document.getElementById('chapter-grid');
    grid.innerHTML = '';
    CHAPTERS.forEach(ch => {
        const count = QUESTION_BANK.filter(q => q.chapter_id === ch.id).length;
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.onclick = () => selectChapter(ch.id);
        card.innerHTML = `
            <span class="chapter-num">${ch.id}</span>
            <div class="chapter-info">
                <h4>${ch.name}</h4>
                <span class="q-count">${count} questions</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- Navigation ---
function showChapterPicker() {
    document.querySelector('.mode-selection').classList.add('hidden');
    document.getElementById('chapter-picker').classList.remove('hidden');
    document.getElementById('count-selector').classList.add('hidden');
    document.getElementById('stats-bar').classList.add('hidden');
}

function hideChapterPicker() {
    document.querySelector('.mode-selection').classList.remove('hidden');
    document.getElementById('chapter-picker').classList.add('hidden');
    document.getElementById('stats-bar').classList.remove('hidden');
}

function showCountSelector(title) {
    document.querySelector('.mode-selection').classList.add('hidden');
    document.getElementById('chapter-picker').classList.add('hidden');
    document.getElementById('count-selector').classList.remove('hidden');
    document.getElementById('count-selector-title').textContent = title;
    document.getElementById('stats-bar').classList.add('hidden');
}

function hideCountSelector() {
    if (selectedChapter) {
        // Go back to chapter picker
        document.getElementById('count-selector').classList.add('hidden');
        document.getElementById('chapter-picker').classList.remove('hidden');
    } else {
        // Go back to mode selection
        document.getElementById('count-selector').classList.add('hidden');
        document.querySelector('.mode-selection').classList.remove('hidden');
        document.getElementById('stats-bar').classList.remove('hidden');
    }
}

function goHome() {
    document.getElementById('home-screen').classList.remove('hidden');
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('results-screen').classList.add('hidden');
    document.querySelector('.mode-selection').classList.remove('hidden');
    document.getElementById('chapter-picker').classList.add('hidden');
    document.getElementById('count-selector').classList.add('hidden');
    document.getElementById('stats-bar').classList.remove('hidden');
    currentQuestions = [];
    currentIndex = 0;
    answeredQuestions.clear();
    selectedChapter = null;
    currentMode = null;
}

// --- Mode Selection ---
function startRandomMode() {
    currentMode = 'random';
    selectedChapter = null;
    const available = QUESTION_BANK.length;
    showCountSelector(`Random Mix \u2014 ${available} questions available. How many?`);
}

function selectChapter(chapterId) {
    selectedChapter = chapterId;
    currentMode = chapterId;
    const chapterName = CHAPTERS.find(c => c.id === chapterId).name;
    const available = QUESTION_BANK.filter(q => q.chapter_id === chapterId).length;
    showCountSelector(`Ch ${chapterId}: ${chapterName} \u2014 ${available} questions available. How many?`);
}

function startWithCount(count) {
    let pool;
    let modeLabel;

    if (currentMode === 'random') {
        pool = [...QUESTION_BANK];
        modeLabel = 'Random Mix';
    } else {
        pool = QUESTION_BANK.filter(q => q.chapter_id === selectedChapter);
        const ch = CHAPTERS.find(c => c.id === selectedChapter);
        modeLabel = `Ch ${ch.id}: ${ch.name}`;
    }

    const shuffled = shuffleArray(pool);

    if (count === 0 || count >= shuffled.length) {
        currentQuestions = shuffled;
    } else {
        currentQuestions = shuffled.slice(0, count);
    }

    startQuiz(modeLabel);
}

// --- Start Quiz ---
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
    const chapterName = CHAPTERS.find(c => c.id === q.chapter_id)?.name || 'Chapter ' + q.chapter_id;
    document.getElementById('q-chapter').textContent = 'Ch ' + q.chapter_id + ': ' + chapterName;
    document.getElementById('q-year').textContent = q.year;
    document.getElementById('q-type').textContent = q.type;
    document.getElementById('q-marks').textContent = q.marks + (q.marks === 1 ? ' Mark' : ' Marks');

    // Question text
    document.getElementById('question-text').innerHTML = formatText(q.question);

    // MCQ options
    const mcqContainer = document.getElementById('mcq-options');
    if (q.options && q.options.length > 0) {
        mcqContainer.classList.remove('hidden');
        mcqContainer.innerHTML = '';
        const letters = ['A', 'B', 'C', 'D'];
        q.options.forEach((opt, i) => {
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
    if (q.correctOption !== undefined && q.correctOption !== null) {
        answeredQuestions.add(currentIndex);

        if (index === q.correctOption) {
            options[index].classList.add('correct');
        } else {
            options[index].classList.add('incorrect');
            if (q.correctOption < options.length) {
                options[q.correctOption].classList.add('correct');
            }
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
    if (currentMode === 'random') {
        startWithCount(currentQuestions.length);
    } else {
        selectedChapter = currentMode;
        startWithCount(currentQuestions.length);
    }
}

// --- Utilities ---
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function formatText(text) {
    if (!text) return '';
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
