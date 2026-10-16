import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forgot-password-form";
import { SiteFooter } from "@/components/site-footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description:
    "Réinitialisez votre mot de passe OptimAbonne et retrouvez l'accès à votre compte.",
};

export default function ForgotPasswordPage() {
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
        <ForgotPasswordForm />
      </main>
      <div className="relative z-[1] px-5 sm:px-8">
        <SiteFooter />
      </div>
    </div>
  );
}
