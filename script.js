// DOM Elements
const cursor = document.querySelector('.cursor');
const loadingScreen = document.querySelector('.loading-screen');
const introSection = document.getElementById('intro');
const mainSection = document.getElementById('main');
const gameSection = document.getElementById('game');
const cakeSection = document.getElementById('cake');
const startButton = document.querySelector('.start-button');
const playGameBtn = document.querySelector('.play-game-btn');
const gameContainer = document.querySelector('.game-container');
const musicToggle = document.querySelector('.music-toggle');
const musicOn = document.getElementById('musicOn');
const musicOff = document.getElementById('musicOff');
const bgMusic = document.getElementById('bgMusic');
const greetingCard = document.querySelector('.greeting-card');

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

// State variables
let isGameStarted = false;
let isMusicPlaying = false;
let gameCompleted = false;
let balloonCount = 15;
let popCount = 0; // Track how many balloons have been popped
let totalAttempts = 4; // Total attempts before cake appears

// Initialize the website
document.addEventListener('DOMContentLoaded', () => {
    // Setup music player with configurable music path
    setupMusicPlayer();
    
    // Check for and handle missing image assets
    handleMissingAssets();
    
    // Hide loading screen after content is loaded
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 2000);

    // Initialize GSAP animations
    initAnimations();

    // Setup event listeners
    setupEventListeners();

    // Setup custom cursor
    setupCustomCursor();

    // Initialize confetti effect on mouse move
    setupConfettiTrail();
});

// Setup music player with configurable music path
function setupMusicPlayer() {
    try {
        // Check if the music configuration variables exist and use them
        const musicPath = typeof BIRTHDAY_MUSIC !== 'undefined' ? BIRTHDAY_MUSIC : 'assets/birthday-music.mp3';
        const fallbackPath = typeof FALLBACK_MUSIC !== 'undefined' ? FALLBACK_MUSIC : '';
        
        // Create source element and set its attributes
        const source = document.createElement('source');
        source.src = musicPath;
        source.type = 'audio/mp3';
        
        // Clear any existing sources and append the new one
        bgMusic.innerHTML = '';
        bgMusic.appendChild(source);
        
        // Add error handling for primary music source
        bgMusic.addEventListener('error', function() {
            console.log('Primary music failed to load, trying fallback...');
            if (fallbackPath) {
                const fallbackSource = document.createElement('source');
                fallbackSource.src = fallbackPath;
                fallbackSource.type = 'audio/mp3';
                
                bgMusic.innerHTML = '';
                bgMusic.appendChild(fallbackSource);
                
                // If the fallback also fails, hide the music toggle
                bgMusic.addEventListener('error', function() {
                    console.log('Fallback music failed to load, disabling music toggle');
                    musicToggle.style.display = 'none';
                });
                
                // Load the fallback
                bgMusic.load();
            } else {
                // No fallback, hide the music toggle
                musicToggle.style.display = 'none';
            }
        });
        
        // Load the music
        bgMusic.load();
    } catch (e) {
        console.error('Error setting up music player:', e);
        musicToggle.style.display = 'none';
    }
}

// Handle missing assets with fallbacks
function handleMissingAssets() {
    // Check for missing gallery images and use fallbacks
    const galleryImages = document.querySelectorAll('.gallery-img');
    galleryImages.forEach(img => {
        img.onerror = function() {
            this.src = ''; // Clear the src to show the background gradient
            this.alt = 'Add a photo of Shrawani here';
            this.style.display = 'flex';
            this.style.justifyContent = 'center';
            this.style.alignItems = 'center';
            this.style.fontWeight = 'bold';
            this.style.color = 'white';
            this.style.textAlign = 'center';
            this.style.padding = '1rem';
            this.parentElement.style.background = `linear-gradient(45deg, var(--primary-color), var(--accent-color))`;
            
            // Create and append a text element
            const textEl = document.createElement('div');
            textEl.textContent = 'Photo with Shrawani';
            textEl.style.position = 'absolute';
            textEl.style.top = '50%';
            textEl.style.left = '50%';
            textEl.style.transform = 'translate(-50%, -50%)';
            textEl.style.color = 'white';
            textEl.style.fontWeight = 'bold';
            textEl.style.textAlign = 'center';
            this.parentElement.appendChild(textEl);
        };
    });
    
    // Check if bgMusic source is valid
    bgMusic.addEventListener('error', function() {
        // Disable music toggle if no music file
        musicToggle.style.display = 'none';
    });
}

