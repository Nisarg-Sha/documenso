import { getPricesByPlan } from './get-prices-by-plan';

export const getCommunityPlanPrices = async () => {
  return await getPricesByPlan('community');
};

export const getCommunityPlanPriceIds = async () => {
  const prices = await getCommunityPlanPrices();

  return prices.map((price) => price.id);
};
