/* ============================================
   TRON ARCADE WEBSITE - MAIN JAVASCRIPT
   Foundation Track - Basic Interactions
   ============================================ */

// V2 - Stat bars removed

// ===== VIDEO LAZY LOADING =====
const loadedVideos = new Set();

function lazyLoadVideo(videoElement) {
    if (!videoElement || loadedVideos.has(videoElement.id)) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        // If video is already loaded
        if (videoElement.readyState >= 3) {
            loadedVideos.add(videoElement.id);
            resolve();
            return;
        }

        // Set preload to auto to start loading
        videoElement.preload = 'auto';
        videoElement.load();

        // Wait for video to be ready
        videoElement.addEventListener('canplaythrough', () => {
            loadedVideos.add(videoElement.id);
            resolve();
        }, { once: true });

        // Fallback timeout
        setTimeout(() => {
            loadedVideos.add(videoElement.id);
            resolve();
        }, 3000);
    });
}

// Lazy load videos that come into view
function setupVideoIntersectionObserver() {
    const lazyVideos = document.querySelectorAll('[data-lazy-video]');

    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    lazyLoadVideo(video).then(() => {
                        video.play().catch(e => console.log('Video autoplay prevented:', e));
                    });
                    videoObserver.unobserve(video);
                }
            });
        }, { rootMargin: '50px' });

        lazyVideos.forEach(video => videoObserver.observe(video));
    }
}

// ===== EASTER EGG TRIGGER =====
let secretSequence = [];
const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

function checkSecretCode(key) {
    secretSequence.push(key);
    secretSequence.splice(-secretCode.length - 1, secretSequence.length - secretCode.length);

    if (secretSequence.join(',').includes(secretCode.join(','))) {
        showEasterEgg();
        secretSequence = [];
    }
}

function showEasterEgg() {
    const easterEgg = document.getElementById('easter-egg');
    easterEgg.classList.remove('hidden');
}

function hideEasterEgg() {
    const easterEgg = document.getElementById('easter-egg');
    easterEgg.classList.add('hidden');
}

// V2 - Press Start removed

// ===== COIN INSERTION =====
function setupCoinInsertion() {
    const coinWrapper = document.querySelector('.insert-coin-wrapper');
    const insertCoin = document.querySelector('.insert-coin');
    const titleWrapper = document.querySelector('.hero-title-wrapper');

    if (coinWrapper && insertCoin && titleWrapper) {
        insertCoin.addEventListener('click', () => {
            // Add inserting class to trigger coin drop animation
            coinWrapper.classList.add('inserting');

            // Trigger ripples after coin starts dropping
            setTimeout(() => {
                titleWrapper.classList.add('rippling');
            }, 600);

            // Remove classes after animation completes
            setTimeout(() => {
                coinWrapper.classList.remove('inserting');
                titleWrapper.classList.remove('rippling');
            }, 1700);
        });
    }
}

// V2 - Game removed

// ===== EASTER EGG CLOSE BUTTON =====
function setupEasterEggClose() {
    const closeButton = document.querySelector('.btn-close-easter');
    if (closeButton) {
        closeButton.addEventListener('click', hideEasterEgg);
    }
}

// ===== FLOATING STARS/PARTICLES (Track 2) =====
function createFloatingStars() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const colors = ['var(--green)', 'var(--blue)', 'var(--magenta)'];
    const numStars = 20;

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        // Random position
        const startX = Math.random() * 100;
        const drift = (Math.random() - 0.5) * 100; // -50px to +50px drift

        // Random color
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Random duration between 8-15 seconds
        const duration = 8 + Math.random() * 7;

        // Random delay
        const delay = Math.random() * 5;

        // Random size
        const size = 1 + Math.random() * 2;

        star.style.left = startX + '%';
        star.style.bottom = '0';
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.background = color;
        star.style.animationDuration = duration + 's';
        star.style.animationDelay = delay + 's';
        star.style.setProperty('--drift', drift + 'px');

        hero.appendChild(star);
    }
}

// ===== SAMUS SPRITES - REMOVE WHITE BACKGROUND =====
function processSamusSprites() {
    const sprites = [
        { element: document.querySelector('.samus-left'), src: '/img/samusFront.png' },
        { element: document.querySelector('.samus-right'), src: '/img/samusSide.png' }
    ];

    sprites.forEach(sprite => {
        if (!sprite.element) return;

        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Remove white pixels (make them transparent)
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // If pixel is white or very light (threshold 240), make it transparent
                if (r > 240 && g > 240 && b > 240) {
                    data[i + 3] = 0; // Set alpha to 0 (transparent)
                }
            }

            // Put modified image data back
            ctx.putImageData(imageData, 0, 0);

            // Replace div content with canvas
            sprite.element.innerHTML = '';
            sprite.element.appendChild(canvas);
        };
        img.src = sprite.src;
    });
}

