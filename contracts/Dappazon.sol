// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
    // Alak's code goes here...

    address public owner;

    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Item item;
    }

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    event Buy(address buyer, uint256 orderID, uint256 itemID);
    event List(string name, uint256 cost, uint256 quantity);
    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;    
    }

    // List Products
    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        require (msg.sender == owner);

        // Create Item Struct

        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock);

        // Save Item Struct To Blockchain
        items[_id] = item;

        // Emit List
        emit List(_name, _cost, _stock);
    }

    // Buy Products

    function buy (uint256 _id) public payable{
        // Fetch Item
        Item memory item = items[_id];

        // Require Enough Ether to Buy Item
        require(msg.value >= item.cost);

        // Require Item is in stock
        require(item.stock > 0);

        // Create an Order
        Order memory order = Order(block.timestamp, item);

        // Save Order to Chain
        orderCount[msg.sender]++; // <-- OrderID
        orders[msg.sender][orderCount[msg.sender]] = order;

        // Subtract stock
        items[_id].stock = item.stock - 1;
        
        // Emit Event
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }
    
    // Withdraw Funds

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }

}
