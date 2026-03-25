let isAppInitialized = false;
let currentUser = null;
const supabaseClient = window.supabaseClient;
document.addEventListener('DOMContentLoaded', async () => {
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
    let currentProfile = null;
    let currentAddAmount = 0;
    let currentAddAmountEth = 0;
    let connectedAccount = null;
    let userGroups = [];

    // =============================================
    // SEPOLIA NETWORK CONFIG (updated from Holesky)
    // =============================================
    const WALLET_CONTRACT_ADDRESS = '0xbf3c70F804a92fBe17e0C18DA7347559Bc6B5ae4'; // Your deployed Sepolia contract
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

    const SEPOLIA_CHAIN_ID = '0xaa36a7';   // Chain ID: 11155111
    const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
    const SEPOLIA_EXPLORER_URL = 'https://sepolia.etherscan.io';
    const ETH_TO_USD_RATE = 3500;

    let walletContract;
    let signer;

    // =============================================
    // SUPABASE DATA FUNCTIONS
    // =============================================

    async function getCurrentUser() {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) console.error("getCurrentUser Error:", error);
        return (user && user.id) ? user : null;
    }

    async function fetchProfileAndBalance() {
        // 1. Safety Check: If currentUser hasn't been set yet, don't crash
    if (!currentUser || !currentUser.id) {
        console.error("fetchProfileAndBalance: No current user found!");
        return; 
    }
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
        console.log(`[findUserByEmail] Start: Searching for ${email}`);
        if (!email) {
            console.log("[findUserByEmail] End: No email provided.");
            return null;
        }
        try {
            console.log('before query');

            const { data, error, status } = await supabaseClient
                .from('profiles')
                .select('id, username')
                .eq('email', email.trim().toLowerCase())
                .maybeSingle();

            console.log('after query');

            if (error && status !== 406) {
                console.error("[findUserByEmail] Supabase Query Error:", error);
                return null;
            }

            return data;
        } catch (catchError) {
            console.error("[findUserByEmail] CATCH block error:", catchError);
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
                { amount_to_add: amount, description_text: description }
            );

            if (error) throw error;

            currentBalance = parseFloat(newBalance);
            updateBalanceDisplay();
            await fetchTransactions();

            return { success: true, newBalance: currentBalance };
        } catch (error) {
            console.error("addFundsViaRPC Error:", error);
            return { success: false, error: `Failed to add funds: ${error.message || 'Unknown error'}` };
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
            return { success: false, error: `Failed to log transaction: ${error.message || 'Unknown error'}` };
        }
    }

    async function updateProfile(updateData) {
        console.log("updateProfile:", updateData);
        if (!currentUser) return { success: false, error: "User not logged in" };
        if (Object.keys(updateData).length === 0) { return { success: true, error: null }; }
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
            const { data: successMessage, error } = await supabaseClient.rpc('transfer_funds', {
                recipient_identifier: recipientIdentifier.trim(),
                amount_to_transfer: roundedAmount,
                note: note || ''
            });

            if (error) {
                let errorMessage = error.message || 'An unknown error occurred during transfer.';
                if (errorMessage.includes('INSUFFICIENT_FUNDS')) errorMessage = 'Insufficient funds for this transfer.';
                else if (errorMessage.includes('RECIPIENT_NOT_FOUND')) errorMessage = `Recipient "${recipientIdentifier}" not found.`;
                else if (errorMessage.includes('SELF_TRANSFER_ERROR')) errorMessage = 'You cannot send funds to yourself.';
                else if (errorMessage.includes('INVALID_AMOUNT')) errorMessage = 'Transfer amount must be positive.';
                throw new Error(errorMessage);
            }

            await fetchProfileAndBalance();
            await fetchTransactions();

            return { success: true, data: { message: successMessage } };
        } catch (error) {
            console.error("sendMoneyViaRPC CATCH:", error);
            return { success: false, error: `Transfer Failed: ${error.message}` };
        }
    }

    async function ensureProfileUsername() {
        if (currentUser && currentProfile && !currentProfile.username) {
            const authUsername = currentUser.user_metadata?.username;
            if (authUsername) {
                updateProfile({ username: authUsername }).catch(err => console.error("Background username update failed:", err));
            }
        }
    }
    

