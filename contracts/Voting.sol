// contracts/Voting.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Voting {
    mapping(bytes32 => uint256) public votes;
    mapping(address => bool) public voted;
    mapping(address => uint256) public balances;

    event Voted(address voter, bytes32 option, uint256 totalVotes);
    event Withdrawn(address voter, uint256 amount);

    function vote(bytes32 option) public payable {
        require(!voted[msg.sender], "You have already voted.");
        require(msg.value > 0, "You need to send some ether to vote."); // 如果投票需要支付Ether
        votes[option]++;
        voted[msg.sender] = true;
        balances[msg.sender] += msg.value;
        emit Voted(msg.sender, option, votes[option]);
    }

    function withdraw() external {
        require(voted[msg.sender], "You have not voted.");
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance to withdraw.");

        balances[msg.sender] = 0;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether.");

        emit Withdrawn(msg.sender, amount);
    }
}
