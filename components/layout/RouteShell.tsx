"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import type { ProductCategory } from "@/lib/types";

export function RouteShell({ children, categories }: { children: ReactNode; categories: ProductCategory[] }) {
  const pathname = usePathname();
  const isAuth = pathname === "/login" || pathname === "/registro";
  if (isAuth) return <main data-storefront-shell="auth" className="min-h-svh min-w-0 flex-1">{children}</main>;
  return <>
    <Header categories={categories} />
    <main data-storefront-shell="store" className="min-w-0 flex-1">{children}</main>
    <Footer categories={categories} />
    <CartDrawer />
  </>;
}
