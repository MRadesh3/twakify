import React from "react";
import { cn } from "@/lib/utils";
import AnimatedGradientText from "../ui/animated-gradient-text";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const faqs = [
  {
    question: "How do I set up my Tawkify account?",
    answer:
      "To set up your Tawkify account, simply come to website and click sign up, enter your email. Once verified, you can create your profile and start chatting instantly!",
  },
  {
    question: "Can I make voice and video calls on Tawkify?",
    answer:
      "Yes, Tawkify supports both voice and video calls. You can initiate a call with any contact from your chat list by simply clicking the call icon at the top of the chat screen.",
  },
  {
    question: "How do I create group chats on Tawkify?",
    answer:
      "To create a group chat, go to the 'Chats' section, click on the 'New Group' option, and select the contacts you want to add. You can customize the group name and even set a group icon!",
  },
  {
    question: "Is Tawkify secure?",
    answer:
      "Yes, Tawkify uses end-to-end encryption for all your messages and calls, ensuring that your conversations remain private and secure.",
  },
  {
    question: "Can I use Tawkify on multiple devices?",
    answer:
      "Absolutely! Tawkify allows you to sync your account across multiple devices. Simply log in using your credentials to access your chats on any device.",
  },
  {
    question: "Can I send multimedia (photos, videos) on Tawkify?",
    answer:
      "Yes, you can easily share photos, videos, and voice messages in your chats. Just click the attachment icon to upload your files and share them with friends or groups.",
  },
  {
    question: "How do I report an issue or a user?",
    answer:
      "If you encounter an issue or need to report a user, go to their profile, click on the three dots menu, and select 'Report.' Our support team will investigate the issue and take appropriate action.",
  },
  {
    question: "Is Tawkify available in all countries?",
    answer:
      "Tawkify is available worldwide, and we are continually expanding to new regions. Check the app store for availability in your country.",
  },
  {
    question: "How can I delete my Tawkify account?",
    answer:
      "To delete your Tawkify account, go to your account settings, select 'Privacy,' and choose the option to delete your account. Please note that this action is permanent, and all data will be removed.",
  },
];

const Question = ({ question, answer }) => {
  return (
    <AccordionItem value={question}>
      <AccordionTrigger className="text-left">{question}</AccordionTrigger>
      <AccordionContent className="text-muted-foreground">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
};

const Faqs = () => {
  return (
    <section
      id="faqs"
      className="w-full px-6 xs:px-8 sm:px-0 sm:mx-8 lg:mx-auto py-32 flex flex-col items-center justify-center overflow-hidden"
    >
      <AnimatedGradientText className="bg-background backdrop-blur-0">
        <span
          className={cn(
            `text-lg inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`
          )}
        >
          FAQs
        </span>
      </AnimatedGradientText>

      <h2 className="subHeading mt-4 text-center">
        Frequently Asked Questions
      </h2>
      <p className="subText mt-4 text-center">
        We're here to help! Below are some of the most frequently asked
        questions from our users. Whether you're new to the app or a long-time
        user, you’ll find answers to common queries and tips to enhance your
        experience. If you don't find what you're looking for, feel free to
        reach out to our support team
      </p>

      <Accordion
        type="single"
        collapsible
        className="w-full max-w-4xl mx-auto mt-16"
      >
        {faqs.map((faq, index) => (
          <Question key={index} {...faq} />
        ))}
      </Accordion>
    </section>
  );
};

export default Faqs;