// ===== CUSTOM CURSOR WITH TRAIL (Track 4) =====
function setupCustomCursor() {
    // Create cursor element
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Create trail particles (more frequently)
        if (Math.random() > 0.15) { // 85% chance to create particle
            createTrailParticle(e.clientX, e.clientY);
        }
        // Sometimes create double particles for denser trail
        if (Math.random() > 0.6) {
            createTrailParticle(e.clientX, e.clientY);
        }
    });

    // Smooth cursor movement
    function animateCursor() {
        // Ease cursor to mouse position
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;

        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Click effect
    document.addEventListener('mousedown', () => {
        cursor.classList.add('clicking');
        createClickBurst(mouseX, mouseY);
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('clicking');
    });
}

function createTrailParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'cursor-trail';

    // Random color from palette (weighted towards green)
    const colors = ['var(--green)', 'var(--green)', 'var(--blue)', 'var(--magenta)'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    particle.style.background = color;

    // Smaller random offset for tighter trail
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;

    // Random size variation
    const size = 6 + Math.random() * 4; // 6-10px
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';

    particle.style.left = (x + offsetX) + 'px';
    particle.style.top = (y + offsetY) + 'px';

    document.body.appendChild(particle);

    // Remove after animation
    setTimeout(() => particle.remove(), 1200);
}

function createClickBurst(x, y) {
    const burstCount = 8;
    for (let i = 0; i < burstCount; i++) {
        const angle = (Math.PI * 2 * i) / burstCount;
        const distance = 30;

        const particle = document.createElement('div');
        particle.className = 'cursor-trail';
        particle.style.background = 'var(--magenta)';
        particle.style.width = '6px';
        particle.style.height = '6px';

        const targetX = x + Math.cos(angle) * distance;
        const targetY = y + Math.sin(angle) * distance;

        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        document.body.appendChild(particle);

        // Animate outward
        setTimeout(() => {
            particle.style.transition = 'all 0.6s ease-out';
            particle.style.left = targetX + 'px';
            particle.style.top = targetY + 'px';
            particle.style.opacity = '0';
        }, 10);

        setTimeout(() => particle.remove(), 600);
    }
}

// ===== SCROLL ANIMATIONS (Track 4) =====
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    // Observe all level sections
    document.querySelectorAll('.level').forEach(section => {
        observer.observe(section);
    });
}

// ===== PROCESS CHARACTER SPRITE - REMOVE BACKGROUND =====
function processCharacterSprite() {
    const character = document.getElementById('character');
    if (!character) return;

    const img = new Image();
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Remove light background pixels (make them transparent)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // If pixel is light gray/white (threshold 220), make it transparent
            if (r > 220 && g > 220 && b > 220) {
                data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
        }

        // Put modified image data back
        ctx.putImageData(imageData, 0, 0);

        // Use canvas as background image
        character.style.backgroundImage = `url(${canvas.toDataURL()})`;
    };
    img.src = '/img/characterSpriteSheet.jpg';
}

