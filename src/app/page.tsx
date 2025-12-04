import { LoginGate } from "@/components/auth/login-gate";
import { NavBar } from "@/components/layout/nav-bar";
import { HomePage } from "@/features/home/home-page";

export default function Page() {
  return (
    <LoginGate>
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-10 lg:px-0">
        <HomePage />
      </main>
    </LoginGate>
  );
}
