import { Link } from '@/navigation';

function page() {
  return (
    <div className="grid grid-cols-4 gap-5 max-w-72 mt-5">
      <Link href="/auth/login">Login</Link>
      <Link href="/auth/register">register</Link>
      <Link href="/hello/tuna">Hello</Link>
    </div>
  );
}

export default page;
