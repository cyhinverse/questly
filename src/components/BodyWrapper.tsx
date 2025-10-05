"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import React from "react";

export function BodyWrapper({ children }: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  
  return (
    <>
      <Navbar />
      <div>
        {children}
      </div>
    </>
  );
}