function initAnimations() {
    // GSAP animations for page elements
    gsap.from(".welcome-message h1", { 
        y: 50, 
        opacity: 0, 
        duration: 1, 
        delay: 0.5,
        ease: "power2.out" 
    });
    
    gsap.from(".welcome-message p", { 
        y: 30, 
        opacity: 0, 
        duration: 1, 
        delay: 0.8,
        ease: "power2.out" 
    });
    
    gsap.from(".section h2", { 
        scrollTrigger: {
            trigger: ".section h2",
            start: "top 80%",
            toggleActions: "play none none none"
        },
        y: 30, 
        opacity: 0, 
        duration: 0.8,
        ease: "power2.out"
    });
    
    // Animation for floating elements
    gsap.to('.floating-item', {
        y: 'random(-20, 20)',
        x: 'random(-20, 20)',
        rotation: 'random(-15, 15)',
        duration: 'random(3, 6)',
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        stagger: 0.2
    });
}

function setupEventListeners() {
    // Start button event
    startButton.addEventListener('click', () => {
        introSection.classList.remove('active');
        mainSection.classList.add('active');
        startBackgroundMusic();
    });
    
    // Play game button
    playGameBtn.addEventListener('click', () => {
        switchSection(mainSection, gameSection);
        if (!isGameStarted) {
            setTimeout(() => {
                startBalloonGame();
                isGameStarted = true;
            }, 1000);
        }
    });
    
    // Card click event
    const cardFront = document.querySelector('.card-front');
    if (cardFront) {
        cardFront.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent any other click handlers from firing
            e.preventDefault();
            toggleCard();
        });
    }

    // Also add click event for the entire greeting card to ensure it works
    const greetingCardElement = document.querySelector('.greeting-card');
    if (greetingCardElement) {
        greetingCardElement.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            e.preventDefault(); // Prevent default behavior
            if (!greetingCardElement.classList.contains('open')) {
                toggleCard();
            }
        });
    }

    // Music toggle
    musicToggle.addEventListener('click', toggleMusic);
}

function setupCustomCursor() {
    document.addEventListener('mousemove', e => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
}

function setupConfettiTrail() {
    // Variables for confetti throttling
    let lastMove = 0;
    const throttleTime = 200; // ms between confetti bursts
    
    // Track mouse movement to create confetti trail
    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastMove > throttleTime) {
            lastMove = now;
            
            // Only do confetti effect in certain sections
            if (mainSection.classList.contains('active') || 
                cakeSection.classList.contains('active')) {
                // Create a small confetti burst at cursor position
                confetti({
                    particleCount: 3,
                    startVelocity: 20,
                    spread: 50,
                    origin: {
                        x: e.clientX / window.innerWidth,
                        y: e.clientY / window.innerHeight
                    },
                    colors: ['#FFB6C1', '#FFC0CB', '#FF69B4', '#FF1493', '#DB7093'],
                    scalar: 0.7,
                    disableForReducedMotion: true
                });
            }
        }
    });
}

