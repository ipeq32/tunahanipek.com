import { IBlogsWithDetails } from "@type/BlogTypes";
import axios from "axios";

export async function getBlogWithDetails(blogId: string) {
  const blogWithDetails = await axios.get<IBlogsWithDetails>(`http://localhost:3000/api/blogs/${blogId}`)
    .then((res) => res.data)
    .catch((err) => console.log(err));

  return blogWithDetails;
}

// export async function getBlogUser(blogId: string): Promise<Pick<IBlogsWithDetails, "user">> {
//   const blogWithDetails = await prisma.blog.findUnique({
//     where: { id: blogId },
//     include: {
//       User: true,
//     },
//   });

//   const { User } = blogWithDetails!;
//   const user = User ? { ...User } : null;

//   return {
//     // user,
//     then: (callback: (user: Pick<IBlogsWithDetails, "user">) => void) => {
//       callback({ User: user });
//     },
//   };
// }

// export async function getBlog(blogId: string): Promise<Omit<IBlogsWithDetails, "user" | "tags">> {
//   const blog = await prisma.blog.findUnique({
//     where: { id: blogId },
//   });

//   return {
//     ...blog!,
//     id: blog!.id,
//     title: blog!.title,
//     image: blog!.image,
//     content: blog!.content,
//     createdAt: blog!.createdAt,
//     updatedAt: blog!.updatedAt,
//     deletedAt: blog!.deletedAt,
//     userId: blog!.userId,
//   };
// }