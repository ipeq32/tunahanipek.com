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
import NextLink from 'next/link';

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
  const tProfile = useTranslations('Navbar.Main.Sidebar.Profile');

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
          {tProfile('account')}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link onClick={onClickedLink} href="/profile" className="w-full">
            {tProfile('viewProfile')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <NextLink
            onClick={onClickedLink}
            href="https://github.com/ipeq32"
            className="w-full"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </NextLink>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link onClick={onClickedLink} href="/setting" className="w-full">
            {tProfile('settings')}
          </Link>
        </DropdownMenuItem>
        {isModerator && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-slate-400/50 dark:text-slate-200/50">
              {tProfile('moderation')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link onClick={onClickedLink} href="/blog/add" className="w-full">
                {tProfile('addBlog')}
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-slate-400/50 dark:text-slate-200/50">
              {tProfile('admin')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link
                onClick={onClickedLink}
                href="/admin/blog"
                className="w-full"
              >
                {tProfile('manageBlog')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                onClick={onClickedLink}
                href="/admin/project"
                className="w-full"
              >
                {tProfile('manageProject')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                onClick={onClickedLink}
                href="/admin/comments"
                className="w-full"
              >
                {tProfile('moderateComments')}
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
