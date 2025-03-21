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

const LabEquipments = () => {
	const columns = [
		{ key: "srNo", label: "SR#" },
		{ key: "equipmentName", label: "Equipment Name" },
		{ key: "equipmentSerial", label: "Equipment Serial #" },
		{ key: "status", label: "Status" },
		{ key: "lastVerification", label: "Last Internal Verification Date" },
		{ key: "verificationDue", label: "Internal Verification Due Date" },
		{ key: "createdBy", label: "Created By" },
		{ key: "updatedBy", label: "Updated By" },
		{ key: "remarks", label: "Remarks" },
	];

	const [data, setData] = useState([]);
	const [newEquipment, setNewEquipment] = useState({
		equipmentName: "",
		equipmentSerial: "",
		status: "",
		lastVerification: "",
		verificationDue: "",
		createdBy: "",
		updatedBy: "",
		remarks: "",
	});
	const [editIndex, setEditIndex] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [fileName, setFileName] = useState("Equipment_Inventory.xlsx");

	// Fetch equipments from Firestore
	const fetchEquipments = async () => {
		try {
			const equipmentsCollection = collection(db, "equipments");
			const snapshot = await getDocs(equipmentsCollection);
			const equipments = snapshot.docs.map((docSnap, index) => ({
				id: docSnap.id,
				srNo: index + 1,
				...docSnap.data(),
			}));
			setData(equipments);
		} catch (error) {
			console.error("Error fetching equipments:", error);
			toast.error("Error fetching equipments.");
		}
	};

	useEffect(() => {
		fetchEquipments();
	}, []);

	const handleChange = (e) => {
		setNewEquipment({ ...newEquipment, [e.target.name]: e.target.value });
	};

	const handleAddOrUpdate = async () => {
		try {
			if (editIndex !== null) {
				// Update equipment in Firestore
				const equipmentToEdit = data[editIndex];
				await updateDoc(
					doc(db, "equipments", equipmentToEdit.id),
					newEquipment
				);
				toast.success("Equipment updated successfully");
			} else {
				// Add new equipment to Firestore
				await addDoc(collection(db, "equipments"), newEquipment);
				toast.success("Equipment added successfully");
			}
			setNewEquipment({
				equipmentName: "",
				equipmentSerial: "",
				status: "",
				lastVerification: "",
				verificationDue: "",
				createdBy: "",
				updatedBy: "",
				remarks: "",
			});
			setEditIndex(null);
			setIsDialogOpen(false);
			fetchEquipments();
		} catch (error) {
			console.error("Error adding/updating equipment:", error);
			toast.error("Error adding/updating equipment.");
		}
	};

	const handleEdit = (index) => {
		setNewEquipment(data[index]);
		setEditIndex(index);
		setIsDialogOpen(true);
	};

	const handleDelete = async (index) => {
		try {
			const equipmentToDelete = data[index];
			await deleteDoc(doc(db, "equipments", equipmentToDelete.id));
			toast.success("Equipment deleted successfully");
			fetchEquipments();
		} catch (error) {
			console.error("Error deleting equipment:", error);
			toast.error("Error deleting equipment.");
		}
	};

	const handleDownloadExcel = async () => {
		try {
			const response = await fetch("/api/export-excel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ columns, data, fileName }),
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
			toast.error("Error downloading file.");
		}
	};

	return (
		<div className="p-6 bg-gray-100 min-h-screen">
			<div className="container mx-auto">
				<h1 className="text-2xl font-semibold text-gray-800 mb-6">
					Equipment Inventory List
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

					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button className="bg-green-600 hover:bg-green-700 text-white">
								Add Equipment
							</Button>
						</DialogTrigger>
						<DialogContent className="p-6">
							<DialogTitle>
								{editIndex !== null ? "Edit" : "Add"} Equipment
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
													col.key === "lastVerification" ||
													col.key === "verificationDue"
														? "date"
														: "text"
												}
												name={col.key}
												value={newEquipment[col.key] || ""}
												onChange={handleChange}
											/>
										</div>
									) : null
								)}
								<div className="flex justify-end">
									<Button
										variant="outline"
										onClick={() => setIsDialogOpen(false)}>
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

export default LabEquipments;
