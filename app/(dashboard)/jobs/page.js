"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import ReusableSampleLotsTable from "@/components/common/ReusableSlotsTable";
import { getBase64FromUrl } from "@/lib/utils";

const SampleLotsPage = () => {
	// Updated columns for the Job Records Table
	const columns = [
		{ key: "jobId", label: "Job Id" },
		{ key: "projectName", label: "Project Name" },
		{ key: "clientName", label: "Client Name" },
		{ key: "sampleDate", label: "Sample Date" },
		{ key: "noItems", label: "No Items" },
		{ key: "endUser", label: "End User" },
	];

	// Updated sample data with new fields.
	// "sampleDate" is used in place of sampleRecievingDate,
	// "noItems" is computed from sampleDetails.length,
	// and "endUser" is set from the original testedBy field.
	const [data, setData] = useState([
		{
			jobId: "J101",
			projectName: "Project Alpha",
			clientName: "ABC Corp",
			sampleDate: "2024-04-10",
			noItems: 2,
			endUser: "John Doe",
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
			jobId: "J102",
			projectName: "Project Beta",
			clientName: "XYZ Ltd.",
			sampleDate: "2024-04-12",
			noItems: 1,
			endUser: "Jane Smith",
			sampleDetails: [
				{
					description: "Water Quality",
					mtcNo: "3458",
					sampleType: "Liquid",
					materialType: "Copper",
					heatNo: "9876",
					condition: "Damaged",
					testMethods: ["ASTM E123", "ASTM F456"],
				},
			],
		},
	]);

	const [selectedRow, setSelectedRow] = useState(null);
	const [dialogMode, setDialogMode] = useState("preview");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editRow, setEditRow] = useState(null);

	// Open preview dialog
	const handlePreview = (row) => {
		setSelectedRow(row);
		setDialogMode("preview");
		setIsDialogOpen(true);
	};

	// Open edit dialog by cloning the selected row (including sampleDetails)
	const handleEdit = (row) => {
		setSelectedRow(row);
		setEditRow({
			...row,
			sampleDetails: row.sampleDetails ? [...row.sampleDetails] : [],
		});
		setDialogMode("edit");
		setIsDialogOpen(true);
	};

	const handleDelete = (row) => {
		setData(data.filter((item) => item.jobId !== row.jobId));
	};

	// Row-specific Excel download callback remains unchanged except for field names.
	const handleDownload = async (row) => {
		try {
			const dataUrl = await getBase64FromUrl("/logo.png");
			const base64String = dataUrl.split("base64,")[1];
			const rightLogoUrl = await getBase64FromUrl("/ias_logo.jpg");
			const rightLogoBase64String = rightLogoUrl.split("base64,")[1];
			const payload = {
				fileName: `Sample_${row.jobId}.xlsx`,
				logoBase64: base64String,
				rightLogoBase64: rightLogoBase64String,
				sampleInfo: {
					jobId: row.jobId,
					projectName: row.projectName,
					clientName: row.clientName,
					sampleDate: row.sampleDate,
					noItems: row.noItems,
					endUser: row.endUser,
				},
				sampleDetails: row.sampleDetails || [],
			};

			const response = await fetch("/api/sample-export-excel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) throw new Error("Failed to download Excel file");

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = payload.fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} catch (error) {
			console.error("Error downloading Excel file:", error);
		}
	};

	// Handle changes in edit mode; update the editRow state
	const handleChangeEdit = (e) => {
		const { name, value } = e.target;
		setEditRow({ ...editRow, [name]: value });
	};

	// Handle changes in sample details rows during edit
	const handleDetailChange = (index, e) => {
		const { name, value } = e.target;
		const updatedDetails = [...editRow.sampleDetails];
		updatedDetails[index] = { ...updatedDetails[index], [name]: value };
		setEditRow({ ...editRow, sampleDetails: updatedDetails });
	};

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

	const removeDetailRow = (index) => {
		setEditRow({
			...editRow,
			sampleDetails: editRow.sampleDetails.filter((_, i) => i !== index),
		});
	};

	// Save edit changes and update noItems based on the sampleDetails array length
	const handleSaveEdit = () => {
		const updatedEditRow = {
			...editRow,
			noItems: editRow.sampleDetails ? editRow.sampleDetails.length : 0,
		};
		setData(
			data.map((item) =>
				item.jobId === updatedEditRow.jobId ? updatedEditRow : item
			)
		);
		setIsDialogOpen(false);
	};

	return (
		<div className="p-6 bg-gray-100 min-h-screen">
			<div className="m-auto w-7xl">
				<h1 className="text-2xl font-semibold text-gray-800 mb-6">
					Job Records
				</h1>

				<ReusableSampleLotsTable
					columns={columns}
					data={data}
					onPreview={handlePreview}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onDownload={handleDownload}
				/>
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="p-6 !max-w-3xl mx-auto">
					<DialogTitle className="text-center text-xl font-bold mb-4">
						{dialogMode === "preview"
							? "Preview Job Record"
							: "Edit Job Record"}
					</DialogTitle>

					{dialogMode === "preview" && selectedRow && (
						<div className="space-y-4">
							{columns.map((col) => (
								<div key={col.key} className="flex justify-between">
									<span className="font-medium">{col.label}:</span>
									<span>{selectedRow[col.key]}</span>
								</div>
							))}

							{selectedRow.sampleDetails?.length > 0 && (
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
													<td className="p-2 border">{detail.materialType}</td>
													<td className="p-2 border">{detail.heatNo}</td>
													<td className="p-2 border">{detail.condition}</td>
													<td className="p-2 border">
														{detail.testMethods?.join(", ")}
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
								{columns.map((col) =>
									col.key !== "noItems" ? ( // Skip editing noItems manually
										<div key={col.key} className="flex flex-col">
											<label className="font-medium">{col.label}:</label>
											<Input
												name={col.key}
												value={editRow[col.key]}
												onChange={handleChangeEdit}
											/>
										</div>
									) : null
								)}
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
										{editRow.sampleDetails.map((detail, index) => (
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
														value={detail.testMethods?.join(", ")}
														onChange={(e) => {
															// Convert comma-separated string into an array
															const updatedValue = e.target.value
																.split(",")
																.map((item) => item.trim());
															handleDetailChange(index, {
																target: {
																	name: "testMethods",
																	value: updatedValue,
																},
															});
														}}
													/>
												</td>
												<td className="p-2 border text-center">
													<Button
														variant="outline"
														onClick={() => removeDetailRow(index)}
														className="bg-red-500 text-white hover:bg-red-600">
														<Trash className="w-4 h-4" />
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
									className="bg-green-600 hover:bg-green-700 text-white"
									onClick={handleSaveEdit}>
									Save Changes
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default SampleLotsPage;
