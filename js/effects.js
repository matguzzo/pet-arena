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

    // --- FINAL "SPARSE TRACE" ENGINE ---
    const canvas = document.getElementById('reveal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    const tiktokBlue = getComputedStyle(document.documentElement).getPropertyValue('--tiktok-blue').trim();
    const tiktokBlueRGB = `${parseInt(tiktokBlue.slice(1,3),16)}, ${parseInt(tiktokBlue.slice(3,5),16)}, ${parseInt(tiktokBlue.slice(5,7),16)}`;

    // --- Throttle for particle creation ---
    let lastCreationTime = 0;
    const creationInterval = 50; // Only create a particle every 50ms max

    // --- Particle Class ---
    // The fade-out is now handled by the global animation loop,
    // so this class is just for storing data.
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.char = Math.random() > 0.5 ? '1' : '0';
        }
    }

    // --- The Core Logic ---
    window.addEventListener('mousemove', (e) => {
        const currentTime = performance.now();
        // 1. THROTTLE: Check


