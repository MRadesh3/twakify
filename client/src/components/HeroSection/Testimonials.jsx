import React from "react";
import AnimatedGradientText from "../ui/animated-gradient-text";
import Marquee from "../ui/marquee";
import { cn } from "@/lib/utils";

const Testimonials = () => {
  const reviews = [
    {
      name: "Sarah",
      username: "@sarah_talks",
      body: "Tawkify has revolutionized the way I connect with my team. The video call quality is unmatched!",
      img: "/heroavatars/person1.png",
    },
    {
      name: "Mark",
      username: "@mark_the_messenger",
      body: "The ease of use and seamless experience make Tawkify my go-to communication app. Love it!",
      img: "/heroavatars/person2.png",
    },
    {
      name: "Olivia",
      username: "@olivia_connects",
      body: "I use Tawkify every day to stay in touch with friends and family. It’s reliable and fast.",
      img: "/heroavatars/person3.png",
    },
    {
      name: "James",
      username: "@james_the_communicator",
      body: "Never had such smooth group chats! Tawkify makes sharing moments with everyone effortless.",
      img: "/heroavatars/person4.png",
    },
    {
      name: "Emma",
      username: "@emma_chats",
      body: "I can’t imagine my workday without Tawkify. It keeps me in touch with my colleagues at all times!",
      img: "/heroavatars/person5.png",
    },
    {
      name: "David",
      username: "@david_now",
      body: "The voice calls are crystal clear, even on a slow connection. Tawkify is a game-changer!",
      img: "/heroavatars/person6.png",
    },
    {
      name: "Lily",
      username: "@lily_loves_tawkify",
      body: "Tawkify has the best messaging interface I've ever used. It’s so simple and intuitive.",
      img: "/heroavatars/person7.png",
    },
    {
      name: "Lucas",
      username: "@lucas_says_hi",
      body: "I’ve tried other apps, but Tawkify’s group chat feature is by far the best for managing large teams.",
      img: "/heroavatars/person8.png",
    },
    {
      name: "Sophia",
      username: "@sophia_the_talker",
      body: "I can’t get enough of Tawkify’s seamless voice and video call experience. It’s the future of communication.",
      img: "/heroavatars/person9.png",
    },
    {
      name: "Noah",
      username: "@noah_shares",
      body: "The app is perfect for quick chats and long conversations alike. Tawkify has it all!",
      img: "/heroavatars/person10.png",
    },
    {
      name: "Mia",
      username: "@mia_in_touch",
      body: "I love how Tawkify keeps my family connected, no matter where we are. The video calls feel personal.",
      img: "/heroavatars/person11.png",
    },
    {
      name: "Ethan",
      username: "@ethan_the_techie",
      body: "Tawkify is everything I needed in a messaging app. It’s fast, secure, and keeps me connected with ease.",
      img: "/heroavatars/person12.png",
    },
  ];

  const firstRow = reviews.slice(0, reviews.length / 2);
  const secondRow = reviews.slice(reviews.length / 2);

  const ReviewCard = ({ img, name, username, body }) => {
    return (
      <figure
        className={cn(
          "relative w-80 cursor-pointer overflow-hidden rounded-xl border p-4 sm:p-8 flex flex-col justify-between",
          // light styles
          "border-primary/[.15] bg-muted/70 hover:bg-muted/80"
        )}
      >
        <blockquote className="mt-2 text-sm">{body}</blockquote>
        <div className="flex flex-row items-center gap-2 mt-2">
          <img
            className="rounded-full aspect-square object-center object-cover"
            width="35"
            height="35"
            alt=""
            src={img}
          />
          <div className="flex flex-col">
            <figcaption className="text-sm font-medium dark:text-white">
              {name}
            </figcaption>
            <p className="text-xs font-medium dark:text-white/40">{username}</p>
          </div>
        </div>
      </figure>
    );
  };

  return (
    <section
      id="testimonials"
      className="w-full py-32 px-6 xs:px-8 sm:px-0 sm:mx-8 lg:mx-auto flex flex-col items-center justify-center overflow-hidden"
    >
      <AnimatedGradientText className="bg-background backdrop-blur-0">
        <span
          className={cn(
            `text-lg inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
          )}
        >
          Testimonials
        </span>
      </AnimatedGradientText>

      <h2 className="subHeading mt-4 text-center">
        What Our Users Are Saying : Real Stories, Real Connections
      </h2>
      <p className="subText mt-4 text-center">
        Discover why thousands of people are choosing Tawkify to elevate their
        communication experience. Our users are sharing how Tawkify has
        transformed the way they connect with friends, family, colleagues, and
        communities. From effortless messaging to seamless voice and video
        calls, see what makes Tawkify the preferred choice for real, meaningful
        conversations
      </p>

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden mt-16">
        <Marquee
          pauseOnHover
          className="[--duration:40s] [--gap:1rem] sm:[--gap:2rem]"
        >
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee
          reverse
          pauseOnHover
          className="[--duration:40s] [--gap:1rem] sm:[--gap:2rem] mt-1 sm:mt-4"
        >
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 sm:w-1/4 bg-gradient-to-r from-white dark:from-background"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 sm:w-1/4 bg-gradient-to-l from-white dark:from-background"></div>
      </div>
    </section>
  );
};

export default Testimonials;
