console.log("Attempting to run supabase-config.js..."); 

if (typeof SUPABASE_URL === 'undefined') {
    const SUPABASE_URL = 'https://izbzygsalvqzmhhljqbs.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6Ynp5Z3NhbHZxem1oaGxqcWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNzMzNTcsImV4cCI6MjA4OTg0OTM1N30.WZk7bPPEuQTHOWu4EwhBqmDBP1ufjbOEuGoHP-aDavw'; // <-- YOUR ANON KEY HERE

    try {
       
        if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
            const supabaseInstance = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

            window.supabaseClient = supabaseInstance;

            console.log("supabase-config.js executed successfully. window.supabaseClient is set.");
        } else {
             console.error("Supabase library (global 'supabase' object) not found. Ensure the Supabase CDN script is loaded BEFORE supabase-config.js.");
             alert("Critical Error: Supabase library failed to load.");
        }
    } catch (error) {
        console.error("Error initializing Supabase client in supabase-config.js:", error);
        alert("Error: Failed to initialize application configuration.");
    }
} else {
    console.warn("supabase-config.js: Variables already declared. Script might be running multiple times.");
    
    if (!window.supabaseClient) {
         console.error("supabase-config.js: Script ran multiple times, but window.supabaseClient is STILL not set!");
    }
}


