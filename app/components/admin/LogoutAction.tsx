"use client";

import Button from "@/app/components/ui/Button";
import { signOut } from "next-auth/react";

export default function LogoutAction() {
    return (
        <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/login" })}
        >
            Logout
        </Button>
    );
}
