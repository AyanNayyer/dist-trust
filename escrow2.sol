// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./reputation2.sol"; // Import Reputation contract

contract ProjectEscrow {
    Reputation public reputationContract; // Reference to Reputation
    address public client;
    address public creator;
    uint public amount;
    bool public projectStarted;
    bool public projectCompleted;
    bool public clientApprovedCompletion;
    bool public escrowAllocated;
    
    enum ProjectStatus { NotStarted, InProgress, Completed, Scrapped, Disputed }
    ProjectStatus public status;

    event ProjectSubmitted(address indexed client, address indexed creator, uint amount);
    event EscrowAllocated(address indexed client, uint amount);
    event ProjectStarted(address indexed creator);
    event ProjectCompleted(address indexed creator);
    event ClientApprovalCompletion(address indexed client, bool approved);
    event EscrowReleased(address indexed creator, uint amount);
    event EscrowRefunded(address indexed client, uint amount);
    event ProjectScrapped();
    event DisputeInitiated(address indexed client, address indexed creator);

    modifier onlyClient() {
        require(msg.sender == client, "Only client can call this");
        _;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
        _;
    }


    constructor(address _creator, uint _amount, address _reputationContract) {
        require(_creator != address(0), "Creator address required");
        require(_amount > 0, "Amount must be > 0");
        client = msg.sender;
        creator = _creator;
        amount = _amount;
        reputationContract = Reputation(_reputationContract); // Initialize Reputation
        status = ProjectStatus.NotStarted;
        emit ProjectSubmitted(client, creator, amount);
    }


    function depositEscrow() public payable onlyClient {
        require(status == ProjectStatus.NotStarted, "Project already started or scrapped");
        require(msg.value == amount, "Deposit must be equal to the agreed amount");
        escrowAllocated = true;
        emit EscrowAllocated(msg.sender, amount);
    }

    function startProject() public onlyCreator {
        require(escrowAllocated, "Escrow not funded");
        require(status == ProjectStatus.NotStarted, "Project already started");
        projectStarted = true;
        status = ProjectStatus.InProgress;
        
        // Mark interaction in Reputation contract
        reputationContract.markInteraction(client, creator); 
        emit ProjectStarted(msg.sender);
    }


    // Creator marks project as completed
    function markProjectCompleted() public onlyCreator {
        require(projectStarted, "Project not started yet");
        require(status == ProjectStatus.InProgress, "Project not in progress");
        projectCompleted = true;
        status = ProjectStatus.Completed;
        emit ProjectCompleted(msg.sender);
    }

    // Client approves or disputes the completed project
    function clientApproveCompletion(bool approval) public onlyClient {
        require(projectCompleted, "Project not completed yet");
        require(status == ProjectStatus.Completed, "Project not in completed state");
        clientApprovedCompletion = approval;
        emit ClientApprovalCompletion(msg.sender, approval);
        if (approval) {
            payable(creator).transfer(amount);
            escrowAllocated = false;
            emit EscrowReleased(creator, amount);
        } else {
            payable(client).transfer(amount);
            escrowAllocated = false;
            status = ProjectStatus.Scrapped;
            emit EscrowRefunded(client, amount);
            emit ProjectScrapped();
            _initiateDispute();
        }
    }

    function _initiateDispute() internal {
        status = ProjectStatus.Disputed;
        emit DisputeInitiated(client, creator);
    }

    receive() external payable {}
}