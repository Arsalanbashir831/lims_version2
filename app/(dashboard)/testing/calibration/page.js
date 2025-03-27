"use client";

import { useState, useEffect } from "react";
import ReusableTable from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogTrigger,
	DialogTitle,
} from "@/components/ui/dialog";
import { getBase64FromUrl, restrictUser } from "@/lib/utils";
import { toast } from "sonner";
import { db } from "@/config/firebase-config";
import {
	collection,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
	getDoc,
} from "firebase/firestore";
import { IASLogo } from "@/components/common/IASLogo";
import { getAuth } from "firebase/auth";

const CalibrationTestingPage = () => {
	const columns = [
		{ key: "srNo", label: "SR#" },
		{ key: "equipmentName", label: "Equipment/Instrument Name" },
		{ key: "equipmentSerial", label: "Equipment Serial #" },
		{ key: "calibrationVendor", label: "Calibration Vendor" },
		{ key: "calibrationDate", label: "Calibration Date" },
		{ key: "calibrationDueDate", label: "Calibration Due Date" },
		{ key: "calibrationCertification", label: "Calibration Certification" },
		{ key: "createdBy", label: "Created by" },
		{ key: "updatedBy", label: "Updated by" },
		{ key: "remarks", label: "Remarks" },
	];

	const initialTestState = {
		equipmentName: "",
		equipmentSerial: "",
		calibrationVendor: "",
		calibrationDate: "",
		calibrationDueDate: "",
		calibrationCertification: "",
		createdBy: "",
		updatedBy: "",
		remarks: "",
	};

	const [data, setData] = useState([]);
	const [userRole, setUserRole] = useState(null);
	const [newTest, setNewTest] = useState(initialTestState);
	const [editIndex, setEditIndex] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [fileName, setFileName] = useState("Calibration_Testing_List.xlsx");

	const fetchData = async () => {
		try {
			// Get current user
			const auth = getAuth();
			const currentUser = auth.currentUser;
			if (!currentUser) {
				console.error("No user is currently logged in.");
				return;
			}
			const userId = currentUser.uid;

			// Run both API calls concurrently
			const [testsSnapshot, userDocSnap] = await Promise.all([
				getDocs(collection(db, "calibrationTests")),
				getDoc(doc(db, "users", userId)),
			]);

			// Process proficiency tests
			const tests = testsSnapshot.docs.map((docSnap, index) => ({
				id: docSnap.id,
				srNo: index + 1,
				...docSnap.data(),
			}));
			setData(tests);

			// Process user role
			if (userDocSnap.exists()) {
				const userRole = userDocSnap.data().user_role;
				setUserRole(userRole);
			} else {
				console.error("User document does not exist");
				toast.error("User not found.");
			}
		} catch (error) {
			console.error("Error fetching data:", error);
			toast.error("Error fetching data.");
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleChange = (e) => {
		setNewTest({ ...newTest, [e.target.name]: e.target.value });
	};

	const handleAddOrUpdate = async () => {
		try {
			if (editIndex !== null && !restrictUser(userRole)) {
				// Update existing test in Firestore
				const testToEdit = data[editIndex];
				await updateDoc(doc(db, "calibrationTests", testToEdit.id), newTest);
				toast.success("Calibration test updated successfully");
			} else {
				// Add new calibration test to Firestore
				await addDoc(collection(db, "calibrationTests"), newTest);
				toast.success("Calibration test added successfully");
			}
			// Reset form and close dialog
			setNewTest(initialTestState);
			setEditIndex(null);
			setIsDialogOpen(false);
			fetchData();
		} catch (error) {
			console.error("Error adding/updating calibration test:", error);
			toast.error("Error adding/updating calibration test.");
		}
	};

	const handleEdit = (index) => {
		setNewTest(data[index]);
		setEditIndex(index);
		setIsDialogOpen(true);
	};

	const handleDelete = async (index) => {
		try {
			const testToDelete = data[index];
			await deleteDoc(doc(db, "calibrationTests", testToDelete.id));
			toast.success("Calibration test deleted successfully");
			fetchData();
		} catch (error) {
			console.error("Error deleting calibration test:", error);
			toast.error("Error deleting calibration test.");
		}
	};

	const handleDownloadExcel = async () => {
		try {
			const dataUrl = await getBase64FromUrl("/logo.jpg");
			const base64String = dataUrl.split("base64,")[1];
			const rightLogoUrl = await getBase64FromUrl("/ias_logo.jpg");
			const rightLogoBase64String = rightLogoUrl.split("base64,")[1];

			const response = await fetch("/api/export-excel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					columns,
					data,
					fileName,
					base64String,
					imagePath: "logo.jpg",
					rightLogoBase64String,
					rightImagePath: "ias_logo.jpg",
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to download file");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} catch (error) {
			console.error("Error downloading file:", error);
		}
	};

	return (
		<div className="p-6 bg-gray-100 min-h-screen">
			<div className="container mx-auto">
				<div className="flex justify-between items-end mb-6">
					<h1 className="text-2xl font-semibold text-gray-800 mb-6">
						Calibration Testing
					</h1>
					<IASLogo />
				</div>

				<div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
					<div className="flex items-center gap-2 w-full sm:w-auto">
						<Input
							value={fileName}
							onChange={(e) => setFileName(e.target.value)}
							className="w-full sm:w-64"
							placeholder="Enter file name"
						/>
						<Button
							className="bg-blue-600 hover:bg-blue-700 text-white"
							onClick={handleDownloadExcel}>
							Download Excel
						</Button>
					</div>

					<Dialog
						open={isDialogOpen}
						onOpenChange={(open) => {
							setIsDialogOpen(open);
							// Reset form when dialog closes
							if (!open) {
								setNewTest(initialTestState);
								setEditIndex(null);
							}
						}}>
						<DialogTrigger asChild>
							<Button className="bg-green-600 hover:bg-green-700 text-white">
								Add Calibration Test
							</Button>
						</DialogTrigger>
						<DialogContent className="p-6">
							<DialogTitle>
								{editIndex !== null ? "Edit" : "Add"} Calibration Test
							</DialogTitle>
							<div className="grid gap-4 mt-4">
								{columns.map((col) =>
									col.key !== "srNo" ? (
										<div key={col.key}>
											<label className="text-gray-700 font-medium">
												{col.label}
											</label>
											<Input
												type={
													col.key === "calibrationDate" ||
													col.key === "calibrationDueDate"
														? "date"
														: "text"
												}
												name={col.key}
												value={newTest[col.key] || ""}
												onChange={handleChange}
											/>
										</div>
									) : null
								)}
								<div className="flex justify-end">
									<Button
										variant="outline"
										onClick={() => {
											setIsDialogOpen(false);
											setNewTest(initialTestState);
											setEditIndex(null);
										}}>
										Cancel
									</Button>
									<Button
										className="ml-3 bg-blue-600 hover:bg-blue-700 text-white"
										onClick={handleAddOrUpdate}>
										{editIndex !== null ? "Update" : "Add"}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>

				<ReusableTable
					columns={columns}
					data={data}
					onEdit={handleEdit}
					onDelete={handleDelete}
					isEditingDisabled={restrictUser(userRole)}
				/>
			</div>
		</div>
	);
};

export default CalibrationTestingPage;
