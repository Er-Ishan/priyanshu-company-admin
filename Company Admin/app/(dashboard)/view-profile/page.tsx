import ChangePasswordTabContent from "@/app/(dashboard)/view-profile/components/change-password-tab-content";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Change Password | WowDash Admin Dashboard",
    description: "Update your account password securely in the WowDash Admin Dashboard.",
};

const ChangePasswordPage = () => {
    return (
        <>
            <DashboardBreadcrumb title="Change Password" text="Settings" />

            <div className="flex justify-center mt-8">
                <div className="w-full max-w-2xl">
                    <Card className="card shadow-lg border-slate-200/60 dark:border-slate-800/60">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                            <CardTitle className="text-xl font-bold">Change Password</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <ChangePasswordTabContent />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};
export default ChangePasswordPage;
