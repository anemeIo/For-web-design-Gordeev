class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
        this.effects = [];
        this.shakeIntensity = 0;
        this.shakeDecay = 0.9;
    }
    
    // Add screen shake effect
    addScreenShake(intensity = 5) {
        this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    }
    
    // Apply screen shake transformation
    applyScreenShake() {
        if (this.shakeIntensity > 0.1) {
            const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
            const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(shakeX, shakeY);
            this.shakeIntensity *= this.shakeDecay;
        } else {
            this.shakeIntensity = 0;
        }
    }
    
    // Render background with gradient and effects
    renderBackground(cameraY = 0) {
        // Create sky gradient that changes with height
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        
        // Change colors based on height
        const heightRatio = Math.min(cameraY / 1000, 1);
        const skyColor = this.interpolateColor('#87ceeb', '#4a5568', heightRatio);
        const groundColor = this.interpolateColor('#98fb98', '#2d3748', heightRatio);
        
        gradient.addColorStop(0, skyColor);
        gradient.addColorStop(1, groundColor);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render stars at high altitudes
        if (heightRatio > 0.5) {
            this.renderStars(cameraY, heightRatio);
        }
        
        // Render clouds
        this.renderClouds(cameraY);
    }
    
    // Interpolate between two colors
    interpolateColor(color1, color2, ratio) {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // Render stars for high altitude
    renderStars(cameraY, intensity = 1) {
        const starCount = Math.floor(50 * intensity);
        this.ctx.fillStyle = `rgba(255, 255, 255, ${intensity * 0.8})`;
        
        for (let i = 0; i < starCount; i++) {
            const x = (i * 73 + cameraY * 0.1) % this.canvas.width;
            const y = (i * 37 + cameraY * 0.05) % this.canvas.height;
            const size = Math.random() * 2 + 1;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // Render animated clouds
    renderClouds(cameraY) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        
        // Multiple cloud layers for parallax effect
        for (let layer = 0; layer < 3; layer++) {
            const speed = 0.1 * (layer + 1);
            const offset = (cameraY * speed) % (this.canvas.height + 100);
            
            for (let i = 0; i < 5; i++) {
                const x = (i * 200 + 50) % this.canvas.width;
                const y = (i * 150 + offset) % (this.canvas.height + 100) - 50;
                const size = 30 - layer * 5;
                
                this.renderCloud(x, y, size);
            }
        }
    }
    
    // Render a single cloud
    renderCloud(x, y, size) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.8, y, size * 1.2, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.6, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.8, y - size * 0.6, size * 0.8, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // Render jump trail effect
    renderJumpTrail(player) {
        if (player.trail.length < 2) return;
        
        this.ctx.strokeStyle = 'rgba(90, 103, 216, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        for (let i = 0; i < player.trail.length; i++) {
            const point = player.trail[i];
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        
        this.ctx.stroke();
    }
    
    // Render particle explosion
    renderExplosion(x, y, color = '#ff6b6b', count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 3 + 2;
            const particle = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: color,
                size: Math.random() * 3 + 2
            };
            
            this.effects.push(particle);
        }
    }
    
    // Update and render active effects
    updateEffects() {
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            
            // Update particle
            effect.x += effect.vx;
            effect.y += effect.vy;
            effect.vy += 0.1; // gravity
            effect.life -= 0.02;
            effect.size *= 0.98;
            
            // Render particle
            this.ctx.save();
            this.ctx.globalAlpha = effect.life;
            this.ctx.fillStyle = effect.color;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
            
            // Remove dead particles
            if (effect.life <= 0) {
                this.effects.splice(i, 1);
            }
        }
    }
    
    // Render platform with special effects
    renderPlatform(platform, cameraY) {
        this.ctx.save();
        
        // Apply bounce offset
        this.ctx.translate(0, platform.bounceOffset);
        
        // Platform shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(platform.x + 2, platform.y + 2, platform.width, platform.height);
        
        // Platform base with gradient
        const gradient = this.ctx.createLinearGradient(
            platform.x, platform.y, 
            platform.x, platform.y + platform.height
        );
        gradient.addColorStop(0, platform.color);
        gradient.addColorStop(1, this.darkenColor(platform.color, 0.2));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform border
        this.ctx.strokeStyle = platform.borderColor;
        this.ctx.lineWidth = platform.borderWidth;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        
        // Platform-specific details
        this.renderPlatformDetails(platform);
        
        this.ctx.restore();
    }
    
    // Darken a color
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - amount));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - amount));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - amount));
        
        return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    }
    
    // Render platform-specific details
    renderPlatformDetails(platform) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        
        switch (platform.type) {
            case 'moving':
                const arrow = platform.moveSpeed > 0 ? '→' : '←';
                this.ctx.fillText(arrow, platform.x + platform.width / 2, platform.y + platform.height / 2 + 4);
                break;
                
            case 'breakable':
                this.ctx.strokeStyle = '#2d3748';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(platform.x + 10, platform.y + 5);
                this.ctx.lineTo(platform.x + 20, platform.y + 10);
                this.ctx.lineTo(platform.x + 15, platform.y + 15);
                this.ctx.stroke();
                break;
                
            case 'spring':
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                for (let i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                    this.ctx.arc(platform.x + platform.width / 2, platform.y + i * 6 + 5, 8, 0, Math.PI);
                    this.ctx.stroke();
                }
                break;
                
            case 'cloud':
                this.ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 3; i++) {
                    this.ctx.beginPath();
                    this.ctx.arc(platform.x + i * 25 + 15, platform.y + 5, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;
        }
    }
    
    // Render player with enhanced effects
    renderPlayer(player) {
        this.ctx.save();
        
        // Apply transformations
        this.ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        this.ctx.rotate(player.rotation * Math.PI / 180);
        this.ctx.scale(player.bounceScale, player.bounceScale);
        
        // Player shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(-player.width / 2 + 2, -player.height / 2 + 2, player.width, player.height);
        
        // Player body with gradient
        const gradient = this.ctx.createLinearGradient(
            -player.width / 2, -player.height / 2,
            player.width / 2, player.height / 2
        );
        gradient.addColorStop(0, player.color);
        gradient.addColorStop(1, this.darkenColor(player.color, 0.3));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
        
        // Player border
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(-player.width / 2, -player.height / 2, player.width, player.height);
        
        // Player face
        this.renderPlayerFace();
        
        this.ctx.restore();
    }
    
    // Render player face
    renderPlayerFace() {
        // Eyes
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(-10, -10, 5, 0, Math.PI * 2);
        this.ctx.arc(10, -10, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pupils
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(-8, -8, 2, 0, Math.PI * 2);
        this.ctx.arc(12, -8, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Smile
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.arc(0, 5, 10, 0, Math.PI);
        this.ctx.stroke();
    }
    
    // Custom arc function for smile
    arc(x, y, radius, startAngle, endAngle) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, startAngle, endAngle);
        this.ctx.stroke();
    }
}