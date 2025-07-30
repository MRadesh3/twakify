import React from "react";
import AnimatedGradientText from "../ui/animated-gradient-text";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { IoChatboxEllipses, IoCallSharp } from "react-icons/io5";
import { MdGroups } from "react-icons/md";

const FeaturesSection = () => {
  const features = [
    {
      title: "Seamless Messaging",
      description:
        "Stay connected with lightning-fast message delivery and an intuitive chat interface, making conversations feel effortless and enjoyable",
      icon: <IoChatboxEllipses />,
    },
    {
      title: "Voice and Video Calls",
      description:
        "Crystal-clear voice and video calls, even on slow networks. Experience seamless communication wherever you are",
      icon: <IoCallSharp />,
    },
    {
      title: "Group Chats Redefined",
      description:
        "Collaborate, share, and connect with up to 1,000 participants in a single group, making it perfect for communities and teams",
      icon: <MdGroups />,
    },
  ];
  return (
    <>
      <section
        id="features"
        className="w-full bg-muted py-32 flex flex-col items-center justify-center"
      >
        <AnimatedGradientText className="bg-background backdrop-blur-0">
          <span
            className={cn(
              `text-lg inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
            )}
          >
            Features
          </span>
        </AnimatedGradientText>

        <h2 className="subHeading mt-4 text-center">
          Discover Endless Communication Possibilities with Tawkify{" "}
        </h2>
        <p className="subText mt-4 text-center mb-10">
          The ultimate communication app designed to simplify and enhance your
          connections. With a blend of cutting-edge technology, intuitive
          design, and user-centric features, Tawkify redefines how you chat,
          share, and stay connected. Whether you're catching up with friends,
          collaborating with colleagues, or sharing moments with loved ones,
          Tawkify makes every interaction extraordinary
        </p>
        <div className="container px-6 xs:px-8 sm:px-0 sm:mx-8 lg:mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative bg-muted">
          <div className="flex flex-col justify-start items-start order-2 lg:order-1">
            {features.map((feature, index) => {
              return (
                <div
                  key={index}
                  className="flex items-start gap-2 sm:gap-4 rounded-lg py-8 lg:p-12"
                >
                  <span className="p-2 rounded-md text-foreground sm:text-background bg-muted sm:bg-foreground ">
                    {feature.icon}
                  </span>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-medium">
                      {feature.title}
                    </h3>
                    <p className="text-sm xs:text-base text-muted-foreground pt-2">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div
            className={cn(
              "h-fit lg:sticky top-32 pl-16 pt-16 rounded-lg border border-r-gray-300 border-b-gray-300 bg-[linear-gradient(45deg,_#057e39,_#00d348,_#bfeb26)] bg-[length:300%_auto] animate-gradientShift order-1 lg:order-2"
            )}
          >
            <Image
              src="/dashboard.png"
              alt="Feature Image"
              className="w-full h-auto rounded-tl-lg"
              width={500}
              height={500}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default FeaturesSection;
