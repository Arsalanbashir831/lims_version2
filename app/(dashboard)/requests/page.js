"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ReusableSampleLotsTable from "@/components/common/ReusableSlotsTable";
import { Eye, Pencil, Trash, Download } from "lucide-react";

const columns = [
	{ key: "jobAssigned", label: "Job Assigned #" },
	{ key: "requestNumber", label: "Request #" },
	{ key: "requestDate", label: "Request Date" },
	{ key: "client", label: "Client" },
	{ key: "project", label: "Project" },
	{ key: "totalSamples", label: "Total no of Samples" },
	{ key: "plannedTestDate", label: "Planned Test Date" },
	{ key: "requestBy", label: "Request By" },
	{ key: "remarks", label: "Remarks" },
];

const initialSampleRequests = [
	{
		jobAssigned: "J101",
		requestNumber: "REQ001",
		requestDate: "2024-04-11",
		client: "ABC Corp",
		project: "Project Alpha",
		totalSamples: 5,
		plannedTestDate: "2024-04-15",
		requestBy: "John Doe",
		remarks: "Urgent",
	},
	{
		jobAssigned: "J102",
		requestNumber: "REQ002",
		requestDate: "2024-04-12",
		client: "XYZ Ltd.",
		project: "Project Beta",
		totalSamples: 2,
		plannedTestDate: "2024-04-18",
		requestBy: "Jane Smith",
		remarks: "",
	},
];

function SubmittedRequestsPage() {
	// Use state for the data so that delete/edit actions update the table.
	const [data, setData] = useState(initialSampleRequests);
	const [selectedRow, setSelectedRow] = useState(null);
	const [dialogMode, setDialogMode] = useState("preview");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editRow, setEditRow] = useState(null);

	// Preview: Open dialog in preview mode.
	const handlePreview = (row) => {
		setSelectedRow(row);
		setDialogMode("preview");
		setIsDialogOpen(true);
	};

	// Edit: Clone the row for editing.
	const handleEdit = (row) => {
		setSelectedRow(row);
		setEditRow({ ...row });
		setDialogMode("edit");
		setIsDialogOpen(true);
	};

	// Delete: Remove the row by filtering out based on unique requestNumber.
	const handleDelete = (row) => {
		setData(data.filter((item) => item.requestNumber !== row.requestNumber));
	};

	// Download: Stub callback; replace with your own logic.
	const handleDownload = (row) => {
		console.log("Download:", row);
	};

	// Handle input changes in the edit modal.
	const handleChangeEdit = (e) => {
		const { name, value } = e.target;
		setEditRow({ ...editRow, [name]: value });
	};

	// Save the edit changes to the data.
	const handleSaveEdit = () => {
		const updatedRow = editRow;
		setData(
			data.map((item) =>
				item.requestNumber === updatedRow.requestNumber ? updatedRow : item
			)
		);
		setIsDialogOpen(false);
	};

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">
				Sample and Testing Request Database
			</h1>
			<ReusableSampleLotsTable
				columns={columns}
				data={data}
				onPreview={handlePreview}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onDownload={handleDownload}
			/>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="p-6 !max-w-3xl mx-auto">
					<DialogTitle className="text-center text-xl font-bold mb-4">
						{dialogMode === "preview" ? "Preview Request" : "Edit Request"}
					</DialogTitle>

					{dialogMode === "preview" && selectedRow && (
						<div className="space-y-4">
							{columns.map((col) => (
								<div key={col.key} className="flex justify-between">
									<span className="font-medium">{col.label}:</span>
									<span>{selectedRow[col.key]}</span>
								</div>
							))}
							<div className="flex justify-end mt-4">
								<Button onClick={() => setIsDialogOpen(false)}>Close</Button>
							</div>
						</div>
					)}

					{dialogMode === "edit" && editRow && (
						<div className="space-y-6">
							<div className="grid grid-cols-2 gap-4">
								{columns.map((col) => (
									<div key={col.key} className="flex flex-col">
										<label className="font-medium">{col.label}:</label>
										<Input
											name={col.key}
											value={editRow[col.key]}
											onChange={handleChangeEdit}
										/>
									</div>
								))}
							</div>
							<div className="flex justify-end mt-4 gap-2">
								<Button
									variant="outline"
									onClick={() => setIsDialogOpen(false)}>
									Cancel
								</Button>
								<Button
									onClick={handleSaveEdit}
									className="bg-green-600 hover:bg-green-700 text-white">
									Save Changes
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default SubmittedRequestsPage;
