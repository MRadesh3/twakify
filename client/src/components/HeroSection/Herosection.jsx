import Link from "next/link";
import React from "react";
import Marquee from "../ui/marquee";
import { cn } from "@/lib/utils";

const Herosection = () => {
  const avatars = [
    { url: "/heroavatars/person1.png", name: "John Doe" },
    {
      url: "/heroavatars/person2.png",
      name: "Jane Smith",
    },
    {
      url: "/heroavatars/person3.png",
      name: "Michael Brown",
    },
    {
      url: "/heroavatars/person4.png",
      name: "Emily Clark",
    },
    { url: "/heroavatars/person5.png", name: "David Lee" },
    {
      url: "/heroavatars/person6.png",
      name: "Sarah Wilson",
    },
    {
      url: "/heroavatars/person7.png",
      name: "James Taylor",
    },
    {
      url: "/heroavatars/person8.png",
      name: "Laura King",
    },
    {
      url: "/heroavatars/person9.png",
      name: "Robert Harris",
    },
    {
      url: "/heroavatars/person10.png",
      name: "Emma Martinez",
    },
    {
      url: "/heroavatars/person11.png",
      name: "Daniel Young",
    },
    {
      url: "/heroavatars/person12.png",
      name: "Olivia Hernandez",
    },
    {
      url: "/heroavatars/person13.png",
      name: "William Moore",
    },
  ];

  const MarqueeColumn = ({ reverse, duration, className }) => {
    return (
      <Marquee
        reverse={reverse}
        pauseOnHover
        vertical
        className={cn(
          "w-full relative h-full flex flex-col justify-center items-center",
          className
        )}
        style={{
          "--duration": duration,
        }}
      >
        {avatars
          .sort(() => Math.random() - 0.5)
          .map((avatar, index) => {
            return (
              <img
                key={index}
                src={avatar.url}
                alt={avatar.name}
                className="w-full h-full object-cover rounded opacity-[0.25] hover:opacity-100 transition-opacity duration-300 ease-in-out"
              />
            );
          })}
      </Marquee>
    );
  };

  return (
    <section className="w-full relative overflow-hidden min-h-screen flex flex-col items-center justify-center">
      <div className="relative w-fit px-6 xs:px-8 sm:px-0 mx-auto flex flex-col items-center justify-center space-y-4 text-center z-40 backdrop-blur-[2px]">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight flex flex-col">
          {/* Stay connected effortlessly with Tawkify – your seamless WhatsApp alternative */}
          Connect, chat, and share seamlessly with Tawkify
        </h1>
        <p className="mx-auto max-w-3xl text-sm xs:text-base sm:text-lg md:text-xl mb-8 text-gray-600 ">
          A feature-packed messaging app designed for seamless communication.
          Enjoy instant chats, secure sharing, and effortless connections all in
          one place
        </p>
        <div className="flex items-center space-x-2 mb-4 ">
          <div className="flex -space-x-4 rtl:space-x-reverse">
            {avatars.slice(0, 7).map((avatar, index) => (
              <img
                key={index}
                className="w-10 h-10 border-2 border-white rounded-full dark:border-gray-800 object-cover shadow-lg"
                src={avatar.url}
                alt={avatar.name}
              />
            ))}
            <a
              className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800"
              href="/onboarding"
            >
              +99
            </a>
          </div>

          <span className="text-sm text-gray-600 font-medium">
            Loved by 1k + users
          </span>
        </div>
        <Link
          href="/onboarding"
          className="font-medium hover:underline underline-offset-4"
        >
          <button
            type="button"
            className="text-gray-900 mt-4 bg-gradient-to-r from-[#057e39] via-[#00d348] to-[#bfeb26] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#00d348] dark:focus:ring-[#bfeb26] shadow-lg shadow-[#057e39]/50 dark:shadow-lg dark:shadow-[#00d348]/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
          >
            <span className="text-white text-2xl flex gap-2 items-center justify-center">
              {" "}
              Start Your Journey{" "}
              <img src="mobilechat.png" alt="chat" className="w-7 h-7" />
            </span>
          </button>
        </Link>
      </div>

      <div className="absolute top-0 w-full grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 z-10 ">
        <MarqueeColumn reverse={false} duration="140s" />
        <MarqueeColumn reverse={true} duration="140s" />
        <MarqueeColumn reverse={false} duration="140s" />
        <MarqueeColumn
          reverse={true}
          duration="140s"
          className="hidden md:flex"
        />
        <MarqueeColumn
          reverse={false}
          duration="140s"
          className="hidden lg:flex"
        />
        <MarqueeColumn
          reverse={true}
          duration="140s"
          className="hidden lg:flex"
        />
      </div>
    </section>
  );
};

export default Herosection;
