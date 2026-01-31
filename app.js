// ===== GAME STATE =====
const GameState = {
    INTRO: 'INTRO',
    BANNER: 'BANNER',
    WAITING: 'WAITING',
    PREVIEW: 'PREVIEW',
    PLAYING: 'PLAYING',
    REVEALING: 'REVEALING',
    RESULT: 'RESULT'
};

// ===== CONFIGURATION =====
const CONFIG = {
    previewTime: 4,    // Segundos para memorizar
    gameTime: 30,      // Segundos para jugar
    images: [
        'img/game/1.jpeg',
        'img/game/2.jpeg',
        'img/game/3.jpeg',
        'img/game/4.jpeg',
        'img/game/5.jpeg',
        'img/game/6.jpeg'
    ]
};

// ===== GAME DATA =====
let game = {
    state: GameState.INTRO,
    targetOrder: [],     // Orden objetivo (aleatorio cada vez)
    playerOrder: [],     // Orden del jugador (desordenado)
    timer: null,
    timeRemaining: 0,
    selectedCardIndex: null
};

// ===== DOM ELEMENTS =====
const elements = {
    // Screens
    introScreen: document.getElementById('intro-screen'),
    bannerScreen: document.getElementById('banner-screen'),
    gameScreen: document.getElementById('game-screen'),
    
    // Intro
    introStartBtn: document.getElementById('intro-start-btn'),
    bannerImg: document.getElementById('banner-img'),
    
    // Game
    gameStartBtn: document.getElementById('game-start-btn'),
    gameState: document.getElementById('game-state'),
    timer: document.getElementById('timer'),
    targetRow: document.getElementById('target-row'),
    playerRow: document.getElementById('player-row'),
    
    // Game Controls
    gameControls: document.getElementById('game-controls'),
    revealBtn: document.getElementById('reveal-btn'),
    
    // Result
    resultSection: document.getElementById('result-section'),
    resultTitle: document.getElementById('result-title'),
    resultScore: document.getElementById('result-score'),
    restartBtn: document.getElementById('restart-btn'),
    
    // Audio
    audioIntro: document.getElementById('audio-intro'),
    audioPreview: document.getElementById('audio-preview'),
    audioGame: document.getElementById('audio-game')
};

// ===== INITIALIZATION =====
function init() {
    setupEventListeners();
}

function setupEventListeners() {
    elements.introStartBtn.addEventListener('click', startIntroSequence);
    elements.gameStartBtn.addEventListener('click', startGameRound);
    elements.revealBtn.addEventListener('click', revealAndFinish);
    elements.restartBtn.addEventListener('click', restartGame);
}

// ===== INTRO SEQUENCE =====
function startIntroSequence() {
    game.state = GameState.BANNER;
    
    // Hide intro, show banner
    elements.introScreen.classList.remove('active');
    elements.bannerScreen.classList.add('active');
    
    // Start audio
    elements.audioIntro.play();
    
    // Start banner animation
    elements.bannerImg.classList.add('animating');
    
    // When audio ends, go to game
    elements.audioIntro.addEventListener('ended', goToGame, { once: true });
}

function goToGame() {
    game.state = GameState.WAITING;
    
    // Hide banner, show game
    elements.bannerScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
    
    // Reset game state
    elements.gameState.textContent = 'ESPERANDO...';
    elements.timer.textContent = '00:00';
    elements.gameControls.classList.add('hidden');
    elements.resultSection.classList.add('hidden');
    elements.gameStartBtn.classList.remove('hidden');
    
    // Clear rows
    elements.targetRow.innerHTML = '';
    elements.playerRow.innerHTML = '';
    elements.targetRow.classList.add('hidden-images');
}

// ===== GAME FLOW =====
function startGameRound() {
    // Hide start button
    elements.gameStartBtn.classList.add('hidden');
    
    // Generate random target order
    game.targetOrder = shuffleArray([0, 1, 2, 3, 4, 5]);
    
    // Render target row (will be visible during preview)
    renderTargetRow();
    
    // Start preview phase
    startPreview();
}

function startPreview() {
    game.state = GameState.PREVIEW;
    elements.gameState.textContent = '👁️ MEMORIZA';
    elements.targetRow.classList.remove('hidden-images');
    elements.gameControls.classList.add('hidden');
    
    // Play preview audio
    elements.audioPreview.currentTime = 0;
    elements.audioPreview.play();
    
    // Start countdown
    game.timeRemaining = CONFIG.previewTime;
    updateTimerDisplay();
    
    game.timer = setInterval(() => {
        game.timeRemaining--;
        updateTimerDisplay();
        
        if (game.timeRemaining <= 0) {
            clearInterval(game.timer);
            elements.audioPreview.pause();
            startPlaying();
        }
    }, 1000);
}

function startPlaying() {
    game.state = GameState.PLAYING;
    elements.gameState.textContent = '🎮 ¡ORDENA!';
    elements.targetRow.classList.add('hidden-images');
    elements.gameControls.classList.remove('hidden');
    
    // Generate shuffled player order (different from target)
    game.playerOrder = shuffleArray([...game.targetOrder]);
    
    // Make sure it's actually different
    while (arraysEqual(game.playerOrder, game.targetOrder)) {
        game.playerOrder = shuffleArray([...game.targetOrder]);
    }
    
    // Render player row
    renderPlayerRow();
    
    // Reset selection
    game.selectedCardIndex = null;
    
    // Play game audio
    elements.audioGame.currentTime = 0;
    elements.audioGame.play();
    
    // Start countdown
    game.timeRemaining = CONFIG.gameTime;
    updateTimerDisplay();
    
    game.timer = setInterval(() => {
        game.timeRemaining--;
        updateTimerDisplay();
        
        // Add urgent class when time is running low
        if (game.timeRemaining <= 5) {
            elements.timer.classList.add('urgent');
        }
        
        if (game.timeRemaining <= 0) {
            clearInterval(game.timer);
            elements.audioGame.pause();
            revealAndFinish();
        }
    }, 1000);
}

