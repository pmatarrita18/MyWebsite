/* ============================================
   PIXEL BLASTER - Mini Game (Track 5)
   Space Invaders style shooter
   ============================================ */

class PixelBlaster {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.level = 1;
        this.survivalTime = 0;

        // Player
        this.player = {
            x: this.width / 2,
            y: this.height - 40,
            width: 20,
            height: 20,
            speed: 5,
            color: '#16DB93'
        };

        // Game objects
        this.bullets = [];
        this.targets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];

        // Controls
        this.keys = {};

        // Target spawn
        this.targetSpawnTimer = 0;
        this.targetSpawnInterval = 60; // frames

        // Enemy spawn
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 180; // frames (3 seconds)

        // Colors
        this.colors = {
            green: '#16DB93',
            blue: '#048BA8',
            magenta: '#A4036F'
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === ' ' && this.gameRunning) {
                e.preventDefault();
                this.shoot();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    start() {
        this.gameRunning = true;
        this.score = 0;
        this.health = this.maxHealth;
        this.level = 1;
        this.survivalTime = 0;
        this.bullets = [];
        this.targets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];
        this.player.x = this.width / 2;
        this.targetSpawnInterval = 60;
        this.enemySpawnInterval = 180;

        this.hideOverlay('game-start-overlay');
        this.hideOverlay('game-over-overlay');
        this.updateHUD();

        this.gameLoop();
    }

    shoot() {
        // Infinite ammo!
        this.bullets.push({
            x: this.player.x,
            y: this.player.y,
            width: 4,
            height: 12,
            speed: 8,
            color: this.colors.green
        });
    }

    spawnTarget() {
        const types = [
            { color: this.colors.green, points: 10, speed: 2, size: 15 },
            { color: this.colors.blue, points: 20, speed: 3, size: 12 },
            { color: this.colors.magenta, points: 50, speed: 4, size: 10 }
        ];

        const type = types[Math.floor(Math.random() * types.length)];

        this.targets.push({
            x: Math.random() * (this.width - type.size),
            y: -type.size,
            width: type.size,
            height: type.size,
            speed: type.speed + (this.level * 0.3),
            color: type.color,
            points: type.points
        });
    }

    spawnEnemy() {
        const enemyWidth = 30;
        const enemyHeight = 25;

        this.enemies.push({
            x: Math.random() * (this.width - enemyWidth),
            y: 30, // Spawn near top
            width: enemyWidth,
            height: enemyHeight,
            speed: 1,
            color: this.colors.magenta,
            shootTimer: 0,
            shootInterval: 120 // Shoot every 2 seconds
        });
    }

    update() {
        if (!this.gameRunning) return;

        // Track survival time
        this.survivalTime++;
        if (this.survivalTime % 60 === 0) {
            this.score = Math.floor(this.survivalTime / 60); // Score = seconds survived
            this.level = Math.floor(this.survivalTime / 300) + 1; // Level up every 5 seconds
            this.updateHUD();
        }

        // Update player position (arrow keys only)
        if (this.keys['ArrowLeft']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight']) {
            this.player.x += this.player.speed;
        }

        // Keep player in bounds
        this.player.x = Math.max(this.player.width / 2, Math.min(this.width - this.player.width / 2, this.player.x));

        // Update bullets
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });

        // Update targets (asteroids)
        this.targets = this.targets.filter(target => {
            target.y += target.speed;

            // Check collision with player
            const playerBox = {
                x: this.player.x - this.player.width / 2,
                y: this.player.y,
                width: this.player.width,
                height: this.player.height
            };

            if (this.collision(target, playerBox)) {
                // Player hit! Lose health
                this.health -= 10;
                this.updateHUD();

                // Create explosion at collision point
                this.createExplosion(target.x + target.width / 2, target.y + target.height / 2, target.color);

                // Check game over
                if (this.health <= 0) {
                    this.gameOver();
                }

                return false; // Remove asteroid
            }

            // Remove if asteroid goes off screen (miss)
            if (target.y > this.height) {
                return false;
            }

            return true;
        });

        // Check collisions
        this.checkCollisions();

        // Update enemies
        this.enemies = this.enemies.filter(enemy => {
            // Move side to side
            enemy.x += enemy.speed;

            // Bounce off walls
            if (enemy.x <= 0 || enemy.x >= this.width - enemy.width) {
                enemy.speed *= -1;
            }

            // Shoot at player
            enemy.shootTimer++;
            if (enemy.shootTimer > enemy.shootInterval) {
                this.enemyBullets.push({
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y + enemy.height,
                    width: 4,
                    height: 10,
                    speed: 4,
                    color: enemy.color
                });
                enemy.shootTimer = 0;
            }

            return true;
        });

        // Update enemy bullets
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;

            // Check collision with player
            const playerBox = {
                x: this.player.x - this.player.width / 2,
                y: this.player.y,
                width: this.player.width,
                height: this.player.height
            };

            if (this.collision(bullet, playerBox)) {
                // Player hit by enemy bullet!
                this.health -= 5;
                this.updateHUD();

                // Create small explosion
                this.createExplosion(bullet.x, bullet.y, bullet.color);

                // Check game over
                if (this.health <= 0) {
                    this.gameOver();
                }

                return false; // Remove bullet
            }

            // Remove if off screen
            return bullet.y < this.height + bullet.height;
        });

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            p.alpha = p.life / p.maxLife;
            return p.life > 0;
        });

        // Spawn targets (difficulty increases over time)
        this.targetSpawnTimer++;
        if (this.targetSpawnTimer > this.targetSpawnInterval) {
            this.spawnTarget();
            this.targetSpawnTimer = 0;

            // Increase difficulty - more asteroids! (faster ramp)
            if (this.targetSpawnInterval > 15) {
                this.targetSpawnInterval -= 0.8; // Spawn MUCH faster over time
            }
        }

        // Spawn enemies
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer > this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;

            // Enemies spawn more frequently too
            if (this.enemySpawnInterval > 60) {
                this.enemySpawnInterval -= 3;
            }
        }
    }

    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            let bulletHit = false;

            // Check bullet vs asteroids
            for (let j = this.targets.length - 1; j >= 0; j--) {
                const target = this.targets[j];

                if (this.collision(bullet, target)) {
                    // Hit! Destroyed asteroid
                    this.score += target.points;
                    this.updateHUD();

                    // Create particles
                    this.createExplosion(target.x + target.width / 2, target.y + target.height / 2, target.color);

                    // Remove bullet and target
                    this.bullets.splice(i, 1);
                    this.targets.splice(j, 1);
                    bulletHit = true;
                    break;
                }
            }

            // Check bullet vs enemies
            if (!bulletHit && this.bullets[i]) {
                for (let j = this.enemies.length - 1; j >= 0; j--) {
                    const enemy = this.enemies[j];

                    if (this.collision(this.bullets[i], enemy)) {
                        // Hit! Destroyed enemy
                        this.score += 100; // Enemies worth more points
                        this.updateHUD();

                        // Create particles
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);

                        // Remove bullet and enemy
                        this.bullets.splice(i, 1);
                        this.enemies.splice(j, 1);
                        break;
                    }
                }
            }
        }
    }

    collision(a, b) {
        return a.x < b.x + b.width &&
               a.x + a.width > b.x &&
               a.y < b.y + b.height &&
               a.y + a.height > b.y;
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = 2 + Math.random() * 2;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 3,
                color: color,
                life: 30,
                maxLife: 30,
                alpha: 1
            });
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#050508';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw player
        this.ctx.fillStyle = this.player.color;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.player.color;
        this.drawPixelRect(this.player.x - this.player.width / 2, this.player.y, this.player.width, this.player.height);
        this.ctx.shadowBlur = 0;

        // Draw bullets
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        this.ctx.shadowBlur = 0;

        // Draw targets
        this.targets.forEach(target => {
            this.ctx.fillStyle = target.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = target.color;
            this.drawPixelRect(target.x, target.y, target.width, target.height);
        });
        this.ctx.shadowBlur = 0;

        // Draw enemies
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = enemy.color;
            this.drawPixelRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });
        this.ctx.shadowBlur = 0;

        // Draw enemy bullets
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        this.ctx.shadowBlur = 0;

        // Draw particles
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1;
    }

    drawPixelRect(x, y, w, h) {
        // Simple pixel art style square
        this.ctx.fillRect(x, y, w, h);
    }

    gameLoop() {
        if (!this.gameRunning) return;

        this.update();
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    gameOver() {
        this.gameRunning = false;
        const survivalSeconds = Math.floor(this.survivalTime / 60);
        document.getElementById('final-score').textContent = survivalSeconds + ' seconds';
        this.showOverlay('game-over-overlay');
    }

    updateHUD() {
        document.getElementById('game-score').textContent = Math.floor(this.survivalTime / 60) + 's';
        document.getElementById('game-health').textContent = Math.max(0, Math.floor(this.health));
        document.getElementById('game-level').textContent = this.level;
    }

    showOverlay(id) {
        document.getElementById(id).classList.remove('hidden');
    }

    hideOverlay(id) {
        document.getElementById(id).classList.add('hidden');
    }
}

// Initialize game when DOM is loaded
let game;

function initGame() {
    game = new PixelBlaster();

    document.getElementById('start-game-btn').addEventListener('click', () => {
        game.start();
    });

    document.getElementById('restart-game-btn').addEventListener('click', () => {
        game.start();
    });
}

// Export for main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initGame };
}
