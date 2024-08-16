import en from './messages/en.json';
import tr from './messages/tr.json';

type Messages = typeof en & typeof tr;

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
