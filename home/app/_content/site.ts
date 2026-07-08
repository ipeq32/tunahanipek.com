export const site = {
  name: "Tunahan İPEK",
  profileImage: "/tunahanipek.jpg",
  openGraphImage: "/tunahanipek.jpg",
  blogUrl: "https://blog.tunahanipek.com",
  emails: [
    {
      id: "corporate",
      address: "hello@tunahanipek.com",
    },
    {
      id: "personal",
      address: "tnhnipek@gmail.com",
    },
  ],
  skills: [
    { name: "React", icon: "/skills/react.svg" },
    { name: "React Native", icon: "/skills/reactnative.svg" },
    { name: "Next.js", icon: "/skills/nextdotjs.svg" },
    { name: "Node.js", icon: "/skills/nodedotjs.svg" },
    { name: "Go", icon: "/skills/go.svg" },
    { name: ".NET", icon: "/skills/dotnet.svg" },
    { name: "PostgreSQL", icon: "/skills/postgresql.svg" },
    { name: "Kubernetes", icon: "/skills/kubernetes.svg" },
    { name: "Docker", icon: "/skills/docker.svg" },
    { name: "GraphQL", icon: "/skills/graphql.svg" },
  ],
  social: {
    linkedin: "https://www.linkedin.com/in/tunahanipek",
    github: "https://github.com/ipeq32",
    twitter: "https://twitter.com/tnhnipek",
    instagram: "https://www.instagram.com/tnhnipek",
    whatsapp:
      "https://wa.me/+905416064488/?text=Merhaba%2C%20sizinle%20ileti%C5%9Fime%20ge%C3%A7mek%20istiyorum.",
  },
} as const;
