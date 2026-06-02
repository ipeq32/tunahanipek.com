import NavContact from './Contact';
import { getOfficeHoursSnapshot } from '@/lib/office-hours';

const NavContactShell = () => {
  const officeHours = getOfficeHoursSnapshot();

  return <NavContact officeHours={officeHours} />;
};

export default NavContactShell;