// ===== COIN COLLECTION SYSTEM =====
const coinSystem = {
    coins: [],
    collected: false,

    init() {
        const coinElements = document.querySelectorAll('.collectible-coin');
        const gameWorld = document.getElementById('gameWorld');

        this.coins = Array.from(coinElements).map(el => {
            const rect = el.getBoundingClientRect();
            const worldRect = gameWorld.getBoundingClientRect();
            const left = rect.left - worldRect.left;
            const bottom = el.style.bottom ? parseFloat(el.style.bottom) : 0;

            return {
                element: el,
                x: left,
                y: bottom,
                width: 60,
                height: 60,
                collected: false
            };
        });

        console.log('Coins initialized:', this.coins.length);
    },

    checkCollision(charX, charY, charWidth, charHeight) {
        if (this.collected) return false;

        for (let coin of this.coins) {
            if (coin.collected) continue;

            // Check if character overlaps with coin
            const horizontalOverlap = charX + charWidth > coin.x &&
                                     charX < coin.x + coin.width;
            const verticalOverlap = charY + charHeight > coin.y &&
                                   charY < coin.y + coin.height;

            if (horizontalOverlap && verticalOverlap) {
                this.collectCoin(coin);
                return true;
            }
        }
        return false;
    },

    collectCoin(coin) {
        coin.collected = true;
        this.collected = true;

        // Add collection animation
        coin.element.style.transition = 'all 0.5s ease-out';
        coin.element.style.transform = 'scale(2) translateY(-50px)';
        coin.element.style.opacity = '0';

        // Remove coin after animation
        setTimeout(() => {
            coin.element.remove();
        }, 500);

        // Remove platforms in this zone
        setTimeout(() => {
            const zonePlatforms = document.querySelectorAll('.zone-platform[data-zone="2"]');
            zonePlatforms.forEach(platform => {
                platform.style.transition = 'opacity 0.5s ease-out';
                platform.style.opacity = '0';
                setTimeout(() => {
                    platform.remove();
                    // Reinitialize platform system after removal
                    platformSystem.init();
                }, 500);
            });
        }, 600);

        // Show zone content
        setTimeout(() => {
            const hiddenElements = document.querySelectorAll('.sidequest-zone .zone-hidden');
            hiddenElements.forEach(el => {
                el.style.transition = 'opacity 1s ease-in';
                el.classList.remove('zone-hidden');
                el.style.opacity = '1';
            });

            // Hide hint
            const hint = document.querySelector('.coin-hint');
            if (hint) {
                hint.style.transition = 'opacity 0.5s ease-out';
                hint.style.opacity = '0';
                setTimeout(() => hint.remove(), 500);
            }
        }, 1200);

        console.log('💰 Coin collected! Side quest unlocked!');
    }
};

// ===== PROJECT BLOCKS SYSTEM =====
const blockSystem = {
    blocks: [],

    init() {
        const blockElements = document.querySelectorAll('.project-block');
        const gameWorld = document.getElementById('gameWorld');

        this.blocks = Array.from(blockElements).map(el => {
            const rect = el.getBoundingClientRect();
            const worldRect = gameWorld.getBoundingClientRect();
            const left = rect.left - worldRect.left;
            const bottom = el.style.bottom ? parseFloat(el.style.bottom) : 0;

            return {
                element: el,
                x: left,
                y: bottom,
                width: 80,
                height: 80,
                hit: false,
                info: el.querySelector('.block-info')
            };
        });

        console.log('Project blocks initialized:', this.blocks.length);
    },

    checkHeadCollision(charX, charY, charWidth, charHeight, velocityY) {
        // Check if character is jumping up (velocityY > 0) and hits block from below
        for (let block of this.blocks) {
            const charTop = charY + charHeight;
            const blockBottom = block.y;
            const blockTop = block.y + block.height;

            // Check horizontal overlap
            const horizontalOverlap = charX + charWidth > block.x &&
                                     charX < block.x + block.width;

            // Check if character's head is hitting block from below
            const hitFromBelow = charTop >= blockBottom &&
                                charTop <= blockTop &&
                                velocityY > 0;

            // Allow multiple hits - removed !block.hit check
            if (horizontalOverlap && hitFromBelow) {
                this.hitBlock(block);
                return true;
            }
        }
        return false;
    },

    hitBlock(block) {
        // Trigger bounce animation
        block.element.classList.remove('hit');
        setTimeout(() => block.element.classList.add('hit'), 10);
        setTimeout(() => block.element.classList.remove('hit'), 500);

        // Get project data from block
        const title = block.element.dataset.title;
        const subtitle = block.element.dataset.subtitle;
        const description = block.element.dataset.description;
        const mediaId = block.element.dataset.media;

        // Update zone content
        const titleEl = document.getElementById('projectTitle');
        const subtitleEl = document.getElementById('projectSubtitle');
        const descriptionEl = document.getElementById('projectDescription');
        const imageContainer = document.getElementById('projectImage');

        if (titleEl) titleEl.textContent = title;
        if (subtitleEl) subtitleEl.textContent = subtitle;
        if (descriptionEl) descriptionEl.textContent = description;

        // Update media display
        if (imageContainer && mediaId) {
            // Hide all media first
            document.querySelectorAll('.project-media').forEach(media => {
                media.style.display = 'none';
            });

            // Clear container and show selected media
            imageContainer.innerHTML = '';
            const mediaElement = document.getElementById(mediaId);
            if (mediaElement) {
                const clone = mediaElement.cloneNode(true);
                clone.style.display = 'block';
                clone.style.width = '100%';
                clone.style.height = '100%';
                clone.style.objectFit = 'cover';
                clone.style.borderRadius = '8px';

                // If it's a video, lazy load then play it
                if (clone.tagName === 'VIDEO') {
                    lazyLoadVideo(mediaElement).then(() => {
                        clone.play().catch(e => console.log('Video play failed:', e));
                    });
                }

                imageContainer.appendChild(clone);
            }
        }
    }
};

