import { getBlogApiBase } from "@/app/_lib/blog-urls";

export type PublicResume = {
  url: string;
  fileName: string;
  updatedAt: string;
};

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
