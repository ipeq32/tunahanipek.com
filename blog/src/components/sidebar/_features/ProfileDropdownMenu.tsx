'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { User } from 'next-auth';
import { Link } from '@/navigation';
import { useState } from 'react';

type ProfileDropdownMenuProps = {
  onLogout: () => void;
  user: User | undefined;
};

function ProfileDropdownMenuFeature({
  onLogout,
  user,
}: ProfileDropdownMenuProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const t = useTranslations('Navbar.Main');

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isModerator = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const onClickedLink = () => {
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={(e) => setIsOpen(e)}>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage
            src={
              user?.image ||
              'https://img.icons8.com/?size=100&id=21441&format=png&color=000000'
            }
          />
          <AvatarFallback>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="text-slate-400/50 dark:text-slate-200/50">
          Hesabım
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link onClick={onClickedLink} href="/profile" className="w-full">
            Profili Görüntüle
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            onClick={onClickedLink}
            href="https://github.com/ipeq32"
            className="w-full"
          >
            GitHub
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link onClick={onClickedLink} href="/setting" className="w-full">
            Ayarlar
          </Link>
        </DropdownMenuItem>
        {isModerator && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-slate-400/50 dark:text-slate-200/50">
              Moderasyon
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link onClick={onClickedLink} href="/blog/add" className="w-full">
                Blog Ekle
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-slate-400/50 dark:text-slate-200/50">
              Yönetici
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                onClick={onClickedLink}
                href="/admin/blog"
                className="w-full"
              >
                Blog Yönetimi
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                onClick={onClickedLink}
                href="/admin/project"
                className="w-full"
              >
                Proje Yönetimi
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Button variant="destructive" className="w-full" onClick={onLogout}>
            {t('Sidebar.Profile.logout')}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ProfileDropdownMenuFeature;
