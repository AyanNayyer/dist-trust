// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Reputation {
    struct Rating {
        uint256 totalRating;
        uint256 ratingCount;
    }

    address public owner;
    mapping(address => Rating) public ratings;
    mapping(address => mapping(address => bool)) public hasInteracted;
    mapping(address => bool) public allowedEscrows;

    event RatingSubmitted(address indexed rater, address indexed provider, uint8 rating);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyEscrow() {
        require(allowedEscrows[msg.sender], "Caller not allowed");
        _;
    }

    function allowEscrow(address escrow) external onlyOwner {
        allowedEscrows[escrow] = true;
    }

    function markInteraction(address client, address creator) external onlyEscrow {
        hasInteracted[client][creator] = true;
    }

    function submitRating(address provider, uint8 score) external {
        require(score >= 1 && score <= 5, "Rating must be between 1-5");
        require(hasInteracted[msg.sender][provider], "No interaction with provider");
        
        ratings[provider].totalRating += score;
        ratings[provider].ratingCount += 1;
        
        emit RatingSubmitted(msg.sender, provider, score);
    }

    function getAverageRating(address provider) external view returns (uint256 numerator, uint256 denominator) {
        Rating memory r = ratings[provider];
        return (r.totalRating, r.ratingCount == 0 ? 1 : r.ratingCount);
    }
}