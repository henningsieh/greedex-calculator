import SocketClient from "@/components/socket/SocketClient";
import { env } from "@/env";

/**
 * Server-side page for the Socket test — computes the socket URL using validated
 * environment variables and passes the URL to a client-only component.
 */
export default function Home() {
  const baseUrl = new URL(env.NEXT_PUBLIC_BASE_URL);
  // Explicitly set port for the Socket.IO server from typed env (no hardcoded fallbacks)
  baseUrl.port = String(env.SOCKET_PORT);
  const socketUrl = baseUrl.toString();

  return (
    <div className="min-h-screen p-8 pb-20 font-sans sm:p-20">
      <main className="mx-auto max-w-4xl">
        <h1 className="mb-8 font-bold text-4xl">Socket.IO + Next.js</h1>
        <SocketClient socketUrl={socketUrl} />
      </main>
    </div>
  );
}
