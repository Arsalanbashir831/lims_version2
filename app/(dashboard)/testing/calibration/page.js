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
import { getBase64FromUrl } from "@/lib/utils";
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
	const [newTest, setNewTest] = useState(initialTestState);
	const [editIndex, setEditIndex] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [fileName, setFileName] = useState("Calibration_Testing.xlsx");

	// Fetch calibration tests from Firestore
	const fetchTests = async () => {
		try {
			const testsCollection = collection(db, "calibrationTests");
			const snapshot = await getDocs(testsCollection);
			const tests = snapshot.docs.map((docSnap, index) => ({
				id: docSnap.id,
				srNo: index + 1,
				...docSnap.data(),
			}));
			setData(tests);
		} catch (error) {
			console.error("Error fetching calibration tests:", error);
			toast.error("Error fetching calibration tests.");
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
			fetchTests();
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
			fetchTests();
		} catch (error) {
			console.error("Error deleting calibration test:", error);
			toast.error("Error deleting calibration test.");
		}
	};

	const handleDownloadExcel = async () => {
		try {
			// Convert logo image to Base64
			const dataUrl = await getBase64FromUrl("/logo.png");
			// Extract the base64 string from the data URL
			const base64String = dataUrl.split("base64,")[1];
			const response = await fetch("/api/export-excel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					columns,
					data,
					fileName,
					base64String,
					imagePath: "logo.png",
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
				<h1 className="text-2xl font-semibold text-gray-800 mb-6">
					Calibration Testing
				</h1>

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
				/>
			</div>
		</div>
	);
};

export default CalibrationTestingPage;
