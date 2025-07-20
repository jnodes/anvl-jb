# ANVL Smart Contracts

## Contracts
- `ANVLToken.sol` - ERC20 governance token
- `ANVLLendingPlatform.sol` - Core lending logic
- `ANVLLiquidityBootstrappingPool.sol` - Uniswap V4 LBP hook
- `ANVLLBPManager.sol` - LBP management

## Testing in Remix
1. Open https://remix.ethereum.org
2. Upload contracts or use remixd
3. Compile with Solidity 0.8.24
4. Deploy to Remix VM for testing

## Local Testing
```bash
npm install
npx hardhat test
```
