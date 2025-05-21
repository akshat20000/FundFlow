# FundFlow - Modern Digital Wallet & Web3 Integration Prototype

This repository contains the frontend code (HTML, CSS, JavaScript) for the FundFlow project. It provides a functional user interface for a modern digital wallet application, integrated with Supabase for backend services and MetaMask for simulated Ethereum-based fund additions.

## Project Goal

To create a user-friendly and visually appealing digital wallet prototype that demonstrates:
*   Core wallet functionalities (balance management, transaction history, P2P transfers, fund addition).
*   Real-time backend integration using Supabase (PostgreSQL, Auth, RPC Functions).
*   Simulated Web3 payment integration using MetaMask, Solidity smart contracts, and the Ethereum (Holesky) testnet.
*   Modern frontend development practices with HTML, CSS, and Vanilla JavaScript.

## Features (Current Implementation)

*   **Secure User Authentication:**
    *   User Sign-Up with email, password, and username (stored in metadata).
    *   Email confirmation required for new accounts.
    *   User Sign-In.
    *   Secure Logout.
*   **Dashboard:**
    *   Displays current wallet balance in real-time.
    *   Shows user profile card with name, UPI ID (simulated), and phone number.
    *   Snippets for recent transactions and frequent contacts.
*   **Fund Management & Payments:**
    *   **Add Money:**
        *   Multi-stage modal for adding funds.
        *   Simulated payment gateway with various options (Credit Card, Net Banking, PayPal placeholders).
        *   **MetaMask Integration:** Allows users to "deposit" funds by sending testnet ETH (Holesky) to a deployed Solidity smart contract. The successful blockchain transaction updates the user's FundFlow balance in Supabase.
    *   **Send Money (Peer-to-Peer):**
        *   Form to send simulated funds to another FundFlow user (identified by email/username).
        *   Handled by a secure Supabase RPC function that performs balance checks and atomic updates for both sender and receiver.
    *   **Log Transaction:** Manually log income or expenses.
*   **Transaction History:**
    *   Dedicated "Activity" section displaying a full, sortable transaction history for the user.
    *   Transactions are logged for fund additions, P2P transfers, manual logs, and group contributions/withdrawals.
*   **Contact Management:**
    *   Add new contacts by specifying a name and their registered FundFlow email.
    *   System verifies if the email corresponds to an existing FundFlow user before adding.
    *   View and search contacts.
    *   Quick "Send" option from contact lists, pre-filling the Send Money form.
*   **Group Contributions (Shared Expenses):**
    *   Create groups and add members from existing contacts.
    *   Contribute funds from the personal FundFlow wallet to a group.
    *   Withdraw previously contributed funds from a group back to the personal wallet.
    *   View group members and their individual contributions.
    *   All group-related financial actions are handled by Supabase RPC functions and logged.
*   **User Profile & Settings:**
    *   View and update personal information (Full Name, Phone Number). Email and Username are display-only after registration.
*   **Responsive UI:**
    *   Styled using modern CSS techniques (Custom Properties, Gradients, Flexbox, Grid).
    *   Mobile-responsive design with a toggleable sidebar.
    *   Subtle animations and transitions for an enhanced user experience.
    *   Modals for various actions (Add Money, Log Transaction, Add Contact, Create Group, Contribute/Withdraw from Group).

## Tech Stack

*   **Frontend:**
    *   **HTML5:** Semantic structure.
    *   **CSS3:** Styling, layout, responsiveness, animations.
    *   **JavaScript (Vanilla):** DOM manipulation, event handling, API calls, UI logic.
    *   **Ethers.js:** For interacting with the Ethereum blockchain via MetaMask.
    *   **jQuery & EasyResponsiveTabs:** For tabbed interface in the payment gateway.
    *   **Google Fonts (Poppins):** Typography.
    *   **Font Awesome:** Icons.
    *   **(Optional if used) AOS (Animate on Scroll):** For scroll animations on the landing page.
*   **Backend (BaaS - Backend as a Service):**
    *   **Supabase:**
        *   **Authentication:** Manages user sign-up, sign-in, and sessions.
        *   **PostgreSQL Database:** Stores user profiles, transactions, contacts, groups, group members, and group transactions.
        *   **Realtime:** (Potentially used, or can be leveraged for instant updates).
        *   **RPC Functions (PL/pgSQL):** Secure server-side logic for critical operations like transferring funds, adding funds after blockchain confirmation, group creation, and group contributions/withdrawals.
        *   **Row Level Security (RLS):** To secure data access at the database level.
*   **Blockchain (Simulation & Testnet):**
    *   **Solidity:** Language for writing the smart contract (for deposits).
    *   **Ethereum (Holesky Testnet):** The blockchain network where the smart contract is deployed and transactions are simulated.
    *   **MetaMask:** Browser extension wallet for users to interact with the smart contract (sign transactions).
    *   **Remix IDE (Development):** For writing, testing, and deploying the Solidity smart contract.

## Project Structure (Simplified)

frontend
|-- index.html # Main dashboard page
|-- auth.html # Container for signin/signup (or separate files)
|-- signin.html # Sign-in page
|-- signup.html # Sign-up page
|-- landing.html # Project landing page
|-- _paymentPage.html # HTML snippet for payment gateway options
|
|-- /styles
| |-- style.css # Main dashboard styles
| |-- sidebar.css # Sidebar specific styles
| |-- payment.css # Payment gateway modal styles
| |-- auth-style.css # Styles for signin/signup pages
| |-- landing-style.css # Styles for landing page
|
|-- /scripts
| |-- script.js # Main dashboard JavaScript logic
| |-- sidebar.js # Sidebar navigation and toggle logic
| |-- auth.js # Sign-in and Sign-up logic
| |-- landing-script.js # JavaScript for the landing page
| |-- supabase-config.js # Supabase client initialization
| |-- jquery.min.js # jQuery library
| |-- easyResponsiveTabs.js # Tabs plugin
|
|-- /images # For logos, mockups, etc.
| |-- FUNDFLOW_LOGO.png
| |-- fundflow-techused.png


## Setup & Running

1.  **Supabase Setup:**
    *   Create a Supabase project.
    *   Set up your database schema: `profiles`, `transactions`, `contacts`, `groups`, `group_members`, `group_transactions` tables with appropriate columns and foreign keys.
    *   Implement Row Level Security (RLS) policies for these tables.
    *   Create the required PL/pgSQL RPC functions (`add_funds_and_log`, `log_transaction_and_update_balance`, `transfer_funds`, `create_group_with_members`, `contribute_to_group`, `withdraw_from_group`) in the Supabase SQL Editor.
    *   Update `scripts/supabase-config.js` with your Supabase Project URL and Anon Key.
2.  **Smart Contract Deployment (Holesky Testnet):**
    *   Write/compile your Solidity smart contract (e.g., for deposits).
    *   Deploy it to the Holesky testnet using Remix IDE and MetaMask.
    *   Note the deployed contract address and its ABI.
    *   Update `WALLET_CONTRACT_ADDRESS` and `WALLET_CONTRACT_ABI` constants in `scripts/script.js`.
3.  **Frontend Setup:**
    *   Clone this repository or download the files.
    *   Ensure all files are in their correct directory structure.
4.  **Running the Application:**
    *   Use a live server extension (like "Live Server" in VS Code) to serve the `frontend` directory.
    *   Open `landing.html` or navigate directly to `signin.html` / `signup.html` to start.
    *   After successful login/signup, you will be redirected to `index.html` (the dashboard).

No complex build steps are required for this frontend setup. Ensure your browser has the MetaMask extension installed for Web3 features.