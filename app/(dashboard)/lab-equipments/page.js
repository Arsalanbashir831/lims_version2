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
	getDoc,
} from "firebase/firestore";
import { IASLogo } from "@/components/common/IASLogo";
import { getBase64FromUrl, restrictUser } from "@/lib/utils";
import { getAuth } from "firebase/auth";

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
	const [userRole, setUserRole] = useState(null);
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
	const [fileName, setFileName] = useState("Equipment_Inventory_List.xlsx");

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
				getDocs(collection(db, "equipments")),
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
		setNewEquipment({ ...newEquipment, [e.target.name]: e.target.value });
	};

	const handleAddOrUpdate = async () => {
		try {
			if (editIndex !== null && !restrictUser(userRole)) {
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
			fetchData();
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
			fetchData();
		} catch (error) {
			console.error("Error deleting equipment:", error);
			toast.error("Error deleting equipment.");
		}
	};

	const handleDownloadExcel = async () => {
		try {
			// Convert logo image to Base64
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
			toast.error("Error downloading file.");
		}
	};

	return (
		<div className="p-6 bg-gray-100 min-h-screen">
			<div className="container mx-auto">
				<div className="flex justify-between items-end mb-6">
					<h1 className="text-2xl font-semibold text-gray-800 mb-6">
						Equipment Inventory List
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
					isEditingDisabled={restrictUser(userRole)}
				/>
			</div>
		</div>
	);
};

export default LabEquipments;
