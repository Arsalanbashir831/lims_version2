"use client";

import React from "react";
import { testMethods } from "@/lib/constants";

export default function MethodPreviewTable({ testMethod, tableData }) {
	// Look up the matching test definition
	const testDefinition = testMethods.find(
		(item) => item.test_name === testMethod
	);

	console.log("testDefinition", tableData);

	if (!testDefinition) {
		return <p>No definition found for {testMethod}</p>;
	}

	// If there's no tableData, display a fallback
	if (!Array.isArray(tableData) || tableData.length === 0) {
		return <p>No table data available.</p>;
	}

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
					{testDefinition.test_columns.map((col) => (
						<th key={col} style={thStyle}>
							{col}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{tableData.map((row, rowIndex) => (
					<tr key={rowIndex}>
						{testDefinition.test_columns.map((col) => {
							let cellValue = row[col] ?? "";

							// If it's an images column, show an image if there's a valid URL
							if (col.toLowerCase() === "images") {
								return (
									<td key={col} style={tdStyle}>
										{typeof cellValue === "string" && cellValue ? (
											<img
												src={cellValue}
												alt="Preview"
												style={{ maxHeight: "80px", objectFit: "contain" }}
											/>
										) : (
											"No Image"
										)}
									</td>
								);
							}

							return (
								<td key={col} style={tdStyle}>
									{cellValue}
								</td>
							);
						})}
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
