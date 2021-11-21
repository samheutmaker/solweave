import UploadCostCalculator from '@solweave/cost-calculator';
import {
  Connection,
  ConfirmOptions,
} from '@solana/web3.js';
import express from 'express';
import multer from 'multer';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: '*',
}));

const network = 'http://127.0.0.1:8899';

const txConfirmOptions: ConfirmOptions = {
  preflightCommitment: 'confirmed',
  commitment: 'confirmed',
};

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.array('files'), async (req: express.Request, res: express.Response) => {
  const connection = new Connection(
    network,
    txConfirmOptions.preflightCommitment,
  );

  const files: File[] = req.files as any;

  const uploadCost = await UploadCostCalculator.calculate(files.map((file) => file.size));

  console.log(`Upload Cost: ${JSON.stringify(uploadCost, null, 2)}`);

  const tx = await connection.getTransaction(req.body.txId);

  const {
    meta: {
      preBalances: [
        _fromAddressPreBalance,
        toAddressPreBalance,
      ],
      postBalances: [
        _fromAddressPostBalance,
        toAddressPostBalance],
    },
  } = tx;

  const toAddressBalanceChange = toAddressPostBalance - toAddressPreBalance;

  const slippageMin = toAddressBalanceChange * 0.99;
  const slippageMax = toAddressBalanceChange * 1.01;
  const paidInFull = slippageMin <= uploadCost.lamports && uploadCost.lamports <= slippageMax;

  console.log(`To Address Balance Change: ${toAddressBalanceChange}`);
  console.log(`Paid in Full: ${paidInFull}`);

  res.sendStatus(200);
});

app.listen(3001, () => {
  console.log('Server live on port 3001');
});
