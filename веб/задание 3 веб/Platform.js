class Platform {
    constructor(x, y, width = 80, height = 20, type = 'standard') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        
        // Platform properties based on type
        this.color = this.getPlatformColor(type);
        this.isMoving = type === 'moving';
        this.moveSpeed = this.isMoving ? (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1) : 0;
        this.moveRange = this.isMoving ? 100 : 0;
        this.startX = x;
        
        // Visual properties
        this.borderColor = '#2d3748';
        this.borderWidth = 2;
        
        // Animation properties
        this.bounceOffset = 0;
        this.bounceSpeed = Math.random() * 0.05 + 0.02;
    }
    
    getPlatformColor(type) {
        const colors = {
            'standard': '#48bb78',
            'moving': '#4299e1',
            'breakable': '#ed8936',
            'spring': '#9f7aea',
            'cloud': '#bee3f8'
        };
        return colors[type] || colors['standard'];
    }
    
    update() {
        // Update moving platforms
        if (this.isMoving) {
            this.x += this.moveSpeed;
            
            // Bounce off boundaries
            if (this.x <= this.startX - this.moveRange || 
                this.x >= this.startX + this.moveRange ||
                this.x <= 0 || 
                this.x + this.width >= 800) {
                this.moveSpeed *= -1;
            }
        }
        
        // Update bounce animation - disabled (no shaking)
        this.bounceOffset = 0;
    }
    
    render(ctx) {
        ctx.save();
        
        // Apply bounce offset - disabled (no shaking)
        // ctx.translate(0, this.bounceOffset);
        
        // Draw platform shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(this.x + 2, this.y + 2, this.width, this.height);
        
        // Draw platform base
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw platform border
        ctx.strokeStyle = this.borderColor;
        ctx.lineWidth = this.borderWidth;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Add platform-specific details
        this.renderPlatformDetails(ctx);
        
        ctx.restore();
    }
    
    renderPlatformDetails(ctx) {
        switch (this.type) {
            case 'moving':
                // Draw direction arrows
                ctx.fillStyle = '#ffffff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                const arrow = this.moveSpeed > 0 ? '→' : '←';
                ctx.fillText(arrow, this.x + this.width / 2, this.y + this.height / 2 + 4);
                break;
                
            case 'breakable':
                // Draw crack pattern
                ctx.strokeStyle = '#2d3748';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(this.x + 10, this.y + 5);
                ctx.lineTo(this.x + 20, this.y + 10);
                ctx.lineTo(this.x + 15, this.y + 15);
                ctx.stroke();
                break;
                
            case 'spring':
                // Draw spring coils
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(this.x + this.width / 2, this.y + i * 6 + 5, 8, 0, Math.PI);
                    ctx.stroke();
                }
                break;
                
            case 'cloud':
                // Draw cloud puffs
                ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.arc(this.x + i * 25 + 15, this.y + 5, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;
        }
    }
}

class PlatformManager {
    constructor() {
        this.platforms = [];
        this.lastPlatformY = 600;
        this.minPlatformGap = 80;
        this.maxPlatformGap = 150;
        this.platformTypes = ['standard', 'moving', 'breakable', 'spring', 'cloud'];
        this.typeWeights = [0.5, 0.2, 0.1, 0.1, 0.1]; // Probability weights
    }
    
    generateInitialPlatforms() {
        // Generate starting platforms
        this.platforms = [];
        
        // Starting platform
        this.platforms.push(new Platform(360, 550, 80, 20, 'standard'));
        
        // Generate long level (3 screens height = 1800 pixels)
        let currentY = 550;
        const targetHeight = -600; // 3 screens up
        
        while (currentY > targetHeight) {
            currentY -= this.getRandomPlatformGap();
            const platform = this.generatePlatform(currentY);
            this.platforms.push(platform);
        }
        
        // Add finish platform at the top
        this.platforms.push(new Platform(360, targetHeight - 50, 120, 20, 'spring'));
        
        this.lastPlatformY = targetHeight - 50;
    }
    
    generatePlatform(yPosition) {
        const x = Math.random() * (800 - 80);
        const width = Math.random() * 40 + 60; // 60-100 width
        const type = this.getRandomPlatformType();
        
        return new Platform(x, yPosition, width, 20, type);
    }
    
    getRandomPlatformGap() {
        // Ensure platforms are reachable (within player's jump range)
        // Player jump power is -15, gravity is 0.6, so max height is about 80-100 pixels
        const maxReachableGap = 90; // Conservative estimate
        const minGap = 60;
        const maxGap = Math.min(this.maxPlatformGap, maxReachableGap);
        
        return Math.random() * (maxGap - minGap) + minGap;
    }
    
    getRandomPlatformType() {
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < this.platformTypes.length; i++) {
            cumulative += this.typeWeights[i];
            if (random < cumulative) {
                return this.platformTypes[i];
            }
        }
        
        return 'standard'; // Fallback
    }
    
    update(playerY) {
        // Update all platforms
        for (let platform of this.platforms) {
            platform.update();
        }
        
        // Remove platforms that are too far below the player
        this.platforms = this.platforms.filter(platform => platform.y < playerY + 700);
        
        // Generate new platforms above the player
        this.generateNewPlatforms(playerY);
    }
    
    generateNewPlatforms(playerY) {
        // For fixed levels, don't generate new platforms dynamically
        // This keeps the level design fixed as intended
        return;
    }
    
    getPlatformsInRange(y, range = 300) {
        return this.platforms.filter(platform => 
            Math.abs(platform.y - y) < range
        );
    }
    render(ctx) {
        // Render all platforms
        for (let platform of this.platforms) {
            platform.render(ctx);
        }
    }
    
    // Reset platform manager for new game
    reset() {
        this.platforms = [];
        this.lastPlatformY = 600;
        this.generateInitialPlatforms();
    }
}