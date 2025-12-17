class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 3; // Reduced speed for slower gameplay
        this.jumpPower = -12; // Reduced jump power for more controlled jumps
        this.gravity = 0.3; // Reduced gravity for slower, floatier jumps
        this.friction = 0.8;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.maxVelocityY = 12; // Reduced max fall speed
        
        // Player state
        this.onGround = false;
        this.isJumping = false;
        this.score = 0;
        this.maxHeight = y;
        
        // Visual properties
        this.color = '#5a67d8';
        this.trail = [];
        this.maxTrailLength = 10;
        
        // Animation properties
        this.bounceScale = 1;
        this.bounceSpeed = 0;
    }
    
    update(inputHandler, platforms) {
        // Handle horizontal movement
        if (inputHandler.keys.left || inputHandler.keys.a) {
            this.velocityX = -this.speed;
        } else if (inputHandler.keys.right || inputHandler.keys.d) {
            this.velocityX = this.speed;
        } else {
            this.velocityX *= this.friction;
        }
        
        // Apply gravity
        this.velocityY += this.gravity;
        
        // Limit maximum falling speed
        if (this.velocityY > this.maxVelocityY) {
            this.velocityY = this.maxVelocityY;
        }
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Handle screen boundaries
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        } else if (this.x + this.width > 800) {
            this.x = 800 - this.width;
            this.velocityX = 0;
        }
        
        // Update rotation based on movement
        this.rotationSpeed = this.velocityX * 0.1;
        this.rotation += this.rotationSpeed;
        
        // Update trail effect
        this.updateTrail();
        
        // Update bounce animation
        this.updateBounceAnimation();
        
        // Update score based on height
        if (this.y < this.maxHeight) {
            this.maxHeight = this.y;
            this.score = Math.max(0, Math.floor((600 - this.maxHeight) / 10));
        }
    }
    
    updateTrail() {
        // Add current position to trail
        this.trail.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            alpha: 1.0
        });
        
        // Update trail opacity and remove old points
        for (let i = 0; i < this.trail.length; i++) {
            this.trail[i].alpha -= 0.1;
        }
        
        // Remove faded trail points
        this.trail = this.trail.filter(point => point.alpha > 0);
        
        // Limit trail length
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }
    
    updateBounceAnimation() {
        if (this.bounceSpeed > 0) {
            this.bounceScale = 1 + Math.sin(this.bounceSpeed) * 0.2;
            this.bounceSpeed += 0.3;
            if (this.bounceSpeed > Math.PI) {
                this.bounceSpeed = 0;
                this.bounceScale = 1;
            }
        }
    }
    
    jump() {
        if (this.onGround) {
            this.velocityY = this.jumpPower;
            this.onGround = false;
            this.isJumping = true;
            this.bounceSpeed = 0.1;
            
            // Add jump particles or effects here
            this.createJumpEffect();
        }
    }
    
    createJumpEffect() {
        // This could be expanded for particle effects
        console.log('Jump effect created!');
    }
    
    landOnPlatform(platform) {
        if (this.velocityY > 0) { // Only land when falling
            this.y = platform.y - this.height;
            
            // Handle different platform types
            if (platform.type === 'spring') {
                this.velocityY = this.jumpPower * 1.5; // Extra bounce on spring platforms
            } else {
                this.velocityY = this.jumpPower * 0.8; // Normal bounce
            }
            
            this.onGround = true;
            this.isJumping = false;
            this.bounceSpeed = 0.1;
            
            // Create landing effect
            this.createLandingEffect();
        }
    }
    
    createLandingEffect() {
        // This could be expanded for landing particles
        console.log('Landing effect created!');
    }
    
    checkPlatformCollision(platforms) {
        this.onGround = false;
        
        for (let platform of platforms) {
            if (this.velocityY > 0 && // Falling
                this.x < platform.x + platform.width &&
                this.x + this.width > platform.x &&
                this.y < platform.y + platform.height &&
                this.y + this.height > platform.y) {
                
                // Check if landing on top of platform
                if (this.y + this.height - this.velocityY <= platform.y) {
                    this.landOnPlatform(platform);
                    break;
                }
            }
        }
    }
    
    isOutOfBounds() {
        return this.y > 700; // Game over if player falls too far
    }
    
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.onGround = false;
        this.isJumping = false;
        this.score = 0;
        this.maxHeight = y;
        this.trail = [];
        this.bounceScale = 1;
        this.bounceSpeed = 0;
    }
    
    render(ctx) {
        ctx.save();
        
        // Render trail
        this.renderTrail(ctx);
        
        // Apply transformations for rotation and scale
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.scale(this.bounceScale, this.bounceScale);
        
        // Draw player character
        this.drawPlayer(ctx);
        
        ctx.restore();
    }
    
    renderTrail(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            ctx.globalAlpha = point.alpha * 0.5;
            ctx.fillStyle = '#5a67d8';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }
    
    drawPlayer(ctx) {
        // Draw character body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Draw character face
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-10, -10, 5, 0, Math.PI * 2); // Left eye
        ctx.arc(10, -10, 5, 0, Math.PI * 2); // Right eye
        ctx.fill();
        
        // Draw pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-8, -8, 2, 0, Math.PI * 2); // Left pupil
        ctx.arc(12, -8, 2, 0, Math.PI * 2); // Right pupil
        ctx.fill();
        
        // Draw smile
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 5, 10, 0, Math.PI);
        ctx.stroke();
    }
}