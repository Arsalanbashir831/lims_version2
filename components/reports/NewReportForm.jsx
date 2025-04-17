"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { testMethods } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import TestMethodCard from "./report-form/TestMethodCard";

async function fetchJSON(url) {
	const res = await fetch(url);
	if (!res.ok) throw new Error(res.statusText);
	return res.json();
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
	const [customColumns, setCustomColumns] = useState({});

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
			const baseCols = testMethods.find(
				(t) => t.test_name === row.testMethod
			).test_columns;
			const customForThis = customColumns[groupKey] || [];
			// make a shallow copy
			const displayColumns = [...baseCols];

			// sort your custom definitions by pos then splice them in
			customForThis
				.slice()
				.sort((a, b) => a.pos - b.pos)
				.forEach(({ name, pos }) => {
					displayColumns.splice(pos, 0, name);
				});

			// 3) for each specimen section
			const sectionIndexes = sections[groupKey] || [];
			const specimenSections = sectionIndexes.map((sectionIndex) => {
				const specimenId =
					values[`${groupKey}-specimen-${sectionIndex}-id`] || "";

				// build your tableData rows
				const tableData = [];

				// base row is always rowIndex 0
				const baseRow = {};
				displayColumns.forEach((col) => {
					const fieldKey = `${groupKey}-specimen-${sectionIndex}-0-${col}`;
					let val = values[fieldKey];
					if (val === undefined) {
						// fallback to original row property if it exists
						val = row[col] ?? "";
					}
					// unwrap images
					if (col.toLowerCase() === "images" && typeof val === "object") {
						val = val.downloadURL;
					}
					baseRow[col] = val;
				});
				tableData.push(baseRow);

				// then extra rows
				const extras = extraRows[`${groupKey}-specimen-${sectionIndex}`] || [];
				extras.forEach((extraId) => {
					const extraRow = {};
					displayColumns.forEach((col) => {
						const fieldKey = `${groupKey}-specimen-${sectionIndex}-extra-${extraId}-${col}`;
						let val = values[fieldKey] || "";
						if (col.toLowerCase() === "images" && typeof val === "object") {
							val = val.downloadURL;
						}
						extraRow[col] = val;
					});
					tableData.push(extraRow);
				});

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
							customCols={customColumns[key] || []}
							setCustomCols={(cols) =>
								setCustomColumns((prev) => ({ ...prev, [key]: cols }))
							}
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
