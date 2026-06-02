import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AddBlogFeature from './_features/AddBlog';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('Blog.Add');

  return (
    <>
      <HeaderTemplate title={t('title')} description={t('description')} />
      <AddBlogFeature />
    </>
  );
}
