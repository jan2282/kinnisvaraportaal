"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, ImageOff, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { ListingImage } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

export function Gallery({
  images,
  title,
}: {
  images: ListingImage[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const count = images.length;
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count]
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <ImageOff className="size-10" />
      </div>
    );
  }

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  return (
    <>
      <div className="grid grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl">
        <button
          onClick={() => openAt(0)}
          className={cn(
            "group relative col-span-4 row-span-2 aspect-[16/10] overflow-hidden bg-muted",
            count > 1 && "sm:col-span-2"
          )}
        >
          <Image
            src={images[0].url}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </button>

        {count > 1 &&
          images.slice(1, 5).map((img, i) => (
            <button
              key={img.id}
              onClick={() => openAt(i + 1)}
              className="group relative hidden aspect-square overflow-hidden bg-muted sm:block"
            >
              <Image
                src={img.url}
                alt={`${title} – foto ${i + 2}`}
                fill
                sizes="25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {i === 3 && count > 5 && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white">
                  +{count - 5}
                </span>
              )}
            </button>
          ))}
      </div>

      <button
        onClick={() => openAt(0)}
        className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <Expand className="size-4" /> Vaata kõiki {count} fotot
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex h-svh max-h-svh w-svw max-w-svw items-center justify-center rounded-none border-0 bg-black/95 p-0"
        >
          <DialogTitle className="sr-only">{title} – fotogalerii</DialogTitle>

          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Sulge"
          >
            <X className="size-5" />
          </button>

          <span className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1 text-sm text-white">
            {index + 1} / {count}
          </span>

          {count > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Eelmine"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Järgmine"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}

          <div className="relative h-full w-full">
            <Image
              src={images[index].url}
              alt={`${title} – foto ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
