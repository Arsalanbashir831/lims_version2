"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
	ref,
	uploadBytes,
	getDownloadURL,
	deleteObject,
} from "firebase/storage";
import { storage } from "@/config/firebase-config";
import { testMethods } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import { set } from "date-fns";

const CERT_FIELDS = [
	{ key: "dateOfSampling", label: "Date of Sampling", type: "date" },
	{ key: "dateOfTesting", label: "Date of Testing", type: "date" },
	{ key: "issueDate", label: "Issue Date", type: "date" },
	{ key: "gripcoRefNo", label: "Gripco Ref No", type: "text" },
	{ key: "revisionNo", label: "Revision No", type: "text" },
	{ key: "clientNameCert", label: "Client Name", type: "text" },
	{ key: "poNumber", label: "PO #", type: "text" },
	{ key: "customerNameNo", label: "Customer’s Name & no.", type: "text" },
	{ key: "attn", label: "Atten", type: "text" },
	{ key: "customerPO", label: "CUSTOMER PO", type: "text" },
	{ key: "projectNameCert", label: "Project Name", type: "text" },
	{ key: "labName", label: "Name of Laboratory", type: "text" },
	{ key: "labAddress", label: "Address", type: "text" },
	{ key: "sampleDescription", label: "Sample Description", type: "text" },
	{ key: "materialGrade", label: "Material Grade", type: "text" },
	{ key: "temperature", label: "Temperature", type: "text" },
	{ key: "humidity", label: "Humidity", type: "text" },
	{ key: "samplePrepMethod", label: "Sample Preparation Method", type: "text" },
	{ key: "testEquipment", label: "Test Equipment", type: "text" },
	{ key: "mtcNo", label: "MTC No.", type: "text" },
	{ key: "testMethod", label: "Test Method", type: "text" },
];

async function fetchJSON(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(res.statusText);
	return res.json();
}