function switchSection(fromSection, toSection) {
    if (fromSection) {
        fromSection.classList.remove('active');
        
        // Add fade out animation
        gsap.to(fromSection, {
            opacity: 0,
            duration: 0.4,
            onComplete: () => {
                fromSection.style.display = 'none';
                // Reset opacity for when we return
                gsap.set(fromSection, { opacity: 1 });
                
                // Scroll to top of new section on mobile devices
                if (window.innerWidth <= 768) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        });
    }
    
    if (toSection) {
        // Ensure the section is visible but transparent initially
        toSection.style.display = 'flex';
        gsap.set(toSection, { opacity: 0 });
        
        // Add a slight delay before fading in
        setTimeout(() => {
            toSection.classList.add('active');
            
            // Add fade in animation
            gsap.to(toSection, {
                opacity: 1,
                duration: 0.4,
                onComplete: () => {
                    // Ensure all elements within the section are visible
                    const elements = toSection.querySelectorAll('*');
                    elements.forEach(el => {
                        if (el.style.opacity === '0') {
                            gsap.to(el, { opacity: 1, duration: 0.3 });
                        }
                    });
                    
                    // Reset scroll position on mobile
                    if (window.innerWidth <= 768) {
                        toSection.scrollTop = 0;
                    }
                }
            });
        }, 300);
    }
}

function startBackgroundMusic() {
    try {
        // Set volume before playing to avoid startling the user
        bgMusic.volume = 0.4;
        
        const playPromise = bgMusic.play();
        
        // Modern browsers return a promise from play()
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Autoplay successful
                isMusicPlaying = true;
                musicOn.style.display = 'block';
                musicOff.style.display = 'none';
            }).catch(error => {
                // Autoplay was prevented
                console.log('Autoplay prevented:', error);
                isMusicPlaying = false;
                musicOn.style.display = 'none';
                musicOff.style.display = 'block';
            });
        }
    } catch (e) {
        console.error('Error playing music:', e);
    }
}

function toggleMusic() {
    try {
        if (isMusicPlaying) {
            bgMusic.pause();
            isMusicPlaying = false;
            musicOn.style.display = 'none';
            musicOff.style.display = 'block';
        } else {
            bgMusic.play().then(() => {
                isMusicPlaying = true;
                musicOn.style.display = 'block';
                musicOff.style.display = 'none';
            }).catch(error => {
                console.log('Play prevented:', error);
            });
        }
    } catch (e) {
        console.error('Error toggling music:', e);
    }
}

