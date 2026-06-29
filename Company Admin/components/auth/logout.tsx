"use client";

import { signOut } from "next-auth/react";

export default function Logout() {
  const logout = async () => {
    await fetch("/api/session/logout", {
      method: "POST",
      credentials: "include",
    });

    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
    }

    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <button
      onClick={logout}
      className="text-red-600 hover:text-red-800 font-semibold"
    >
      Logout
    </button>
  );
}
