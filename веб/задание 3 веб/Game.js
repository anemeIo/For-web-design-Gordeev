class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Game state
        this.state = 'menu'; // menu, playing, paused, gameOver, gameWin
        this.score = 0;
        this.totalScore = 0;
        this.levelScore = 0;
        this.currentLevel = 1;
        this.highScore = this.loadHighScore();
        this.gameSpeed = 1;
        this.difficulty = 1;
        
        // Game objects
        this.player = null;
        this.platformManager = null;
        this.inputHandler = null;
        this.collisionDetector = null;
        
        // Camera system
        this.camera = {
            x: 0,
            y: 0,
            targetY: 0,
            smoothing: 0.1
        };
        
        // Background system
        this.backgroundOffset = 0;
        this.backgroundSpeed = 0.5;
        
        // Particle system
        this.particles = [];
        
        // Timing
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Initialize game
        this.initialize();
    }
    
    initialize() {
        // Create game objects
        this.player = new Player(400, 500);
        this.platformManager = new PlatformManager();
        this.inputHandler = new InputHandler();
        this.collisionDetector = new CollisionDetector();
        
        // Generate initial platforms
        this.platformManager.generateInitialPlatforms();
        
        // Ensure player starts on the first platform
        const firstPlatform = this.platformManager.platforms[0];
        if (firstPlatform) {
            this.player.y = firstPlatform.y - this.player.height;
        }
        
        // Update UI
        this.updateUI();
    }
    
    start() {
        this.state = 'playing';
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.lastTime = performance.now();
            this.gameLoop();
        }
    }
    
    gameOver() {
        this.state = 'gameOver';
        
        // Update high score
        if (this.totalScore > this.highScore) {
            this.highScore = this.totalScore;
            this.saveHighScore(this.highScore);
        }
        
        // Show game over screen
        this.showGameOverScreen();
        
        // Disable inputs temporarily
        this.inputHandler.disableAllInputs();
    }
    
    gameWin() {
        this.state = 'gameWin';
        
        // Add level score to total score
        this.totalScore += this.levelScore;
        
        // Update high score
        if (this.totalScore > this.highScore) {
            this.highScore = this.totalScore;
            this.saveHighScore(this.highScore);
        }
        
        // Show win screen
        this.showGameWinScreen();
        
        // Disable inputs temporarily
        this.inputHandler.disableAllInputs();
    }
    
    restart() {
        // Reset game state for new game
        this.state = 'playing';
        this.score = 0;
        this.totalScore = 0;
        this.levelScore = 0;
        this.currentLevel = 1;
        this.difficulty = 1;
        this.particles = [];
        
        // Reset game objects
        this.player.reset(400, 500);
        this.platformManager.reset();
        
        // Reset camera
        this.camera.y = 0;
        this.camera.targetY = 0;
        
        // Hide game over screen
        this.hideGameOverScreen();
        
        // Enable inputs
        this.inputHandler.enableInputs();
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    nextLevel() {
        // Start next level
        this.state = 'playing';
        this.currentLevel++;
        this.levelScore = 0;
        this.particles = [];
        
        // Reset player position for next level
        this.player.reset(400, 500);
        this.platformManager.reset();
        
        // Reset camera
        this.camera.y = 0;
        this.camera.targetY = 0;
        
        // Hide game over screen
        this.hideGameOverScreen();
        
        // Enable inputs
        this.inputHandler.enableInputs();
        
        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }
    
    gameLoop(currentTime = performance.now()) {
        if (this.state !== 'playing') {
            return;
        }
        
        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Update game
        this.update();
        
        // Render game
        this.render();
        
        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        // Update player
        this.player.update(this.inputHandler, this.platformManager.platforms);
        
        // Update camera to follow player
        this.updateCamera();
        
        // Update platforms with camera offset
        this.platformManager.update(this.camera.y);
        
        // Handle collisions
        this.collisionDetector.handlePlayerPlatformCollision(
            this.player, 
            this.platformManager.getPlatformsInRange(this.player.y)
        );
        
        // Update score
        this.updateScore();
        
        // Update difficulty
        this.updateDifficulty();
        
        // Update particles
        this.updateParticles();
        
        // Check game over conditions
        if (this.player.isOutOfBounds()) {
            this.gameOver();
            return;
        }
        
        // Check win condition - player reaches the top of the long level (3 screens height)
        if (this.player.y < -100) {
            this.gameWin();
            return;
        }
        
        // Update background
        this.updateBackground();
    }
    
    updateCamera() {
        // Camera follows player upward only, with smooth interpolation
        const targetCameraY = this.player.y - this.height * 0.7; // Keep player in upper 30% of screen
        
        // Only move camera up, never down
        if (targetCameraY > this.camera.y) {
            this.camera.y += (targetCameraY - this.camera.y) * this.camera.smoothing;
        }
        
        // Ensure camera doesn't go below starting position
        this.camera.y = Math.max(0, this.camera.y);
    }
    
    updateScore() {
        // Score based on maximum height reached on current level
        const playerHeight = 600 - this.player.y; // Invert Y coordinate (higher = more points)
        const newLevelScore = Math.max(0, Math.floor(playerHeight / 10));
        
        if (newLevelScore > this.levelScore) {
            this.levelScore = newLevelScore;
            this.score = this.totalScore + this.levelScore;
            this.updateUI();
        }
    }
    
    updateDifficulty() {
        // Increase difficulty based on score
        this.difficulty = 1 + Math.floor(this.score / 500);
        
        // Adjust game speed based on difficulty
        this.gameSpeed = 1 + (this.difficulty - 1) * 0.1;
    }
    
    updateParticles() {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    // Handle special platform effects
    handlePlatformEffect(player, platform) {
        switch (platform.type) {
            case 'spring':
                // Extra high jump on spring platforms
                player.velocityY = player.jumpPower * 1.5;
                this.createSpringEffect(platform);
                break;
                
            case 'breakable':
                // Break the platform after landing
                this.breakPlatform(platform);
                break;
                
            case 'moving':
                // Add player's momentum to moving platform
                player.velocityX += platform.moveSpeed * 0.5;
                break;
        }
    }
    
    createSpringEffect(platform) {
        // Visual effect for spring platforms
        this.addParticle(platform.x + platform.width / 2, platform.y, 'spring');
    }
    
    breakPlatform(platform) {
        // Break the platform after a short delay
        setTimeout(() => {
            const index = this.platformManager.platforms.indexOf(platform);
            if (index > -1) {
                this.platformManager.platforms.splice(index, 1);
            }
        }, 100);
    }
    
    updateBackground() {
        this.backgroundOffset += this.backgroundSpeed;
        if (this.backgroundOffset > this.height) {
            this.backgroundOffset = 0;
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Render background
        this.renderBackground();
        
        // Apply camera transform
        this.ctx.save();
        this.ctx.translate(0, -this.camera.y);
        
        // Render platforms
        this.platformManager.render(this.ctx);
        
        // Render player
        this.player.render(this.ctx);
        
        // Render particles
        this.renderParticles();
        
        // Restore camera transform
        this.ctx.restore();
        
        // Render UI elements (not affected by camera)
        this.renderUI();
    }
    
    renderBackground() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#98fb98');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Add some clouds
        this.renderClouds();
    }
    
    renderClouds() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        // Static clouds
        for (let i = 0; i < 5; i++) {
            const x = (i * 200 + 50) % this.width;
            const y = (i * 100 + this.backgroundOffset) % this.height;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 30, 0, Math.PI * 2);
            this.ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
            this.ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    renderParticles() {
        for (let particle of this.particles) {
            particle.render(this.ctx);
        }
    }
    
    renderUI() {
        // Render score and other UI elements
        // This is already handled by HTML elements, but we could add
        // in-game UI elements here if needed
    }
    
    updateUI() {
        // Update score displays
        document.getElementById('score').textContent = this.score;
        document.getElementById('high-score').textContent = this.highScore;
    }
    
    showGameOverScreen() {
        document.getElementById('levelScore').textContent = this.levelScore;
        document.getElementById('totalScore').textContent = this.totalScore;
        document.getElementById('finalHighScore').textContent = this.highScore;
        document.getElementById('gameOverTitle').textContent = 'Game Over!';
        document.getElementById('playAgainBtn').style.display = 'inline-block';
        document.getElementById('nextLevelBtn').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'flex';
    }
    
    hideGameOverScreen() {
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('playAgainBtn').style.display = 'inline-block';
        document.getElementById('nextLevelBtn').style.display = 'none';
    }
    
    showGameWinScreen() {
        document.getElementById('levelScore').textContent = this.levelScore;
        document.getElementById('totalScore').textContent = this.totalScore;
        document.getElementById('finalHighScore').textContent = this.highScore;
        document.getElementById('gameOverTitle').textContent = `Level ${this.currentLevel} Complete!`;
        document.getElementById('playAgainBtn').style.display = 'none';
        document.getElementById('nextLevelBtn').style.display = 'inline-block';
        document.getElementById('gameOverScreen').style.display = 'flex';
    }
    
    loadHighScore() {
        try {
            return parseInt(localStorage.getItem('doodleJumpHighScore')) || 0;
        } catch (e) {
            return 0;
        }
    }
    
    saveHighScore(score) {
        try {
            localStorage.setItem('doodleJumpHighScore', score.toString());
        } catch (e) {
            // Ignore localStorage errors
        }
    }
    
    // Add particle effects
    addParticle(x, y, type = 'default') {
        const particle = new Particle(x, y, type);
        this.particles.push(particle);
    }
    
    // Get current game state
    getState() {
        return {
            state: this.state,
            score: this.score,
            totalScore: this.totalScore,
            levelScore: this.levelScore,
            currentLevel: this.currentLevel,
            highScore: this.highScore,
            difficulty: this.difficulty,
            playerY: this.player.y,
            cameraY: this.camera.y
        };
    }
}

// Simple particle class for visual effects
class Particle {
    constructor(x, y, type = 'default') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.life = 1.0;
        this.decay = 0.02;
        
        switch (type) {
            case 'jump':
                this.velocityX = (Math.random() - 0.5) * 4;
                this.velocityY = Math.random() * -3 - 1;
                this.color = '#5a67d8';
                this.size = Math.random() * 3 + 2;
                break;
            case 'landing':
                this.velocityX = (Math.random() - 0.5) * 2;
                this.velocityY = Math.random() * -2;
                this.color = '#48bb78';
                this.size = Math.random() * 4 + 3;
                break;
            default:
                this.velocityX = (Math.random() - 0.5) * 2;
                this.velocityY = (Math.random() - 0.5) * 2;
                this.color = '#ffffff';
                this.size = Math.random() * 2 + 1;
        }
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.life -= this.decay;
        this.velocityY += 0.1; // gravity
        this.size *= 0.98; // shrink
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}