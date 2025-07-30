import React from "react";
import Navigation from "../Navigation/Navigation";
import Herosection from "../HeroSection/Herosection";
import FeaturesSection from "../HeroSection/FeaturesSection";
import Testimonials from "../HeroSection/Testimonials";
import Faqs from "../HeroSection/Faqs";
import Footer from "../HeroSection/Footer";

const LandingPage = () => {
  return (
    <div>
      <Navigation />
      <Herosection />
      <FeaturesSection />
      <Testimonials />
      <Faqs />
      <Footer />
    </div>
  );
};

export default LandingPage;
