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
		sampleDetails: [
			{
				description: "Chemical Analysis",
				mtcNo: "3456",
				sampleType: "Liquid",
				materialType: "Steel",
				heatNo: "1234",
				condition: "Good",
				testMethods: ["ASTM A123", "ASTM B456"],
			},
			{
				description: "Microbiology Test",
				mtcNo: "3457",
				sampleType: "Solid",
				materialType: "Aluminum",
				heatNo: "5678",
				condition: "Fair",
				testMethods: ["ASTM C123", "ASTM D456"],
			},
		],
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
		sampleDetails: [
			{
				description: "Chemical Analysis",
				mtcNo: "3456",
				sampleType: "Liquid",
				materialType: "Steel",
				heatNo: "1234",
				condition: "Good",
				testMethods: ["ASTM A123", "ASTM B456"],
			},
		],
	},
];

function SubmittedRequestsPage() {
	// State for main data and modal management.
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
		// Create a shallow clone including sampleDetails
		setEditRow({
			...row,
			sampleDetails: row.sampleDetails ? [...row.sampleDetails] : [],
		});
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

	// Handle changes for the main row fields in edit mode.
	const handleChangeEdit = (e) => {
		const { name, value } = e.target;
		setEditRow({ ...editRow, [name]: value });
	};

	// Handle changes in sample details for edit mode.
	const handleDetailChange = (index, e) => {
		const { name, value } = e.target;
		const updatedDetails = [...editRow.sampleDetails];
		// For testMethods, convert comma-separated string into an array.
		updatedDetails[index] = {
			...updatedDetails[index],
			[name]:
				name === "testMethods"
					? value.split(",").map((item) => item.trim())
					: value,
		};
		setEditRow({ ...editRow, sampleDetails: updatedDetails });
	};

	// Add a new empty sample detail row.
	const addDetailRow = () => {
		setEditRow({
			...editRow,
			sampleDetails: [
				...editRow.sampleDetails,
				{
					description: "",
					mtcNo: "",
					sampleType: "",
					materialType: "",
					heatNo: "",
					condition: "",
					testMethods: [],
				},
			],
		});
	};

	// Remove a sample detail row.
	const removeDetailRow = (index) => {
		setEditRow({
			...editRow,
			sampleDetails: editRow.sampleDetails.filter((_, i) => i !== index),
		});
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
							{selectedRow.sampleDetails &&
								selectedRow.sampleDetails.length > 0 && (
									<div className="mt-4">
										<h3 className="font-medium mb-2">Sample Details</h3>
										<table className="w-full border-collapse">
											<thead className="bg-gray-200">
												<tr>
													<th className="p-2 border">Description</th>
													<th className="p-2 border">MTC No</th>
													<th className="p-2 border">Sample Type</th>
													<th className="p-2 border">Material Type</th>
													<th className="p-2 border">Heat No</th>
													<th className="p-2 border">Condition</th>
													<th className="p-2 border">Test Methods</th>
												</tr>
											</thead>
											<tbody>
												{selectedRow.sampleDetails.map((detail, index) => (
													<tr key={index} className="border-b">
														<td className="p-2 border">{detail.description}</td>
														<td className="p-2 border">{detail.mtcNo}</td>
														<td className="p-2 border">{detail.sampleType}</td>
														<td className="p-2 border">
															{detail.materialType}
														</td>
														<td className="p-2 border">{detail.heatNo}</td>
														<td className="p-2 border">{detail.condition}</td>
														<td className="p-2 border">
															{detail.testMethods &&
																detail.testMethods.join(", ")}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
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
							<div>
								<h3 className="font-medium mb-2">Sample Details</h3>
								<table className="w-full border-collapse">
									<thead className="bg-gray-200">
										<tr>
											<th className="p-2 border">Description</th>
											<th className="p-2 border">MTC No</th>
											<th className="p-2 border">Sample Type</th>
											<th className="p-2 border">Material Type</th>
											<th className="p-2 border">Heat No</th>
											<th className="p-2 border">Condition</th>
											<th className="p-2 border">Test Methods</th>
											<th className="p-2 border">Actions</th>
										</tr>
									</thead>
									<tbody>
										{editRow.sampleDetails &&
											editRow.sampleDetails.map((detail, index) => (
												<tr key={index} className="border-b">
													<td className="p-2 border">
														<Input
															name="description"
															value={detail.description}
															onChange={(e) => handleDetailChange(index, e)}
														/>
													</td>
													<td className="p-2 border">
														<Input
															name="mtcNo"
															value={detail.mtcNo}
															onChange={(e) => handleDetailChange(index, e)}
														/>
													</td>
													<td className="p-2 border">
														<Input
															name="sampleType"
															value={detail.sampleType}
															onChange={(e) => handleDetailChange(index, e)}
														/>
													</td>
													<td className="p-2 border">
														<Input
															name="materialType"
															value={detail.materialType}
															onChange={(e) => handleDetailChange(index, e)}
														/>
													</td>
													<td className="p-2 border">
														<Input
															name="heatNo"
															value={detail.heatNo}
															onChange={(e) => handleDetailChange(index, e)}
														/>
													</td>
													<td className="p-2 border">
														<Input
															name="condition"
															value={detail.condition}
															onChange={(e) => handleDetailChange(index, e)}
														/>
													</td>
													<td className="p-2 border">
														<Input
															name="testMethods"
															value={detail.testMethods.join(", ")}
															onChange={(e) => handleDetailChange(index, e)}
														/>
													</td>
													<td className="p-2 border text-center">
														<Button
															variant="outline"
															onClick={() => removeDetailRow(index)}
															className="bg-red-500 text-white hover:bg-red-600">
															Delete
														</Button>
													</td>
												</tr>
											))}
									</tbody>
								</table>
								<Button
									onClick={addDetailRow}
									className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full">
									Add Another Row
								</Button>
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
