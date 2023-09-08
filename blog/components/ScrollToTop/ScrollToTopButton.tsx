'use client'

import { Mouse } from "lucide-react";
import { useState, useEffect } from "react";

type Props = {};

const ScrollToTopButton = ({ }: Props) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleScroll = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      className={`fixed bottom-10 right-10 z-50 p-2 rounded-full animate-bell-ringer hover:animate-none bg-gray-600 hover:bg-gray-500 text-white hover:text-slate-200 group transition-all duration-500 ${isVisible ? "block" : "hidden"}`}
      onClick={scrollToTop}
    >
      <Mouse className="group-hover:animate-fade-in-down" />
    </button>
  )
};

export default ScrollToTopButton;