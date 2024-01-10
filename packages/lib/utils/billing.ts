import { AppError } from '../errors/app-error';
import type { Subscription } from '.prisma/client';
import { SubscriptionStatus } from '.prisma/client';

/**
 * Returns true if there is a subscription that is active and is a community plan.
 */
export const subscriptionsContainsActiveCommunityPlan = (
  subscriptions: Subscription[],
  communityPlanPriceIds: string[],
) => {
  return subscriptions.some(
    (subscription) =>
      subscription.status === SubscriptionStatus.ACTIVE &&
      communityPlanPriceIds.includes(subscription.priceId),
  );
};

export const getTeamSeatPriceId = () => {
  if (!process.env.NEXT_PUBLIC_STRIPE_TEAM_SEAT_PRICE_ID) {
    throw new AppError('MISSING_STRIPE_TEAM_SEAT_PRICE_ID');
  }

  return process.env.NEXT_PUBLIC_STRIPE_TEAM_SEAT_PRICE_ID;
};
