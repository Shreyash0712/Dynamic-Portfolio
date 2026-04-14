"use client";

import { ReactNode, ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, variant = "primary", size = "md", className = "", ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
        
        const variantStyles: Record<ButtonVariant, string> = {
            primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
            ghost: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50",
            destructive: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
        };

        const sizeStyles: Record<ButtonSize, string> = {
            sm: "h-8 px-3 text-sm rounded-md",
            md: "h-10 px-4 text-sm rounded-lg",
            lg: "h-12 px-6 text-base rounded-lg",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
