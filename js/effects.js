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

    // --- "DIGITAL DUST" ENGINE ---
    const canvas = document.getElementById('reveal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    const tiktokBlue = getComputedStyle(document.documentElement).getPropertyValue('--tiktok-blue').trim();

    // Mouse object now tracks position and speed
    const mouse = {
        x: 0,
        y: 0,
        lastX: 0,
        lastY: 0,
        speed: 0,
        lastTimestamp: 0
    };

    // A class to manage each particle's state
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.char = Math.random() > 0.5 ? '1' : '0';
            this.life = 1.0;
            // Lifetime is now randomized for a more organic feel
            this.fadeSpeed = 1 / (Math.random() * 800 + 800); // Fades over 13-26 seconds
        }

        draw() {
            ctx.fillStyle = `rgba(${parseInt(tiktokBlue.slice(1,3),16)}, ${parseInt(tiktokBlue.slice(3,5),16)}, ${parseInt(tiktokBlue.slice(5,7),16)}, ${this.life * 0.7})`;
            ctx.font = `14px monospace`;
            ctx.fillText(this.char, this.x, this.y);
        }

        update() {
            this.life -= this.fadeSpeed;
        }
    }

    // This listener only UPDATES the mouse speed. It does not create particles.
    window.addEventListener('mousemove', (e) => {
        const timestamp = performance.now();
        if (mouse.lastTimestamp > 0) {
            const dx = e.clientX - mouse.lastX;
            const dy = e.clientY - mouse.lastY;
            const dt = timestamp - mouse.lastTimestamp;
            const distance = Math.sqrt(dx * dx + dy * dy);
            // Speed is pixels per millisecond
            mouse.speed = distance / dt;
        }
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
        mouse.lastTimestamp = timestamp;
    });

    // --- The Animation Loop ---
    function animate() {
        // Clear the canvas for the next frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- Particle Creation ---
        // 1. A tiny, constant "ambient" particle creation rate
        const ambientRate = 0.1;
        // 2. A rate based on mouse speed
        const speedRate = mouse.speed * 2;
        // 3. Combine them and add randomness
        const particlesToCreate = Math.floor(ambientRate + speedRate + Math.random());
        
        for (let i = 0; i < particlesToCreate; i++) {
            // Spawn particles at a RANDOM position on the canvas
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            particles.push(new Particle(x, y));
        }
        
        // --- Particle Updating and Drawing ---
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }

        // --- Speed Decay ---
        // Slowly reduce the mouse speed over time so the effect calms down
        mouse.speed *= 0.95;

        requestAnimationFrame(animate);
    }

    // --- Setup and Resize Logic ---
    function setup() {
        const docHeight = document.documentElement.scrollHeight;
        const docWidth = document.documentElement.clientWidth;
        canvas.parentElement.style.height = `${docHeight}px`;
        canvas.width = docWidth;
        canvas.height = docHeight;
    }

    setup();
    animate();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setup, 100);
    });
});
