"use client";

import { useState, useEffect } from "react";
import {
	Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter // Added Description/Footer
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { Download, Edit, User, Briefcase, DollarSign, FileText, Landmark, Fingerprint } from "lucide-react"; // Import icons
import { format } from 'date-fns'; // For optional date formatting
import { cn } from "@/lib/utils";

// Helper function to format dates nicely (optional)
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    // Adjust format string as needed, e.g., 'PPP' for 'Sep 15th, 2023'
    return format(new Date(dateString), 'PP'); // 'PP' -> 'Sep 15, 2023'
  } catch (error) {
    return dateString; // Return original if formatting fails
  }
};

// Helper to render detail items consistently
const DetailItem = ({ label, value, className = "" }) => (
	<div className={cn("grid grid-cols-3 gap-2 items-center", className)}>
		<dt className="text-sm font-medium text-muted-foreground col-span-1">{label}</dt>
		<dd className="text-sm text-foreground col-span-2">{value || "N/A"}</dd>
	</div>
);

// Skeleton Loader Component for the Dashboard
const DashboardSkeleton = () => (
	<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
		{/* Left Column Skeleton */}
		<div className="lg:col-span-1">
			<Card className="shadow-sm">
				<CardHeader className="items-center text-center">
					<Skeleton className="h-24 w-24 rounded-full mx-auto" />
					<Skeleton className="h-6 w-40 mt-4" />
					<Skeleton className="h-4 w-52 mt-2" />
					<Skeleton className="h-5 w-24 mt-3" />
				</CardHeader>
				<CardContent className="space-y-3 px-6 pb-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
				<CardFooter className="flex justify-center gap-2 pt-4 border-t">
                    <Skeleton className="h-9 w-32" />
				</CardFooter>
			</Card>
		</div>
		{/* Right Column Skeleton */}
		<div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
			{[...Array(6)].map((_, index) => ( // Create 6 skeleton cards
				<Card key={index} className="shadow-sm">
					<CardHeader>
						<Skeleton className="h-5 w-32" />
					</CardHeader>
					<CardContent className="space-y-4">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-3/4" />
					</CardContent>
				</Card>
			))}
		</div>
	</div>
);


