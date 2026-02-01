/**
 * Button Primitive
 * 
 * Windows 95 styled button component.
 * Uses only SCSS classes, no inline styles (except whitelisted).
 * 
 * @see docs/style/CHICAGO95_UI_CONTRACT.md
 */

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "default" | "primary";
  "data-testid"?: string;
};

export function Button({ 
  children, 
  className = "", 
  variant = "default",
  "data-testid": testId,
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={`win-btn ${variant === "primary" ? "win-btn-primary" : ""} ${className}`}
      data-testid={testId}
      {...props}
    >
      {children}
    </button>
  );
}
