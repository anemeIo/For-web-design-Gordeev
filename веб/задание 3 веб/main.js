// Main game initialization and UI handling
let game;
let canvas;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupUI();
});

function initializeGame() {
    // Get canvas element
    canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Create game instance
    game = new Game(canvas);
    
    // Set initial UI state
    updateUI();
    
    console.log('Game initialized successfully!');
}

function setupUI() {
    // Start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startGame);
    }
    
    // Pause button
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
        pauseBtn.addEventListener('click', togglePause);
    }
    
    // Restart button
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', restartGame);
    }
    
    // Play again button (game over screen)
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', restartGame);
    }
    
    // Next level button (win screen)
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', nextLevel);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        switch(e.code) {
            case 'Enter':
                if (game.state === 'menu') {
                    startGame();
                } else if (game.state === 'gameOver') {
                    restartGame();
                }
                break;
            case 'Escape':
                if (game.state === 'playing' || game.state === 'paused') {
                    togglePause();
                }
                break;
            case 'KeyR':
                if (game.state === 'gameOver') {
                    restartGame();
                }
                break;
        }
    });
    
    // Prevent context menu on canvas
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
}

function startGame() {
    if (!game) {
        console.error('Game not initialized!');
        return;
    }
    
    // Update UI
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';
    document.getElementById('restartBtn').style.display = 'inline-block';
    
    // Start the game
    game.start();
    
    console.log('Game started!');
}

function togglePause() {
    if (!game) return;
    
    game.pause();
    
    // Update pause button text
    const pauseBtn = document.getElementById('pauseBtn');
    if (game.state === 'paused') {
        pauseBtn.textContent = 'Resume';
    } else {
        pauseBtn.textContent = 'Pause';
    }
}

function restartGame() {
    if (!game) return;
    
    // Hide game over screen
    document.getElementById('gameOverScreen').style.display = 'none';
    
    // Reset UI
    document.getElementById('pauseBtn').textContent = 'Pause';
    
    // Restart the game
    game.restart();
}

function nextLevel() {
    if (!game) return;
    
    // Hide game over screen
    document.getElementById('gameOverScreen').style.display = 'none';
    
    // Reset UI
    document.getElementById('pauseBtn').textContent = 'Pause';
    
    // Start next level
    game.nextLevel();
}

function updateUI() {
    if (!game) return;
    
    const gameState = game.getState();
    
    // Update score displays
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('high-score').textContent = gameState.highScore;
    
    // Update button visibility based on game state
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    
    switch(gameState.state) {
        case 'menu':
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
            restartBtn.style.display = 'none';
            break;
        case 'playing':
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            restartBtn.style.display = 'inline-block';
            break;
        case 'paused':
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            restartBtn.style.display = 'inline-block';
            break;
        case 'gameOver':
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'none';
            restartBtn.style.display = 'none';
            break;
    }
}

function handleResize() {
    // Handle responsive canvas sizing
    const container = document.querySelector('.game-container');
    const canvas = document.getElementById('gameCanvas');
    
    if (container && canvas) {
        const containerWidth = container.clientWidth - 40; // Account for padding
        const maxWidth = 800;
        const scale = Math.min(containerWidth / maxWidth, 1);
        
        canvas.style.transform = `scale(${scale})`;
        canvas.style.transformOrigin = 'center';
    }
}

// Utility functions for debugging
function toggleDebugMode() {
    if (game && game.collisionDetector) {
        game.debugMode = !game.debugMode;
        console.log('Debug mode:', game.debugMode);
    }
}

function logGameState() {
    if (game) {
        console.log('Game State:', game.getState());
    }
}

// Performance monitoring
let frameCount = 0;
let lastFPSUpdate = 0;

function updateFPS() {
    frameCount++;
    const now = performance.now();
    
    if (now - lastFPSUpdate > 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastFPSUpdate));
        console.log('FPS:', fps);
        frameCount = 0;
        lastFPSUpdate = now;
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Game Error:', e.error);
    
    // Show error message to user
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff6b6b;
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        text-align: center;
        font-family: Arial, sans-serif;
    `;
    errorDiv.innerHTML = `
        <h3>Game Error</h3>
        <p>Something went wrong with the game.</p>
        <p>Please refresh the page to continue.</p>
        <button onclick="location.reload()" style="
            background: white;
            color: #ff6b6b;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        ">Refresh Page</button>
    `;
    
    document.body.appendChild(errorDiv);
});

// Export functions for global access
window.startGame = startGame;
window.togglePause = togglePause;
window.restartGame = restartGame;
window.toggleDebugMode = toggleDebugMode;
window.logGameState = logGameState;

// Add some keyboard shortcuts info
console.log(`
Doodle Jump Game Controls:
- Arrow Keys or A/D: Move left/right
- Space or W: Jump
- Enter: Start/Restart game
- Escape: Pause/Resume
- R: Restart game (when game over)
- Debug: Press 'D' for debug mode (if implemented)
`);

// Initialize resize handler
handleResize();