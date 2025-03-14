import React, { useState } from "react";
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
			<Input
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Enter ID and press Enter"
				className="flex-1 outline-none"
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
	// Initialize with one default row.
	const [rows, setRows] = useState([getDefaultRow()]);

	// When a job is selected, set the job data and reset rows.
	const handleJobSelect = (value) => {
		setSelectedJobId(value);
		const job = sampleJobs.find((j) => j.jobId === value);
		setSelectedJob(job);
		setRows([getDefaultRow()]);
	};

	// Add a new row.
	const handleAddRow = () => {
		setRows([...rows, getDefaultRow()]);
	};

	// Remove a row (only if more than one row exists).
	const handleRemoveRow = (index) => {
		if (rows.length > 1) {
			const newRows = [...rows];
			newRows.splice(index, 1);
			setRows(newRows);
		}
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
				<Label className="block font-medium mb-1">Select Job ID:</Label>
				<Select value={selectedJobId} onValueChange={handleJobSelect}>
					<SelectTrigger className="w-full">
						<SelectValue placeholder="Select Job" />
					</SelectTrigger>
					<SelectContent>
						{sampleJobs.map((job) => (
							<SelectItem key={job.jobId} value={job.jobId}>
								{job.jobId} - {job.projectName}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{rows.length > 0 && (
				<>
					<div className="overflow-x-auto mb-4">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Item No.</TableHead>
									<TableHead>Item Description</TableHead>
									<TableHead>Test Method</TableHead>
									<TableHead>Heat #</TableHead>
									<TableHead>
										Dimension/Specification &amp; Specimen Location
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
								{rows.map((row, index) => (
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
													{selectedJob?.sampleDetails.map((item, idx) => (
														<SelectItem key={idx} value={String(idx)}>
															{`Item ${idx + 1}`}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</TableCell>
										{/* Item Description (auto-filled) */}
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
													{row.availableTestMethods?.map((method, idx) => (
														<SelectItem key={idx} value={method}>
															{method}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</TableCell>
										{/* Heat # (auto-filled) */}
										<TableCell>
											<Input
												value={row.heatNo}
												readOnly
												className="bg-gray-100"
											/>
										</TableCell>
										{/* Dimension/Specification & Specimen Location */}
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
													handleRowChange(index, "noOfSamples", e.target.value)
												}
											/>
										</TableCell>
										{/* No of Specimen */}
										<TableCell>
											<Input
												type="number"
												value={row.noOfSpecimen}
												onChange={(e) =>
													handleRowChange(index, "noOfSpecimen", e.target.value)
												}
											/>
										</TableCell>
										{/* Assign Specimen ID */}
										<TableCell>
											<SpecimenIdInput
												specimenIds={row.specimenIds}
												setSpecimenIds={(ids) =>
													handleSpecimenIdsChange(index, ids)
												}
												maxSpecimenCount={parseInt(row.noOfSpecimen, 10) || 0}
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
													handleRowChange(index, "requestBy", e.target.value)
												}
											/>
										</TableCell>
										{/* Remarks */}
										<TableCell>
											<Textarea
												value={row.remarks}
												onChange={(e) =>
													handleRowChange(index, "remarks", e.target.value)
												}
											/>
										</TableCell>
										{/* Actions */}
										<TableCell>
											<Button
												type="button"
												onClick={() => handleRemoveRow(index)}
												disabled={rows.length === 1}
												variant="destructive">
												Remove
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<div className="mb-4">
						<Button type="button" onClick={handleAddRow} className="w-full">
							Add Row
						</Button>
					</div>
				</>
			)}

			<div className="mt-4">
				<Button type="submit">Submit Form</Button>
			</div>
		</form>
	);
}

export default SampleRequestForm;
