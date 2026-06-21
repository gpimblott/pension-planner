"use client";

import React from "react";
import Link from "next/link";
import Logo from "./Logo";

export const BrandHeader: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-brand-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo variant="full" />
        </Link>
      </div>
    </header>
  );
};

export default BrandHeader;
