document.addEventListener('DOMContentLoaded', () => {
    // --- ACCESSIBILITY CHECK ---
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
        document.querySelector('.fixed-background')?.remove();
        document.querySelector('.scrolling-background')?.remove();
        return;
    }

    // --- SCROLLING HALO EFFECT ---
    const body = document.body;
    window.addEventListener('scroll', () => {
        body.style.setProperty('--scroll-y', window.scrollY);
    }, { passive: true });

    // --- FINAL "IMPERCEPTIBLE GRID" ENGINE ---
    const canvas = document.getElementById('reveal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // --- Core Settings for Subtlety ---
    const gridSize = 25; // Size of each grid cell. Guarantees no overlaps.
    const creationInterval = 200; // Create a character every 200ms max (very slow).
    const particleOpacity = 0.5; // Very faint characters.
    const fadeFactor = 0.015; // Slower fade-out.

    let particles = [];
    const occupiedCells = new Set(); // The grid tracking system.

    const tiktokBlue = getComputedStyle(document.documentElement).getPropertyValue('--tiktok-blue').trim();
    const tiktokBlueRGB = `${parseInt(tiktokBlue.slice(1,3),16)}, ${parseInt(tiktokBlue.slice(3,5),16)}, ${parseInt(tiktokBlue.slice(5,7),16)}`;

    let lastCreationTime = 0;

    // --- Particle Class ---
    class Particle {
        constructor(x, y, gridKey) {
            this.x = x;
            this.y = y;
            this.gridKey = gridKey; // Store which grid cell it occupies.
            this.char = Math.random() > 0.5 ? '1' : '0';
        }
    }

    // --- The Core Logic ---
    window.addEventListener('mousemove', (e) => {
        const currentTime = performance.now();
        if (currentTime - lastCreationTime < creationInterval) {
            return; // Throttle is active.
        }
        lastCreationTime = currentTime;

        const scatter = 200; // Scatter them widely.
        const targetX = e.clientX + (Math.random() - 0.5) * scatter;
        const targetY = e.clientY + window.scrollY + (Math.random() - 0.5) * scatter;

        // Find the center of the grid cell for perfect alignment.
        const gridX = Math.floor(targetX / gridSize);
        const gridY = Math.floor(targetY / gridSize);
        const gridKey = `${gridX},${gridY}`;

        // COLLISION CHECK: The most important part.
        if (!occupiedCells.has(gridKey)) {
            // Mark the cell as occupied.
            occupiedCells.add(gridKey);

            // Create the particle at the center of the free cell.
            const p = new Particle(gridX * gridSize + gridSize / 2, gridY * gridSize + gridSize / 2, gridKey);
            particles.push(p);
        }
    });

    // --- The Animation Loop ---
    function animate() {
        // 1. GLOBAL FADE: Use the semi-transparent rectangle for a smooth fade.
        ctx.fillStyle = `rgba(1, 1, 1, ${fadeFactor})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. DRAW PARTICLES: Draw all active particles.
        ctx.fillStyle = `rgba(${tiktokBlueRGB}, ${particleOpacity})`;
        ctx.font = `14px monospace`;
        ctx.textAlign = 'center'; // Center the character in its grid cell.

        for (const p of particles) {
            ctx.fillText(p.char, p.x, p.y);
        }

        // 3. CLEANUP: Slowly remove the oldest particles.
        if (particles.length > 0) {
            // The chance of removing a particle. Lower number = longer life.
            if (Math.random() < 0.005) {
                const removedParticle = particles.shift(); // Remove the oldest particle.
                if (removedParticle) {
                    // IMPORTANT: Free up its grid cell for a new particle.
                    occupiedCells.delete(removedParticle.gridKey);
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // --- Setup and Resize Logic ---
    function setup() {
        const docHeight = document.documentElement.scrollHeight;
        const docWidth = document.documentElement.clientWidth;
        canvas.parentElement.style.height = `${docHeight}px`;
        canvas.width = docWidth;
        canvas.height = docHeight;
        // Clear everything on resize.
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
