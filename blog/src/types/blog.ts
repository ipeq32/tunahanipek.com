export interface BlogTranslationInput {
  languageCode: string;
  title: string;
  content: string;
  summary: string;
  published?: boolean;
}

export interface BlogTranslationDto {
  languageCode: string;
  title: string;
  content: string;
  summary: string;
  published: boolean;
}

export interface IGetBlog {
  id: string;
  title: string;
  content: string;
  summary: string;
  image: string;
  shortImage: string;
  published: boolean;
  locale: string;
  isLocaleFallback: boolean;
  availableLocales: string[];
  translations?: BlogTranslationDto[];
  createdAt: Date;
  updatedAt: Date;
  author: {
    name: string;
    image: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  };
  tags: string[];
  categories: string[];
}
