import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion",
  description:
    "Connectez-vous à OptimAbonne pour suivre vos abonnements et découvrir des économies sur vos frais fixes.",
};

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg">
      <div
        className="pointer-events-none absolute left-1/2 top-[-100px] h-[400px] w-[600px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,102,255,0.12) 0%, transparent 70%)",
        }}
      />
      <AuthForm initialTab="login" />
    </main>
  );
}
