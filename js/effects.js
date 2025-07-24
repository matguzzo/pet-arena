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

    // --- NEW "GENTLE REVEAL" ENGINE ---
    const canvas = document.getElementById('reveal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // This array will hold all the characters currently on screen
    let particles = [];
    const tiktokBlue = getComputedStyle(document.documentElement).getPropertyValue('--tiktok-blue').trim();

    // A simple class to manage each character's state
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.char = Math.random() > 0.5 ? '1' : '0';
            this.life = 1.0; // Starts at full life
            // The fade speed determines the lifetime. 1 / 1200 frames is approx 20 seconds.
            this.fadeSpeed = 1 / 1200;
        }

        draw() {
            // As life decreases, so does opacity
            ctx.fillStyle = `rgba(${parseInt(tiktokBlue.slice(1,3),16)}, ${parseInt(tiktokBlue.slice(3,5),16)}, ${parseInt(tiktokBlue.slice(5,7),16)}, ${this.life * 0.7})`;
            ctx.font = `14px monospace`;
            ctx.fillText(this.char, this.x, this.y);
        }

        update() {
            this.life -= this.fadeSpeed;
        }
    }

    // --- The Core Logic: Create particles on mouse move ---
    window.addEventListener('mousemove', (e) => {
        // This creates a scattered effect, NOT a perfect halo.
        // The numbers control how far from the cursor they can appear.
        const scatter = 1000;
        const x = e.clientX + (Math.random() - 0.5) * scatter;
        const y = e.clientY + window.scrollY + (Math.random() - 0.5) * scatter;

        // Add one new particle to our array
        particles.push(new Particle(x, y));
    });

    // --- The Animation Loop ---
    // Its only job is to draw the particles and make them fade.
    function animate() {
        // Clear the canvas for the next frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Loop through all particles backwards (safe for removal)
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.update();
            p.draw();

            // If a particle has faded completely, remove it from the array
            if (p.life <= 0) {
                particles.splice(i, 1);
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
    }

    setup();
    animate();

    // More reliable resize handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setup, 100);
    });
});
