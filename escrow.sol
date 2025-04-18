// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Escrow {

    struct Project {
        address client;
        address payable provider;
        uint256 amount;
        bool status;
    }

    uint256 public projectCounter;
    mapping(uint256 => Project) public projects;

    event ProjectCreated(uint256 indexed projectId, address client, address provider, uint256 amount);
    event ProjectCompleted(uint256 indexed projectId);

    function createProject(address payable _provider) external payable {
        require(msg.value > 0, "Must send payment");
        require(_provider != address(0), "Provider must be specified");
        require(_provider != msg.sender,"Provider can't be the client");
        projects[projectCounter] = Project({
            client: msg.sender,
            provider: _provider,
            amount: msg.value,
            status: false
        });
        emit ProjectCreated(projectCounter, msg.sender, _provider, msg.value);
        projectCounter++;
    }

    function releaseFunds(uint256 _projectId) external {
        Project storage project = projects[_projectId];
        require(msg.sender == project.client, "Only client can release funds");
        require(!project.status, "Already completed");

        project.provider.transfer(project.amount);
        project.status = true;

        emit ProjectCompleted(_projectId);
    }

    function getProject(uint256 _projectId) external view returns (
        address client,
        address provider,
        uint256 amount,
        bool status
    ) {
        Project memory p = projects[_projectId];
        return (p.client, p.provider, p.amount, p.status);
    }
}
