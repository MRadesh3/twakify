import Link from "next/link";
import React from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { FaAddressCard } from "react-icons/fa";

const Footer = () => {
  return (
    <>
      <section className="w-full mt-16 py-16 bg-muted">
        <div className="container px-6 xs:px-8 sm:px-0 sm:mx-8 lg:mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h2 className="subHeading font-bold">
              Ready to open up with peope
            </h2>
            <p className="subText mt-4 text-center">
              Join thousands of users who are already using our platform to
              connect with people around the world
            </p>
            <Link
              href="/onboarding"
              className="font-medium hover:underline underline-offset-4"
            >
              <button
                type="button"
                className="text-gray-900 mt-4 bg-gradient-to-r from-[#057e39] via-[#00d348] to-[#bfeb26] hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-[#00d348] dark:focus:ring-[#bfeb26] shadow-lg shadow-[#057e39]/50 dark:shadow-lg dark:shadow-[#00d348]/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                <span className="text-white text-xl flex gap-2 items-center justify-center">
                  {" "}
                  Create Your Account{" "}
                  <img src="mobilechat.png" alt="chat" className="w-7 h-7" />
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>
      <footer className="container px-6 xs:px-8 sm:mx-8 lg:mx-auto mx-auto flex flex-col gap-2 sm:flex-row py-6 w-full items-center border-t">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Tawkify. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6 ">
          <Link
            href="https://www.linkedin.com/in/adesh-salsundar/"
            target="_blank"
            className=" font-medium hover:underline underline-offset-4"
          >
            <FaLinkedin size={25} />
          </Link>
          <Link
            href="https://github.com/MRadesh3"
            target="_blank"
            className="font-medium hover:underline underline-offset-4"
          >
            <FaGithub size={25} />
          </Link>
          <Link
            href="https://adeshsalsundar.online/"
            target="_blank"
            className="font-medium hover:underline underline-offset-4"
          >
            <FaAddressCard size={25} />
          </Link>
        </nav>
      </footer>
    </>
  );
};

export default Footer;
