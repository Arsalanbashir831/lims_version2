"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { testMethods } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { fileToBase64 } from "@/lib/utils";

// Certificate fields (including fields from the table: mtcNo and testMethod)
const certificateFields = [
	{ key: "dateOfSampling", label: "Date of Sampling", type: "date" },
	{ key: "dateOfTesting", label: "Date of Testing", type: "date" },
	{ key: "issueDate", label: "Issue Date", type: "date" },
	{ key: "gripcoRefNo", label: "Gripco Ref No", type: "text" },
	{ key: "revisionNo", label: "Revision No", type: "text" },
	{ key: "clientNameCert", label: "Client Name", type: "text" },
	{ key: "poNumber", label: "PO #", type: "text" },
	{ key: "customerNameNo", label: "Customer’s Name & no.", type: "text" },
	{ key: "attn", label: "Atten", type: "text" },
	{ key: "customerPO", label: "CUSTOMER PO (ALNASSAR)", type: "text" },
	{ key: "projectNameCert", label: "Project Name", type: "text" },
	{ key: "labName", label: "Name of Laboratory", type: "text" },
	{ key: "labAddress", label: "Address", type: "text" },
	{ key: "sampleDescription", label: "Sample Description", type: "text" },
	{ key: "materialGrade", label: "Material Grade", type: "text" },
	{ key: "temperature", label: "Temperature", type: "text" },
	{ key: "humidity", label: "Humidity", type: "text" },
	{ key: "samplePrepMethod", label: "Sample preparation method", type: "text" },
	{ key: "testEquipment", label: "Test Equipment", type: "text" },
	{ key: "mtcNo", label: "MTC No.", type: "text" },
	{ key: "testMethod", label: "Test Method", type: "text" },
];

