import About from "@/app/_components/sections/About";
import Cta from "@/app/_components/sections/Cta";
import Experience from "@/app/_components/sections/Experience";
import Footer from "@/app/_components/sections/Footer";
import Hero from "@/app/_components/sections/Hero";
import Skills from "@/app/_components/sections/Skills";
import type { PublicResume } from "@/app/_lib/resume";

type HomePageProps = {
  resume: PublicResume | null;
};

export default function HomePage({ resume }: HomePageProps) {
  return (
    <main className="flex flex-1 flex-col">
      <Hero resume={resume} />
      <About />
      <Experience />
      <Skills />
      <Cta />
      <Footer resume={resume} />
    </main>
  );
}
