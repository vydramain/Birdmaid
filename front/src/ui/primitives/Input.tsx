/**
 * Input Primitive
 * 
 * Windows 95 styled input component.
 * Uses only SCSS classes, no inline styles.
 * 
 * @see docs/style/CHICAGO95_UI_CONTRACT.md
 */

import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  "data-testid"?: string;
};

export function Input({ 
  className = "", 
  "data-testid": testId,
  ...props 
}: InputProps) {
  return (
    <input 
      className={`win-input ${className}`}
      data-testid={testId}
      {...props}
    />
  );
}
