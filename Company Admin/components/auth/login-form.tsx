"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Car } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name || !password) {
      toast.error("Both fields required");
      return;
    }

    setLoading(true);

    try {
      // Use NextAuth signIn to correctly set the JWT session cookie
      const result = await signIn("credentials", {
        redirect: false,
        name,
        password,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          toast.error("Invalid username/email or password");
        } else {
          toast.error(result.error || "Login failed");
        }
        return;
      }

      // For immediate local usage (optional, can be phased out as NextAuth role is used)
      if (typeof window !== "undefined") {
        // We fetch session/me to get the true user data and role from NextAuth
        fetch("/api/session/me")
          .then(res => res.json())
          .then(async data => {
            if (data?.user) {
              const role = (data.user.role || data.role || "").toString().toLowerCase();
              localStorage.setItem("user", JSON.stringify({ ...data.user, role }));

              if (role === "operator") {
                router.replace("/operator-bookings");
                return;
              }

              // For admin/owner always go to dashboard
              if (role === "owner" || role === "admin") {
                router.replace("/dashboard");
                return;
              }

              // For limited users, check permissions and redirect to first allowed page
              const userId = data.user.id;
              try {
                const permRes = await fetch(
                  `/api/backend/api/access-control/my-permissions/${userId}`,
                  { credentials: "include" }
                );
                const permData = await permRes.json();
                const permissions: string[] = permData?.success ? permData.data || [] : [];

                if (permissions.includes("access_dashboard")) {
                  router.replace("/dashboard");
                  return;
                }

                // Find first permitted URL from nav sections
                const { NAV_SECTIONS } = await import("@/components/layout/Topbar");
                for (const section of NAV_SECTIONS) {
                  if (section.permission && permissions.includes(section.permission)) {
                    router.replace(section.url);
                    return;
                  }
                  if (section.items) {
                    for (const item of section.items) {
                      if (!item.permission || permissions.includes(item.permission)) {
                        router.replace(item.url);
                        return;
                      }
                    }
                  }
                }
              } catch {
                // fall through to dashboard on error
              }

              router.replace("/dashboard");
            } else {
              router.replace("/dashboard");
            }
          })
          .catch(() => router.replace("/dashboard"));
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-6">
        <motion.div
          whileFocus={{ scale: 1.01 }}
          className="space-y-2"
        >
          <label className="block text-sm font-bold text-slate-700 ml-1">Username or Email</label>
          <div className="relative">
            <input
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1443a6]/5 focus:border-[#1443a6] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
              type="text"
              placeholder="Enter your username"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </motion.div>

        <motion.div
          whileFocus={{ scale: 1.01 }}
          className="space-y-2"
        >
          <label className="block text-sm font-bold text-slate-700 ml-1">Password</label>
          <div className="relative">
            <input
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#1443a6]/5 focus:border-[#1443a6] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </motion.div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#1443a6] hover:bg-[#0f3484] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.97] disabled:opacity-70 disabled:active:scale-100 mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <Car size={20} />
              </motion.div>
              Authenticating...
            </span>
          ) : "Sign In to Dashboard"}
        </button>

                <div className="pt-2 flex items-center justify-between px-1">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}