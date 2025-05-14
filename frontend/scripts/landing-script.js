document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const header = document.querySelector('.main-header'); // Select header for scroll effect

    // --- Mobile Menu ---
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active'); // Toggle the 'active' class

            // Change hamburger icon to 'X' and vice versa
            const icon = menuToggle.querySelector('i');
            if (mobileMenu.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close mobile menu when a link inside it is clicked
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                menuToggle.setAttribute('aria-expanded', 'false');
                // Smooth scroll logic will handle the jump if it's an anchor link
            });
        });
    }

    // --- Header Background on Scroll ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // Add background after scrolling down 50px
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Allow default behavior for non-anchor links or placeholder '#'
            if (href === '#') {
                e.preventDefault(); // Prevent jumping to top for placeholder '#'
                return;
            }

            // Check if target element exists
            try {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault(); // Prevent default jump ONLY if target exists
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start' // Scrolls so the top of the target aligns with the top of the viewport
                    });
                }
                // If targetElement is null, let the default browser behavior happen (might be a link off-page)
            } catch (error) {
                 console.warn("Smooth scroll target not found or invalid selector:", href, error);
                 // Let default behavior happen
            }
        });
    });

    // --- Initialize AOS (Animate on Scroll) ---
    // Ensure you included the AOS CSS and JS files in your HTML
    try {
        AOS.init({
            duration: 800, // Animation duration in ms
            once: true, // Whether animation should happen only once - while scrolling down
            offset: 100, // Offset (in px) from the original trigger point
            easing: 'ease-in-out', // Default easing
        });
        console.log("AOS Initialized");
    } catch (e) {
        console.error("AOS Initialization failed. Ensure library is included.", e);
    }

});