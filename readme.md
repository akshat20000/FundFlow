# Badass Digital Wallet - Frontend

This repository contains the frontend code (HTML, CSS, JavaScript) for the Badass Digital Wallet project. It provides the initial user interface structure, styling, and basic interactivity for a modern digital wallet application.

## Project Goal

To create a visually appealing ("vibrant" and "badass"), user-friendly frontend for a digital wallet, ready for integration with a Python backend and a custom payment gateway.

## Features (Current Frontend Implementation)

*   **Displays Current Balance:** Shows the user's wallet balance prominently.
*   **Action Buttons:** Provides buttons for key actions:
    *   Add Money
    *   Send Money (Placeholder)
    *   View History (Placeholder)
*   **Transaction History:** A section to list recent transactions (currently shows a placeholder or simulated data).
*   **Add Money Modal:** A pop-up form allows users to enter the amount they wish to add. Basic form validation is included.
*   **Vibrant UI:** Styled using modern CSS techniques including:
    *   CSS Custom Properties (Variables) for easy theming.
    *   Gradients for backgrounds and text effects.
    *   Flexbox for layout.
    *   Transitions and subtle animations for interactive elements.
    *   Responsive design for usability on different screen sizes.
    *   Glassmorphism effect on the modal overlay (`backdrop-filter`).
*   **Basic Interactivity:** JavaScript handles showing/hiding the modal and simulates adding funds (for UI demo purposes only).

**Note:** This frontend currently lacks backend integration. All data (balance, transactions) is temporary and simulated in the JavaScript for demonstration. No real transactions or data storage occur yet.

## Tech Stack (Frontend)

*   **HTML5:** Semantic structure for the web page content.
*   **CSS3:** Styling the appearance, including advanced features like gradients, variables, transitions, and flexbox.
*   **JavaScript (Vanilla):** Handling DOM manipulation, event listening, and basic UI logic (modal interaction).
*   **Google Fonts (Poppins):** For modern typography.
*   **Font Awesome:** For icons.

## Planned Future Development (Backend & Integration)

*   **Backend:** Python (using Flask).
*   **Database:** MySQL or MongoDB.
*   **API:** RESTful APIs built with Python/Flask to connect frontend and backend.
*   **Payment Gateway Integration:** Integrate the user's custom payment gateway for adding funds securely.
*   **Authentication:** Implement secure user login and registration.
*   **Real Transactions:** Implement backend logic for sending/receiving money and storing transaction history persistently.
*   **Security:** Implement HTTPS, data encryption, and other security best practices.

## Setup & Running

1.  Clone this repository or download the files (`index.html`, `style.css`, `script.js`).
2.  Ensure all three files are in the same directory.
3.  Open the `index.html` file in your web browser.

No build steps or dependencies are required for this initial frontend setup.

## Project Structure