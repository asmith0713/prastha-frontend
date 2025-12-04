import { LoginGate } from "@/components/auth/login-gate";
import { NavBar } from "@/components/layout/nav-bar";
import { GossipsPage } from "@/features/gossips/gossips-page";

export default function Gossips() {
  return (
    <LoginGate>
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-10 lg:px-0">
        <GossipsPage />
      </main>
    </LoginGate>
  );
}
