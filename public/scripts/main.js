/* ============================================
   TRON ARCADE WEBSITE - MAIN JAVASCRIPT
   Foundation Track - Basic Interactions
   ============================================ */

// ===== STAT BAR ANIMATIONS =====
function animateStatBars() {
    const statBars = document.querySelectorAll('.stat-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statValue = entry.target.dataset.stat;
                entry.target.style.width = statValue + '%';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statBars.forEach(bar => observer.observe(bar));
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

// ===== SMOOTH SCROLL FOR PRESS START =====
function setupPressStart() {
    const pressStart = document.querySelector('.press-start');
    if (pressStart) {
        pressStart.addEventListener('click', () => {
            document.getElementById('level-1').scrollIntoView({
                behavior: 'smooth'
            });
        });
    }
}

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

            // After animation completes, scroll to next section
            setTimeout(() => {
                document.getElementById('level-1').scrollIntoView({
                    behavior: 'smooth'
                });

                // Remove classes after scroll starts
                setTimeout(() => {
                    coinWrapper.classList.remove('inserting');
                    titleWrapper.classList.remove('rippling');
                }, 500);
            }, 1200); // Match coin drop duration
        });
    }
}

// ===== MINI GAME INIT =====
// Game initialization is handled in game.js

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

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 Tron Arcade Website Initialized');
    console.log('💡 Easter Egg Hint: Try the Konami Code...');

    // Initialize features
    animateStatBars();
    setupPressStart();
    setupCoinInsertion(); // Coin insertion interaction
    setupEasterEggClose();
    createFloatingStars();
    processSamusSprites();
    setupCustomCursor(); // Track 4
    setupScrollAnimations(); // Track 4
    initGame(); // Track 5 - Pixel Blaster

    // Listen for secret code
    document.addEventListener('keydown', (e) => {
        checkSecretCode(e.key);
    });
});
