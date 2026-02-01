import { InputHTMLAttributes } from "react";
import { Input } from "../../ui/primitives";

type Win95InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Win95Input({ className = "", ...props }: Win95InputProps) {
  return <Input className={`win95-input ${className}`} {...props} />;
}
