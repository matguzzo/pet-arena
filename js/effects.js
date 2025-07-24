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

    // --- Core Settings for Subtlety ---
    const gridSize = 25;
    const creationInterval = 1500;
    const particleOpacity = 0.5;
    const fadeFactor = 0.015;

    let particles = [];
    const occupiedCells = new Set();

    const tiktokBlue = getComputedStyle(document.documentElement).getPropertyValue('--tiktok-blue').trim();
    const tiktokBlueRGB = `${parseInt(tiktokBlue.slice(1,3),16)}, ${parseInt(tiktokBlue.slice(3,5),16)}, ${parseInt(tiktokBlue.slice(5,7),16)}`;

    let lastCreationTime = 0;

    class Particle {
        constructor(x, y, gridKey) {
            this.x = x;
            this.y = y;
            this.gridKey = gridKey;
            this.char = Math.random() > 0.5 ? '1' : '0';
        }
    }

    window.addEventListener('mousemove', (e) => {
        const currentTime = performance.now();
        if (currentTime - lastCreationTime < creationInterval) {
            return;
        }
        lastCreationTime = currentTime;

        const scatter = 200;
        // --- FIX #1: Mouse position calculation ---
        // The canvas is now fixed, so we no longer need to add window.scrollY
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

    function animate() {
        ctx.fillStyle = `rgba(1, 1, 1, ${fadeFactor})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = `rgba(${tiktokBlueRGB}, ${particleOpacity})`;
        ctx.font = `14px monospace`;
        ctx.textAlign = 'center';

        for (const p of particles) {
            ctx.fillText(p.char, p.x, p.y);
        }

        if (particles.length > 0) {
            if (Math.random() < 0.01) {
                const removedParticle = particles.shift();
                if (removedParticle) {
                    occupiedCells.delete(removedParticle.gridKey);
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // --- FIX #2: Simplified setup function for a fixed canvas ---
    function setup() {
        // The canvas just needs to fill the viewport now.
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        occupiedCells.clear();
    }

    setup();
    animate();

    // The resize listener will now call the simplified setup function
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setup, 100);
    });
});
