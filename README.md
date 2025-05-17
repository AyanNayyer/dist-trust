# Dis-trust: Decentralized Creator Services Platform
A blockchain-powered marketplace for creators and clients to connect, collaborate, and transact securely using smart contracts for escrow and reputation management.

# 🚀 Features

Wallet Integration: Connect with MetaMask for secure blockchain transactions.

Decentralized Identity: Create and verify your identity using blockchain-based DIDs.

Escrow System: Secure payments held in smart contracts until work is completed.

Reputation Management: Build and view on-chain reputation scores.

Creator Profiles: Create and manage your professional profile.

Service Contracts: Create and manage service agreements.

# 🛠️ Getting Started
## Prerequisites

Node.js (v16+)

npm or yarn

MetaMask browser extension

Access to Ethereum Sepolia testnet

## Installation

### Clone the repository

git clone https://github.com/yourusername/dist-trust.git

cd dist-trust

### Install dependencies

npm install

Configure environment variables

### Create a .env file in the root directory:

VITE_ESCROW_ADDRESS=your_deployed_escrow_contract_address
VITE_REPUTATION_ADDRESS=your_deployed_reputation_contract_address

## Start the development server

npm run dev

Open your browser and navigate to
http://localhost:5173

# 🧑‍💻 Usage Guide

## Connecting Your Wallet

Click the Connect Wallet button in the top-right corner

Approve the connection request in your MetaMask extension

Ensure you're connected to the Sepolia testnet

### Tip:
To add Sepolia testnet to MetaMask, go to network settings, enable test networks, and select Sepolia.

You can request test ETH from Chainlink's Sepolia Faucet.

## Creating Your Profile

Go to the Profile page

Click Create Decentralized Identity to generate your DID

Fill in your profile information (name, skills, description, etc.)

Click Save Profile to store your information

## Creating a Service Contract

Go to the Create Service page

Enter the provider's Ethereum address

Specify the amount to be paid for the service

Add service details and requirements

Click Create Service Contract to deploy the escrow

## Managing Projects

Go to the Dashboard to view your active projects

For clients: Release funds when work is completed

For creators: View project status and payment details

## Viewing Reputation

Check the Reputation tab on the Dashboard

View your average rating and total number of ratings

For clients: Submit ratings after project completion

# 🗂️ Project Structure
```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── pages/          # Main application pages
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
└── contracts/      # Contract interaction code
```

# 🧰 Key Technologies

React + TypeScript — Frontend development

Vite — Fast development server and build tool

Ethereum Web3 Integration — Blockchain connectivity

Decentralized Identity (DID) — Self-sovereign identity management

Smart Contracts — Escrow and reputation systems

# 💡 Why Decentralized?

Content Ownership: Creators directly monetize their work without relying on advertising revenue

Censorship Resistance: Content remains accessible regardless of platform policies

Transparent Operations: All transactions and operations can be verified by any participant

No Single Point of Failure: No central server that can be hacked or shut down

# 🔗 Smart Contract Architecture

Escrow Contract: Manages secure payment holding and release between clients and creators
Reputation Contract: Tracks and calculates creator ratings based on completed projects
