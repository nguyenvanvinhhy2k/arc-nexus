# Deploy Arc DeFi Contract

This starter kit includes a minimal Arc Testnet DeFi contract surface for the UI:

- `lend(address asset, uint256 amount)`
- `borrow(address asset, uint256 amount)`
- `addLiquidity(address tokenA, address tokenB, uint256 amountA, uint256 amountB)`

The deploy script uses `viem` directly, so no Solidity compiler or Hardhat install is required.

## 1. Add deployer private key

Add this to `.env.local`:

```env
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

Use a test wallet only. The wallet needs Arc Testnet USDC for gas.

## 2. Deploy

```bash
npm run deploy:arc
```

After deployment, the script updates `.env.local` with the deployed address:

```env
NEXT_PUBLIC_LEND_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_POOL_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_BORROW_CONTRACT_ADDRESS=0x...
```

## 3. Restart the app

Restart the Next dev server so the new public env vars are picked up.

```bash
npm run dev
```

## Note

This contract is a testnet demo vault. It accepts supplied/pool tokens into the contract and lets `borrow` transfer tokens already held by the vault. It is not a production lending protocol and does not include collateral accounting, oracle checks, interest accrual, admin controls, or liquidation logic.
