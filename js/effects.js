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

    // --- MATRIX CANVAS EFFECT ---
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const chars = '01';
    const fontSize = 14;
    const columns = Math.ceil(width / fontSize);
    const drops = Array(columns).fill(1);

    const mouse = {
        x: -9999, // Start off-screen
        y: -9999,
        radius: 120, // The radius of the main spotlight
        isHovering: false
    };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    const interactiveElements = document.querySelectorAll('a, button');
    interactiveElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => mouse.isHovering = true);
        elem.addEventListener('mouseleave', () => mouse.isHovering = false);
    });

    function draw() {
        // A slightly more persistent trail effect
        ctx.fillStyle = 'rgba(1, 1, 1, 0.1)';
        ctx.fillRect(0, 0, width, height);

        const spotlightRadius = mouse.isHovering ? mouse.radius * 2.0 : mouse.radius;
        const tiktokBlue = getComputedStyle(document.documentElement).getPropertyValue('--tiktok-blue').trim();

        for (let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Only draw characters that are inside the spotlight radius
            if (distance < spotlightRadius) {
                // Calculate opacity: full at center, fading to zero at the edge
                const opacity = Math.max(0, 1 - (distance / spotlightRadius));
                
                ctx.fillStyle = `rgba(${parseInt(tiktokBlue.slice(1,3),16)}, ${parseInt(tiktokBlue.slice(3,5),16)}, ${parseInt(tiktokBlue.slice(5,7),16)}, ${opacity * 0.9})`;
                ctx.font = `${fontSize}px monospace`;
                ctx.fillText(text, x, y);
            }

            if (y > height && Math.random() > 0.985) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        const newColumns = Math.ceil(width / fontSize);
        drops.length = newColumns;
        for(let i=0; i<newColumns; i++) {
            if(!drops[i]) drops[i] = 1;
        }
    });

    // Use requestAnimationFrame for smoother animations
    let lastTime = 0;
    const frameRate = 1000 / 20; // 20 frames per second

    function animate(timestamp) {
        if (timestamp - lastTime > frameRate) {
            draw();
            lastTime = timestamp;
        }
        requestAnimationFrame(animate);
    }
    
    animate(0);
});

