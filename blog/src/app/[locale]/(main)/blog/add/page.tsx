import HeaderTemplate from '@/components/templates/HeaderTemplate';
import AddBlogFeature from './_features/AddBlog';

const Page = () => {
  return (
    <div className="container">
      <HeaderTemplate
        title="Blog Ekle"
        description="Bloglarınızı bu sayfadan ekleyebilirsiniz. Bloglar eklendikten sonra onaya gider. Onaylanan bloglar, bloglar sayfasında görüntülenecektir."
      />
      <AddBlogFeature />
    </div>
  );
};

export default Page;
