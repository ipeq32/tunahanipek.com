import { IBlogsWithDetails } from "@type/BlogTypes";
import axios from "axios";

export async function getAllBlogsWithDetails() {
  const blogs = await axios.get<IBlogsWithDetails[]>("http://localhost:3000/api/blogs")
    .then((res) => res.data)
    .catch((err) => console.log(err));

  return blogs;
}