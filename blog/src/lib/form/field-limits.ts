export const FIELD_LIMITS = {
  role: {
    name: { min: 2, max: 64 },
    slug: { min: 2, max: 48 },
    description: { max: 240 },
  },
  siteSnippet: {
    content: { min: 5, max: 500 },
  },
  contact: {
    name: { min: 2, max: 120 },
    email: { max: 254 },
    message: { min: 10, max: 5000 },
  },
  blog: {
    title: { min: 3, max: 200 },
    summary: { min: 1, max: 2000 },
    taxonomy: { max: 500 },
  },
  project: {
    title: { min: 2, max: 200 },
    description: { min: 2, max: 10000 },
    gallery: { max: 12 },
  },
  comment: {
    content: { min: 3, max: 2000 },
  },
  profile: {
    name: { min: 3 },
    phone: { min: 10 },
  },
  password: {
    min: 6,
  },
  register: {
    name: { min: 3 },
    phone: { min: 10 },
    bio: { min: 10 },
  },
  aiModel: {
    min: 1,
    max: 120,
  },
} as const;

export const LIVE_FORM_OPTIONS = {
  mode: 'onChange' as const,
  reValidateMode: 'onChange' as const,
};
