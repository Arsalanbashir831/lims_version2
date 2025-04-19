"use client";

import React from "react";
import { testMethods } from "@/lib/constants";

export default function MethodPreviewTable({ testMethod, tableData }) {
	// Look up the matching test definition (for fallback or additional info)
	const testDefinition = testMethods.find(
		(item) => item.test_name === testMethod
	);

	if (!testDefinition) {
		return <p>No definition found for {testMethod}</p>;
	}

	if (!Array.isArray(tableData) || tableData.length === 0) {
		return <p>No table data available.</p>;
	}

	// Derive all column keys from the first row
	const rawCols = Object.keys(tableData[0]);

	// Exclude images and notes
	const filteredCols = rawCols.filter(
		(col) => col.toLowerCase() !== "images" && col.toLowerCase() !== "notes"
	);

	// Separate out acceptance criteria and remarks
	const remarksCol = filteredCols.find(
		(col) => col.toLowerCase() === "remarks"
	);
	const acceptanceCol = filteredCols.find(
		(col) => col.toLowerCase() === "acceptable criteria as per astm a105n"
	);

	// All other columns
	const otherCols = filteredCols.filter(
		(col) =>
			col.toLowerCase() !== "remarks" &&
			col.toLowerCase() !== "acceptable criteria as per astm a105n"
	);

	// Final ordering: all others, then acceptable criteria, then remarks
	const allCols = [
		...otherCols,
		...(acceptanceCol ? [acceptanceCol] : []),
		...(remarksCol ? [remarksCol] : []),
	];

	return (
		<table
			style={{
				width: "100%",
				borderCollapse: "collapse",
				marginTop: "1rem",
				fontSize: "0.9rem",
			}}>
			<thead>
				<tr>
					{allCols.map((col) => (
						<th key={col} style={thStyle}>
							{col}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{tableData.map((row, rowIndex) => (
					<tr key={rowIndex}>
						{allCols.map((col) => (
							<td key={col} style={tdStyle}>
								{row[col] ?? ""}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

const thStyle = {
	border: "1px solid #ccc",
	padding: "6px",
	background: "#f2f2f2",
	textAlign: "left",
};

const tdStyle = {
	border: "1px solid #ccc",
	padding: "6px",
};
