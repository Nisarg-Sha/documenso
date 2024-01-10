'use client';

import { trpc } from '@documenso/trpc/react';
import { cn } from '@documenso/ui/lib/utils';
import { Button } from '@documenso/ui/primitives/button';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type PendingUserTeamsDataTableActionsProps = {
  className?: string;
  pendingTeamId: number;
};

export const PendingUserTeamsDataTableActions = ({
  className,
  pendingTeamId,
}: PendingUserTeamsDataTableActionsProps) => {
  const { toast } = useToast();

  const { mutateAsync: createCheckout, isLoading: creatingCheckout } =
    trpc.team.createTeamPendingCheckout.useMutation({
      onSuccess: (checkoutUrl) => window.open(checkoutUrl, '_blank'),
    });

  const { mutateAsync: deleteTeamPending, isLoading: deletingTeam } =
    trpc.team.deleteTeamPending.useMutation({
      onSuccess: () => {
        toast({
          title: 'Success',
          description: 'Pending team deleted.',
        });
      },
      onError: () => {
        toast({
          title: 'Something went wrong',
          description:
            'We encountered an unknown error while attempting to delete the pending team. Please try again later.',
          duration: 10000,
          variant: 'destructive',
        });
      },
    });

  return (
    <fieldset
      disabled={creatingCheckout || deletingTeam}
      className={cn('flex justify-end space-x-2', className)}
    >
      <Button
        variant="outline"
        loading={creatingCheckout}
        onClick={async () => createCheckout({ pendingTeamId: pendingTeamId })}
      >
        Pay
      </Button>

      <Button
        variant="destructive"
        loading={deletingTeam}
        onClick={async () => deleteTeamPending({ pendingTeamId: pendingTeamId })}
      >
        Remove
      </Button>
    </fieldset>
  );
};