function getRandomBalloonColor() {
    // Updated with bright, festive colors only - removed any dark colors that could appear black
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', '#FB5607', '#FF85A1', '#FF006E', '#FFC2D1', '#77DD77', '#FFD166'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Start the balloon game
function startBalloonGame() {
    // Reset pop count
    popCount = 0;
    
    // Clear any existing balloons
    gameContainer.innerHTML = '';
    
    // Add SVG defs for gradients used in balloons
    const svgDefs = `
    <svg width="0" height="0" style="position: absolute;">
      <defs>
        <linearGradient id="balloonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(255, 255, 255, 0.7)" />
          <stop offset="50%" stop-color="rgba(255, 255, 255, 0)" />
          <stop offset="100%" stop-color="rgba(0, 0, 0, 0.1)" />
        </linearGradient>
        <!-- Special balloon gradient now identical to regular balloon gradient -->
        <linearGradient id="specialBalloonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="rgba(255, 255, 255, 0.7)" />
          <stop offset="50%" stop-color="rgba(255, 255, 255, 0)" />
          <stop offset="100%" stop-color="rgba(0, 0, 0, 0.1)" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </svg>
    `;
    gameContainer.innerHTML = svgDefs;
    
    // Add pop counter
    const popCounter = document.createElement('div');
    popCounter.className = 'pop-counter';
    popCounter.textContent = popCount + '/' + totalAttempts;
    gameContainer.appendChild(popCounter);
    
    // Create balloons
    for (let i = 0; i < balloonCount; i++) {
        createBalloon(i === balloonCount - 1); // Make the last balloon special
    }

    // Add some particle effects to the game container for a festive atmosphere
    createBalloonParticles();
}

// Add floating particles for a more festive atmosphere
function createBalloonParticles() {
    const particleCount = 20;
    const colors = ['#FFD700', '#FF1493', '#00CED1', '#FF4500', '#7B68EE'];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        
        // Random position, size and color
        const size = Math.floor(Math.random() * 6) + 3;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.borderRadius = '50%';
        particle.style.opacity = '0.6';
        particle.style.pointerEvents = 'none';
        
        // Random starting position within the container
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        gameContainer.appendChild(particle);
        
        // Animate the particle with GSAP
        gsap.to(particle, {
            y: `random(-${gameContainer.clientHeight / 2}, ${gameContainer.clientHeight / 2})`,
            x: `random(-${gameContainer.clientWidth / 2}, ${gameContainer.clientWidth / 2})`,
            opacity: 'random(0.3, 0.6)',
            duration: 'random(10, 20)',
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
}

function createBalloon(isSpecial = false) {
    const balloon = document.createElement('div');
    balloon.className = 'balloon';
    if (isSpecial) balloon.classList.add('special-balloon');
    
    // Get game container dimensions to adjust spacing for mobile
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;
    const isMobile = window.innerWidth <= 768;
    
    // Random position within the container with better spacing for mobile
    // Ensure balloons aren't too close to edges on mobile
    const leftPadding = isMobile ? 15 : 10;
    const rightMax = isMobile ? 65 : 70;
    const topPadding = isMobile ? 15 : 10;
    const bottomMax = isMobile ? 50 : 60;
    
    const left = Math.floor(Math.random() * (rightMax - leftPadding)) + leftPadding; // More centered on mobile
    const top = Math.floor(Math.random() * (bottomMax - topPadding)) + topPadding; // More centered on mobile
    
    // Random size - slightly larger on mobile for better touch targets
    const minSize = isMobile ? 65 : 60;
    const sizeVariation = isMobile ? 15 : 20;
    const size = Math.floor(Math.random() * sizeVariation) + minSize;
    
    // Random color
    const color = getRandomBalloonColor();
    
    // Position and size
    balloon.style.left = left + '%';
    balloon.style.top = top + '%';
    balloon.style.width = size + 'px';
    balloon.style.height = (size * 1.2) + 'px';
    
    // Create balloon SVG with improved shape and string
    const balloonHTML = `
        <div class="balloon-string" style="height: ${size * 0.5}px;"></div>
        <svg viewBox="0 0 50 60" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="balloon${left}${top}" cx="30%" cy="30%" r="70%" fx="20%" fy="20%">
                    <stop offset="0%" stop-color="white" stop-opacity="0.3"/>
                    <stop offset="80%" stop-color="${color}" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="${color}" stop-opacity="1"/>
                </radialGradient>
            </defs>
            <!-- Improved balloon shape with more realistic curves -->
            <path d="M25,2 
                     C38,2 48,15 48,30 
                     C48,42 40,50 25,55 
                     C10,50 2,42 2,30 
                     C2,15 12,2 25,2 Z" 
                  fill="url(#balloon${left}${top})" />
            <!-- Add balloon tie at bottom -->
            <path d="M23,55 C23,53 27,53 27,55 C27,57 23,57 23,55 Z" 
                  fill="${color}" 
                  opacity="0.9" />
        </svg>
    `;
    
    balloon.innerHTML = balloonHTML;
    
    // Add click event - increased tolerance for touch on mobile
    balloon.addEventListener('click', function() {
        // Only allow popping if we haven't reached the limit
        if (popCount < totalAttempts) {
            popBalloon(balloon, isSpecial);
        }
    });
    
    // Add touch events for mobile
    balloon.addEventListener('touchstart', function(e) {
        // Prevent default to avoid scrolling when touching a balloon
        e.preventDefault();
    });
    
    gameContainer.appendChild(balloon);
    
    // Add floating animation using GSAP
    // Different animation based on whether it's a special balloon
    if (isSpecial) {
        // Special balloon gets more subtle animation similar to regular balloons
        // but with slightly different timing to remain natural
        const animDuration = 2 + Math.random() * 3; // Same as regular balloons
        const yDistance = -10 - Math.random() * 15; // Same distance range
        const xDistance = -8 + Math.random() * 16; 
        const rotationAmount = -3 + Math.random() * 6;
        
        gsap.to(balloon, {
            y: yDistance,
            x: xDistance,
            rotation: rotationAmount,
            duration: animDuration,
            delay: Math.random(),
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });
        
        // Remove glow effect entirely - don't add any visual distinction
        // No special effects to make it look different from regular balloons
    } else {
        // Regular balloons get more subtle animations with different settings
        // for each balloon to create natural looking movement
        const animDuration = 2 + Math.random() * 3; // 2-5 seconds
        const yDistance = -10 - Math.random() * 15; // -10 to -25px
        const xDistance = -8 + Math.random() * 16; // -8 to +8px
        const rotationAmount = -3 + Math.random() * 6; // -3 to +3 degrees
        
        gsap.to(balloon, {
            y: yDistance,
            x: xDistance,
            rotation: rotationAmount,
            duration: animDuration,
            delay: Math.random(),
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });
    }
}

function popBalloon(balloon, isSpecial) {
    // Play popping sound if available
    const popSound = document.getElementById('popSound');
    if (popSound) popSound.play();
    
    // Create pop particles for a more satisfying effect
    createPopParticles(balloon, isSpecial);
    
    // Add popping class for animation
    balloon.classList.add('popping');
    
    // Update pop counter
    popCount++;
    const popCounter = document.querySelector('.pop-counter');
    popCounter.textContent = popCount + '/' + totalAttempts;
    
    // Check if this is the 4th balloon pop
    if (popCount === 4) {
        // Create and show the "found cake" message
        const foundMessage = document.createElement('div');
        foundMessage.className = 'found-cake-message';
        foundMessage.innerHTML = '<span>🎂</span> You found the cake! <span>🎂</span>';
        gameContainer.appendChild(foundMessage);
        
        // Add confetti celebration
        launchConfetti();
        
        // If it's the special balloon, mark it as such
        if (isSpecial) {
            balloon.classList.add('special-found');
        }
    }
    
    // Remove balloon after animation
    setTimeout(() => {
        balloon.remove();
        
        // If special balloon was popped or reached max attempts, show cake
        if (isSpecial || popCount >= totalAttempts) {
            setTimeout(() => {
                switchSection(gameSection, cakeSection);
                gameCompleted = true;
                celebrateCake();
            }, 1000);
        }
    }, 300);
}

// Create particles when a balloon pops for a more satisfying effect
function createPopParticles(balloon, isSpecial) {
    // Get balloon position and size
    const rect = balloon.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    
    // Calculate relative position within the container
    const relX = rect.left - containerRect.left + rect.width / 2;
    const relY = rect.top - containerRect.top + rect.height / 2;
    
    // Get balloon color
    let color = getComputedStyle(balloon.querySelector('svg path')).fill;
    // If can't get color, use a default
    if (!color || color === 'none') {
        color = isSpecial ? '#FFD700' : getRandomBalloonColor();
    }
    
    // Number of particles
    const particleCount = isSpecial ? 30 : 15;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'pop-particle';
        
        // Random particle properties
        const size = Math.random() * 8 + 2;
        const angle = Math.random() * Math.PI * 2; // Random angle in radians
        const distance = Math.random() * 60 + 20; // How far particles will travel
        const duration = Math.random() * 0.6 + 0.4; // Animation duration
        
        // Position particle at balloon center
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = color;
        particle.style.borderRadius = '50%';
        particle.style.left = `${relX}px`;
        particle.style.top = `${relY}px`;
        particle.style.opacity = '1';
        particle.style.pointerEvents = 'none';
        
        gameContainer.appendChild(particle);
        
        // Calculate end position based on angle and distance
        const endX = relX + Math.cos(angle) * distance;
        const endY = relY + Math.sin(angle) * distance;
        
        // Animate particle outward with gravity effect
        gsap.to(particle, {
            x: endX - relX,
            y: endY - relY,
            opacity: 0,
            duration: duration,
            ease: 'power1.out',
            onComplete: () => {
                particle.remove();
            }
        });
    }
}

// Function to show the final cake once, without getting stuck
function showFinalCake() {
    // Mark game as complete to prevent duplicate transitions
    if (cakeSection.classList.contains('active')) {
        return;
    }
    
    // Hide game section
    gameSection.classList.remove('active');
    gameSection.style.display = 'none';
    gameSection.style.opacity = 0;
    
    // Show cake section
    cakeSection.classList.add('active');
    cakeSection.classList.add('cake-celebrated'); // Mark as already celebrated
    cakeSection.style.display = 'flex';
    cakeSection.style.opacity = 1;
    
    // Launch initial confetti burst
    confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ffb6c1', '#ffd700', '#9370db', '#ff69b4', '#00bfff']
    });
    
    // Animate cake building up
    animateCakeBuildup();
}

