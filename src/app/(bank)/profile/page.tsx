import { getUserFromCookies } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import NameForm from './ProfileNameForm';
import PasswordForm from './ProfilePasswordForm';

export default async function ProfilePage() {
  const user = await getUserFromCookies();
  if (!user) return null;

  return (
    <div>
      <PageHeader title="Profile" description="Manage your personal information" />
      <div className="grid gap-6 md:grid-cols-2">
        <NameForm defaultName={user.name} email={user.email} />
        <PasswordForm />
      </div>
    </div>
  );
}
