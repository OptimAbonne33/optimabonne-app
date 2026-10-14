import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Créer un compte",
  description:
    "Créez votre compte OptimAbonne et commencez l'essai gratuit pour optimiser vos frais fixes récurrents.",
};

export default function SignupPage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-bg">
      <div
        className="pointer-events-none absolute left-1/2 top-[-100px] h-[400px] w-[600px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,102,255,0.12) 0%, transparent 70%)",
        }}
      />
      <main className="relative z-[1] flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <AuthForm initialTab="signup" />
      </main>
      <div className="relative z-[1] px-5 sm:px-8">
        <SiteFooter />
      </div>
    </div>
  );
}
