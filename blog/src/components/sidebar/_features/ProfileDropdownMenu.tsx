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

type ProfileDropdownMenuProps = {
  onLogout: () => void;
  user: User | undefined;
};

function ProfileDropdownMenuFeature({
  onLogout,
  user,
}: ProfileDropdownMenuProps) {
  const t = useTranslations('Navbar.Main');

  return (
    <DropdownMenu>
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
        <DropdownMenuLabel>Hesabım</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profili Görüntüle</DropdownMenuItem>
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Ayarlar</DropdownMenuItem>
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
