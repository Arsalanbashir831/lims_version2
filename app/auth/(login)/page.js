"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logIn } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";
import Link from "next/link";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const handleLogin = async (e) => {
		e.preventDefault();
		const result = await logIn(email, password);
		console.log("result", result);
		if (result.error) {
			if (result.error === "Firebase: Error (auth/user-not-found).") {
				toast.error("User not found. Please register an account.");
			} else if (
				result.error === "Firebase: Error (auth/invalid-credential)."
			) {
				toast.error("Invalid credentials. Please try again.");
			} else {
				toast.error(result.error);
			}
		} else {
			// Display success message and navigate to the dashboard
			toast.success("Successfully logged in!");
			router.push(ROUTES.DASHBOARD.INDEX);
		}
	};

	return (
		<div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-gray-50 to-gray-200 p-6">
			{/* Logo positioned at the top */}
			<div className="absolute top-8">
				<Image
					src="/logo.png"
					alt="LIMS Logo"
					width={450}
					height={450}
					priority
				/>
			</div>

			{/* Spacer to push content below the logo */}
			<div className="mt-40"></div>

			{/* Login Card */}
			<Card className="w-full max-w-lg shadow-xl bg-white rounded-lg border border-gray-200 p-8">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-semibold text-gray-800">
						Welcome Back
					</CardTitle>
					<p className="text-gray-500 text-sm">
						Sign in to continue to the Laboratory Integrated Management System
					</p>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-6">
						<div>
							<Label htmlFor="email" className="text-gray-700 font-medium">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="mt-1"
							/>
						</div>
						<div>
							<Label htmlFor="password" className="text-gray-700 font-medium">
								Password
							</Label>
							<Input
								id="password"
								type="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="mt-1"
							/>
						</div>

						<Button
							type="submit"
							className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2">
							Login
						</Button>
					</form>

					<div className="text-center mt-6 text-gray-600 text-sm">
						<p>
							Don&rsquo;t have an account?
							<Link
								href="/auth/register"
								className="text-green-600 font-medium hover:underline ml-1">
								Register
							</Link>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
