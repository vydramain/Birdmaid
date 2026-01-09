import { ButtonHTMLAttributes, ReactNode } from "react";

type Win95ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Win95Button({ children, className = "", ...props }: Win95ButtonProps) {
  return (
    <button className={`win-btn ${className}`} {...props}>
      {children}
    </button>
  );
}

