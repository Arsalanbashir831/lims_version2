"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ROUTES } from "@/lib/constants";
import { toast } from "sonner";

export default function Signup() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const router = useRouter();

	const handleSignup = async (e) => {
		e.preventDefault();

		// Password validation
		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		const result = await signUp(email, password);
		console.log("Signup result:", result);
		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success("Successfully signed up!");
			// Redirect user after a successful signup
			router.push(ROUTES.USER.PROFILE);
		}
	};

	return (
		<div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-r from-gray-50 to-gray-200 p-6">
			{/* Logo at the top */}
			<div className="absolute top-8">
				<Image
					src="/logo.png"
					alt="LIMS Logo"
					width={450}
					height={250}
					priority
				/>
			</div>

			{/* Spacer for proper positioning */}
			<div className="mt-40"></div>

			{/* Signup Card */}
			<Card className="w-full max-w-lg shadow-xl bg-white rounded-lg border border-gray-200 p-8">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl font-semibold text-gray-800">
						Create an Account
					</CardTitle>
					<p className="text-gray-500 text-sm">
						Join the Laboratory Integrated Management System
					</p>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSignup} className="space-y-6">
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
								placeholder="Create a strong password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								className="mt-1"
							/>
						</div>
						<div>
							<Label
								htmlFor="confirmPassword"
								className="text-gray-700 font-medium">
								Confirm Password
							</Label>
							<Input
								id="confirmPassword"
								type="password"
								placeholder="Re-enter your password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className="mt-1"
							/>
						</div>

						<Button
							type="submit"
							className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2">
							Sign Up
						</Button>
					</form>

					<div className="text-center mt-6 text-gray-600 text-sm">
						<p>
							Already have an account?
							<a
								href="/auth"
								className="text-green-600 font-medium hover:underline ml-1">
								Log in
							</a>
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
