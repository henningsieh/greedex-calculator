import Image from "next/image";

interface LogoProps {
  isScrolled?: boolean;
}

function Logo({ isScrolled = true }: LogoProps) {
  return (
    <div className="flex items-end gap-3">
      <div
        className={`relative h-10 overflow-hidden transition-all duration-600 ease-in-out ${
          isScrolled ? "w-18" : "w-0"
        }`}
        aria-hidden={!isScrolled}
      >
        <Image
          src="/greendex_logo.png"
          alt="Logo"
          fill
          className={`object-contain transition-opacity duration-200 ease-in-out ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <p className="-mb-1 self-end whitespace-nowrap font-bold text-2xl text-primary transition-all duration-600 ease-in-out sm:text-2xl md:text-3xl">
        GREEN<span className="text-muted-foreground">DEX</span>
      </p>
    </div>
  );
}

export default Logo;
