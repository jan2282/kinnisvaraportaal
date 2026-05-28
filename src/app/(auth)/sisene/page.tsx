import Link from "next/link";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Logi sisse" };

export default async function SignInPage() {
  const user = await getUser();
  if (user) redirect("/minu-kodu");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Tere tulemast tagasi</h1>
        <p className="text-sm text-muted-foreground">
          Logi sisse oma Kodu kontole
        </p>
      </div>

      <SignInForm />

      <p className="text-center text-sm text-muted-foreground">
        Pole veel kontot?{" "}
        <Link href="/registreeri" className="font-medium text-primary hover:underline">
          Registreeru
        </Link>
      </p>
    </div>
  );
}
