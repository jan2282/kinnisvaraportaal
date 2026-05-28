import Link from "next/link";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Registreeru" };

export default async function SignUpPage() {
  const user = await getUser();
  if (user) redirect("/minu-kodu");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Loo konto</h1>
        <p className="text-sm text-muted-foreground">
          Alusta kinnisvara müümist või ostmist ilma maaklerita
        </p>
      </div>

      <SignUpForm />

      <p className="text-center text-sm text-muted-foreground">
        Konto on juba olemas?{" "}
        <Link href="/sisene" className="font-medium text-primary hover:underline">
          Logi sisse
        </Link>
      </p>
    </div>
  );
}
