"use client";

import { useState, useEffect, useRef } from "react"; // Added useRef
import { useRouter } from "next/navigation";
import {
	Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils"; // Assuming you have this utility
import {
    User, Briefcase, DollarSign, Fingerprint, Landmark, Edit, Save, XCircle, Camera, Info // Icons
} from "lucide-react";

// Helper to display data in Read mode
const ReadOnlyField = ({ label, value }) => (
	<div className="mb-3 grid grid-cols-3 gap-2 items-center">
		<Label htmlFor={label} className="text-sm font-medium text-muted-foreground col-span-1">{label.replace(/([A-Z])/g, " $1").trim()}</Label>
		<p className="text-sm col-span-2 break-words">{value || <span className="text-muted-foreground italic">N/A</span>}</p>
	</div>
);

// Skeleton Loader for the Profile Page
const ProfileSkeleton = () => (
	<div className="p-4 md:p-6 lg:p-8 bg-muted/40 min-h-screen">
		<Card className="max-w-4xl mx-auto shadow-sm bg-white p-6 md:p-8 rounded-lg">
			<CardHeader className="items-center text-center border-b pb-6 mb-6">
				<Skeleton className="h-28 w-28 rounded-full mx-auto" />
				<Skeleton className="h-7 w-48 mt-4" />
				<Skeleton className="h-5 w-64 mt-2" />
			</CardHeader>
			<CardContent className="space-y-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
					{[...Array(4)].map((_, sectionIndex) => ( // 4 sections
						<div key={sectionIndex} className="space-y-4 border-t pt-4 md:border-none md:pt-0">
                            <Skeleton className="h-6 w-1/3 mb-3" />
                            {[...Array(5)].map((_, fieldIndex) => ( // ~5 fields per section
							    <div key={fieldIndex} className="space-y-2">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-8 w-full" />
                                </div>
                            ))}
						</div>
					))}
				</div>
                <div className="text-center mt-6 border-t pt-6">
                    <Skeleton className="h-10 w-28 mx-auto" />
                </div>
			</CardContent>
		</Card>
	</div>
);


export default function ProfilePage() {
	const { user: authUser } = useAuth();
	const router = useRouter();
	const fileInputRef = useRef(null); // Ref for file input

	const [profileData, setProfileData] = useState(null);
	const [editUser, setEditUser] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false); // For image upload feedback
    const [isSaving, setIsSaving] = useState(false); // For save feedback

	useEffect(() => {
		if (!authUser?.uid) {
            setIsLoading(false);
            // Optionally redirect if no user is expected
            // router.push('/login');
			return;
		}

		const fetchUserProfile = async () => {
            setIsLoading(true);
			try {
				const response = await fetch(`/api/profile?uid=${authUser.uid}`);
				const result = await response.json();
				if (!response.ok) {
					toast.error(result.error || "User data not found.");
                    setProfileData(null);
                    setEditUser(null);
				} else {
					setProfileData(result.user);
					setEditUser({ ...result.user }); // Initialize edit state with fetched data
				}
			} catch (error) {
				console.error("Error fetching user profile:", error);
				toast.error("Error fetching user profile.");
                setProfileData(null);
                setEditUser(null);
			} finally {
                setIsLoading(false);
            }
		};

		fetchUserProfile();
	}, [authUser?.uid, router]); // Added router to dependency

    // --- Event Handlers ---

	const handleChange = (e) => {
		setEditUser({ ...editUser, [e.target.name]: e.target.value });
	};

	const handleImageClick = () => {
		if (isEditing && fileInputRef.current) {
			fileInputRef.current.click(); // Trigger file input click
		}
	};

	const handleFileUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file || !authUser || isUploading) return;

		setIsUploading(true);
        const formData = new FormData();
		formData.append("file", file);
		formData.append("uid", authUser.uid);

		const toastId = toast.loading("Uploading profile picture...");

		try {
			const res = await fetch("/api/profile/update/profile-image", {
				method: "POST",
				body: formData,
			});
			const result = await res.json();
			if (!res.ok) {
				toast.error(result.error || "Failed to update profile image", { id: toastId });
			} else {
				const newImageUrl = result.profilePicture;
				// Update states immediately for responsiveness
				setProfileData((prev) => ({ ...prev, profilePicture: newImageUrl }));
				setEditUser((prev) => ({ ...prev, profilePicture: newImageUrl }));
				toast.success("Profile image updated!", { id: toastId });
			}
		} catch (error) {
			console.error("Error uploading profile image:", error);
			toast.error("Error uploading profile image", { id: toastId });
		} finally {
            setIsUploading(false);
            // Clear the file input value so the same file can be selected again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
	};

	const handleSave = async () => {
		if (!authUser || isSaving) return;
        setIsSaving(true);
        const toastId = toast.loading("Saving profile changes...");
		try {
            // Filter out uid from editUser before sending, add it separately if needed by API
            const { uid, ...updateData } = editUser;
			const response = await fetch("/api/profile/update", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...updateData, uid: authUser.uid }), // Send authUser.uid separately
			});
			const result = await response.json();
			if (!response.ok) {
				toast.error(result.error || "Failed to update profile", { id: toastId });
			} else {
				setProfileData(result.user); // Update display data
                setEditUser({ ...result.user }); // Reset edit data to saved data
				setIsEditing(false); // Exit edit mode
				toast.success("Profile updated successfully!", { id: toastId });
			}
		} catch (error) {
			console.error("Error saving profile:", error);
			toast.error("Something went wrong while updating.", { id: toastId });
		} finally {
            setIsSaving(false);
        }
	};

	const handleCancel = () => {
		setEditUser({ ...profileData }); // Reset edit state to original fetched data
		setIsEditing(false);
	};

    // --- Loading & Error States ---

	if (isLoading) {
		return <ProfileSkeleton />;
	}

    if (!profileData && !isLoading) {
        // Handle case where loading finished but no profile data exists
        return (
            <div className="p-8 bg-muted/40 min-h-screen flex items-center justify-center">
                <Card className="max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Profile Not Found</CardTitle>
                        <CardDescription>Could not load profile data. Please contact support if this issue persists.</CardDescription>
                    </CardHeader>
                     <CardFooter>
                        <Button variant="outline" onClick={() => router.back()} className="mx-auto">Go Back</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // --- Field Definitions (for easier mapping) ---
    const fieldSections = [
        {
            title: "Personal Information",
            icon: User,
            fields: ["fullName", "email", "phone", "gender", "maritalStatus", "nationality"],
            editable: ["fullName", "phone", "gender", "maritalStatus", "nationality"] // Exclude email
        },
        {
            title: "Employment Details",
            icon: Briefcase,
            fields: ["employeeID", "branchName", "employmentStatus", "lineManager", "contractType", "contractDuration", "position", "department"],
             editable: ["branchName", "employmentStatus", "lineManager", "contractType", "contractDuration", "position", "department"] // Exclude employeeID
        },
        {
            title: "Salary & Allowances",
            icon: DollarSign,
            fields: ["basicSalary", "houseAllowance", "transportAllowance", "foodAllowance", "totalSalary"],
            editable: ["basicSalary", "houseAllowance", "transportAllowance", "foodAllowance", "totalSalary"] // Assume all editable by admin? Adjust if needed.
        },
        {
            title: "ID & Bank Details",
            icon: Fingerprint, // Or Landmark combined? Using Fingerprint for ID focus
            fields: ["idNumber", "idIssueDate", "idExpiryDate", "passportNumber", "passportIssueDate", "passportExpiryDate", "bankName", "accountNumber", "iban"],
            editable: ["idNumber", "idIssueDate", "idExpiryDate", "passportNumber", "passportIssueDate", "passportExpiryDate", "bankName", "accountNumber", "iban"]
        }
    ];


    // --- Render Logic ---
	return (
		<div className="p-4 md:p-6 lg:p-8 bg-muted/40 min-h-screen">
			<Card className="max-w-4xl mx-auto shadow-sm bg-white p-6 md:p-8 rounded-lg">
				{/* Profile Header */}
				<CardHeader className="items-center text-center border-b pb-6 mb-6">
					<div className="relative group">
						<Avatar
							className={cn(
                                "mx-auto w-28 h-28 border-2",
                                isEditing ? "cursor-pointer border-primary/50" : "border-transparent"
                            )}
							onClick={handleImageClick}>
							<AvatarImage
								src={editUser?.profilePicture || ""} // Show preview from editUser
								alt="Profile Picture"
							/>
							<AvatarFallback className="text-3xl">
								{editUser?.fullName?.charAt(0).toUpperCase() || "?"}
							</AvatarFallback>
						</Avatar>
                        {isEditing && (
                            <div
                                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={handleImageClick}
                            >
                                <Camera className="h-8 w-8 text-white" />
                            </div>
                        )}
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							className="hidden"
							onChange={handleFileUpload}
                            disabled={isUploading}
						/>
					</div>
                    {isUploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
					<CardTitle className="text-3xl mt-4">
						{/* Display name from potentially edited state if editing */}
						{isEditing ? editUser?.fullName : profileData?.fullName}
					</CardTitle>
					<CardDescription className="text-muted-foreground">
						{/* Display position/dept from potentially edited state */}
						{isEditing ? editUser?.position : profileData?.position}
                        {(isEditing ? editUser?.department : profileData?.department) && ` - ${isEditing ? editUser?.department : profileData?.department}`}
					</CardDescription>
				</CardHeader>

				{/* Profile Details Sections */}
				<CardContent className="space-y-8">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
						{fieldSections.map((section) => (
							<div key={section.title} className="space-y-4 border-t pt-4 md:border-t-0 md:pt-0">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-3">
                                    <section.icon className="h-5 w-5 text-primary" />
                                    {section.title}
                                </h3>
								{section.fields.map((field) => {
                                    const canEditField = section.editable.includes(field);
                                    return (
                                        <div key={field}>
                                            {isEditing ? (
                                                <div className="space-y-1.5">
                                                    <Label htmlFor={field} className="text-sm">
                                                        {field.replace(/([A-Z])/g, " $1").trim()}
                                                    </Label>
                                                    <Input
                                                        id={field}
                                                        name={field}
                                                        type={field === "email" ? "email" : field.includes('Date') ? 'date' : 'text'} // Basic type detection
                                                        value={editUser?.[field] || ""}
                                                        onChange={handleChange}
                                                        disabled={!canEditField || isSaving} // Disable non-editable fields or while saving
                                                        className={cn(!canEditField && "bg-muted/50 border-dashed cursor-not-allowed")} // Style non-editable
                                                    />
                                                    {!canEditField && field === 'email' && (
                                                        <p className='text-xs text-muted-foreground flex items-center gap-1'><Info size={12}/>Email cannot be changed here.</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <ReadOnlyField
                                                    label={field}
                                                    value={profileData?.[field]}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
							</div>
						))}
					</div>

					{/* Action Buttons */}
					<div className="text-center mt-8 border-t pt-6">
						{!isEditing ? (
							<Button onClick={() => setIsEditing(true)}>
								<Edit className="mr-2 h-4 w-4" /> Edit Profile
							</Button>
						) : (
							<div className="flex flex-col sm:flex-row justify-center gap-4">
								<Button variant="outline" onClick={handleCancel} disabled={isSaving || isUploading}>
                                    <XCircle className="mr-2 h-4 w-4" /> Cancel
								</Button>
								<Button onClick={handleSave} disabled={isSaving || isUploading}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isSaving ? "Saving..." : "Save Changes"}
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}