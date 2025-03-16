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
let currentSlideIndex = 0;
let totalSlides = 8; // Total number of images in our gallery

// Image captions and paths for the gallery
const galleryImages = [
    { path: "assets/placeholders/placeholder1.jpeg", caption: "Revisit the moment" },
    { path: "assets/placeholders/placeholder2.jpeg", caption: "A few days ago" },
    { path: "assets/placeholders/placeholder3.jpeg", caption: "Our special day" },
    { path: "assets/placeholders/placeholder4.jpeg", caption: "Beautiful memories" },
    { path: "assets/placeholders/placeholder5.jpeg", caption: "Remember when" },
    { path: "assets/placeholders/placeholder6.jpeg", caption: "That day" },
    { path: "assets/placeholders/placeholder7.jpeg", caption: "Good times" },
    { path: "assets/placeholders/placeholder8.jpeg", caption: "Moments together" }
];

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
    
    // Initialize gallery card animations
    initGalleryCards();
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
    const galleryImages = document.querySelectorAll('.memory-card img');
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

// Initialize GSAP animations
function initAnimations() {
    // Animate the welcome message
    gsap.from('.handwritten', {
        y: 50,
        opacity: 0,
        duration: 1.5,
        ease: 'elastic.out(1, 0.3)',
        delay: 0.5
    });

    gsap.from('.message', {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: 1
    });

    // Animate memory cards when they come into view
    const memoriesSection = document.querySelector('.memories');
    const memoryCards = document.querySelectorAll('.memory-card');

    // Create a staggered animation for memory cards
    gsap.from(memoryCards, {
        opacity: 0,
        y: 50,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: memoriesSection,
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Start button click event
    startButton.addEventListener('click', () => {
        switchSection(introSection, mainSection);
        // Start playing music when celebration begins
        startBackgroundMusic();
    });

    // Play game button click event
    playGameBtn.addEventListener('click', () => {
        switchSection(mainSection, gameSection);
        if (!isGameStarted) {
            startBalloonGame();
            isGameStarted = true;
        }
    });

    // Music toggle click event
    musicToggle.addEventListener('click', toggleMusic);

    // Greeting card click event
    greetingCard.addEventListener('click', toggleCard);

    // Gallery navigation
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    prevBtn.addEventListener('click', () => {
        navigateGallery('prev');
    });
    
    nextBtn.addEventListener('click', () => {
        navigateGallery('next');
    });

    // Touch swipe support for gallery
    const gallery = document.querySelector('.gallery');
    let touchStartX = 0;
    let touchEndX = 0;
    
    gallery.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    gallery.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance to be considered a swipe
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left - go to next
            navigateGallery('next');
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right - go to previous
            navigateGallery('prev');
        }
    }

    // Indicator clicks
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
    });

    // Memory card emoji reactions
    const memoryCards = document.querySelectorAll('.memory-card');
    memoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const emoji = card.getAttribute('data-emoji');
            const emojiElement = card.querySelector('.emoji-reaction');
            
            // Show emoji with animation
            emojiElement.style.transform = 'translate(-50%, -50%) scale(1)';
            
            // Hide emoji after 1 second
            setTimeout(() => {
                emojiElement.style.transform = 'translate(-50%, -50%) scale(0)';
            }, 1000);
        });
    });
}

// Setup custom cursor
function setupCustomCursor() {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
}

// Setup confetti trail on mouse move
function setupConfettiTrail() {
    let confettiInterval;
    let isConfettiActive = false;

    document.addEventListener('mousemove', (e) => {
        if (!isConfettiActive) {
            isConfettiActive = true;
            confettiInterval = setInterval(() => {
                confetti({
                    particleCount: 2,
                    startVelocity: 20,
                    spread: 360,
                    origin: {
                        x: e.clientX / window.innerWidth,
                        y: e.clientY / window.innerHeight
                    },
                    colors: ['#ffb6c1', '#ffd700', '#9370db', '#ff69b4', '#00bfff'],
                    disableForReducedMotion: true,
                    gravity: 0.5
                });
            }, 100);

            // Stop confetti after 500ms to prevent performance issues
            setTimeout(() => {
                clearInterval(confettiInterval);
                isConfettiActive = false;
            }, 500);
        }
    });
}

