export interface IBlog {
  id: string;
  title: string;
  content: string;
  summary: string;
  image: string;
  slug: string;
  shortImage: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  authorId: string | null;
}

export interface IGetBlog {
  id: string;
  title: string;
  content: string;
  summary: string;
  image: string;
  slug: string;
  shortImage: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    name: string;
    image: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  };
}
