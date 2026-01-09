import { TextareaHTMLAttributes } from "react";

type Win95TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Win95Textarea({ className = "", ...props }: Win95TextareaProps) {
  return (
    <textarea
      className={`win-inset ${className}`}
      style={{ padding: "4px 6px", width: "100%", minHeight: "80px", resize: "vertical" }}
      {...props}
    />
  );
}

