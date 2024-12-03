// contracts/VotingV2.sol
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract VotingV2 {
    struct Question {
        bytes32 id;
        string title;
        bytes32[] options;
        mapping(bytes32 => uint256) votes;
        mapping(address => bool) hasVoted;
        bool isActive;
    }
    
    mapping(bytes32 => Question) public questions;
    bytes32[] public questionIds;
    mapping(address => mapping(bytes32 => uint256)) public balances;

    event QuestionCreated(bytes32 indexed questionId, string title);
    event Voted(address indexed voter, bytes32 indexed questionId, bytes32 option, uint256 totalVotes);
    event Withdrawn(address indexed voter, bytes32 indexed questionId, uint256 amount);

    modifier questionExists(bytes32 questionId) {
        require(questions[questionId].isActive, "Question does not exist");
        _;
    }

    function createQuestion(string memory title, string[] memory optionTexts) public {
        bytes32 questionId = keccak256(abi.encodePacked(title, block.timestamp));
        Question storage newQuestion = questions[questionId];
        newQuestion.id = questionId;
        newQuestion.title = title;
        newQuestion.isActive = true;

        for(uint i = 0; i < optionTexts.length; i++) {
            bytes32 option = keccak256(abi.encodePacked(optionTexts[i]));
            newQuestion.options.push(option);
        }

        questionIds.push(questionId);
        emit QuestionCreated(questionId, title);
    }

    function vote(bytes32 questionId, bytes32 option) public payable questionExists(questionId) {
        Question storage question = questions[questionId];
        require(!question.hasVoted[msg.sender], "You have already voted on this question");
        require(msg.value > 0, "You need to send some ether to vote");
        
        bool validOption = false;
        for(uint i = 0; i < question.options.length; i++) {
            if(question.options[i] == option) {
                validOption = true;
                break;
            }
        }
        require(validOption, "Invalid option");

        question.votes[option]++;
        question.hasVoted[msg.sender] = true;
        balances[msg.sender][questionId] += msg.value;
        
        emit Voted(msg.sender, questionId, option, question.votes[option]);
    }

    function getQuestionCount() public view returns (uint256) {
        return questionIds.length;
    }

    function getQuestion(bytes32 questionId) public view questionExists(questionId) 
        returns (
            string memory title,
            bytes32[] memory options,
            bool isActive
        )
    {
        Question storage question = questions[questionId];
        return (
            question.title,
            question.options,
            question.isActive
        );
    }

    function getVoteCount(bytes32 questionId, bytes32 option) public view questionExists(questionId) 
        returns (uint256)
    {
        return questions[questionId].votes[option];
    }

    function hasVoted(bytes32 questionId, address voter) public view questionExists(questionId) 
        returns (bool)
    {
        return questions[questionId].hasVoted[voter];
    }

    function withdraw(bytes32 questionId) external questionExists(questionId) {
        uint256 amount = balances[msg.sender][questionId];
        require(amount > 0, "No balance to withdraw");
        require(questions[questionId].hasVoted[msg.sender], "You have not voted on this question");

        balances[msg.sender][questionId] = 0;
        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");

        emit Withdrawn(msg.sender, questionId, amount);
    }
}
