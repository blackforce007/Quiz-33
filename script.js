// Sound elements (ensure these files are in a 'sounds' folder)
const correctSound = new Audio('sounds/correct.mp3');
const wrongSound = new Audio('sounds/wrong.mp3');
const timeoutSound = new Audio('sounds/timeout.mp3');
const gameOverSound = new Audio('sounds/gameover.mp3');
const achievementSound = new Audio('sounds/achievement.mp3');

// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const howToPlayScreen = document.getElementById('how-to-play-screen');
const achievementsScreen = document.getElementById('achievements-screen');

const startBtn = document.getElementById('start-btn');
const howToPlayBtn = document.getElementById('how-to-play-btn');
const achievementsBtn = document.getElementById('achievements-btn');
const restartBtn = document.getElementById('restart-btn');
const shareBtn = document.getElementById('share-btn');
const backFromHowToPlayBtn = document.getElementById('back-from-how-to-play');
const backFromAchievementsBtn = document.getElementById('back-from-achievements');

const currentQSpan = document.getElementById('current-q');
const totalQSpan = document.getElementById('total-q');
const timerSpan = document.getElementById('time-left');
const currentScoreSpan = document.getElementById('current-score');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedbackElement = document.getElementById('feedback');
const progressBar = document.getElementById('progress-bar');

const finalScoreSpan = document.getElementById('final-score');
const correctAnswersCountSpan = document.getElementById('correct-answers-count');
const wrongAnswersCountSpan = document.getElementById('wrong-answers-count');
const totalTimeTakenSpan = document.getElementById('total-time-taken');
const bestStreakDisplay = document.getElementById('best-streak-display');
const leaderboardList = document.getElementById('leaderboard-list');
const unlockedAchievementsList = document.getElementById('unlocked-achievements-list');
const achievementsUnlockedSection = document.getElementById('achievements-unlocked');
const allAchievementsList = document.getElementById('achievements-list');

// Game State Variables
let currentQuestions = []; // Shuffled questions for the current game
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let totalTimeTaken = 0; // Total time for the game
let questionStartTime; // Time when a question starts
let timer;
const TIME_PER_QUESTION = 15; // You can change this to 30 or 15
let timeLeft = TIME_PER_QUESTION;
let streak = 0; // Current correct answer streak
let bestStreak = 0; // Overall best streak in the current game
let answeredThisQuestion = false;

// Achievement Definitions (add more as needed)
const achievements = [
    { id: 'first_win', name: 'প্রথম বিজয়ী', description: 'প্রথমবার কুইজ সম্পন্ন করুন।', condition: (g) => g.hasPlayed && g.score > 0 },
    { id: 'perfect_start', name: 'নিখুঁত শুরু', description: 'প্রথম ৫টি প্রশ্নের সঠিক উত্তর দিন।', condition: (g) => g.correctAnswersInRow >= 5 },
    { id: 'quiz_master', name: 'কুইজ মাস্টার', description: 'এক গেমে ৫০টির বেশি স্কোর করুন।', condition: (g) => g.score >= 50 },
    { id: 'speed_demon', name: 'দ্রুত উত্তরদাতা', description: '৫ সেকেন্ডের মধ্যে ১০টি প্রশ্নের উত্তর দিন।', condition: (g) => g.fastAnswers >= 10 },
    { id: 'streak_five', name: 'ফাইভ স্ট্রিক', description: '৫টি প্রশ্নের সঠিক উত্তর দিন একটানা।', condition: (g) => g.bestStreakThisGame >= 5 },
    { id: 'streak_ten', name: 'টেন স্ট্রিক', description: '১০টি প্রশ্নের সঠিক উত্তর দিন একটানা।', condition: (g) => g.bestStreakThisGame >= 10 },
    { id: 'half_century', name: 'হাফ সেঞ্চুরি', description: 'এক গেমে ২৫টি সঠিক উত্তর দিন।', condition: (g) => g.correctAnswers >= 25 },
    { id: 'social_guru', name: 'সোশ্যাল গুরু', description: 'এক গেমে ৪০টি সঠিক উত্তর দিন।', condition: (g) => g.correctAnswers >= 40 },
    { id: 'flawless_victory', name: 'ফ্ললেস ভিক্টরি', description: 'কোনো ভুল উত্তর না দিয়ে কুইজ শেষ করুন।', condition: (g) => g.wrongAnswers === 0 && g.hasPlayed && g.score > 0 },
    { id: 'marathoner', name: 'ম্যারাথনার', description: '৫০টি প্রশ্নই শেষ করুন।', condition: (g) => g.currentQuestionIndex >= questions.length },
];
let unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || {};
let gameStats = {}; // To track stats for achievements for current game


