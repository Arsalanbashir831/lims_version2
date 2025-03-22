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
import { toast } from "sonner";
import { db } from "@/config/firebase-config";
import {
	collection,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { IASLogo } from "@/components/common/IASLogo";

const ProficiencyTestingPage = () => {
	const columns = [
		{ key: "srNo", label: "Sr#" },
		{ key: "description", label: "Description of Testing Scope" },
		{ key: "provider1", label: "PT Provider 1" },
		{ key: "provider2", label: "PT Provider 2" },
		{ key: "lastTestDate", label: "Last Test Date" },
		{ key: "dueDate", label: "Due Date" },
		{ key: "nextScheduledDate", label: "Next Scheduled Date" },
		{ key: "status", label: "Status" },
		{ key: "remarks", label: "Remarks" },
	];

	const initialTestState = {
		description: "",
		provider1: "",
		provider2: "",
		lastTestDate: "",
		dueDate: "",
		nextScheduledDate: "",
		status: "",
		remarks: "",
	};

	const [data, setData] = useState([]);
	const [newTest, setNewTest] = useState(initialTestState);
	const [editIndex, setEditIndex] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [fileName, setFileName] = useState("Proficiency_Testing.xlsx");

	// Fetch proficiency tests from Firestore
	const fetchTests = async () => {
		try {
			const testsCollection = collection(db, "proficiencyTests");
			const snapshot = await getDocs(testsCollection);
			const tests = snapshot.docs.map((docSnap, index) => ({
				id: docSnap.id,
				srNo: index + 1,
				...docSnap.data(),
			}));
			setData(tests);
		} catch (error) {
			console.error("Error fetching proficiency tests:", error);
			toast.error("Error fetching proficiency tests.");
		}
	};

	useEffect(() => {
		fetchTests();
	}, []);

	const handleChange = (e) => {
		setNewTest({ ...newTest, [e.target.name]: e.target.value });
	};

	const handleAddOrUpdate = async () => {
		try {
			if (editIndex !== null) {
				// Update existing test in Firestore
				const testToEdit = data[editIndex];
				await updateDoc(doc(db, "proficiencyTests", testToEdit.id), newTest);
				toast.success("Proficiency test updated successfully");
			} else {
				// Add new proficiency test to Firestore
				await addDoc(collection(db, "proficiencyTests"), newTest);
				toast.success("Proficiency test added successfully");
			}
			// Reset form state and close dialog
			setNewTest(initialTestState);
			setEditIndex(null);
			setIsDialogOpen(false);
			fetchTests();
		} catch (error) {
			console.error("Error adding/updating proficiency test:", error);
			toast.error("Error adding/updating proficiency test.");
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
			await deleteDoc(doc(db, "proficiencyTests", testToDelete.id));
			toast.success("Proficiency test deleted successfully");
			fetchTests();
		} catch (error) {
			console.error("Error deleting proficiency test:", error);
			toast.error("Error deleting proficiency test.");
		}
	};

	// Convert static image (/logo.jpg) to Base64 for the Excel export
	const convertImageToBase64 = async (imagePath) => {
		const response = await fetch(imagePath);
		const blob = await response.blob();
		return new Promise((resolve) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result.split(",")[1]);
			reader.readAsDataURL(blob);
		});
	};

	const handleDownloadExcel = async () => {
		try {
			const logoBase64 = await convertImageToBase64("/logo.jpg");
			const response = await fetch("/api/export-excel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					columns,
					data,
					fileName,
					logoBase64,
					imagePath: "logo.jpg",
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
		<div className="p-6 container mx-auto bg-gray-100 min-h-screen">
			<div className="flex justify-between items-end mb-6">
				<h1 className="text-2xl font-semibold text-gray-800 mb-6">
					Proficiency Testing
				</h1>
				<IASLogo />
			</div>

			<div className="flex justify-between items-center mb-4">
				<div className="flex items-center gap-2">
					<Input
						value={fileName}
						onChange={(e) => setFileName(e.target.value)}
						className="w-64"
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
							Add Proficiency Test
						</Button>
					</DialogTrigger>
					<DialogContent className="p-6">
						<DialogTitle>
							{editIndex !== null ? "Edit" : "Add"} Proficiency Test
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
												col.key === "lastTestDate" ||
												col.key === "dueDate" ||
												col.key === "nextScheduledDate"
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
			/>
		</div>
	);
};

export default ProficiencyTestingPage;
