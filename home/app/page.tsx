import { defaultLocale } from "@/config";
import { redirect } from "@/navigation";

export default function RootPage() {
  redirect({ href: "/", locale: defaultLocale });
}