// --- Event Listeners ---
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
shareBtn.addEventListener('click', shareScore);
howToPlayBtn.addEventListener('click', () => showScreen(howToPlayScreen));
backFromHowToPlayBtn.addEventListener('click', () => showScreen(startScreen));
achievementsBtn.addEventListener('click', () => showScreen(achievementsScreen));
backFromAchievementsBtn.addEventListener('click', () => showScreen(startScreen));


// --- Utility Functions ---
function showScreen(screenToShow) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    screenToShow.classList.add('active');
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- Game Logic ---
function startGame() {
    showScreen(quizScreen);

    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    totalTimeTaken = 0;
    streak = 0;
    bestStreak = 0;
    answeredThisQuestion = false;

    // Reset game stats for achievements
    gameStats = {
        hasPlayed: false,
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        correctAnswersInRow: 0, // for 'Perfect Start'
        fastAnswers: 0,
        bestStreakThisGame: 0,
        currentQuestionIndex: 0
    };


    // Shuffle questions and select up to 50 for the current game
    currentQuestions = shuffleArray([...questions]).slice(0, 50);
    totalQSpan.textContent = currentQuestions.length;
    currentScoreSpan.textContent = score;

    loadQuestion();
}

function loadQuestion() {
    answeredThisQuestion = false;
    feedbackElement.textContent = ''; // Clear previous feedback
    feedbackElement.style.color = 'var(--text-color)'; // Reset feedback color
    optionsContainer.querySelectorAll('.option').forEach(option => {
        option.classList.remove('correct', 'wrong', 'disabled');
        option.removeEventListener('click', selectOption); // Remove old listeners
    });

    if (currentQuestionIndex >= currentQuestions.length) {
        endGame();
        return;
    }

    const questionData = currentQuestions[currentQuestionIndex];
    currentQSpan.textContent = currentQuestionIndex + 1;
    questionText.textContent = questionData.question;
    optionsContainer.innerHTML = ''; // Clear previous options

    // Shuffle options to make it feel fresh
    const shuffledOptions = shuffleArray([...questionData.options.map((opt, idx) => ({ text: opt, originalIndex: idx }))]);

    shuffledOptions.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('option');
        optionDiv.textContent = option.text;
        optionDiv.dataset.originalIndex = option.originalIndex; // Store original index for checking answer
        optionDiv.addEventListener('click', selectOption);
        optionsContainer.appendChild(optionDiv);
    });

    // Update progress bar
    progressBar.style.width = `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%`;

    // Reset timer
    clearInterval(timer);
    timeLeft = TIME_PER_QUESTION;
    timerSpan.textContent = timeLeft;
    timerSpan.style.color = 'var(--text-color)'; // Reset timer color
    questionStartTime = new Date().getTime(); // Record start time for this question
    startTimer();
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerSpan.textContent = timeLeft;

        if (timeLeft <= 5 && timeLeft > 0) {
            timerSpan.style.color = 'var(--accent-color)'; // Red color for last 5 seconds
        } else if (timeLeft <= 0) {
            clearInterval(timer);
            timeoutSound.play();
            handleTimeout();
        }
    }, 1000);
}

