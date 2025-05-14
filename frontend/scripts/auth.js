document.addEventListener('DOMContentLoaded', () => {
    const supabase = window.supabaseClient;
    if (!supabase) {
        console.error("Supabase client not initialized. Make sure supabase-config.js runs first.");
        alert("Error: Application configuration failed. Please refresh or contact support.");
        return; 
    }
    console.log("auth.js loaded for path:", window.location.pathname);
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
        signInForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log("Sign In form submitted");

            const identifierErrorEl = document.getElementById('identifierError'); 
            const passwordErrorEl = document.getElementById('passwordError'); 
            if (identifierErrorEl) identifierErrorEl.style.display = 'none';
            if (passwordErrorEl) passwordErrorEl.style.display = 'none';

           
            const email = document.getElementById('identifier').value; 
            const password = document.getElementById('password').value;
            const submitButton = signInForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

          
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

            try {
                console.log("Attempting Supabase sign in with email:", email);
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                if (error) {
                    console.error('Supabase Sign In Error:', error.message);
                     if (passwordErrorEl) {
                       
                         if (error.message.includes("Invalid login credentials")) {
                            passwordErrorEl.textContent = 'Invalid email or password.';
                         } else if (error.message.includes("Email not confirmed")) {
                             passwordErrorEl.textContent = 'Please confirm your email address first. Check your inbox.';
                         } else {
                             passwordErrorEl.textContent = 'Login failed. Please try again.'; 
                         }
                        passwordErrorEl.style.display = 'block';
                    } else {
                        
                        alert(`Login failed: ${error.message}`);
                    }
                    throw error; 
                }

                if (data.user && data.session) {
                    console.log("Supabase Sign In successful:", data);
                    console.log("Redirecting to index.html from auth.js...");
                    window.location.href = 'index.html';

                } else {
                    console.error("Sign in seemed successful but no user/session data received.");
                    throw new Error("Login succeeded but failed to retrieve session data.");
                }

            } catch (error) {
                console.error('Error during sign in process:', error);
                if (passwordErrorEl && (!passwordErrorEl.textContent || passwordErrorEl.style.display === 'none')) {
                    passwordErrorEl.textContent = 'An unexpected error occurred. Please try again.';
                    passwordErrorEl.style.display = 'block';
                } else if (!passwordErrorEl) {
                    alert('An unexpected error occurred during login.');
                }
            } finally {
                 if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                 }
            }
        });
    }
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log("Sign Up form submitted"); 

            const usernameErrorEl = document.getElementById('usernameError');
            const emailErrorEl = document.getElementById('emailError');
            const passwordErrorEl = document.getElementById('passwordError');
            const confirmPasswordErrorEl = document.getElementById('confirmPasswordError');
            if (usernameErrorEl) usernameErrorEl.style.display = 'none';
            if (emailErrorEl) emailErrorEl.style.display = 'none';
            if (passwordErrorEl) passwordErrorEl.style.display = 'none';
            if (confirmPasswordErrorEl) confirmPasswordErrorEl.style.display = 'none';

            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const submitButton = signUpForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            if (password !== confirmPassword) {
                if (confirmPasswordErrorEl) {
                    confirmPasswordErrorEl.textContent = 'Passwords do not match.';
                    confirmPasswordErrorEl.style.display = 'block';
                } else { alert('Passwords do not match.'); }
                return; 
            }
            if (password.length < 6) {
                if (passwordErrorEl) {
                    passwordErrorEl.textContent = 'Password must be at least 6 characters long.';
                    passwordErrorEl.style.display = 'block';
                } else { alert('Password must be at least 6 characters long.'); }
                return; 
            }
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

            try {
                console.log("Attempting Supabase sign up for email:", email);

                const signUpOptions = {
                    data: { 
                        username: username
                    }
                };

                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                    options: signUpOptions
                });

                if (error) {
                    console.error('Supabase Sign Up Error:', error); 
                    let specificErrorHandled = false;

                    if (error.message.toLowerCase().includes("user already registered")) {
                        if (emailErrorEl) {
                            emailErrorEl.textContent = 'This email address is already registered.';
                            emailErrorEl.style.display = 'block';
                            specificErrorHandled = true;
                        } else { alert('This email address is already registered.'); }
                    } else if (error.message.toLowerCase().includes("password should be at least 6 characters")) {
                         if (passwordErrorEl) {
                             passwordErrorEl.textContent = 'Password must be at least 6 characters long.';
                             passwordErrorEl.style.display = 'block';
                             specificErrorHandled = true;
                         } else { alert('Password must be at least 6 characters long.'); }
                    } else if (error.message.toLowerCase().includes("valid email address")) {
                        if (emailErrorEl) {
                            emailErrorEl.textContent = 'Please enter a valid email address.';
                            emailErrorEl.style.display = 'block';
                            specificErrorHandled = true;
                        } else { alert('Please enter a valid email address.'); }
                    }
                    if (!specificErrorHandled) {
                         if (emailErrorEl) { 
                            emailErrorEl.textContent = error.message || 'Sign up failed. Please try again.';
                            emailErrorEl.style.display = 'block';
                        } else { alert(`Sign up failed: ${error.message}`); }
                    }
                    throw error; 
                }

                console.log("Supabase Sign Up successful (user created):", data);

                if (data.user && !data.session) {

                    console.log("User requires email confirmation.");
                    const container = document.querySelector('.auth-container');
                    if (container) {
                         signUpForm.style.display = 'none'; 
                         const successMessageDiv = document.createElement('div');
                         successMessageDiv.className = 'auth-success-message'; 
                         successMessageDiv.innerHTML = `
                             <i class="fas fa-check-circle" style="color: var(--positive); font-size: 2em; margin-bottom: 15px;"></i>
                             <h3>Account Created!</h3>
                             <p>Please check your email inbox (and spam folder) for <strong>${email}</strong> to find the confirmation link.</p>
                             <p>Click the link in the email to activate your account before signing in.</p>
                             <br/>
                             <a href="signin.html" class="action-btn" style="width: auto; padding: 10px 20px;">Go to Sign In</a>
                         `;
                         successMessageDiv.style.textAlign = 'center';
                         successMessageDiv.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
                         successMessageDiv.style.padding = '20px';
                         successMessageDiv.style.borderRadius = '8px';
                         successMessageDiv.style.border = '1px solid var(--positive)';

                         const authLinksDiv = document.querySelector('.auth-links');
                         if(authLinksDiv) {
                             container.insertBefore(successMessageDiv, authLinksDiv);
                         } else {
                             container.appendChild(successMessageDiv); 
                         }
                    } else {
                         alert(`Account created! Please check your email (${email}) to confirm your account before signing in.`);
                         window.location.href = 'signin.html'; 
                    }

                } else if (data.user && data.session) {
                    console.log("User signed up and logged in (Email Confirmation likely disabled).");
                    alert('Sign up successful! You are now logged in.'); 
                    window.location.href = 'index.html'; 
                } else {
                     console.error("Sign up response in unexpected state (no user/session data):", data);
                     throw new Error("Sign up process completed in an unexpected state.");
                }

            } catch (error) {
                console.error('Error during sign up process:', error);
                 if (emailErrorEl && (!emailErrorEl.style.display || emailErrorEl.style.display === 'none') &&
                     passwordErrorEl && (!passwordErrorEl.style.display || passwordErrorEl.style.display === 'none') &&
                     confirmPasswordErrorEl && (!confirmPasswordErrorEl.style.display || confirmPasswordErrorEl.style.display === 'none'))
                 {
                      const genericError = document.createElement('div');
                      genericError.className = 'error-message';
                      genericError.style.display = 'block';
                      genericError.style.textAlign = 'center';
                      genericError.style.marginTop = '15px'; 
                      genericError.textContent = `Sign up failed: ${error.message}`;
                      if(submitButton) {
                          submitButton.parentNode.insertBefore(genericError, submitButton.nextSibling);
                      } else {
                           signUpForm.appendChild(genericError);
                      }
                 }
            } finally {
                 if (signUpForm.style.display !== 'none' && submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }
            }
        });
    }

}); 