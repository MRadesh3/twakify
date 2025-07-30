import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CoolMode } from "@/components/ui/cool-mode";
import { useTheme } from "next-themes";
import Particles from "@/components/ui/particles";

function Empty() {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState("#057e39");

  useEffect(() => {
    setColor(resolvedTheme === "dark" ? "#057e39" : "#00d348");
  }, [resolvedTheme]);

  return (
    <div className="border-conversation-border border-l w-full bg-panel-header-background flex flex-col h-[100vh] border-b-4 border-b-icon-green items-center justify-center">
      <Image src="/twakify_logo.png" alt="twakify" width={100} height={100} />
      <div className="brand-name">
        <span className="gradient-green">Tawk</span>ify
      </div>
      <Particles
        className="absolute inset-0 z-0"
        quantity={50}
        ease={50}
        color={color}
        size={1.5}
        vx={1}
        vy={1}
        refresh
      />
      <div className="relative justify-center mt-5">
        <CoolMode>
          <Button className="text-gray-900 mt-4 bg-gradient-to-r from-[#057e39] via-[#01b83e] to-[#718e09] hover:bg-gradient-to-br focus:ring-1 focus:outline-none focus:ring-[#00d348] dark:focus:ring-[#bfeb26] shadow-lg shadow-[#057e39]/50 dark:shadow-lg dark:shadow-[#00d348]/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">
            <span className="text-white text-lg flex gap-2 items-center justify-center">
              Play with me
            </span>
          </Button>
        </CoolMode>
      </div>
    </div>
  );
}

export default Empty;
