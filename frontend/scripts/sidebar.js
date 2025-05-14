document.addEventListener('DOMContentLoaded', () => {
    console.log("Sidebar initializing (sidebar.js)..."); 

    const supabaseClient = window.supabaseClient;
    if (!supabaseClient) {
       
        console.error("FATAL ERROR: Supabase client not found in sidebar.js. Ensure supabase-config.js and its initialization run before sidebar.js.");
       
        return;
    }

    const sidebar = document.querySelector('.sidebar');
    const menuToggleBtn = document.querySelector('.menu-toggle-btn');
    const sidebarNavLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    const dashboardSections = document.querySelectorAll('.dashboard-section'); 
    const logoutBtn = document.querySelector('.sidebar-footer .logout-link'); 

    let initialHash = window.location.hash.slice(1); 
    let storedSection = localStorage.getItem('currentSection');
    let currentSection = 'home-section'; 

    
    if (initialHash && [...dashboardSections].some(section => section.id === initialHash)) {
        
        currentSection = initialHash;
    } else if (storedSection && [...dashboardSections].some(section => section.id === storedSection)) {
       
        currentSection = storedSection;
    }
    
    console.log(`Sidebar Init: Determined initial section = ${currentSection}`); 
    let isMobile = window.innerWidth <= 768;
    let isSidebarOpen = !isMobile; 

    /**
     * Updates the application state (current section variable, localStorage)
     * and triggers a UI update. Ensures the target section exists.
     * @param {string} sectionId - The ID of the section to activate.
     */
    function updateSectionState(sectionId) {
        
        if (![...dashboardSections].some(section => section.id === sectionId)) {
            console.warn(`Sidebar: Attempted to navigate to non-existent section: ${sectionId}. Defaulting to home.`);
            sectionId = 'home-section'; 
        }
        console.log('Sidebar: Updating section state to:', sectionId); 
        currentSection = sectionId;
        localStorage.setItem('currentSection', sectionId); 
        updateUI(); 
    }


    function updateUI() {
  
        dashboardSections.forEach(section => {
            section.classList.toggle('active', section.id === currentSection);
        });

        sidebarNavLinks.forEach(link => {
            const targetSection = link.getAttribute('data-target');
            const isActive = targetSection === currentSection;
            link.classList.toggle('active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'page'); 
            } else {
                link.removeAttribute('aria-current');
            }
        });

        document.body.classList.toggle('sidebar-open', isSidebarOpen);

        if (menuToggleBtn) {
            menuToggleBtn.setAttribute('aria-label', isSidebarOpen ? 'Close Menu' : 'Open Menu');
            menuToggleBtn.setAttribute('aria-expanded', isSidebarOpen.toString());
        }
    }

    /**
     * Handles clicks on sidebar navigation links.
     * Prevents default navigation, updates the state and URL hash,
     * and closes the sidebar on mobile.
     * @param {Event} e - The click event object.
     */
    function handleNavClick(e) {
        e.preventDefault(); 
        const targetSection = e.currentTarget.getAttribute('data-target');
        console.log('Sidebar: Nav click detected for target:', targetSection); 

        if (targetSection) {
            updateSectionState(targetSection); 

            if (isMobile && isSidebarOpen) {
                toggleSidebar(false); 
            }

            const newHash = `#${targetSection}`;
            if (newHash !== window.location.hash) {
                history.pushState({ section: targetSection }, '', newHash);
            }
        } else {
            console.warn("Sidebar: Nav link clicked without data-target attribute:", e.currentTarget);
        }
    }

    /**
     * Toggles the sidebar's open/closed state, primarily for mobile view.
     * Can be forced to a specific state.
     * @param {boolean} [force] - Optional. If true, forces open; if false, forces closed.
     */
    function toggleSidebar(force) {
        const previousState = isSidebarOpen;
       
        isSidebarOpen = force !== undefined ? force : !isSidebarOpen;

        if (isSidebarOpen !== previousState) {
            console.log('Sidebar: Toggling sidebar. New state:', isSidebarOpen ? 'open' : 'closed'); 
            updateUI();
        }
    }

    /**
     * Handles the click event on the Logout button.
     * Calls Supabase signout, handles errors, and clears local state.
     * Relies on the onAuthStateChange listener in script.js to handle redirection.
     * @param {Event} e - The click event object.
     */
    async function handleLogout(e) {
        e.preventDefault();
        console.log('Sidebar: Logout button clicked. Initiating logout...'); 

        if (logoutBtn) {
            logoutBtn.disabled = true;
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...'; 
        }

        try {
            console.log('Sidebar: Calling supabaseClient.auth.signOut()...'); 
            const { error } = await supabaseClient.auth.signOut();
            console.log('Sidebar: supabaseClient.auth.signOut() completed.', { error }); 

            if (error) {
                
                console.error('Sidebar: Error signing out:', error.message);
                alert('Error signing out. Please try again.');
                if (logoutBtn) {
                    logoutBtn.disabled = false; 
                    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout'; 
                }
                return; 
            }

            console.log("Sidebar: Supabase sign out successful. Clearing local state..."); 
            localStorage.removeItem('currentSection'); 

            console.log("Sidebar: Logout handler finished. Redirect should occur via auth listener in script.js.");

        } catch (error) {
            
            console.error('Sidebar: CATCH block error during logout:', error); 
            alert('An unexpected error occurred during logout.');
            if (logoutBtn) {
                logoutBtn.disabled = false; 
                logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout'; 
            }
        }
    }

    function handleResize() {
        const previouslyMobile = isMobile;
        isMobile = window.innerWidth <= 768;
        if (isMobile !== previouslyMobile) {
             console.log(`Sidebar: Resize detected. Switched to ${isMobile ? 'mobile' : 'desktop'} view.`);
        }
    }

    /**
     * Handles browser back/forward navigation (popstate event).
     * Reads the target section from the hash and updates the UI.
     * @param {PopStateEvent} event - The popstate event object.
     */
     function handlePopState(event) {
        console.log("Sidebar: popstate event detected", event.state);
        let sectionFromHash = window.location.hash.slice(1);
        // Use the hash as the primary source, fallback to event.state if needed, then default
        let targetSection = sectionFromHash || event.state?.section || 'home-section';
        updateSectionState(targetSection);
    }

    sidebarNavLinks.forEach(link => {
        console.log('Sidebar: Attaching nav click listener to:', link.getAttribute('data-target')); 
        link.addEventListener('click', handleNavClick);
    });

    if (menuToggleBtn) {
        console.log('Sidebar: Attaching toggle listener to menuToggleBtn'); 
        menuToggleBtn.addEventListener('click', () => toggleSidebar()); 
    } else {
        console.warn("Sidebar: Mobile menu toggle button (.menu-toggle-btn) not found.");
    }

    if (logoutBtn) {
        console.log('Sidebar: Attaching logout click listener to logoutBtn'); 
        logoutBtn.addEventListener('click', handleLogout);
    } else {
        console.error("Sidebar: Logout button (.sidebar-footer .logout-link) not found! Check selector/HTML.");
    }

    
    let resizeTimeout;
    window.addEventListener('resize', () => {
       
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 150);
    });

    window.addEventListener('popstate', handlePopState);

    function init() {
        console.log('Sidebar: Running init...');
        updateUI(); 
        console.log('Sidebar: Initialization complete.');
    }

    init(); 

});  