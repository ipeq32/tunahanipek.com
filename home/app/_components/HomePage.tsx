import About from "@/app/_components/sections/About";
import Cta from "@/app/_components/sections/Cta";
import Experience from "@/app/_components/sections/Experience";
import Footer from "@/app/_components/sections/Footer";
import Hero from "@/app/_components/sections/Hero";
import Skills from "@/app/_components/sections/Skills";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <About />
      <Experience />
      <Skills />
      <Cta />
      <Footer />
    </main>
  );
}