// ===== PLATFORM SYSTEM =====
const platformSystem = {
    platforms: [],

    init() {
        // Get all platform elements
        const platformElements = document.querySelectorAll('.platform');
        const gameWorld = document.getElementById('gameWorld');

        this.platforms = Array.from(platformElements).map(el => {
            // Get computed style to read CSS-defined positions
            const computedStyle = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const worldRect = gameWorld.getBoundingClientRect();

            // Calculate position in world coordinates
            const left = rect.left - worldRect.left;
            const bottom = el.style.bottom ? parseFloat(el.style.bottom) : 0;

            return {
                element: el,
                x: left,
                width: rect.width,
                height: 20,
                bottom: bottom
            };
        });

        console.log('Platforms initialized:', this.platforms.length);
    },

    checkCollision(charX, charY, charWidth, charHeight, velocityY) {
        // charY is in "bottom" coordinates (pixels from bottom of screen)
        // Platform bottom values are also in "bottom" coordinates
        for (let platform of this.platforms) {
            const platformTop = platform.bottom + 20; // Top surface of platform (bottom + height)

            // Check horizontal overlap
            const horizontalOverlap = charX + charWidth > platform.x &&
                                     charX < platform.x + platform.width;

            // Check if character is at platform level (within landing range)
            const atPlatformLevel = charY <= platformTop + 15 && charY >= platformTop - 5;

            if (horizontalOverlap && atPlatformLevel && velocityY <= 0) {
                return platformTop; // Return platform surface Y position
            }
        }
        return null;
    }
};

// ===== CHARACTER MOVEMENT =====
const characterController = {
    element: null,
    gameWorld: null,
    position: 200, // Position in world coordinates (pixels)
    isMovingLeft: false,
    isMovingRight: false,
    speed: 5,
    minX: 0,
    maxX: 0, // Will be calculated based on viewport width

    // Jump properties
    groundY: 20, // Default ground
    positionY: 20,
    velocityY: 0,
    isJumping: false,
    isFalling: false,
    jumpPower: 15,
    gravity: -0.6,
    charWidth: 72,
    charHeight: 84,

    init() {
        this.element = document.getElementById('character');
        this.gameWorld = document.getElementById('gameWorld');
        if (!this.element || !this.gameWorld) return;

        // Calculate world bounds (4 zones × viewport width)
        this.maxX = (window.innerWidth * 4) - 100;

        // Start position (center of first zone)
        this.position = window.innerWidth / 2;
        this.positionY = 20;
        this.updatePosition();
        this.updateCamera();

        // Update bounds on resize
        window.addEventListener('resize', () => {
            this.maxX = (window.innerWidth * 4) - 100;
        });
    },

    startMoving(direction) {
        if (direction === 'left') {
            this.isMovingLeft = true;
            this.element.classList.remove('walking-right');
            this.element.classList.add('walking-left');
        } else if (direction === 'right') {
            this.isMovingRight = true;
            this.element.classList.remove('walking-left');
            this.element.classList.add('walking-right');
        }
    },

    stopMoving(direction) {
        if (direction === 'left') {
            this.isMovingLeft = false;
            if (!this.isMovingRight) {
                this.element.classList.remove('walking-left');
            }
        } else if (direction === 'right') {
            this.isMovingRight = false;
            if (!this.isMovingLeft) {
                this.element.classList.remove('walking-right');
            }
        }
    },

    jump() {
        if (!this.isJumping && !this.isFalling) {
            this.isJumping = true;
            this.velocityY = this.jumpPower;
            this.element.classList.add('jumping');
            this.element.classList.remove('walking-left', 'walking-right');
        }
    },

    update() {
        // Horizontal movement
        if (this.isMovingLeft) {
            this.position -= this.speed;
            if (this.position < this.minX) {
                this.position = this.minX;
            }
        }
        if (this.isMovingRight) {
            this.position += this.speed;
            if (this.position > this.maxX) {
                this.position = this.maxX;
            }
        }

        // Vertical movement (jump/gravity physics)
        this.velocityY += this.gravity;
        this.positionY += this.velocityY;

        // Check coin collision
        coinSystem.checkCollision(
            this.position,
            this.positionY,
            this.charWidth,
            this.charHeight
        );

        // Check block collision (head bump)
        blockSystem.checkHeadCollision(
            this.position,
            this.positionY,
            this.charWidth,
            this.charHeight,
            this.velocityY
        );

        // Check platform collision
        const platformY = platformSystem.checkCollision(
            this.position,
            this.positionY,
            this.charWidth,
            this.charHeight,
            this.velocityY
        );

        if (platformY !== null && this.velocityY <= 0) {
            // Land on platform
            this.positionY = platformY;
            this.velocityY = 0;
            this.isJumping = false;
            this.isFalling = false;
            this.element.classList.remove('jumping');
        } else if (platformY === null && !this.isJumping) {
            // Start falling if not on platform
            this.isFalling = true;
            this.element.classList.add('jumping');
        }

        // Ground check (minimum height)
        if (this.positionY <= this.groundY) {
            this.positionY = this.groundY;
            this.velocityY = 0;
            this.isJumping = false;
            this.isFalling = false;
            this.element.classList.remove('jumping');
        }

        this.updatePosition();
        this.updateCamera();
    },

    updatePosition() {
        if (!this.element) return;
        this.element.style.left = this.position + 'px';
        this.element.style.bottom = this.positionY + 'px';
        this.element.style.transform = this.isMovingLeft ? 'scaleX(-1)' : 'scaleX(1)';
    },

    updateCamera() {
        if (!this.gameWorld) return;

        // Camera follows character (keep character in center-ish area)
        const viewportCenter = window.innerWidth / 2;
        const targetScroll = this.position - viewportCenter + (this.charWidth / 2);

        // Clamp camera to world bounds (4 viewports total)
        const maxScroll = (window.innerWidth * 4) - window.innerWidth;
        const scroll = Math.max(0, Math.min(targetScroll, maxScroll));

        this.gameWorld.style.transform = `translateX(-${scroll}px)`;
    }
};

