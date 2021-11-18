import UploadCostCalculator from '@solweave/cost-calculator';

async function main() {
  const cost = await UploadCostCalculator.calculate([19000]);
  console.log(cost);
}

main();
