"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CERT_FIELDS, testMethods } from "@/lib/constants";
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

	console.log("selected", selected);

	useEffect(() => {
		if (!selected) return;

		const list = selected.rows || selected.groups || [];
		const initSections = {};
		const seedValues = {};
		const seedCustom = {};

		list.forEach((grp, i) => {
			const key = `group-${i}-${grp.testMethod}`;
			initSections[key] = [0];

			// A) seed certificate fields
			CERT_FIELDS.forEach(({ key: field }) => {
				const dbVal = grp.certificateDetails?.[field];
				const fallback = {
					clientNameCert: selected.clientName,
					projectNameCert: selected.projectName,
					gripcoRefNo: selected.jobId,
					dateOfSampling: selected.sampleDate?.split("T")[0],
					issueDate: new Date().toISOString().split("T")[0],
					dateOfTesting: grp.plannedTestDate,
					mtcNo: grp.mtcNo,
					testMethod: grp.testMethod,
					customerNameNo: grp.customerNameNo,
					customerPO: grp.customerPO,
					sampleDescription: grp.itemDescription,
					revisionNo: grp.revisionNo,
					poNumber: grp.poNumber,
					attn: grp.attn,
					labName: grp.labName || "GLOBAL RESOURCE…",
					labAddress: grp.labAddress || "P.O. Box 100…",
					materialGrade: grp.materialGrade,
					temperature: grp.temperature,
					humidity: grp.humidity,
					samplePrepMethod: grp.samplePrepMethod,
					testEquipment: grp.testEquipment,
				}[field];

				seedValues[`cert-${key}-${field}`] = dbVal ?? fallback ?? "";
			});

			// B) seed footer & remarks
			seedValues[`remarks-${key}`] = grp.footer?.remarks ?? "";
			seedValues[`cert-${key}-testedBy`] = grp.footer?.testedBy ?? "";
			seedValues[`cert-${key}-witnessedBy`] = grp.footer?.witnessedBy ?? "";

			const baseCols =
				testMethods.find((t) => t.test_name === grp.testMethod)?.test_columns ||
				[];

			const actualCols = grp.specimenSections?.[0]?.tableData?.[0]
				? Object.keys(grp.specimenSections[0].tableData[0])
				: [];

			// C) seed the specimen dropdown
			seedValues[`${key}-specimen-0-id`] = grp.specimenIds?.[0] || "";

			// D) seed custom columns (must have been saved on your certificate record)
			seedCustom[key] = actualCols
				.filter((col) => !baseCols.includes(col))
				.map((name) => ({
					name,
					pos: actualCols.indexOf(name),
				}));
		});

		// apply
		setSections(initSections);
		setValues((prev) => ({ ...seedValues, ...prev }));
		setCustomColumns((prev) => ({ ...seedCustom, ...prev }));
	}, [selected]);

	const rowGroups = useMemo(
		() =>
			(selected?.rows || selected?.groups || []).map((r, i) => ({
				key: `group-${i}-${r.testMethod}`,
				row: r,
			})),
		[selected]
	);

	const handleChange = (fieldKey, value) =>
		setValues((prev) => ({ ...prev, [fieldKey]: value }));

	const addSection = (groupKey) =>
		setSections((prev) => ({
			...prev,
			[groupKey]: [...prev[groupKey], prev[groupKey].length],
		}));

	const removeSection = (groupKey, idx) =>
		setSections((prev) => ({
			...prev,
			[groupKey]: prev[groupKey].filter((i) => i !== idx),
		}));

	const addExtraRow = (specimenKey) =>
		setExtraRows((prev) => ({
			...prev,
			[specimenKey]: [...(prev[specimenKey] || []), Date.now()],
		}));

	const removeExtraRow = (specimenKey, id) =>
		setExtraRows((prev) => ({
			...prev,
			[specimenKey]: prev[specimenKey].filter((x) => x !== id),
		}));

	const handleSubmit = async () => {
		if (!selected) return;
		setSubmitting(true);

		const payload = {
			requestId: selected.requestId,
			jobId: selected.jobId,
			sampleDate: selected.sampleDate,
			clientName: selected.clientName,
			projectName: selected.projectName,
			groups: [],
		};

		rowGroups.forEach(({ key: groupKey, row }) => {
			// certificate details: fallback to original row.certificateDetails when undefined in values
			const certificateDetails = {};
			CERT_FIELDS.forEach(({ key }) => {
				const fieldKey = `cert-${groupKey}-${key}`;
				certificateDetails[key] = values[fieldKey];
			});

			// columns including custom
			const baseCols = testMethods.find(
				(t) => t.test_name === row.testMethod
			).test_columns;
			const customForThis = customColumns[groupKey] || [];
			const displayColumns = [...baseCols];
			customForThis
				.slice()
				.sort((a, b) => a.pos - b.pos)
				.forEach((c) => displayColumns.splice(c.pos, 0, c.name));

			// specimen sections
			const sectionIndexes = sections[groupKey] || [];
			const specimenSections = sectionIndexes.map((sectionIndex) => {
				const specimenIdKey = `${groupKey}-specimen-${sectionIndex}-id`;
				const specimenId =
					values[specimenIdKey] ||
					row.specimenSections?.[sectionIndex]?.specimenId ||
					"";

				// build tableData rows
				const tableData = [];
				// base row
				const baseRow = {};
				displayColumns.forEach((col) => {
					const fieldKey = `${groupKey}-specimen-${sectionIndex}-0-${col}`;
					let val;
					if (values[fieldKey] !== undefined) {
						val = values[fieldKey];
					} else {
						// fallback to original tableData
						val =
							row.specimenSections?.[sectionIndex]?.tableData[0]?.[col] ?? "";
					}
					if (col.toLowerCase() === "images" && typeof val === "object")
						val = val.downloadURL;
					baseRow[col] = val;
				});
				tableData.push(baseRow);

				// extra rows
				(extraRows[`${groupKey}-specimen-${sectionIndex}`] || []).forEach(
					(extraId) => {
						const extraRow = {};
						displayColumns.forEach((col) => {
							const fieldKey = `${groupKey}-specimen-${sectionIndex}-extra-${extraId}-${col}`;
							let val = values[fieldKey] || "";
							if (col.toLowerCase() === "images" && typeof val === "object")
								val = val.downloadURL;
							extraRow[col] = val;
						});
						tableData.push(extraRow);
					}
				);

				return { specimenId, tableData };
			});

			const footer = {
				remarks: values[`remarks-${groupKey}`] || row.footer?.remarks || "",
				testedBy:
					values[`cert-${groupKey}-testedBy`] || row.footer?.testedBy || "",
				witnessedBy:
					values[`cert-${groupKey}-witnessedBy`] ||
					row.footer?.witnessedBy ||
					"",
			};

			const defaultGroupKey = `group-0-${rowGroups[0].row.testMethod}`;
			payload.projectName =
				values[`cert-${defaultGroupKey}-projectNameCert`] ||
				selected.projectName;

			payload.groups.push({
				testMethod: row.testMethod,
				certificateDetails,
				specimenSections,
				footer,
			});
		});

		console.log("Payload:", payload);
		// setSubmitting(false);
		// return;

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
		} catch (e) {
			console.error(e);
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
							Select the Request
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
						Details for {selected.requestId}
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
							setCustomCols={(updaterOrArray) =>
								setCustomColumns((prev) => {
									const prevCols = prev[key] || [];
									const newCols =
										typeof updaterOrArray === "function"
											? updaterOrArray(prevCols)
											: updaterOrArray;
									return { ...prev, [key]: newCols };
								})
							}
						/>
					))}
					<div className="flex justify-end">
						<Button onClick={handleSubmit} disabled={submitting}>
							{submitting ? "Submitting…" : "Submit"}
						</Button>
					</div>
				</>
			)}
		</div>
	);
}
