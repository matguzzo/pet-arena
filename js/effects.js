document.addEventListener('DOMContentLoaded', () => {
    // --- ACCESSIBILITY CHECK ---
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
        document.querySelector('.background-container')?.remove();
        return;
    }

    // --- SCROLLING HALO EFFECT ---
    const body = document.body;
    window.addEventListener('scroll', () => {
        body.style.setProperty('--scroll-y', window.scrollY);
    }, { passive: true });

    // --- "IMPERCEPTIBLE GRID" ENGINE ---
    const canvas = document.getElementById('reveal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // --- Core Settings ---
    const gridSize = 25;
    const creationInterval = 1500;
    const particleOpacity = 0.5;

    let particles = [];
    const occupiedCells = new Set();

    const tiktokBlue = getComputedStyle(document.documentElement).getPropertyValue('--tiktok-blue').trim();
    const tiktokBlueRGB = `${parseInt(tiktokBlue.slice(1,3),16)}, ${parseInt(tiktokBlue.slice(3,5),16)}, ${parseInt(tiktokBlue.slice(5,7),16)}`;

    let lastCreationTime = 0;

    // The Particle class now includes its own life span
    class Particle {
        constructor(x, y, gridKey) {
            this.x = x;
            this.y = y;
            this.gridKey = gridKey;
            this.char = Math.random() > 0.5 ? '1' : '0';
            this.life = 1.0; // Starts at full life
            this.fadeSpeed = 0.005; // How quickly it fades
        }
    }

    window.addEventListener('mousemove', (e) => {
        const currentTime = performance.now();
        if (currentTime - lastCreationTime < creationInterval) {
            return;
        }
        lastCreationTime = currentTime;

        const scatter = 200;
        const targetX = e.clientX + (Math.random() - 0.5) * scatter;
        const targetY = e.clientY + (Math.random() - 0.5) * scatter;

        const gridX = Math.floor(targetX / gridSize);
        const gridY = Math.floor(targetY / gridSize);
        const gridKey = `${gridX},${gridY}`;

        if (!occupiedCells.has(gridKey) && particles.length < 40) {
            occupiedCells.add(gridKey);
            const p = new Particle(gridX * gridSize + gridSize / 2, gridY * gridSize + gridSize / 2, gridKey);
            particles.push(p);
        }
    });

    // --- THE CORRECTED ANIMATION LOOP ---
    function animate() {
        // 1. CLEAR THE CANVAS: This makes the canvas transparent, letting the halos show through.
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. UPDATE AND DRAW PARTICLES
        ctx.font = `14px monospace`;
        ctx.textAlign = 'center';

        // Loop backwards for safe removal of items from the array
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= p.fadeSpeed; // Decrease the particle's life

            // If the particle has faded out, remove it
            if (p.life <= 0) {
                occupiedCells.delete(p.gridKey); // Free up the grid cell
                particles.splice(i, 1);
            } else {
                // Set the color with the particle's current life/opacity
                ctx.fillStyle = `rgba(${tiktokBlueRGB}, ${p.life * particleOpacity})`;
                ctx.fillText(p.char, p.x, p.y);
            }
        }

        requestAnimationFrame(animate);
    }

    function setup() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        occupiedCells.clear();
    }

    setup();
    animate();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setup, 100);
    });
});
