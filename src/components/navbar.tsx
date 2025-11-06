import { UserSession } from "@/components/user-session";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {/* Logo or brand name would go here */}
          </div>
          <UserSession />
        </div>
      </div>
    </nav>
  );
}
