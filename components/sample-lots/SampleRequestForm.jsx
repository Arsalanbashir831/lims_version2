import React, { useState } from "react";

// Sample data as provided.
const sampleJobs = [
	{
		jobId: "J101",
		projectName: "Project Alpha",
		clientName: "ABC Corp",
		sampleDate: "2024-04-10",
		noItems: 2,
		endUser: "John Doe",
		sampleDetails: [
			{
				description: "Chemical Analysis",
				mtcNo: "3456",
				sampleType: "Liquid",
				materialType: "Steel",
				heatNo: "1234",
				condition: "Good",
				testMethods: ["ASTM A123", "ASTM B456"],
			},
			{
				description: "Microbiology Test",
				mtcNo: "3457",
				sampleType: "Solid",
				materialType: "Aluminum",
				heatNo: "5678",
				condition: "Fair",
				testMethods: ["ASTM C123", "ASTM D456"],
			},
		],
	},
	{
		jobId: "J102",
		projectName: "Project Beta",
		clientName: "XYZ Ltd.",
		sampleDate: "2024-04-12",
		noItems: 1,
		endUser: "Jane Smith",
		sampleDetails: [
			{
				description: "Water Quality",
				mtcNo: "3458",
				sampleType: "Liquid",
				materialType: "Copper",
				heatNo: "9876",
				condition: "Damaged",
				testMethods: ["ASTM E123", "ASTM F456"],
			},
		],
	},
];

// Component to handle specimen ID input and badge display.
function SpecimenIdInput({ specimenIds, setSpecimenIds, maxSpecimenCount }) {
	const [inputValue, setInputValue] = useState("");

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && inputValue.trim() !== "") {
			// Only add if current count is less than maxSpecimenCount.
			if (maxSpecimenCount && specimenIds.length >= maxSpecimenCount) {
				e.preventDefault();
				return;
			}
			setSpecimenIds([...specimenIds, inputValue.trim()]);
			setInputValue("");
			e.preventDefault();
		} else if (e.key === "Backspace" && inputValue === "") {
			setSpecimenIds(specimenIds.slice(0, -1));
		}
	};

	return (
		<div className="flex flex-wrap border p-2">
			{specimenIds.map((id, index) => (
				<span key={index} className="bg-blue-200 px-2 py-1 m-1 rounded text-sm">
					{id}
				</span>
			))}
			<input
				type="text"
				className="flex-1 outline-none"
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Enter ID and press Enter"
			/>
		</div>
	);
}

