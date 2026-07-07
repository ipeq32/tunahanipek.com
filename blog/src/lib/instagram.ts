export type InstagramPost = {
  src: string;
  url: string;
};

/** Newest first — matches footer grid order (top-left = latest). */
export const INSTAGRAM_POSTS: InstagramPost[] = [
  {
    src: '/insta-photo-1.jpg',
    url: 'https://www.instagram.com/p/BtYoiKplxjKfBcFcpjSfCRhiBgWjmFYyCMQMqM0/',
  },
  {
    src: '/insta-photo-2.jpg',
    url: 'https://www.instagram.com/p/CzXScHENJP_IaA1kbULM4rGAt_e3F_ljwHfguw0/',
  },
  {
    src: '/insta-photo-3.jpg',
    url: 'https://www.instagram.com/p/BtRVtURFUM2kWGGaaq_VektF2mH1Jl81ApwhQg0/',
  },
  {
    src: '/insta-photo-4.jpg',
    url: 'https://www.instagram.com/p/CzXScHENJP_IaA1kbULM4rGAt_e3F_ljwHfguw0/',
  },
];

export const PROFILE_INSTAGRAM_POST = INSTAGRAM_POSTS[3];