function setupZoneSkipButtons() {
    const skipButtons = document.querySelectorAll('.zone-skip-btn');

    skipButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetZone = parseInt(button.dataset.targetZone);
            skipToZone(targetZone);
        });
    });
}

function skipToZone(zoneIndex) {
    // Calculate target position (center of target zone + some offset)
    const viewportWidth = window.innerWidth;
    const targetPosition = (viewportWidth * zoneIndex) + (viewportWidth / 2);

    // Disable controls during transition
    const wasMovingLeft = characterController.isMovingLeft;
    const wasMovingRight = characterController.isMovingRight;
    characterController.isMovingLeft = false;
    characterController.isMovingRight = false;

    // Animate character position
    const startPosition = characterController.position;
    const distance = targetPosition - startPosition;
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();

    function animateSkip() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-in-out)
        const easeProgress = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Update character position
        characterController.position = startPosition + (distance * easeProgress);
        characterController.positionY = characterController.groundY; // Keep on ground
        characterController.updatePosition();
        characterController.updateCamera();

        if (progress < 1) {
            requestAnimationFrame(animateSkip);
        } else {
            // Re-enable controls if they were active
            if (wasMovingLeft) characterController.isMovingLeft = true;
            if (wasMovingRight) characterController.isMovingRight = true;
        }
    }

    animateSkip();
    console.log(`🚀 Skipping to Zone ${zoneIndex}`);
}

function setupCharacterControls() {
    // Initialize game systems
    platformSystem.init();
    blockSystem.init();
    coinSystem.init();

    // Then initialize character
    characterController.init();

    // Setup zone skip buttons
    setupZoneSkipButtons();

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            characterController.startMoving('left');
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            characterController.startMoving('right');
        } else if (e.key === 'ArrowUp' || e.key === ' ') {
            e.preventDefault();
            characterController.jump();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') {
            characterController.stopMoving('left');
        } else if (e.key === 'ArrowRight') {
            characterController.stopMoving('right');
        }
    });

    // Animation loop
    function animate() {
        characterController.update();
        requestAnimationFrame(animate);
    }
    animate();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Tron Arcade Website V2 - Initialized');
    console.log('💡 Easter Egg Hint: Try the Konami Code...');
    console.log('🎮 Controls: Arrow keys to move, Space/Up Arrow to jump!');

    // Initialize features
    setupEasterEggClose();
    createFloatingStars();
    setupCustomCursor();
    processCharacterSprite(); // Remove background from sprite sheet
    processSamusSprites(); // Remove background from Samus sprites
    setupCharacterControls();
    setupVideoIntersectionObserver(); // Lazy load videos

    // Listen for secret code
    document.addEventListener('keydown', (e) => {
        checkSecretCode(e.key);
    });
});