// Animate cake building up in a delightful sequence
function animateCakeBuildup() {
    // Hide all cake elements initially
    gsap.set('.cake-bottom, .cake-middle, .cake-top, .candle, .flame', { 
        opacity: 0,
        scale: 0
    });
    
    // Show the celebration message first
    gsap.to('.celebration-message h2', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)'
    });
    
    // Create a timeline for cake building
    const cakeTimeline = gsap.timeline({
        delay: 0.8,
        onComplete: () => {
            // Start continuous confetti
            launchConfetti();
            
            // Animate wishes text
            gsap.to('.wishes-container', {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power3.out'
            });
        }
    });
    
    // Build cake from bottom to top
    cakeTimeline
        .to('.cake-bottom', {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)'
        })
        .to('.cake-middle', {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)'
        }, '-=0.3')
        .to('.cake-top', {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)'
        }, '-=0.3')
        .to('.candle', {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)'
        }, '-=0.3')
        .to('.flame', {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
                // Add special sparkle effects around the cake
                addCakeSparkles();
            }
        });
    
    // Add decorative elements animation
    animateDecorativeElements();
}

// Add sparkles around the cake
function addCakeSparkles() {
    // Create sparkle container if it doesn't exist
    if (!document.querySelector('.cake-sparkles')) {
        const sparkleContainer = document.createElement('div');
        sparkleContainer.className = 'cake-sparkles';
        document.querySelector('.cake-container').appendChild(sparkleContainer);
        
        // Add multiple sparkles
        for (let i = 0; i < 12; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'cake-sparkle';
            
            // Position randomly around the cake - adjusted for lower cake position
            const angle = i * (360 / 12);
            const radius = 120 + Math.random() * 30;
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius + 30; // Adjust for lower cake position
            
            sparkle.style.left = `calc(50% + ${x}px)`;
            sparkle.style.top = `calc(50% + ${y}px)`;
            sparkle.style.animationDelay = `${Math.random() * 2}s`;
            
            sparkleContainer.appendChild(sparkle);
        }
    }
}

