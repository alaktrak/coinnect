````markdown
```bash
git clone https://github.com/alaktrak/coinnect.git
cd coinnect
npm install
npx hardhat clean
npx hardhat compile
npx hardhat test

npx hardhat node
npx hardhat run ./scripts/deploy.js --network localhost
npm run start
