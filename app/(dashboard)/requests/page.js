"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import ReusableSampleLotsTable from "@/components/common/ReusableSlotsTable";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import SpecimenIdInput from "@/components/common/SpecimenIdInput";

// Define the table columns for the main list.
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

// Helper function to create a default row.
const getDefaultRow = () => ({
	itemNo: "", // index (as string) corresponding to a sample detail item
	itemDescription: "",
	testMethod: "",
	heatNo: "",
	dimensionSpec: "",
	noOfSamples: "",
	noOfSpecimen: "",
	specimenIds: [],
	plannedTestDate: "",
	requestBy: "",
	remarks: "",
	availableTestMethods: [],
});

function SubmittedRequestsPage() {
	// data state holds the flattened testing request objects for the main table.
	const [data, setData] = useState([]);
	// The raw testing request object for preview/edit is stored here.
	const [selectedRow, setSelectedRow] = useState(null);
	const [dialogMode, setDialogMode] = useState("preview");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	// editRow holds the full testing request object for editing.
	const [editRow, setEditRow] = useState(null);
	// Also maintain jobs so that we can look up job details if needed.
	const [jobs, setJobs] = useState([]);

	// Fetch jobs on mount.
	useEffect(() => {
		const fetchJobs = async () => {
			try {
				const res = await fetch("/api/jobs/");
				const data = await res.json();
				if (data.success) {
					setJobs(data.jobs);
				} else {
					toast.error(data.error || "Failed to fetch jobs");
				}
			} catch (err) {
				console.error("Failed to fetch jobs:", err);
				toast.error("Failed to fetch jobs");
			}
		};
		fetchJobs();
	}, []);

	// Fetch and map testing requests on mount.
	useEffect(() => {
		const fetchTestingRequests = async () => {
			try {
				const res = await fetch("/api/testing-requests/");
				const result = await res.json();
				if (result.success) {
					const mappedData = result.testingRequests.map((item) => {
						const totalSamples = item.rows.reduce(
							(sum, r) => sum + (Number(r.noOfSamples) || 0),
							0
						);
						const requestDate = new Date(item.createdAt).toLocaleDateString();
						const plannedTestDate =
							item.rows.length > 0 ? item.rows[0].plannedTestDate : "";
						return {
							id: item.id,
							jobAssigned: item.jobId,
							requestNumber: item.requestId,
							requestDate,
							client: item.clientName,
							project: item.projectName,
							totalSamples,
							plannedTestDate,
							requestBy: item.rows[0]?.requestBy || "",
							remarks: item.rows[0]?.remarks || "",
							raw: item, // store full object for preview/edit
						};
					});
					setData(mappedData);
				} else {
					console.error("Error fetching testing requests:", result.error);
				}
			} catch (error) {
				console.error("Error fetching testing requests:", error);
			}
		};
		fetchTestingRequests();
	}, []);

	// Helper: Look up a job from our jobs state based on jobId.
	const getJobById = (jobId) => {
		return jobs.find((job) => job.sample?.jobId === jobId);
	};

	// Preview mode handler.
	const handlePreview = (row) => {
		// Attach job details to the raw object.
		const job = getJobById(row.raw.jobId);
		setSelectedRow({ ...row.raw, testingJob: job });
		setDialogMode("preview");
		setIsDialogOpen(true);
	};

	// Edit mode handler.
	const handleEdit = (row) => {
		const job = getJobById(row.raw.jobId);
		setSelectedRow({ ...row.raw, testingJob: job });
		setEditRow({ ...row.raw, testingJob: job });
		setDialogMode("edit");
		setIsDialogOpen(true);
	};

	// Delete handler.
	const handleDelete = async (row) => {
		try {
			const res = await fetch(`/api/testing-requests/${row.id}`, {
				method: "DELETE",
			});
			const result = await res.json();
			if (result.success) {
				setData(data.filter((item) => item.id !== row.id));
			} else {
				console.error("Error deleting testing request:", result.error);
			}
		} catch (error) {
			console.error("Error deleting testing request:", error);
		}
	};

	// Download handler (stub).
	const handleDownload = (row) => {
		console.log("Download:", row);
	};

	// --- Edit Modal Functions for Rows ---
	const handleRowChange = (index, field, value) => {
		const newRows = [...editRow.rows];
		newRows[index][field] = value;
		if (field === "itemNo" && editRow.testingJob) {
			const sampleDetails = editRow.testingJob.sampleDetails || [];
			const sampleItem = sampleDetails.find((_, idx) => String(idx) === value);
			if (sampleItem) {
				newRows[index].itemDescription = sampleItem.description;
				newRows[index].heatNo = sampleItem.heatNo;
				newRows[index].availableTestMethods = sampleItem.testMethods.map(
					(method) => method.test_name
				);
				newRows[index].testMethod = "";
			} else {
				newRows[index].itemDescription = "";
				newRows[index].heatNo = "";
				newRows[index].availableTestMethods = [];
				newRows[index].testMethod = "";
			}
		}
		setEditRow({ ...editRow, rows: newRows });
	};

	const handleSpecimenIdsChange = (index, newSpecimenIds) => {
		const newRows = [...editRow.rows];
		newRows[index].specimenIds = newSpecimenIds;
		setEditRow({ ...editRow, rows: newRows });
	};

	const handleAddRow = () => {
		setEditRow({ ...editRow, rows: [...editRow.rows, getDefaultRow()] });
	};

	const handleRemoveRow = (index) => {
		if (editRow.rows.length > 1) {
			const newRows = [...editRow.rows];
			newRows.splice(index, 1);
			setEditRow({ ...editRow, rows: newRows });
		}
	};

	// Save updated testing request.
	const handleSaveEdit = async () => {
		try {
			const res = await fetch(`/api/testing-requests/${editRow.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editRow),
			});
			const result = await res.json();
			if (result.success) {
				setData(
					data.map((item) =>
						item.id === editRow.id ? { ...item, raw: editRow } : item
					)
				);
				setIsDialogOpen(false);
				toast.success("Testing request updated successfully");
			} else {
				console.error("Error updating testing request:", result.error);
			}
		} catch (error) {
			console.error("Error updating testing request:", error);
		}
	};

	// --- Render Helper for Test Methods ---
	const renderTestMethods = (testMethods) => {
		if (!testMethods) return "";
		if (Array.isArray(testMethods)) {
			if (typeof testMethods[0] === "object") {
				return testMethods.map((tm) => tm.test_name).join(", ");
			}
			return testMethods.join(", ");
		}
		return testMethods;
	};

	return (
		<div className="container mx-auto p-4 sm:p-6 lg:p-8">
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
				<DialogContent className="p-4 sm:p-6 lg:p-8 !max-w-5xl mx-auto">
					<DialogTitle className="text-center text-xl font-bold mb-4">
						{dialogMode === "preview" ? "Preview Request" : "Edit Request"}
					</DialogTitle>

					{/* Preview Modal */}
					{dialogMode === "preview" && selectedRow && (
						<div className="space-y-6">
							<h3 className="text-xl font-bold mb-2">Main Request Details</h3>
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<tbody>
										<tr className="border-b">
											<td className="p-2 font-medium">Job Assigned</td>
											<td className="p-2">{selectedRow.jobId}</td>
										</tr>
										<tr className="border-b">
											<td className="p-2 font-medium">Request #</td>
											<td className="p-2">{selectedRow.requestId}</td>
										</tr>
										<tr className="border-b">
											<td className="p-2 font-medium">Request Date</td>
											<td className="p-2">
												{new Date(selectedRow.createdAt).toLocaleDateString()}
											</td>
										</tr>
										<tr className="border-b">
											<td className="p-2 font-medium">Client</td>
											<td className="p-2">{selectedRow.clientName}</td>
										</tr>
										<tr className="border-b">
											<td className="p-2 font-medium">Project</td>
											<td className="p-2">{selectedRow.projectName}</td>
										</tr>
										<tr className="border-b">
											<td className="p-2 font-medium">Total Samples</td>
											<td className="p-2">
												{selectedRow.rows.reduce(
													(sum, r) => sum + (Number(r.noOfSamples) || 0),
													0
												)}
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							{selectedRow.rows && selectedRow.rows.length > 0 && (
								<div className="mt-6 overflow-x-auto">
									<h3 className="text-xl font-bold mb-2">Sample Details</h3>
									<table className="w-full border-collapse">
										<thead className="bg-gray-200">
											<tr>
												<TableHead className="p-2 border">
													Description
												</TableHead>
												<TableHead className="p-2 border">MTC No</TableHead>
												<TableHead className="p-2 border">
													Sample Type
												</TableHead>
												<TableHead className="p-2 border">
													Material Type
												</TableHead>
												<TableHead className="p-2 border">Heat No</TableHead>
												<TableHead className="p-2 border">Condition</TableHead>
												<TableHead className="p-2 border">
													Test Methods
												</TableHead>
												<TableHead className="p-2 border">
													Planned Test Date
												</TableHead>
												<TableHead className="p-2 border">Request By</TableHead>
												<TableHead className="p-2 border">Remarks</TableHead>
											</tr>
										</thead>
										<tbody>
											{selectedRow.rows.map((detail, index) => (
												<tr key={index} className="border-b">
													<td className="p-2 border">
														{detail.itemDescription}
													</td>
													<td className="p-2 border">{detail.mtcNo}</td>
													<td className="p-2 border">{detail.sampleType}</td>
													<td className="p-2 border">{detail.materialType}</td>
													<td className="p-2 border">{detail.heatNo}</td>
													<td className="p-2 border">{detail.condition}</td>
													<td className="p-2 border">
														{renderTestMethods(detail.testMethods)}
													</td>
													<td className="p-2 border">
														{detail.plannedTestDate || ""}
													</td>
													<td className="p-2 border">
														{detail.requestBy || ""}
													</td>
													<td className="p-2 border">{detail.remarks || ""}</td>
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

					{/* Edit Modal */}
					{dialogMode === "edit" && editRow && (
						<div className="space-y-6">
							{/* Job Info (read-only) */}
							<div className="mb-4">
								<Label className="block font-medium mb-1">Job ID:</Label>
								<Input value={editRow.jobId} readOnly className="bg-gray-100" />
							</div>
							<div className="mb-4">
								<Label className="block font-medium mb-1">Project Name:</Label>
								<Input
									value={editRow.projectName}
									readOnly
									className="bg-gray-100"
								/>
							</div>

							{/* Editable Rows */}
							{editRow.rows && editRow.rows.length > 0 && (
								<ScrollArea className="w-full max-w-4xl mx-auto">
									<div className="overflow-x-auto mb-4">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Item No.</TableHead>
													<TableHead>Item Description</TableHead>
													<TableHead>Test Method</TableHead>
													<TableHead>Heat #</TableHead>
													<TableHead>
														Dimension/Spec &amp; Specimen Location
													</TableHead>
													<TableHead>No of Samples</TableHead>
													<TableHead>No of Specimen</TableHead>
													<TableHead>Assign Specimen ID</TableHead>
													<TableHead>Planned Test Date</TableHead>
													<TableHead>Request By</TableHead>
													<TableHead>Remarks</TableHead>
													<TableHead>Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{editRow.rows.map((row, index) => (
													<TableRow key={index}>
														{/* Item No. Selection */}
														<TableCell>
															<Select
																value={row.itemNo}
																onValueChange={(value) =>
																	handleRowChange(index, "itemNo", value)
																}>
																<SelectTrigger className="w-full">
																	<SelectValue placeholder="Select Item" />
																</SelectTrigger>
																<SelectContent>
																	{editRow.testingJob?.sampleDetails?.map(
																		(item, idx) => (
																			<SelectItem key={idx} value={String(idx)}>
																				{item.itemNo || `Item ${idx + 1}`}
																			</SelectItem>
																		)
																	)}
																</SelectContent>
															</Select>
														</TableCell>
														{/* Item Description (read-only) */}
														<TableCell>
															<Input
																value={row.itemDescription}
																readOnly
																className="bg-gray-100"
															/>
														</TableCell>
														{/* Test Method dropdown */}
														<TableCell>
															<Select
																value={row.testMethod}
																onValueChange={(value) =>
																	handleRowChange(index, "testMethod", value)
																}
																disabled={
																	!row.availableTestMethods ||
																	row.availableTestMethods.length === 0
																}>
																<SelectTrigger className="w-full">
																	<SelectValue placeholder="Select Test Method" />
																</SelectTrigger>
																<SelectContent>
																	{row.availableTestMethods?.map(
																		(method, idx) => (
																			<SelectItem key={idx} value={method}>
																				{method}
																			</SelectItem>
																		)
																	)}
																</SelectContent>
															</Select>
														</TableCell>
														{/* Heat # (read-only) */}
														<TableCell>
															<Input
																value={row.heatNo}
																readOnly
																className="bg-gray-100"
															/>
														</TableCell>
														{/* Dimension/Spec & Specimen Location */}
														<TableCell>
															<Input
																value={row.dimensionSpec}
																onChange={(e) =>
																	handleRowChange(
																		index,
																		"dimensionSpec",
																		e.target.value
																	)
																}
															/>
														</TableCell>
														{/* No of Samples */}
														<TableCell>
															<Input
																type="number"
																value={row.noOfSamples}
																onChange={(e) =>
																	handleRowChange(
																		index,
																		"noOfSamples",
																		e.target.value
																	)
																}
															/>
														</TableCell>
														{/* No of Specimen */}
														<TableCell>
															<Input
																type="number"
																value={row.noOfSpecimen}
																onChange={(e) =>
																	handleRowChange(
																		index,
																		"noOfSpecimen",
																		e.target.value
																	)
																}
															/>
														</TableCell>
														{/* Assign Specimen ID (disabled) */}
														<TableCell>
															<SpecimenIdInput
																specimenIds={row.specimenIds}
																setSpecimenIds={(ids) =>
																	handleSpecimenIdsChange(index, ids)
																}
																maxSpecimenCount={
																	parseInt(row.noOfSpecimen, 10) || 0
																}
																disabled={true}
															/>
														</TableCell>
														{/* Planned Test Date */}
														<TableCell>
															<Input
																type="date"
																value={row.plannedTestDate}
																onChange={(e) =>
																	handleRowChange(
																		index,
																		"plannedTestDate",
																		e.target.value
																	)
																}
															/>
														</TableCell>
														{/* Request By */}
														<TableCell>
															<Input
																value={row.requestBy}
																onChange={(e) =>
																	handleRowChange(
																		index,
																		"requestBy",
																		e.target.value
																	)
																}
															/>
														</TableCell>
														{/* Remarks */}
														<TableCell>
															<Textarea
																value={row.remarks}
																onChange={(e) =>
																	handleRowChange(
																		index,
																		"remarks",
																		e.target.value
																	)
																}
															/>
														</TableCell>
														{/* Actions */}
														<TableCell>
															<Button
																type="button"
																onClick={() => handleRemoveRow(index)}
																disabled={editRow.rows.length === 1}
																variant="destructive">
																Remove
															</Button>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
									<ScrollBar orientation="horizontal" />
								</ScrollArea>
							)}
							<div className="mb-4">
								<Button type="button" onClick={handleAddRow} className="w-full">
									Add Row
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
