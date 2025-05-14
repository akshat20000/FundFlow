// Contract ABI - Replace with your contract's ABI after deployment
const contractABI = [
    "function deposit() external payable",
    "function transfer(address to, uint256 amount) external",
    "function withdraw(uint256 amount) external",
    "function getBalance() external view returns (uint256)",
    "event Deposit(address indexed user, uint256 amount)",
    "event Transfer(address indexed from, address indexed to, uint256 amount)",
    "event Withdrawal(address indexed user, uint256 amount)"
];

// Contract address - Replace with your deployed contract address
const contractAddress = "0x86F9f9425BB6Fe671487472ad864531556b8ADec";

let provider;
let signer;
let contract;
let userAddress;

// UI Elements
const connectButton = document.getElementById('connectButton');
const connectionStatus = document.getElementById('connectionStatus');
const accountAddress = document.getElementById('accountAddress');
const walletBalance = document.getElementById('walletBalance');
const depositButton = document.getElementById('depositButton');
const transferButton = document.getElementById('transferButton');
const withdrawButton = document.getElementById('withdrawButton');
const transactionStatus = document.getElementById('transactionStatus');

// Initialize
async function init() {
    if (typeof window.ethereum === 'undefined') {
        alert('Please install MetaMask to use this dApp!');
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Handle account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    
    // Connect button event
    connectButton.addEventListener('click', connectWallet);
    
    // Action buttons events
    depositButton.addEventListener('click', deposit);
    transferButton.addEventListener('click', transfer);
    withdrawButton.addEventListener('click', withdraw);
    
    // Refresh balance button event
    document.getElementById('refreshBalance').addEventListener('click', updateBalance);
}

// Connect Wallet
async function connectWallet() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        handleAccountsChanged(accounts);
    } catch (error) {
        console.error(error);
        showTransactionStatus('Failed to connect wallet', true);
    }
}

// Handle account changes
async function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        connectionStatus.textContent = 'Not Connected';
        accountAddress.textContent = '-';
        connectButton.textContent = 'Connect Wallet';
        return;
    }

    userAddress = accounts[0];
    connectionStatus.textContent = 'Connected';
    accountAddress.textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    connectButton.textContent = 'Connected';

    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);

    updateBalance();
}

// Update Balance
async function updateBalance() {
    try {
        const balance = await contract.getBalance();
        walletBalance.textContent = `${ethers.utils.formatEther(balance)} ETH`;
    } catch (error) {
        console.error(error);
        showTransactionStatus('Failed to fetch balance', true);
    }
}

// Deposit
async function deposit() {
    const amount = document.getElementById('depositAmount').value;
    if (!amount || amount <= 0) {
        showTransactionStatus('Please enter a valid amount', true);
        return;
    }

    try {
        showTransactionStatus('Depositing...', false);
        const tx = await contract.deposit({
            value: ethers.utils.parseEther(amount)
        });
        await tx.wait();
        showTransactionStatus('Deposit successful!', false);
        updateBalance();
    } catch (error) {
        console.error(error);
        showTransactionStatus('Deposit failed: ' + error.message, true);
    }
}

// Transfer
async function transfer() {
    const to = document.getElementById('transferAddress').value;
    const amount = document.getElementById('transferAmount').value;

    if (!ethers.utils.isAddress(to)) {
        showTransactionStatus('Please enter a valid address', true);
        return;
    }
    if (!amount || amount <= 0) {
        showTransactionStatus('Please enter a valid amount', true);
        return;
    }

    try {
        showTransactionStatus('Transferring...', false);
        const tx = await contract.transfer(to, ethers.utils.parseEther(amount));
        await tx.wait();
        showTransactionStatus('Transfer successful!', false);
        updateBalance();
    } catch (error) {
        console.error(error);
        showTransactionStatus('Transfer failed: ' + error.message, true);
    }
}

// Withdraw
async function withdraw() {
    const amount = document.getElementById('withdrawAmount').value;
    if (!amount || amount <= 0) {
        showTransactionStatus('Please enter a valid amount', true);
        return;
    }

    try {
        showTransactionStatus('Withdrawing...', false);
        const tx = await contract.withdraw(ethers.utils.parseEther(amount));
        await tx.wait();
        showTransactionStatus('Withdrawal successful!', false);
        updateBalance();
    } catch (error) {
        console.error(error);
        showTransactionStatus('Withdrawal failed: ' + error.message, true);
    }
}

// Show transaction status
function showTransactionStatus(message, isError) {
    transactionStatus.textContent = message;
    transactionStatus.className = isError ? 'bg-red-100 text-red-700 p-4 rounded mt-4' : 'bg-green-100 text-green-700 p-4 rounded mt-4';
    transactionStatus.style.display = 'block';
    setTimeout(() => {
        transactionStatus.style.display = 'none';
    }, 5000);
}

// Initialize the app
init(); 