// Switch between sections with animation
function switchSection(fromSection, toSection) {
    if (fromSection === gameSection && toSection === cakeSection && gameCompleted) {
        // Prevent multiple transitions to cake section
        if (cakeSection.classList.contains('active')) {
            return;
        }
    }
    
    fromSection.classList.remove('active');
    toSection.classList.add('active');
    
    gsap.timeline()
    .to(fromSection, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            fromSection.style.display = 'none';
            toSection.style.display = 'flex';
            
            // Fade in new section
            gsap.to(toSection, {
                opacity: 1,
                duration: 0.8,
                onComplete: () => {
                    if (toSection === cakeSection) {
                        celebrateCake();
                    }
                }
            });
        }
    });
}

// Start background music with proper error handling
function startBackgroundMusic() {
    try {
        // Only attempt to play if the music toggle is visible (music is available)
        if (musicToggle.style.display !== 'none') {
            const playPromise = bgMusic.play();
            
            // Handle the play promise (required for modern browsers)
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isMusicPlaying = true;
                    musicOn.style.display = 'block';
                    musicOff.style.display = 'none';
                }).catch(error => {
                    console.log('Auto-play prevented by browser:', error);
                    // Don't update UI since playback failed
                });
            }
        }
    } catch (e) {
        console.error('Error playing background music:', e);
    }
}

// Toggle background music
function toggleMusic() {
    if (isMusicPlaying) {
        bgMusic.pause();
        musicOn.style.display = 'none';
        musicOff.style.display = 'block';
    } else {
        const playPromise = bgMusic.play();
        
        // Handle the play promise (required for modern browsers)
        if (playPromise !== undefined) {
            playPromise.then(() => {
                musicOn.style.display = 'block';
                musicOff.style.display = 'none';
            }).catch(error => {
                console.log('Play prevented by browser:', error);
                // Don't update UI since playback failed
                return;
            });
        }
    }
    
    isMusicPlaying = !isMusicPlaying;
}

// Navigate gallery
function navigateGallery(direction) {
    if (direction === 'next') {
        currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    } else if (direction === 'prev') {
        currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    }
    
    goToSlide(currentSlideIndex);
}

