export type BlogSeedEntry = {
  title: string;
  summary: string;
  content: string;
  image: string;
  shortImage: string;
  tags: string[];
  categories: string[];
  published: boolean;
  /** Yayın tarihi — seed listesi ve DB createdAt ile aynı */
  createdAt: Date;
};
