import request from 'axios';

// arbundler uses a pricing endpoint which also accurately captures L2 fees.
// https://node1.bundlr.network/price/{totalUploadedBytes}
// internal fee calculation: fee(n) = bundler fee * l1_fee(1) * max(n, 2048) * network difficulty multiplier

const ARWEAVE_URL = 'https://node1.bundlr.network';
const CONVERSION_RATES_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=solana,arweave&vs_currencies=usd';
const WINSTON_MULTIPLIER = 10 ** 12;
const LAMPORTS_PER_SOL = 10 ** 8;

type TokenPrices = {
  solana: number;
  arweave: number;
}

type UploadCost = {
  solana: number;
  lamports: number;
  arweave: number;
  winston: number;
  arweavePrice: number;
  solanaPrice: number;
  exchangeRate: number;
  totalBytes: number;
}

class UploadCostCalculator {
  private static async fetchTokenPrices(): Promise<TokenPrices> {
    const response = await request(CONVERSION_RATES_URL);
    const body = response.data;
    const arweavePrice = body.arweave.usd ?? null;
    const solanaPrice = body.solana.usd ?? null;

    if (arweavePrice === null || solanaPrice === null) {
      throw new Error('Failed to retreive prices.');
    }

    return {
      solana: solanaPrice,
      arweave: arweavePrice,
    };
  }

  public static async fetchArweaveStorageCost(bytes: number): Promise<number> {
    const response = await request(`${ARWEAVE_URL}/price/${bytes}`);
    return Number.parseInt(response.data, 10);
  }

  public static async calculate(fileSizes: number[]): Promise<UploadCost> {
    const totalBytes = fileSizes.reduce((sum, fileSize) => {
      return sum + fileSize;
    }, 0);

    const [tokenPrices, totalWinstonCost] = await Promise.all([
      UploadCostCalculator.fetchTokenPrices(),
      UploadCostCalculator.fetchArweaveStorageCost(totalBytes),
    ]);

    const totalArCost = totalWinstonCost / WINSTON_MULTIPLIER;

    const arweavePrice = tokenPrices.arweave;
    const solanaPrice = tokenPrices.solana;
    const exchangeRate = arweavePrice / solanaPrice;
    const solana = totalArCost * exchangeRate;

    return {
      solana,
      lamports: solana * LAMPORTS_PER_SOL,
      arweave: totalArCost,
      winston: totalWinstonCost,
      arweavePrice,
      solanaPrice,
      exchangeRate,
      totalBytes,
    };
  }
}

export default UploadCostCalculator;
