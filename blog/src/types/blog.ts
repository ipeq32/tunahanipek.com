export interface IBlog {
  id: string;
  title: string;
  content: string;
  summary: string;
  image: string;
  shortImage: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: string | null;
}

export interface IGetBlog {
  id: string;
  title: string;
  content: string;
  summary: string;
  image: string;
  shortImage: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    name: string;
    image: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  };
}