async function fetchUserGroups() {
    // This fetches groups AND their members in ONE single network request
    const { data: groups, error } = await supabaseClient
        .from("groups")
        .select(`
            *,
            group_members (
                user_id,
                contribution_amount,
                profiles (username, email)
            )
        `);

    if (error) {
        console.error("Fetch error:", error);
        return;
    }

    displayUserGroups(groups);
}

    async function createGroupViaRPC(groupName, selectedMemberIds) {
        if (!currentUser) return { success: false, error: "User not logged in" };
        if (!groupName || selectedMemberIds.length === 0) {
            return { success: false, error: "Group name and at least one member are required." };
        }
        const memberIdsForRPC = [...new Set(selectedMemberIds)];
        try {
            const { data, error } = await supabaseClient.rpc('create_group_with_members', {
                group_name_param: groupName,
                member_ids_param: memberIdsForRPC
            });
            if (error) throw error;
            await fetchUserGroups();
            return { success: true, data: data };
        } catch (error) {
            console.error("createGroupViaRPC CATCH:", error);
            return { success: false, error: `Failed to create group: ${error.message}` };
        }
    }

    async function contributeToGroupViaRPC(groupId, amount) {
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
            currentBalance = parseFloat(newBalance);
            updateBalanceDisplay();
            await fetchUserGroups();
            await fetchTransactions();
            return { success: true, data: { newBalance: currentBalance } };
        } catch (error) {
            console.error("contributeToGroupViaRPC CATCH:", error);
            return { success: false, error: `Failed to contribute: ${error.message}` };
        }
    }

    async function withdrawFromGroupViaRPC(groupId, amount) {
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
                let errorMessage = error.message || 'An unknown error occurred during withdrawal.';
                if (errorMessage.includes('INSUFFICIENT_CONTRIBUTION')) errorMessage = 'Withdrawal amount exceeds your contribution to this group.';
                else if (errorMessage.includes('NOT_A_MEMBER')) errorMessage = 'You are not a member of this group.';
                throw new Error(errorMessage);
            }
            currentBalance = parseFloat(newBalance);
            updateBalanceDisplay();
            await fetchUserGroups();
            await fetchTransactions();
            return { success: true, data: { newBalance: currentBalance } };
        } catch (error) {
            console.error("withdrawFromGroupViaRPC CATCH:", error);
            return { success: false, error: `Withdrawal Failed: ${error.message}` };
        }
    }

    // =============================================
    // DISPLAY & UI FUNCTIONS
    // =============================================

    function updateBalanceDisplay() {
        if (balanceAmountEl) balanceAmountEl.textContent = `$${currentBalance.toFixed(2)}`;
    }

    function updateProfileCard(username) {
        const profileNameEl = document.getElementById('profileCardName');
        const profileUpiIdEl = document.getElementById('profileCardUpiId');
        const profilePhoneEl = document.getElementById('profileCardPhone');
        const displayName = currentProfile?.full_name || currentProfile?.username || username || 'User';
        const displayUsername = currentProfile?.username || username || 'user';
        if (profileNameEl) profileNameEl.textContent = displayName;
        if (profileUpiIdEl) profileUpiIdEl.textContent = `${displayUsername}@walletwise`;
        if (profilePhoneEl) profilePhoneEl.textContent = currentProfile?.phone_number || 'Not Set';
    }

    function populateSettingsForm(profileData) {
        if (!profileForm) return;
        const data = profileData || {};
        if (profileNameInput) profileNameInput.value = data.full_name ?? '';
        if (profileUsernameInput) profileUsernameInput.value = data.username ?? '';
        if (profileEmailInput) profileEmailInput.value = data.email ?? currentUser?.email ?? '';
        if (profilePhoneInput) profilePhoneInput.value = data.phone_number ?? '';
        if (profileUsernameInput) profileUsernameInput.disabled = true;
        if (profileEmailInput) profileEmailInput.disabled = true;
        if (profileNameInput) profileNameInput.disabled = false;
        if (profilePhoneInput) profilePhoneInput.disabled = false;
    }

    function displayTransactions(listElement, transactionArray, limit = null) {
        if (!listElement) return;
        listElement.innerHTML = '';
        if (!Array.isArray(transactionArray)) { listElement.innerHTML = '<li class="placeholder">Error</li>'; return; }

        const transactionsToDisplay = limit ? transactionArray.slice(0, limit) : transactionArray;

        if (transactionsToDisplay.length === 0) { listElement.innerHTML = '<li class="transaction-item placeholder">No transactions yet.</li>'; return; }

        transactionsToDisplay.forEach(tx => {
            const listItem = document.createElement('li');
            listItem.classList.add('transaction-item');
            const isIncome = tx.type === 'income';
            const typeClass = isIncome ? 'income' : (tx.type === 'bill' || tx.type === 'recharge' ? `${tx.type}-payment` : 'expense');
            let iconClass = 'fa-exchange-alt';
            if (isIncome) iconClass = 'fa-arrow-down';
            else if (tx.type === 'recharge') iconClass = 'fa-mobile-alt';
            else if (tx.type === 'bill') iconClass = 'fa-file-invoice';
            else if (tx.type === 'expense') iconClass = 'fa-arrow-up';
            const amountSign = isIncome ? '+' : '-';
            const amountClass = isIncome ? 'positive' : 'negative';
            const statusClass = tx.status ? tx.status.toLowerCase() : 'completed';
            listItem.classList.add(typeClass, statusClass);
            const displayAmount = Math.abs(tx.amount).toFixed(2);

            const txDate = tx.timestamp;
            const isValidDate = txDate instanceof Date && !isNaN(txDate);
            const dateString = isValidDate ? txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date';
            const timeString = isValidDate ? txDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '';

            if (listElement.id === 'full-transaction-list') {
                listItem.innerHTML = `<div><span><i class="fas ${iconClass}"></i> ${tx.description || tx.type}</span><small>${dateString}${timeString ? ', ' + timeString : ''} | TXN ID: ${tx.id}</small></div><div class="status-amount"><span class="amount ${amountClass}">${amountSign}${displayAmount}</span><span class="status-badge ${statusClass}">${tx.status || 'Completed'}</span></div>`;
            } else {
                listItem.innerHTML = `<span><i class="fas ${iconClass}"></i> ${tx.description || tx.type}</span><span class="amount ${amountClass}">${amountSign}${displayAmount}</span>`;
            }
            listElement.appendChild(listItem);
        });
    }

    function displayFullContacts(listElement, contactArray) {
        if (!listElement) return;
        listElement.innerHTML = '';
        if (!Array.isArray(contactArray) || contactArray.length === 0) {
            listElement.innerHTML = '<li class="contact-list-item placeholder">No contacts found.</li>';
            return;
        }
        contactArray.forEach(contact => {
            const listItem = document.createElement('li');
            listItem.classList.add('contact-list-item');
            listItem.dataset.contactId = contact.id;
            listItem.innerHTML = `<div class="contact-info"><i class="fas ${contact.icon || 'fa-user-circle'}"></i><div class="details"><span class="contact-name">${contact.name}</span><span class="contact-detail">${contact.detail || ''}</span></div></div><div class="contact-actions"><button class="action-btn-small send-contact-btn" data-contact-name="${contact.name}" data-contact-detail="${contact.detail || ''}"><i class="fas fa-paper-plane"></i> Send</button><button class="action-btn-small details-contact-btn"><i class="fas fa-ellipsis-h"></i> Details</button></div>`;
            listElement.appendChild(listItem);
        });
    }

    function displayQuickContacts(listElement, contactArray, limit = 3) {
        if (!listElement) return;
        listElement.innerHTML = '';
        if (!Array.isArray(contactArray)) { listElement.innerHTML = '<li class="contact-item placeholder">Error</li>'; return; }
        const contactsToDisplay = contactArray.slice(0, limit);
        if (contactsToDisplay.length === 0) { listElement.innerHTML = '<li class="contact-item placeholder">No frequent contacts yet.</li>'; return; }
        contactsToDisplay.forEach(contact => {
            const listItem = document.createElement('li');
            listItem.classList.add('contact-item');
            listItem.dataset.contactId = contact.id;
            listItem.innerHTML = `<i class="fas ${contact.icon || 'fa-user-circle'}"></i><span>${contact.name}</span><button class="action-btn-small send-contact-btn" data-contact-name="${contact.name}" data-contact-detail="${contact.detail || ''}"><i class="fas fa-paper-plane"></i> Send</button>`;
            listElement.appendChild(listItem);
        });
    }

    function displayUserGroups(groupsArray) {
        if (!currentUser || !currentUser.id) {
        console.warn("Display called before currentUser was ready.");
        return; 
    }
    if (!groupListUl) return;
    groupListUl.innerHTML = '';

    if (!Array.isArray(groupsArray) || groupsArray.length === 0) {
        groupListUl.innerHTML = '<li class="group-item placeholder">You are not part of any groups yet.</li>';
        return;
    }

    groupsArray.forEach(group => {
        const groupItem = document.createElement('li');
        groupItem.classList.add('group-item');
        groupItem.dataset.groupId = group.id;

        let calculatedTotalContribution = 0;
        let currentUserContribution = 0;

        // Safely check if group_members exists
        const members = group.group_members || [];

        members.forEach(member => {
            const contribution = parseFloat(member.contribution_amount || 0);
            calculatedTotalContribution += contribution;
            if (member.user_id === currentUser.id) currentUserContribution = contribution;
        });

        const canWithdraw = currentUserContribution > 0;

        groupItem.innerHTML = `
            <div class="group-item-header">
                <h4><i class="fas fa-users"></i> ${group.name || 'Unnamed Group'}</h4>
                <span class="group-total-contribution">Total: $${calculatedTotalContribution.toFixed(2)}</span>
            </div>
            <div class="group-item-body">
                <button class="group-members-toggle" aria-expanded="false">
                    View Members (${members.length}) <i class="fas fa-chevron-down"></i>
                </button>
                <ul class="group-members-list">
                    ${members.length > 0
                        ? members.map(member => {
                            // Ensure profile data mapping matches your Supabase schema
                            const memberName = member.profiles?.username || member.profiles?.email || "Member";
                            const contribution = parseFloat(member.contribution_amount || 0).toFixed(2);
                            return `<li class="group-member-item">
                                        <span class="member-name">${memberName} ${member.user_id === currentUser.id ? '(You)' : ''}</span>
                                        <span class="member-contribution">$${contribution}</span>
                                    </li>`;
                        }).join('')
                        : '<li class="group-member-item placeholder">No members found.</li>'
                    }
                </ul>
            </div>
            <div class="group-actions">
                <button class="action-btn-small contribute-to-group-btn" data-group-id="${group.id}" data-group-name="${group.name}">
                    <i class="fas fa-donate"></i> Contribute
                </button>
                <button class="action-btn-small withdraw-from-group-btn"
                        data-group-id="${group.id}"
                        data-group-name="${group.name}"
                        data-user-contribution="${currentUserContribution}"
                        ${!canWithdraw ? 'disabled title="No contribution to withdraw"' : ''}>
                    <i class="fas fa-hand-holding-usd"></i> Withdraw
                </button>
            </div>
        `;
        groupListUl.appendChild(groupItem);
    });
}
    // =============================================
    // MODAL FUNCTIONS
    // =============================================

    function showModal() {
        if (!addMoneyModal) return;
        if (modalStageAmount) modalStageAmount.style.display = 'block';
        if (modalStagePayment) modalStagePayment.style.display = 'none';
        if (modalStageSuccess) modalStageSuccess.style.display = 'none';
        if (paymentGatewayContent) paymentGatewayContent.innerHTML = '';
        if (amountToAddInput) amountToAddInput.value = '';
        currentAddAmount = 0;
        currentAddAmountEth = 0;
        addMoneyModal.style.display = 'flex';
        setTimeout(() => { if (addMoneyModal) addMoneyModal.classList.add('visible'); }, 10);
    }

    function hideModal() {
        if (!addMoneyModal) return;
        addMoneyModal.classList.remove('visible');
        setTimeout(() => { if (addMoneyModal) addMoneyModal.style.display = 'none'; }, 300);
    }

    function showCreateGroupModal() {
        if (!createGroupModal) return;
        if (createGroupForm) createGroupForm.reset();
        if (createGroupError) { createGroupError.textContent = ''; createGroupError.style.display = 'none'; }
        if (submitCreateGroupBtn) {
            submitCreateGroupBtn.disabled = false;
            submitCreateGroupBtn.innerHTML = 'Create Group <i class="fas fa-check"></i>';
        }
        if (groupMembersSelect) {
            groupMembersSelect.innerHTML = '';
            if (contacts.length > 0) {
                contacts.forEach(async (contact) => {
                    if (contact.detail) {
                        const contactUserProfile = await findUserByEmail(contact.detail);
                        if (contactUserProfile && contactUserProfile.id && contactUserProfile.id !== currentUser.id) {
                            const option = document.createElement('option');
                            option.value = contactUserProfile.id;
                            option.textContent = `${contact.name} (${contact.detail})`;
                            groupMembersSelect.appendChild(option);
                        }
                    }
                });
            } else {
                groupMembersSelect.innerHTML = '<option disabled>No contacts to add. Add contacts first.</option>';
            }
        }
        createGroupModal.style.display = 'flex';
        setTimeout(() => { if (createGroupModal) createGroupModal.classList.add('visible'); }, 10);
    }

    function hideCreateGroupModal() {
        if (!createGroupModal) return;
        createGroupModal.classList.remove('visible');
        setTimeout(() => { createGroupModal.style.display = 'none'; }, 300);
    }

    function showContributeGroupModal(groupId, groupName) {
        if (!contributeGroupModal) return;
        if (contributeGroupForm) contributeGroupForm.reset();
        if (contributeGroupError) { contributeGroupError.textContent = ''; contributeGroupError.style.display = 'none'; }
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
        if (!withdrawGroupModal) return;
        if (withdrawGroupForm) withdrawGroupForm.reset();
        if (withdrawGroupError) { withdrawGroupError.textContent = ''; withdrawGroupError.style.display = 'none'; }
        if (submitWithdrawGroupBtn) {
            submitWithdrawGroupBtn.disabled = false;
            submitWithdrawGroupBtn.innerHTML = 'Withdraw Funds <i class="fas fa-hand-holding-usd"></i>';
        }
        if (withdrawGroupIdInput) withdrawGroupIdInput.value = groupId;
        if (withdrawGroupName) withdrawGroupName.textContent = `Withdraw from ${groupName}`;
        if (withdrawModalUserBalance) withdrawModalUserBalance.textContent = `$${currentBalance.toFixed(2)}`;
        if (withdrawModalUserContribution) withdrawModalUserContribution.textContent = `$${parseFloat(currentContribution || 0).toFixed(2)}`;
        if (withdrawalAmountInput) withdrawalAmountInput.max = parseFloat(currentContribution || 0).toFixed(2);
        withdrawGroupModal.style.display = 'flex';
        setTimeout(() => { withdrawGroupModal.classList.add('visible'); }, 10);
    }

    function hideWithdrawGroupModal() {
        if (!withdrawGroupModal) return;
        withdrawGroupModal.classList.remove('visible');
        setTimeout(() => { withdrawGroupModal.style.display = 'none'; }, 300);
    }

    function showAddTransactionModal() {
        if (addTransactionForm) addTransactionForm.reset();
        if (addTransactionModal) addTransactionModal.style.display = 'flex';
        setTimeout(() => { addTransactionModal.classList.add('visible'); }, 10);
    }

    function hideAddTransactionModal() {
        if (!addTransactionModal) return;
        addTransactionModal.classList.remove('visible');
        setTimeout(() => { addTransactionModal.style.display = 'none'; }, 300);
    }

    function showAddContactModal() {
        if (!addContactModal) return;
        if (addContactFormModal) addContactFormModal.reset();
        if (contactModalError) { contactModalError.textContent = ''; contactModalError.style.display = 'none'; }
        if (submitAddContactBtn) {
            submitAddContactBtn.disabled = false;
            submitAddContactBtn.innerHTML = 'Add Contact <i class="fas fa-check"></i>';
        }
        addContactModal.style.display = 'flex';
        setTimeout(() => { addContactModal.classList.add('visible'); }, 10);
    }

    function hideAddContactModal() {
        if (!addContactModal) return;
        addContactModal.classList.remove('visible');
        setTimeout(() => { addContactModal.style.display = 'none'; }, 300);
    }

    // =============================================
    // PAYMENT STAGE FUNCTIONS
    // =============================================

    function showPaymentStage() {
        if (currentAddAmount <= 0) { alert("Invalid amount entered."); return; }
        if (!modalStageAmount || !modalStagePayment || !paymentGatewayLoading || !paymentGatewayContent) {
            alert("UI Error: Cannot load payment options. Please refresh.");
            return;
        }

        currentAddAmountEth = currentAddAmount / ETH_TO_USD_RATE;
        console.log(`showPaymentStage: Converting $${currentAddAmount} USD to ${currentAddAmountEth.toFixed(8)} ETH`);

        modalStageAmount.style.display = 'none';
        modalStagePayment.style.display = 'block';
        modalStageSuccess.style.display = 'none';
        paymentGatewayLoading.style.display = 'block';
        paymentGatewayContent.style.display = 'none';

        fetch('_paymentPage.html')
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then(html => {
                paymentGatewayContent.innerHTML = html;

                try {
                    if (typeof $ !== 'undefined' && typeof $.fn.easyResponsiveTabs === 'function') {
                        $('#horizontalTab').easyResponsiveTabs({ type: 'default', width: 'auto', fit: true });
                        console.log("easyResponsiveTabs initialized.");
                    } else {
                        throw new Error("Payment tabs cannot be initialized.");
                    }
                } catch (tabError) {
                    paymentGatewayContent.innerHTML = `<p class="error">Error loading payment tabs. ${tabError.message}</p>`;
                    paymentGatewayLoading.style.display = 'none';
                    paymentGatewayContent.style.display = 'block';
                    return;
                }

                updateGatewayAmountFields(currentAddAmount);
                updateMetaMaskAmountField(currentAddAmountEth);

                paymentGatewayLoading.style.display = 'none';
                paymentGatewayContent.style.display = 'block';
            })
            .catch(error => {
                paymentGatewayContent.innerHTML = `<p class="error" style="color: var(--negative); text-align: center;">Error loading payment options: ${error.message}.</p>`;
                paymentGatewayLoading.style.display = 'none';
                paymentGatewayContent.style.display = 'block';
            });
    }

    function updateGatewayAmountFields(amount) {
        const amountFields = paymentGatewayContent?.querySelectorAll('.payment-amount-field');
        if (amountFields && amountFields.length > 0) {
            const formattedAmount = `$${amount.toFixed(2)}`;
            amountFields.forEach(input => {
                if (input.tagName === 'INPUT') { input.value = formattedAmount; input.disabled = true; }
                else input.textContent = formattedAmount;
            });
        }
    }

    function updateMetaMaskAmountField(ethAmount) {
        const ethAmountField = paymentGatewayContent?.querySelector('.payment-amount-field-eth');
        if (ethAmountField) ethAmountField.textContent = `${ethAmount.toFixed(8)} ETH`;
    }

    function handlePaymentSuccess(amount) {
        if (modalStagePayment) modalStagePayment.style.display = 'none';
        if (modalStageSuccess) modalStageSuccess.style.display = 'block';
        const successMsgEl = document.getElementById('successMessage');
        if (successMsgEl) successMsgEl.textContent = `$${amount.toFixed(2)} added successfully!`;
        setTimeout(hideModal, 2500);
    }

    function handlePaymentFailure(errorMessage) {
        alert(`Payment Failed: ${errorMessage || 'An unknown error occurred.'}`);
    }

    // =============================================
    // EVENT LISTENERS
    // =============================================

    if (addMoneyBtn) addMoneyBtn.addEventListener('click', showModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
    if (addMoneyModal) addMoneyModal.addEventListener('click', (e) => { if (e.target === addMoneyModal) hideModal(); });
    if (modalBackToAmountBtn) {
        modalBackToAmountBtn.addEventListener('click', () => {
            if (modalStagePayment) modalStagePayment.style.display = 'none';
            if (modalStageSuccess) modalStageSuccess.style.display = 'none';
            if (modalStageAmount) modalStageAmount.style.display = 'block';
        });
    }
    if (addMoneyForm) {
        addMoneyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amountValue = parseFloat(amountToAddInput.value);
            if (isNaN(amountValue) || amountValue <= 0) { alert("Invalid amount."); return; }
            currentAddAmount = amountValue;
            showPaymentStage();
        });
    }

    if (openTransactionModalBtn) openTransactionModalBtn.addEventListener('click', showAddTransactionModal);
    if (closeTransactionModalBtn) closeTransactionModalBtn.addEventListener('click', hideAddTransactionModal);
    if (addTransactionModal) addTransactionModal.addEventListener('click', (e) => { if (e.target === addTransactionModal) hideAddTransactionModal(); });
    if (addTransactionForm) {
        addTransactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true; btn.textContent = "Logging...";
            const type = transactionTypeInput.value;
            const amount = parseFloat(transactionAmountInput.value);
            const description = transactionDescriptionInput.value.trim();
            if (!type || isNaN(amount) || amount <= 0) { alert("Invalid type or amount."); btn.disabled = false; btn.textContent = originalText; return; }
            const result = await logTransactionViaRPC(type, amount, description);
            if (result.success) hideAddTransactionModal();
            else alert(`Error: ${result.error}`);
            btn.disabled = false; btn.textContent = originalText;
        });
    }

    if (sendMoneyForm) {
        sendMoneyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true; btn.textContent = 'Sending...';
            const recipient = recipientInput.value.trim();
            const amount = parseFloat(sendAmountInput.value);
            const note = sendNoteInput.value.trim();
            if (!recipient || isNaN(amount) || amount <= 0) { alert("Invalid recipient or amount."); btn.disabled = false; btn.textContent = 'Send Securely'; return; }
            const result = await sendMoneyViaRPC(recipient, amount, note);
            if (result.success) { alert(`Successfully sent $${amount.toFixed(2)}!`); sendMoneyForm.reset(); }
            else alert(`Send Failed: ${result.error}`);
            btn.disabled = false; btn.textContent = 'Send Securely';
        });
    }

    if (contactSearchInput) {
        contactSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchTerm) || (c.detail && c.detail.toLowerCase().includes(searchTerm)));
            displayFullContacts(contactListFull, filteredContacts);
        });
    }

    if (addContactBtn) addContactBtn.addEventListener('click', showAddContactModal);

    if (createGroupBtn) createGroupBtn.addEventListener('click', showCreateGroupModal);
    if (closeCreateGroupModalBtn) closeCreateGroupModalBtn.addEventListener('click', hideCreateGroupModal);
    if (createGroupModal) createGroupModal.addEventListener('click', (e) => { if (e.target === createGroupModal) hideCreateGroupModal(); });
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const groupName = groupNameInput.value.trim();
            const selectedOptions = Array.from(groupMembersSelect.selectedOptions).map(o => o.value);
            if (!groupName) { createGroupError.textContent = 'Group name is required.'; createGroupError.style.display = 'block'; return; }
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

    if (closeContributeGroupModalBtn) closeContributeGroupModalBtn.addEventListener('click', hideContributeGroupModal);
    if (contributeGroupModal) contributeGroupModal.addEventListener('click', (e) => { if (e.target === contributeGroupModal) hideContributeGroupModal(); });
    if (contributeGroupForm) {
        contributeGroupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const groupId = contributeGroupIdInput.value;
            const amount = parseFloat(contributionAmountInput.value);
            if (isNaN(amount) || amount <= 0) { contributeGroupError.textContent = 'Invalid contribution amount.'; contributeGroupError.style.display = 'block'; return; }
            if (amount > currentBalance) { contributeGroupError.textContent = 'Insufficient wallet balance.'; contributeGroupError.style.display = 'block'; return; }
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

    if (groupListUl) {
        groupListUl.addEventListener('click', (e) => {
            const contributeBtn = e.target.closest('.contribute-to-group-btn');
            const toggleBtn = e.target.closest('.group-members-toggle');
            const withdrawBtn = e.target.closest('.withdraw-from-group-btn');
            if (contributeBtn) {
                e.preventDefault();
                showContributeGroupModal(contributeBtn.dataset.groupId, contributeBtn.dataset.groupName);
            } else if (toggleBtn) {
                e.preventDefault();
                const membersList = toggleBtn.nextElementSibling;
                if (membersList && membersList.classList.contains('group-members-list')) {
                    const isExpanded = membersList.classList.toggle('expanded');
                    toggleBtn.setAttribute('aria-expanded', isExpanded);
                    toggleBtn.classList.toggle('expanded', isExpanded);
                }
            } else if (withdrawBtn) {
                e.preventDefault();
                if (withdrawBtn.disabled) return;
                showWithdrawGroupModal(withdrawBtn.dataset.groupId, withdrawBtn.dataset.groupName, withdrawBtn.dataset.userContribution);
            }
        });
    }

    if (withdrawGroupForm) {
        withdrawGroupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const groupId = withdrawGroupIdInput.value;
            const amount = parseFloat(withdrawalAmountInput.value);
            const maxAmount = parseFloat(withdrawalAmountInput.max);
            if (isNaN(amount) || amount <= 0) { withdrawGroupError.textContent = 'Please enter a valid positive amount.'; withdrawGroupError.style.display = 'block'; return; }
            if (amount > maxAmount) { withdrawGroupError.textContent = `Withdrawal cannot exceed $${maxAmount.toFixed(2)}.`; withdrawGroupError.style.display = 'block'; return; }
            submitWithdrawGroupBtn.disabled = true;
            submitWithdrawGroupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Withdrawing...';
            withdrawGroupError.style.display = 'none';
            const result = await withdrawFromGroupViaRPC(groupId, amount);
            if (result.success) {
                hideWithdrawGroupModal();
            } else {
                withdrawGroupError.textContent = result.error || 'Failed to withdraw funds.';
                withdrawGroupError.style.display = 'block';
                submitWithdrawGroupBtn.disabled = false;
                submitWithdrawGroupBtn.innerHTML = 'Withdraw Funds <i class="fas fa-hand-holding-usd"></i>';
            }
        });
    }

    if (closeWithdrawGroupModalBtn) closeWithdrawGroupModalBtn.addEventListener('click', hideWithdrawGroupModal);
    if (withdrawGroupModal) withdrawGroupModal.addEventListener('click', (e) => { if (e.target === withdrawGroupModal) hideWithdrawGroupModal(); });

    if (closeAddContactModalBtn) closeAddContactModalBtn.addEventListener('click', hideAddContactModal);
    if (addContactModal) addContactModal.addEventListener('click', (e) => { if (e.target === addContactModal) hideAddContactModal(); });

    if (addContactFormModal) {
        addContactFormModal.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = contactNameInput.value.trim();
            const detail = contactDetailInput.value.trim();
            if (!name || !detail) { contactModalError.textContent = 'Please enter both Name and Email.'; contactModalError.style.display = 'block'; return; }
            submitAddContactBtn.disabled = true;
            submitAddContactBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
            contactModalError.style.display = 'none';
            try {
                const foundUser = await findUserByEmail(detail);
                if (foundUser) {
                    submitAddContactBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
                    const addResult = await addContact({ name, detail });
                    if (addResult.success) hideAddContactModal();
                    else { contactModalError.textContent = addResult.error || 'Could not add contact.'; contactModalError.style.display = 'block'; }
                } else {
                    contactModalError.textContent = 'User not found with that email address.';
                    contactModalError.style.display = 'block';
                }
            } catch (error) {
                contactModalError.textContent = 'An unexpected error occurred.';
                contactModalError.style.display = 'block';
            } finally {
                submitAddContactBtn.disabled = false;
                submitAddContactBtn.innerHTML = 'Add Contact <i class="fas fa-check"></i>';
            }
        });
    }

    if (quickContactList) {
        quickContactList.addEventListener('click', (e) => {
            const sendBtn = e.target.closest('.send-contact-btn');
            if (sendBtn && recipientInput) {
                e.preventDefault();
                recipientInput.value = sendBtn.dataset.contactDetail;
                const paymentsNavLink = document.querySelector('.nav-link[data-target="payments-section"]');
                if (paymentsNavLink) paymentsNavLink.click();
                else window.location.hash = '#payments-section';
            }
        });
    }

    if (contactListFull) {
        contactListFull.addEventListener('click', (e) => {
            const sendBtn = e.target.closest('.send-contact-btn');
            const detailsBtn = e.target.closest('.details-contact-btn');
            if (sendBtn && recipientInput) {
                e.preventDefault();
                recipientInput.value = sendBtn.dataset.contactDetail;
                const paymentsNavLink = document.querySelector('.nav-link[data-target="payments-section"]');
                if (paymentsNavLink) paymentsNavLink.click();
                else window.location.hash = '#payments-section';
            } else if (detailsBtn) {
                e.preventDefault();
                const listItem = detailsBtn.closest('.contact-list-item');
                const contactName = listItem?.querySelector('.contact-name')?.textContent;
                alert(`Details for: ${contactName}\n(Details view not implemented)`);
            }
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true; btn.textContent = 'Saving...';
            const updateData = {};
            if (!profileNameInput.disabled) updateData.full_name = profileNameInput.value.trim();
            if (!profilePhoneInput.disabled) updateData.phone_number = profilePhoneInput.value.trim();
            const result = await updateProfile(updateData);
            if (!result.success && result.error) alert(`Error: ${result.error}`);
            else if (result.success) alert("Profile updated!");
            btn.disabled = false; btn.textContent = originalText;
        });
    }

    // Payment Gateway Delegated Listener
    if (paymentGatewayContent) {
        paymentGatewayContent.addEventListener('click', async (e) => {
            const button = e.target.closest('.confirm-btn');
            if (!button) return;
            e.preventDefault();
            e.stopPropagation();

            // MetaMask button
            if (button.classList.contains('metamask-pay-btn')) {
                if (button.disabled) return;
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
                try {
                    await handleMetaMaskPayment();
                } catch (error) {
                    if (button) { button.disabled = false; button.innerHTML = 'Retry Connection'; }
                }
                return;
            }

            // Simulated payment methods
            const paymentMethod = button.dataset.method;
            if (!paymentMethod) {
                console.warn("Confirm button clicked but no data-method attribute found.");
                return;
            }
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            alert(`Simulating payment via ${paymentMethod}...`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            const result = await addFundsViaRPC(currentAddAmount, `Added funds via ${paymentMethod} (Simulated)`);
            if (result.success) {
                handlePaymentSuccess(currentAddAmount);
            } else {
                handlePaymentFailure(result.error || "Transaction failed.");
                if (button) { button.disabled = false; button.innerHTML = 'Retry Payment'; }
            }
        });
    }


supabaseClient.auth.onAuthStateChange(async (event, session) => {
    if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        // 1. GATEKEEPER: Stop the infinite loop immediately
        if (isAppInitialized) return; 
        isAppInitialized = true;

        

        try {
            // 2. CRITICAL: Set the user ID BEFORE calling any functions
        currentUser = session.user; 
        console.log("👤 User ID assigned:", currentUser.id);
            // 3. Now it is safe to fetch data
            await Promise.all([
                fetchProfileAndBalance(),
                fetchUserGroups(),
                fetchTransactions(),
                fetchContacts()
            ]);
            
            // 4. Hide your loading screen here
           // document.getElementById('loading-overlay').style.display = 'none';
            
        } catch (err) {
            console.error("Setup failed:", err);
            isAppInitialized = false; 
        }finally {
            // THE MOST IMPORTANT PART:
            // This runs NO MATTER WHAT. If the data fails, the loader still hides.
            const loader = document.getElementById('loading-overlay');
            if (loader) {
                loader.style.opacity = '0'; // Smooth fade
                setTimeout(() => loader.style.display = 'none', 500);
            }
            console.log("🔓 Loading screen dismissed.");
        }
    }
});

    // =============================================
    // METAMASK / WEB3 FUNCTIONS (SEPOLIA)
    // =============================================

    async function handleMetaMaskPayment() {
        const statusEl = document.getElementById('metamaskStatusTab');
        const accountEl = document.getElementById('metamaskAccountTab');
        const networkEl = document.getElementById('metamaskNetworkTab');
        const errorEl = document.getElementById('metamaskErrorTab');
        const txEl = document.getElementById('metamaskTxTab');
        const payBtn = document.querySelector('.metamask-pay-btn');

        if (errorEl) errorEl.textContent = '';
        if (txEl) txEl.textContent = '';

        try {
            await initializeWeb3();

            if (connectedAccount && provider && signer && walletContract) {
                if (statusEl) statusEl.textContent = 'Already Connected!';
                if (accountEl) accountEl.textContent = `Account: ${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`;
                await checkAndSwitchNetwork();
                if (networkEl) networkEl.textContent = 'Network: Sepolia Testnet';
                if (payBtn) {
                    payBtn.disabled = false;
                    payBtn.innerHTML = 'Confirm Payment';
                    payBtn.onclick = sendTransactionViaContract;
                }
                return;
            }

            if (payBtn) { payBtn.disabled = true; payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...'; }

            const account = await connectMetaMask();
            if (statusEl) statusEl.textContent = 'Connected!';
            if (accountEl) accountEl.textContent = `Account: ${account.slice(0, 6)}...${account.slice(-4)}`;

            await checkAndSwitchNetwork();
            if (networkEl) networkEl.textContent = 'Network: Sepolia Testnet';

            if (payBtn) {
                payBtn.disabled = false;
                payBtn.innerHTML = 'Confirm Payment';
                payBtn.onclick = sendTransactionViaContract;
            }
        } catch (error) {
            console.error("MetaMask setup/payment initiation error:", error);
            let errorMessage = error.message || 'An unknown error occurred.';
            if (error.code === -32002) errorMessage = "MetaMask request pending. Please check your MetaMask popup.";
            else if (error.code === 4001) errorMessage = "You rejected the connection or transaction request.";
            else if (error.message && error.message.includes("MetaMask not found")) {
                errorMessage = "MetaMask not found! Please install MetaMask from metamask.io";
                if (payBtn) {
                    payBtn.disabled = false;
                    payBtn.innerHTML = 'Install MetaMask';
                    payBtn.onclick = () => window.open('https://metamask.io', '_blank');
                }
            }
            if (errorEl) errorEl.textContent = `Error: ${errorMessage}`;
            if (statusEl) statusEl.textContent = 'Connection/Setup Failed';
            if (payBtn && !error.message?.includes("MetaMask not found")) {
                payBtn.disabled = false;
                payBtn.innerHTML = 'Retry Connection';
                payBtn.onclick = handleMetaMaskPayment;
            }
        }
    }

    async function initializeWeb3() {
        if (typeof window.ethers === 'undefined') {
            throw new Error("Ethers.js library is required but not loaded.");
        }
        if (!window.ethereum) {
            throw new Error("MetaMask not found! Please install MetaMask.");
        }
        try {
            if (!provider || !(provider instanceof ethers.providers.Web3Provider)) {
                provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                console.log("New Web3Provider created.");
            }
            if (!signer || (await signer.getAddress() !== connectedAccount)) {
                signer = provider.getSigner();
                console.log("New Signer obtained.");
            }
            if (!walletContract || walletContract.signer !== signer) {
                walletContract = new ethers.Contract(WALLET_CONTRACT_ADDRESS, WALLET_CONTRACT_ABI, signer);
                console.log("New Contract instance created.");
            }

            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    connectedAccount = null; signer = null; walletContract = null;
                    const statusEl = document.getElementById('metamaskStatusTab');
                    const accountEl = document.getElementById('metamaskAccountTab');
                    const payBtn = document.querySelector('.metamask-pay-btn');
                    if (statusEl) statusEl.textContent = 'Disconnected';
                    if (accountEl) accountEl.textContent = 'Account: Not Connected';
                    if (payBtn) { payBtn.disabled = false; payBtn.innerHTML = 'Connect MetaMask'; payBtn.onclick = handleMetaMaskPayment; }
                } else {
                    connectedAccount = accounts[0];
                    initializeWeb3().catch(console.error);
                    const statusEl = document.getElementById('metamaskStatusTab');
                    const accountEl = document.getElementById('metamaskAccountTab');
                    const payBtn = document.querySelector('.metamask-pay-btn');
                    if (statusEl) statusEl.textContent = 'Connected (Account Changed)';
                    if (accountEl) accountEl.textContent = `Account: ${connectedAccount.slice(0, 6)}...${connectedAccount.slice(-4)}`;
                    if (payBtn) { payBtn.disabled = false; payBtn.innerHTML = 'Confirm Payment'; payBtn.onclick = sendTransactionViaContract; }
                }
            });

            window.ethereum.on('chainChanged', () => { window.location.reload(); });

            return true;
        } catch (error) {
            console.error("Failed to initialize Web3 components:", error);
            provider = null; signer = null; walletContract = null;
            return false;
        }
    }

    async function connectMetaMask() {
        if (!window.ethereum) throw new Error("MetaMask not found!");
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (!accounts || accounts.length === 0) throw new Error("No accounts found or access denied");
            connectedAccount = accounts[0];
            await initializeWeb3();
            return connectedAccount;
        } catch (error) {
            connectedAccount = null;
            throw error;
        }
    }

    async function checkAndSwitchNetwork() {
        if (!window.ethereum || !provider) {
            throw new Error("MetaMask or provider not available for network check.");
        }
        const network = await provider.getNetwork();
        const chainId = `0x${network.chainId.toString(16)}`;
        console.log("Current network Chain ID:", chainId);

        if (chainId !== SEPOLIA_CHAIN_ID) {
            console.log(`Switching network from ${chainId} to Sepolia (${SEPOLIA_CHAIN_ID})`);
            const networkEl = document.getElementById('metamaskNetworkTab');
            if (networkEl) networkEl.textContent = 'Switching to Sepolia...';
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: SEPOLIA_CHAIN_ID }],
                });
                await new Promise(resolve => setTimeout(resolve, 500));
                const newNetwork = await provider.getNetwork();
                if (`0x${newNetwork.chainId.toString(16)}` !== SEPOLIA_CHAIN_ID) {
                    throw new Error("Network did not switch correctly.");
                }
            } catch (error) {
                if (error.code === 4902) {
                    // Sepolia not in MetaMask, add it
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: SEPOLIA_CHAIN_ID,
                                chainName: 'Sepolia',
                                nativeCurrency: { name: 'SepoliaETH', symbol: 'SepoliaETH', decimals: 18 },
                                rpcUrls: [SEPOLIA_RPC_URL],
                                blockExplorerUrls: [SEPOLIA_EXPLORER_URL]
                            }],
                        });
                        await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (addError) {
                        throw new Error("Failed to add or switch to the Sepolia network.");
                    }
                } else if (error.code === 4001) {
                    throw new Error("You rejected the network switch request.");
                } else {
                    throw new Error(`Failed to switch network: ${error.message}`);
                }
            }
        } else {
            console.log("Already on Sepolia testnet.");
        }
    }

    async function sendTransactionViaContract() {
        const statusEl = document.getElementById('metamaskStatusTab');
        const errorEl = document.getElementById('metamaskErrorTab');
        const txEl = document.getElementById('metamaskTxTab');
        const payBtn = document.querySelector('.metamask-pay-btn');

        if (payBtn) { payBtn.disabled = true; payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...'; }
        if (errorEl) errorEl.textContent = '';
        if (txEl) txEl.textContent = '';

        try {
            if (!provider || !signer || !walletContract) {
                await initializeWeb3();
                if (!provider || !signer || !walletContract) {
                    throw new Error("MetaMask connection not properly initialized. Please reconnect.");
                }
            }
            if (!connectedAccount) throw new Error("MetaMask account is not connected. Please connect.");

            const currentSignerAddress = await signer.getAddress();
            if (currentSignerAddress.toLowerCase() !== connectedAccount.toLowerCase()) {
                await initializeWeb3();
            }

            await checkAndSwitchNetwork();

            if (currentAddAmountEth <= 0) throw new Error("Invalid amount calculated for deposit.");

            if (statusEl) statusEl.textContent = 'Preparing transaction...';

            const ethValue = ethers.utils.parseEther(currentAddAmountEth.toFixed(18));
            console.log(`Depositing ${ethers.utils.formatEther(ethValue)} ETH ($${currentAddAmount}) to Sepolia contract`);

            const tx = await walletContract.deposit({ value: ethValue });
            console.log("Transaction submitted:", tx.hash);

            if (statusEl) statusEl.textContent = 'Transaction submitted...';
            if (txEl) txEl.innerHTML = `Tx: <a href="${SEPOLIA_EXPLORER_URL}/tx/${tx.hash}" target="_blank" rel="noopener noreferrer">${tx.hash.substring(0, 10)}...</a>`;

            if (statusEl) statusEl.textContent = 'Waiting for confirmation...';
            let receipt;
            try {
                receipt = await tx.wait(1);
            } catch (waitError) {
                if (waitError.code === 'TRANSACTION_REPLACED' && !waitError.cancelled) {
                    receipt = waitError.receipt;
                } else {
                    throw new Error(`Transaction confirmation failed: ${waitError.reason || waitError.message}`);
                }
            }

            if (receipt && receipt.status === 1) {
                if (statusEl) statusEl.textContent = 'Transaction confirmed!';

                const { data: newBalance, error: rpcError } = await supabaseClient.rpc(
                    'add_funds_and_log',
                    {
                        amount_to_add: currentAddAmount,
                        description_text: `MetaMask Deposit (Sepolia) - TX: ${receipt.transactionHash.substring(0, 10)}...`
                    }
                );

                if (rpcError) {
                    localStorage.setItem(`pendingUpdate_${receipt.transactionHash}`, JSON.stringify({
                        txHash: receipt.transactionHash, amount: currentAddAmount, timestamp: Date.now()
                    }));
                    throw new Error(`Blockchain succeeded but DB update failed: ${rpcError.message}`);
                }

                currentBalance = parseFloat(newBalance);
                updateBalanceDisplay();
                await fetchTransactions();
                handlePaymentSuccess(currentAddAmount);
                localStorage.removeItem(`pendingUpdate_${receipt.transactionHash}`);

            } else {
                throw new Error(`Transaction failed on blockchain. Check ${SEPOLIA_EXPLORER_URL}`);
            }

        } catch (error) {
            console.error("MetaMask Transaction Failed:", error);
            let errorMessage = error.message || 'An unknown transaction error occurred.';
            if (error.code === 4001) errorMessage = "You rejected the transaction in MetaMask.";
            else if (error.code === 'INSUFFICIENT_FUNDS') errorMessage = "Insufficient SepoliaETH for gas fees.";
            else if (error.reason) errorMessage = error.reason;
            errorMessage = errorMessage.replace('execution reverted: ', '');
            if (errorEl) errorEl.textContent = `Error: ${errorMessage}`;
            if (statusEl) statusEl.textContent = 'Transaction Failed';
        } finally {
            if (payBtn) { payBtn.disabled = false; payBtn.innerHTML = 'Confirm Payment'; payBtn.onclick = sendTransactionViaContract; }
        }
    }

   // Fallback timeout redirect
    setTimeout(async () => {
        if (!currentUser && window.location.pathname.includes('index.html')) {
            window.location.href = 'signin.html';
        }
    }, 10000);

}); // End DOMContentLoaded