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
	// State: mapping each group key to an array of specimen section indexes.
	const [specimenSections, setSpecimenSections] = useState({});
	// NEW: extraRows now is an object mapping specimenKey to an array of extra row unique IDs.
	const [extraRows, setExtraRows] = useState({});

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
				const groupKey = `group-${groupIndex}-${group.testMethod}`;
				// Prepopulate certificate details.
				Object.entries(group.certificateDetails || {}).forEach(
					([key, value]) => {
						newFormValues[`cert-${groupKey}-${key}`] = value;
					}
				);
				// Prepopulate specimen sections.
				(group.specimenSections || []).forEach(
					(specimenSection, specimenIndex) => {
						newFormValues[`${groupKey}-specimen-${specimenIndex}-id`] =
							specimenSection.specimenId;
						(specimenSection.tableData || []).forEach((row, rowIndex) => {
							Object.entries(row).forEach(([col, value]) => {
								newFormValues[
									`${groupKey}-specimen-${specimenIndex}-${rowIndex}-${col}`
								] = value;
							});
						});
					}
				);
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

	// Group rows by test method.
	const groupedRows = useMemo(() => {
		if (isEditMode && certificateData.groups) {
			return certificateData.groups.reduce((acc, group) => {
				const method = group.testMethod;
				acc[method] = group.tableData || [];
				return acc;
			}, {});
		}
		return (
			selectedRequest?.rows?.reduce((acc, row) => {
				const method = row.testMethod;
				if (!acc[method]) acc[method] = [];
				acc[method].push(row);
				return acc;
			}, {}) || {}
		);
	}, [selectedRequest, isEditMode, certificateData]);

	// Initialize specimenSections for each group when a request is selected.
	useEffect(() => {
		if (selectedRequest) {
			const newSpecimenSections = {};
			Object.entries(groupedRows).forEach(([methodName, rows], groupIndex) => {
				const groupKey = `group-${groupIndex}-${methodName}`;
				newSpecimenSections[groupKey] = [0]; // start with one specimen section
			});
			setSpecimenSections(newSpecimenSections);
		}
	}, [selectedRequest, groupedRows]);

	// Update input field values.
	const handleInputChange = useCallback((key, value) => {
		setFormValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	// For new mode: request selection.
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

	// Function to add a new specimen section for a group.
	const addSpecimenSection = (groupKey) => {
		setSpecimenSections((prev) => {
			const currentSections = prev[groupKey] || [];
			return {
				...prev,
				[groupKey]: [...currentSections, currentSections.length],
			};
		});
	};

	// Function to remove a specimen section.
	const removeSpecimenSection = (groupKey, specimenIndex) => {
		setSpecimenSections((prev) => {
			const currentSections = prev[groupKey] || [];
			return {
				...prev,
				[groupKey]: currentSections.filter((index) => index !== specimenIndex),
			};
		});
		// Optionally: clear the form values related to this specimen.
	};

	// NEW: addExtraRow now adds a unique ID to an array for this specimen.
	const addExtraRow = (specimenKey) => {
		setExtraRows((prev) => {
			const currentRows = prev[specimenKey] || [];
			const newId = Date.now() + Math.random();
			return { ...prev, [specimenKey]: [...currentRows, newId] };
		});
	};

	// NEW: removeExtraRow removes the row with the given extraId.
	const removeExtraRow = (specimenKey, extraId) => {
		setExtraRows((prev) => {
			const currentRows = prev[specimenKey] || [];
			return {
				...prev,
				[specimenKey]: currentRows.filter((id) => id !== extraId),
			};
		});
	};

	// Helper to compute available specimen IDs for a given group.
	const getAvailableSpecimenOptions = (groupKey, rows) => {
		// Gather all specimen IDs from all rows (using union to remove duplicates)
		const allSpecimens = new Set();
		rows.forEach((row) => {
			if (row.specimenIds && Array.isArray(row.specimenIds)) {
				row.specimenIds.forEach((id) => allSpecimens.add(id));
			}
		});
		// Get already selected specimen IDs for this group
		const selectedSpecimens = [];
		(specimenSections[groupKey] || []).forEach((specimenIndex) => {
			const selected = formValues[`${groupKey}-specimen-${specimenIndex}-id`];
			if (selected) selectedSpecimens.push(selected);
		});
		// Return options that are not yet selected
		return Array.from(allSpecimens).filter(
			(id) => !selectedSpecimens.includes(id)
		);
	};

	// Render certificate details (remains the same).
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

	// Render a specimen section using a dropdown for specimen ID.
	const renderSpecimenSection = (
		groupKey,
		specimenIndex,
		rows,
		testDefinition
	) => {
		const specimenIdKey = `${groupKey}-specimen-${specimenIndex}-id`;
		const specimenId = formValues[specimenIdKey] || "";
		const availableOptions = getAvailableSpecimenOptions(groupKey, rows);
		// Define a unique key for this specimen section.
		const specimenKey = `${groupKey}-specimen-${specimenIndex}`;
		return (
			<div
				key={`${groupKey}-specimen-${specimenIndex}`}
				className="mb-6 border p-4 rounded">
				<div className="flex justify-between items-center mb-4">
					<label className="text-sm font-medium text-gray-700">
						Specimen ID
					</label>
					<Button
						onClick={() => removeSpecimenSection(groupKey, specimenIndex)}
						variant="outline"
						size="sm">
						Remove Specimen
					</Button>
				</div>
				<Select
					value={specimenId}
					onValueChange={(value) => handleInputChange(specimenIdKey, value)}>
					<SelectTrigger className="w-full">
						{specimenId || "Select Specimen ID"}
					</SelectTrigger>
					<SelectContent>
						{availableOptions.map((id) => (
							<SelectItem key={id} value={id}>
								{id}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{specimenId && (
					<>
						<ScrollArea className="w-full max-w-4xl mx-auto mt-4">
							<div className="overflow-x-auto mb-4">
								<Table>
									<TableHeader>
										<TableRow>
											{testDefinition.test_columns.map((col) => (
												<TableHead key={col}>{col}</TableHead>
											))}
											{/* Extra column for row actions */}
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{/* Render base rows (non-removable) */}
										{rows.map((row, rowIndex) => (
											<TableRow key={`base-${rowIndex}`}>
												{testDefinition.test_columns.map((col) => {
													const fieldKey = `${groupKey}-specimen-${specimenIndex}-${rowIndex}-${col}`;
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
															initialValue = (apiKey && row[apiKey]) || "";
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
												{/* Empty cell for base rows (no action) */}
												<TableCell />
											</TableRow>
										))}
										{/* Render extra (user-added) rows with a remove button */}
										{(extraRows[specimenKey] || []).map((extraId) => (
											<TableRow key={`extra-${extraId}`}>
												{testDefinition.test_columns.map((col) => {
													const fieldKey = `${groupKey}-specimen-${specimenIndex}-extra-${extraId}-${col}`;
													let initialValue = formValues[fieldKey];
													if (initialValue === undefined) {
														initialValue = "";
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
												{/* Action cell for extra row */}
												<TableCell>
													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															removeExtraRow(specimenKey, extraId)
														}>
														Remove Row
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
						<div className="flex justify-end space-x-2 mt-2">
							<Button
								variant="outline"
								onClick={() => addExtraRow(specimenKey)}>
								Add Row
							</Button>
						</div>
					</>
				)}
			</div>
		);
	};

	// Render test method groups and their specimen sections.
	const renderTestMethodTables = useMemo(() => {
		if (!selectedRequest) return null;
		return Object.entries(groupedRows).map(([methodName, rows], groupIndex) => {
			const testDefinition = testMethods.find(
				(item) => item.test_name === methodName
			);
			if (!testDefinition) return null;
			const groupKey = `group-${groupIndex}-${methodName}`;
			const specimenSectionIndexes = specimenSections[groupKey] || [];
			// Determine if more specimens can be added.
			const availableOptions = getAvailableSpecimenOptions(groupKey, rows);
			return (
				<Card key={groupKey} className="mb-6 shadow-sm">
					<CardHeader>
						<CardTitle>{methodName}</CardTitle>
					</CardHeader>
					<CardContent>
						{renderCertificateDetails(groupKey, rows)}
						{specimenSectionIndexes.map((specimenIndex) =>
							renderSpecimenSection(
								groupKey,
								specimenIndex,
								rows,
								testDefinition
							)
						)}
						<Button
							onClick={() => addSpecimenSection(groupKey)}
							variant="outline"
							disabled={availableOptions.length === 0}>
							Add Specimen
						</Button>
						{renderFooterInputs(groupKey)}
					</CardContent>
				</Card>
			);
		});
	}, [
		selectedRequest,
		groupedRows,
		formValues,
		specimenSections,
		extraRows, // Added extraRows so changes trigger a re-render
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

		// Build payload for each test method group.
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

			const specimenSectionIndexes = specimenSections[groupKey] || [];
			const specimenSectionsPayload = specimenSectionIndexes.map(
				(specimenIndex) => {
					const specimenIdKey = `${groupKey}-specimen-${specimenIndex}-id`;
					const specimenId = formValues[specimenIdKey] || "";
					// Base rows
					const baseTableData = rows.map((row, rowIndex) => {
						const rowData = {};
						testDefinition.test_columns.forEach((col) => {
							const fieldKey = `${groupKey}-specimen-${specimenIndex}-${rowIndex}-${col}`;
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
									value = (apiKey && row[apiKey]) || "";
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
					// Extra rows
					const specimenKey = `${groupKey}-specimen-${specimenIndex}`;
					const extraRowIds = extraRows[specimenKey] || [];
					const extraTableData = extraRowIds.map((extraId) => {
						const rowData = {};
						testDefinition.test_columns.forEach((col) => {
							const fieldKey = `${groupKey}-specimen-${specimenIndex}-extra-${extraId}-${col}`;
							let value = formValues[fieldKey];
							if (value === undefined) value = "";
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
					const tableData = [...baseTableData, ...extraTableData];
					return {
						specimenId,
						tableData,
					};
				}
			);

			const footer = {
				testedBy: formValues[`cert-${groupKey}-testedBy`] || "",
				witnessedBy: formValues[`cert-${groupKey}-witnessedBy`] || "",
			};

			payload.groups.push({
				testMethod: methodName,
				certificateDetails,
				specimenSections: specimenSectionsPayload,
				footer,
			});
		});

		console.log("Payload before cleaning:", payload);

		const cleanPayload = {
			...payload,
			groups: payload.groups.map((group) => ({
				...group,
				specimenSections: group.specimenSections.map((section) => ({
					...section,
					tableData: section.tableData.map((row) => {
						const newRow = { ...row };
						if (newRow.images && typeof newRow.images === "object") {
							newRow.images = newRow.images.downloadURL || "";
						}
						return newRow;
					}),
				})),
			})),
		};

		console.log("Clean payload to send:", cleanPayload);

		try {
			setIsSubmitting(true);
			let response;
			if (isEditMode) {
				response = await fetch(`/api/certificates/${selectedRequest.id}`, {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(cleanPayload),
				});
			} else {
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
		specimenSections,
		extraRows,
	]);

	return (
		<div className="p-6 max-w-5xl mx-auto space-y-6">
			{isEditMode ? (
				<div className="mb-6">
					<div className="w-48">
						<Input value={selectedRequest?.requestId || ""} disabled />
					</div>
				</div>
			) : (
				<Card className="mb-6">
					<CardContent className="flex items-center space-x-4">
						<label className="font-medium text-gray-700">
							Select the Request to Generate Certificate
						</label>
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
					</CardContent>
				</Card>
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
