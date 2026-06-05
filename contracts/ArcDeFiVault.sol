// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @notice Minimal Arc Testnet demo contract for the starter kit DeFi UI.
/// @dev This is intentionally simple. Do not use it as a production lending market.
contract ArcDeFiVault {
    event Lent(address indexed user, address indexed asset, uint256 amount);
    event Borrowed(address indexed user, address indexed asset, uint256 amount);
    event LiquidityAdded(
        address indexed user,
        address indexed tokenA,
        address indexed tokenB,
        uint256 amountA,
        uint256 amountB
    );

    function lend(address asset, uint256 amount) external {
        require(IERC20(asset).transferFrom(msg.sender, address(this), amount), "lend transfer failed");
        emit Lent(msg.sender, asset, amount);
    }

    function addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB) external {
        require(IERC20(tokenA).transferFrom(msg.sender, address(this), amountA), "tokenA transfer failed");
        require(IERC20(tokenB).transferFrom(msg.sender, address(this), amountB), "tokenB transfer failed");
        emit LiquidityAdded(msg.sender, tokenA, tokenB, amountA, amountB);
    }

    function borrow(address asset, uint256 amount) external {
        require(IERC20(asset).transfer(msg.sender, amount), "borrow transfer failed");
        emit Borrowed(msg.sender, asset, amount);
    }
}