// Helper function to create a default row.
const getDefaultRow = () => ({
	itemNo: "", // index (as string) of the sampleDetails array
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

function SampleRequestForm() {
	// State for job selection and sample item rows.
	const [selectedJobId, setSelectedJobId] = useState("");
	const [selectedJob, setSelectedJob] = useState(null);
	const [numSampleItems, setNumSampleItems] = useState(0);
	const [rows, setRows] = useState([]);

	// When a job is selected, set the job data.
	const handleJobSelect = (e) => {
		const jobId = e.target.value;
		setSelectedJobId(jobId);
		const job = sampleJobs.find((j) => j.jobId === jobId);
		setSelectedJob(job);
		// Reset rows when the job changes.
		setRows([]);
		setNumSampleItems(0);
	};

	// Update rows without re-creating the entire table.
	const handleNumItemsChange = (e) => {
		const value = parseInt(e.target.value, 10) || 0;
		setNumSampleItems(value);
		setRows((prevRows) => {
			const currentCount = prevRows.length;
			if (value > currentCount) {
				// Append new rows.
				const additionalRows = Array.from(
					{ length: value - currentCount },
					() => getDefaultRow()
				);
				return [...prevRows, ...additionalRows];
			} else if (value < currentCount) {
				// Remove rows from the end.
				return prevRows.slice(0, value);
			}
			return prevRows;
		});
	};

	// Update a row field. If "itemNo" changes, auto-fill description, heatNo, and test methods.
	const handleRowChange = (index, field, value) => {
		const newRows = [...rows];
		newRows[index][field] = value;

		if (field === "itemNo" && selectedJob) {
			const sampleItem = selectedJob.sampleDetails.find(
				(_, idx) => String(idx) === value
			);
			if (sampleItem) {
				newRows[index].itemDescription = sampleItem.description;
				newRows[index].heatNo = sampleItem.heatNo;
				newRows[index].availableTestMethods = sampleItem.testMethods;
				newRows[index].testMethod = ""; // reset test method selection
			} else {
				newRows[index].itemDescription = "";
				newRows[index].heatNo = "";
				newRows[index].availableTestMethods = [];
				newRows[index].testMethod = "";
			}
		}
		setRows(newRows);
	};

	const handleSpecimenIdsChange = (index, newSpecimenIds) => {
		const newRows = [...rows];
		newRows[index].specimenIds = newSpecimenIds;
		setRows(newRows);
	};

	// For demonstration, log the form data on submission.
	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Form Data", { selectedJob, rows });
		// Process or send the data as needed.
	};

	return (
		<form className="p-6" onSubmit={handleSubmit}>
			<h2 className="text-xl font-bold mb-4">Assign Specimens to Job Items</h2>

			<div className="mb-4">
				<label className="block font-medium mb-1">Select Job ID:</label>
				<select
					value={selectedJobId}
					onChange={handleJobSelect}
					className="border p-2 w-full">
					<option value="">Select Job</option>
					{sampleJobs.map((job) => (
						<option key={job.jobId} value={job.jobId}>
							{job.jobId} - {job.projectName}
						</option>
					))}
				</select>
			</div>

			{selectedJob && (
				<div className="mb-4">
					<label className="block font-medium mb-1">
						Number of Sample Items:
					</label>
					<input
						type="number"
						min="0"
						value={numSampleItems}
						onChange={handleNumItemsChange}
						className="border p-2 w-full"
					/>
				</div>
			)}

			{rows.length > 0 && (
				<div className="overflow-x-auto mb-4">
					<table className="min-w-full border-collapse border">
						<thead>
							<tr className="bg-gray-200">
								<th className="border p-2">Item No.</th>
								<th className="border p-2">Item Description</th>
								<th className="border p-2">Test Method</th>
								<th className="border p-2">Heat #</th>
								<th className="border p-2">
									Dimension/Specification &amp; Specimen Location
								</th>
								<th className="border p-2">No of Samples</th>
								<th className="border p-2">No of Specimen</th>
								<th className="border p-2">Assign Specimen ID</th>
								<th className="border p-2">Planned Test Date</th>
								<th className="border p-2">Request By</th>
								<th className="border p-2">Remarks</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row, index) => (
								<tr key={index} className="border-b">
									{/* Item No. Selection */}
									<td className="border p-2">
										<select
											value={row.itemNo}
											onChange={(e) =>
												handleRowChange(index, "itemNo", e.target.value)
											}
											className="border p-2">
											<option value="">Select Item</option>
											{selectedJob.sampleDetails.map((item, idx) => (
												<option key={idx} value={idx}>
													{`Item ${idx + 1}`}
												</option>
											))}
										</select>
									</td>
									{/* Item Description (auto-filled) */}
									<td className="border p-2">
										<input
											type="text"
											value={row.itemDescription}
											readOnly
											className="border p-2 bg-gray-100"
										/>
									</td>
									{/* Test Method dropdown */}
									<td className="border p-2">
										<select
											value={row.testMethod}
											onChange={(e) =>
												handleRowChange(index, "testMethod", e.target.value)
											}
											className="border p-2"
											disabled={
												!row.availableTestMethods ||
												row.availableTestMethods.length === 0
											}>
											<option value="">Select Test Method</option>
											{row.availableTestMethods &&
												row.availableTestMethods.map((method, idx) => (
													<option key={idx} value={method}>
														{method}
													</option>
												))}
										</select>
									</td>
									{/* Heat # (auto-filled) */}
									<td className="border p-2">
										<input
											type="text"
											value={row.heatNo}
											readOnly
											className="border p-2 bg-gray-100"
										/>
									</td>
									{/* Dimension/Specification & Specimen Location */}
									<td className="border p-2">
										<input
											type="text"
											value={row.dimensionSpec}
											onChange={(e) =>
												handleRowChange(index, "dimensionSpec", e.target.value)
											}
											className="border p-2"
										/>
									</td>
									{/* No of Samples */}
									<td className="border p-2">
										<input
											type="number"
											value={row.noOfSamples}
											onChange={(e) =>
												handleRowChange(index, "noOfSamples", e.target.value)
											}
											className="border p-2"
										/>
									</td>
									{/* No of Specimen */}
									<td className="border p-2">
										<input
											type="number"
											value={row.noOfSpecimen}
											onChange={(e) =>
												handleRowChange(index, "noOfSpecimen", e.target.value)
											}
											className="border p-2"
										/>
									</td>
									{/* Assign Specimen ID */}
									<td className="border p-2">
										<SpecimenIdInput
											specimenIds={row.specimenIds}
											setSpecimenIds={(ids) =>
												handleSpecimenIdsChange(index, ids)
											}
											maxSpecimenCount={parseInt(row.noOfSpecimen, 10) || 0}
										/>
									</td>
									{/* Planned Test Date */}
									<td className="border p-2">
										<input
											type="date"
											value={row.plannedTestDate}
											onChange={(e) =>
												handleRowChange(
													index,
													"plannedTestDate",
													e.target.value
												)
											}
											className="border p-2"
										/>
									</td>
									{/* Request By */}
									<td className="border p-2">
										<input
											type="text"
											value={row.requestBy}
											onChange={(e) =>
												handleRowChange(index, "requestBy", e.target.value)
											}
											className="border p-2"
										/>
									</td>
									{/* Remarks */}
									<td className="border p-2">
										<textarea
											value={row.remarks}
											onChange={(e) =>
												handleRowChange(index, "remarks", e.target.value)
											}
											className="border p-2"
										/>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			<div className="mt-4">
				<button
					type="submit"
					className="bg-blue-500 text-white px-4 py-2 rounded">
					Submit Form
				</button>
			</div>
		</form>
	);
}

export default SampleRequestForm;
