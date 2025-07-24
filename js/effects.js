document.addEventListener('DOMContentLoaded', () => {
    // --- ACCESSIBILITY CHECK ---
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
        document.querySelector('.background-effects')?.remove();
        return;
    }

    // --- SCROLLING HALO EFFECT ---
    const body = document.body;
    window.addEventListener('scroll', () => {
        body.style.setProperty('--scroll-y', window.scrollY);
    }, { passive: true });

    // --- GENTLE PARTICLE EFFECT ---
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Particle settings
    let particles = [];
    const chars = '01';
    const fontSize = 14;
    const tiktokBlue = getComputedStyle(document.documentElement).getPropertyValue('--tiktok-blue').trim();

    const mouse = {
        x: -9999,
        y: -9999,
        radius: 150 // The area around the mouse where particles will spawn
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // A class to define each particle
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.char = chars.charAt(Math.floor(Math.random() * chars.length));
            this.life = 1; // Represents full life (100%)
            this.fadeSpeed = Math.random() * 0.02 + 0.005; // How fast it fades
        }

        draw() {
            // As life decreases, opacity decreases
            ctx.fillStyle = `rgba(${parseInt(tiktokBlue.slice(1,3),16)}, ${parseInt(tiktokBlue.slice(3,5),16)}, ${parseInt(tiktokBlue.slice(5,7),16)}, ${this.life * 0.8})`;
            ctx.font = `${fontSize}px monospace`;
            ctx.fillText(this.char, this.x, this.y);
        }

        update() {
            this.life -= this.fadeSpeed;
        }
    }

    function handleParticles() {
        // Clear the canvas for the new frame
        ctx.clearRect(0, 0, width, height);

        // Add 1-2 new particles per frame near the mouse
        for (let i = 0; i < 2; i++) {
            // Spawn in a random spot within the mouse radius
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * mouse.radius;
            const x = mouse.x + Math.cos(angle) * radius;
            const y = mouse.y + Math.sin(angle) * radius;
            particles.push(new Particle(x, y));
        }

        // Update and draw all particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();

            // Remove particles that have faded out
            if (particles[i].life < 0) {
                particles.splice(i, 1);
            }
        }
    }

    // Animation loop using requestAnimationFrame for smoothness
    function animate() {
        handleParticles();
        requestAnimationFrame(animate);
    }
    animate();

    // Handle window resizing
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = []; // Clear particles on resize to avoid weird placement
    });
});


