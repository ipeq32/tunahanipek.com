import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';

export default function SettingPage() {
  return (
    <>
      <HeaderTemplate
        title="Ayarlar"
        description="Hesap ve uygulama ayarları"
      />
      <div className="mt-8 space-y-4 max-w-lg">
        <p className="text-sm text-muted-foreground">
          Şifre değiştirme ve profil düzenleme yakında eklenecek.
        </p>
        <Button variant="outline" asChild>
          <Link href="/profile">Profile git</Link>
        </Button>
      </div>
    </>
  );
}
