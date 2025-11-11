"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/index";

const menuItems = [
  // { name: "Home", href: "/" },
  { name: "Workshops", href: "/#workshops" },
  { name: "E+ Forest", href: "/e+forest" },
  { name: "Tips & Tricks", href: "/tips-and-tricks" },
  { name: "Library", href: "/library" },
  { name: "About", href: "/about" },
] as const;

export const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-7xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "max-w-5xl rounded-2xl border bg-background/50 backdrop-blur-lg lg:px-5",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full items-center justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo isScrolled={!isScrolled} />
              </Link>

              <Button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState === true ? "Close Menu" : "Open Menu"}
                className="-m-2.5 -mr-4 relative z-20 block cursor-pointer p-1.5 lg:hidden"
              >
                <Menu className="m-auto size-6 in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 duration-200" />
                <X className="-rotate-180 absolute inset-0 m-auto size-6 in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 scale-0 in-data-[state=active]:opacity-100 opacity-0 duration-200" />
              </Button>
            </div>

            <div className="inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm xl:text-lg">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="block font-bold text-muted-foreground duration-150 hover:text-accent-foreground"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="absolute top-full right-4 z-30 in-data-[state=active]:block hidden w-[min(20rem,92%)] flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-4 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:static lg:flex lg:in-data-[state=active]:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:self-center lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        onClick={() => setMenuState(false)}
                        href={item.href}
                        className="block text-muted-foreground duration-500 hover:text-accent-foreground"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full items-center justify-end gap-3">
                <div
                  className={cn(
                    "relative h-8 overflow-hidden transition-all duration-500 ease-in-out",
                    isScrolled ? "lg:w-0" : "lg:w-fit",
                  )}
                  aria-hidden={isScrolled}
                >
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className={cn(
                      "transition-opacity duration-200 ease-in-out",
                      // Use non-prefixed opacity so the inner element fades smoothly
                      // while the outer container (lg:w-24 / lg:w-0) shrinks — same pattern as `Logo`.
                      isScrolled ? "opacity-0" : "opacity-100",
                    )}
                  >
                    <Link href="/login">
                      <span>Login</span>
                    </Link>
                  </Button>
                </div>

                <Button
                  asChild
                  size="sm"
                  className={cn(
                    "transform transition-transform duration-300 ease-in-out",
                  )}
                >
                  <Link href="/signup">
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
