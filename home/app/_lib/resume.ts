import { site } from "@/app/_content/site";

export type PublicResume = {
  url: string;
  fileName: string;
  updatedAt: string;
};

function getBlogApiBase(): string {
  const internal = process.env.BLOG_INTERNAL_API_URL?.replace(/\/$/, "");
  if (internal) {
    return internal;
  }

  const base =
    process.env.BLOG_API_URL ??
    process.env.NEXT_PUBLIC_BLOG_URL ??
    site.blogUrl;

  return base.replace(/\/$/, "");
}

export async function fetchPublicResume(): Promise<PublicResume | null> {
  try {
    const res = await fetch(`${getBlogApiBase()}/api/public/resume`, {
      next: { revalidate: 300 },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      return null;
    }

    return (await res.json()) as PublicResume;
  } catch {
    return null;
  }
}
