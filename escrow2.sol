// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProjectManager {
    enum ProjectStatus { Pending, Approved, Rejected, InProgress, Completed }

    struct Project {
        address client;
        address creator;
        uint256 amount;
        string title;
        string description;
        uint256 deadline;
        ProjectStatus status;
    }

    Project[] public projects;

    event ProjectCreated(uint256 indexed projectId, address indexed client, address indexed creator, uint256 amount, string title, string description, uint256 deadline);
    event ProjectApproved(uint256 indexed projectId);
    event ProjectRejected(uint256 indexed projectId);

    function createProject(
        address _creator,
        string calldata _title,
        string calldata _description,
        uint256 _deadline
    ) external payable returns (uint256) {
        require(msg.value > 0, "Amount must be greater than zero");
        projects.push(Project({
            client: msg.sender,
            creator: _creator,
            amount: msg.value,
            title: _title,
            description: _description,
            deadline: _deadline,
            status: ProjectStatus.Pending
        }));
        uint256 projectId = projects.length - 1;
        emit ProjectCreated(projectId, msg.sender, _creator, msg.value, _title, _description, _deadline);
        return projectId;
    }

    function approveProject(uint256 _projectId) external {
        Project storage project = projects[_projectId];
        require(msg.sender == project.creator, "Only creator can approve");
        require(project.status == ProjectStatus.Pending, "Project not pending");
        project.status = ProjectStatus.Approved;
        emit ProjectApproved(_projectId);
    }

    function rejectProject(uint256 _projectId) external {
        Project storage project = projects[_projectId];
        require(msg.sender == project.creator, "Only creator can reject");
        require(project.status == ProjectStatus.Pending, "Project not pending");
        project.status = ProjectStatus.Rejected;
        payable(project.client).transfer(project.amount);
        emit ProjectRejected(_projectId);
    }

    function getProject(uint256 _projectId) external view returns (
        address client,
        address creator,
        uint256 amount,
        string memory title,
        string memory description,
        uint256 deadline,
        ProjectStatus status
    ) {
        Project storage project = projects[_projectId];
        return (
            project.client,
            project.creator,
            project.amount,
            project.title,
            project.description,
            project.deadline,
            project.status
        );
    }

    function getProjectsCount() external view returns (uint256) {
        return projects.length;
    }
}