function revealAndFinish() {
    // Stop timer and audio
    clearInterval(game.timer);
    elements.audioGame.pause();
    
    game.state = GameState.REVEALING;
    elements.gameState.textContent = '🔍 REVELANDO...';
    elements.targetRow.classList.remove('hidden-images');
    elements.gameControls.classList.add('hidden');
    elements.timer.classList.remove('urgent');
    
    // Clear any selection
    game.selectedCardIndex = null;
    clearCardSelections();
    
    // Start sequential reveal animation
    revealSequentially();
}

function revealSequentially() {
    const playerCards = elements.playerRow.querySelectorAll('.image-card');
    const targetCards = elements.targetRow.querySelectorAll('.image-card');
    let currentIndex = 0;
    let correct = 0;
    
    function revealNext() {
        if (currentIndex >= 6) {
            // All done, show result after a short delay
            setTimeout(() => showFinalResult(correct), 500);
            return;
        }
        
        const playerCard = playerCards[currentIndex];
        const targetCard = targetCards[currentIndex];
        const isCorrect = game.playerOrder[currentIndex] === game.targetOrder[currentIndex];
        
        // Add checking animation
        playerCard.classList.add('checking');
        targetCard.classList.add('checking');
        
        setTimeout(() => {
            playerCard.classList.remove('checking');
            targetCard.classList.remove('checking');
            
            if (isCorrect) {
                correct++;
                playerCard.classList.add('correct');
                targetCard.classList.add('correct');
            } else {
                playerCard.classList.add('incorrect');
                targetCard.classList.add('incorrect');
            }
            
            currentIndex++;
            setTimeout(revealNext, 400);
        }, 400);
    }
    
    // Start reveal sequence
    setTimeout(revealNext, 500);
}

function showFinalResult(correct) {
    game.state = GameState.RESULT;
    elements.gameState.textContent = '🏁 RESULTADO';
    
    // Show result modal
    elements.resultSection.classList.remove('hidden');
    
    if (correct === 6) {
        elements.resultTitle.textContent = '🎉 ¡PERFECTO!';
    } else if (correct >= 4) {
        elements.resultTitle.textContent = '👏 ¡Muy Bien!';
    } else if (correct >= 2) {
        elements.resultTitle.textContent = '💪 ¡Casi!';
    } else {
        elements.resultTitle.textContent = '😅 ¡Inténtalo de nuevo!';
    }
    
    elements.resultScore.textContent = `${correct}/6`;
}

function restartGame() {
    // Hide result
    elements.resultSection.classList.add('hidden');
    
    // Go back to waiting state
    goToGame();
}

// ===== CLICK-TO-SWAP LOGIC =====
function handleCardClick(cardIndex) {
    // Only allow interaction during PLAYING state
    if (game.state !== GameState.PLAYING) return;
    
    const cards = elements.playerRow.querySelectorAll('.image-card');
    
    if (game.selectedCardIndex === null) {
        // First card selected
        game.selectedCardIndex = cardIndex;
        cards[cardIndex].classList.add('selected');
    } else if (game.selectedCardIndex === cardIndex) {
        // Same card clicked - deselect
        game.selectedCardIndex = null;
        cards[cardIndex].classList.remove('selected');
    } else {
        // Second card selected - perform swap!
        const idx1 = game.selectedCardIndex;
        const idx2 = cardIndex;
        
        // Add swap animation to both cards
        cards[idx1].classList.add('swapping');
        cards[idx2].classList.add('swapping');
        cards[idx1].classList.remove('selected');
        
        // Swap in array
        [game.playerOrder[idx1], game.playerOrder[idx2]] = [game.playerOrder[idx2], game.playerOrder[idx1]];
        
        // Re-render after animation
        setTimeout(() => {
            game.selectedCardIndex = null;
            renderPlayerRow();
        }, 300);
    }
}

function clearCardSelections() {
    const cards = elements.playerRow.querySelectorAll('.image-card');
    cards.forEach(card => {
        card.classList.remove('selected', 'swapping', 'correct', 'incorrect', 'checking');
    });
}

// ===== RENDERING =====
function renderTargetRow() {
    elements.targetRow.innerHTML = '';
    
    game.targetOrder.forEach((imgIndex, position) => {
        const card = createImageCard(imgIndex, position + 1, false);
        elements.targetRow.appendChild(card);
    });
}

function renderPlayerRow() {
    elements.playerRow.innerHTML = '';
    
    game.playerOrder.forEach((imgIndex, position) => {
        const card = createImageCard(imgIndex, position + 1, true);
        card.addEventListener('click', () => handleCardClick(position));
        elements.playerRow.appendChild(card);
    });
}

function createImageCard(imgIndex, displayNumber, isClickable) {
    const card = document.createElement('div');
    card.className = 'image-card' + (isClickable ? ' clickable' : '');
    card.innerHTML = `
        <img src="${CONFIG.images[imgIndex]}" alt="Imagen ${imgIndex + 1}">
        <span class="card-number">${displayNumber}</span>
    `;
    return card;
}

// ===== UTILITIES =====
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function arraysEqual(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
}

function updateTimerDisplay() {
    const minutes = Math.floor(game.timeRemaining / 60);
    const seconds = game.timeRemaining % 60;
    elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ===== START =====
init();
