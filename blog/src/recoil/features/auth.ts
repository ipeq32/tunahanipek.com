import { atom } from 'recoil';

export const loginModalState = atom({
  key: 'loginModal',
  default: true,
});

export const registerModalState = atom({
  key: 'registerModal',
  default: true,
});
