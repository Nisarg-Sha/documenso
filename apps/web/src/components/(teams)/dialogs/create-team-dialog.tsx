'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import type * as DialogPrimitive from '@radix-ui/react-dialog';
import { CreditCard } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

import { useUpdateSearchParams } from '@documenso/lib/client-only/hooks/use-update-search-params';
import { WEBAPP_BASE_URL } from '@documenso/lib/constants/app';
import { AppError, AppErrorCode } from '@documenso/lib/errors/app-error';
import { trpc } from '@documenso/trpc/react';
import { ZCreateTeamMutationSchema } from '@documenso/trpc/server/team-router/schema';
import { Button } from '@documenso/ui/primitives/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@documenso/ui/primitives/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@documenso/ui/primitives/form/form';
import { Input } from '@documenso/ui/primitives/input';
import { useToast } from '@documenso/ui/primitives/use-toast';

export type CreateTeamDialogProps = {
  trigger?: React.ReactNode;
} & Omit<DialogPrimitive.DialogProps, 'children'>;

const ZCreateTeamFormSchema = ZCreateTeamMutationSchema.pick({
  teamName: true,
  teamUrl: true,
});

type TCreateTeamFormSchema = z.infer<typeof ZCreateTeamFormSchema>;

export const CreateTeamDialog = ({ trigger, ...props }: CreateTeamDialogProps) => {
  const { toast } = useToast();

  const router = useRouter();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  const [open, setOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const actionSearchParam = searchParams?.get('action');

  const form = useForm({
    resolver: zodResolver(ZCreateTeamFormSchema),
    defaultValues: {
      teamName: '',
      teamUrl: '',
    },
  });

  const { mutateAsync: createTeam } = trpc.team.createTeam.useMutation();

  const onFormSubmit = async ({ teamName, teamUrl }: TCreateTeamFormSchema) => {
    try {
      const response = await createTeam({
        teamName,
        teamUrl,
      });

      if (!response.paymentRequired) {
        toast({
          title: 'Success',
          description: 'Your team has been created.',
          duration: 5000,
        });

        setOpen(false);

        return;
      }

      setCheckoutUrl(response.checkoutUrl);
      router.push(`/settings/teams?tab=pending`);
    } catch (err) {
      const error = AppError.parseError(err);

      if (error.code === AppErrorCode.ALREADY_EXISTS) {
        form.setError('teamUrl', {
          type: 'manual',
          message: 'This URL is already in use.',
        });

        return;
      }

      toast({
        title: 'An unknown error occurred',
        variant: 'destructive',
        description:
          'We encountered an unknown error while attempting to create a team. Please try again later.',
      });
    }
  };

  const mapTextToUrl = (text: string) => {
    return text.toLowerCase().replace(/\s+/g, '-');
  };

  useEffect(() => {
    if (actionSearchParam === 'add-team') {
      setOpen(true);
      updateSearchParams({ action: null });
    }
  }, [actionSearchParam, open, setOpen, updateSearchParams]);

  useEffect(() => {
    setCheckoutUrl(null);
    form.reset();
  }, [open, form]);

  return (
    <Dialog
      {...props}
      open={open}
      onOpenChange={(value) => !form.formState.isSubmitting && setOpen(value)}
    >
      <DialogTrigger onClick={(e) => e.stopPropagation()} asChild={true}>
        {trigger ?? <Button variant="secondary">Create team</Button>}
      </DialogTrigger>

      <DialogContent position="center">
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>

          <DialogDescription className="mt-4">
            Create a team to collaborate with your team members.
          </DialogDescription>
        </DialogHeader>

        {checkoutUrl ? (
          <>
            <div className="flex h-44 flex-col items-center justify-center rounded-lg bg-gray-50/70 dark:bg-neutral-900/20">
              <CreditCard className="dark:text-muted-foreground h-8 w-8 text-gray-600" />
              <span className="text-muted-foreground text-sm font-medium">
                Payment is required to finalise the creation of your team.
              </span>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>

              <Button type="submit" asChild>
                <Link href={checkoutUrl} onClick={() => setOpen(false)} target="_blank">
                  Checkout
                </Link>
              </Button>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)}>
              <fieldset
                className="flex h-full flex-col space-y-4"
                disabled={form.formState.isSubmitting}
              >
                <FormField
                  control={form.control}
                  name="teamName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Team Name</FormLabel>
                      <FormControl>
                        <Input
                          className="bg-background"
                          {...field}
                          onChange={(event) => {
                            const oldGeneratedUrl = mapTextToUrl(field.value);
                            const newGeneratedUrl = mapTextToUrl(event.target.value);

                            const urlField = form.getValues('teamUrl');
                            if (urlField === oldGeneratedUrl) {
                              form.setValue('teamUrl', newGeneratedUrl);
                            }

                            field.onChange(event);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Team URL</FormLabel>
                      <FormControl>
                        <Input className="bg-background" {...field} />
                      </FormControl>
                      {!form.formState.errors.teamUrl && (
                        <span className="text-foreground/50 text-xs font-normal">
                          {field.value
                            ? `${WEBAPP_BASE_URL}/t/${field.value}`
                            : 'A unique URL to identify your team'}
                        </span>
                      )}

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>

                  <Button type="submit" loading={form.formState.isSubmitting}>
                    Create Team
                  </Button>
                </DialogFooter>
              </fieldset>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
