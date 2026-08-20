import SocketClient from "@/components/socket/socket-client";
import { env } from "@/env";

/**
 * Server-side page for the Socket test — computes the socket URL from the
 * validated NEXT_PUBLIC_SOCKET_URL env var and passes it to a client-only
 * component. The same mechanism works locally (e.g. http://localhost:4000) and
 * in production (e.g. https://socket.greendex.apps.sieh.org).
 */
export default function Home() {
  const socketUrl = env.NEXT_PUBLIC_SOCKET_URL;

  return <SocketClient socketUrl={socketUrl} />;
}
