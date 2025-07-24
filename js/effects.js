document.addEventListener('DOMContentLoaded', () => {
    // --- ACCESSIBILITY CHECK ---
    // If the user prefers reduced motion, we do nothing.
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
        console.log('Reduced motion enabled. All background effects disabled.');
        return;
    }

    // --- SCROLLING RED HALO EFFECT ---
    const body = document.body;
    window.addEventListener('scroll', () => {
        // Update the --scroll-y CSS variable with the current scroll position.
        // The CSS uses this to move the red halo.
        body.style.setProperty('--scroll-y', window.scrollY);
    }, { passive: true });


    // --- MATRIX CANVAS EFFECT ---
    const canvas = document.getElementById('matrix-canvas');
    if (!canvas) return; // Exit if canvas isn't on the page

    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Characters to draw
    const chars = '01';
    const charArray = chars.split('');
    const fontSize = 10;
    const columns = Math.floor(width / fontSize);

    // Create an array for the rain drops, one for each column
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.floor(Math.random() * height / fontSize);
    }

    // Mouse position and hover state
    const mouse = {
        x: width / 2,
        y: height / 2,
        radius: 80, // Initial radius of the spotlight
        isHovering: false
    };

    // Track mouse movement
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Track when mouse enters/leaves interactive elements to brighten the spotlight
    const interactiveElements = document.querySelectorAll('a, button');
    interactiveElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => mouse.isHovering = true);
        elem.addEventListener('mouseleave', () => mouse.isHovering = false);
    });

    // Animation loop
    function draw() {
        // The semi-transparent background creates the fading trail effect
        ctx.fillStyle = 'rgba(13, 13, 13, 0.07)';
        ctx.fillRect(0, 0, width, height);

        // Loop through each column of drops
        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            const x = i * fontSize;
            const y = drops[i] * fontSize;

            // Calculate distance from the mouse
            const dx = x - mouse.x;
            const dy = y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Determine spotlight radius (larger when hovering a button)
            const spotlightRadius = mouse.isHovering ? mouse.radius * 2.5 : mouse.radius;

            // Calculate opacity based on distance from mouse
            let opacity = 1 - (distance / spotlightRadius);
            opacity = Math.max(0, Math.min(1, opacity)); // Clamp between 0 and 1

            if (opacity > 0) {
                // Draw the character with calculated opacity
                ctx.fillStyle = `rgba(74, 144, 226, ${opacity * 0.8})`; // Blueish text
                ctx.font = `${fontSize}px monospace`;
                ctx.fillText(text, x, y);
            }

            // Move the drop down and reset if it goes off-screen
            if (y > height && Math.random() > 0.975) {
                drops[i] = 0; // Reset to the top
            }
            drops[i]++;
        }
    }

    // Handle window resizing
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        // Recalculate columns, but don't reset drops to avoid a jarring flash
        const newColumns = Math.floor(width / fontSize);
        drops.length = newColumns;
        for (let i = 0; i < newColumns; i++) {
            if (!drops[i]) {
                drops[i] = Math.floor(Math.random() * height / fontSize);
            }
        }
    });

    // Start the animation
    setInterval(draw, 50); // Adjust interval for performance vs. speed
});
