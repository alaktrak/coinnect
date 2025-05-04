// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Interface for ERC20 token
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Dappazon {
    address public owner;
    IERC20 public paymentToken; // mCONCT token address

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
    event PaymentTokenUpdated(address oldToken, address newToken);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(address _paymentToken) {
        owner = msg.sender;
        paymentToken = IERC20(_paymentToken);
    }

    // Update payment token (in case you need to change it later)
    function setPaymentToken(address _paymentToken) public onlyOwner {
        address oldToken = address(paymentToken);
        paymentToken = IERC20(_paymentToken);
        emit PaymentTokenUpdated(oldToken, _paymentToken);
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
        // Create Item Struct
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock
        );

        // Save Item Struct To Blockchain
        items[_id] = item;

        // Emit List
        emit List(_name, _cost, _stock);
    }

    // Buy Products
    function buy(uint256 _id) public {
        // Fetch Item
        Item memory item = items[_id];

        // Require Item is in stock
        require(item.stock > 0, "Item out of stock");

        // Transfer tokens from buyer to contract
        require(
            paymentToken.transferFrom(msg.sender, address(this), item.cost),
            "Payment failed"
        );

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
    
    // Withdraw Tokens
    function withdraw() public onlyOwner {
        uint256 balance = paymentToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(
            paymentToken.transfer(owner, balance),
            "Withdrawal failed"
        );
    }
}