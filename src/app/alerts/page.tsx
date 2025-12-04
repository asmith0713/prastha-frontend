import { LoginGate } from "@/components/auth/login-gate";
import { NavBar } from "@/components/layout/nav-bar";
import { AlertsPage } from "@/features/alerts/alerts-page";

export default function Alerts() {
  return (
    <LoginGate>
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-10 lg:px-0">
        <AlertsPage />
      </main>
    </LoginGate>
  );
}
