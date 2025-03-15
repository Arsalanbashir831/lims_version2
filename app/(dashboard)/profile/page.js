"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

export default function ProfilePage() {
	// Get the authenticated user from the auth context
	const { user: authUser } = useAuth();
	const router = useRouter();

	// Local states to store profile data and form editing values
	const [profileData, setProfileData] = useState(null);
	const [editUser, setEditUser] = useState(null);
	const [isEditing, setIsEditing] = useState(false);

	// If no authenticated user yet, show a loading state
	if (!authUser) {
		return <div>Loading...</div>;
	}

	// Fetch the user's profile data from Firestore using the authUser's UID
	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const response = await fetch(`/api/profile?uid=${authUser.uid}`);
				const result = await response.json();
				if (!response.ok) {
					toast.error(result.error || "User data not found.");
				} else {
					const data = result.user;
					setProfileData(data);
					setEditUser(data);
				}
			} catch (error) {
				console.error("Error fetching user profile:", error);
				toast.error("Error fetching user profile.");
			}
		};

		fetchUserProfile();
	}, [authUser]);

	// Show a loading state while fetching profile data
	if (!profileData || !editUser) {
		return <div>Loading profile...</div>;
	}

	// Handle changes in the form inputs
	const handleChange = (e) => {
		setEditUser({ ...editUser, [e.target.name]: e.target.value });
	};

	// Handle saving the updated profile data
	const handleSave = async () => {
		try {
			const response = await fetch("/api/profile/update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editUser),
			});
			const result = await response.json();
			if (!response.ok) {
				toast.error(result.error || "Failed to update profile");
			} else {
				// Update both local state and auth provider's user state
				setProfileData(result.user);
				setEditUser(result.user);
				setIsEditing(false);
				toast.success("Profile updated successfully!");
			}
		} catch (error) {
			toast.error("Something went wrong while updating the profile.");
		}
	};

	// Cancel editing and reset form data to the fetched profile data
	const handleCancel = () => {
		setEditUser(profileData);
		setIsEditing(false);
	};

	return (
		<div className="p-8 bg-gray-100 min-h-screen">
			<Card className="max-w-4xl mx-auto shadow-md bg-white p-8 rounded-lg">
				<CardHeader className="text-center">
					<Avatar className="mx-auto w-28 h-28">
						<AvatarImage
							src={profileData.profilePicture}
							alt="Profile Picture"
						/>
						<AvatarFallback>{profileData.fullName?.charAt(0)}</AvatarFallback>
					</Avatar>
					<CardTitle className="text-3xl mt-4">
						{profileData.fullName}
					</CardTitle>
					<p className="text-gray-600">
						{profileData.position} - {profileData.department}
					</p>
				</CardHeader>

				{/* Profile Details */}
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Personal Information */}
						<div>
							<h2 className="text-xl font-semibold text-gray-700 mb-3">
								Personal Information
							</h2>
							{[
								"fullName",
								"email",
								"phone",
								"gender",
								"maritalStatus",
								"nationality",
							].map((field) => (
								<div key={field} className="mb-3">
									<Label>{field.replace(/([A-Z])/g, " $1").trim()}</Label>
									<Input
										name={field}
										type={field === "email" ? "email" : "text"}
										value={editUser[field]}
										onChange={handleChange}
										disabled={!isEditing || field === "email"}
									/>
								</div>
							))}
						</div>

						{/* Employment Information */}
						<div>
							<h2 className="text-xl font-semibold text-gray-700 mb-3">
								Employment Details
							</h2>
							{[
								"employeeID",
								"branchName",
								"employmentStatus",
								"lineManager",
								"contractType",
								"contractDuration",
							].map((field) => (
								<div key={field} className="mb-3">
									<Label>{field.replace(/([A-Z])/g, " $1").trim()}</Label>
									<Input
										name={field}
										value={editUser[field]}
										onChange={handleChange}
										disabled={!isEditing}
									/>
								</div>
							))}
						</div>

						{/* Salary Information */}
						<div>
							<h2 className="text-xl font-semibold text-gray-700 mb-3">
								Salary & Allowances
							</h2>
							{[
								"basicSalary",
								"houseAllowance",
								"transportAllowance",
								"foodAllowance",
								"totalSalary",
							].map((field) => (
								<div key={field} className="mb-3">
									<Label>{field.replace(/([A-Z])/g, " $1").trim()}</Label>
									<Input
										name={field}
										value={editUser[field]}
										onChange={handleChange}
										disabled={!isEditing}
									/>
								</div>
							))}
						</div>

						{/* ID & Bank Information */}
						<div>
							<h2 className="text-xl font-semibold text-gray-700 mb-3">
								ID & Bank Details
							</h2>
							{[
								"idNumber",
								"idIssueDate",
								"idExpiryDate",
								"passportNumber",
								"passportIssueDate",
								"passportExpiryDate",
								"bankName",
								"accountNumber",
								"iban",
							].map((field) => (
								<div key={field} className="mb-3">
									<Label>{field.replace(/([A-Z])/g, " $1").trim()}</Label>
									<Input
										name={field}
										value={editUser[field]}
										onChange={handleChange}
										disabled={!isEditing}
									/>
								</div>
							))}
						</div>
					</div>

					{/* Edit Buttons */}
					<div className="text-center mt-6">
						{!isEditing ? (
							<Button
								className="bg-blue-600 hover:bg-blue-700 text-white"
								onClick={() => setIsEditing(true)}>
								Edit Profile
							</Button>
						) : (
							<div className="flex justify-center gap-4">
								<Button variant="outline" onClick={handleCancel}>
									Cancel
								</Button>
								<Button
									className="bg-green-600 hover:bg-green-700 text-white"
									onClick={handleSave}>
									Save Changes
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
