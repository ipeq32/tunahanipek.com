import { ReactNode } from 'react';
import BodyTemplate from './BodyTemplate';
import HeaderTemplate from './HeaderTemplate';

type PageTemplateProps = {
  title: string;
  description: string;
  image?: string;
  children?: ReactNode;
  params?: {
    id: string;
  };
};

const PageTemplate = ({
  title,
  description,
  image,
  children,
}: PageTemplateProps) => {
  return (
    <main className="relative flex flex-col w-full min-h-screen">
      <HeaderTemplate title={title} description={description} image={image} />
      <BodyTemplate>{children}</BodyTemplate>
    </main>
  );
};

export default PageTemplate;
