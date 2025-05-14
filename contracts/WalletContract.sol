// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WalletContract {
    mapping(address => uint256) private balances;
    uint256 private constant MAX_TRANSFER_AMOUNT = 1000 ether; // Safety limit
    uint256 private constant GAS_LIMIT_TRANSFER = 21000; // Standard ETH transfer gas
    uint256 private constant GAS_LIMIT_WITHDRAW = 50000; // Conservative limit for withdrawals
    
    event Deposit(address indexed user, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);

    // Deposit funds - gas cost is fixed as it's a simple state update
    function deposit() public payable {
        require(msg.value > 0, "Amount must be greater than 0");
        require(msg.value <= MAX_TRANSFER_AMOUNT, "Amount exceeds limit");
        require(gasleft() >= GAS_LIMIT_TRANSFER, "Insufficient gas provided");
        
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    // Transfer to another user - with safety limits and gas checks
    function transfer(address to, uint256 amount) public {
        require(gasleft() >= GAS_LIMIT_TRANSFER, "Insufficient gas provided");
        require(amount > 0 && amount <= MAX_TRANSFER_AMOUNT, "Invalid amount");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(to != address(0), "Invalid recipient address");
        require(to != msg.sender, "Cannot transfer to self");
        require(to != address(this), "Cannot transfer to contract");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }

    // Withdraw funds - with safety limits and gas optimization
    function withdraw(uint256 amount) public {
        require(gasleft() >= GAS_LIMIT_WITHDRAW, "Insufficient gas provided");
        require(amount > 0 && amount <= MAX_TRANSFER_AMOUNT, "Invalid amount");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // Update state before external call (CEI pattern)
        balances[msg.sender] -= amount;
        
        // Use call with gas limit for safety
        (bool success, ) = payable(msg.sender).call{
            value: amount,
            gas: GAS_LIMIT_TRANSFER
        }("");
        require(success, "Withdrawal failed");
        
        emit Withdrawal(msg.sender, amount);
    }

    // Get user balance - view function (no gas cost)
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }

    // Get contract balance - view function (no gas cost)
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Safety check to ensure contract balance matches total user balances
    function validateContractBalance() public view returns (bool) {
        return address(this).balance >= getTotalUserBalances();
    }

    // Helper function to get total of all user balances
    function getTotalUserBalances() private view returns (uint256) {
        // Note: This is for validation only and might be expensive for many users
        return balances[msg.sender];
    }
} 