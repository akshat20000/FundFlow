// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title SimpleWallet
 * @dev A basic wallet contract with security features and gas optimizations
 */
contract SimpleWallet {
    mapping(address => uint256) private balances;
    uint256 private constant MAX_TRANSFER_AMOUNT = 100 ether;
    
    // Add reentrancy guard
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private _status;
    
    event Deposit(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    constructor() {
        _status = NOT_ENTERED;
    }
    
    // Reentrancy guard modifier
    modifier nonReentrant() {
        require(_status != ENTERED, "ReentrancyGuard: reentrant call");
        _status = ENTERED;
        _;
        _status = NOT_ENTERED;
    }
    
    // Validate address modifier
    modifier validAddress(address _addr) {
        require(_addr != address(0), "Invalid address");
        require(_addr != address(this), "Cannot interact with contract itself");
        _;
    }

    /**
     * @dev Deposit funds into the wallet
     * Requirements:
     * - Value must be positive and not exceed MAX_TRANSFER_AMOUNT
     */
    function deposit() external payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(msg.value <= MAX_TRANSFER_AMOUNT, "Amount exceeds limit");
        require(balances[msg.sender] + msg.value <= type(uint256).max, "Overflow protection");

        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Transfer funds to another user
     * @param to Recipient address
     * @param amount Amount to transfer
     * Requirements:
     * - Valid recipient address
     * - Sufficient balance
     * - Amount within limits
     */
    function transfer(address to, uint256 amount) 
        external 
        validAddress(to) 
    {
        require(to != msg.sender, "Cannot transfer to yourself");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= MAX_TRANSFER_AMOUNT, "Amount exceeds limit");
        require(amount <= balances[msg.sender], "Insufficient balance");
        
        balances[msg.sender] -= amount;
        // Check for potential overflow
        require(balances[to] + amount <= type(uint256).max, "Transfer would overflow");
        balances[to] += amount;
        
        emit Transfer(msg.sender, to, amount);
    }

    /**
     * @dev Withdraw funds from the wallet
     * @param amount Amount to withdraw
     * Requirements:
     * - Sufficient balance
     * - Amount within limits
     * - Successful transfer
     */
    function withdraw(uint256 amount) 
        external 
        nonReentrant 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= MAX_TRANSFER_AMOUNT, "Amount exceeds limit");
        require(amount <= balances[msg.sender], "Insufficient balance");
        require(amount <= address(this).balance, "Contract has insufficient balance");

        // Update state before external call (CEI pattern)
        balances[msg.sender] -= amount;

        // Perform the transfer with a gas limit
        (bool success, ) = payable(msg.sender).call{
            value: amount,
            gas: 21000 // Standard ETH transfer gas limit
        }("");
        require(success, "Withdrawal failed");

        emit Withdrawal(msg.sender, amount);
    }

    /**
     * @dev Get the balance of the caller
     * @return uint256 Current balance
     */
    function getBalance() external view returns (uint256) {
        return balances[msg.sender];
    }

    /**
     * @dev Get the total balance of the contract
     * @return uint256 Contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
} 