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
    gameBoard: document.getElementById('game-board'),
    
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
    elements.revealBtn.classList.add('hidden'); // Explicitly hide button
    elements.resultSection.classList.add('hidden');
    elements.gameStartBtn.classList.remove('hidden');
    
    // Initial empty board setup
    renderEmptyBoard();
}

// ===== RENDER LOGIC =====

// ===== RENDER LOGIC =====

function renderEmptyBoard() {
    elements.gameBoard.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const column = document.createElement('div');
        column.className = 'game-column';
        column.innerHTML = `
            <div class="target-slot" id="target-slot-${i}"></div>
            <img class="panel-slice" src="img/panel/${i + 1}.png" alt="Panel ${i+1}">
            <div class="player-slot-container">
                <div class="player-slot" id="player-slot-${i}"></div>
                <span class="slot-number">${i + 1}</span>
            </div>
        `;
        elements.gameBoard.appendChild(column);
    }
}

/**
 * Updates the board based on current game state
 * @param {boolean|null} showTargetImages - If true, show targets. If false, hide them.
 * @param {boolean} showPlayerImages - If true, render player images. If false, clear them.
 */
function updateBoard(showTargetImages, showPlayerImages = true) {
    for (let i = 0; i < 6; i++) {
        // Update Target Slot
        const targetSlot = document.getElementById(`target-slot-${i}`);
        targetSlot.innerHTML = '';
        if (game.targetOrder[i] !== undefined) {
            const img = document.createElement('img');
            img.src = CONFIG.images[game.targetOrder[i]];
            img.className = 'game-image';
            targetSlot.appendChild(img);
            
            // Toggle visibility class based on state
            if (showTargetImages) {
                targetSlot.classList.remove('hidden-image');
            } else {
                targetSlot.classList.add('hidden-image');
            }
        }
        
        // Update Player Slot
        const playerSlot = document.getElementById(`player-slot-${i}`);
        playerSlot.innerHTML = '';
        
        if (showPlayerImages && game.playerOrder[i] !== undefined) {
             const img = document.createElement('img');
            img.src = CONFIG.images[game.playerOrder[i]];
            img.className = 'game-image';
            playerSlot.appendChild(img);
            
            // Add click listener
            playerSlot.onclick = () => handleSlotClick(i);
            
            // Re-apply classes
            playerSlot.className = 'player-slot'; // reset base class
            if (game.selectedCardIndex === i) {
                playerSlot.classList.add('selected');
            }
        }
    }
}


// ===== GAME FLOW =====
function startGameRound() {
    // Hide start button
    elements.gameStartBtn.classList.add('hidden');
    
    // Generate random target order
    game.targetOrder = shuffleArray([0, 1, 2, 3, 4, 5]);
    
    // Reset player order to empty or undefined for now
    game.playerOrder = [];

    // Initial render: Show Targets, HIDE Player images (preview phase)
    updateBoard(true, false);
    
    // Start preview phase
    startPreview();
}

function startPreview() {
    game.state = GameState.PREVIEW;
    elements.gameState.textContent = '👁️ MEMORIZA';
    elements.gameControls.classList.add('hidden');
    elements.revealBtn.classList.add('hidden');
    
    // Ensure board state is correct for preview (Targets Visible, Player Hidden)
    updateBoard(true, false);
    
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
    elements.gameControls.classList.remove('hidden'); // Show hint
    elements.revealBtn.classList.remove('hidden'); // Show finish button
    
    // **KEY CHANGE**: Hide target images
    updateBoard(false);
    
    // Generate shuffled player order (different from target)
    game.playerOrder = shuffleArray([...game.targetOrder]);
    
    // Make sure it's actually different
    while (arraysEqual(game.playerOrder, game.targetOrder)) {
        game.playerOrder = shuffleArray([...game.targetOrder]);
    }
    
    // Render player images (and keep target hidden)
    updateBoard(false);
    
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
    elements.gameControls.classList.add('hidden');
    elements.revealBtn.classList.add('hidden'); // Hide button
    elements.timer.classList.remove('urgent');
    
    // Show target images again for comparison!
    updateBoard(true);
    
    // Clear any selection
    game.selectedCardIndex = null;
    clearCardSelections();
    
    // Start sequential reveal animation
    revealSequentially();
}

function revealSequentially() {
    let currentIndex = 0;
    let correct = 0;
    
    function revealNext() {
        if (currentIndex >= 6) {
            // All done, show result after a short delay
            setTimeout(() => showFinalResult(correct), 500);
            return;
        }
        
        const playerSlot = document.getElementById(`player-slot-${currentIndex}`);
        // Visual comparison is easier if we also highlight target, but let's stick to player slot feedback
        const isCorrect = game.playerOrder[currentIndex] === game.targetOrder[currentIndex];
        
        // Add checking animation
        playerSlot.classList.add('checking');
        
        setTimeout(() => {
            playerSlot.classList.remove('checking');
            
            if (isCorrect) {
                correct++;
                playerSlot.classList.add('correct');
            } else {
                playerSlot.classList.add('incorrect');
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
function handleSlotClick(slotIndex) {
    // Only allow interaction during PLAYING state
    if (game.state !== GameState.PLAYING) return;
    
    const playerSlot = document.getElementById(`player-slot-${slotIndex}`);
    
    if (game.selectedCardIndex === null) {
        // First card selected
        game.selectedCardIndex = slotIndex;
        playerSlot.classList.add('selected');
    } else if (game.selectedCardIndex === slotIndex) {
        // Same card clicked - deselect
        game.selectedCardIndex = null;
        playerSlot.classList.remove('selected');
    } else {
        // Second card selected - perform swap!
        const idx1 = game.selectedCardIndex;
        const idx2 = slotIndex;
        
        const slot1 = document.getElementById(`player-slot-${idx1}`);
        const slot2 = document.getElementById(`player-slot-${idx2}`);
        
        // Add swap animation to both cards
        slot1.classList.add('swapping');
        slot2.classList.add('swapping');
        slot1.classList.remove('selected'); // remove check from first
        
        // Swap in array
        [game.playerOrder[idx1], game.playerOrder[idx2]] = [game.playerOrder[idx2], game.playerOrder[idx1]];
        
        // Re-render after animation
        setTimeout(() => {
            game.selectedCardIndex = null;
            // Re-render only player slots ideally, but full board update is fast enough
            updateBoard(false); // keep target hidden
        }, 300);
    }
}

function clearCardSelections() {
     for (let i = 0; i < 6; i++) {
        const slot = document.getElementById(`player-slot-${i}`);
        if(slot) slot.classList.remove('selected', 'swapping', 'correct', 'incorrect', 'checking');
    }
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
