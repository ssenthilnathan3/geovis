"use client";

import { GeoDataProvider } from "@/context/GeoDataContext";
import { NextUIProvider } from "@nextui-org/react";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NextUIProvider>
        <GeoDataProvider>{children}</GeoDataProvider>
      </NextUIProvider>
    </SessionProvider>
  );
}
