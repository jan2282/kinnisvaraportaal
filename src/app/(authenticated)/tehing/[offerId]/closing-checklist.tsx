"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle, ExternalLink, FileDown } from "lucide-react";
import { toast } from "sonner";
import { updateClosingStep } from "@/app/(authenticated)/pakkumised/actions";
import { Checkbox } from "@/components/ui/checkbox";
import type { ClosingProgress } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

type StepKey = keyof ClosingProgress;

const STEPS: {
  key: StepKey;
  title: string;
  description: string;
  link?: { href: string; label: string; icon: typeof ExternalLink };
}[] = [
  {
    key: "notary",
    title: "Võtke ühendust notariga",
    description: "Leppige kokku tehingu aeg ja edastage objekti andmed.",
    link: { href: "https://www.notar.ee", label: "Ava notar.ee", icon: ExternalLink },
  },
  {
    key: "preliminary_contract",
    title: "Laadige alla eelleping",
    description: "Sõlmige soovi korral eelleping enne notariaalset tehingut.",
    link: { href: "/eelleping.pdf", label: "Laadi alla PDF", icon: FileDown },
  },
  {
    key: "notarial_contract",
    title: "Notariaalne leping",
    description: "Allkirjastage müügileping notari juures.",
  },
  {
    key: "land_registry",
    title: "Kinnistusameti kanne",
    description: "Notar esitab avalduse omandi ülekandmiseks kinnistusraamatusse.",
  },
];

export function ClosingChecklist({
  offerId,
  initial,
}: {
  offerId: string;
  initial: ClosingProgress;
}) {
  const [progress, setProgress] = useState<ClosingProgress>(initial);
  const [pending, startTransition] = useTransition();

  const allDone = STEPS.every((s) => progress[s.key]);

  function toggle(key: StepKey, done: boolean) {
    const previous = progress;
    setProgress((p) => ({ ...p, [key]: done })); // optimistlik
    startTransition(async () => {
      const res = await updateClosingStep(offerId, key, done);
      if (!res.ok) {
        setProgress(previous);
        toast.error(res.error ?? "Salvestamine ebaõnnestus");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Esimene samm alati tehtud */}
      <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/5 p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
        <div>
          <p className="font-medium">Pakkumine vastu võetud</p>
          <p className="text-sm text-muted-foreground">
            Müüja on pakkumise kinnitanud. Liikuge tehingu vormistamiseni.
          </p>
        </div>
      </div>

      {STEPS.map((step) => {
        const done = !!progress[step.key];
        return (
          <label
            key={step.key}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
              done ? "border-success/30 bg-success/5" : "hover:bg-secondary/40"
            )}
          >
            <Checkbox
              checked={done}
              disabled={pending}
              onCheckedChange={(c) => toggle(step.key, c === true)}
              className="mt-0.5"
            />
            <div className="flex flex-1 flex-col gap-1">
              <p className={cn("font-medium", done && "text-muted-foreground line-through")}>
                {step.title}
              </p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {step.link && (
                <a
                  href={step.link.href}
                  target={step.link.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <step.link.icon className="size-4" />
                  {step.link.label}
                </a>
              )}
            </div>
          </label>
        );
      })}

      {allDone && (
        <div className="mt-2 flex flex-col items-center gap-2 rounded-2xl bg-primary p-8 text-center text-primary-foreground">
          <span className="text-3xl">🎉</span>
          <p className="text-xl font-semibold">Palju õnne!</p>
          <p className="text-primary-foreground/80">Eduka tehinguni!</p>
        </div>
      )}
    </div>
  );
}
