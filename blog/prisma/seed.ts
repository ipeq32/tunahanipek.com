import { PrismaClient, Prisma } from "@prisma/client";
/*import bcrypt from "bcrypt";
import blogs from "./data/blogs";
import roles from "./data/roles";
import tags from "./data/tags";
import users from "./data/users";
// import blogTag from "./data/blogTag";
*/
const prisma = new PrismaClient();
/*const createRoles = async () => {
  const roleData: Prisma.RoleCreateManyInput = JSON.parse(JSON.stringify(roles));
  let resp = [];

  if (roleData && Array.isArray(roleData)) {
    for (let i = 0; i < roleData.length; i++) {
      const role: Prisma.RoleCreateInput = roleData[i];
      const { ...rest } = role;
      const result = await prisma.role.create({
        data: {
          ...rest,
        },
      });
      resp.push(result);
    }
  }
};

const createUsers = async () => {
  const userData: Prisma.UserCreateManyInput = JSON.parse(JSON.stringify(users));
  let resp = [];

  if (userData && Array.isArray(userData)) {
    for (let i = 0; i < userData.length; i++) {
      const user: Prisma.UserCreateInput = userData[i];
      const { roles, password, ...rest } = user;
      const data = {
        ...rest,
        password: await bcrypt.hash(password, 10),
      };
      const result = await prisma.user.create({
        data: {
          ...data,
        },
      });
      resp.push(result);
    }
  }
}

async function createBlogs() {
  const blogData: Prisma.BlogCreateManyInput = JSON.parse(JSON.stringify(blogs));
  let resp = [];

  if (blogData && Array.isArray(blogData)) {
    for (let i = 0; i < blogData.length; i++) {
      const blog: Prisma.BlogCreateInput = blogData[i];
      const { ...rest } = blog;
      const result = await prisma.blog.create({
        data: {
          ...rest,
        },
      });
      resp.push(result);
    }
  }
}

async function createTags() {
  const tagData: Prisma.TagCreateManyInput = JSON.parse(JSON.stringify(tags));
  let resp = [];

  if (tagData && Array.isArray(tagData)) {
    for (let i = 0; i < tagData.length; i++) {
      const tag: Prisma.TagCreateInput = tagData[i];
      const { ...rest } = tag;
      const result = await prisma.tag.create({
        data: {
          ...rest,
        },
      });
      resp.push(result);
    }
  }
}

// Burası explicit many to many ilişki için kullanılıyor. Ama buna gerek yok çünkü prisma bunu otomatik olarak yapıyor. Yeni bir tablo oluşturmak mantıksız.

// async function createBlogTags() {
//   const blogTagData: Prisma.BlogTagCreateManyInput = JSON.parse(JSON.stringify(blogTag));

//   if (blogTagData && Array.isArray(blogTagData)) {
//     for (const blogTag of blogTagData) {
//       await prisma.blogTag.create({
//         data: blogTag
//       });
//     }
//   }
// }
*/
async function main() {
  //XXX: Önce roller oluşması lazım ki kullanıcılar rolleri ile birlikte oluşsun.
  //XXX: Silerken de önce kullanıcıları sil sonra rolleri sil.

  /*console.log("🚀 ~ file: seed.ts:103 ~ main ~ deleteMany:")
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.tag.deleteMany({});
  console.log("🚀 ~ file: seed.ts:108 ~ main ~ deleteMany:")

  console.log("🚀 ~ --------------------------------- ~ 🚀")

  await createRoles();
  console.log("🚀 ~ file: seed.ts:113 ~ main ~ createRoles:", createRoles)
  await createUsers();
  console.log("🚀 ~ file: seed.ts:115 ~ main ~ createUsers:", createUsers)
  await createTags();
  console.log("🚀 ~ file: seed.ts:117 ~ main ~ createTags:", createTags)
  await createBlogs();
  console.log("🚀 ~ file: seed.ts:119 ~ main ~ createBlogs:", createBlogs)
  // await createBlogTags();
  */
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit();
  });