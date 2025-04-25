// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProjectEscrow {
    // State Variables
    address public client;
    address public creator;
    uint public amount;
    bool public projectStarted;
    bool public projectCompleted;
    bool public clientApprovedCompletion;
    bool public escrowAllocated;

    enum ProjectStatus { NotStarted, InProgress, Completed, Scrapped, Disputed }
    ProjectStatus public status;

    // Events
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

    constructor(address _creator, uint _amount) {
        require(_creator != address(0), "Creator address required");
        require(_amount > 0, "Amount must be greater than 0");
        client = msg.sender;
        creator = _creator;
        amount = _amount;
        status = ProjectStatus.NotStarted;
        emit ProjectSubmitted(client, creator, amount);
    }

    // Client deposits funds in escrow
    function depositEscrow() public payable onlyClient {
        require(status == ProjectStatus.NotStarted, "Project already started or scrapped");
        require(msg.value == amount, "Deposit must be equal to the agreed amount");
        escrowAllocated = true;
        emit EscrowAllocated(msg.sender, amount);
    }

    // Creator starts the project
    function startProject() public onlyCreator {
        require(escrowAllocated, "Escrow not funded yet");
        require(status == ProjectStatus.NotStarted, "Project already started or scrapped");
        projectStarted = true;
        status = ProjectStatus.InProgress;
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