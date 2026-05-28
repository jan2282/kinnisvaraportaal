"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Upload, X, Star, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type UploadedImage = { url: string; is_cover: boolean };

const MAX_IMAGES = 20;
const BUCKET = "listing-images";

function SortableImage({
  image,
  index,
  onRemove,
  onCover,
}: {
  image: UploadedImage;
  index: number;
  onRemove: () => void;
  onCover: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.url });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group relative aspect-square overflow-hidden rounded-xl border bg-muted",
        isDragging && "z-10 opacity-80 shadow-lg"
      )}
    >
      <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />

      {image.is_cover && (
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
          <Star className="size-3 fill-current" /> Kaanefoto
        </span>
      )}

      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 flex size-7 cursor-grab items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Lohista ümberjärjestamiseks"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        {!image.is_cover && (
          <button
            type="button"
            onClick={onCover}
            className="rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-foreground hover:bg-white"
          >
            Tee kaaneks
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto flex size-7 items-center justify-center rounded-full bg-white/90 text-destructive hover:bg-white"
          aria-label="Eemalda"
        >
          <X className="size-4" />
        </button>
      </div>

      <span className="absolute bottom-2 left-2 rounded bg-black/50 px-1.5 text-[10px] text-white">
        {index + 1}
      </span>
    </div>
  );
}

export function PhotoUpload({
  value,
  onChange,
}: {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, [supabase]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (!userId) {
        toast.error("Ootan kasutaja tuvastamist, proovi uuesti");
        return;
      }
      const remaining = MAX_IMAGES - value.length;
      if (remaining <= 0) {
        toast.error(`Maksimaalselt ${MAX_IMAGES} fotot`);
        return;
      }

      const toUpload = Array.from(files).slice(0, remaining);
      setUploading(true);
      const uploaded: UploadedImage[] = [];

      for (const file of toUpload) {
        if (!file.type.startsWith("image/")) continue;
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${userId}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (error) {
          toast.error(`Üleslaadimine ebaõnnestus: ${file.name}`);
          continue;
        }
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push({ url: data.publicUrl, is_cover: false });
      }

      setUploading(false);
      if (uploaded.length > 0) {
        const next = [...value, ...uploaded];
        if (!next.some((i) => i.is_cover)) next[0].is_cover = true;
        onChange(next);
        toast.success(`${uploaded.length} fotot lisatud`);
      }
    },
    [userId, value, onChange, supabase]
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = value.findIndex((i) => i.url === active.id);
    const newIndex = value.findIndex((i) => i.url === over.id);
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  function removeImage(url: string) {
    const next = value.filter((i) => i.url !== url);
    if (next.length > 0 && !next.some((i) => i.is_cover)) next[0].is_cover = true;
    onChange(next);
  }

  function setCover(url: string) {
    onChange(value.map((i) => ({ ...i, is_cover: i.url === url })));
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || value.length >= MAX_IMAGES}
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-secondary/30 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-secondary/50 disabled:opacity-50"
      >
        {uploading ? (
          <Loader2 className="size-7 animate-spin text-primary" />
        ) : (
          <Upload className="size-7 text-muted-foreground" />
        )}
        <span className="font-medium">
          {uploading ? "Laen üles..." : "Klõpsa fotode lisamiseks"}
        </span>
        <span className="text-sm text-muted-foreground">
          Kuni {MAX_IMAGES} fotot · {value.length}/{MAX_IMAGES} lisatud
        </span>
      </button>

      {value.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            Lohista fotosid ümberjärjestamiseks. Esimene foto on vaikimisi kaanefoto.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={value.map((i) => i.url)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {value.map((image, index) => (
                  <SortableImage
                    key={image.url}
                    image={image}
                    index={index}
                    onRemove={() => removeImage(image.url)}
                    onCover={() => setCover(image.url)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
