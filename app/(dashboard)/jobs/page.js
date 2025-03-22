"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash } from "lucide-react";
import ReusableSampleLotsTable from "@/components/common/ReusableSlotsTable";
import { getBase64FromUrl } from "@/lib/utils";
import { toast } from "sonner";
import { IASLogo } from "@/components/common/IASLogo";

const SampleLotsPage = () => {
	// Table columns – these keys should exist at the top level of each job record.
	const columns = [
		{ key: "jobId", label: "Job Id" },
		{ key: "projectName", label: "Project Name" },
		{ key: "clientName", label: "Client Name" },
		{ key: "sampleDate", label: "Sample Date" },
		{ key: "noItems", label: "No Items" },
		{ key: "endUser", label: "End User" },
	];

	const [data, setData] = useState([]);
	const [selectedRow, setSelectedRow] = useState(null);
	const [dialogMode, setDialogMode] = useState("preview");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editRow, setEditRow] = useState(null);

	// Fetch job records from the API and flatten the nested sample object.
	const fetchJobs = async () => {
		try {
			const res = await fetch("/api/jobs", { method: "GET" });
			const json = await res.json();
			if (res.ok) {
				// Flatten each job by merging the top-level "sample" fields.
				const flattenedJobs = json.jobs.map((job) => {
					const sample = job.sample || {};
					return {
						id: job.id,
						jobId: sample.jobId,
						projectName: sample.projectName,
						clientName: sample.clientName,
						sampleDate: sample.receiveDate, // using receiveDate as sample date
						noItems: job.sampleDetails ? job.sampleDetails.length : 0,
						endUser: sample.endUser,
						sampleDetails: job.sampleDetails,
						// Optionally include other fields if needed
					};
				});
				setData(flattenedJobs);
			} else {
				toast.error(json.error || "Failed to fetch jobs");
			}
		} catch (error) {
			console.error("Error fetching jobs:", error);
			toast.error("Error fetching jobs.");
		}
	};

	useEffect(() => {
		fetchJobs();
	}, []);

	// Open preview dialog
	const handlePreview = (row) => {
		setSelectedRow(row);
		setDialogMode("preview");
		setIsDialogOpen(true);
	};

	// Open edit dialog (clone row)
	const handleEdit = (row) => {
		setSelectedRow(row);
		setEditRow({
			...row,
			sampleDetails: row.sampleDetails ? [...row.sampleDetails] : [],
		});
		setDialogMode("edit");
		setIsDialogOpen(true);
	};

	// Call API to delete a job and refresh the list
	const handleDelete = async (row) => {
		try {
			const res = await fetch(`/api/jobs/${row.id}`, { method: "DELETE" });
			const json = await res.json();
			if (res.ok) {
				toast.success("Job deleted successfully");
				fetchJobs();
			} else {
				toast.error(json.error || "Failed to delete job");
			}
		} catch (error) {
			console.error("Error deleting job:", error);
			toast.error("Error deleting job.");
		}
	};

	console.log("data", data);

	// Row-specific Excel download callback remains unchanged.
	const handleDownload = async (row) => {
		try {
			const dataUrl = await getBase64FromUrl("/logo.jpg");
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
				sampleDetails: (row.sampleDetails || []).map((detail) => ({
					...detail,
					testMethods: detail.testMethods
						? detail.testMethods.map((method) => method.test_name).join(", ")
						: "",
				})),
			};

			console.log("payload", payload);

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

	// Handle changes in edit mode; update the editRow state.
	const handleChangeEdit = (e) => {
		const { name, value } = e.target;
		setEditRow({ ...editRow, [name]: value });
	};

	// Save changes in edit mode by calling the API endpoint for update.
	const handleSaveEdit = async () => {
		try {
			const res = await fetch(`/api/jobs/${editRow.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editRow),
			});
			const json = await res.json();
			if (res.ok) {
				toast.success("Job updated successfully");
				setIsDialogOpen(false);
				fetchJobs();
			} else {
				toast.error(json.error || "Failed to update job");
			}
		} catch (error) {
			console.error("Error updating job:", error);
			toast.error("Error updating job.");
		}
	};

	// Handle changes in sample details rows during edit mode.
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

	return (
		<div className="p-6 bg-gray-100 min-h-screen">
			<div className="mx-auto container">
				<div className="flex justify-between items-end mb-6">
					<h1 className="text-2xl font-semibold text-gray-800 mb-6">
						Job Records
					</h1>
					<IASLogo />
				</div>
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
														{detail.testMethods
															?.map((tm) => tm.test_name)
															.join(", ")}
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
									col.key !== "noItems" ? (
										<div key={col.key} className="flex flex-col">
											<label className="font-medium">{col.label}:</label>
											<Input
												name={col.key}
												value={editRow[col.key] || ""}
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
														value={detail.testMethods
															?.map((tm) => tm.test_name)
															.join(", ")}
														onChange={(e) => {
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
									<Plus className="w-4 h-4 mr-2" /> Add Another Row
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
