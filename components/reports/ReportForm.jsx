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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/config/firebase-config";

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

function ReportForm({ initialData }) {
	// In edit mode, initialData should have a "certificate" property.
	const certificateData = initialData?.certificate || null;
	const isEditMode = Boolean(certificateData);

	// In edit mode, use certificateData as the selected request.
	const [selectedRequest, setSelectedRequest] = useState(
		isEditMode ? certificateData : null
	);
	// For new mode, we fetch the testing requests.
	const [requests, setRequests] = useState([]);
	const [formValues, setFormValues] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Only fetch testing requests if not in edit mode.
	useEffect(() => {
		if (!isEditMode) {
			fetch("/api/testing-requests")
				.then((res) => res.json())
				.then((data) => setRequests(data.testingRequests))
				.catch((err) => console.error("Error fetching requests", err));
		}
	}, [isEditMode]);

	// In edit mode, prepopulate formValues from certificateData.groups.
	useEffect(() => {
		if (isEditMode && certificateData && certificateData.groups) {
			const newFormValues = {};
			certificateData.groups.forEach((group, groupIndex) => {
				// Use a group key that matches your naming convention.
				const groupKey = `group-${groupIndex}-${group.testMethod}`;
				// Prepopulate certificate details.
				Object.entries(group.certificateDetails || {}).forEach(
					([key, value]) => {
						newFormValues[`cert-${groupKey}-${key}`] = value;
					}
				);
				// Prepopulate table data.
				(group.tableData || []).forEach((row, rowIndex) => {
					Object.entries(row).forEach(([col, value]) => {
						newFormValues[`${groupKey}-${rowIndex}-${col}`] = value;
					});
				});
				// Prepopulate footer fields.
				if (group.footer) {
					newFormValues[`cert-${groupKey}-testedBy`] = group.footer.testedBy;
					newFormValues[`cert-${groupKey}-witnessedBy`] =
						group.footer.witnessedBy;
				}
			});
			setFormValues(newFormValues);
		}
	}, [certificateData, isEditMode]);

	// Update input field values.
	const handleInputChange = useCallback((key, value) => {
		setFormValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	// For new mode only, allow request selection.
	const handleRequestChange = useCallback(
		(value) => {
			if (!isEditMode) {
				const req = requests.find((r) => r.requestId === value);
				setSelectedRequest(req);
			}
		},
		[requests, isEditMode]
	);

	const getCertificateFieldValue = useCallback(
		(field, groupKey, groupRows = []) => {
			const keyName = `cert-${groupKey}-${field.key}`;
			if (formValues[keyName] !== undefined) return formValues[keyName];
			if (selectedRequest) {
				if (field.key === "dateOfSampling" && selectedRequest.sampleDate) {
					return selectedRequest.sampleDate.split("T")[0];
				}
				if (field.key === "issueDate") {
					return new Date().toISOString().split("T")[0];
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

	// Group rows: In edit mode, certificateData.groups contains the groups,
	// so we map each group’s tableData by testMethod.
	const groupedRows = useMemo(() => {
		if (isEditMode && certificateData.groups) {
			return certificateData.groups.reduce((acc, group) => {
				const method = group.testMethod;
				acc[method] = group.tableData || [];
				return acc;
			}, {});
		}
		// New mode: group from selectedRequest.rows.
		return (
			selectedRequest?.rows?.reduce((acc, row) => {
				const method = row.testMethod;
				if (!acc[method]) acc[method] = [];
				acc[method].push(row);
				return acc;
			}, {}) || {}
		);
	}, [selectedRequest, isEditMode, certificateData]);

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
																	{formValues[fieldKey] ? (
																		<img
																			src={
																				typeof formValues[fieldKey] === "object"
																					? formValues[fieldKey].previewUrl ||
																					  formValues[fieldKey].downloadURL
																					: formValues[fieldKey]
																			}
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
																				const certificateNo =
																					formValues[
																						`cert-${groupKey}-gripcoRefNo`
																					] ||
																					formValues[
																						`cert-${groupKey}-mtcNo`
																					] ||
																					"default";
																				const fileExtension = file.name
																					.split(".")
																					.pop();
																				const fileName = `${certificateNo}.${fileExtension}`;
																				const filePath = `certificates/${certificateNo}/${fileName}`;
																				try {
																					const storageRef = ref(
																						storage,
																						filePath
																					);
																					const snapshot = await uploadBytes(
																						storageRef,
																						file
																					);
																					const downloadURL =
																						await getDownloadURL(snapshot.ref);
																					const previewUrl =
																						URL.createObjectURL(file);
																					handleInputChange(fieldKey, {
																						downloadURL,
																						previewUrl,
																					});
																				} catch (error) {
																					console.error(
																						"Error uploading image:",
																						error
																					);
																				}
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

		Object.entries(groupedRows).forEach(([methodName, rows], groupIndex) => {
			const groupKey = `group-${groupIndex}-${methodName}`;
			const certificateDetails = {};
			certificateFields.forEach((field) => {
				const key = `cert-${groupKey}-${field.key}`;
				certificateDetails[field.key] =
					formValues[key] !== undefined
						? formValues[key]
						: getCertificateFieldValue(field, groupKey, rows);
			});

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
					if (
						col.toLowerCase() === "images" &&
						value &&
						typeof value === "object" &&
						value.downloadURL
					) {
						value = value.downloadURL;
					}
					rowData[col] = value;
				});
				return rowData;
			});

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

		console.log("Payload before cleaning:", payload);

		const cleanPayload = {
			...payload,
			groups: payload.groups.map((group) => ({
				...group,
				tableData: group.tableData.map((row) => {
					const newRow = { ...row };
					if (newRow.images && typeof newRow.images === "object") {
						newRow.images = newRow.images.downloadURL || "";
					}
					return newRow;
				}),
			})),
		};

		console.log("Clean payload to send:", cleanPayload);

		try {
			setIsSubmitting(true);
			let response;
			if (isEditMode) {
				// Update certificate using PUT endpoint.
				response = await fetch(`/api/certificates/${selectedRequest.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(cleanPayload),
				});
			} else {
				// Create new certificate.
				response = await fetch("/api/certificates/new", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(cleanPayload),
				});
			}
			const result = await response.json();
			console.log("Submission result:", result);
		} catch (error) {
			console.error("Error submitting data:", error);
		} finally {
			setIsSubmitting(false);
			setFormValues({});
		}
	}, [
		selectedRequest,
		groupedRows,
		formValues,
		getCertificateFieldValue,
		isEditMode,
	]);

	return (
		<div className="p-6 max-w-5xl mx-auto space-y-6">
			{isEditMode ? (
				// In edit mode, display a disabled input for the Request No.
				<div className="mb-6">
					<div className="w-48">
						<Input value={selectedRequest?.requestId || ""} disabled />
					</div>
				</div>
			) : (
				// In new mode, show the request select.
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
			)}

			{selectedRequest && (
				<div>
					<h2 className="text-2xl font-bold mb-4">
						Test Method Details for Request {selectedRequest.requestId}
					</h2>
					{renderTestMethodTables}
					<div className="mt-6 flex justify-end">
						<Button onClick={handleSubmit} disabled={isSubmitting}>
							{isSubmitting ? "Submitting..." : "Submit"}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default ReportForm;
