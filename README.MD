# assembly script contract code template

## build wasm binary

```shell script
npm run asbuild
```

## deploy contract

```shell script
node ./deploy.js
```

## 代币合约

```shell script
# 编译
npx run asbuild:coin

# 部署合约 
node tests/deploy-coin.js

# 查看账户余额
node tests/view-coin-balance.js

# 充值
node tests/call-coin-charge.js

# 转账
node tests/call-coin-transfer.js
```