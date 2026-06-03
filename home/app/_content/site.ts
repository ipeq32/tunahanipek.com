export const site = {
  name: "Tunahan İPEK",
  role: "Yazılım Geliştirici",
  tagline: "Full‑stack · DevOps",
  bio: [
    "Denizli merkezli bir yazılım geliştiriciyim. Detay odaklı, ölçeklenebilir ve kullanıcı odaklı web/mobil ürünler geliştirmeye odaklanıyorum.",
    "Frontend ve full‑stack geliştirme tarafında; React, Next.js, Vue.js ve Svelte gibi modern JavaScript ekosistemiyle çalışıyorum. Backend tarafında Node.js/NestJS; veri katmanında PostgreSQL ve GraphQL ile üretim ortamı ihtiyaçlarına uygun çözümler geliştiriyorum.",
    "Ayhanlar Holding’de Software Team Lead ve Full‑Stack Developer rollerinde; Next.js, React Native, NestJS, TailwindCSS, Redux ve GraphQL kullanarak web ve mobil projelerde ekip liderliği yaptım, teslimat süreçlerini yönettim ve uygulama yaşam döngüsünü iyileştirdim.",
    "Rubiklabs’ta Full‑Stack Software Developer olarak performans ve kullanıcı deneyimi odaklı ürünler geliştirdim; UI/UX ekibiyle yakın çalıştım, Figma tasarımlarını üretim kalitesinde arayüzlere dönüştürdüm ve SEO/erişilebilirlik prensiplerine uygun işler çıkardım.",
    "Freelance olarak farklı sektörlerden müşteriler için özel web uygulamaları geliştirdim; e‑ticaret benzeri uçtan uca çözümler, yönetim panelleri ve kullanıcı dostu arayüzler teslim ettim.",
    "Teknoloji setim: React/React Native, Next.js, NestJS, Node.js, TailwindCSS, Redux, GraphQL, PostgreSQL; ayrıca Docker ve Git ekosistemiyle teslimat ve ekip içi iş akışlarını destekliyorum.",
    "DevOps/Platform tarafında Kubernetes ve self‑hosted kurulumlarla da ilgileniyorum: GitLab + GitLab Runner, Rancher ve Harbor gibi bileşenlerle CI/CD ve container registry süreçlerini yönetiyor; otomasyon tarafında n8n ile iş akışları tasarlıyorum. Buradaki teknoloji listesi kullandıklarımın tamamı değil; ürün ihtiyacına göre farklı araç ve servislerle de çalışıyorum. Teknik notlarımı ve deneyimlerimi blogumda paylaşıyorum.",
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
  /** Sosyal önizleme; kişisel fotoğraf */
  openGraphImage: "/tunahanipek.jpg",
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
    "Tunahan İpek — yazılım geliştirici. Full‑stack ve frontend geliştirme, ekip liderliği deneyimi, iletişim bilgileri ve teknik blog.",
  locale: "tr_TR",
} as const;
