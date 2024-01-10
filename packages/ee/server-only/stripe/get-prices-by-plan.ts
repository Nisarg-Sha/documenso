import { stripe } from '@documenso/lib/server-only/stripe';

export const getPricesByPlan = async (plan: 'community') => {
  const { data: prices } = await stripe.prices.search({
    query: `metadata['plan']:'${plan}'`,
    expand: ['data.product'],
    limit: 100,
  });

  return prices;
};
