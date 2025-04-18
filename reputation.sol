// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Reputation {
    struct Rating {
        uint256 totalRating;
        uint256 ratingCount;
    }

    mapping(address => Rating) public ratings;

    event RatingSubmitted(address indexed provider, uint8 rating);

    function submitRating(address provider, uint8 score) external {
        require(score >= 0 && score <= 5, "Rating must be between 0 and 5");

        ratings[provider].totalRating += score;
        ratings[provider].ratingCount += 1;

        emit RatingSubmitted(provider, score);
    }

    function getAverageRating(address provider) external view returns (uint256) {
        Rating memory r = ratings[provider];
        if (r.ratingCount == 0) return 0;
        return r.totalRating / r.ratingCount;
    }

    function getRatingDetails(address provider) external view returns (uint256 total, uint256 count) {
        Rating memory r = ratings[provider];
        return (r.totalRating, r.ratingCount);
    }
}
