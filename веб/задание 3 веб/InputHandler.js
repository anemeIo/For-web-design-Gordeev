class InputHandler {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            space: false,
            a: false,
            d: false,
            w: false,
            s: false
        };
        
        this.touchControls = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0
        };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Touch events for mobile
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Prevent default touch behaviors that might interfere with the game
        document.addEventListener('touchmove', (e) => e.preventDefault());
        
        // Mouse events for testing (can be removed in production)
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    }
    
    handleKeyDown(e) {
        switch(e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = true;
                this.keys.a = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = true;
                this.keys.d = true;
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'Space':
                this.keys.up = true;
                this.keys.w = true;
                this.keys.space = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.down = true;
                this.keys.s = true;
                break;
        }
    }
    
    handleKeyUp(e) {
        switch(e.code) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = false;
                this.keys.a = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = false;
                this.keys.d = false;
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'Space':
                this.keys.up = false;
                this.keys.w = false;
                this.keys.space = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                this.keys.down = false;
                this.keys.s = false;
                break;
        }
    }
    
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            this.touchControls.active = true;
            const touch = e.touches[0];
            this.touchControls.startX = touch.clientX;
            this.touchControls.startY = touch.clientY;
            this.touchControls.currentX = touch.clientX;
            this.touchControls.currentY = touch.clientY;
        }
    }
    
    handleTouchMove(e) {
        if (this.touchControls.active && e.touches.length === 1) {
            const touch = e.touches[0];
            this.touchControls.currentX = touch.clientX;
            this.touchControls.currentY = touch.clientY;
            
            // Calculate touch delta for movement
            const deltaX = this.touchControls.currentX - this.touchControls.startX;
            const deltaY = this.touchControls.currentY - this.touchControls.startY;
            
            // Horizontal movement
            if (Math.abs(deltaX) > 20) {
                if (deltaX > 0) {
                    this.keys.right = true;
                    this.keys.left = false;
                } else {
                    this.keys.left = true;
                    this.keys.right = false;
                }
            } else {
                this.keys.left = false;
                this.keys.right = false;
            }
            
            // Vertical movement (jump)
            if (deltaY < -50) {
                this.keys.up = true;
            } else {
                this.keys.up = false;
            }
        }
    }
    
    handleTouchEnd(e) {
        this.touchControls.active = false;
        this.keys.left = false;
        this.keys.right = false;
        this.keys.up = false;
    }
    
    handleMouseDown(e) {
        // For testing purposes - can be removed in production
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Simulate touch controls with mouse
        if (x < 400) {
            this.keys.left = true;
        } else {
            this.keys.right = true;
        }
    }
    
    handleMouseUp(e) {
        this.keys.left = false;
        this.keys.right = false;
    }
    
    // Check if a specific key is pressed
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
    
    // Get horizontal movement direction
    getHorizontalMovement() {
        if (this.keys.left || this.keys.a) return -1;
        if (this.keys.right || this.keys.d) return 1;
        return 0;
    }
    
    // Get vertical movement direction
    getVerticalMovement() {
        if (this.keys.up || this.keys.w || this.keys.space) return -1;
        if (this.keys.down || this.keys.s) return 1;
        return 0;
    }
    
    // Check if jump is requested
    isJumpRequested() {
        return this.keys.up || this.keys.w || this.keys.space;
    }
    
    // Disable all inputs (useful for game over state)
    disableAllInputs() {
        Object.keys(this.keys).forEach(key => {
            this.keys[key] = false;
        });
        this.touchControls.active = false;
    }
    
    // Enable inputs
    enableInputs() {
        // Inputs are automatically handled by event listeners
    }
    
    // Get touch control info for debugging
    getTouchInfo() {
        return {
            active: this.touchControls.active,
            startX: this.touchControls.startX,
            startY: this.touchControls.startY,
            currentX: this.touchControls.currentX,
            currentY: this.touchControls.currentY,
            deltaX: this.touchControls.currentX - this.touchControls.startX,
            deltaY: this.touchControls.currentY - this.touchControls.startY
        };
    }
}