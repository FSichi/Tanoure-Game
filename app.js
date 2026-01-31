// ===== GAME STATE =====
const GameState = {
    SETUP: 'SETUP',
    PREVIEW: 'PREVIEW',
    PLAYING: 'PLAYING',
    RESULT: 'RESULT'
};

// ===== GAME DATA =====
let game = {
    state: GameState.SETUP,
    images: [],
    targetOrder: [],     // Orden original (objetivo)
    playerOrder: [],     // Orden del jugador (desordenado inicialmente)
    previewTime: 4,
    gameTime: 20,
    timer: null,
    timeRemaining: 0,
    selectedCardIndex: null  // Índice de la carta seleccionada para swap
};

// ===== DOM ELEMENTS =====
const elements = {
    // Screens
    setupScreen: document.getElementById('setup-screen'),
    gameScreen: document.getElementById('game-screen'),
    
    // Setup
    imageInput: document.getElementById('image-input'),
    imagePreview: document.getElementById('image-preview'),
    previewTimeInput: document.getElementById('preview-time'),
    gameTimeInput: document.getElementById('game-time'),
    startBtn: document.getElementById('start-btn'),
    
    // Game
    gameState: document.getElementById('game-state'),
    timer: document.getElementById('timer'),
    targetRow: document.getElementById('target-row'),
    playerRow: document.getElementById('player-row'),
    
    // Result
    resultSection: document.getElementById('result-section'),
    resultTitle: document.getElementById('result-title'),
    resultScore: document.getElementById('result-score'),
    restartBtn: document.getElementById('restart-btn'),
    newGameBtn: document.getElementById('new-game-btn')
};

// ===== INITIALIZATION =====
function init() {
    setupEventListeners();
}

function setupEventListeners() {
    elements.imageInput.addEventListener('change', handleImageUpload);
    elements.startBtn.addEventListener('click', startGame);
    elements.restartBtn.addEventListener('click', restartGame);
    elements.newGameBtn.addEventListener('click', newGame);
}

// ===== IMAGE HANDLING =====
function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    
    if (files.length !== 6) {
        alert('Por favor, selecciona exactamente 6 imágenes');
        return;
    }
    
    game.images = [];
    elements.imagePreview.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            game.images[index] = event.target.result;
            
            // Create preview
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${event.target.result}" alt="Imagen ${index + 1}">
                <span class="preview-number">${index + 1}</span>
            `;
            elements.imagePreview.appendChild(previewItem);
            
            // Enable start button when all images are loaded
            if (game.images.filter(img => img).length === 6) {
                elements.startBtn.disabled = false;
            }
        };
        reader.readAsDataURL(file);
    });
}

// ===== GAME FLOW =====
function startGame() {
    // Get configuration
    game.previewTime = parseInt(elements.previewTimeInput.value) || 4;
    game.gameTime = parseInt(elements.gameTimeInput.value) || 20;
    
    // Set up orders
    game.targetOrder = [...Array(6).keys()]; // [0, 1, 2, 3, 4, 5]
    game.playerOrder = shuffleArray([...game.targetOrder]);
    
    // Switch to game screen
    elements.setupScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
    
    // Render images
    renderTargetRow();
    renderPlayerRow();
    
    // Start preview phase
    startPreview();
}

function startPreview() {
    game.state = GameState.PREVIEW;
    elements.gameState.textContent = '👁️ MEMORIZA';
    elements.targetRow.classList.remove('hidden-images');
    elements.resultSection.classList.add('hidden');
    
    // Reset selection
    game.selectedCardIndex = null;
    
    // Start countdown
    game.timeRemaining = game.previewTime;
    updateTimerDisplay();
    
    game.timer = setInterval(() => {
        game.timeRemaining--;
        updateTimerDisplay();
        
        if (game.timeRemaining <= 0) {
            clearInterval(game.timer);
            startPlaying();
        }
    }, 1000);
}

function startPlaying() {
    game.state = GameState.PLAYING;
    elements.gameState.textContent = '🎮 ¡ORDENA! - Haz clic en dos imágenes para intercambiar';
    elements.targetRow.classList.add('hidden-images');
    
    // Reset selection
    game.selectedCardIndex = null;
    clearCardSelections();
    
    // Start countdown
    game.timeRemaining = game.gameTime;
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
            showResult();
        }
    }, 1000);
}

function showResult() {
    game.state = GameState.RESULT;
    elements.gameState.textContent = '🏁 RESULTADO';
    elements.targetRow.classList.remove('hidden-images');
    elements.timer.classList.remove('urgent');
    
    // Clear any selection
    game.selectedCardIndex = null;
    clearCardSelections();
    
    // Calculate score and mark correct/incorrect
    let correct = 0;
    const playerCards = elements.playerRow.querySelectorAll('.image-card');
    
    game.playerOrder.forEach((imgIndex, position) => {
        const card = playerCards[position];
        if (imgIndex === game.targetOrder[position]) {
            correct++;
            card.classList.add('correct');
        } else {
            card.classList.add('incorrect');
        }
    });
    
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
    // Reset player order
    game.playerOrder = shuffleArray([...game.targetOrder]);
    
    // Clear result classes and selections
    game.selectedCardIndex = null;
    
    // Re-render player row
    renderPlayerRow();
    
    // Start preview again
    startPreview();
}

function newGame() {
    // Reset everything
    clearInterval(game.timer);
    game.images = [];
    game.targetOrder = [];
    game.playerOrder = [];
    game.selectedCardIndex = null;
    elements.imagePreview.innerHTML = '';
    elements.startBtn.disabled = true;
    elements.imageInput.value = '';
    elements.timer.classList.remove('urgent');
    
    // Switch to setup screen
    elements.gameScreen.classList.remove('active');
    elements.setupScreen.classList.add('active');
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
        card.classList.remove('selected', 'swapping', 'correct', 'incorrect');
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
        <img src="${game.images[imgIndex]}" alt="Imagen ${imgIndex + 1}">
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
    
    // Make sure it's actually shuffled (not same as original)
    if (arraysEqual(newArray, array)) {
        return shuffleArray(array);
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
