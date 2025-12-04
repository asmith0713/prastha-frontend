import { LoginGate } from "@/components/auth/login-gate";
import { NavBar } from "@/components/layout/nav-bar";
import { ProfilePage } from "@/features/profile/profile-page";

export default function Profile() {
  return (
    <LoginGate>
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-10 lg:px-0">
        <ProfilePage />
      </main>
    </LoginGate>
  );
}