function StepwiseForm() {
	const [requests, setRequests] = useState([]);
	const [selectedRequest, setSelectedRequest] = useState(null);
	// Global state for all input fields (for images, store { file, previewUrl })
	const [formValues, setFormValues] = useState({});

	// Fetch the API data on mount.
	useEffect(() => {
		fetch("/api/testing-requests")
			.then((res) => res.json())
			.then((data) => setRequests(data.testingRequests))
			.catch((err) => console.error("Error fetching requests", err));
	}, []);

	// Memoized input change handler.
	const handleInputChange = useCallback((key, value) => {
		setFormValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	const handleRequestChange = useCallback(
		(value) => {
			const req = requests.find((r) => r.requestId === value);
			setSelectedRequest(req);
		},
		[requests]
	);

	// Get certificate field value.
	// For row-specific fields (sampleDescription, dateOfTesting, mtcNo, testMethod) we use the first row's values in the group.
	const getCertificateFieldValue = useCallback(
		(field, groupKey, groupRows = []) => {
			const keyName = `cert-${groupKey}-${field.key}`;
			if (formValues[keyName] !== undefined) {
				return formValues[keyName];
			}
			if (selectedRequest) {
				if (field.key === "dateOfSampling" && selectedRequest.sampleDate) {
					return selectedRequest.sampleDate.split("T")[0];
				}
				if (field.key === "clientNameCert" && selectedRequest.clientName) {
					return selectedRequest.clientName;
				}
				if (field.key === "projectNameCert" && selectedRequest.projectName) {
					return selectedRequest.projectName;
				}
				if (field.key === "gripcoRefNo" && selectedRequest.jobId) {
					return selectedRequest.jobId;
				}
				if (field.key === "labName") {
					return "GLOBAL RESOURCE INSPECTION CONTRACTING COMPANY-DAMMAM";
				}
				if (field.key === "labAddress") {
					return "2817 KING FAHAD IBN ABDULAZIZ, 9062 ASH SHIFA DIST.32236, DAMMAM, KINGDOM OF SAUDI ARABIA";
				}
				if (field.key === "sampleDescription" && groupRows.length > 0) {
					return groupRows[0].itemDescription || "";
				}
				if (field.key === "dateOfTesting" && groupRows.length > 0) {
					return groupRows[0].plannedTestDate || "";
				}
				if (field.key === "mtcNo" && groupRows.length > 0) {
					return groupRows[0].mtcNo || "";
				}
				if (field.key === "testMethod" && groupRows.length > 0) {
					return groupRows[0].testMethod || "";
				}
			}
			return "";
		},
		[formValues, selectedRequest]
	);

	// Render certificate details for a test method group.
	// Receives groupRows as second parameter.
	const renderCertificateDetails = useCallback(
		(groupKey, groupRows) => {
			return (
				<div className="mb-4 p-4 border rounded shadow-sm bg-gray-50">
					<h3 className="text-lg font-bold mb-3">Test Certificate Details</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{certificateFields.map((field) => {
							const keyName = `cert-${groupKey}-${field.key}`;
							const value = getCertificateFieldValue(
								field,
								groupKey,
								groupRows
							);
							return (
								<div key={keyName} className="flex flex-col">
									<label className="text-sm font-medium text-gray-700">
										{field.label}
									</label>
									<Input
										type={field.type}
										value={value}
										placeholder={field.label}
										onChange={(e) => handleInputChange(keyName, e.target.value)}
										className="w-full"
									/>
								</div>
							);
						})}
					</div>
				</div>
			);
		},
		[getCertificateFieldValue, handleInputChange]
	);

	// Render footer inputs for each group.
	const renderFooterInputs = useCallback(
		(groupKey) => {
			return (
				<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700">
							Tested by
						</label>
						<Input
							value={formValues[`cert-${groupKey}-testedBy`] || ""}
							placeholder="Tested by"
							onChange={(e) =>
								handleInputChange(`cert-${groupKey}-testedBy`, e.target.value)
							}
						/>
					</div>
					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700">
							Witnessed by
						</label>
						<Input
							value={formValues[`cert-${groupKey}-witnessedBy`] || ""}
							placeholder="Witnessed by"
							onChange={(e) =>
								handleInputChange(
									`cert-${groupKey}-witnessedBy`,
									e.target.value
								)
							}
						/>
					</div>
				</div>
			);
		},
		[formValues, handleInputChange]
	);

	// Group rows by test method.
	const groupedRows = useMemo(() => {
		if (!selectedRequest) return {};
		return selectedRequest.rows.reduce((acc, row) => {
			const method = row.testMethod;
			if (!acc[method]) acc[method] = [];
			acc[method].push(row);
			return acc;
		}, {});
	}, [selectedRequest]);

	// Render table of test methods per group.
	const renderTestMethodTables = useMemo(() => {
		if (!selectedRequest) return null;
		return Object.entries(groupedRows).map(([methodName, rows], groupIndex) => {
			const testDefinition = testMethods.find(
				(item) => item.test_name === methodName
			);
			if (!testDefinition) return null;
			const groupKey = `group-${groupIndex}-${methodName}`;
			return (
				<Card key={groupKey} className="mb-6 shadow-sm">
					<CardHeader>
						<CardTitle>{methodName}</CardTitle>
					</CardHeader>
					<CardContent>
						{renderCertificateDetails(groupKey, rows)}
						<ScrollArea className="w-full max-w-4xl mx-auto">
							<div className="overflow-x-auto mb-4">
								<Table>
									<TableHeader>
										<TableRow>
											{testDefinition.test_columns.map((col) => (
												<TableHead key={col}>{col}</TableHead>
											))}
										</TableRow>
									</TableHeader>
									<TableBody>
										{rows.map((row, rowIndex) => (
											<TableRow key={rowIndex}>
												{testDefinition.test_columns.map((col) => {
													const fieldKey = `${groupKey}-${rowIndex}-${col}`;
													let initialValue = formValues[fieldKey];
													if (initialValue === undefined) {
														if (col.toLowerCase() === "mtc no") {
															initialValue = row.mtcNo || "";
														} else if (col.toLowerCase() === "test method") {
															initialValue = row.testMethod || "";
														} else {
															const apiKey = Object.keys(row).find(
																(key) =>
																	key.toLowerCase() ===
																	col.replace(/ /g, "").toLowerCase()
															);
															initialValue = row[apiKey] || "";
														}
													}
													if (col.toLowerCase() === "images") {
														return (
															<TableCell key={col}>
																<div className="relative w-full h-24">
																	{formValues[fieldKey] &&
																	formValues[fieldKey].previewUrl ? (
																		<img
																			src={formValues[fieldKey].previewUrl}
																			alt="Preview"
																			className="absolute top-0 left-0 h-full w-full object-contain border rounded"
																		/>
																	) : (
																		<div className="absolute top-0 left-0 h-full w-full flex items-center justify-center text-gray-400 border rounded">
																			No Image
																		</div>
																	)}
																	<input
																		type="file"
																		accept="image/*"
																		onChange={async (e) => {
																			const file = e.target.files[0];
																			if (file) {
																				const base64Data = await fileToBase64(
																					file
																				);
																				// Instead of storing previewUrl only, store the base64 data:
																				handleInputChange(fieldKey, {
																					base64: base64Data,
																				});
																			}
																		}}
																		className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
																	/>
																</div>
															</TableCell>
														);
													} else {
														return (
															<TableCell key={col}>
																<Input
																	value={initialValue}
																	onChange={(e) =>
																		handleInputChange(fieldKey, e.target.value)
																	}
																	placeholder={col}
																	className="w-full"
																/>
															</TableCell>
														);
													}
												})}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
						{renderFooterInputs(groupKey)}
					</CardContent>
				</Card>
			);
		});
	}, [
		selectedRequest,
		groupedRows,
		formValues,
		renderCertificateDetails,
		renderFooterInputs,
		handleInputChange,
	]);

	// Handle submit: Arrange the data into a structured payload and send to backend.
	const handleSubmit = useCallback(async () => {
		if (!selectedRequest) return;

		const payload = {
			requestId: selectedRequest.requestId,
			jobId: selectedRequest.jobId,
			sampleDate: selectedRequest.sampleDate,
			clientName: selectedRequest.clientName,
			projectName: selectedRequest.projectName,
			groups: [],
		};

		// Iterate over each group.
		Object.entries(groupedRows).forEach(([methodName, rows], groupIndex) => {
			const groupKey = `group-${groupIndex}-${methodName}`;

			// Build certificate details using form values or fallback.
			const certificateDetails = {};
			certificateFields.forEach((field) => {
				const key = `cert-${groupKey}-${field.key}`;
				certificateDetails[field.key] =
					formValues[key] !== undefined
						? formValues[key]
						: getCertificateFieldValue(field, groupKey, rows);
			});

			// Build table data for this group.
			const testDefinition = testMethods.find(
				(item) => item.test_name === methodName
			);
			const tableData = rows.map((row, rowIndex) => {
				const rowData = {};
				testDefinition.test_columns.forEach((col) => {
					const fieldKey = `${groupKey}-${rowIndex}-${col}`;
					let value = formValues[fieldKey];
					if (value === undefined) {
						if (col.toLowerCase() === "mtc no") {
							value = row.mtcNo || "";
						} else if (col.toLowerCase() === "test method") {
							value = row.testMethod || "";
						} else {
							const apiKey = Object.keys(row).find(
								(key) =>
									key.toLowerCase() === col.replace(/ /g, "").toLowerCase()
							);
							value = row[apiKey] || "";
						}
					}
					rowData[col] = value;
				});
				return rowData;
			});

			// Footer data for this group.
			const footer = {
				testedBy: formValues[`cert-${groupKey}-testedBy`] || "",
				witnessedBy: formValues[`cert-${groupKey}-witnessedBy`] || "",
			};

			payload.groups.push({
				testMethod: methodName,
				certificateDetails,
				tableData,
				footer,
			});
		});

		console.log("Structured payload to send:", payload);

		// Send the payload to your backend API which writes to Firebase.
		try {
			const response = await fetch("/api/certificates/new", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});
			const result = await response.json();
			console.log("Submission result:", result);
		} catch (error) {
			console.error("Error submitting data:", error);
		}
	}, [selectedRequest, groupedRows, formValues, getCertificateFieldValue]);

	return (
		<div className="p-6 max-w-5xl mx-auto space-y-6">
			{/* Request selection */}
			<div className="mb-6">
				<div className="w-48">
					<Select onValueChange={handleRequestChange} defaultValue="">
						<SelectTrigger className="w-full">
							{selectedRequest?.requestId || "Select Request"}
						</SelectTrigger>
						<SelectContent>
							{Array.isArray(requests) &&
								requests.map((r) => (
									<SelectItem key={r.requestId} value={r.requestId}>
										{r.requestId}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{selectedRequest && (
				<div>
					<h2 className="text-2xl font-bold mb-4">
						Test Method Details for Request {selectedRequest.requestId}
					</h2>
					{renderTestMethodTables}
					<div className="mt-6 flex justify-end">
						<Button onClick={handleSubmit}>Submit All</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default StepwiseForm;
