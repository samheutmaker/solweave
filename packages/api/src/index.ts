import loadEnvironment from './utils/loadEnvironment';

loadEnvironment();

import UploadCostCalculator from '@solweave/cost-calculator';
import {
  Connection,
  ConfirmOptions,
} from '@solana/web3.js';
import express, { Express } from 'express';
import multer, { Multer } from 'multer';
import cors from 'cors';
import Arweave from 'arweave';
import fs from 'fs-extra';
import { JWKInterface } from 'arweave/node/lib/wallet';
import Transaction from 'arweave/node/lib/transaction';
import {
  ARWEAVE_JWK_FILEPATH,
} from './env';
import WaitUtil from './utils/WaitUtil';
import Base58 from './utils/Base58';

const app = express();

app.use(cors({
  origin: '*',
}));

const network = 'http://127.0.0.1:8899';

const txConfirmOptions: ConfirmOptions = {
  preflightCommitment: 'confirmed',
  commitment: 'confirmed',
};

const solanaConnection = new Connection(
  network,
  txConfirmOptions.preflightCommitment,
);

const upload = multer();

// Or to specify a gateway when running from NodeJS you might use
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

const arweaveJWK: JWKInterface = fs.readJsonSync(ARWEAVE_JWK_FILEPATH);

app.post('/upload', upload.array('files'), async (req: express.Request, res: express.Response) => {
  const files: Express.Multer.File[] = req.files as Express.Multer.File[];

  const uploadCost = await UploadCostCalculator.calculate(files.map((file) => file.size));

  console.log(`Upload Cost: ${JSON.stringify(uploadCost, null, 2)}`);

  const tx = await solanaConnection.getTransaction(req.body.txId);

  const {
    meta: {
      preBalances: [
        _fromAddressPreBalance,
        toAddressPreBalance,
      ],
      postBalances: [
        _fromAddressPostBalance,
        toAddressPostBalance,
      ],
    },
  } = tx;

  console.log(tx);

  console.log(JSON.stringify(tx));

  const toAddressBalanceChange = toAddressPostBalance - toAddressPreBalance;
  const slippageMin = toAddressBalanceChange * 0.99;
  const slippageMax = toAddressBalanceChange * 1.01;
  const paidInFull = slippageMin <= uploadCost.lamports && uploadCost.lamports <= slippageMax;

  console.log(`To Address Balance Change: ${toAddressBalanceChange}`);
  console.log(`Paid in Full: ${paidInFull}`);

  const data = files[0].buffer;
  const transaction: Transaction = await arweave.createTransaction({ data }, arweaveJWK);

  // transaction.addTag('Content-Type', 'application/pdf');

  await arweave.transactions.sign(transaction, arweaveJWK);

  const uploader = await arweave.transactions.getUploader(transaction);

  while (!uploader.isComplete) {
    await uploader.uploadChunk();
    console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
  }

  let confirmed = false;

  while (!confirmed) {
    const status = await arweave.transactions.getStatus(transaction.id);
    console.log(status);

    if (status.status === 200 || status.status === 202) {
      confirmed = true;
    }

    await WaitUtil.timeout(2000);
  }

  const url = `https://arweave.net/${transaction.id}`;

  res.json({
    url,
  });
});

app.listen(3001, () => {
  console.log('Server live on port 3001');
});
