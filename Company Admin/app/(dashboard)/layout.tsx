// import { cookies } from "next/headers";
// import { ClientRoot } from "@/app/client-root";
// import { auth } from "@/auth";
// import { SessionProvider } from "next-auth/react";

// export default async function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   try {
//     const cookieStore = await cookies();
//     const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

//     const session = await auth();

//     return (
//       <SessionProvider session={session}>
//         <ClientRoot defaultOpen={defaultOpen}>{children}</ClientRoot>
//       </SessionProvider>
//     );
//   } catch (error) {
//     return (
//       <div className="p-8 text-center">
//         <h2 className="text-xl font-semibold mb-2">Something went wrong!</h2>
//         <p className="text-muted-foreground">We couldn't load the layout. Please try again later.</p>
//       </div>
//     );
//   }
// }


import type { ReactNode } from 'react';
import TopbarSwitch from '@/components/layout/TopbarSwitch';

export default async function DashboardLayout(props: {
  children: ReactNode;
  params: Promise<any>;
}) {
  const params = await props.params;
  const children = props.children;
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar: full Topbar for non-operators, TopbarOperator for operator role */}
      <TopbarSwitch />

      {/* Content under the fixed header (h-16) */}
      <div className="pt-4">
        <main className="mx-auto px-3 sm:px-4 py-4">
          {children}
        </main>
      </div>
    </div>
  );
}

