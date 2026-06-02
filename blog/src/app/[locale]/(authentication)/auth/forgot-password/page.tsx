import HeaderTemplate from '@/components/templates/HeaderTemplate';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  return (
    <section className="h-[calc(100vh-250px)] flex flex-col items-center md:justify-center gap-6">
      <HeaderTemplate
        title="Şifremi Unuttum"
        description="E-posta ile şifre sıfırlama yakında eklenecek."
      />
      <div className="w-[600px] max-md:w-full text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Bu özellik henüz aktif değil. Lütfen daha sonra tekrar deneyin veya
          yönetici ile iletişime geçin.
        </p>
        <Button variant="outline" asChild>
          <Link href="/auth/login">Giriş sayfasına dön</Link>
        </Button>
      </div>
    </section>
  );
}