function selectOption(event) {
    if (answeredThisQuestion) return; // Prevent multiple clicks
    answeredThisQuestion = true;
    clearInterval(timer); // Stop timer when answer is selected

    const selectedOption = event.target;
    const selectedAnswerOriginalIndex = parseInt(selectedOption.dataset.originalIndex);
    const correctAnswerOriginalIndex = currentQuestions[currentQuestionIndex].answer;

    const timeTakenForQuestion = Math.round((new Date().getTime() - questionStartTime) / 1000);
    totalTimeTaken += timeTakenForQuestion;

    // Disable all options and remove event listeners
    Array.from(optionsContainer.children).forEach(option => {
        option.classList.add('disabled');
        option.removeEventListener('click', selectOption);
    });

    if (selectedAnswerOriginalIndex === correctAnswerOriginalIndex) {
        correctSound.play();
        selectedOption.classList.add('correct');
        feedbackElement.textContent = 'সঠিক উত্তর!';
        feedbackElement.style.color = 'var(--success-color)';
        correctAnswers++;
        
        // Calculate points: base + time bonus + streak bonus
        let questionPoints = 10; // Base points
        let timeBonus = timeLeft > 0 ? Math.round(timeLeft / (TIME_PER_QUESTION / 5)) : 0; // Max 5 bonus points for 15s timer, 10 for 30s
        streak++;
        bestStreak = Math.max(bestStreak, streak);
        let streakBonus = streak * 2; // +2 points per streak

        score += (questionPoints + timeBonus + streakBonus);
        currentScoreSpan.textContent = score;

        // Update game stats for achievements
        gameStats.correctAnswers++;
        gameStats.correctAnswersInRow++;
        gameStats.bestStreakThisGame = Math.max(gameStats.bestStreakThisGame, streak);
        if (timeTakenForQuestion <= 5) gameStats.fastAnswers++;

    } else {
        wrongSound.play();
        selectedOption.classList.add('wrong');
        feedbackElement.textContent = 'ভুল উত্তর!';
        feedbackElement.style.color = 'var(--accent-color)';
        wrongAnswers++;
        streak = 0; // Reset streak on wrong answer
        gameStats.correctAnswersInRow = 0; // Reset for perfect start achievement

        // Highlight the correct answer
        // Find the correct option by its original index
        const correctOptionDiv = Array.from(optionsContainer.children).find(option =>
            parseInt(option.dataset.originalIndex) === correctAnswerOriginalIndex
        );
        if (correctOptionDiv) {
            correctOptionDiv.classList.add('correct');
        }
    }

    // Update game stats
    gameStats.score = score;
    gameStats.wrongAnswers = wrongAnswers;
    gameStats.currentQuestionIndex = currentQuestionIndex + 1;


    // Wait a bit before loading the next question
    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 2000); // 2 seconds delay
}

function handleTimeout() {
    feedbackElement.textContent = 'সময় শেষ!';
    feedbackElement.style.color = 'var(--accent-color)';
    wrongAnswers++;
    streak = 0; // Reset streak on timeout
    gameStats.correctAnswersInRow = 0; // Reset for perfect start achievement
    gameStats.wrongAnswers++;

    // Highlight the correct answer
    const correctAnswerOriginalIndex = currentQuestions[currentQuestionIndex].answer;
    Array.from(optionsContainer.children).forEach(option => {
        option.classList.add('disabled');
        option.removeEventListener('click', selectOption);
    });
    const correctOptionDiv = Array.from(optionsContainer.children).find(option =>
        parseInt(option.dataset.originalIndex) === correctAnswerOriginalIndex
    );
    if (correctOptionDiv) {
        correctOptionDiv.classList.add('correct');
    }

    // Update game stats
    gameStats.score = score;
    gameStats.currentQuestionIndex = currentQuestionIndex + 1;

    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 2000);
}

