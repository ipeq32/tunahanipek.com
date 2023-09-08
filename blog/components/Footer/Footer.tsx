'use client'

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { Instagram, Linkedin, Phone, Mail, MapPin, Github } from "lucide-react";
import { blog } from "@jotai/atoms";
import { useAtom } from "jotai";

type Props = {};

const Footer = ({ }: Props) => {
  const [isMenuOpen] = useAtom(blog.blogSidebarOpenAtom);

  const emailAddress = "tnhnipek@gmail.com";
  const emailSubject = "Tunahan İPEK Sitesinden Gelen Mail";
  const emailBody = "Merhaba Tunahan İPEK, \n\nBen size bu maili Tunahan İPEK sitesinden gönderiyorum. \n\nSize bir sorum olacak. \n\nDönüş yaparsanız sevinirim. \n\nİyi çalışmalar.";
  const recipientAddress = "Gültepe, Albayrak Meydanı, Merkezefendi/Denizli";

  const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
  const googleMapsLink = `https://www.google.com/maps/search/${encodeURIComponent(recipientAddress)}`;

  const instagramLinks = [
    {
      src: "/insta-photo-1.jpg",
      hFull: false,
      url: "https://www.instagram.com/p/BtYoiKplxjKfBcFcpjSfCRhiBgWjmFYyCMQMqM0/?igshid=NzZhOTFlYzFmZQ=="
    },
    {
      src: "/insta-photo-2.jpg",
      hFull: false,
      url: "https://www.instagram.com/p/BUYljfQA9m2RUxJJGvaapuYUg2lzrl7nyfh1ic0/?igshid=NzZhOTFlYzFmZQ=="
    },
    {
      src: "/insta-photo-3.jpg",
      hFull: false,
      url: "https://www.instagram.com/p/BtRVtURFUM2kWGGaaq_VektF2mH1Jl81ApwhQg0/?igshid=NzZhOTFlYzFmZQ=="
    },
    {
      src: "/insta-photo-4.jpg",
      hFull: true,
      url: "https://www.instagram.com/p/BUYlWbBgnpYYpYdBVfHte36x_Z40DPrChZKmzI0/?igshid=NzZhOTFlYzFmZQ=="
    },
  ];

  return (
    <>
      {!isMenuOpen && (
        <footer className="flex flex-col justify-between py-5 items-center max-2xl:px-10 mt-20 h-max bg-secondary">
          <div className="max-w-screen-2xl w-full flex flex-row  justify-center items-start flex-wrap mb-5">
            {/* logo and contact */}
            <div className="flex flex-col items-center justify-around w-80 h-64 max-md:border-b-2 max-md:border-slate-400 max-md:my-4 max-md:pb-4 z-10">
              <figure className="flex justify-center items-center w-32 h-32">
                <div id="preloader" className="!w-full !h-full !bg-transparent">
                  <svg
                    id="logo"
                    data-name="Layer 1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 203.29 204.17"
                    className="!w-full !h-full"
                  >
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00bc9b" />
                        <stop offset="100%" stopColor="#5eaefd" />
                      </linearGradient>
                    </defs>
                    <path
                      className="st1 ![animation-direction:alternate-reverse] ![animation-iteration-count:infinite]"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      fill="none"
                      d="M190.42,253.13s1.76,24.46,36.1,24.55l34.34.1s71.44-2.21,70.73,69.92-1.08,79.37-1.08,79.37-2.84,30.61-37.56,30.22c.29-20.25,1.4-106.86,1.4-106.86s-18-10.17-36.65-10.95-38.09-12.13-41.09-15.13a22.3,22.3,0,0,0,8.59.39s-20.33-8-31-32c13.57,15.79,22.05,13.31,22.05,13.31s-26.14-15.74-25.8-32.32C190.66,261.77,190.42,253.13,190.42,253.13Z"
                      transform="translate(-190.41 -253.13)"
                    />
                    <path
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      fill="none"
                      className="st0 ![animation-direction:alternate-reverse] ![animation-iteration-count:infinite] ![animation-duration:4s]"
                      d="M332.24,300.61a95.75,95.75,0,0,1,5.31,34.69h28.18s22.3-1.66,28-27.88v-6.81Z"
                      transform="translate(-190.41 -253.13)"
                    />
                  </svg>
                </div>
              </figure>
              <div className="relative flex justify-center group/slogan px-2 py-1 rounded-md">
                <span className="absolute bottom-0 left-1/2 translate-x-[-50%] w-0 h-0 bg-green-800 group-hover/slogan:w-full group-hover/slogan:h-full transition-all duration-300 ease-linear rounded-md" />
                <p className="text-center cursor-default group-hover/slogan:text-slate-300 text-sm flex items-center z-10">Hayat Sevince Güzel '` SEV `'</p>
              </div>
              <div className="flex flex-row items-center gap-3">
                <p className="text-lg">Follow Me</p>
                <div className="flex flex-row items-center gap-2">
                  <Link href="https://github.com/ipeq32" target="_blank">
                    <Github className="hover:text-stone-500 transition-colors duration-500 ease-linear" width={20} height={20} />
                  </Link>
                  <Link href="https://www.instagram.com/tnhnipek" target="_blank">
                    <Instagram className="hover:text-rose-500 transition-colors duration-500 ease-linear" width={20} height={20} />
                  </Link>
                  <Link href="https://www.linkedin.com/in/tunahanipek" target="_blank">
                    <Linkedin className="hover:text-sky-500 transition-colors duration-500 ease-linear" width={20} height={20} />
                  </Link>
                </div>
              </div>
            </div>
            {/* adress information */}
            <div className="flex flex-col items-center justify-start gap-8 h-64 w-80 max-md:border-b-2 max-md:border-slate-400 max-md:my-4 max-md:pb-4">
              <div className="relative group/info flex items-center justify-center w-full">
                <span className="absolute top-0 left-1/2 translate-x-[-50%] w-0 h-0 bg-green-800 group-hover/info:w-full group-hover/info:h-full transition-all duration-300 ease-linear rounded-md" />
                <p className="text-xl flex items-center z-10 cursor-default">Address Information</p>
              </div>
              <div className="flex flex-col items-center justify-stretch h-full gap-4">
                <div className="flex flex-row items-center group/call w-full gap-2 mr-5 h-10">
                  <Link href={"tel:+905416064488"} target="_blank" className="relative flex justify-center items-center group/phone rounded-md bg-indigo-900 h-full w-10">
                    <span className="absolute bg-amber-600 bottom-0 w-0 h-0 group-hover/phone:w-full group-hover/phone:h-full rounded-md transition-all duration-300 ease-linear" />
                    <Phone width={25} height={25} className="group-hover/phone:text-slate-200 group-hover/phone:scale-125 text-amber-400 z-10 transition-colors" />
                  </Link>
                  <div className="flex flex-col items-start">
                    <div className="text-md font-medium text-gray-500 group-hover/call:text-gray-400">Call me now</div>
                    <div className="text-sm font-medium text-gray-400 group-hover/call:text-gray-300">+90 (541) 606-4488</div>
                  </div>
                </div>
                <div className="flex flex-row items-center group/call w-full gap-2 mr-5 h-10">
                  <Link href={mailtoLink} target="_blank" className="relative flex justify-center items-center group/phone rounded-md bg-indigo-900 h-full w-10">
                    <span className="absolute bg-amber-600 bottom-0 w-0 h-0 group-hover/phone:w-full group-hover/phone:h-full rounded-md transition-all duration-300 ease-linear" />
                    <Mail width={25} height={25} className="group-hover/phone:text-slate-200 group-hover/phone:scale-125 text-amber-400 z-10 transition-colors" />
                  </Link>
                  <div className="flex flex-col items-start">
                    <div className="text-md font-medium text-gray-500 group-hover/call:text-gray-400">Email Address</div>
                    <div className="text-sm font-medium text-gray-400 group-hover/call:text-gray-300">tnhnipek@gmail.com</div>
                  </div>
                </div>
                <div className="flex flex-row items-center group/call w-full gap-2 mr-5 h-10">
                  <Link href={googleMapsLink} target="_blank" className="relative flex justify-center items-center group/phone rounded-md bg-indigo-900 h-full w-10">
                    <span className="absolute bg-amber-600 bottom-0 w-0 h-0 group-hover/phone:w-full group-hover/phone:h-full rounded-md transition-all duration-300 ease-linear" />
                    <MapPin width={25} height={25} className="group-hover/phone:text-slate-200 group-hover/phone:scale-125 text-amber-400 z-10 transition-colors" />
                  </Link>
                  <div className="flex flex-col items-start">
                    <div className="text-md font-medium text-gray-500 group-hover/call:text-gray-400">Address</div>
                    <div className="text-sm font-medium text-gray-400 group-hover/call:text-gray-300">Gültepe/DENİZLİ</div>
                  </div>
                </div>
              </div>
            </div>
            {/* useful links */}
            <div className="flex flex-col items-center justify-start gap-5 h-64 w-80 max-md:border-b-2 max-md:border-slate-400 max-md:my-4 max-md:pb-4 max-md:h-max">
              <div className="relative group/info flex items-center justify-center w-full">
                <span className="absolute top-0 left-1/2 translate-x-[-50%] w-0 h-0 bg-green-800 group-hover/info:w-full group-hover/info:h-full transition-all duration-300 ease-linear rounded-md" />
                <p className="text-xl flex items-center z-10 cursor-default">Useful Links</p>
              </div>
              <div className="flex flex-col items-center justify-stretch h-full gap-2">
                <div className="relative flex items-start w-full group/about px-2 py-1 rounded-md">
                  <span className="absolute top-1/2 left-0 translate-y-[-50%] w-0 h-0 bg-amber-400 group-hover/about:w-full group-hover/about:h-full transition-all duration-300 ease-linear rounded-md" />
                  <Link href={"/about-me"} className="flex items-center z-10 text-md font-medium text-slate-300 group-hover/about:text-indigo-950">&gt;&nbsp; About Me</Link>
                </div>
                <div className="relative flex items-start w-full group/about px-2 py-1 rounded-md">
                  <span className="absolute top-1/2 left-0 translate-y-[-50%] w-0 h-0 bg-amber-400 group-hover/about:w-full group-hover/about:h-full transition-all duration-300 ease-linear rounded-md" />
                  <Link href={"/projects"} className="flex items-center z-10 text-md font-medium text-slate-300 group-hover/about:text-indigo-950">&gt;&nbsp; Projects</Link>
                </div>
                <div className="relative flex items-start w-full group/about px-2 py-1 rounded-md">
                  <span className="absolute top-1/2 left-0 translate-y-[-50%] w-0 h-0 bg-amber-400 group-hover/about:w-full group-hover/about:h-full transition-all duration-300 ease-linear rounded-md" />
                  <Link href={"/faq"} className="flex items-center z-10 text-md font-medium text-slate-300 group-hover/about:text-indigo-950">&gt;&nbsp; Faq</Link>
                </div>
                <div className="relative flex items-start w-full group/about px-2 py-1 rounded-md">
                  <span className="absolute top-1/2 left-0 translate-y-[-50%] w-0 h-0 bg-amber-400 group-hover/about:w-full group-hover/about:h-full transition-all duration-300 ease-linear rounded-md" />
                  <Link href={"/contact"} className="flex items-center z-10 text-md font-medium text-slate-300 group-hover/about:text-indigo-950">&gt;&nbsp; Contact Me</Link>
                </div>
              </div>
            </div>
            {/* instagram */}
            <div className="flex flex-col items-center justify-start gap-8 h-64 w-80 max-md:border-b-2 max-md:last:border-transparent max-md:my-4 max-md:pb-4">
              <div className="relative group/info flex items-center justify-center w-full">
                <span className="absolute top-0 left-1/2 translate-x-[-50%] w-0 h-0 bg-green-800 group-hover/info:w-full group-hover/info:h-full transition-all duration-300 ease-linear rounded-md" />
                <p className="text-xl flex items-center z-10 cursor-default">Instagram</p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-1/2 h-full max-md:w-3/4">
                {instagramLinks.map((link, index) => (
                  <Link key={index} href={link.url} target="_blank" className="flex justify-center items-center rounded-md hover:scale-105 hover:shadow-sm hover:shadow-slate-600">
                    <Image src={link.src} alt={`photo ${index}`} width={70} height={70} className={`${link.hFull ? "h-[86%] scale-105" : ""}`} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-5 w-full">
            <span className="bg-slate-500 max-w-screen-2xl w-full h-[1px]" />
            <p className="flex items-center justify-center gap-1 max-mobile-xl:text-xs">© <span className="text-emerald-500 font-semibold max-mobile-xl:font-normal">Blog</span> is Proudly Owned by <Link href={"https://tunahanipek.com"} target="_blank" className="text-emerald-500 font-semibold hover:scale-105">Tunahan İPEK</Link></p>
          </div>
        </footer>
      )}
    </>
  )
};

export default Footer;
