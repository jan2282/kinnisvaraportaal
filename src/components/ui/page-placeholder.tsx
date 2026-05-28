import { Construction } from "lucide-react";

export function PagePlaceholder({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        <Construction className="size-7" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="max-w-md text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