export default function EmployeeDashboard() {
	const [employeeData, setEmployeeData] = useState(null);
	const [isLoading, setIsLoading] = useState(true); // Add loading state
	const { user } = useAuth();

	useEffect(() => {
		if (!user?.uid) {
			// Handle case where user is not yet available or logged out
            setIsLoading(false); // Stop loading if no user
			console.warn("User UID not available for fetching profile.");
			// Optionally redirect or show a message
			return;
		}

		async function fetchEmployeeData() {
			setIsLoading(true); // Start loading
			try {
				const response = await fetch(`/api/profile?uid=${user.uid}`);
				const result = await response.json();
				if (!response.ok) {
					toast.error(result.error || "Failed to fetch employee data.");
                    setEmployeeData(null); // Clear data on error
				} else {
					setEmployeeData(result.user);
				}
			} catch (error) {
				console.error("Error fetching employee data:", error);
				toast.error("An error occurred while fetching employee data.");
                setEmployeeData(null); // Clear data on error
			} finally {
                setIsLoading(false); // Stop loading regardless of outcome
            }
		}

		fetchEmployeeData();
	}, [user?.uid]); // Depend on user.uid

	// Show Skeleton Loader while loading
	if (isLoading) {
		return (
            <div className="p-4 md:p-6 lg:p-8 bg-muted/40 min-h-screen">
                <DashboardSkeleton />
            </div>
        );
	}

    // Show message if loading finished but no data (e.g., error or user not found)
    if (!employeeData) {
        return (
            <div className="p-4 md:p-6 lg:p-8 bg-muted/40 min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md text-center shadow-sm">
                    <CardHeader>
                        <CardTitle>Data Unavailable</CardTitle>
                        <CardDescription>Could not load employee information. Please try again later or contact support.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }


    // --- Main Dashboard Render ---
	return (
		<div className="p-4 md:p-6 lg:p-8 bg-muted/40 min-h-screen"> {/* Lighter background */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">

				{/* --- Left Column: Profile Summary --- */}
				<div className="lg:col-span-1 space-y-6">
					<Card className="shadow-sm">
						<CardHeader className="items-center text-center pb-4">
							<Avatar className="w-24 h-24 border-2 border-primary/20 mb-4">
								<AvatarImage
									src={employeeData.profilePicture}
									alt={employeeData.fullName || "Employee"}
								/>
								<AvatarFallback className="text-3xl">
									{employeeData.fullName?.charAt(0).toUpperCase() || "?"}
								</AvatarFallback>
							</Avatar>
							<CardTitle className="text-2xl">
								{employeeData.fullName}
							</CardTitle>
							<CardDescription className="text-base text-muted-foreground">
								{employeeData.position} {employeeData.department && `- ${employeeData.department}`}
							</CardDescription>
                            {employeeData.employmentStatus && (
                                <Badge variant="outline" className="mt-3 capitalize">
                                    {employeeData.employmentStatus}
                                </Badge>
                            )}
						</CardHeader>
                        <CardContent className="space-y-2 text-sm px-6 pb-6">
                            <DetailItem label="Employee ID" value={employeeData.employeeID} />
                            <DetailItem label="Email" value={employeeData.email} />
                            <DetailItem label="Branch" value={employeeData.branchName} />
                        </CardContent>
						<CardFooter className="flex flex-col sm:flex-row justify-center gap-2 pt-4 border-t">
							<Button size="sm" variant="outline" asChild disabled={!employeeData.profilePicture}>
								<a href={employeeData.profilePicture} download={`${employeeData.fullName || 'profile'}-picture`}>
									<Download className="mr-2 h-4 w-4" /> Download Pic
								</a>
							</Button>
                            {/* Example Edit Button (replace href or add onClick) */}
                            {/* <Button size="sm" variant="ghost">
                                <Edit className="mr-2 h-4 w-4" /> Edit Profile
                            </Button> */}
						</CardFooter>
					</Card>
                    {/* Add more summary cards here if needed */}
				</div>

				{/* --- Right Column: Detailed Information --- */}
				<div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Personal Information */}
					<Card className="shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5 text-primary" />
                                Personal Information
                            </CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<DetailItem label="Gender" value={employeeData.gender} />
							<DetailItem label="Marital Status" value={employeeData.maritalStatus} />
							<DetailItem label="Nationality" value={employeeData.nationality} />
						</CardContent>
					</Card>

					{/* Employment Details */}
					<Card className="shadow-sm">
						<CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Briefcase className="h-5 w-5 text-primary" />
                                Employment Details
                            </CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<DetailItem label="Joining Date" value={formatDate(employeeData.joiningDate)} />
							<DetailItem label="Line Manager" value={employeeData.lineManager} />
                            {/* Employee ID, Branch, Status are in summary - avoid redundancy unless needed */}
						</CardContent>
					</Card>

					{/* Salary & Benefits */}
					<Card className="shadow-sm">
						<CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <DollarSign className="h-5 w-5 text-primary" />
                                Salary & Benefits
                            </CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<DetailItem label="Basic Salary" value={employeeData.basicSalary ? `$${employeeData.basicSalary}` : 'N/A'} />
							<DetailItem label="House Allowance" value={employeeData.houseAllowance ? `$${employeeData.houseAllowance}` : 'N/A'} />
							<DetailItem label="Transport Allowance" value={employeeData.transportAllowance ? `$${employeeData.transportAllowance}` : 'N/A'} />
							<DetailItem label="Food Allowance" value={employeeData.foodAllowance ? `$${employeeData.foodAllowance}` : 'N/A'} />
							<DetailItem label="Total Salary" value={employeeData.totalSalary ? `$${employeeData.totalSalary}` : 'N/A'} className="font-semibold border-t pt-3 mt-2" />
						</CardContent>
					</Card>

					{/* Contract Details */}
					<Card className="shadow-sm">
						<CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5 text-primary" />
                                Contract Details
                            </CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<DetailItem label="Type" value={employeeData.contractType} />
							<DetailItem label="Duration" value={employeeData.contractDuration} />
							<DetailItem label="Issuance Date" value={formatDate(employeeData.contractIssuanceDate)} />
							<DetailItem label="Expiry Date" value={formatDate(employeeData.contractExpiryDate)} />
						</CardContent>
					</Card>

					{/* ID Information */}
					<Card className="shadow-sm">
						<CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Fingerprint className="h-5 w-5 text-primary" />
                                ID Information
                            </CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<DetailItem label="ID Number" value={employeeData.idNumber} />
							<DetailItem label="Name in ID" value={employeeData.nameInIDEnglish} />
							<DetailItem label="Issue Date" value={formatDate(employeeData.idIssueDate)} />
							<DetailItem label="Expiry Date" value={formatDate(employeeData.idExpiryDate)} />
						</CardContent>
					</Card>

					{/* Bank & Payments */}
					<Card className="shadow-sm">
						<CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Landmark className="h-5 w-5 text-primary" />
                                Bank & Payments
                            </CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<DetailItem label="Bank Name" value={employeeData.bankName} />
							<DetailItem label="Account Number" value={employeeData.accountNumber} />
							<DetailItem label="IBAN" value={employeeData.iban} />
						</CardContent>
					</Card>

				</div>
			</div>
		</div>
	);
}