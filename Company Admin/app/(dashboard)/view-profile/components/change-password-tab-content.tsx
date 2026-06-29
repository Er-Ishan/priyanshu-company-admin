"use client"

import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const ChangePasswordTabContent = () => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [id === "new-password" ? "newPassword" : "confirmPassword"]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwords.newPassword) {
            toast.error("Please enter a new password");
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (passwords.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/backend/api/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    newPassword: passwords.newPassword
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Password changed successfully");
                setPasswords({ newPassword: "", confirmPassword: "" });
            } else {
                toast.error(data.message || "Failed to change password");
            }
        } catch (error) {
            console.error("Change password error:", error);
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
            {/* New Password Field */}
            <div className="mb-5">
                <Label htmlFor="new-password" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                    New Password <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                    <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter New Password"
                        value={passwords.newPassword}
                        onChange={handleInputChange}
                        className="ps-5 pe-12 h-[48px] rounded-lg border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary !shadow-none !ring-0"
                    />
                    <Button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 !p-0 bg-transparent hover:bg-transparent text-muted-foreground h-[unset]"
                    >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Confirm Password Field */}
            <div className="mb-5">
                <Label htmlFor="confirm-password" className="inline-block font-semibold text-neutral-600 dark:text-neutral-200 text-sm mb-2">
                    Confirmed Password <span className="text-red-600">*</span>
                </Label>
                <div className="relative">
                    <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Enter Confirmed Password"
                        value={passwords.confirmPassword}
                        onChange={handleInputChange}
                        className="ps-5 pe-12 h-[48px] rounded-lg border border-neutral-300 dark:border-slate-700 focus:border-primary dark:focus:border-primary focus-visible:border-primary !shadow-none !ring-0"
                    />
                    <Button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 !p-0 bg-transparent hover:bg-transparent text-muted-foreground h-[unset]"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            <div className="mt-8">
                <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full sm:w-auto h-[48px] px-10 rounded-lg font-semibold"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>
        </form>
    );
};

export default ChangePasswordTabContent;
