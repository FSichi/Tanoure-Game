// ===== GAME STATE =====
const GameState = {
    INTRO: 'INTRO',
    BANNER: 'BANNER',
    WAITING: 'WAITING',
    PREVIEW: 'PREVIEW',
    PLAYING: 'PLAYING',
    RESULT: 'RESULT'
};

// ===== CONFIGURATION =====
const CONFIG = {
    previewTime: 4,
    gameTime: 30,
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
    targetOrder: [],
    playerOrder: [],
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
    
    // Intro & Banner
    introStartBtn: document.getElementById('intro-start-btn'),
    bannerImg: document.getElementById('banner-img'),
    
    // Header Controls
    gameStartBtn: document.getElementById('game-start-btn'), // "JUGAR"
    revealBtn: document.getElementById('reveal-btn'),       // "FINALIZAR"
    gameState: document.getElementById('game-state'),
    timer: document.getElementById('timer'),
    
    // Board
    gameBoard: document.getElementById('game-board'),
    gameControls: document.getElementById('game-controls'), // Hint text (mostly hidden)
    
    // Audio
    audioIntro: document.getElementById('audio-intro'),
    audioPreview: document.getElementById('audio-preview'), // 4secs
    audioGame: document.getElementById('audio-game')        // 30secs loop
};

// ===== INITIALIZATION =====
function init() {
    setupEventListeners();
}

function setupEventListeners() {
    elements.introStartBtn.addEventListener('click', startIntroSequence);
    
    // Boton JUGAR / REINICIAR (Mismo botón, reciclamos lógica o usamos visibilidad)
    elements.gameStartBtn.addEventListener('click', handleStartButton);
    
    // Boton FINALIZAR
    elements.revealBtn.addEventListener('click', forceFinishGame);
}

// ===== INTRO SEQUENCE =====
function startIntroSequence() {
    game.state = GameState.BANNER;
    elements.introScreen.classList.remove('active');
    elements.bannerScreen.classList.add('active');
    
    elements.audioIntro.play();
    elements.bannerImg.classList.add('animating');
    
    elements.audioIntro.addEventListener('ended', goToGame, { once: true });
}

function goToGame() {
    // Transición a pantalla de juego
    elements.bannerScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
    
    resetToWaitingState();
}

// ===== GAME LOGIC & STATES =====

function resetToWaitingState() {
    game.state = GameState.WAITING;
    clearInterval(game.timer);
    stopAllAudio();
    
    // UI Reset
    elements.gameState.textContent = 'ESPERANDO...';
    elements.timer.textContent = '00:00';
    elements.timer.classList.remove('urgent');
    
    // Botones Header
    elements.gameStartBtn.textContent = '▶ JUGAR'; // Reset text
    showStartButton(true);   // Mostrar JUGAR
    showFinishButton(false); // Ocultar FINALIZAR
    
    // Generar Orden Objetivo Nuevo
    game.targetOrder = shuffleArray([0, 1, 2, 3, 4, 5]);
    game.playerOrder = []; // Vacío inicialmente
    game.selectedCardIndex = null;
    
    // Render: 
    // Target: VISIBLE
    // Player: OCULTO/NO RENDERIZADO
    renderBoard(); 
    updateBoardVisibility(true, false);
}

function handleStartButton() {
    if (game.state === GameState.RESULT) {
        // Si estamos en Resultado, el botón dice "Reiniciar"
        // Acción: Limpiar y volver a esperar
        resetToWaitingState();
    } else if (game.state === GameState.WAITING) {
        // Si estamos esperando, el botón dice "Jugar"
        // Acción: Iniciar juego
        startGameSequence();
    } else {
        // Fallback safety
        resetToWaitingState();
    }
}

function startGameSequence() {
    // 1. Fase PREVIEW (4s)
    game.state = GameState.PREVIEW;
    elements.gameState.textContent = '👁️ MEMORIZA';
    
    // Botones
    showStartButton(false);  // Ocultar JUGAR
    showFinishButton(false); // Aun no se puede finalizar en preview
    
    // Generar Orden Jugador (Diferente al target)
    game.playerOrder = shuffleArray([...game.targetOrder]);
    while (arraysEqual(game.playerOrder, game.targetOrder)) {
        game.playerOrder = shuffleArray([...game.targetOrder]);
    }
    
    // Render:
    // Target: VISIBLE
    // Player: VISIBLE (Convivencia)
    updateBoardVisibility(true, true);
    
    // Audio Preview
    elements.audioPreview.currentTime = 0;
    elements.audioPreview.play();
    
    // Timer 4s
    game.timeRemaining = CONFIG.previewTime;
    updateTimerDisplay();
    
    game.timer = setInterval(() => {
        game.timeRemaining--;
        updateTimerDisplay();
        
        if (game.timeRemaining <= 0) {
            clearInterval(game.timer);
            elements.audioPreview.pause();
            startPlayingPhase();
        }
    }, 1000);
}

function startPlayingPhase() {
    // 2. Fase PLAYING (30s)
    game.state = GameState.PLAYING;
    elements.gameState.textContent = '🎮 ¡ORDENA!';
    
    // Botones
    showStartButton(false);
    showFinishButton(true); // Aparece FINALIZAR
    
    // Render:
    // Target: OCULTO (Espacio reservado)
    // Player: VISIBLE
    updateBoardVisibility(false, true);
    
    // Audio Game
    elements.audioGame.currentTime = 0;
    elements.audioGame.play();
    
    // Timer 30s
    game.timeRemaining = CONFIG.gameTime;
    updateTimerDisplay();
    
    game.timer = setInterval(() => {
        game.timeRemaining--;
        updateTimerDisplay();
        
        if (game.timeRemaining <= 5) {
            elements.timer.classList.add('urgent');
        }
        
        if (game.timeRemaining <= 0) {
            forceFinishGame();
        }
    }, 1000);
}