// Go to specific slide
function goToSlide(index) {
    // Update current slide index
    currentSlideIndex = index;
    
    // Update slide content
    const gallery = document.querySelector('.gallery');
    const card = gallery.querySelector('.memory-card');
    const img = card.querySelector('img');
    const caption = card.querySelector('.memory-card-caption');
    
    // Apply fade out animation
    gsap.to(card, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            // Update content
            img.src = galleryImages[index].path;
            caption.textContent = galleryImages[index].caption;
            
            // Fade in
            gsap.to(card, {
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out'
            });
        }
    });
    
    // Update indicators
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, i) => {
        if (i === index) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Get random balloon color
function getRandomBalloonColor() {
    const colors = ['pinlk', 'blue', 'yellow', 'green'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Start the balloon game
function startBalloonGame() {
    const gameContainer = document.querySelector('.game-container');
    
    // Clear previous game elements
    gameContainer.innerHTML = '';
    
    // Reset game variables
    popCount = 0;
    gameCompleted = false;
    
    // Create attempts counter
    const attemptsCounter = document.createElement('div');
    attemptsCounter.innerHTML = `<strong>${popCount}</strong>/${totalAttempts}`;
    attemptsCounter.style.position = 'absolute';
    attemptsCounter.style.top = '10px';
    attemptsCounter.style.right = '10px';
    attemptsCounter.style.background = 'rgba(255,255,255,0.7)';
    attemptsCounter.style.padding = '5px 10px';
    attemptsCounter.style.borderRadius = '10px';
    attemptsCounter.style.zIndex = '10';
    attemptsCounter.style.fontWeight = 'bold';
    
    gameContainer.appendChild(attemptsCounter);
    
    // Check if mobile device to adjust balloon placement
    const isMobile = window.innerWidth <= 768;
    
    // Create more balanced distribution area for mobile
    const balloonArea = isMobile ? 
        { xMin: 20, xMax: 80, yMin: 15, yMax: 85 } :  // Mobile - more centered
        { xMin: 10, xMax: 90, yMin: 10, yMax: 90 };   // Desktop
    
    // Calculate optimal balloon positions to ensure better visual balance
    const positions = [];
    const gridCols = isMobile ? 3 : 4;
    const gridRows = isMobile ? 5 : 4;
    
    // Generate grid-based positions with some randomness
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const baseX = balloonArea.xMin + (col * ((balloonArea.xMax - balloonArea.xMin) / (gridCols - 1)));
            const baseY = balloonArea.yMin + (row * ((balloonArea.yMax - balloonArea.yMin) / (gridRows - 1)));
            
            // Add slight randomness to grid positions
            const randomX = baseX + (Math.random() * 10 - 5);
            const randomY = baseY + (Math.random() * 10 - 5);
            
            positions.push({
                x: randomX,
                y: randomY
            });
        }
    }
    
    // Shuffle positions for random distribution
    positions.sort(() => Math.random() - 0.5);
    
    // Create balloons with better positioning for mobile
    for (let i = 0; i < balloonCount; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        
        // Get position from grid or fallback to random if we need more balloons than grid positions
        const position = i < positions.length ? positions[i] : {
            x: balloonArea.xMin + (Math.random() * (balloonArea.xMax - balloonArea.xMin)),
            y: balloonArea.yMin + (Math.random() * (balloonArea.yMax - balloonArea.yMin))
        };
        
        const animationDelay = Math.random() * 3;
        const balloonColor = getRandomBalloonColor();
        
        // Scale balloon size for mobile
        const balloonSize = isMobile ? 
            { width: '50px', height: '70px' } : 
            { width: '60px', height: '80px' };
        
        balloon.style.left = `${position.x}%`;
        balloon.style.top = `${position.y}%`;
        balloon.style.width = balloonSize.width;
        balloon.style.height = balloonSize.height;
        balloon.style.position = 'absolute';
        balloon.style.borderRadius = '50% 50% 50% 50% / 40% 40% 60% 60%';
        balloon.style.backgroundColor = balloonColor === 'pinlk' ? '#ff9bb2' : 
                                        balloonColor === 'blue' ? '#87CEFA' : 
                                        balloonColor === 'yellow' ? '#FFD700' : 
                                        '#90EE90'; // green
        balloon.style.cursor = 'pointer';
        balloon.style.boxShadow = '0 3px 10px rgba(0,0,0,0.2)';
        balloon.style.animation = `float 3s ease-in-out infinite`;
        balloon.style.animationDelay = `${animationDelay}s`;
        
        // Add balloon string
        const string = document.createElement('div');
        string.style.position = 'absolute';
        string.style.bottom = '-30px';
        string.style.left = '50%';
        string.style.width = '1px';
        string.style.height = '30px';
        string.style.backgroundColor = '#ccc';
        string.style.transform = 'translateX(-50%)';
        balloon.appendChild(string);
        
        // Add balloon pop event
        balloon.addEventListener('click', () => {
            popBalloon(balloon, attemptsCounter);
        });
        
        gameContainer.appendChild(balloon);
    }
}

// Pop a balloon in the game
function popBalloon(balloon, attemptsCounter) {
    // Increment pop counter
    popCount++;
    
    // Update the attempts counter
    attemptsCounter.innerHTML = `<strong>${popCount}</strong>/${totalAttempts}`;
    
    // Play pop sound with error handling
    try {
        const popSound = new Audio('assets/pop.mp3');
        popSound.volume = 0.5;
        popSound.play().catch(err => console.log('Pop sound could not be played'));
    } catch (error) {
        console.log('Pop sound not available');
    }
    
    // Pop animation
    gsap.to(balloon, {
        scale: 1.5,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            balloon.remove();
            
            // Check if this is the 4th attempt
            if (popCount >= totalAttempts && !gameCompleted) {
                gameCompleted = true;
                
                // Create cake balloon at the center
                const cakeBalloon = document.createElement('div');
                cakeBalloon.className = 'balloon cake-balloon';
                cakeBalloon.style.left = '50%';
                cakeBalloon.style.top = '50%';
                cakeBalloon.style.transform = 'translate(-50%, -50%)';
                
                // Adjust cake balloon size for mobile
                const isMobile = window.innerWidth <= 768;
                const cakeSize = isMobile ? 
                    { width: '100px', height: '130px', fontSize: '50px' } : 
                    { width: '120px', height: '150px', fontSize: '60px' };
                    
                cakeBalloon.style.width = cakeSize.width;
                cakeBalloon.style.height = cakeSize.height;
                cakeBalloon.style.position = 'absolute';
                cakeBalloon.style.backgroundImage = 'none';
                cakeBalloon.style.backgroundColor = '#ff69b4';
                cakeBalloon.style.boxShadow = '0 0 20px 5px gold';
                cakeBalloon.style.border = '3px dashed gold';
                cakeBalloon.style.borderRadius = '50% 50% 50% 50% / 40% 40% 60% 60%';
                cakeBalloon.innerHTML = `<span style="font-size: ${cakeSize.fontSize}; text-shadow: 0 0 5px white;">🎂</span>`;
                cakeBalloon.style.display = 'flex';
                cakeBalloon.style.justifyContent = 'center';
                cakeBalloon.style.alignItems = 'center';
                cakeBalloon.style.zIndex = '50';
                
                gameContainer.appendChild(cakeBalloon);
                
                // Create celebratory message
                const message = document.createElement('div');
                message.className = 'cake-reveal-message';
                message.textContent = 'You found the cake!';
                message.style.position = 'absolute';
                message.style.top = '25%';
                message.style.left = '50%';
                message.style.transform = 'translate(-50%, -50%)';
                message.style.fontSize = '2rem';
                message.style.fontWeight = 'bold';
                message.style.color = '#ff69b4';
                message.style.textShadow = '0 0 5px gold';
                message.style.zIndex = '51';
                
                gameContainer.appendChild(message);
                
                // Animate cake balloon
                gsap.fromTo(cakeBalloon, 
                    { scale: 0 },
                    { 
                        scale: 1, 
                        duration: 0.8, 
                        ease: 'elastic.out(1, 0.3)',
                        onComplete: () => {
                            // Show confetti around the cake balloon
                            confetti({
                                particleCount: 100,
                                spread: 70,
                                origin: { y: 0.5, x: 0.5 }
                            });
                        }
                    }
                );
                
                // Small delay before showing cake
                setTimeout(() => {
                    showFinalCake();
                }, 2500);
            }
        }
    });
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

// Initialize gallery card animations
function initGalleryCards() {
    // Check if we have images to display
    if (galleryImages.length > 0) {
        goToSlide(0); // Start with the first slide
    }
}

// Toggle greeting card open/close with improved mobile support
function toggleCard() {
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
    
    if (greetingCard.classList.contains('open')) {
        // Card is opening - make inner content visible
        cardInner.style.visibility = 'visible';
        
        // Reset scroll position in the inner content
        const leftContent = cardInner.querySelector('.card-left-content');
        if (leftContent) {
            leftContent.scrollTop = 0;
        }
        
        // Ensure the inner content is fully rendered
        setTimeout(() => {
            cardInner.style.zIndex = '3'; // Higher than front
        }, 400); // Half the transition time to switch z-index midway
    } else {
        // Card is closing - reset z-index
        cardInner.style.zIndex = '1'; // Lower than front
        
        // Hide inner content after animation completes
        setTimeout(() => {
            if (!greetingCard.classList.contains('open')) {
                cardInner.style.visibility = 'hidden';
            }
        }, 800); // Full transition time
    }
    
    // Remove animating class after animation completes
    setTimeout(() => {
        greetingCard.classList.remove('animating');
    }, 800); // Match the CSS transition duration
} 