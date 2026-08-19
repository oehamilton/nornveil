import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full resize-y rounded-[var(--radius-md)] border border-field-border bg-field px-3 py-3 text-sm text-fg placeholder:text-muted outline-none transition-colors duration-150 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/60",
        className,
      )}
      {...props}
    />
  );
}