function forceFinishGame() {
    // 3. Fase RESULTADO
    clearInterval(game.timer);
    stopAllAudio();
    
    game.state = GameState.RESULT;
    elements.gameState.textContent = '🏁 FINALIZADO';
    elements.timer.classList.remove('urgent');
    
    // Botones
    showFinishButton(false);
    
    // Convertir botón JUGAR en botón REINICIAR (Visualmente es el mismo btn-game-start)
    const btn = elements.gameStartBtn;
    btn.textContent = '🔄 REINICIAR';
    showStartButton(true);
    
    // Render:
    // Target: VISIBLE (Para comparar)
    // Player: VISIBLE (Como quedó)
    updateBoardVisibility(true, true);
    
    // Deseleccionar cualquier carta activa
    game.selectedCardIndex = null;
    clearCardSelections();
}

// ===== RENDER & DOM HELPER =====

function renderBoard() {
    // Renderiza la estructura base del tablero.
    // Se llama en resetToWaitingState.
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

function updateBoardVisibility(showTarget, showPlayer) {
    for (let i = 0; i < 6; i++) {
        const targetSlot = document.getElementById(`target-slot-${i}`);
        const playerSlot = document.getElementById(`player-slot-${i}`);
        
        // --- TARGET ROW ---
        /* Limpiamos y re-llenamos siempre para asegurar estado fresco, 
           aunque no es lo mas optimo en performance, es seguro para logica simple */
        targetSlot.innerHTML = '';
        if (game.targetOrder[i] !== undefined) {
             const img = document.createElement('img');
             img.src = CONFIG.images[game.targetOrder[i]];
             img.className = 'game-image';
             targetSlot.appendChild(img);
        }
        
        // Visibilidad CSS
        if (showTarget) {
            targetSlot.classList.remove('hidden-image');
        } else {
            targetSlot.classList.add('hidden-image');
        }
        
        // --- PLAYER ROW ---
        playerSlot.innerHTML = '';
        // Solo renderizamos contenido si showPlayer es true y existe orden
        if (showPlayer && game.playerOrder[i] !== undefined) {
            const img = document.createElement('img');
            img.src = CONFIG.images[game.playerOrder[i]];
            img.className = 'game-image';
            playerSlot.appendChild(img);
            
            // Interaction
            playerSlot.onclick = () => handleSlotClick(i);
            
            // Classes
            playerSlot.className = 'player-slot';
            if (game.selectedCardIndex === i) {
                playerSlot.classList.add('selected');
            }
        } else {
            // Si showPlayer es false, el slot queda vacío (fondo gris)
            playerSlot.className = 'player-slot';
            playerSlot.onclick = null;
        }
    }
}

// ===== INTERACTION =====

function handleSlotClick(slotIndex) {
    if (game.state !== GameState.PLAYING) return;
    
    const playerSlot = document.getElementById(`player-slot-${slotIndex}`);
    
    if (game.selectedCardIndex === null) {
        game.selectedCardIndex = slotIndex;
        playerSlot.classList.add('selected');
    } else if (game.selectedCardIndex === slotIndex) {
        game.selectedCardIndex = null;
        playerSlot.classList.remove('selected');
    } else {
        // Swap
        const idx1 = game.selectedCardIndex;
        const idx2 = slotIndex;
        
        // Animacion swap visual
        const slot1 = document.getElementById(`player-slot-${idx1}`);
        const slot2 = document.getElementById(`player-slot-${idx2}`);
        slot1.classList.add('swapping');
        slot2.classList.add('swapping');
        slot1.classList.remove('selected');
        
        // Data swap
        [game.playerOrder[idx1], game.playerOrder[idx2]] = [game.playerOrder[idx2], game.playerOrder[idx1]];
        
        setTimeout(() => {
            game.selectedCardIndex = null;
            // Re-render, manteniendo target oculto (false) y player visible (true)
            updateBoardVisibility(false, true); 
        }, 300);
    }
}

function clearCardSelections() {
    const slots = document.querySelectorAll('.player-slot');
    slots.forEach(s => s.classList.remove('selected', 'swapping', 'checking', 'correct', 'incorrect'));
}

// ===== UTILS & HELPERS =====

function showStartButton(show) {
    if (show) {
        elements.gameStartBtn.classList.remove('hidden');
        if (game.state === GameState.WAITING) elements.gameStartBtn.textContent = '▶ JUGAR';
    } else {
        elements.gameStartBtn.classList.add('hidden');
    }
}

function showFinishButton(show) {
    if (show) elements.revealBtn.classList.remove('hidden');
    else elements.revealBtn.classList.add('hidden');
}

function stopAllAudio() {
    elements.audioPreview.pause();
    elements.audioPreview.currentTime = 0;
    elements.audioGame.pause();
    elements.audioGame.currentTime = 0;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function arraysEqual(a, b) {
    if (!a || !b) return false;
    return a.length === b.length && a.every((val, i) => val === b[i]);
}

function updateTimerDisplay() {
    const minutes = Math.floor(game.timeRemaining / 60);
    const seconds = game.timeRemaining % 60;
    elements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Start
init();
