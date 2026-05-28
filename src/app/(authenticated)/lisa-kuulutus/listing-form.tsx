"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  Home,
  Trees,
  Store,
  Check,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PhotoUpload, type UploadedImage } from "@/components/forms/photo-upload";
import { PhotographerDialog } from "@/components/forms/photographer-dialog";
import { saveListing } from "./actions";
import {
  LISTING_TYPE_OPTIONS,
  LISTING_CONDITION_OPTIONS,
  FEATURE_OPTIONS,
  CITY_OPTIONS,
  TALLINN_DISTRICTS,
  ENERGY_CLASSES,
  LISTING_TYPE_LABELS,
  LISTING_CONDITION_LABELS,
  FEATURE_LABELS,
} from "@/lib/constants";
import type {
  ListingType,
  ListingCondition,
  EnergyClass,
} from "@/lib/supabase/database.types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type FormState = {
  type?: ListingType;
  address: string;
  city: string;
  parish: string;
  county: string;
  rooms: string;
  size_m2: string;
  floor: string;
  floors_total: string;
  year_built: string;
  condition?: ListingCondition;
  energy_class?: EnergyClass;
  features: string[];
  has_debt: boolean;
  has_co_owners: boolean;
  has_tenants: boolean;
  price: string;
  title: string;
  description: string;
  images: UploadedImage[];
};

const TYPE_ICONS: Record<ListingType, typeof Home> = {
  apartment: Building2,
  house: Home,
  land: Trees,
  commercial: Store,
};

const STEPS = [
  "Tüüp",
  "Asukoht",
  "Detailid",
  "Oluline info",
  "Hind",
  "Kirjeldus",
  "Fotod",
  "Ülevaade",
];

