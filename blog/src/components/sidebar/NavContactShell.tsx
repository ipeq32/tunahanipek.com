import { getLocale } from 'next-intl/server';

import NavContact from './Contact';
import { getOfficeHoursSnapshot } from '@/lib/office-hours';
import { parseLocale } from '@/i18n/request';

const NavContactShell = async () => {
  const locale = parseLocale(await getLocale());
  const officeHours = getOfficeHoursSnapshot();

  return <NavContact officeHours={officeHours} locale={locale} />;
};

export default NavContactShell;
