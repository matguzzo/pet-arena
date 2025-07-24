document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Effects script loaded.');

    // --- ACCESSIBILITY CHECK ---
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
        console.log('❌ Reduced Motion is enabled. All effects disabled.');
        document.querySelector('.fixed-background')?.remove();
        document.querySelector('.scrolling-background')?.remove();
        return;
    }

    // --- SCROLLING HALO EFFECT ---
    const body = document.body;
    window.addEventListener('scroll', () => {
        body.style.setProperty('--scroll-y', window.scrollY);
    }, { passive: true });
    console.log('✅ Halo scroll effect active.');

    // --- REVEAL CANVAS ENGINE ---
    const canvas = document.getElementById('reveal-canvas');
    if (!canvas) {
        console.error('❌ ERROR: Canvas with ID "reveal-canvas" not found!');
        return;
    }
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Optimization for frequent reads
    console.log('✅ Reveal canvas initialized.');

    const artCanvas = document.createElement('canvas');
    const artCtx = artCanvas.getContext('2d');

    const logoSVG = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9ImN1cnJlbnRDb2xvciIgZD0iTTEzLjgzNCA1LjY3OEE1LjY3OSA1LjY3OSAwIDAgMCA4LjE1NiAwSDguMTQ3djE0LjYyNGE1LjY3OSA1LjY3OSAwIDEgMS01LjY3OS01LjY3OWg1LjY3Wm0wIDguOTQ4YTUuNjc5IDUuNjc5IDAgMSAwIDUuNjc4LTUuNjc5YTUuNjg1IDUuNjg1IDAgMCAwLTUuNjc4IDUuNjc5WiIvPjwvc3ZnPg==`;
    const logoImg = new Image();
    logoImg.src = logoSVG;

    const mouse = { x: -9999, y: -9999, radius: 150 };
    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY + window.scrollY;
    });

    function drawArt() {
        const width = artCanvas.width;
        const height = artCanvas.height;
        artCtx.clearRect(0, 0, width, height);
        artCtx.fillStyle = 'rgba(255, 255, 255, 0.04)';

        // Draw Logo
        const logoSize = Math.min(width, height) * 0.8;
        artCtx.globalAlpha = 0.03;
        artCtx.drawImage(logoImg, (width - logoSize) / 2, height * 0.2, logoSize, logoSize);
        artCtx.globalAlpha = 1.0;

        // Draw Binary Grid
        const fontSize = 12;
        artCtx.font = `${fontSize}px monospace`;
        for (let y = 0; y < height; y += fontSize * 2) {
            for (let x = 0; x < width; x += fontSize * 2) {
                artCtx.fillText(Math.random() > 0.5 ? '1' : '0', x, y);
            }
        }
        console.log('✅ Hidden art pre-drawn.');
    }

    function animate() {
        ctx.fillStyle = 'rgba(1, 1, 1, 0.005)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(artCanvas, 0, 0);
        ctx.restore();
        requestAnimationFrame(animate);
    }

    function setup() {
        const docHeight = document.documentElement.scrollHeight;
        const docWidth = document.documentElement.clientWidth;
        canvas.parentElement.style.height = `${docHeight}px`;
        canvas.width = artCanvas.width = docWidth;
        canvas.height = artCanvas.height = docHeight;
        drawArt();
        console.log(`✅ Canvas resized to ${docWidth}x${docHeight}`);
    }

    logoImg.onload = () => {
        console.log('✅ Logo image loaded successfully.');
        setup();
        animate();
        console.log('✅ Animation started.');
    };
    logoImg.onerror = () => {
        console.error('❌ ERROR: The logo image failed to load.');
    };

    // More reliable resize handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setup, 100);
    });
});



