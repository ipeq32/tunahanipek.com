import { ReactNode } from "react";
import HeaderTemplate from "@components/Templates/HeaderTemplate";
import BodyTemplate from "@components/Templates/BodyTemplate";

type Props = {
  title: string;
  description: string;
  image?: string;
  headerImage?: string | any;
  children?: ReactNode;
  params?: {
    id: string;
  };
};

const PageTemplate = ({ title, description, image, children, headerImage, params }: Props) => {
  return (
    <main className="relative flex flex-col w-full min-h-screen">
      <HeaderTemplate title={title} description={description} image={image} headerImage={headerImage} />
      <BodyTemplate>
        {children}
      </BodyTemplate>
    </main>
  )
};

export default PageTemplate;