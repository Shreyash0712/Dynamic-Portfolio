"use client";

import { ReactNode } from "react";

type ButtonProps = {
    children: ReactNode;
    onClick?: () => void;
    variant?: "primary" | "ghost";
};

export default function Button({
    children,
    onClick,
    variant = "primary",
}: ButtonProps) {
    const styles =
        variant === "ghost"
            ? {
                background: "transparent",
                border: "1px solid currentColor",
            }
            : {
                background: "currentColor",
                color: "#000",
                border: "none",
            };

    return (
        <button
            onClick={onClick}
            style={{
                padding: "6px 12px",
                cursor: "pointer",
                borderRadius: "6px",
                fontSize: "14px",
                ...styles,
            }}
        >
            {children}
        </button>
    );
}
