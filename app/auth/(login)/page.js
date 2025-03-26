"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logIn } from "@/lib/auth"; // Assuming this handles Firebase/backend login
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import Link from "next/link";
import { Mail, Lock, Loader2 } from "lucide-react";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleLogin = async (e) => {
		e.preventDefault();
        if (loading) return;
        setLoading(true);

		const result = await logIn(email, password);

		if (result.error) {
            let errorMessage = "An unexpected error occurred. Please try again.";
             if (typeof result.error === 'string') {
                if (result.error.includes("auth/user-not-found") || result.error.includes("auth/invalid-email")) {
                    errorMessage = "Email address not found. Please check or register.";
                } else if (result.error.includes("auth/wrong-password") || result.error.includes("auth/invalid-credential")) {
                    errorMessage = "Incorrect password. Please try again.";
                } else if (result.error.includes("auth/too-many-requests")) {
                    errorMessage = "Access temporarily disabled due to too many attempts. Try again later.";
                } else {
                     const match = result.error.match(/Firebase: Error \((auth\/[^)]+)\)/);
                     errorMessage = match ? `Error: ${match[1]}` : result.error;
                }
            }
			toast.error(errorMessage);
            setLoading(false);
		} else {
			router.push(ROUTES.DASHBOARD.INDEX);
		}
	};

	return (
		<div className="grid min-h-screen w-full grid-cols-1 md:grid-cols-2">

            {/* Left Side: Branding/Visual (Dark Scheme) */}
            {/* Using a very dark gray close to the image */}
            <div className="hidden bg-gray-950 md:flex flex-col items-center justify-center p-10 lg:p-16 text-white relative text-center">
                 <div className="absolute top-8 left-8 z-10">
                     {/* Increased Logo Size */}
                     <Image
                        src="/logo.png" // MAKE SURE this path is correct in /public
                        alt="GRIPCO Logo" // Updated Alt Text
                        width={250} // Increased width
                        height={80} // Adjust height based on your logo's aspect ratio
                        priority
                        style={{ height: 'auto' }} // Allow height to adjust automatically based on width
                    />
                 </div>
                 <div className="space-y-4 z-0 mt-16"> {/* Added margin-top to push text down */}
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">Laboratory Information Management</h1>
                    <p className="text-slate-300 max-w-lg text-base lg:text-lg">
                        Streamlining lab operations with precision and efficiency. Access your dashboard to manage samples, tests, and reports.
                    </p>
                 </div>
                 <p className="absolute bottom-6 text-xs text-slate-400">© {new Date().getFullYear()} GRIPCO. All rights reserved.</p>
            </div>

            {/* Right Side: Login Form */}
            {/* Using a very light gray background for subtle contrast with the white card */}
			<div className="flex flex-col items-center justify-center bg-gray-100 p-6 sm:p-10">
                {/* Logo for Mobile View */}
                <div className="mb-8 md:hidden">
                     <Image
                        src="/logo.png"
                        alt="GRIPCO Logo"
                        width={220} // Adjusted mobile size
                        height={70} // Adjust height based on your logo's aspect ratio
                        priority
                        style={{ height: 'auto' }}
                    />
                </div>

                {/* Making card always white with border/shadow for consistency */}
				<Card className="w-full max-w-md border border-gray-200 shadow-md bg-white rounded-lg p-6 sm:p-8">
					<CardHeader className="text-center px-0 sm:px-2"> {/* Reduced padding slightly */}
						<CardTitle className="text-2xl font-semibold tracking-tight text-gray-900">
							Sign In
						</CardTitle>
						<CardDescription className="text-sm text-gray-600 pt-1">
							Enter your credentials to access your account.
						</CardDescription>
					</CardHeader>
					<CardContent className="px-0 sm:px-2 pb-0 sm:pb-2"> {/* Reduced padding slightly */}
						<form onSubmit={handleLogin} className="space-y-5">
							<div className="space-y-1.5">
								<Label htmlFor="email" className="text-gray-700 font-medium">
									Email Address
								</Label>
                                <div className="relative flex items-center">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500" // Adjusted focus style
                                        disabled={loading}
                                    />
                                </div>
							</div>

							<div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-gray-700 font-medium">
                                        Password
                                    </Label>
                                    {/* Optional: Forgot Password Link */}
                                </div>
                                <div className="relative flex items-center">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500" // Adjusted focus style
                                        disabled={loading}
                                    />
                                </div>
							</div>

							<Button
								type="submit"
								className="w-full h-10 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-medium shadow-sm transition-colors duration-150" // Adjusted focus style
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Sign In"
                                )}
							</Button>
						</form>

                        {/* Separator */}
                        {/* <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              
                                <span className="bg-white px-2 text-gray-500">
                                    Or
                                </span>
                            </div>
                        </div> */}

                        {/* Register Link */}
                        {/* <p className="text-center text-sm text-gray-600">
                            Don’t have an account?{' '}
                            <Link
                                href="/auth/register" // Ensure this route is correct
                                className="font-medium text-blue-600 hover:underline"
                            >
                                Register here
                            </Link>
                        </p> */}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}