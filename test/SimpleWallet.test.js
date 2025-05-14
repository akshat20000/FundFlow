const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleWallet", function () {
    let simpleWallet;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        // Get signers
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy contract
        const SimpleWallet = await ethers.getContractFactory("SimpleWallet");
        simpleWallet = await SimpleWallet.deploy();

        console.log("SimpleWallet deployed to:", await simpleWallet.getAddress());
    });

    describe("Deposits", function () {
        it("Should accept deposits", async function () {
            const depositAmount = ethers.parseEther("1.0");
            
            await simpleWallet.connect(owner).deposit({ value: depositAmount });
            
            const balance = await simpleWallet.getBalance();
            expect(balance).to.equal(depositAmount);
        });

        it("Should reject deposits over limit", async function () {
            const largeAmount = ethers.parseEther("101.0");
            
            await expect(
                simpleWallet.connect(owner).deposit({ value: largeAmount })
            ).to.be.revertedWith("Amount exceeds limit");
        });
    });

    describe("Transfers", function () {
        it("Should transfer between accounts", async function () {
            // First deposit some ETH
            const depositAmount = ethers.parseEther("2.0");
            await simpleWallet.connect(owner).deposit({ value: depositAmount });

            // Transfer 1 ETH to addr1
            const transferAmount = ethers.parseEther("1.0");
            await simpleWallet.connect(owner).transfer(addr1.address, transferAmount);

            // Check balances
            const ownerBalance = await simpleWallet.connect(owner).getBalance();
            const addr1Balance = await simpleWallet.connect(addr1).getBalance();

            expect(ownerBalance).to.equal(depositAmount - transferAmount);
            expect(addr1Balance).to.equal(transferAmount);
        });
    });

    describe("Withdrawals", function () {
        it("Should allow withdrawals", async function () {
            // First deposit some ETH
            const depositAmount = ethers.parseEther("1.0");
            await simpleWallet.connect(owner).deposit({ value: depositAmount });

            // Withdraw 0.5 ETH
            const withdrawAmount = ethers.parseEther("0.5");
            await simpleWallet.connect(owner).withdraw(withdrawAmount);

            // Check wallet balance
            const walletBalance = await simpleWallet.connect(owner).getBalance();
            expect(walletBalance).to.equal(depositAmount - withdrawAmount);
        });

        it("Should prevent withdrawals over balance", async function () {
            await expect(
                simpleWallet.connect(owner).withdraw(ethers.parseEther("1.0"))
            ).to.be.revertedWith("Insufficient balance");
        });
    });
}); 