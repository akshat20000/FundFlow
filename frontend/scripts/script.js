document.addEventListener('DOMContentLoaded', async () => {
    console.log("Dashboard initializing (script.js)...");
    const supabaseClient = window.supabaseClient;
    if (!supabaseClient) {
        console.error("FATAL ERROR: Supabase client not found. Ensure supabase-config.js runs correctly.");
        alert("Application initialization failed. Please refresh.");
        document.body.innerHTML = '<p style="color:red; text-align:center; padding-top: 50px;">Application failed to load. Check console.</p>';
        return; 
    }

    let provider;
    try {
        if (typeof window.ethers === 'undefined') {
            console.error("Ethers.js not found! Make sure to include ethers.js in your HTML.");
          
             const ethersScript = document.createElement('script');
            ethersScript.src = 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js';
            ethersScript.async = true;
            ethersScript.onload = () => {
                console.log("Ethers.js loaded from CDN");
                initializeProvider();
            };
            ethersScript.onerror = () => {
                console.error("Failed to load ethers.js from fallback CDN");
                alert("Failed to load required dependencies. Some features may not work.");
            };
            document.head.appendChild(ethersScript);
        } else {
            initializeProvider();
        }
    } catch (error) {
        console.error("Error initializing ethers:", error);
        alert("Failed to initialize Web3 provider. Some features may not work.");
    }

    function initializeProvider() {
        try {
            if (window.ethereum) {
                provider = new window.ethers.providers.Web3Provider(window.ethereum);
                console.log("Ethers provider initialized successfully");
            } else {
                console.log("No ethereum provider found - some features will be limited");
            }
        } catch (err) {
            console.error("Error in provider initialization:", err);
        }
    }

    const balanceAmountEl = document.getElementById('balance-amount');
    const addMoneyBtn = document.getElementById('addMoneyBtn');
    const addMoneyModal = document.getElementById('addMoneyModal');
    const closeModalBtn = document.getElementById('closeModalBtn'); 
    const amountToAddInput = document.getElementById('amountToAdd');
    const modalStageAmount = document.getElementById('modalStageAmount');
    const modalStagePayment = document.getElementById('modalStagePayment');
    const modalStageSuccess = document.getElementById('modalStageSuccess');
    const paymentGatewayLoading = document.getElementById('paymentGatewayLoading');
    const paymentGatewayContent = document.getElementById('paymentGatewayContent');
    const modalBackToAmountBtn = document.getElementById('modalBackToAmountBtn');
    const addMoneyForm = document.getElementById('addMoneyForm'); 

    const homeTransactionList = document.getElementById('transaction-list-home');
    const fullTransactionList = document.getElementById('full-transaction-list');
    const paymentHistoryList = document.getElementById('payment-history-list');
    const contactListFull = document.getElementById('contact-list-full');
    const contactSearchInput = document.getElementById('contactSearch');
    const quickContactList = document.getElementById('quick-contact-list');
    const addContactBtn = document.querySelector('#contacts-section .action-btn'); 
    const profileForm = document.getElementById('profileForm');
    const profileNameInput = document.getElementById('profileName');
    const profileUsernameInput = document.getElementById('profileUsername');
    const profileEmailInput = document.getElementById('profileEmail');
    const profilePhoneInput = document.getElementById('profilePhone');
    const addTransactionModal = document.getElementById('addTransactionModal');
    const closeTransactionModalBtn = document.getElementById('closeTransactionModalBtn');
    const addTransactionForm = document.getElementById('addTransactionForm');
    const transactionTypeInput = document.getElementById('transactionType');
    const transactionAmountInput = document.getElementById('transactionAmount');
    const transactionDescriptionInput = document.getElementById('transactionDescription');
    const openTransactionModalBtn = document.getElementById('openTransactionModalBtn');
    const sendMoneyForm = document.getElementById('sendMoneyForm');
    const recipientInput = document.getElementById('recipient');
    const sendAmountInput = document.getElementById('sendAmount');
    const sendNoteInput = document.getElementById('sendNote');

    const addContactModal = document.getElementById('addContactModal');
    const closeAddContactModalBtn = document.getElementById('closeAddContactModalBtn');
    const addContactFormModal = document.getElementById('addContactFormModal');
    const contactNameInput = document.getElementById('contactNameInput');
    const contactDetailInput = document.getElementById('contactDetailInput'); 
    const contactModalError = document.getElementById('contactModalError');
    const submitAddContactBtn = document.getElementById('submitAddContactBtn');

    const createGroupBtn = document.getElementById('createGroupBtn');
    const createGroupModal = document.getElementById('createGroupModal');
    const closeCreateGroupModalBtn = document.getElementById('closeCreateGroupModalBtn');
    const createGroupForm = document.getElementById('createGroupForm');
    const groupNameInput = document.getElementById('groupNameInput');
    const groupMembersSelect = document.getElementById('groupMembersSelect');
    const createGroupError = document.getElementById('createGroupError');
    const submitCreateGroupBtn = document.getElementById('submitCreateGroupBtn');
    const groupListUl = document.getElementById('group-list'); 
    const contributeGroupModal = document.getElementById('contributeGroupModal');
    const closeContributeGroupModalBtn = document.getElementById('closeContributeGroupModalBtn');
    const contributeGroupForm = document.getElementById('contributeGroupForm');
    const contributeGroupName = document.getElementById('contributeGroupName');
    const contributeGroupIdInput = document.getElementById('contributeGroupIdInput');
    const contributionAmountInput = document.getElementById('contributionAmountInput');
    const contributeModalUserBalance = document.getElementById('contributeModalUserBalance');
    const contributeGroupError = document.getElementById('contributeGroupError');
    const submitContributeGroupBtn = document.getElementById('submitContributeGroupBtn');
        const withdrawGroupModal = document.getElementById('withdrawGroupModal');
        const closeWithdrawGroupModalBtn = document.getElementById('closeWithdrawGroupModalBtn');
        const withdrawGroupForm = document.getElementById('withdrawGroupForm');
        const withdrawGroupName = document.getElementById('withdrawGroupName');
        const withdrawGroupIdInput = document.getElementById('withdrawGroupIdInput');
        const withdrawalAmountInput = document.getElementById('withdrawalAmountInput');
        const withdrawModalUserContribution = document.getElementById('withdrawModalUserContribution');
        const withdrawModalUserBalance = document.getElementById('withdrawModalUserBalance');
        const withdrawGroupError = document.getElementById('withdrawGroupError');
        const submitWithdrawGroupBtn = document.getElementById('submitWithdrawGroupBtn');


    let currentBalance = 0.00;
    let transactions = [];
    let contacts = [];
    let currentUser = null;
    let currentProfile = null;
    let currentAddAmount = 0; 
    let currentAddAmountEth = 0; 
    let connectedAccount = null;
    let userGroups = [];  


    const WALLET_CONTRACT_ADDRESS = '0x86F9f9425BB6Fe671487472ad864531556b8ADec';
    const WALLET_CONTRACT_ABI = [
        "function deposit() public payable",
        "function transfer(address to, uint256 amount) public",
        "function withdraw(uint256 amount) public",
        "function getBalance() public view returns (uint256)",
        "function getContractBalance() public view returns (uint256)",
        "event Deposit(address indexed user, uint256 amount)",
        "event Transfer(address indexed from, address indexed to, uint256 amount)",
        "event Withdrawal(address indexed user, uint256 amount)"
    ];

    const HOLESKY_CHAIN_ID = '0x4268'; 
    const HOLESKY_RPC_URL = 'https://ethereum-holesky-rpc.publicnode.com';
    const HOLESKY_EXPLORER_URL = 'https://holesky.etherscan.io';
    const ETH_TO_USD_RATE = 3500; 

    let walletContract;
    let signer;

    async function getCurrentUser() {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) console.error("getCurrentUser Error:", error);
        return (user && user.id) ? user : null;
    }

    async function fetchProfileAndBalance() {
       
        console.log("Fetching profile & balance...");
        if (!currentUser) { console.error("fetchProfileAndBalance: No current user."); return null; }
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('username, balance, email, phone_number, full_name') 
                .eq('id', currentUser.id)
                .maybeSingle(); 

            if (error) throw error; 

            currentProfile = data; 
            currentBalance = parseFloat(data?.balance || 0); 

            updateBalanceDisplay();
            updateProfileCard(data?.username || currentUser.email); 
            populateSettingsForm(data || { email: currentUser.email }); 

            return currentProfile; 
        } catch (error) {
            console.error('fetchProfileAndBalance CATCH:', error);
            if (balanceAmountEl) balanceAmountEl.textContent = 'Error'; 
            currentProfile = null; return null;
        }
    }

    async function fetchTransactions() {
        console.log("Fetching transactions...");
        if (!currentUser) { console.error("fetchTransactions: No current user."); return null; }
        try {
            const { data, error } = await supabaseClient
                .from('transactions')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('timestamp', { ascending: false }); 

            if (error) throw error;

            transactions = (data || []).map(tx => {
                let parsedTimestamp = null;
                if (tx.timestamp) {
                    const dateCandidate = new Date(tx.timestamp);
                    if (dateCandidate instanceof Date && !isNaN(dateCandidate)) {
                        parsedTimestamp = dateCandidate;
                    } else {
                        console.warn(`Invalid timestamp format received for tx ${tx.id}:`, tx.timestamp);
                    }
                } else {
                    console.warn(`Missing timestamp for tx ${tx.id}`);
                }

                return {
                    ...tx,
                    amount: !isNaN(parseFloat(tx.amount)) ? parseFloat(tx.amount) : 0,
                    timestamp: parsedTimestamp 
                };
            });

             transactions.sort((a, b) => {
                 const timeA = a.timestamp ? a.timestamp.getTime() : 0;
                 const timeB = b.timestamp ? b.timestamp.getTime() : 0;
                 return timeB - timeA; 
             });

            displayTransactions(homeTransactionList, transactions, 5); 
            displayTransactions(fullTransactionList, transactions);
            displayTransactions(paymentHistoryList, transactions.filter(tx => tx.type !== 'income'), 5);

            return transactions;
        } catch (error) {
            console.error('fetchTransactions CATCH:', error);
            const errorMsg = '<li class="transaction-item placeholder">Error loading</li>';
            if (homeTransactionList) homeTransactionList.innerHTML = errorMsg;
            if (fullTransactionList) fullTransactionList.innerHTML = errorMsg;
            if (paymentHistoryList) paymentHistoryList.innerHTML = errorMsg;
            return null;
        }
    }

    async function fetchContacts() {
        console.log("Fetching contacts...");
        if (!currentUser) { console.error("fetchContacts: No current user."); return null; }
        try {
            const { data, error } = await supabaseClient
                .from('contacts')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('name', { ascending: true }); 
            if (error) throw error;

            contacts = data || []; 

            displayQuickContacts(quickContactList, contacts, 3); 
            displayFullContacts(contactListFull, contacts); 

            return contacts;
        } catch (error) {
            console.error('fetchContacts CATCH:', error);
            contacts = []; 
            const errorMsg = '<li class="contact-item placeholder">Error loading</li>';
            if (quickContactList) quickContactList.innerHTML = errorMsg;
            if (contactListFull) contactListFull.innerHTML = '<li class="contact-list-item placeholder">Error loading</li>';
            return null;
        }
    }
    async function findUserByEmail(email) {
        console.log(`[findUserByEmail] Start: Searching for ${email}`); // Log function entry
        if (!email) {
             console.log("[findUserByEmail] End: No email provided.");
             return null;
        }
        try {
            console.log("[findUserByEmail] Querying Supabase profiles table..."); // Log before query
            const { data, error, status } = await supabaseClient
                .from('profiles')
                .select('id, username') // Only select what's needed
                .eq('email', email.trim().toLowerCase())
                .maybeSingle(); // Expect 0 or 1 result
    
            console.log(`[findUserByEmail] Query finished. Status: ${status}, Error: ${error}, Data:`, data); // Log result details
    
            if (error && status !== 406) { // 406 happens with maybeSingle if no rows found, it's not a real error here.
                console.error("[findUserByEmail] Supabase Query Error:", error);
                console.log("[findUserByEmail] End: Returning null due to error.");
                return null;
            }
    
            console.log(`[findUserByEmail] End: Returning ${data ? 'user data' : 'null'}`);
            return data; // Return the user object (or null if not found/error)
    
        } catch (catchError) {
            console.error("[findUserByEmail] CATCH block error:", catchError);
            console.log("[findUserByEmail] End: Returning null due to CATCH block.");
            return null;
        }
    }
    async function addFundsViaRPC(amount, description = 'Added funds via web') {
        console.log(`addFundsViaRPC: Calling RPC for ${amount}`);
        if (!currentUser) return { success: false, error: "User not logged in" };
        if (amount <= 0) return { success: false, error: "Amount must be positive" };

        try {
            const { data: newBalance, error } = await supabaseClient.rpc(
                'add_funds_and_log',
                {
                    amount_to_add: amount,
                    description_text: description
                }
            );

            if (error) throw error;

            
            currentBalance = parseFloat(newBalance);
            updateBalanceDisplay();
            await fetchTransactions();

            return { success: true, newBalance: currentBalance };
        } catch (error) {
            console.error("addFundsViaRPC Error:", error);
            return {
                success: false,
                error: `Failed to add funds: ${error.message || 'Unknown error'}`
            };
        }
    }

    async function logTransactionViaRPC(type, amount, description) {
        console.log(`logTransactionViaRPC: Logging ${type} for ${amount}`);
        if (!currentUser) return { success: false, error: "User not logged in" };
        if (!type || isNaN(amount) || amount <= 0) return { success: false, error: "Invalid type or amount" };

        try {
            const { data: newBalance, error } = await supabaseClient.rpc(
                'log_transaction_and_update_balance',
                {
                    transaction_type: type,
                    transaction_amount: amount,
                    transaction_description: description
                }
            );

            if (error) throw error;

            currentBalance = parseFloat(newBalance);
            updateBalanceDisplay();
            await fetchTransactions();

            return { success: true, newBalance: currentBalance };
        } catch (error) {
            console.error("logTransactionViaRPC Error:", error);
            return {
                success: false,
                error: `Failed to log transaction: ${error.message || 'Unknown error'}`
            };
        }
    }

    async function updateProfile(updateData) {
        console.log("updateProfile:", updateData);
        if (!currentUser) return { success: false, error: "User not logged in" };
        if (Object.keys(updateData).length === 0) { console.log("updateProfile: No data to update."); return { success: true, error: null }; } // No changes needed
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .update(updateData)
                .eq('id', currentUser.id)
                .select()
                .single(); 
            if (error) throw error;
            await fetchProfileAndBalance(); 
            return { success: true, data: data };
        } catch (error) {
            console.error("updateProfile CATCH:", error);
            return { success: false, error: `Failed to update profile: ${error.message}` };
        }
    }
    async function addContact(contactData) {
        console.log("addContact:", contactData);
        if (!currentUser) return { success: false, error: "User not logged in" };
        if (!contactData?.name || !contactData?.detail) {
             return { success: false, error: "Contact name and email required" };
        }
        try {
            const { data, error } = await supabaseClient
                .from('contacts')
                .insert({
                    user_id: currentUser.id, 
                    name: contactData.name.trim(),
                    detail: contactData.detail.trim(), 
                })
                .select()
                .single();

            if (error) throw error;
            await fetchContacts(); 
            return { success: true, data: data };
        } catch (error) {
            console.error("addContact CATCH:", error);
             if (error.code === '23505') { 
                return { success: false, error: "Contact with this email already exists." };
            }
            return { success: false, error: `Failed to add contact: ${error.message}` };
        }
    }


    async function sendMoneyViaRPC(recipientIdentifier, amount, note) {
        console.log(`sendMoneyViaRPC: Requesting transfer of $${amount} to ${recipientIdentifier}`);
        if (!currentUser) return { success: false, error: "User not logged in" };

        if (!recipientIdentifier || typeof recipientIdentifier !== 'string' || recipientIdentifier.trim() === '') {
            return { success: false, error: "Invalid recipient identifier." };
        }
        if (isNaN(amount) || amount <= 0) {
            return { success: false, error: "Invalid transfer amount." };
        }
        if (recipientIdentifier.trim().toLowerCase() === currentUser.email?.toLowerCase() ||
            (currentProfile?.username && recipientIdentifier.trim().toLowerCase() === currentProfile.username.toLowerCase())) {
            return { success: false, error: "Cannot send funds to yourself." };
        }
        const roundedAmount = parseFloat(amount.toFixed(2));

        try {
            console.log("Calling Supabase RPC function 'transfer_funds'...");

            const { data: successMessage, error } = await supabaseClient.rpc('transfer_funds', {
                recipient_identifier: recipientIdentifier.trim(),
                amount_to_transfer: roundedAmount,
                note: note || ''
            });

            if (error) {
                console.error('Supabase RPC Error:', error);
                let errorMessage = error.message || 'An unknown error occurred during transfer.';

                if (errorMessage.includes('INSUFFICIENT_FUNDS')) {
                    errorMessage = 'Insufficient funds for this transfer.';
                } else if (errorMessage.includes('RECIPIENT_NOT_FOUND')) {
                     errorMessage = `Recipient "${recipientIdentifier}" not found. Please check the username or email.`;
                } else if (errorMessage.includes('SELF_TRANSFER_ERROR')) {
                    errorMessage = 'You cannot send funds to yourself.';
                } else if (errorMessage.includes('INVALID_AMOUNT')) {
                    errorMessage = 'Transfer amount must be positive.';
                }

                throw new Error(errorMessage);
            }

            console.log("sendMoneyViaRPC Success:", successMessage);

            await fetchProfileAndBalance();
            await fetchTransactions();

            return { success: true, data: { message: successMessage } };

        } catch (error) {
            console.error("sendMoneyViaRPC CATCH:", error);
            return { success: false, error: `Transfer Failed: ${error.message}` };
        }
    }

    async function ensureProfileUsername() {
        console.log("ensureProfileUsername: Checking...");
        if (currentUser && currentProfile && !currentProfile.username) { 
            const authUsername = currentUser.user_metadata?.username; 
            if (authUsername) {
                console.log(`ensureProfileUsername: Updating profile with username from metadata: ${authUsername}`);
                updateProfile({ username: authUsername }).catch(err => console.error("Background username update failed:", err));
            } else { console.warn("ensureProfileUsername: Profile username missing, not in auth metadata."); }
        } else { console.log("ensureProfileUsername: Username OK or profile/user missing."); }
    }

    async function fetchUserGroups() {
        console.log("Fetching user groups...");
        if (!currentUser) {
            console.error("fetchUserGroups: No current user.");
            if (groupListUl) groupListUl.innerHTML = '<li class="group-item placeholder">Login to see groups.</li>';
            return null;
        }
        try {
            // --- MODIFIED APPROACH ---
            // Fetch groups directly, relying on the 'groups' RLS policy.
            // Include nested members, relying on the 'group_members' RLS policy for the nested select.
            console.log("Fetching groups with nested members directly...");
            const { data: groupsData, error: groupsError } = await supabaseClient
                .from('groups') // Start query from 'groups' table
                .select(`
                    id,
                    name,
                    created_by,
                    total_contribution,
                    created_at,
                    group_members!inner (
                        user_id,
                        contribution_amount,
                        profiles ( id, username, email )
                    )
                `)
                // The 'groups' SELECT RLS policy should automatically filter this list
                // to only include groups where the user is a member.
                .order('created_at', { ascending: false });

            if (groupsError) {
                 // Check if the error is specifically the recursion one, even here
                 if (groupsError.message.includes('infinite recursion detected in policy for relation "group_members"')) {
                     console.error("Recursion error detected even when querying from 'groups'. Check 'group_members' SELECT policy again.");
                 }
                 throw groupsError; // Throw other errors
            }

            console.log("Fetched groups data:", groupsData);
            userGroups = groupsData || [];
            displayUserGroups(userGroups);
            return userGroups;

        } catch (error) {
            console.error("fetchUserGroups CATCH:", error);
            if (groupListUl) groupListUl.innerHTML = `<li class="group-item placeholder">Error loading groups: ${error.message}</li>`;
            userGroups = [];
            return null;
        }
    }

    async function createGroupViaRPC(groupName, selectedMemberIds) {
        console.log(`createGroupViaRPC: Name: ${groupName}, Members:`, selectedMemberIds);
        if (!currentUser) return { success: false, error: "User not logged in" };
        if (!groupName || selectedMemberIds.length === 0) {
            return { success: false, error: "Group name and at least one member (creator) are required." };
        }

        // The creator is implicitly added, ensure other members are distinct and valid
        const memberIdsForRPC = [...new Set(selectedMemberIds)]; // Remove duplicates

        try {
            const { data, error } = await supabaseClient.rpc('create_group_with_members', {
                group_name_param: groupName, // Ensure param names match SQL function
                member_ids_param: memberIdsForRPC
            });

            if (error) throw error;

            console.log("Group created successfully:", data); // data might be the new group_id or success message
            await fetchUserGroups(); // Refresh the group list
            return { success: true, data: data };
        } catch (error) {
            console.error("createGroupViaRPC CATCH:", error);
            return { success: false, error: `Failed to create group: ${error.message}` };
        }
    }

    async function contributeToGroupViaRPC(groupId, amount) {
        console.log(`contributeToGroupViaRPC: GroupID: ${groupId}, Amount: ${amount}`);
        if (!currentUser) return { success: false, error: "User not logged in" };
        if (!groupId || isNaN(amount) || amount <= 0) {
            return { success: false, error: "Invalid group ID or contribution amount." };
        }

        try {
            const { data: newBalance, error } = await supabaseClient.rpc('contribute_to_group', {
                group_id_to_contribute: groupId,
                amount_to_contribute: amount
            });

            if (error) throw error;

            console.log("Contribution successful. User's new balance:", newBalance);
            currentBalance = parseFloat(newBalance);
            updateBalanceDisplay(); // Update main wallet balance
            await fetchUserGroups();   // Refresh group details (to show updated contributions)
            await fetchTransactions(); // Refresh main transaction list
            return { success: true, data: { newBalance: currentBalance } };
        } catch (error) {
            console.error("contributeToGroupViaRPC CATCH:", error);
            return { success: false, error: `Failed to contribute: ${error.message}` };
        }
    }
 
    // --- Core Display & UI Functions ---
    function updateBalanceDisplay() {
        // Updates the balance display element
        if (balanceAmountEl) { balanceAmountEl.textContent = `$${currentBalance.toFixed(2)}`; }
        else { console.warn("updateBalanceDisplay: balanceAmountEl not found"); }
    }

    function updateProfileCard(username) {
        // Updates the user profile card on the dashboard
        const profileNameEl = document.getElementById('profileCardName');
        const profileUpiIdEl = document.getElementById('profileCardUpiId');
        const profilePhoneEl = document.getElementById('profileCardPhone');
        // Use fallbacks for display values if profile data is incomplete
        const displayName = currentProfile?.full_name || currentProfile?.username || username || 'User';
        const displayUsername = currentProfile?.username || username || 'user';
        if (profileNameEl) profileNameEl.textContent = displayName;
        if (profileUpiIdEl) profileUpiIdEl.textContent = `${displayUsername}@walletwise`;
        if (profilePhoneEl) profilePhoneEl.textContent = currentProfile?.phone_number || 'Not Set';
        // TODO: Update profile picture and QR code based on data
    }

    function populateSettingsForm(profileData) {
        // Populates the form in the settings section
        if (!profileForm) { console.error("populateSettingsForm: profileForm element not found."); return; }
        const data = profileData || {}; // Use empty object as fallback
        // Populate fields, using nullish coalescing for defaults
        if (profileNameInput) profileNameInput.value = data.full_name ?? '';
        if (profileUsernameInput) profileUsernameInput.value = data.username ?? '';
        // Use email from authenticated user as ultimate fallback
        if (profileEmailInput) profileEmailInput.value = data.email ?? currentUser?.email ?? '';
        if (profilePhoneInput) profilePhoneInput.value = data.phone_number ?? '';
        // Set disabled state for fields that shouldn't be easily changed
        if (profileUsernameInput) profileUsernameInput.disabled = true;
        if (profileEmailInput) profileEmailInput.disabled = true;
        if (profileNameInput) profileNameInput.disabled = false;
        if (profilePhoneInput) profilePhoneInput.disabled = false;
    }

    function displayTransactions(listElement, transactionArray, limit = null) {
        // Renders transaction items into a given list element
        if (!listElement) { console.warn("displayTransactions: Target element not found."); return; }
        listElement.innerHTML = ''; // Clear previous items
        if (!Array.isArray(transactionArray)) { console.error("displayTransactions: Input is not an array."); listElement.innerHTML = '<li class="placeholder">Error</li>'; return; }

        // Sorting is now done within fetchTransactions

        const transactionsToDisplay = limit ? transactionArray.slice(0, limit) : transactionArray; // Use the pre-sorted array

        if (transactionsToDisplay.length === 0) { listElement.innerHTML = '<li class="transaction-item placeholder">No transactions yet.</li>'; return; }

        // Generate and append list item HTML for each transaction
        transactionsToDisplay.forEach(tx => {
            const listItem = document.createElement('li'); listItem.classList.add('transaction-item');
            const isIncome = tx.type === 'income';
            const typeClass = isIncome ? 'income' : (tx.type === 'bill' || tx.type === 'recharge' ? `${tx.type}-payment` : 'expense');
            let iconClass = 'fa-exchange-alt'; // Default icon
            if (isIncome) iconClass = 'fa-arrow-down'; else if (tx.type === 'recharge') iconClass = 'fa-mobile-alt'; else if (tx.type === 'bill') iconClass = 'fa-file-invoice'; else if (tx.type === 'expense') iconClass = 'fa-arrow-up';
            const amountSign = isIncome ? '+' : '-'; const amountClass = isIncome ? 'positive' : 'negative'; const statusClass = tx.status ? tx.status.toLowerCase() : 'completed'; listItem.classList.add(typeClass, statusClass);
            const displayAmount = Math.abs(tx.amount).toFixed(2);

            // --- SAFELY HANDLE DATE DISPLAY ---
            const txDate = tx.timestamp; // Already a Date object or null from fetchTransactions
            const isValidDate = txDate instanceof Date && !isNaN(txDate); // Check if it's a valid Date object
            const dateString = isValidDate ? txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date';
            const timeString = isValidDate ? txDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';
            // --- END SAFE DATE HANDLING ---

            // Different formats for full list vs snippets
            if (listElement.id === 'full-transaction-list') {
                 listItem.innerHTML = `<div><span><i class="fas ${iconClass}"></i> ${tx.description || tx.type}</span><small>${dateString}${timeString ? ', ' + timeString : ''} | TXN ID: ${tx.id}</small></div><div class="status-amount"><span class="amount ${amountClass}">${amountSign}${displayAmount}</span><span class="status-badge ${statusClass}">${tx.status || 'Completed'}</span></div>`;
            } else {
                 listItem.innerHTML = `<span><i class="fas ${iconClass}"></i> ${tx.description || tx.type}</span><span class="amount ${amountClass}">${amountSign}${displayAmount}</span>`;
            }
            listElement.appendChild(listItem);
        });
    }

    function displayFullContacts(listElement, contactArray) {
        // Renders the full contact list
        if (!listElement) return; listElement.innerHTML = ''; if (!Array.isArray(contactArray) || contactArray.length === 0) { listElement.innerHTML = '<li class="contact-list-item placeholder">No contacts found.</li>'; return; }
        contactArray.forEach(contact => { const listItem = document.createElement('li'); listItem.classList.add('contact-list-item'); listItem.dataset.contactId = contact.id; listItem.innerHTML = `<div class="contact-info"> <i class="fas ${contact.icon || 'fa-user-circle'}"></i> <div class="details"> <span class="contact-name">${contact.name}</span> <span class="contact-detail">${contact.detail || ''}</span> </div> </div> <div class="contact-actions"> <button class="action-btn-small send-contact-btn" data-contact-name="${contact.name}" data-contact-detail="${contact.detail || ''}"><i class="fas fa-paper-plane"></i> Send</button> <button class="action-btn-small details-contact-btn"><i class="fas fa-ellipsis-h"></i> Details</button> </div>`; listElement.appendChild(listItem); }); // Added data-contact-detail to send button
        
    }

    function displayQuickContacts(listElement, contactArray, limit = 3) {
        // Renders the limited quick contact list
        if (!listElement) return; listElement.innerHTML = ''; if (!Array.isArray(contactArray)) { listElement.innerHTML = '<li class="contact-item placeholder">Error</li>'; return; } const contactsToDisplay = contactArray.slice(0, limit); if (contactsToDisplay.length === 0) { listElement.innerHTML = '<li class="contact-item placeholder">No frequent contacts yet.</li>'; return; }
        contactsToDisplay.forEach(contact => { const listItem = document.createElement('li'); listItem.classList.add('contact-item'); listItem.dataset.contactId = contact.id; listItem.innerHTML = ` <i class="fas ${contact.icon || 'fa-user-circle'}"></i> <span>${contact.name}</span> <button class="action-btn-small send-contact-btn" data-contact-name="${contact.name}" data-contact-detail="${contact.detail || ''}"><i class="fas fa-paper-plane"></i> Send</button>`; listElement.appendChild(listItem); }); // Added data-contact-detail to send button
       
    }
     
    function displayUserGroups(groupsArray) {
        if (!groupListUl) {
            console.warn("displayUserGroups: groupListUl element not found.");
            return;
        }
        groupListUl.innerHTML = ''; // Clear previous items

        if (!Array.isArray(groupsArray) || groupsArray.length === 0) {
            groupListUl.innerHTML = '<li class="group-item placeholder">You are not part of any groups yet. Create one!</li>';
            return;
        }

        groupsArray.forEach(group => {
            const groupItem = document.createElement('li');
            groupItem.classList.add('group-item');
            groupItem.dataset.groupId = group.id;

            let calculatedTotalContribution = 0;
            let currentUserContribution = 0; // Find current user's contribution

            group.group_members.forEach(member => {
                const contribution = parseFloat(member.contribution_amount || 0);
                calculatedTotalContribution += contribution;
                if (member.user_id === currentUser.id) {
                    currentUserContribution = contribution; // Store it
                }
            });

            // Determine if withdraw button should be enabled
            const canWithdraw = currentUserContribution > 0;

            groupItem.innerHTML = `
                <div class="group-item-header">
                    <h4><i class="fas fa-users"></i> ${group.name || 'Unnamed Group'}</h4>
                    <span class="group-total-contribution">Total: $${calculatedTotalContribution.toFixed(2)}</span>
                </div>
                <div class="group-item-body">
                    <button class="group-members-toggle" aria-expanded="false">
                        View Members (${group.group_members?.length || 0}) <i class="fas fa-chevron-down"></i>
                    </button>
                    <ul class="group-members-list">
                        ${group.group_members && group.group_members.length > 0
                            ? group.group_members.map(member => {
                                const memberProfile = member.profiles;
                                const memberName = memberProfile?.username || memberProfile?.email || `User (${member.user_id.substring(0, 6)}...)`;
                                const contribution = parseFloat(member.contribution_amount || 0).toFixed(2);
                                return `
                                    <li class="group-member-item">
                                        <span class="member-name">${memberName} ${member.user_id === currentUser.id ? '(You)' : ''}</span>
                                        <span class="member-contribution">Contributed: $${contribution}</span>
                                    </li>`;
                              }).join('')
                            : '<li class="group-member-item placeholder">No members found.</li>'
                        }
                    </ul>
                </div>
                <div class="group-actions">
                    <button class="action-btn-small contribute-to-group-btn" data-group-id="${group.id}" data-group-name="${group.name || 'Unnamed Group'}">
                        <i class="fas fa-donate"></i> Contribute
                    </button>
                    <button class="action-btn-small withdraw-from-group-btn"
                            data-group-id="${group.id}"
                            data-group-name="${group.name || 'Unnamed Group'}"
                            data-user-contribution="${currentUserContribution}"
                            ${!canWithdraw ? 'disabled title="No contribution to withdraw"' : ''}>
                        <i class="fas fa-hand-holding-usd"></i> Withdraw
                    </button>
                    <!-- Add other actions like 'Leave Group', 'Add Members' (if creator) here -->
                </div>
            `;
            groupListUl.appendChild(groupItem);
        });
    }
    

    // --- Modal Handling ---
    function showModal() { // Add Money Modal
        if (!addMoneyModal) { console.error("Add Money Modal element not found"); return; }

        // Reset to stage 1
        if (modalStageAmount) modalStageAmount.style.display = 'block';
        else console.error("modalStageAmount element not found");

        if (modalStagePayment) modalStagePayment.style.display = 'none';
        else console.error("modalStagePayment element not found");

        if (modalStageSuccess) modalStageSuccess.style.display = 'none';
        else console.error("modalStageSuccess element not found");

        // Clear previous dynamic content and inputs
        if (paymentGatewayContent) paymentGatewayContent.innerHTML = '';
        else console.error("paymentGatewayContent element not found");

        if (amountToAddInput) amountToAddInput.value = '';
        else console.error("amountToAddInput element not found");

        // Reset state variables
        currentAddAmount = 0;
        currentAddAmountEth = 0;

        // Show the modal using flex for centering
        addMoneyModal.style.display = 'flex';

        // Add 'visible' class after a short delay to trigger CSS transition/animation
        setTimeout(() => {
            if (addMoneyModal) addMoneyModal.classList.add('visible');
        }, 10); // 10ms delay is usually sufficient
    }

    function hideModal() { // Add Money Modal
        if (!addMoneyModal) return;

        // Remove 'visible' class to trigger outro animation
        addMoneyModal.classList.remove('visible');

        // Wait for animation to finish before setting display to none
        setTimeout(() => {
            if (addMoneyModal) addMoneyModal.style.display = 'none';
        }, 300); // Match the CSS transition duration (adjust if needed)
    }
    
    function showCreateGroupModal() {
        console.log("showCreateGroupModal: Function called."); // <<< ADD LOG
    
        if (!createGroupModal) { console.error("Create Group Modal element not found"); return; }
        console.log("showCreateGroupModal: Modal element found."); // <<< ADD LOG
    
        if (createGroupForm) createGroupForm.reset();
        if (createGroupError) {
            createGroupError.textContent = '';
            createGroupError.style.display = 'none';
        }
        if (submitCreateGroupBtn) {
            submitCreateGroupBtn.disabled = false;
            submitCreateGroupBtn.innerHTML = 'Create Group <i class="fas fa-check"></i>';
        }
    
        // Populate members select
        console.log("showCreateGroupModal: Populating members select..."); // <<< ADD LOG
        if (groupMembersSelect) {
            groupMembersSelect.innerHTML = ''; // Clear old options
            console.log("showCreateGroupModal: Current contacts count:", contacts.length); // <<< ADD LOG (Check if contacts are loaded)
            if (contacts.length > 0) {
                 // Use a flag to see if any options get added
                 let optionsAdded = 0;
                contacts.forEach(async (contact) => { // Make the inner function async
                    if (contact.detail) {
                        // Find the profile of the contact person using their email
                        const contactUserProfile = await findUserByEmail(contact.detail);
                        if (contactUserProfile && contactUserProfile.id) {
                            if (contactUserProfile.id !== currentUser.id) {
                                const option = document.createElement('option');
                                option.value = contactUserProfile.id;
                                option.textContent = `${contact.name} (${contact.detail})`;
                                groupMembersSelect.appendChild(option);
                                optionsAdded++; // Increment flag
                            }
                        } else {
                            console.warn(`Could not find profile for contact: ${contact.name} (${contact.detail}). Skipping.`);
                        }
                    }
                });
                 // Log after the loop attempts (might need a small delay if using async inside)
                 setTimeout(() => console.log(`showCreateGroupModal: Finished populating. Options added: ${optionsAdded}`), 100);
            } else {
                groupMembersSelect.innerHTML = '<option disabled>No contacts to add. Add contacts first.</option>';
                 console.log("showCreateGroupModal: No contacts found to populate select."); // <<< ADD LOG
            }
        } else {
             console.error("showCreateGroupModal: groupMembersSelect element not found!"); // <<< ADD LOG
        }
    
        console.log("showCreateGroupModal: Setting modal display to flex."); // <<< ADD LOG
        createGroupModal.style.display = 'flex';
        setTimeout(() => {
             if (createGroupModal) {
                 createGroupModal.classList.add('visible');
                 console.log("showCreateGroupModal: Added 'visible' class."); // <<< ADD LOG
             }
         }, 10);
    }

    function hideCreateGroupModal() {
        if (!createGroupModal) return;
        createGroupModal.classList.remove('visible');
        setTimeout(() => { createGroupModal.style.display = 'none'; }, 300);
    }

    function showContributeGroupModal(groupId, groupName) {
        if (!contributeGroupModal) { console.error("Contribute Group Modal element not found"); return; }
        if (contributeGroupForm) contributeGroupForm.reset();
        if (contributeGroupError) {
            contributeGroupError.textContent = '';
            contributeGroupError.style.display = 'none';
        }
        if (submitContributeGroupBtn) {
            submitContributeGroupBtn.disabled = false;
            submitContributeGroupBtn.innerHTML = 'Contribute <i class="fas fa-donate"></i>';
        }

        if (contributeGroupIdInput) contributeGroupIdInput.value = groupId;
        if (contributeGroupName) contributeGroupName.textContent = `Contribute to ${groupName}`;
        if (contributeModalUserBalance) contributeModalUserBalance.textContent = `$${currentBalance.toFixed(2)}`;


        contributeGroupModal.style.display = 'flex';
        setTimeout(() => { contributeGroupModal.classList.add('visible'); }, 10);
    }

    function hideContributeGroupModal() {
        if (!contributeGroupModal) return;
        contributeGroupModal.classList.remove('visible');
        setTimeout(() => { contributeGroupModal.style.display = 'none'; }, 300);
    }

    function showWithdrawGroupModal(groupId, groupName, currentContribution) {
        if (!withdrawGroupModal) { console.error("Withdraw Group Modal element not found"); return; }
        if (withdrawGroupForm) withdrawGroupForm.reset();
        if (withdrawGroupError) {
            withdrawGroupError.textContent = '';
            withdrawGroupError.style.display = 'none';
        }
        if (submitWithdrawGroupBtn) {
            submitWithdrawGroupBtn.disabled = false;
            submitWithdrawGroupBtn.innerHTML = 'Withdraw Funds <i class="fas fa-hand-holding-usd"></i>';
        }

        if (withdrawGroupIdInput) withdrawGroupIdInput.value = groupId;
        if (withdrawGroupName) withdrawGroupName.textContent = `Withdraw from ${groupName}`;
        if (withdrawModalUserBalance) withdrawModalUserBalance.textContent = `$${currentBalance.toFixed(2)}`;
        if (withdrawModalUserContribution) withdrawModalUserContribution.textContent = `$${parseFloat(currentContribution || 0).toFixed(2)}`;

        // Set max withdrawal amount dynamically on the input
        if (withdrawalAmountInput) {
             withdrawalAmountInput.max = parseFloat(currentContribution || 0).toFixed(2);
        }


        withdrawGroupModal.style.display = 'flex';
        setTimeout(() => { withdrawGroupModal.classList.add('visible'); }, 10);
    }

    function hideWithdrawGroupModal() {
        if (!withdrawGroupModal) return;
        withdrawGroupModal.classList.remove('visible');
        setTimeout(() => { withdrawGroupModal.style.display = 'none'; }, 300);
    }

    async function withdrawFromGroupViaRPC(groupId, amount) {
        console.log(`withdrawFromGroupViaRPC: GroupID: ${groupId}, Amount: ${amount}`);
        if (!currentUser) return { success: false, error: "User not logged in" };
        if (!groupId || isNaN(amount) || amount <= 0) {
            return { success: false, error: "Invalid group ID or withdrawal amount." };
        }

        try {
            const { data: newBalance, error } = await supabaseClient.rpc('withdraw_from_group', {
                group_id_to_withdraw_from: groupId,
                amount_to_withdraw: amount
            });

            if (error) {
                 console.error("Supabase RPC Error (withdraw_from_group):", error);
                 let errorMessage = error.message || 'An unknown error occurred during withdrawal.';
                 // Add specific error parsing based on your SQL RAISE messages
                 if (errorMessage.includes('INSUFFICIENT_CONTRIBUTION')) {
                     errorMessage = 'Withdrawal amount exceeds your contribution to this group.';
                 } else if (errorMessage.includes('NOT_A_MEMBER')) {
                     errorMessage = 'You are not a member of this group.';
                 } // Add others as needed
                throw new Error(errorMessage);
            }

            console.log("Withdrawal successful. User's new balance:", newBalance);
            currentBalance = parseFloat(newBalance); // Update main wallet balance
            updateBalanceDisplay();
            await fetchUserGroups();   // Refresh group details (to show updated contributions)
            await fetchTransactions(); // Refresh main transaction list
            return { success: true, data: { newBalance: currentBalance } };
        } catch (error) {
            console.error("withdrawFromGroupViaRPC CATCH:", error);
            return { success: false, error: `Withdrawal Failed: ${error.message}` };
        }
    }

    function showPaymentStage() {
        console.log(`showPaymentStage: Proceeding with amount $${currentAddAmount}`);
        if (currentAddAmount <= 0) {
            alert("Invalid amount entered.");
            return;
        }
        // Ensure all necessary stage/content elements exist
        if (!modalStageAmount || !modalStagePayment || !paymentGatewayLoading || !paymentGatewayContent) {
            console.error("showPaymentStage: Required modal stage or content elements are missing.");
            alert("UI Error: Cannot load payment options. Please refresh.");
            return;
        }

        // Calculate ETH amount (USD / rate)
        currentAddAmountEth = currentAddAmount / ETH_TO_USD_RATE;
        console.log(`showPaymentStage: Converting $${currentAddAmount} USD to ${currentAddAmountEth.toFixed(8)} ETH (Rate: $${ETH_TO_USD_RATE}/ETH)`);

        // --- UI Transitions ---
        modalStageAmount.style.display = 'none';    // Hide amount input stage
        modalStagePayment.style.display = 'block';  // Show payment selection stage
        modalStageSuccess.style.display = 'none';   // Ensure success stage is hidden
        paymentGatewayLoading.style.display = 'block'; // Show loading spinner
        paymentGatewayContent.style.display = 'none';  // Hide content area initially

        // --- Fetch Payment Options HTML ---
        fetch('_paymentPage.html') // Ensure this path is correct relative to index.html
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} while fetching _paymentPage.html`);
                }
                return response.text();
            })
            .then(html => {
                // Inject the fetched HTML
                paymentGatewayContent.innerHTML = html;

                 // --- Initialize Tabs (using jQuery as per your HTML includes) ---
                 try {
                    if (typeof $ !== 'undefined' && typeof $.fn.easyResponsiveTabs === 'function') {
                        $('#horizontalTab').easyResponsiveTabs({
                            type: 'default', // or 'vertical', 'accordion'
                            width: 'auto',   // automatically adjusts according to the content
                            fit: true,       // 100% fits in a container
                            // closed: 'accordion', // Start closed if in accordion view
                            // activate: function(event) { ... } // Optional callback
                        });
                        console.log("easyResponsiveTabs initialized.");
                    } else {
                         console.error("jQuery or easyResponsiveTabs plugin not loaded correctly.");
                         throw new Error("Payment tabs cannot be initialized.");
                    }
                } catch (tabError) {
                     console.error("Error initializing payment tabs:", tabError);
                     paymentGatewayContent.innerHTML = `<p class="error">Error loading payment tabs. ${tabError.message}</p>`;
                     paymentGatewayLoading.style.display = 'none';
                     paymentGatewayContent.style.display = 'block';
                     return; // Stop further processing if tabs failed
                }


                // --- Update Dynamic Fields in Loaded HTML ---
                updateGatewayAmountFields(currentAddAmount); // Update USD amount fields
                updateMetaMaskAmountField(currentAddAmountEth); // Update ETH amount field

                // --- Final UI Update ---
                paymentGatewayLoading.style.display = 'none';  // Hide loading spinner
                paymentGatewayContent.style.display = 'block'; // Show the loaded content

                // Event listeners for confirm buttons are handled by the DELEGATED listener added later
                // No need to add listeners here individually

            })
            .catch(error => {
                console.error('Error loading or processing payment template:', error);
                paymentGatewayContent.innerHTML = `<p class="error" style="color: var(--negative); text-align: center;">Error loading payment options: ${error.message}. Please check file path and content.</p>`;
                paymentGatewayLoading.style.display = 'none'; // Hide loader
                paymentGatewayContent.style.display = 'block'; // Show error
            });
    }

    function updateGatewayAmountFields(amount) {
        // Update all standard USD amount fields within the loaded payment gateway content
        const amountFields = paymentGatewayContent?.querySelectorAll('.payment-amount-field');
        if (amountFields && amountFields.length > 0) {
            const formattedAmount = `$${amount.toFixed(2)}`;
            console.log("Updating .payment-amount-field elements to:", formattedAmount);
            amountFields.forEach(input => {
                // Check if it's an input or span/div
                 if (input.tagName === 'INPUT') {
                    input.value = formattedAmount;
                    input.disabled = true; // Disable direct editing
                 } else {
                     input.textContent = formattedAmount; // For spans or other display elements
                 }
            });
        } else {
             console.warn(".payment-amount-field elements not found in loaded payment gateway content.");
        }
    }

    function updateMetaMaskAmountField(ethAmount) {
        // Update the specific MetaMask ETH amount field
        const ethAmountField = paymentGatewayContent?.querySelector('.payment-amount-field-eth'); // Select using class added in _paymentPage.html
        if (ethAmountField) {
             const formattedEth = `${ethAmount.toFixed(8)} ETH`; // Format with 8 decimals
             console.log("Updating .payment-amount-field-eth element to:", formattedEth);
             ethAmountField.textContent = formattedEth;
        } else {
            console.warn(".payment-amount-field-eth element not found in loaded payment gateway content.");
        }
    }

    function handlePaymentSuccess(amount) {
        // Handles UI updates after successful payment/fund addition
        // This function assumes the backend RPC call (addFundsViaRPC) was successful
        console.log(`handlePaymentSuccess: $${amount.toFixed(2)} added.`);

        if (modalStagePayment) modalStagePayment.style.display = 'none';
        if (modalStageSuccess) modalStageSuccess.style.display = 'block';

        const successMsgEl = document.getElementById('successMessage');
        if (successMsgEl) {
            successMsgEl.textContent = `$${amount.toFixed(2)} added successfully!`;
        }

        // Balance display and transaction list should have already been updated
        // by the successful addFundsViaRPC call. If not, add them here:
        // updateBalanceDisplay();
        // fetchTransactions(); // Re-fetch to show the new deposit

        // Close the Add Money modal after a delay
        setTimeout(hideModal, 2500); // Give user time to see success message
    }

    function handlePaymentFailure(errorMessage) {
        // Handles UI updates or alerts on payment/fund addition failure
        // This is typically called after addFundsViaRPC fails, or a simulated/gateway payment fails before RPC call
        console.error("handlePaymentFailure:", errorMessage);

        // Option 1: Show an alert (simple)
        alert(`Payment Failed: ${errorMessage || 'An unknown error occurred.'}`);
    }


    // Keep Add Transaction Modal functions
    function showAddTransactionModal() {
        // Shows the modal for logging general transactions
        if (addTransactionForm) addTransactionForm.reset(); // Reset form
        if (addTransactionModal) addTransactionModal.style.display = 'flex'; else console.error("addTransactionModal not found");
        // Add visible class after a small delay to trigger animation (if using CSS transitions)
        setTimeout(() => { addTransactionModal.classList.add('visible'); }, 10);
    }
    function hideAddTransactionModal() {
        // Hides the modal for logging general transactions
        if (!addTransactionModal) return;
        addTransactionModal.classList.remove('visible'); // Trigger animation out
        setTimeout(() => { // Hide after animation
            addTransactionModal.style.display = 'none';
        }, 300); // Match CSS transition duration
    }

    // --- NEW: Add Contact Modal Handling ---
    function showAddContactModal() {
        if (!addContactModal) { console.error("Add Contact Modal element not found"); return; }
        if (addContactFormModal) addContactFormModal.reset(); // Reset form fields
        if (contactModalError) {
            contactModalError.textContent = ''; // Clear previous errors
            contactModalError.style.display = 'none'; // Hide error area
        }
        if (submitAddContactBtn) { // Reset button state
             submitAddContactBtn.disabled = false;
             submitAddContactBtn.innerHTML = 'Add Contact <i class="fas fa-check"></i>';
        }
        addContactModal.style.display = 'flex'; // Show the modal container
        // Add visible class after a small delay for animation
        setTimeout(() => { addContactModal.classList.add('visible'); }, 10);
    }

    function hideAddContactModal() {
        if (!addContactModal) return;
        addContactModal.classList.remove('visible'); // Trigger animation out
        setTimeout(() => { // Hide after animation
            addContactModal.style.display = 'none';
        }, 300); // Match CSS transition duration
    }


    // --- Event Listeners ---

    
    if (addMoneyBtn) addMoneyBtn.addEventListener('click', showModal); else console.error("addMoneyBtn not found!");
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal); else console.error("closeModalBtn (Add Money) not found!");
    if (addMoneyModal) addMoneyModal.addEventListener('click', (event) => { if (event.target === addMoneyModal) hideModal(); }); else console.error("addMoneyModal not found!");
    if (modalBackToAmountBtn) {
        modalBackToAmountBtn.addEventListener('click', () => {
            if (modalStagePayment) modalStagePayment.style.display = 'none';
            if (modalStageSuccess) modalStageSuccess.style.display = 'none';
            if (modalStageAmount) modalStageAmount.style.display = 'block';
        });
    } else { console.warn("modalBackToAmountBtn not found in HTML."); }
    if (addMoneyForm) {
        addMoneyForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const amountValue = parseFloat(amountToAddInput.value);
            if (isNaN(amountValue) || amountValue <= 0) { alert("Invalid amount."); return; }
            currentAddAmount = amountValue;
            showPaymentStage();
        });
    } else { console.warn("Add Money Stage 1 form (#addMoneyForm) not found in HTML."); }

    // Add Transaction Modal Triggers/Controls (Keep existing)
    if (openTransactionModalBtn) openTransactionModalBtn.addEventListener('click', showAddTransactionModal); else console.error("openTransactionModalBtn not found!");
    if (closeTransactionModalBtn) closeTransactionModalBtn.addEventListener('click', hideAddTransactionModal); else console.error("closeTransactionModalBtn not found!");
    if (addTransactionModal) addTransactionModal.addEventListener('click', (event) => { if (event.target === addTransactionModal) hideAddTransactionModal(); }); else console.error("addTransactionModal not found!");
    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const btn = event.target.querySelector('button[type="submit"]'); const originalText = btn.textContent; btn.disabled = true; btn.textContent = "Logging...";
            const type = transactionTypeInput.value; const amount = parseFloat(transactionAmountInput.value); const description = transactionDescriptionInput.value.trim();
            if (!type || isNaN(amount) || amount <= 0) { alert("Invalid type or amount."); btn.disabled = false; btn.textContent = originalText; return; }
            const result = await logTransactionViaRPC(type, amount, description);
            if (result.success) { hideAddTransactionModal(); } else { alert(`Error: ${result.error}`); }
            btn.disabled = false; btn.textContent = originalText;
        });
    } else { console.error("addTransactionForm not found!"); }

    // Send Money Form (Keep existing)
    if (sendMoneyForm) {
        sendMoneyForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const btn = event.target.querySelector('button[type="submit"]'); const originalText = btn.textContent; btn.disabled = true; btn.textContent = 'Sending...';
            const recipient = recipientInput.value.trim(); const amount = parseFloat(sendAmountInput.value); const note = sendNoteInput.value.trim();
            if (!recipient || isNaN(amount) || amount <= 0) { alert("Invalid recipient or amount."); btn.disabled = false; btn.textContent = 'Send Securely'; return; }
            const result = await sendMoneyViaRPC(recipient, amount, note);
            if (result.success) { alert(`Successfully sent $${amount.toFixed(2)}!`); sendMoneyForm.reset(); }
            else { alert(`Send Failed: ${result.error}`); }
            btn.disabled = false; btn.textContent = 'Send Securely';
        });
    } else { console.error("sendMoneyForm not found!"); }

    // Contact Search (Keep existing)
    if (contactSearchInput) { contactSearchInput.addEventListener('input', (event) => { const searchTerm = event.target.value.toLowerCase(); const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchTerm) || (c.detail && c.detail.toLowerCase().includes(searchTerm))); displayFullContacts(contactListFull, filteredContacts); }); } else { console.error("contactSearchInput not found!"); }

    // MODIFIED: Add Contact Button Listener
    if (addContactBtn) {
        addContactBtn.addEventListener('click', () => {
            showAddContactModal();
        });
    } else {
        console.error("Add contact button (#contacts-section .action-btn) not found!");
    }
    
     // Create Group Modal
     if (createGroupBtn) { // <-- Does this button variable actually hold the button?
        createGroupBtn.addEventListener('click', showCreateGroupModal);
         console.log("Attached click listener to Create Group button."); // <--- ADD THIS LOG
    } else { console.error("Create Group Button not found"); }

    if (closeCreateGroupModalBtn) {
        closeCreateGroupModalBtn.addEventListener('click', hideCreateGroupModal);
    }
    if (createGroupModal) {
        createGroupModal.addEventListener('click', (event) => {
            if (event.target === createGroupModal) hideCreateGroupModal();
        });
    }
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const groupName = groupNameInput.value.trim();
            const selectedOptions = Array.from(groupMembersSelect.selectedOptions).map(option => option.value); // These are user_ids

            if (!groupName) {
                createGroupError.textContent = 'Group name is required.';
                createGroupError.style.display = 'block';
                return;
            }
            // Creator is added automatically by RPC or backend logic.
            // Ensure selectedMemberIds contains distinct, valid UUIDs.

            submitCreateGroupBtn.disabled = true;
            submitCreateGroupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            createGroupError.style.display = 'none';

            const result = await createGroupViaRPC(groupName, selectedOptions);
            if (result.success) {
                hideCreateGroupModal();
            } else {
                createGroupError.textContent = result.error || 'Failed to create group.';
                createGroupError.style.display = 'block';
                submitCreateGroupBtn.disabled = false;
                submitCreateGroupBtn.innerHTML = 'Create Group <i class="fas fa-check"></i>';
            }
        });
    }
    if (closeContributeGroupModalBtn) {
        closeContributeGroupModalBtn.addEventListener('click', hideContributeGroupModal);
    }
    if (contributeGroupModal) {
        contributeGroupModal.addEventListener('click', (event) => {
            if (event.target === contributeGroupModal) hideContributeGroupModal();
        });
    }
    if (contributeGroupForm) {
        contributeGroupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const groupId = contributeGroupIdInput.value;
            const amount = parseFloat(contributionAmountInput.value);

            if (isNaN(amount) || amount <= 0) {
                contributeGroupError.textContent = 'Invalid contribution amount.';
                contributeGroupError.style.display = 'block';
                return;
            }
            if (amount > currentBalance) {
                contributeGroupError.textContent = 'Insufficient wallet balance.';
                contributeGroupError.style.display = 'block';
                return;
            }

            submitContributeGroupBtn.disabled = true;
            submitContributeGroupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Contributing...';
            contributeGroupError.style.display = 'none';

            const result = await contributeToGroupViaRPC(groupId, amount);
            if (result.success) {
                hideContributeGroupModal();
            } else {
                contributeGroupError.textContent = result.error || 'Failed to contribute.';
                contributeGroupError.style.display = 'block';
                submitContributeGroupBtn.disabled = false;
                submitContributeGroupBtn.innerHTML = 'Contribute <i class="fas fa-donate"></i>';
            }
        });
    }


    // Event Delegation for Group List Actions (Contribute, Toggle Members)
    if (groupListUl) {
        groupListUl.addEventListener('click', (event) => {
            const contributeBtn = event.target.closest('.contribute-to-group-btn');
            const toggleBtn = event.target.closest('.group-members-toggle');
            const withdrawBtn = event.target.closest('.withdraw-from-group-btn'); // <<< ADD THIS

            if (contributeBtn) {
                event.preventDefault();
                const groupId = contributeBtn.dataset.groupId;
                const groupName = contributeBtn.dataset.groupName;
                showContributeGroupModal(groupId, groupName);
            } else if (toggleBtn) {
                event.preventDefault();
                const membersList = toggleBtn.nextElementSibling;
                if (membersList && membersList.classList.contains('group-members-list')) {
                    const isExpanded = membersList.classList.toggle('expanded');
                    toggleBtn.setAttribute('aria-expanded', isExpanded);
                    toggleBtn.classList.toggle('expanded', isExpanded);
                }
            } else if (withdrawBtn) { // <<< ADD THIS BLOCK
                event.preventDefault();
                if (withdrawBtn.disabled) return; // Don't open if already disabled

                const groupId = withdrawBtn.dataset.groupId;
                const groupName = withdrawBtn.dataset.groupName;
                const userContribution = withdrawBtn.dataset.userContribution; // Get contribution amount
                showWithdrawGroupModal(groupId, groupName, userContribution);
            }
        });
    }

    // --- NEW: Add Contact Modal Listeners ---

    if (withdrawGroupForm) {
        withdrawGroupForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const groupId = withdrawGroupIdInput.value;
            const amount = parseFloat(withdrawalAmountInput.value);
            const maxAmount = parseFloat(withdrawalAmountInput.max); // Get max allowed amount

            if (isNaN(amount) || amount <= 0) {
                withdrawGroupError.textContent = 'Please enter a valid positive amount.';
                withdrawGroupError.style.display = 'block';
                return;
            }
            if (amount > maxAmount) {
                withdrawGroupError.textContent = `Withdrawal amount cannot exceed your contribution ($${maxAmount.toFixed(2)}).`;
                withdrawGroupError.style.display = 'block';
                return;
            }

            submitWithdrawGroupBtn.disabled = true;
            submitWithdrawGroupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Withdrawing...';
            withdrawGroupError.style.display = 'none';

            const result = await withdrawFromGroupViaRPC(groupId, amount);
            if (result.success) {
                hideWithdrawGroupModal();
                 // Optional: Maybe show a success toast notification?
                 // alert('Withdrawal successful!'); // Simple feedback
            } else {
                withdrawGroupError.textContent = result.error || 'Failed to withdraw funds.';
                withdrawGroupError.style.display = 'block';
                submitWithdrawGroupBtn.disabled = false;
                submitWithdrawGroupBtn.innerHTML = 'Withdraw Funds <i class="fas fa-hand-holding-usd"></i>';
            }
        });
    }

    if (closeAddContactModalBtn) {
        closeAddContactModalBtn.addEventListener('click', hideAddContactModal);
    } else { console.error("closeAddContactModalBtn not found!"); }

    if (addContactModal) { // Close modal if clicking outside the content
        addContactModal.addEventListener('click', (event) => {
            if (event.target === addContactModal) {
                hideAddContactModal();
            }
        });
    } else { console.error("addContactModal not found!"); }

    // Listener for the Add Contact form *inside the modal*
    if (addContactFormModal) {
        addContactFormModal.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default page reload

            if (!submitAddContactBtn || !contactNameInput || !contactDetailInput || !contactModalError) {
                console.error("Required elements missing in Add Contact modal form.");
                return;
            }

            const name = contactNameInput.value.trim();
            const detail = contactDetailInput.value.trim(); // This should be the email to check

            // Basic validation
            if (!name || !detail) {
                contactModalError.textContent = 'Please enter both Name and Email.';
                contactModalError.style.display = 'block';
                return;
            }

            // Disable button, show loading state
            submitAddContactBtn.disabled = true;
            submitAddContactBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
            contactModalError.style.display = 'none'; // Hide previous errors

            try {
                // 1. Check if user exists with the provided email (detail)
                const foundUser = await findUserByEmail(detail);

                if (foundUser) {
                    // 2. User exists, now try to add them to the *current user's* contact list
                    submitAddContactBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
                    const addResult = await addContact({ name: name, detail: detail });

                    if (addResult.success) {
                        hideAddContactModal(); // Success! Close the modal. List will refresh via addContact.
                        // Optionally show a temporary success notification if needed
                    } else {
                        // Failed to add contact (e.g., duplicate, DB error)
                        contactModalError.textContent = addResult.error || 'Could not add contact.';
                        contactModalError.style.display = 'block';
                    }
                } else {
                    // User not found with that email
                    contactModalError.textContent = 'User not found with that email address.';
                    contactModalError.style.display = 'block';
                }

            } catch (error) {
                // Catch unexpected errors during the process
                console.error("Error during Add Contact submission:", error);
                contactModalError.textContent = 'An unexpected error occurred. Please try again.';
                contactModalError.style.display = 'block';
            } finally {
                // Re-enable button regardless of outcome
                if (submitAddContactBtn) { // Check again just in case
                     submitAddContactBtn.disabled = false;
                     submitAddContactBtn.innerHTML = 'Add Contact <i class="fas fa-check"></i>';
                }
            }
        });
    } else { console.error("addContactFormModal not found!"); }


    // Listener for Quick Contacts List (Home Screen) using Event Delegation
if (quickContactList) {
    quickContactList.addEventListener('click', (event) => {
        const sendBtn = event.target.closest('.send-contact-btn');
        if (sendBtn) {
            event.preventDefault(); // Prevent potential default button actions
            const contactDetail = sendBtn.dataset.contactDetail;
            const contactName = sendBtn.dataset.contactName; // Get name too if needed
            console.log(`Quick Contact Send clicked for: ${contactName} (${contactDetail})`);
            if (recipientInput && contactDetail) {
                recipientInput.value = contactDetail; // Pre-fill with email/detail
                // Activate the payments tab/section using its nav link's click logic
                const paymentsNavLink = document.querySelector('.nav-link[data-target="payments-section"]');
                if (paymentsNavLink) {
                    paymentsNavLink.click(); // Simulate click to navigate
                } else {
                     window.location.hash = '#payments-section'; // Fallback hash change
                }
            } else {
                console.warn("Send Money recipient input not found or contact detail missing.");
            }
        }
        // Quick contacts list doesn't have details button in your code example
    });
} else {
    console.warn("Quick Contact List (#quick-contact-list) not found for event delegation.");
}

// Listener for Full Contacts List (Contacts Section) using Event Delegation
if (contactListFull) {
    contactListFull.addEventListener('click', (event) => {
        const sendBtn = event.target.closest('.send-contact-btn');
        const detailsBtn = event.target.closest('.details-contact-btn');

        if (sendBtn) {
            event.preventDefault();
            const contactDetail = sendBtn.dataset.contactDetail;
            const contactName = sendBtn.dataset.contactName;
            console.log(`Full Contact List Send clicked for: ${contactName} (${contactDetail})`);
             if (recipientInput && contactDetail) {
                recipientInput.value = contactDetail; // Pre-fill with email/detail
                 // Activate the payments tab/section using its nav link's click logic
                const paymentsNavLink = document.querySelector('.nav-link[data-target="payments-section"]');
                if (paymentsNavLink) {
                    paymentsNavLink.click(); // Simulate click to navigate
                } else {
                     window.location.hash = '#payments-section'; // Fallback hash change
                }
            } else {
                console.warn("Send Money recipient input not found or contact detail missing.");
            }
        } else if (detailsBtn) {
            event.preventDefault();
            const listItem = detailsBtn.closest('.contact-list-item');
            const contactId = listItem?.dataset.contactId;
            const contactName = listItem?.querySelector('.contact-name')?.textContent;
            console.log(`Full Contact List Details clicked for ID: ${contactId} (Name: ${contactName})`);
            alert(`Show details for contact: ${contactName} (ID: ${contactId}). \n(Details view not implemented)`);
        }
    });
} else {
    console.warn("Full Contact List (#contact-list-full) not found for event delegation.");
}

    // Settings Form (Keep existing)
    if (profileForm) { profileForm.addEventListener('submit', async (event) => { event.preventDefault(); const btn = event.target.querySelector('button[type="submit"]'); const originalText = btn.textContent; btn.disabled = true; btn.textContent = 'Saving...'; const updateData = {}; if (!profileNameInput.disabled) updateData.full_name = profileNameInput.value.trim(); if (!profilePhoneInput.disabled) updateData.phone_number = profilePhoneInput.value.trim(); const result = await updateProfile(updateData); if (!result.success && result.error) alert(`Error: ${result.error}`); else if (result.success) alert("Profile updated!"); btn.disabled = false; btn.textContent = originalText; }); } else { console.error("profileForm not found!"); }

    // Add Money Payment Gateway Listener (Delegated) (Keep existing)
    if (paymentGatewayContent) {
        paymentGatewayContent.addEventListener('click', async (event) => {
            const button = event.target.closest('.confirm-btn');
            if (!button) return; // Ignore clicks elsewhere

            event.preventDefault();
            event.stopPropagation(); // Prevent event bubbling

            const paymentMethod = button.dataset.method;

            // Handle MetaMask Button separately
            if (button.classList.contains('metamask-pay-btn')) {
                console.log("MetaMask Pay button clicked (delegated)");
                if (button.disabled) return; // Skip if button is already disabled

                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

                try {
                    await handleMetaMaskPayment();
                } catch (error) {
                    console.error("MetaMask payment failed:", error);
                     if(button){ // Check if button still exists
                         button.disabled = false;
                         button.innerHTML = 'Retry Connection';
                     }
                }
                return;
            }

            // Handle other simulated payment methods
            console.log(`Confirm Payment clicked via ${paymentMethod} (Simulated)`);
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            alert(`Simulating payment via ${paymentMethod}...`);

            // Simulate success after a delay for non-MetaMask options
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Call RPC to add funds (pretending payment succeeded)
            const result = await addFundsViaRPC(currentAddAmount, `Added funds via ${paymentMethod} (Simulated)`);

            if (result.success) {
                handlePaymentSuccess(currentAddAmount);
            } else {
                handlePaymentFailure(result.error || "Transaction failed.");
                 if(button){ // Check if button still exists
                     button.disabled = false;
                     button.innerHTML = 'Retry Payment';
                 }
            }
        });
    } else { console.error("paymentGatewayContent element not found!"); }


    // --- Initial Data Load ---
    async function loadInitialData() {
        console.log("loadInitialData: Started.");
        currentUser = await getCurrentUser();
        if (!currentUser) { console.log("loadInitialData: No user."); const layout = document.querySelector('.dashboard-layout'); if (layout) layout.style.display = 'none'; // Optionally redirect to login
         window.location.href = '/auth.html'; // Redirect if no user
          return; }
        console.log("loadInitialData: User:", currentUser.email);
        const layout = document.querySelector('.dashboard-layout'); if (layout) layout.style.display = 'flex'; // Use flex for layout
        // Set placeholders...
        if (balanceAmountEl) balanceAmountEl.textContent = 'Loading...'; if (homeTransactionList) homeTransactionList.innerHTML = '<li class="placeholder">Loading...</li>'; if (fullTransactionList) fullTransactionList.innerHTML = '<li class="placeholder">Loading...</li>'; if (paymentHistoryList) paymentHistoryList.innerHTML = '<li class="placeholder">Loading...</li>'; if (quickContactList) quickContactList.innerHTML = '<li class="placeholder">Loading...</li>'; if (contactListFull) contactListFull.innerHTML = '<li class="placeholder">Loading...</li>';
        console.log("loadInitialData: Fetching data...");
        if (groupListUl) groupListUl.innerHTML = '<li class="group-item placeholder">Loading groups...</li>';
        console.log("loadInitialData: Fetching data...");
        try {
            // Run fetches and username check concurrently for speed
            await Promise.all([
                fetchProfileAndBalance().then(profile => {
                    // Ensure username check runs *after* profile is fetched
                    if (profile !== null) return ensureProfileUsername();
                }),
                fetchTransactions(),
                fetchContacts(),
                fetchUserGroups() 
            ]);
        } catch (err) { console.error("loadInitialData CATCH:", err); /* Maybe show a general error message */ }
        console.log("loadInitialData: Finished.");
    }

    // --- Supabase Auth Listener ---
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        // Handles auth events like SIGNED_IN, SIGNED_OUT, INITIAL_SESSION
        console.log(`Auth Listener: Event: ${event}`, session ? `User: ${session.user.email}` : 'No session');
        const user = session?.user || null;
        const previousUser = currentUser; // Store state before update
        currentUser = user; // Update global state

        // Handle SIGNED_OUT
        if (event === 'SIGNED_OUT') {
            console.log("Auth Listener: User signed out. Redirecting to login.");
            window.location.href = 'signin.html'; // Redirect to login page
            return; // Stop further processing for sign out
        }
        
        // Handle INITIAL_SESSION or SIGNED_IN or user change
        if ((event === 'INITIAL_SESSION' && currentUser) || (event === 'SIGNED_IN') || (previousUser?.id !== currentUser?.id && currentUser)) {
             console.log(`Auth Listener: User state change detected. Loading initial data for ${currentUser.email}`);
             await loadInitialData();
        } else if (event === 'INITIAL_SESSION' && !currentUser) {
             console.log("Auth Listener: Initial session loaded, but no user. Redirecting.");
             window.location.href = 'signin.html'; // Redirect if no user on initial load
        }
    });


    // --- MetaMask Functions --- (Keep existing)
    async function handleMetaMaskPayment() {
        const statusEl = document.getElementById('metamaskStatusTab');
        const accountEl = document.getElementById('metamaskAccountTab');
        const networkEl = document.getElementById('metamaskNetworkTab');
        const errorEl = document.getElementById('metamaskErrorTab');
        const txEl = document.getElementById('metamaskTxTab');
        const payBtn = document.querySelector('.metamask-pay-btn');

        // Clear previous error messages
        if (errorEl) errorEl.textContent = '';
        if (txEl) txEl.textContent = '';

        try {
             // Initialize Web3 **first** to ensure ethers is available
             await initializeWeb3(); // Moved initialization here

            // Check if already connected (check provider/signer existence too)
            if (connectedAccount && provider && signer && walletContract) {
                if (statusEl) statusEl.textContent = 'Already Connected!';
                if (accountEl) accountEl.textContent = `Account: ${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`;

                // Ensure network is correct before proceeding
                await checkAndSwitchNetwork();
                 if (networkEl) networkEl.textContent = 'Network: Holesky Testnet';


                // Update button for payment
                if (payBtn) {
                    payBtn.disabled = false; // Ensure enabled if already connected
                    payBtn.innerHTML = 'Confirm Payment';
                    payBtn.onclick = sendTransactionViaContract; // Re-assign just in case
                }
                // If already connected and initialized, directly try to send
                // await sendTransactionViaContract(); // Maybe start payment directly? Or wait for button click? Let's wait.
                return;
            }


            if (payBtn) {
                payBtn.disabled = true;
                payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            }

            // Connect MetaMask
            const account = await connectMetaMask();
            if (statusEl) statusEl.textContent = 'Connected!';
            if (accountEl) accountEl.textContent = `Account: ${account.slice(0, 6)}...${account.slice(-4)}`;

            // Check and switch network
            await checkAndSwitchNetwork();
            if (networkEl) networkEl.textContent = 'Network: Holesky Testnet';

            // Update button for payment
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.innerHTML = 'Confirm Payment';
                payBtn.onclick = sendTransactionViaContract;
            }

        } catch (error) {
            console.error("MetaMask setup/payment initiation error:", error);
            let errorMessage = error.message || 'An unknown error occurred.';

            // More user-friendly error messages
            if (error.code === -32002) {
                errorMessage = "MetaMask request pending. Please check your MetaMask popup.";
            } else if (error.code === 4001) {
                errorMessage = "You rejected the connection or transaction request.";
            } else if (error.message && error.message.includes("MetaMask not found")) {
                errorMessage = "MetaMask not found! Please install MetaMask.";
            }

            if (errorEl) errorEl.textContent = `Error: ${errorMessage}`;
            if (statusEl) statusEl.textContent = 'Connection/Setup Failed';
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.innerHTML = 'Retry Connection';
                payBtn.onclick = handleMetaMaskPayment; // Re-assign connect handler on retry
            }
            // Don't re-throw here, let the UI show the error message
        }
    }

    async function initializeWeb3() {
        // Check if ethers is loaded globally
        if (typeof window.ethers === 'undefined') {
             console.error("Ethers library not loaded when initializeWeb3 called.");
            throw new Error("Ethers.js library is required but not loaded.");
        }
         if (!window.ethereum) {
            throw new Error("MetaMask not found! Please install MetaMask.");
        }

        try {
            // Only create new instances if they don't exist or provider changed
            if (!provider || !(provider instanceof ethers.providers.Web3Provider)) {
                 provider = new ethers.providers.Web3Provider(window.ethereum, "any"); // Specify "any" network initially
                 console.log("New Web3Provider created.");
            }
            if (!signer || (await signer.getAddress() !== connectedAccount)) { // Re-get signer if account changed
                 signer = provider.getSigner();
                 console.log("New Signer obtained.");
            }
             if (!walletContract || walletContract.signer !== signer) { // Re-create contract if signer changed
                walletContract = new ethers.Contract(
                    WALLET_CONTRACT_ADDRESS,
                    WALLET_CONTRACT_ABI,
                    signer // Use the current signer
                );
                 console.log("New Contract instance created.");
             }

             // Listen for account changes
             window.ethereum.on('accountsChanged', (accounts) => {
                console.log('MetaMask accounts changed:', accounts);
                if (accounts.length === 0) {
                    // MetaMask is locked or user disconnected all accounts
                    console.log('MetaMask disconnected.');
                    connectedAccount = null;
                    signer = null;
                    walletContract = null;
                    // Update UI to reflect disconnection in payment tab if open
                    const statusEl = document.getElementById('metamaskStatusTab');
                    const accountEl = document.getElementById('metamaskAccountTab');
                    const payBtn = document.querySelector('.metamask-pay-btn');
                    if (statusEl) statusEl.textContent = 'Disconnected';
                    if (accountEl) accountEl.textContent = 'Account: Not Connected';
                    if (payBtn) {
                         payBtn.disabled = false;
                         payBtn.innerHTML = 'Connect MetaMask';
                         payBtn.onclick = handleMetaMaskPayment;
                    }
                } else {
                    // Account switched
                    connectedAccount = accounts[0];
                    console.log('Switched to account:', connectedAccount);
                     // Re-initialize signer and contract immediately
                     initializeWeb3().catch(console.error);
                     // Update UI in payment tab if open
                    const statusEl = document.getElementById('metamaskStatusTab');
                    const accountEl = document.getElementById('metamaskAccountTab');
                    const payBtn = document.querySelector('.metamask-pay-btn');
                    if (statusEl) statusEl.textContent = 'Connected (Account Changed)';
                    if (accountEl) accountEl.textContent = `Account: ${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`;
                    if (payBtn) {
                         payBtn.disabled = false;
                         payBtn.innerHTML = 'Confirm Payment';
                         payBtn.onclick = sendTransactionViaContract;
                     }

                }
            });

            // Listen for chain changes
             window.ethereum.on('chainChanged', (chainId) => {
                console.log('MetaMask chain changed to:', chainId);
                 // Reload the page or re-initialize provider/network state is often safest
                 window.location.reload();
                 // Or, attempt to handle dynamically:
                 // initializeWeb3().then(checkAndSwitchNetwork).catch(console.error);
                 // updateNetworkDisplay(chainId);
            });


            return true;
        } catch (error) {
            console.error("Failed to initialize Web3 components:", error);
             // Reset related variables on failure
             provider = null;
             signer = null;
             walletContract = null;
            return false;
        }
    }

    async function connectMetaMask() {
         if (!window.ethereum) {
             throw new Error("MetaMask not found!");
         }
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts' // Request connection
            });

            if (!accounts || accounts.length === 0) {
                throw new Error("No accounts found or access denied");
            }

            connectedAccount = accounts[0]; // Store globally
             console.log("MetaMask connected with account:", connectedAccount);
             // Important: Re-initialize signer/contract after successful connection
             await initializeWeb3();
            return connectedAccount;

        } catch (error) {
            console.error("MetaMask connection error:", error);
             connectedAccount = null; // Reset on error
            throw error; // Re-throw to be handled by handleMetaMaskPayment
        }
    }

    async function checkAndSwitchNetwork() {
         if (!window.ethereum || !provider) {
            throw new Error("MetaMask or provider not available for network check.");
         }
         const network = await provider.getNetwork(); // Use ethers provider method
         const chainId = `0x${network.chainId.toString(16)}`; // Format as hex string
         console.log("Current network Chain ID:", chainId);

        if (chainId !== HOLESKY_CHAIN_ID) {
            console.log(`Switching network from ${chainId} to ${HOLESKY_CHAIN_ID}`);
             const networkEl = document.getElementById('metamaskNetworkTab');
             if (networkEl) networkEl.textContent = 'Switching Network...';
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: HOLESKY_CHAIN_ID }],
                });
                 console.log("Network switch successful.");
                 // Wait a moment for the provider to update after switch
                 await new Promise(resolve => setTimeout(resolve, 500));
                 // Re-verify network after switch (optional but good practice)
                 const newNetwork = await provider.getNetwork();
                 if (`0x${newNetwork.chainId.toString(16)}` !== HOLESKY_CHAIN_ID) {
                     throw new Error("Network did not switch correctly.");
                 }

            } catch (error) {
                console.error("Network switch error:", error);
                if (error.code === 4902) { // Chain not added
                    console.log("Holesky network not found in MetaMask, attempting to add...");
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: HOLESKY_CHAIN_ID,
                                chainName: 'Holesky',
                                nativeCurrency: { name: 'Holesky ETH', symbol: 'ETH', decimals: 18 },
                                rpcUrls: [HOLESKY_RPC_URL],
                                blockExplorerUrls: [HOLESKY_EXPLORER_URL]
                            }],
                        });
                         console.log("Holesky network added successfully.");
                         // Wait after adding too
                         await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (addError) {
                         console.error("Failed to add Holesky network:", addError);
                         throw new Error("Failed to add or switch to the required Holesky network.");
                    }
                } else if (error.code === 4001) { // User rejected switch
                     throw new Error("You rejected the network switch request.");
                 } else {
                    throw new Error(`Failed to switch network: ${error.message}`); // Re-throw other errors
                }
            }
        } else {
            console.log("Already on the correct network (Holesky).");
        }
    }

    async function sendTransactionViaContract() {
        const statusEl = document.getElementById('metamaskStatusTab');
        const errorEl = document.getElementById('metamaskErrorTab');
        const txEl = document.getElementById('metamaskTxTab');
        const payBtn = document.querySelector('.metamask-pay-btn');

        // Ensure button exists and disable it
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }
        if (errorEl) errorEl.textContent = ''; // Clear previous errors
         if (txEl) txEl.textContent = '';

        try {
            // --- Pre-flight checks ---
            if (!provider || !signer || !walletContract) {
                 // Attempt re-initialization if something is missing
                 console.warn("Web3 components missing, attempting re-initialization before transaction.");
                 await initializeWeb3();
                 if (!provider || !signer || !walletContract) { // Check again
                     throw new Error("MetaMask connection or smart contract not properly initialized. Please reconnect.");
                 }
            }
            if (!connectedAccount) {
                 throw new Error("MetaMask account is not connected. Please connect.");
            }
             // Verify account consistency
             const currentSignerAddress = await signer.getAddress();
             if (currentSignerAddress.toLowerCase() !== connectedAccount.toLowerCase()) {
                 console.warn("Signer address mismatch, re-initializing signer.");
                 await initializeWeb3(); // Re-init to get correct signer
                 if ((await signer.getAddress()).toLowerCase() !== connectedAccount.toLowerCase()) {
                     throw new Error("Account mismatch. Please ensure the correct account is selected in MetaMask.");
                 }
             }
            await checkAndSwitchNetwork(); // Ensure correct network

            if (currentAddAmountEth <= 0) {
                 throw new Error("Invalid amount calculated for deposit.");
            }

            if (statusEl) statusEl.textContent = 'Preparing transaction...';

            // Convert USD amount to ETH using ethers utils
            const ethValue = ethers.utils.parseEther(currentAddAmountEth.toFixed(18)); // Use toFixed for precision before parsing
             console.log(`Attempting to deposit ${ethers.utils.formatEther(ethValue)} ETH ($${currentAddAmount}) to contract ${WALLET_CONTRACT_ADDRESS}`);

            // Send transaction to contract's deposit function
            const tx = await walletContract.deposit({ value: ethValue });
            console.log("Transaction submitted:", tx.hash);

            if (statusEl) statusEl.textContent = 'Transaction submitted...';
            if (txEl) txEl.innerHTML = `Tx Hash: <a href="${HOLESKY_EXPLORER_URL}/tx/${tx.hash}" target="_blank" rel="noopener noreferrer">${tx.hash.substring(0,10)}...</a>`;

            // Wait for confirmation (usually 1 block is sufficient for UI update)
             if (statusEl) statusEl.textContent = 'Waiting for confirmation...';
            let receipt;
            try {
                receipt = await tx.wait(1); // Wait for 1 confirmation
                console.log("Transaction confirmed:", receipt);
            } catch (waitError) {
                console.error("Error waiting for transaction confirmation:", waitError);
                // Handle transaction replacement cases more robustly
                if (waitError.code === 'TRANSACTION_REPLACED') {
                    if (!waitError.cancelled) {
                        receipt = waitError.receipt; // Use the replacement receipt
                        console.log("Transaction was replaced/repriced and confirmed:", receipt);
                    } else {
                        throw new Error("Transaction was cancelled.");
                    }
                } else {
                    // Could be timeout or other network issue
                     throw new Error(`Transaction confirmation failed: ${waitError.reason || waitError.message}`);
                }
            }

            if (receipt && receipt.status === 1) {
                // --- Transaction SUCCESSFUL on Blockchain ---
                if (statusEl) statusEl.textContent = 'Transaction confirmed!';
                console.log("Transaction successful on blockchain. Updating database...");

                try {
                    // Update balance in database using the RPC call
                    const { data: newBalance, error: rpcError } = await supabaseClient.rpc(
                        'add_funds_and_log',
                        {
                            amount_to_add: currentAddAmount, // Log the USD amount
                            description_text: `Metamask Deposit - TX: ${receipt.transactionHash.substring(0, 10)}...`
                        }
                    );

                    if (rpcError) {
                        // Database update failed AFTER successful blockchain transaction
                        console.error("DATABASE UPDATE FAILED after blockchain success:", rpcError);
                        throw new Error(`Blockchain transaction succeeded (${receipt.transactionHash.substring(0,6)}...) but failed to update database: ${rpcError.message}. Please contact support.`);
                    }

                    // --- Database Update SUCCESSFUL ---
                    currentBalance = parseFloat(newBalance);
                    updateBalanceDisplay();
                    await fetchTransactions(); // Refresh transaction list
                    handlePaymentSuccess(currentAddAmount); // Update UI for success
                    console.log("Database updated successfully. Balance:", currentBalance);

                     // Remove pending update if it existed for this tx
                     localStorage.removeItem(`pendingUpdate_${receipt.transactionHash}`);


                } catch (dbError) {
                    // --- Handle Database Update Failure Specifically ---
                    console.error("Error during database update phase:", dbError);
                    // Blockchain succeeded, but DB failed. Critical error.
                     if (errorEl) errorEl.textContent = dbError.message; // Show specific DB error
                    if (statusEl) statusEl.textContent = 'DB Update Failed!';
                     // Store pending update for potential recovery
                     const pendingUpdate = {
                        txHash: receipt.transactionHash,
                        amount: currentAddAmount,
                        timestamp: Date.now()
                     };
                     // Use txHash as key for easier lookup/removal
                    localStorage.setItem(`pendingUpdate_${receipt.transactionHash}`, JSON.stringify(pendingUpdate));
                     alert("IMPORTANT: Your deposit was confirmed on the blockchain, but there was an issue updating your WalletWise balance. Please note down your Transaction Hash and contact support if your balance doesn't update automatically soon.");
                     // Still call handlePaymentSuccess to close the modal, as the funds *were* deposited
                     handlePaymentSuccess(currentAddAmount);
                }

            } else {
                // --- Transaction FAILED on Blockchain ---
                console.error("Transaction failed on blockchain. Receipt:", receipt);
                throw new Error(`Transaction failed on the blockchain (Status: ${receipt ? receipt.status : 'unknown'}). Check Etherscan for details.`);
            }

        } catch (error) {
            // --- General Error Handling for the whole process ---
            console.error("MetaMask Transaction Failed:", error);
            let errorMessage = error.message || 'An unknown transaction error occurred.';
             if (error.code === 4001) { // User rejected the transaction in MetaMask
                 errorMessage = "You rejected the transaction in MetaMask.";
             } else if (error.code === 'INSUFFICIENT_FUNDS') {
                 errorMessage = "Insufficient ETH funds for transaction cost (gas).";
             } else if (error.reason) { // Ethers often includes a reason
                 errorMessage = error.reason;
             }
            // Clean up specific phrases
             errorMessage = errorMessage.replace('execution reverted: ', '');

            if (errorEl) errorEl.textContent = `Error: ${errorMessage}`;
            if (statusEl) statusEl.textContent = 'Transaction Failed';
            // Don't call handlePaymentFailure here directly as it shows a generic alert
            // Instead, keep the modal open with the specific error.
            // alert(`Transaction Failed: ${errorMessage}`); // Avoid generic alert

        } finally {
            // Re-enable the button ONLY if it still exists
             if (payBtn) {
                 payBtn.disabled = false;
                 payBtn.innerHTML = 'Confirm Payment'; // Reset text
                 payBtn.onclick = sendTransactionViaContract; // Ensure correct handler
             }
        }
    }

    // --- Function to check and recover pending updates on load ---
    async function checkAndRecoverPendingUpdates() {
         console.log("Checking for pending database updates...");
         let recoveredCount = 0;
         const keysToRemove = [];

         for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('pendingUpdate_')) {
                 try {
                     const update = JSON.parse(localStorage.getItem(key));
                     const txHash = key.replace('pendingUpdate_', '');

                     // Only try to recover if the update is less than, say, 3 days old
                     if (Date.now() - update.timestamp < 3 * 24 * 60 * 60 * 1000) {
                         console.log(`Attempting recovery for TX: ${txHash}, Amount: ${update.amount}`);

                         // IMPORTANT: Before recovering, ideally verify TX status on blockchain again
                         // This requires an Etherscan API key or public RPC node query - complex for frontend.
                         // For now, assume if it's stored, it likely succeeded.

                         const { data: newBalance, error: rpcError } = await supabaseClient.rpc(
                             'add_funds_and_log',
                             {
                                 amount_to_add: update.amount,
                                 description_text: `Recovered Deposit - TX: ${txHash.substring(0, 10)}...`
                             }
                         );

                         if (!rpcError) {
                             console.log(`Successfully recovered TX: ${txHash}. New balance: ${newBalance}`);
                             // Don't update UI balance here directly, let loadInitialData handle it
                             keysToRemove.push(key); // Mark for removal
                             recoveredCount++;
                         } else {
                             console.error(`Failed to recover pending update for TX ${txHash}:`, rpcError);
                             // Maybe remove very old failed recoveries?
                             if (Date.now() - update.timestamp > 7 * 24 * 60 * 60 * 1000) { // Older than 7 days
                                 keysToRemove.push(key);
                             }
                         }
                     } else {
                         // Clear very old pending updates silently
                         console.log(`Removing expired pending update: ${key}`);
                         keysToRemove.push(key);
                     }
                 } catch (error) {
                     console.error(`Error processing pending update key ${key}:`, error);
                     keysToRemove.push(key); // Remove corrupted item
                 }
            }
         }

         // Remove processed keys from localStorage
         keysToRemove.forEach(key => localStorage.removeItem(key));

         if (recoveredCount > 0) {
             console.log(`Finished recovery check. ${recoveredCount} updates potentially recovered.`);
             // Force a refresh of data after recovery attempts
             // Note: loadInitialData might already be running via Auth listener,
             // but an extra fetch ensures recovery is reflected.
             await fetchProfileAndBalance();
             await fetchTransactions();
         } else {
            console.log("No pending updates needed recovery.");
         }
     }

     // Initial check for pending updates after user might be loaded
     if (currentUser) { // Only run if user loaded initially
         await checkAndRecoverPendingUpdates();
     }


    // Ensure initial data load happens if not triggered by auth listener fast enough
    // but wait a tiny bit for the auth listener to potentially fire first
    setTimeout(async () => {
        if (!currentUser && window.location.pathname.includes('index.html')) { // Check if still no user and on dashboard page
            console.log("No user session found after delay, redirecting.");
            window.location.href = '/auth.html';
        } else if (currentUser && !document.querySelector('.dashboard-layout').style.display || document.querySelector('.dashboard-layout').style.display === 'none') {
            // If user exists but layout is hidden (maybe auth listener was slow/missed)
            console.log("User found, but layout hidden. Attempting data load manually.");
             await loadInitialData();
             await checkAndRecoverPendingUpdates(); // Also check recovery here
        }
    }, 500); // Wait 500ms


}); // End DOMContentLoaded