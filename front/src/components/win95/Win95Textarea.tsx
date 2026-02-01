import { TextareaHTMLAttributes } from "react";

type Win95TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Win95Textarea({ className = "", ...props }: Win95TextareaProps) {
  return (
    <textarea
      className={`win-textarea ${className}`}
      {...props}
    />
  );
}

