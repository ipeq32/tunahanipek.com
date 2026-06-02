import { auth } from '@/auth';
import HeaderTemplate from '@/components/templates/HeaderTemplate';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <>
      <HeaderTemplate
        title="Profil"
        description="Hesap bilgileriniz"
      />
      <div className="mt-8 space-y-4 max-w-lg">
        <div>
          <p className="text-xs text-muted-foreground">Ad</p>
          <p className="font-medium">{user.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">E-posta</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Telefon</p>
          <p className="font-medium">{user.phone}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Adres</p>
          <p className="font-medium">{user.address}</p>
        </div>
        {user.bio && (
          <div>
            <p className="text-xs text-muted-foreground">Biyografi</p>
            <p className="font-medium">{user.bio}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Rol</p>
          <p className="font-medium">{user.role}</p>
        </div>
      </div>
    </>
  );
}
