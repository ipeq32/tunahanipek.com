import About from "@/app/_components/sections/About";
import Cta from "@/app/_components/sections/Cta";
import Experience from "@/app/_components/sections/Experience";
import Footer from "@/app/_components/sections/Footer";
import Hero from "@/app/_components/sections/Hero";
import Skills from "@/app/_components/sections/Skills";
import type { PublicContact } from "@/app/_lib/contact";
import type { PublicResume } from "@/app/_lib/resume";

type HomePageProps = {
  resume: PublicResume | null;
  contact: PublicContact;
};

export default function HomePage({ resume, contact }: HomePageProps) {
  return (
    <main className="flex flex-1 flex-col">
      <Hero resume={resume} />
      <About />
      <Experience />
      <Skills />
      <Cta contact={contact} />
      <Footer resume={resume} />
    </main>
  );
}
