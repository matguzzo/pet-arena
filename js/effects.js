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

    // --- "EPHEMERAL TRACES" ENGINE ---
    const canvas = document.getElementById('reveal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    const tiktokBlue = getComputedStyle(document.documentElement).getPropertyValue('--tiktok-blue').trim();
    const tiktokBlueRGB = `${parseInt(tiktokBlue.slice(1,3),16)}, ${parseInt(tiktokBlue.slice(3,5),16)}, ${parseInt(tiktokBlue.slice(5,7),16)}`;

    // A simple class to hold particle data. Fading is now handled globally.
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.char = Math.random() > 0.5 ? '1' : '0';
        }
    }

    // --- The Core Logic: Create scattered particles on mouse move ---
    window.addEventListener('mousemove', (e) => {
        // This creates a wide, scattered trail, NOT a ball.
        // The scatter value controls how far from the cursor they can appear.
        const scatter = 150; 
        const x = e.clientX + (Math.random() - 0.5) * scatter;
        const y = e.clientY + window.scrollY + (Math.random() - 0.5) * scatter;

        // Add one new particle to our array
        if (particles.length < 200) { // Cap particles to prevent performance issues
            particles.push(new Particle(x, y));
        }
    });

    // --- The Animation Loop ---
    function animate() {
        // --- THE BIG FIX IS HERE ---
        // 1. Do NOT use clearRect(). Instead, draw a semi-transparent black
        // rectangle over the whole canvas. This creates the fade-out effect
        // and completely prevents the "black mark" bug.
        ctx.fillStyle = 'rgba(1, 1, 1, 0.05)'; // The alpha value controls fade speed.
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Draw all the particles
        ctx.fillStyle = `rgba(${tiktokBlueRGB}, 0.7)`;
        ctx.font = `14px monospace`;

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            ctx.fillText(p.char, p.x, p.y);
        }

        // 3. To manage memory, randomly remove a few of the oldest particles
        // This happens slowly, creating the long fade effect.
        if (particles.length > 50) {
             particles.splice(0, 2); // Remove the 2 oldest particles
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
    }

    setup();
    animate();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setup, 100);
    });
});

