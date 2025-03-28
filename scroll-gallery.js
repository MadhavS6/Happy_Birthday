document.addEventListener('DOMContentLoaded', () => {
    // Add a global flag to temporarily lock gallery opening
    window.galleryLocked = false;
    
    // Initialize hasNavigatedToCard flag if not already set
    window.hasNavigatedToCard = window.hasNavigatedToCard || false;
    
    // Close galleries immediately if we've already navigated to the card
    if (window.hasNavigatedToCard) {
        const gridView = document.getElementById('gridView');
        const horizontalScroll = document.getElementById('horizontalScroll');
        
        if (gridView) {
            gridView.classList.remove('active');
            gridView.style.display = 'none';
            gridView.style.pointerEvents = 'none';
        }
        
        if (horizontalScroll) {
            horizontalScroll.classList.remove('active');
            horizontalScroll.style.display = 'none';
            horizontalScroll.style.pointerEvents = 'none';
        }
    }
    
    // Prevent greeting card clicks from affecting the gallery
    const secretMessageSection = document.querySelector('.section.secret-message');
    if (secretMessageSection) {
        secretMessageSection.addEventListener('click', (e) => {
            // Stop propagation to prevent any unintended gallery interactions
            e.stopPropagation();
            
            // Set a temporary lock to prevent gallery from opening
            window.galleryLocked = true;
            
            // Reset lock after a delay
            setTimeout(() => {
                window.galleryLocked = false;
            }, 800);
        });
    }
    
    const greetingCard = document.querySelector('.greeting-card');
    if (greetingCard) {
        greetingCard.addEventListener('click', (e) => {
            // Stop propagation to prevent any unintended gallery interactions
            e.stopPropagation();
            // Prevent default to avoid any browser default behavior
            e.preventDefault();
            
            // Explicitly ensure galleries are closed when card is clicked
            const gridView = document.getElementById('gridView');
            const horizontalScroll = document.getElementById('horizontalScroll');
            
            if (gridView && gridView.classList.contains('active')) {
                gridView.classList.remove('active');
            }
            
            if (horizontalScroll && horizontalScroll.classList.contains('active')) {
                horizontalScroll.classList.remove('active');
            }
            
            // Set a temporary lock to prevent gallery from opening
            window.galleryLocked = true;
            
            // Reset lock after a delay
            setTimeout(() => {
                window.galleryLocked = false;
            }, 800);
        });
    }
    
    const horizontalScroll = document.getElementById('horizontalScroll');
    const gridView = document.getElementById('gridView');
    const scrollItems = document.querySelectorAll('.scroll-item');
    const gridItems = document.querySelectorAll('.grid-item');
    const openGalleryBtn = document.getElementById('openGalleryBtn');
    const closeHorizontalBtn = document.getElementById('closeHorizontalBtn');
    const closeGridBtn = document.getElementById('closeGridBtn');
    
    // Track if a navigation to card is in progress
    window.isNavigatingToCard = false;
    
    // Set animation indices for grid items
    gridItems.forEach((item, index) => {
        item.style.setProperty('--item-index', index);
    });
    
    // Function to handle image loading with improved caching strategy
    const loadImages = () => {
        const allImages = document.querySelectorAll('.gallery-img');
        
        // Create an array to track loading progress
        const imagePromises = [];
        
        allImages.forEach(img => {
            // Store original source
            const originalSrc = img.getAttribute('src');
            
            // Create a promise for each image load
            const loadPromise = new Promise((resolve) => {
                // Create a new Image object to preload
                const preloadImg = new Image();
                
                // Set up load event before setting source
                preloadImg.onload = function() {
                    // Check if image is portrait and add class to parent if needed
                    if (preloadImg.height > preloadImg.width) {
                        img.closest('.grid-item').classList.add('portrait-img');
                    }
                    
                    // Once preloaded, update the actual image with cache buster
                    img.src = originalSrc + '?v=' + new Date().getTime();
                    resolve();
                };
                
                preloadImg.onerror = function() {
                    // If error loading, still resolve but log error
                    console.warn('Error loading image:', originalSrc);
                    resolve();
                };
                
                // Start preloading
                preloadImg.src = originalSrc;
            });
            
            imagePromises.push(loadPromise);
        });
        
        // Return a promise that resolves when all images are loaded
        return Promise.all(imagePromises);
    };
    
    // Load all images initially
    loadImages().then(() => {
        console.log('All images preloaded successfully');
    });
    
    // Animation for grid items when they appear
    gridItems.forEach((item) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
    });
    
    // Open gallery button event
    openGalleryBtn.addEventListener('click', (e) => {
        // Check if gallery is temporarily locked (from card interactions)
        // or if we've already navigated to the card
        if (window.galleryLocked || window.hasNavigatedToCard) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        horizontalScroll.classList.add('active');
    });
    
    // Close gallery buttons events
    closeHorizontalBtn.addEventListener('click', () => {
        navigateToSpecialCard();
    });
    
    closeGridBtn.addEventListener('click', () => {
        navigateToSpecialCard();
    });
    
    // Function to check if user has scrolled to the last image
    const checkScrollPosition = () => {
        if (!horizontalScroll) return;
        
        // Skip checking if we've already navigated to the card
        if (window.hasNavigatedToCard) return;
        
        const scrollWidth = horizontalScroll.scrollWidth;
        const scrollLeft = horizontalScroll.scrollLeft;
        const clientWidth = horizontalScroll.clientWidth;
        
        // If user has scrolled to near the end (last 20% of the last image)
        if (scrollLeft + clientWidth >= scrollWidth - (clientWidth * 0.2)) {
            transitionToGridView();
        } else if (scrollLeft === 0) {
            // If user scrolls back to the beginning, show horizontal view
            transitionToHorizontalView();
        }
    };
    
    // Function to transition to grid view
    const transitionToGridView = () => {
        if (!horizontalScroll || !gridView) return;
        
        // Skip transition if we've already navigated to the card
        if (window.hasNavigatedToCard) return;
        
        horizontalScroll.classList.remove('active');
        
        setTimeout(() => {
            gridView.classList.add('active');
            
            // Reset grid item animations before showing
            gridItems.forEach((item) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                void item.offsetWidth; // Force reflow
            });
            
            // Small delay before starting animation
            setTimeout(() => {
                // Apply animation to each item with staggered delay
                gridItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.animation = 'fadeInUp 0.6s forwards';
                    }, index * 60);
                });
                
                // Add a "Continue to Birthday Card" button
                addContinueButton();
            }, 100);
        }, 400);
    };
    
    // Add a visible continue button to navigate to special card
    const addContinueButton = () => {
        // Remove any existing button first
        const existingBtn = document.getElementById('continueToCardBtn');
        if (existingBtn) existingBtn.remove();
        
        // Create continue button
        const continueBtn = document.createElement('button');
        continueBtn.id = 'continueToCardBtn';
        continueBtn.className = 'continue-to-card-btn';
        continueBtn.textContent = 'Continue to Birthday Card ➡️';
        
        // Style it to match design
        continueBtn.style.position = 'fixed';
        continueBtn.style.bottom = '30px';
        continueBtn.style.left = '50%';
        continueBtn.style.transform = 'translateX(-50%)';
        continueBtn.style.padding = '12px 25px';
        continueBtn.style.backgroundColor = '#ffb6c1';
        continueBtn.style.color = 'white';
        continueBtn.style.border = 'none';
        continueBtn.style.borderRadius = '30px';
        continueBtn.style.fontSize = '16px';
        continueBtn.style.fontWeight = 'bold';
        continueBtn.style.cursor = 'pointer';
        continueBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        continueBtn.style.zIndex = '1002';
        continueBtn.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        
        // Add hover effect
        continueBtn.onmouseover = () => {
            continueBtn.style.transform = 'translateX(-50%) scale(1.05)';
            continueBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.25)';
        };
        
        continueBtn.onmouseout = () => {
            continueBtn.style.transform = 'translateX(-50%)';
            continueBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
        };
        
        // Add click event
        continueBtn.addEventListener('click', navigateToSpecialCard);
        
        // Add to the grid view
        gridView.appendChild(continueBtn);
        
        // Add simple animation to draw attention
        setTimeout(() => {
            continueBtn.style.animation = 'pulse 2s infinite';
        }, 1000);
    };
    
    // Add a transition overlay for smoother navigation
    const addTransitionOverlay = () => {
        // Remove any existing overlay
        const existingOverlay = document.getElementById('transitionOverlay');
        if (existingOverlay) existingOverlay.remove();
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'transitionOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(255, 182, 193, 0.2)';
        overlay.style.backdropFilter = 'blur(5px)';
        overlay.style.webkitBackdropFilter = 'blur(5px)';
        overlay.style.zIndex = '9999';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.4s ease';
        overlay.style.pointerEvents = 'none';
        
        // Add to body
        document.body.appendChild(overlay);
        
        // Trigger fade in
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
        
        return overlay;
    };
    
    // Function to navigate to special card section
    const navigateToSpecialCard = () => {
        // Prevent multiple calls
        if (window.isNavigatingToCard) return;
        window.isNavigatingToCard = true;
        
        // Set a permanent flag to indicate we've navigated to the card
        // This will prevent gallery from reopening
        window.hasNavigatedToCard = true;
        
        // First, force immediate cleanup and close of any modals or galleries
        // Use existing gridView and horizontalScroll from outer scope instead of redeclaring
        
        // Remove any continue button to prevent multiple clicks
        const continueBtn = document.getElementById('continueToCardBtn');
        if (continueBtn) continueBtn.remove();
        
        // Force remove any image previews that might be open
        const previewOverlays = document.querySelectorAll('.image-preview-overlay');
        previewOverlays.forEach(overlay => overlay.remove());
        
        // Add a transition overlay
        const overlay = addTransitionOverlay();
        
        // Immediately close grid and horizontal views
        if (gridView) {
            gridView.classList.remove('active');
            gridView.style.display = 'none'; // Force immediate hide
        }
        
        if (horizontalScroll) {
            horizontalScroll.classList.remove('active');
            horizontalScroll.style.display = 'none'; // Force immediate hide
        }
        
        document.body.style.overflow = ''; // Restore scrolling
        document.body.classList.remove('blur-background'); // Remove any blur effect
        
        // Make sure we have immediate visibility of the secret message section
        const secretMessageSection = document.querySelector('.section.secret-message');
        if (secretMessageSection) {
            // Force display of the card section
            secretMessageSection.style.display = 'flex';
            secretMessageSection.style.opacity = '1';
            secretMessageSection.style.visibility = 'visible';
            
            // Wait for transition overlay
            setTimeout(() => {
                // Remove overlay
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                }, 400);
                
                // Scroll to the section with smooth behavior
                secretMessageSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Reset the navigation flag after animation completes
                setTimeout(() => {
                    // Reset any temporary styles
                    if (gridView) gridView.style.display = '';
                    if (horizontalScroll) horizontalScroll.style.display = '';
                    window.isNavigatingToCard = false;
                    
                    // Ensure gallery stays closed by permanently removing event listeners
                    // that could cause the gallery to reopen
                    clearGalleryEventListeners();
                }, 1000);
            }, 400);
        } else {
            overlay.remove();
            // Reset any temporary styles
            if (gridView) gridView.style.display = '';
            if (horizontalScroll) horizontalScroll.style.display = '';
            window.isNavigatingToCard = false;
            
            // Ensure gallery stays closed
            clearGalleryEventListeners();
        }
    };
    
    // Function to permanently remove gallery-related event listeners
    const clearGalleryEventListeners = () => {
        // Clone and replace the open gallery button to remove all event listeners
        if (openGalleryBtn) {
            const newBtn = openGalleryBtn.cloneNode(true);
            
            // Add a disabled click handler that does nothing
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            
            // Replace the original button
            if (openGalleryBtn.parentNode) {
                openGalleryBtn.parentNode.replaceChild(newBtn, openGalleryBtn);
            }
        }
        
        // Clear any scroll event listeners by cloning and replacing horizontal scroll
        if (horizontalScroll && horizontalScroll.parentNode) {
            const newScrollContainer = horizontalScroll.cloneNode(true);
            horizontalScroll.parentNode.replaceChild(newScrollContainer, horizontalScroll);
        }
        
        // Ensure they're permanently closed with inline styles
        if (gridView) {
            gridView.classList.remove('active');
            gridView.style.pointerEvents = 'none';
        }
        
        if (horizontalScroll) {
            horizontalScroll.classList.remove('active');
            horizontalScroll.style.pointerEvents = 'none';
        }
    };
    
    // Function to transition back to horizontal view
    const transitionToHorizontalView = () => {
        if (!gridView || !horizontalScroll) return;
        
        // Skip transition if we've already navigated to the card
        if (window.hasNavigatedToCard) return;
        
        gridView.classList.remove('active');
        
        // Reset grid item animations
        gridItems.forEach((item) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.animation = 'none';
        });
        
        setTimeout(() => {
            horizontalScroll.classList.add('active');
        }, 300);
    };
    
    // Add scroll event listener with debounce for better performance
    if (horizontalScroll) {
        let scrollTimeout;
        horizontalScroll.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(checkScrollPosition, 100);
        });
    }
    
    // Add click event to grid items to show larger preview
    gridItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event from bubbling up
            
            // Get the image source
            const img = item.querySelector('.gallery-img');
            if (!img) return;
            
            // Add blur effect to the content behind the overlay
            document.body.classList.add('blur-background');
            
            // Create full-screen overlay with image
            const overlay = document.createElement('div');
            overlay.className = 'image-preview-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'; // More transparent to see blur effect
            overlay.style.backdropFilter = 'blur(15px)'; // Stronger blur effect
            overlay.style.webkitBackdropFilter = 'blur(15px)'; // For Safari support
            overlay.style.zIndex = '1003';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            
            // Create large image with enhanced visual treatment
            const largeImg = document.createElement('img');
            largeImg.src = img.src;
            largeImg.style.maxWidth = '90%';
            largeImg.style.maxHeight = '90%';
            largeImg.style.objectFit = 'contain';
            largeImg.style.boxShadow = '0 0 40px rgba(255, 255, 255, 0.25)'; // Glowing effect
            largeImg.style.transform = 'scale(0.95)';
            largeImg.style.transition = 'transform 0.4s ease';
            largeImg.style.borderRadius = '8px';
            largeImg.style.filter = 'none'; // Ensure image is not blurred
            
            // Add a subtle zoom-in effect when overlay appears
            setTimeout(() => {
                largeImg.style.transform = 'scale(1)';
            }, 50);
            
            // Create close button
            const closeBtn = document.createElement('button');
            closeBtn.textContent = '×';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '20px';
            closeBtn.style.right = '20px';
            closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
            closeBtn.style.color = 'white';
            closeBtn.style.border = 'none';
            closeBtn.style.borderRadius = '50%';
            closeBtn.style.width = '40px';
            closeBtn.style.height = '40px';
            closeBtn.style.fontSize = '24px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.display = 'flex';
            closeBtn.style.justifyContent = 'center';
            closeBtn.style.alignItems = 'center';
            closeBtn.style.filter = 'none'; // Ensure button is not blurred
            
            // Close on button click
            closeBtn.addEventListener('click', () => {
                overlay.style.opacity = '0';
                largeImg.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    document.body.removeChild(overlay);
                    document.body.classList.remove('blur-background');
                }, 300);
            });
            
            // Close on background click
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.style.opacity = '0';
                    largeImg.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        document.body.removeChild(overlay);
                        document.body.classList.remove('blur-background');
                    }, 300);
                }
            });
            
            // Add to the page
            overlay.appendChild(largeImg);
            overlay.appendChild(closeBtn);
            document.body.appendChild(overlay);
            
            // Fade in after being added to DOM
            setTimeout(() => {
                overlay.style.opacity = '1';
            }, 10);
        });
    });
    
    // Handle responsive layout changes
    const handleResize = () => {
        if (!gridView || !horizontalScroll) return;
        
        // Force layout update
        if (gridView.classList.contains('active')) {
            horizontalScroll.classList.remove('active');
        } else if (horizontalScroll.classList.contains('active')) {
            gridView.classList.remove('active');
        }
    };
    
    // Optimize resize event with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
    });
    
    // Handle escape key to close gallery
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (horizontalScroll.classList.contains('active') || gridView.classList.contains('active')) {
                navigateToSpecialCard();
            }
        }
    });
}); 