// Animate decorative elements
function animateDecorativeElements() {
    // Create decorative elements if they don't exist
    if (!document.querySelector('.cake-decorations')) {
        const container = document.createElement('div');
        container.className = 'cake-decorations';
        document.querySelector('.cake-container').appendChild(container);
        
        // Add floating balloons
        const floatingElements = ['balloon', 'heart', 'star'];
        const colors = ['#ffb6c1', '#ffd700', '#9370db', '#ff69b4', '#87CEFA'];
        
        for (let i = 0; i < 8; i++) {
            const element = document.createElement('div');
            const type = floatingElements[Math.floor(Math.random() * floatingElements.length)];
            element.className = `cake-decoration ${type}`;
            
            // Random position and animation
            element.style.left = `${Math.random() * 90 + 5}%`;
            element.style.top = `${Math.random() * 90 + 5}%`;
            element.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            element.style.animationDelay = `${Math.random() * 3}s`;
            element.style.animationDuration = `${3 + Math.random() * 4}s`;
            
            container.appendChild(element);
        }
    }
    
    // Animate all decorations
    gsap.fromTo('.cake-decoration', 
        { y: 100, opacity: 0 }, 
        { y: 0, opacity: 1, stagger: 0.1, duration: 1, ease: 'back.out(1.7)' }
    );
}

// Celebrate with cake and confetti
function celebrateCake() {
    // Prevent multiple celebrations
    if (document.querySelector('.cake-celebrated')) {
        return;
    }
    
    // Mark as celebrated
    cakeSection.classList.add('cake-celebrated');
    
    // Build up the cake with animation
    animateCakeBuildup();
}

