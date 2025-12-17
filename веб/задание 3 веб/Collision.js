class CollisionDetector {
    constructor() {
        this.collisionResponse = {
            none: 0,
            top: 1,
            bottom: 2,
            left: 3,
            right: 4
        };
    }
    
    // Check collision between two rectangles
    checkRectangleCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // Get collision side between two rectangles
    getCollisionSide(rect1, rect2, velocityY = 0) {
        if (!this.checkRectangleCollision(rect1, rect2)) {
            return this.collisionResponse.none;
        }
        
        const overlapLeft = (rect1.x + rect1.width) - rect2.x;
        const overlapRight = (rect2.x + rect2.width) - rect1.x;
        const overlapTop = (rect1.y + rect1.height) - rect2.y;
        const overlapBottom = (rect2.y + rect2.height) - rect1.y;
        
        // Find the smallest overlap
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapTop && velocityY >= 0) {
            return this.collisionResponse.top;
        } else if (minOverlap === overlapBottom && velocityY <= 0) {
            return this.collisionResponse.bottom;
        } else if (minOverlap === overlapLeft) {
            return this.collisionResponse.left;
        } else if (minOverlap === overlapRight) {
            return this.collisionResponse.right;
        }
        
        return this.collisionResponse.none;
    }
    
    // Handle player-platform collision
    handlePlayerPlatformCollision(player, platforms) {
        let landed = false;
        
        for (let platform of platforms) {
            const collisionSide = this.getCollisionSide(player, platform, player.velocityY);
            
            switch (collisionSide) {
                case this.collisionResponse.top:
                    // Player landed on top of platform - only when falling from above
                    if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y + 5) {
                        player.y = platform.y - player.height;
                        player.velocityY = player.jumpPower;
                        player.onGround = true;
                        landed = true;
                        
                        // Platform-specific effects
                        this.handlePlatformEffect(player, platform);
                    }
                    break;
                    
                case this.collisionResponse.bottom:
                    // Player can pass through platforms from bottom to top (like Doodle Jump)
                    // No collision response - allow passing through
                    break;
                    
                case this.collisionResponse.left:
                    // Player hit left side of platform
                    player.x = platform.x - player.width;
                    player.velocityX = 0;
                    break;
                    
                case this.collisionResponse.right:
                    // Player hit right side of platform
                    player.x = platform.x + platform.width;
                    player.velocityX = 0;
                    break;
            }
        }
        
        if (!landed) {
            player.onGround = false;
        }
        
        return landed;
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
    
    // Create spring effect
    createSpringEffect(platform) {
        // This could be expanded to show spring compression animation
        platform.bounceOffset = -5;
        setTimeout(() => {
            platform.bounceOffset = 0;
        }, 200);
    }
    
    // Break a platform
    breakPlatform(platform, gameInstance) {
        // Remove the platform after a short delay
        setTimeout(() => {
            if (gameInstance && gameInstance.platformManager) {
                const index = gameInstance.platformManager.platforms.indexOf(platform);
                if (index > -1) {
                    gameInstance.platformManager.platforms.splice(index, 1);
                }
            }
        }, 100);
    }
    
    // Check if player is out of bounds
    checkBounds(player, canvas) {
        if (player.y > canvas.height + 100) {
            return 'bottom';
        }
        if (player.x < -50 || player.x > canvas.width + 50) {
            return 'side';
        }
        return 'none';
    }
    
    // Predict collision trajectory
    predictCollision(player, platforms, steps = 5) {
        const predictions = [];
        const stepSize = 1 / steps;
        
        for (let i = 1; i <= steps; i++) {
            const t = i * stepSize;
            const futureX = player.x + player.velocityX * t;
            const futureY = player.y + player.velocityY * t;
            
            const futurePlayer = {
                x: futureX,
                y: futureY,
                width: player.width,
                height: player.height
            };
            
            for (let platform of platforms) {
                if (this.checkRectangleCollision(futurePlayer, platform)) {
                    predictions.push({
                        time: t,
                        platform: platform,
                        position: { x: futureX, y: futureY }
                    });
                }
            }
        }
        
        return predictions;
    }
    
    // Optimize collision detection by using spatial partitioning
    getNearbyPlatforms(player, platforms, range = 100) {
        return platforms.filter(platform => {
            const distance = Math.sqrt(
                Math.pow(platform.x - player.x, 2) + 
                Math.pow(platform.y - player.y, 2)
            );
            return distance < range;
        });
    }
    
    // Debug rendering for collision detection
    renderCollisionDebug(ctx, player, platforms) {
        // Draw collision boxes
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(player.x, player.y, player.width, player.height);
        
        for (let platform of platforms) {
            ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        }
        
        // Draw collision predictions
        const predictions = this.predictCollision(player, platforms);
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        for (let pred of predictions) {
            ctx.fillRect(pred.position.x, pred.position.y, player.width, player.height);
        }
    }
}