function CertificateDetails({ groupKey, row, values, onChange, selected }) {
	const defaults = {
		clientNameCert: selected.clientName,
		projectNameCert: selected.projectName,
		gripcoRefNo: selected.jobId,
		dateOfSampling: selected.sampleDate?.split("T")[0],
		issueDate: new Date().toISOString().split("T")[0],
		dateOfTesting: row.plannedTestDate,
		mtcNo: row.mtcNo,
		testMethod: row.testMethod,
		customerNameNo: row.customerName,
		customerPO: row.customerPO,
		sampleDescription: row.itemDescription,
	};

	return (
		<div className="p-4 border rounded bg-gray-50 mb-4">
			<h3 className="text-lg font-bold mb-3">Certificate Details</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{CERT_FIELDS.map(({ key, label, type }) => {
					const fieldKey = `cert-${groupKey}-${key}`;
					const val = values[fieldKey] ?? defaults[key] ?? "";
					return (
						<div key={fieldKey} className="flex flex-col">
							<label className="text-sm font-medium text-gray-700">
								{label}
							</label>
							<Input
								type={type}
								value={val}
								onChange={(e) => onChange(fieldKey, e.target.value)}
								placeholder={label}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function SpecimenSection({
	groupKey,
	idx,
	row,
	columns,
	values,
	requestId,
	onChange,
	extraIds = [],
	onAddRow,
	onRemoveRow,
	onRemoveSection,
}) {
	console.log("SpecimenSection", { groupKey, idx, row, columns, values });
	const specimenKey = `${groupKey}-specimen-${idx}`;
	const idKey = `${specimenKey}-id`;
	const selectedId = values[idKey] || row.specimenIds?.[0] || "";
	const specimenIds = row.specimenIds || [];

	return (
		<div className="border p-4 rounded mb-6">
			<div className="flex justify-between mb-4">
				<Select value={selectedId} onValueChange={(v) => onChange(idKey, v)}>
					<SelectTrigger className="w-full">
						{selectedId || "Select Specimen ID"}
					</SelectTrigger>
					<SelectContent>
						{specimenIds.map((id) => (
							<SelectItem key={id} value={id}>
								{id}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onRemoveSection(groupKey, idx)}>
					Remove
				</Button>
			</div>
			<ScrollArea className="overflow-x-auto mb-4">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((col) => (
								<TableHead key={col}>{col}</TableHead>
							))}
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{/* Base Row */}
						<TableRow>
							{columns.map((col) => {
								const keyName = `${groupKey}-specimen-${idx}-0-${col}`;
								const raw = row[col.toLowerCase().replace(/ /g, "")] || "";
								const val = values[keyName] ?? raw;
								console.log("val", val);
								if (col.toLowerCase() === "images") {
									const isObject = typeof val === "object";
									const previewUrl = isObject ? val.downloadURL : val;

									return (
										<TableCell key={col} className="relative w-24 h-24">
											{console.log("previewUrl", previewUrl) ||
												console.log("val", val)}
											{previewUrl ? (
												<>
													<img
														src={previewUrl}
														alt="Preview"
														className="object-contain h-full w-full"
													/>
													<button
														onClick={async () => {
															// first delete from storage
															if (val.downloadURL) {
																try {
																	await deleteObject(
																		ref(storage, val.downloadURL)
																	);
																} catch (e) {
																	console.warn(
																		"Failed to delete from storage:",
																		e
																	);
																}
															}
															// then clear the field
															onChange(keyName, "");
														}}
														className="absolute top-1 right-1 bg-white rounded-full p-1 text-gray-500">
														&times;
													</button>
												</>
											) : (
												<label className="flex items-center justify-center h-full cursor-pointer text-gray-400 border">
													Upload
													<input
														type="file"
														accept="image/*"
														className="hidden"
														onChange={async (e) => {
															const file = e.target.files?.[0];
															if (!file) return;
															const preview = URL.createObjectURL(file);
															const path = `certificates/${requestId}/${file.name}`;
															const snap = await uploadBytes(
																ref(storage, path),
																file
															);
															const url = await getDownloadURL(snap.ref);
															onChange(keyName, { preview, downloadURL: url });
														}}
													/>
												</label>
											)}
										</TableCell>
									);
								}
								return (
									<TableCell key={col}>
										<Input
											value={val}
											onChange={(e) => onChange(keyName, e.target.value)}
										/>
									</TableCell>
								);
							})}
							<TableCell />
						</TableRow>
						{/* Extra Rows */}
						{extraIds.map((id) => (
							<TableRow key={id}>
								{columns.map((col) => {
									const keyName = `${groupKey}-specimen-${idx}-extra-${id}-${col}`;
									const val = values[keyName] || "";
									return (
										<TableCell key={col}>
											<Input
												value={val}
												onChange={(e) => onChange(keyName, e.target.value)}
											/>
										</TableCell>
									);
								})}
								<TableCell>
									<Button
										variant="outline"
										size="sm"
										onClick={() => onRemoveRow(specimenKey, id)}>
										Remove Row
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
			<div className="flex justify-end">
				<Button
					size="sm"
					variant="outline"
					onClick={() => onAddRow(specimenKey)}>
					Add Row
				</Button>
			</div>
		</div>
	);
}

function TestMethodCard({
	groupKey,
	row,
	values,
	onChange,
	sections,
	extraRows,
	addSection,
	onAddRow,
	onRemoveRow,
	onRemoveSection,
	selected,
}) {
	const columns =
		testMethods.find((t) => t.test_name === row.testMethod)?.test_columns || [];
	return (
		<Card className="mb-6 shadow-sm">
			<CardHeader>
				<CardTitle>{row.testMethod}</CardTitle>
			</CardHeader>
			<CardContent>
				<CertificateDetails
					groupKey={groupKey}
					row={row}
					values={values}
					onChange={onChange}
					selected={selected}
				/>
				{sections[groupKey]?.map((idx) => (
					<SpecimenSection
						key={idx}
						groupKey={groupKey}
						idx={idx}
						row={row}
						columns={columns}
						values={values}
						onChange={onChange}
						extraIds={extraRows[`${groupKey}-specimen-${idx}`] || []}
						onAddRow={onAddRow}
						onRemoveRow={onRemoveRow}
						onRemoveSection={onRemoveSection}
					/>
				))}
				{/* Remarks Field */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Remarks
					</label>
					<Input
						type="text"
						value={values[`remarks-${groupKey}`] || row.remarks || ""}
						onChange={(e) => onChange(`remarks-${groupKey}`, e.target.value)}
						placeholder="Add any remarks"
						className="w-full"
					/>
				</div>
				<Button
					variant="outline"
					onClick={() => addSection(groupKey)}
					disabled={!sections[groupKey]}>
					Add Specimen
				</Button>
			</CardContent>
		</Card>
	);
}

export default function ReportForm({ initialData }) {
	const router = useRouter();
	const isEdit = Boolean(initialData?.certificate);
	const [requests, setRequests] = useState([]);
	const [selected, setSelected] = useState(initialData?.certificate || null);
	const [values, setValues] = useState({});
	const [sections, setSections] = useState({});
	const [extraRows, setExtraRows] = useState({});
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!isEdit)
			fetchJSON("/api/testing-requests").then((data) =>
				setRequests(data.testingRequests)
			);
	}, [isEdit]);
	useEffect(() => {
		if (selected) {
			const init = {};
			selected.rows.forEach((r, i) => {
				const key = `group-${i}-${r.testMethod}`;
				init[key] = [0];
			});
			setSections(init);
		}
	}, [selected]);

	console.log("selected", selected);

	const rowGroups = useMemo(
		() =>
			(selected?.rows || []).map((r, i) => ({
				key: `group-${i}-${r.testMethod}`,
				row: r,
			})),
		[selected]
	);

	// Update any field in the form
	const handleChange = (fieldKey, value) =>
		setValues((prev) => ({ ...prev, [fieldKey]: value }));

	// Add a new specimen section for a given group
	const addSection = (groupKey) =>
		setSections((prev) => ({
			...prev,
			[groupKey]: [...prev[groupKey], prev[groupKey].length],
		}));

	// Remove an existing specimen section by index
	const removeSection = (groupKey, sectionIndex) =>
		setSections((prev) => ({
			...prev,
			[groupKey]: prev[groupKey].filter((i) => i !== sectionIndex),
		}));

	// Add an extra (user‑added) row to a specimen table
	const addExtraRow = (specimenKey) =>
		setExtraRows((prev) => ({
			...prev,
			[specimenKey]: [...(prev[specimenKey] || []), Date.now()],
		}));

	// Remove a specific extra row by its unique ID
	const removeExtraRow = (specimenKey, extraId) =>
		setExtraRows((prev) => ({
			...prev,
			[specimenKey]: (prev[specimenKey] || []).filter((id) => id !== extraId),
		}));

	const handleSubmit = async () => {
		if (!selected) return;
		setSubmitting(true);

		// Build payload
		const payload = {
			requestId: selected.requestId,
			jobId: selected.jobId,
			sampleDate: selected.sampleDate,
			clientName: selected.clientName,
			projectName: selected.projectName,
			groups: [],
		};

		// Iterate each test-method/row group
		rowGroups.forEach(({ key: groupKey, row }) => {
			// Certificate-level details
			const certificateDetails = {};
			CERT_FIELDS.forEach(({ key }) => {
				const fieldKey = `cert-${groupKey}-${key}`;
				certificateDetails[key] = values[fieldKey] ?? "";
			});

			// Fetch test definition and section indexes
			const testDef = testMethods.find((t) => t.test_name === row.testMethod);
			const sectionIndexes = sections[groupKey] || [];

			// Build specimenSections payload
			const specimenSections = sectionIndexes.map((index) => {
				const specimenId = values[`${groupKey}-specimen-${index}-id`] || "";

				// Base row
				const baseRow = {};
				testDef.test_columns.forEach((col) => {
					const fieldKey = `${groupKey}-specimen-${index}-0-${col}`;
					let val = values[fieldKey];
					if (val === undefined) {
						val = row[col.toLowerCase().replace(/ /g, "")] || "";
					}
					if (col.toLowerCase() === "images" && typeof val === "object") {
						val = val.downloadURL;
					}
					baseRow[col] = val;
				});

				// Extra rows
				const extras = (extraRows[`${groupKey}-specimen-${index}`] || []).map(
					(extraId) => {
						const rowObj = {};
						testDef.test_columns.forEach((col) => {
							const fieldKey = `${groupKey}-specimen-${index}-extra-${extraId}-${col}`;
							let val = values[fieldKey] || "";
							if (col.toLowerCase() === "images" && typeof val === "object") {
								val = val.downloadURL;
							}
							rowObj[col] = val;
						});
						return rowObj;
					}
				);

				return { specimenId, tableData: [baseRow, ...extras] };
			});

			// Footer
			const footer = {
				testedBy: values[`cert-${groupKey}-testedBy`] || "",
				witnessedBy: values[`cert-${groupKey}-witnessedBy`] || "",
			};

			// Push group
			payload.groups.push({
				testMethod: row.testMethod,
				certificateDetails,
				specimenSections,
				footer,
			});
		});

		console.log("Payload to submit:", payload);
		setSubmitting(false);
		return;
		// Send to API
		try {
			const url = isEdit
				? `/api/certificates/${selected.id}`
				: "/api/certificates/new";
			const method = isEdit ? "PUT" : "POST";
			await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			router.push("/reports");
		} catch (error) {
			console.error("Error submitting form:", error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="p-6 max-w-5xl mx-auto space-y-6">
			{!isEdit && (
				<Card>
					<CardContent className="flex items-center space-x-4">
						<label className="font-medium text-gray-700">
							{" "}
							Select the Request to Generate Certificate
						</label>
						<Select
							value={selected?.requestId || ""}
							onValueChange={(v) =>
								setSelected(requests.find((r) => r.requestId === v))
							}>
							<SelectTrigger className="w-48">
								{selected?.requestId || "Select Request"}
							</SelectTrigger>
							<SelectContent>
								{requests.map((r) => (
									<SelectItem key={r.requestId} value={r.requestId}>
										{r.requestId}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</CardContent>
				</Card>
			)}
			{selected && (
				<>
					<h2 className="text-2xl font-bold">
						Test Method Details for Request {selected.requestId}
					</h2>
					{rowGroups.map(({ key, row }) => (
						<TestMethodCard
							key={key}
							groupKey={key}
							row={row}
							values={values}
							onChange={handleChange}
							sections={sections}
							extraRows={extraRows}
							addSection={addSection}
							onAddRow={addExtraRow}
							onRemoveRow={removeExtraRow}
							onRemoveSection={removeSection}
							selected={selected}
						/>
					))}
					<div className="flex justify-end">
						<Button onClick={handleSubmit} disabled={submitting}>
							{submitting ? "Submitting..." : "Submit"}
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
