import UploadCostCalculator from '@solweave/cost-calculator';
import {
  Connection,
  ConfirmOptions,
} from '@solana/web3.js';
import express, { Express } from 'express';
import multer from 'multer';
import cors from 'cors';
import Arweave from 'arweave';
import fs from 'fs-extra';
import { JWKInterface } from 'arweave/node/lib/wallet';
import Transaction from 'arweave/node/lib/transaction';
import { ApiConfig } from 'arweave/node/lib/api';

interface AppConfig {
  port: string | number;
  solanaConfig: ConfirmOptions & { network: string };
  arweaveConfig: ApiConfig & { jwkFilePath: string };
}

class App {
  public app: Express;

  public port: string | number;

  private solana: Connection;

  private arweave: Arweave;

  private arweaveJWK: JWKInterface;

  constructor(params: AppConfig) {
    this.app = express();
    this.app.use(cors({ origin: '*' }));
    this.port = params.port;
    this.solana = new Connection(
      params.solanaConfig.network,
      params.solanaConfig.preflightCommitment,
    );
    this.arweave = Arweave.init(params.arweaveConfig);
    this.arweaveJWK = fs.readJsonSync(params.arweaveConfig.jwkFilePath);

    this.initializeHTTP();
  }

  public listen(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log('Server live on port 3001');
        resolve();
      });
    });
  }

  private initializeHTTP() {
    const upload = multer();

    this.app.post('/upload', upload.array('files'), async (req: express.Request, res: express.Response) => {
      const files: Express.Multer.File[] = req.files as Express.Multer.File[];

      const uploadCost = await UploadCostCalculator.calculate(files.map((file) => file.size));

      console.log(`Upload Cost: ${JSON.stringify(uploadCost, null, 2)}`);

      const tx = await this.solana.getTransaction(req.body.txId);

      const {
        meta: {
          preBalances: [
            fromAddressPreBalance,
            toAddressPreBalance,
          ],
          postBalances: [
            fromAddressPostBalance,
            toAddressPostBalance,
          ],
        },
        transaction: {
          message: {
            accountKeys,
          },
        },
      } = tx;

      console.log(accountKeys.forEach((key) => console.log(key.toString())));

      console.log(JSON.stringify(tx));

      const toAddressBalanceChange = toAddressPostBalance - toAddressPreBalance;
      const slippageMin = toAddressBalanceChange * 0.99;
      const slippageMax = toAddressBalanceChange * 1.01;
      const paidInFull = slippageMin <= uploadCost.lamports && uploadCost.lamports <= slippageMax;

      const fromAddressBalanceChange = fromAddressPostBalance - fromAddressPreBalance;
      console.log(`From Address Balance Change: ${fromAddressBalanceChange}`);
      console.log(`To Address Balance Change: ${toAddressBalanceChange}`);
      console.log(`Paid in Full: ${paidInFull}`);

      const urls = await Promise.all(files.map(async (file) => {
        const data = file.buffer;
        const transaction: Transaction = await this.arweave.createTransaction({ data }, this.arweaveJWK);

        console.log(transaction);

        // transaction.addTag('Content-Type', 'application/pdf');

        await this.arweave.transactions.sign(transaction, this.arweaveJWK);

        const uploader = await this.arweave.transactions.getUploader(transaction);

        while (!uploader.isComplete) {
          await uploader.uploadChunk();
          console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
        }

        return `https://arweave.net/${transaction.id}`;
      }));

      res.json({
        urls,
      });
    });
  }
}

export default App;
