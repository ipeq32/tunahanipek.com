import { site } from "@/app/_content/site";
import { getBlogApiBase } from "@/app/_lib/blog-urls";

export type PublicContactEmail = {
  id: "corporate" | "personal";
  address: string;
};

export type PublicContact = {
  emails: PublicContactEmail[];
};

function fallbackContact(): PublicContact {
  return {
    emails: site.emails.map((email) => ({
      id: email.id,
      address: email.address,
    })),
  };
}

export async function fetchPublicContact(): Promise<PublicContact> {
  try {
    const res = await fetch(`${getBlogApiBase()}/api/public/contact`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return fallbackContact();
    }

    const data = (await res.json()) as PublicContact;

    if (!Array.isArray(data.emails) || data.emails.length === 0) {
      return fallbackContact();
    }

    return data;
  } catch {
    return fallbackContact();
  }
}
