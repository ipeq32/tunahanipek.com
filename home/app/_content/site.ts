export const site = {
  name: "Tunahan İpek",
  role: "Yazılım Geliştirici",
  tagline: "Kod, öğrenme ve paylaşım üzerine kişisel alanım.",
  bio: [
    "Denizli'de yaşıyorum. Isparta'da Biyomedikal Mühendisliği mezunuyum.",
    "Yazılıma hobi olarak başladım; bugün Rubiklabs'ta yazılım geliştirici olarak çalışıyorum.",
    "Blogumda yazılım notları ve deneyimlerimi paylaşıyorum. Bu site, benimle iletişime geçmek ve bloguma ulaşmak için bir başlangıç noktası.",
  ],
  emails: [
    {
      label: "Kurumsal",
      address: "hello@tunahanipek.com",
    },
    {
      label: "Kişisel",
      address: "tnhnipek@gmail.com",
    },
  ],
  blogUrl: "https://blog.tunahanipek.com",
  profileImage: "/tunahanipek.jpg",
  social: [
    {
      name: "Instagram",
      href: "https://www.instagram.com/tnhnipek",
      icon: "instagram" as const,
    },
    {
      name: "WhatsApp",
      href: "https://wa.me/+905416064488/?text=Merhaba%2C%20sizinle%20ileti%C5%9Fime%20ge%C3%A7mek%20istiyorum.",
      icon: "message-circle" as const,
    },
    {
      name: "GitHub",
      href: "https://github.com/ipeq32",
      icon: "github" as const,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/tunahanipek",
      icon: "linkedin" as const,
    },
    {
      name: "Spotify",
      href: "https://open.spotify.com/user/vmr0p63u44tv5ugde26ybzipx",
      icon: "music" as const,
    },
  ],
} as const;

export const metadataCopy = {
  title: "Tunahan İpek",
  description:
    "Tunahan İpek — yazılım geliştirici. Blog, iletişim bilgileri ve kişisel web sitesi.",
  locale: "tr_TR",
} as const;
