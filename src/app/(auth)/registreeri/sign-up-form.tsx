"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signUp, type AuthState } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "seller", label: "Müün kinnisvara" },
  { value: "buyer", label: "Otsin kinnisvara" },
  { value: "both", label: "Mõlemat" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? "Konto loomine..." : "Loo konto"}
    </Button>
  );
}

export function SignUpForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(signUp, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="full_name">Nimi</Label>
        <Input
          id="full_name"
          name="full_name"
          autoComplete="name"
          placeholder="Mari Maasikas"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-post</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="sinu@email.ee"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Telefon (valikuline)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+372 5xxx xxxx"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Parool</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Vähemalt 8 tähemärki"
          required
          minLength={8}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Mida soovid teha?</Label>
        <RadioGroup name="role" defaultValue="both" className="gap-2">
          {ROLE_OPTIONS.map((opt) => (
            <Label
              key={opt.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm font-normal transition-colors has-data-checked:border-primary has-data-checked:bg-primary/5"
            >
              <RadioGroupItem value={opt.value} />
              {opt.label}
            </Label>
          ))}
        </RadioGroup>
      </div>

      {state?.error && (
        <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
