// Add loading screen
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading';
    loadingScreen.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingScreen);

    // Simulate loading time
    setTimeout(() => {
        loadingScreen.classList.add('fade-out');
        setTimeout(() => loadingScreen.remove(), 500);
    }, 1000);
});

// Background music setup
const backgroundMusic = new Audio('tranquilness-ambient-healing-music-meditation-yoga-zen-112329.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.15; // Reduced to 15% volume for even more subtle effect

// Page flip sound effect
const pageFlipSound = new Audio('flipping-book-101929.mp3');
pageFlipSound.volume = 0.3;

// Sound toggle functionality
const soundToggle = document.getElementById('soundToggle');
let isSoundEnabled = false; // Start with sound disabled

// Initialize sound toggle
if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        isSoundEnabled = !isSoundEnabled;
        soundToggle.classList.toggle('active', isSoundEnabled);
        
        if (isSoundEnabled) {
            backgroundMusic.play().catch(error => {
                console.log('Playback prevented:', error);
                isSoundEnabled = false;
                soundToggle.classList.remove('active');
            });
        } else {
            backgroundMusic.pause();
        }
    });
}

// Journaling mode setup
const startJournalingBtn = document.getElementById('startJournaling');
const journalingMode = document.getElementById('journaling-mode');
const journalInput = document.getElementById('journalInput');
const aiResponse = document.getElementById('aiResponse');
const submitJournalBtn = document.querySelector('.submit-journal');

// Function to simulate typing effect
function typeText(element, text, speed = 30) {
    element.innerHTML = '';
    element.classList.add('typing');
    
    let i = 0;
    const typingInterval = setInterval(() => {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
        } else {
            clearInterval(typingInterval);
            element.classList.remove('typing');
        }
    }, speed);
}

// Function to show AI response with typing animation
function showAIResponse(text) {
    const responseContainer = document.querySelector('.ai-response-container');
    responseContainer.classList.add('visible');
    typeText(aiResponse, text);
}

// Function to show error message
function showError(message) {
    const responseContainer = document.querySelector('.ai-response-container');
    responseContainer.classList.add('visible');
    responseContainer.innerHTML = `<div class="error-message">${message}</div>`;
}

// Start journaling mode
startJournalingBtn.addEventListener('click', () => {
    // Start background music if enabled
    if (isSoundEnabled) {
        backgroundMusic.play();
    }
    
    // Hide welcome message and show journaling mode
    document.querySelector('.welcome-message').style.opacity = '0';
    
    // Play page flip sound after a short delay to match the transition
    setTimeout(() => {
        pageFlipSound.play();
    }, 300);
    
    // Show journaling mode after the sound starts
    setTimeout(() => {
        journalingMode.classList.add('active');
    }, 400);
    
    // Focus on input after animation
    setTimeout(() => {
        journalInput.focus();
    }, 1000);
});

// Handle journal submission
submitJournalBtn.addEventListener('click', async () => {
    const userInput = journalInput.value.trim();
    if (userInput) {
        // Disable the submit button and show loading state
        submitJournalBtn.disabled = true;
        submitJournalBtn.innerHTML = '<span class="spinner"></span> Processing...';
        
        try {
            // Send the journal entry to the backend
            const response = await fetch('http://localhost:3000/journal-entry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ entry: userInput })
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific error cases
                switch (data.code) {
                    case 'QUOTA_EXCEEDED':
                        showError("I'm receiving too many requests right now. Please try again in a few minutes.");
                        break;
                    case 'PERMISSION_DENIED':
                        showError("There's an issue with the AI service. Please contact support if this persists.");
                        break;
                    case 'ENTRY_TOO_LONG':
                        showError("Your journal entry is too long. Please keep it under 10,000 characters.");
                        break;
                    case 'MISSING_ENTRY':
                        showError("Please write something in your journal entry.");
                        break;
                    default:
                        showError(data.error || "I apologize, but I'm having trouble processing your entry right now. Please try again later.");
                }
                return;
            }

            if (!data.response) {
                throw new Error('No response received from AI');
            }
            
            // Show the AI response with typing animation
            showAIResponse(data.response);
            
            // Clear the input field
            journalInput.value = '';
        } catch (error) {
            console.error('Error:', error);
            showError("I apologize, but I'm having trouble processing your entry right now. Please try again later.");
        } finally {
            // Re-enable the submit button
            submitJournalBtn.disabled = false;
            submitJournalBtn.innerHTML = 'Send Entry';
        }
    }
});

// Form submission handling with improved UX
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('.submit-button');
        const originalText = submitButton.innerHTML;
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner"></span> Sending...';
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success state
            submitButton.innerHTML = 'Message Sent!';
            submitButton.style.backgroundColor = '#4CAF50';
            
            // Reset form and button after delay
            setTimeout(() => {
                submitButton.innerHTML = originalText;
                submitButton.style.backgroundColor = '';
                submitButton.disabled = false;
                this.reset();
            }, 3000);
        } catch (error) {
            // Show error state
            submitButton.innerHTML = 'Error! Try Again';
            submitButton.style.backgroundColor = '#f44336';
            
            // Reset button after delay
            setTimeout(() => {
                submitButton.innerHTML = originalText;
                submitButton.style.backgroundColor = '';
                submitButton.disabled = false;
            }, 3000);
        }
    });
}

// Intersection Observer for enhanced animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('service-card')) {
                entry.target.style.setProperty('--index', entry.target.dataset.index);
            }
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements with staggered animation
document.querySelectorAll('.service-card').forEach((card, index) => {
    card.dataset.index = index;
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(card);
});

// Enhanced parallax effect
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;
    
    if (hero) {
        hero.style.backgroundPositionY = -(scrolled * parallaxSpeed) + 'px';
    }
});

// Mouse move parallax effect
document.addEventListener('mousemove', (e) => {
    const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
    
    const ambientBg = document.querySelector('.ambient-bg');
    if (ambientBg) {
        ambientBg.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
});

// Accessibility features
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('user-is-tabbing');
});

// Add event listeners for page transitions
document.querySelectorAll('a').forEach(link => {
    if (link.href && !link.href.startsWith('#')) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            handlePageTransition();
            setTimeout(() => {
                window.location.href = link.href;
            }, 500);
        });
    }
});

// Page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar scroll effect with improved performance
let lastScroll = 0;
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scrolled');
        return;
    }
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }
    
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Add hover effect to service cards with improved performance
document.querySelectorAll('.service-card').forEach(card => {
    let timeout;
    
    card.addEventListener('mouseenter', () => {
        clearTimeout(timeout);
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        timeout = setTimeout(() => {
            card.style.transform = 'translateY(0) scale(1)';
        }, 100);
    });
});

// Add page transition effect
const pageTransition = document.createElement('div');
pageTransition.className = 'page-transition';
document.body.appendChild(pageTransition);

// Handle page transitions
function handlePageTransition() {
    pageTransition.classList.add('active');
    setTimeout(() => {
        pageTransition.classList.remove('active');
    }, 500);
} 