export function ListingForm({
  initial,
  editId,
}: {
  initial?: Partial<FormState>;
  editId?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pending, startTransition] = useTransition();

  const form = useForm<FormState>({
    defaultValues: {
      address: "",
      city: "",
      parish: "",
      county: "Harjumaa",
      rooms: "",
      size_m2: "",
      floor: "",
      floors_total: "",
      year_built: "",
      features: [],
      has_debt: false,
      has_co_owners: false,
      has_tenants: false,
      price: "",
      title: "",
      description: "",
      images: [],
      ...initial,
    },
  });

  const { register, watch, setValue, getValues, control } = form;
  const values = watch();

  function validateStep(): boolean {
    switch (step) {
      case 0:
        if (!values.type) return fail("Vali objekti tüüp");
        break;
      case 1:
        if (values.address.trim().length < 2) return fail("Sisesta aadress");
        if (values.city.trim().length < 1) return fail("Sisesta linn");
        break;
      case 5:
        if (values.title.trim().length < 5)
          return fail("Pealkiri peab olema vähemalt 5 tähemärki");
        break;
    }
    return true;
  }

  function fail(msg: string) {
    toast.error(msg);
    return false;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function toggleFeature(feature: string) {
    const current = getValues("features");
    setValue(
      "features",
      current.includes(feature)
        ? current.filter((f) => f !== feature)
        : [...current, feature]
    );
  }

  async function generateDescription() {
    const v = getValues();
    if (!v.type) {
      toast.error("Vali esmalt objekti tüüp");
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Genereerimine ebaõnnestus");
        return;
      }
      setValue("description", data.description);
      toast.success("Kirjeldus genereeritud");
    } catch {
      toast.error("Genereerimine ebaõnnestus");
    } finally {
      setGenerating(false);
    }
  }

  function submit(status: "draft" | "active") {
    if (status === "active" && !confirmed) {
      toast.error("Kinnita, et andmed on õiged");
      return;
    }
    startTransition(async () => {
      const res = await saveListing(getValues(), { editId, status });
      if (res.ok) {
        toast.success(
          status === "active" ? "Kuulutus avaldatud!" : "Mustand salvestatud"
        );
        router.push(status === "active" ? `/kuulutused/${res.id}` : "/minu-kodu");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  const pricePerM2 =
    values.price && values.size_m2 && Number(values.size_m2) > 0
      ? Math.round(Number(values.price) / Number(values.size_m2))
      : null;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      {/* SAMMUINDIKAATOR */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">{STEPS[step]}</span>
          <span className="text-muted-foreground">
            Samm {step + 1} / {STEPS.length}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="min-h-[320px]">
        {/* STEP 1 — TÜÜP */}
        {step === 0 && (
          <Section title="Mis tüüpi objekti müüd?">
            <div className="grid grid-cols-2 gap-3">
              {LISTING_TYPE_OPTIONS.map((opt) => {
                const Icon = TYPE_ICONS[opt.value];
                const active = values.type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("type", opt.value)}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <Icon className={cn("size-6", active ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">{opt.description}</span>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* STEP 2 — ASUKOHT */}
        {step === 1 && (
          <Section title="Kus objekt asub?">
            <Field label="Aadress">
              <Input
                {...register("address")}
                placeholder="Nt Vabriku 12"
                autoComplete="off"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Linn">
                <Input list="cities" {...register("city")} placeholder="Tallinn" />
                <datalist id="cities">
                  {CITY_OPTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Linnaosa / piirkond">
                <Input list="districts" {...register("parish")} placeholder="Kesklinn" />
                <datalist id="districts">
                  {TALLINN_DISTRICTS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </Field>
            </div>
            <Field label="Maakond">
              <Input {...register("county")} placeholder="Harjumaa" />
            </Field>
            <div className="flex aspect-[16/7] items-center justify-center rounded-xl border bg-secondary/40 text-sm text-muted-foreground">
              Kaardieelvaade tuleb peagi
            </div>
          </Section>
        )}

        {/* STEP 3 — DETAILID */}
        {step === 2 && (
          <Section title="Objekti detailid">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tube">
                <Input type="number" min={0} {...register("rooms")} placeholder="3" />
              </Field>
              <Field label="Pindala (m²)">
                <Input type="number" min={0} step="0.1" {...register("size_m2")} placeholder="54" />
              </Field>
              <Field label="Korrus">
                <Input type="number" {...register("floor")} placeholder="2" />
              </Field>
              <Field label="Korruseid kokku">
                <Input type="number" {...register("floors_total")} placeholder="5" />
              </Field>
              <Field label="Ehitusaasta">
                <Input type="number" {...register("year_built")} placeholder="1998" />
              </Field>
              <Field label="Energiaklass">
                <select
                  {...register("energy_class")}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Vali...</option>
                  {ENERGY_CLASSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Seisukord">
              <div className="grid grid-cols-2 gap-2">
                {LISTING_CONDITION_OPTIONS.map((opt) => {
                  const active = values.condition === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue("condition", opt.value)}
                      className={cn(
                        "rounded-lg border-2 p-3 text-left text-sm transition-colors",
                        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      )}
                    >
                      <span className="font-medium">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Lisaväärtused">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FEATURE_OPTIONS.map((f) => {
                  const active = values.features.includes(f.value);
                  return (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => toggleFeature(f.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded border",
                          active ? "border-primary bg-primary text-primary-foreground" : "border-input"
                        )}
                      >
                        {active && <Check className="size-3" />}
                      </span>
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </Field>
          </Section>
        )}

        {/* STEP 4 — OLULINE INFO */}
        {step === 3 && (
          <Section title="Oluline õiguslik info">
            <p className="text-sm text-muted-foreground">
              See info on ostjale tehingu jaoks oluline. Aus avalikustamine kiirendab müüki.
            </p>
            <YesNo
              control={control}
              name="has_debt"
              label="Kas kinnistul on hüpoteek?"
              tip="Hüpoteek tuleb tehingu käigus kustutada. Notar aitab seda korraldada."
            />
            <YesNo
              control={control}
              name="has_co_owners"
              label="Kas on kaasomanikke?"
              tip="Kaasomanikud peavad müügiga nõustuma ja tehingus osalema."
            />
            <YesNo
              control={control}
              name="has_tenants"
              label="Kas on üürnikke?"
              tip="Kehtiv üürileping võib uuele omanikule üle kanduda."
            />
          </Section>
        )}

        {/* STEP 5 — HIND */}
        {step === 4 && (
          <Section title="Määra hind">
            <Field label="Küsitav hind (€)">
              <Input type="number" min={0} {...register("price")} placeholder="159000" />
            </Field>
            {pricePerM2 && (
              <div className="rounded-lg bg-secondary/50 px-4 py-3 text-sm">
                Ruutmeetri hind:{" "}
                <span className="font-semibold">{formatPrice(pricePerM2)}/m²</span>
              </div>
            )}
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <p className="mb-1 font-medium text-foreground">
                Piirkonna võrreldavad müügid
              </p>
              Sarnaste objektide hinnastatistika tuleb peagi, et aidata sul leida õiglane turuhind.
            </div>
          </Section>
        )}

        {/* STEP 6 — KIRJELDUS */}
        {step === 5 && (
          <Section title="Pealkiri ja kirjeldus">
            <Field label="Kuulutuse pealkiri">
              <Input
                {...register("title")}
                placeholder="Nt Valgusküllane 2-toaline korter Kalamajas"
                maxLength={120}
              />
            </Field>
            <Field label="Kirjeldus">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  Lase AI-l koostada professionaalne kirjeldus
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateDescription}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  Genereeri AI-ga
                </Button>
              </div>
              <Textarea
                {...register("description")}
                rows={8}
                placeholder="Kirjelda objekti eeliseid, asukohta ja seisukorda..."
              />
            </Field>
          </Section>
        )}

        {/* STEP 7 — FOTOD */}
        {step === 6 && (
          <Section title="Lisa fotod">
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <PhotoUpload value={field.value} onChange={field.onChange} />
              )}
            />
            <div className="flex flex-col gap-2 rounded-xl border bg-secondary/30 p-4">
              <p className="text-sm font-medium">Pole aega ise pildistada?</p>
              <p className="text-sm text-muted-foreground">
                Telli professionaalne fotograaf, kes jäädvustab su kodu parimast küljest.
              </p>
              <div className="mt-1">
                <PhotographerDialog defaultAddress={values.address} />
              </div>
            </div>
          </Section>
        )}

        {/* STEP 8 — ÜLEVAADE */}
        {step === 7 && (
          <Section title="Ülevaade ja avaldamine">
            <div className="flex flex-col divide-y rounded-xl border">
              <Review label="Tüüp" value={values.type ? LISTING_TYPE_LABELS[values.type] : "—"} />
              <Review label="Pealkiri" value={values.title || "—"} />
              <Review
                label="Asukoht"
                value={[values.address, values.parish, values.city].filter(Boolean).join(", ") || "—"}
              />
              <Review
                label="Detailid"
                value={
                  [
                    values.rooms && `${values.rooms} tuba`,
                    values.size_m2 && `${values.size_m2} m²`,
                    values.condition && LISTING_CONDITION_LABELS[values.condition],
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"
                }
              />
              <Review
                label="Lisaväärtused"
                value={
                  values.features.length
                    ? values.features.map((f) => FEATURE_LABELS[f] ?? f).join(", ")
                    : "—"
                }
              />
              <Review label="Hind" value={values.price ? formatPrice(Number(values.price)) : "—"} />
              <Review label="Fotod" value={`${values.images.length} fotot`} />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-4">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(c) => setConfirmed(c === true)}
                className="mt-0.5"
              />
              <span className="text-sm">
                Kinnitan, et esitatud andmed on õiged ja mul on õigus seda objekti müüa.
              </span>
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="flex-1"
                size="lg"
                onClick={() => submit("active")}
                disabled={pending}
              >
                {pending ? "Avaldan..." : editId ? "Salvesta ja avalda" : "Avalda kuulutus"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => submit("draft")}
                disabled={pending}
              >
                Salvesta mustandina
              </Button>
            </div>
          </Section>
        )}
      </div>

      {/* NAVIGATSIOON */}
      {step < STEPS.length - 1 && (
        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={prev}
            disabled={step === 0}
            className={cn(step === 0 && "invisible")}
          >
            <ChevronLeft className="size-4" /> Tagasi
          </Button>
          <Button type="button" onClick={next}>
            Edasi <ChevronRight className="size-4" />
          </Button>
        </div>
      )}
      {step === STEPS.length - 1 && (
        <div className="mt-8">
          <Button type="button" variant="ghost" onClick={prev}>
            <ChevronLeft className="size-4" /> Tagasi
          </Button>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function YesNo({ control, name, label, tip }: { control: any; name: keyof FormState; label: string; tip: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            <Tooltip>
              <TooltipTrigger render={<span className="cursor-help text-muted-foreground" />}>
                <Info className="size-4" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">{tip}</TooltipContent>
            </Tooltip>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => field.onChange(true)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                field.value === true
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              )}
            >
              Jah
            </button>
            <button
              type="button"
              onClick={() => field.onChange(false)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                field.value === false
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              )}
            >
              Ei
            </button>
          </div>
        </div>
      )}
    />
  );
}
