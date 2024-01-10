import { getRequiredServerComponentSession } from '@documenso/lib/next-auth/get-server-component-session';

import { SettingsHeader } from '~/components/(dashboard)/settings/layout/header';
import { ProfileForm } from '~/components/forms/profile';

export default async function ProfileSettingsPage() {
  const { user } = await getRequiredServerComponentSession();

  return (
    <div>
      <SettingsHeader title="Profile" subtitle="Here you can edit your personal details." />

      <ProfileForm user={user} className="max-w-xl" />
    </div>
  );
}
