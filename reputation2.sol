// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Reputation {
    address public owner;
    mapping(address => bool) public allowedEscrows;

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
    struct Rating {
        uint256 totalRating;
        uint256 ratingCount;
    }

    mapping(address => Rating) public ratings;
    mapping(address => mapping(address => bool)) public hasInteracted;

    event RatingSubmitted(address indexed rater, address indexed provider, uint8 rating);

    function submitRating(address provider, uint8 score) external {
        require(hasInteracted[msg.sender][provider], "You must have interacted with the provider to rate them");
        require(score >= 1 && score <= 5, "Rating must be between 1 and 5");

        ratings[provider].totalRating += score;
        ratings[provider].ratingCount += 1;

        emit RatingSubmitted(msg.sender, provider, score);
    }


    function getAverageRating(address provider) external view returns (uint256 numerator, uint256 denominator) {
        Rating memory r = ratings[provider];
        if (r.ratingCount == 0) return (0, 1); // Avoid division by zero
        return (r.totalRating, r.ratingCount);
    }

    function getRatingDetails(address provider) external view returns (uint256 total, uint256 count) {
        Rating memory r = ratings[provider];
        return (r.totalRating, r.ratingCount);
    }
}