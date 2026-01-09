import { InputHTMLAttributes } from "react";

type Win95InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Win95Input({ className = "", ...props }: Win95InputProps) {
  return <input className={`win-inset ${className}`} style={{ padding: "4px 6px", width: "100%" }} {...props} />;
}

