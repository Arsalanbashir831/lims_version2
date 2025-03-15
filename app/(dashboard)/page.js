"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";

export default function EmployeeDashboard() {
	const [employeeData, setEmployeeData] = useState(null);
	const { user } = useAuth();

	useEffect(() => {
		async function fetchEmployeeData() {
			try {
				// Replace this with the actual UID as needed (e.g., from auth context)
				const response = await fetch(`/api/profile?uid=${user.uid}`);
				const result = await response.json();
				if (!response.ok) {
					toast.error(result.error || "Failed to fetch employee data.");
				} else {
					setEmployeeData(result.user);
				}
			} catch (error) {
				console.error("Error fetching employee data:", error);
				toast.error("Error fetching employee data.");
			}
		}

		fetchEmployeeData();
	}, []);

	if (!employeeData) {
		return <div>Loading...</div>;
	}

	return (
		<div className="p-8 bg-gray-100 min-h-screen">
			{/* Employee Profile Section */}
			<Card className="max-w-6xl mx-auto shadow-md bg-white p-8 rounded-lg">
				<CardHeader className="text-center">
					<Avatar className="mx-auto w-28 h-28">
						<AvatarImage
							src={employeeData.profilePicture}
							alt="Employee Profile"
						/>
						<AvatarFallback>{employeeData.fullName.charAt(0)}</AvatarFallback>
					</Avatar>
					<CardTitle className="text-3xl mt-4">
						{employeeData.fullName}
					</CardTitle>
					<p className="text-gray-600 text-lg">
						{employeeData.position} - {employeeData.department}
					</p>
				</CardHeader>

				<CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
					{/* Personal Information Section */}
					<div className="col-span-1">
						<h2 className="text-xl font-semibold text-gray-700 mb-3">
							Personal Information
						</h2>
						<p>
							<strong>Email:</strong> {employeeData.email}
						</p>
						<p>
							<strong>Gender:</strong> {employeeData.gender}
						</p>
						<p>
							<strong>Marital Status:</strong> {employeeData.maritalStatus}
						</p>
						<p>
							<strong>Nationality:</strong> {employeeData.nationality}
						</p>
					</div>

					{/* Employment Information Section */}
					<div className="col-span-1">
						<h2 className="text-xl font-semibold text-gray-700 mb-3">
							Employment Details
						</h2>
						<p>
							<strong>Employee ID:</strong> {employeeData.employeeID}
						</p>
						<p>
							<strong>Branch:</strong> {employeeData.branchName}
						</p>
						<p>
							<strong>Joining Date:</strong> {employeeData.joiningDate}
						</p>
						<p>
							<strong>Employment Status:</strong>{" "}
							{employeeData.employmentStatus}
						</p>
						<p>
							<strong>Line Manager:</strong> {employeeData.lineManager}
						</p>
					</div>

					{/* Salary Information Section */}
					<div className="col-span-1">
						<h2 className="text-xl font-semibold text-gray-700 mb-3">
							Salary & Benefits
						</h2>
						<p>
							<strong>Basic Salary:</strong> ${employeeData.basicSalary}
						</p>
						<p>
							<strong>House Allowance:</strong> ${employeeData.houseAllowance}
						</p>
						<p>
							<strong>Transport Allowance:</strong> $
							{employeeData.transportAllowance}
						</p>
						<p>
							<strong>Food Allowance:</strong> ${employeeData.foodAllowance}
						</p>
						<p>
							<strong>Total Salary:</strong> ${employeeData.totalSalary}
						</p>
					</div>

					{/* Contract & ID Details */}
					<div className="col-span-1">
						<h2 className="text-xl font-semibold text-gray-700 mb-3">
							Contract Details
						</h2>
						<p>
							<strong>Contract Type:</strong> {employeeData.contractType}
						</p>
						<p>
							<strong>Contract Duration:</strong>{" "}
							{employeeData.contractDuration}
						</p>
						<p>
							<strong>Contract Issuance:</strong>{" "}
							{employeeData.contractIssuanceDate}
						</p>
						<p>
							<strong>Contract Expiry:</strong>{" "}
							{employeeData.contractExpiryDate}
						</p>
					</div>

					<div className="col-span-1">
						<h2 className="text-xl font-semibold text-gray-700 mb-3">
							ID Information
						</h2>
						<p>
							<strong>ID Number:</strong> {employeeData.idNumber}
						</p>
						<p>
							<strong>Name in ID:</strong> {employeeData.nameInIDEnglish}
						</p>
						<p>
							<strong>ID Issue Date:</strong> {employeeData.idIssueDate}
						</p>
						<p>
							<strong>ID Expiry Date:</strong> {employeeData.idExpiryDate}
						</p>
					</div>

					<div className="col-span-1">
						<h2 className="text-xl font-semibold text-gray-700 mb-3">
							Bank & Payments
						</h2>
						<p>
							<strong>Bank Name:</strong> {employeeData.bankName}
						</p>
						<p>
							<strong>Account Number:</strong> {employeeData.accountNumber}
						</p>
						<p>
							<strong>IBAN:</strong> {employeeData.iban}
						</p>
					</div>
				</CardContent>

				{/* Download Buttons */}
				<CardContent className="flex justify-between mt-6">
					<Button asChild>
						<a href={employeeData.profilePicture} download>
							Download Profile Picture
						</a>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
