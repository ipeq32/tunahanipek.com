import { Blog, Tag, User } from "@prisma/client";

export interface IBlogsWithDetails extends Blog {
  user: User | null;
  tags: Tag[];
}

export interface IBlogSideBarCategories {
  name: string;
  count: number;
}

export interface IBlogSideBarRecentPosts {
  title: string;
  image: string;
  date: string;
}

export interface IBlogSideBarTags extends Pick<Tag, "name"> {
  name: string;
}