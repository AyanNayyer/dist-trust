// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./reputation2.sol";
contract ProjectEscrow {
    // State Variables
    Reputation public reputationContract;
    address public client;
    address public creator;
    uint public amount;
    bool public creatorApproved;
    bool public clientApprovedAmount;
    bool public projectStarted;
    bool public projectCompleted;
    bool public clientApprovedCompletion;
    bool public escrowAllocated;
    // Events
    event ProjectSubmitted(address indexed client, address indexed creator);
    event CreatorApproval(address indexed creator, bool approved, uint amount);
    event ClientApprovalAmount(address indexed client, bool approved);
    event EscrowAllocated(address indexed client, uint amount);
    event ProjectStarted(address indexed creator);
    event ProjectCompleted(address indexed creator);
    event ClientApprovalCompletion(address indexed client, bool approved);
    event EscrowReleased(address indexed creator, uint amount);
    event EscrowRefunded(address indexed client, uint amount);
    event ProjectScrapped();
    event DisputeInitiated(address indexed client, address indexed creator);

    enum ProjectStatus { NotStarted, InProgress, Completed, Scrapped, Disputed }
    ProjectStatus public status;

    modifier onlyClient() {
        require(msg.sender == client, "Only client can call this");
        _;
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "Only creator can call this");
        _;
    }

    constructor(address _creator, address _reputationContract) {
        client = msg.sender;
        creator = _creator;
        status = ProjectStatus.NotStarted;
        reputationContract = Reputation(_reputationContract);
        emit ProjectSubmitted(client, creator);
    }

    // Step 2: Creator sends approval or disapproval
    function creatorApproval(bool approval, uint _amount) public onlyCreator {
        require(status == ProjectStatus.NotStarted, "Project already started or scrapped");
        creatorApproved = approval;
        emit CreatorApproval(msg.sender, approval, _amount);
        if (approval) {
            amount = _amount;
            // No need to check creator's balance!
        } else {
            status = ProjectStatus.Scrapped;
            emit ProjectScrapped();
        }
    }

    //Client approves amount
    function clientApproveAmount(bool approval) public onlyClient {
        require(creatorApproved, "Creator has not approved");
        require(status == ProjectStatus.NotStarted, "Project already started or scrapped");
        clientApprovedAmount = approval;
        emit ClientApprovalAmount(msg.sender, approval);
        if (approval) {
            require(address(this).balance >= amount, "Escrow does not have enough funds");
            reputationContract.markInteraction(client, creator);
            escrowAllocated = true;
            emit EscrowAllocated(msg.sender, amount);
            projectStarted = true;
            status = ProjectStatus.InProgress;
            emit ProjectStarted(creator);
        } else {
            status = ProjectStatus.Scrapped;
            emit ProjectScrapped();
        }
    }

    //Deposit funds in escrow
    function depositEscrow() public payable onlyClient {
        require(msg.value == amount, "Deposit must be equal to the agreed amount");
    }

    //Mark project completed by creator
    function markProjectCompleted() public onlyCreator {
        require(projectStarted, "Project not started yet");
        projectCompleted = true;
        status = ProjectStatus.Completed;
        emit ProjectCompleted(msg.sender);
    }

    //Client Approve the project
    function clientApproveCompletion(bool approval) public onlyClient {
        require(projectCompleted, "Project not completed yet");
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
        }
    }


    receive() external payable {}
}