// --- End Game & Results ---
function endGame() {
    gameOverSound.play();
    showScreen(resultScreen);
    clearInterval(timer); // Ensure timer is cleared

    finalScoreSpan.textContent = score;
    correctAnswersCountSpan.textContent = correctAnswers;
    wrongAnswersCountSpan.textContent = wrongAnswers;
    totalTimeTakenSpan.textContent = totalTimeTaken;
    bestStreakDisplay.textContent = bestStreak;

    // Update game stats for final achievement checks
    gameStats.hasPlayed = true;
    gameStats.score = score;
    gameStats.correctAnswers = correctAnswers;
    gameStats.wrongAnswers = wrongAnswers;
    gameStats.bestStreakThisGame = bestStreak;
    gameStats.currentQuestionIndex = currentQuestionIndex; // All questions completed

    checkAchievements();
    saveScore(score);
    displayLeaderboard();
}

function restartGame() {
    showScreen(startScreen); // Go back to start screen for a fresh start
    clearInterval(timer); // Clear any lingering timers
}

// --- Leaderboard ---
function saveScore(newScore) {
    const scores = JSON.parse(localStorage.getItem('quizLeaderboard')) || [];
    const entry = {
        score: newScore,
        correct: correctAnswers,
        wrong: wrongAnswers,
        time: totalTimeTaken,
        date: new Date().toLocaleDateString('bn-BD') // Bengali date format
    };
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score); // Sort highest first
    localStorage.setItem('quizLeaderboard', JSON.stringify(scores.slice(0, 5))); // Keep top 5 scores
}

function displayLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('quizLeaderboard')) || [];
    leaderboardList.innerHTML = '';
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<li>কোনো স্কোর এখনো নেই।</li>';
        return;
    }
    scores.forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${index + 1}.</span>
            <span>স্কোর: ${entry.score} <small>(স: ${entry.correct}, ভু: ${entry.wrong}, সময়: ${entry.time}s)</small></span>
            <span>${entry.date}</span>
        `;
        leaderboardList.appendChild(li);
    });
}

// --- Achievements ---
function checkAchievements() {
    let newAchievementsUnlocked = [];
    achievements.forEach(achievement => {
        if (!unlockedAchievements[achievement.id] && achievement.condition(gameStats)) {
            unlockedAchievements[achievement.id] = true;
            newAchievementsUnlocked.push(achievement);
            achievementSound.play();
        }
    });

    if (newAchievementsUnlocked.length > 0) {
        achievementsUnlockedSection.style.display = 'block';
        unlockedAchievementsList.innerHTML = '';
        newAchievementsUnlocked.forEach(ach => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-medal"></i> ${ach.name}: ${ach.description}`;
            unlockedAchievementsList.appendChild(li);
        });
    } else {
        achievementsUnlockedSection.style.display = 'none';
    }

    localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
    displayAllAchievements(); // Update achievement screen
}

function displayAllAchievements() {
    allAchievementsList.innerHTML = '';
    achievements.forEach(ach => {
        const li = document.createElement('li');
        li.classList.add('achievement-card');
        if (unlockedAchievements[ach.id]) {
            li.classList.add('unlocked');
        }
        li.innerHTML = `
            <i class="fas fa-trophy"></i>
            <h5>${ach.name}</h5>
            <p>${ach.description}</p>
        `;
        allAchievementsList.appendChild(li);
    });
}

// --- Share Score ---
function shareScore() {
    const shareText = `আমি Black Force 007 Quiz Game-এ ${score} স্কোর করেছি! (${correctAnswers} সঠিক, ${wrongAnswers} ভুল, সেরা স্ট্রিক ${bestStreak}) আপনিও চেষ্টা করুন!`;
    if (navigator.share) {
        navigator.share({
            title: 'Black Force 007 Quiz Game',
            text: shareText,
            url: window.location.href,
        }).then(() => {
            console.log('Share successful!');
        }).catch((error) => {
            console.error('Error sharing:', error);
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        alert(shareText + "\n(লিংক কপি করুন: " + window.location.href + ")");
        // You might want to implement a custom share dialog here
    }
}

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    showScreen(startScreen);
    displayLeaderboard();
    displayAllAchievements();
    // Preload sounds (optional, but good for UX)
    correctSound.load();
    wrongSound.load();
    timeoutSound.load();
    gameOverSound.load();
    achievementSound.load();
});
