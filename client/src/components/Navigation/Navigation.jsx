import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const NavItems = ({ onClick }) => (
    <>
      <Link
        href="#features"
        className="font-medium hover:underline underline-offset-4"
        onClick={onClick}
      >
        Features
      </Link>
      <Link
        href="#faqs"
        className="font-medium hover:underline underline-offset-4"
        onClick={onClick}
      >
        FAQs
      </Link>
      <Link
        href="/login"
        className="font-medium hover:underline underline-offset-4"
        onClick={onClick}
      >
        <button className="flex items-center justify-center gap-7 bg-search-input-container-background px-5 py-2 rounded-lg">
          <span className="text-white">Login</span>
        </button>
      </Link>
    </>
  );

  return (
    <div className="w-full bg-background/60 backdrop-blur-md fixed top-0 px-8 py-4 z-50 shadow-xl overflow-hidden">
      <header className="container mx-auto flex items-center">
        <div className="flex items-center justify-center gap-1 text-black">
          <Image src="/twakify_logo.png" alt="twakify" width={40} height={40} />
          <div className="brand-name1">
            <span className="gradient-green1">Tawkify</span>
          </div>
        </div>
        <nav className="ml-auto hidden md:flex items-center justify-center gap-6">
          <NavItems />
        </nav>

        {/* Mobile Navigation */}
        <div className="ml-auto md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              color="black"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <nav className="md:hidden rounded-lg p-4 mt-2">
          <div className="flex flex-col space-y-4">
            <NavItems onClick={handleMenuClose} />
          </div>
        </nav>
      )}
    </div>
  );
};

export default Navigation;