// Launch confetti celebration
function launchConfetti() {
    const duration = 5 * 1000;
    const end = Date.now() + duration;
    
    (function frame() {
        confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.65 }
        });
        
        confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.65 }
        });
        
        // Keep launching until duration is up
        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());

    // Big burst at the beginning
    confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ffb6c1', '#ffd700', '#9370db', '#ff69b4', '#00bfff']
    });
    
    // Another smaller burst after 1 second
    setTimeout(() => {
        confetti({
            particleCount: 50,
            spread: 120,
            origin: { y: 0.5 }
        });
    }, 1000);
}

// Toggle greeting card open/close with improved mobile support
function toggleCard() {
    // Ensure we're not showing grid or horizontal views
    const gridView = document.getElementById('gridView');
    const horizontalScroll = document.getElementById('horizontalScroll');
    
    if (gridView && gridView.classList.contains('active')) {
        gridView.classList.remove('active');
    }
    
    if (horizontalScroll && horizontalScroll.classList.contains('active')) {
        horizontalScroll.classList.remove('active');
    }
    
    // Explicitly remove any event listeners from the openGalleryBtn by cloning and replacing it
    const openGalleryBtn = document.getElementById('openGalleryBtn');
    if (openGalleryBtn) {
        const newBtn = openGalleryBtn.cloneNode(true);
        openGalleryBtn.parentNode.replaceChild(newBtn, openGalleryBtn);
        
        // Reattach a new click event that does nothing for a brief moment
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        // Restore proper gallery functionality after a short delay
        setTimeout(() => {
            newBtn.addEventListener('click', () => {
                document.body.style.overflow = 'hidden';
                horizontalScroll.classList.add('active');
            });
        }, 500);
    }
    
    // Check if card is already being animated to prevent double-clicks
    if (greetingCard.classList.contains('animating')) {
        return;
    }
    
    // Mark as animating
    greetingCard.classList.add('animating');
    
    // Toggle open class
    greetingCard.classList.toggle('open');
    
    // Launch confetti for celebration
    launchConfetti();
    
    // Handle card content visibility
    const cardInner = greetingCard.querySelector('.card-inner');
    const cardFront = greetingCard.querySelector('.card-front');
    
    // Detect mobile devices for better handling
    const isMobile = window.innerWidth <= 768 || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);
    
    if (greetingCard.classList.contains('open')) {
        // Card is opening - make inner content visible
        cardInner.style.visibility = 'visible';
        
        // Different timing for mobile vs desktop for more reliable animation
        const timingDelay = isMobile ? 300 : 400;
        
        // Reset scroll position in the inner content
        const leftContent = cardInner.querySelector('.card-left-content');
        if (leftContent) {
            leftContent.scrollTop = 0;
        }
        
        if (isMobile) {
            // On mobile, immediately hide front to prevent flicker
            cardFront.style.opacity = '0';
            cardFront.style.visibility = 'hidden';
            cardFront.style.pointerEvents = 'none';
        }
        
        // Ensure the inner content is fully rendered
        setTimeout(() => {
            cardInner.style.zIndex = '3'; // Higher than front
            
            // Prevent iOS 3D transform issues
            if (isMobile) {
                cardInner.style.transform = 'rotateY(0deg)';
                cardFront.style.transform = 'rotateY(180deg)';
            }
        }, timingDelay); // Half the transition time to switch z-index midway
    } else {
        // Card is closing - reset z-index
        cardInner.style.zIndex = '1'; // Lower than front
        
        if (isMobile) {
            // Restore front card visibility
            setTimeout(() => {
                cardFront.style.opacity = '1';
                cardFront.style.visibility = 'visible';
                cardFront.style.pointerEvents = 'auto';
            }, 300);
        }
        
        // Hide inner content after animation completes
        setTimeout(() => {
            if (!greetingCard.classList.contains('open')) {
                cardInner.style.visibility = 'hidden';
            }
        }, isMobile ? 600 : 800); // Full transition time, adjusted for mobile
    }
    
    // Remove animating class after animation completes
    setTimeout(() => {
        greetingCard.classList.remove('animating');
    }, isMobile ? 600 : 800); // Match the CSS transition duration, adjusted for mobile
} 