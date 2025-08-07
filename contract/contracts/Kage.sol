// SPDX-License-Identifier: UNLICENSED
// Author: romannjoroge
pragma solidity ^0.8.28;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recepient, uint256 amount) external  returns (bool);
}

contract Kage {
    struct Trade {
        string tradeID;
        address tokenAddress;
        address buyer;
        uint amount;
    }

    address private immutable _backendAddress;

    constructor(address backend) {
        _backendAddress = backend;
    }

    error NotBackend();
    error BuyTradeNotExists();
    error SellTradeNotExists();
    error NotLockTrade();
    error NotCloseTrade();

    modifier onlyBackend() {
        if (msg.sender != _backendAddress) {
            revert NotBackend();
        }
        _;
    }

    mapping(string tradeID => bool exists) public trades;
    mapping(string tradeID => Trade trade) public tradeDetails;
    
    function createTrade(string calldata tradeID, address tokenAddress, uint amount) public {
        Trade memory trade = Trade({tradeID: tradeID, tokenAddress: tokenAddress, buyer: msg.sender, amount: amount});

        // Transfer tokens to contract
        bool success = IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        if (success == false) {
            revert NotLockTrade();
        }

        trades[tradeID] = true;
        tradeDetails[tradeID] = trade;
    }

    function closeTrades(string calldata buyTradeID, string calldata sellTradeID) public onlyBackend {
        // Check if buy trade and sell trade exists if not revert
        if (trades[buyTradeID] == false) {
            revert BuyTradeNotExists();
        }

        if (trades[sellTradeID] == false) {
            revert SellTradeNotExists();
        }

        // Send the buyer and seller the locked tokens to complete trade
        Trade storage buyTrade = tradeDetails[buyTradeID];
        Trade storage sellTrade = tradeDetails[sellTradeID];

        bool success = IERC20(buyTrade.tokenAddress).transfer(buyTrade.buyer, sellTrade.amount);
        if (success == false) {
            revert NotCloseTrade();
        }

        success = IERC20(sellTrade.tokenAddress).transfer(sellTrade.buyer, buyTrade.amount);
        if (success == false) {
            revert NotCloseTrade();
        }

        delete trades[buyTradeID];
        delete trades[sellTradeID];
        delete tradeDetails[buyTradeID];
        delete tradeDetails[sellTradeID];
    }
}