"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import { Lock } from "lucide-react";
import userImg from "@/public/assets/images/user.png";
import Logout from "@/components/auth/logout";

export default function ProfileDropdown() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className="rounded-full w-10 h-10 bg-gray-200 hover:bg-gray-300 border-0"
        >
          <Image
            src={user?.image || userImg}
            className="rounded-full"
            width={40}
            height={40}
            alt="User"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 p-4 rounded-2xl shadow-xl"
        side="bottom"
        align="end"
      >
        <div className="py-3 px-4 bg-blue-100 rounded-lg mb-4">
          <h6 className="text-lg font-bold text-gray-900 truncate">
            {user?.name || "User"}
          </h6>
          <span className="text-sm text-gray-600 truncate block">{user?.email}</span>
        </div>

        <ul className="flex flex-col gap-1">
          <li>
            <Link 
              href="/view-profile"
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Lock size={18} className="text-gray-500" />
              Change Password
            </Link>
          </li>
          <li className="my-1 border-t border-gray-100" />
          <li className="px-3 py-2">
            <Logout />
          </li>
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
