import React from "react";
import Logo from "./Logo";

export const BrandFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-brand-border bg-brand-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
        {/* Left Section: Logo & Copyright */}
        <div className="flex flex-col items-start gap-3 md:order-1 md:flex-row md:items-center md:gap-6">
          <Logo variant="mark" className="h-6 w-6 opacity-80" />
          <p className="text-xs text-brand-muted">
            &copy; {new Date().getFullYear()} bitwrangler.uk. Built for scale.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default BrandFooter;
