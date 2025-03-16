import React, { useState, useEffect } from "react";
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
import { toast } from "sonner";
import SpecimenIdInput from "@/components/common/SpecimenIdInput";

// Helper function to create a default row.
const getDefaultRow = () => ({
	itemNo: "", // index (as string) corresponding to the sampleDetails array
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
	// States for jobs, selected job, job ID, and form rows.
	const [jobs, setJobs] = useState([]);
	const [selectedJobId, setSelectedJobId] = useState("");
	const [selectedJob, setSelectedJob] = useState(null);
	const [rows, setRows] = useState([getDefaultRow()]);
	const [loading, setLoading] = useState(false);

	// Fetch jobs from the API endpoint when the component mounts.
	useEffect(() => {
		const fetchJobs = async () => {
			try {
				const res = await fetch("/api/jobs/");
				const data = await res.json();
				if (data.success) {
					setJobs(data.jobs);
				} else {
					toast.error(data.error || "Failed to fetch jobs");
				}
			} catch (err) {
				console.error("Failed to fetch jobs:", err);
				toast.error("Failed to fetch jobs");
			}
		};

		fetchJobs();
	}, []);

	// When a job is selected, update selectedJob and reset rows.
	const handleJobSelect = (value) => {
		setSelectedJobId(value);
		const job = jobs.find((j) => j.id === value);
		setSelectedJob(job);
		setRows([getDefaultRow()]);
	};

	// Add a new testing item row.
	const handleAddRow = () => {
		setRows([...rows, getDefaultRow()]);
	};

	// Remove a row if more than one row exists.
	const handleRemoveRow = (index) => {
		if (rows.length > 1) {
			const newRows = [...rows];
			newRows.splice(index, 1);
			setRows(newRows);
		}
	};

	// Update a row field. For "itemNo" selection, auto-fill details from job's sampleDetails.
	const handleRowChange = (index, field, value) => {
		const newRows = [...rows];
		newRows[index][field] = value;

		if (field === "itemNo" && selectedJob) {
			const sampleDetails = selectedJob.sampleDetails || [];
			// Find the sample item using the provided index.
			const sampleItem = sampleDetails.find((_, idx) => String(idx) === value);
			if (sampleItem) {
				newRows[index].itemDescription = sampleItem.description;
				newRows[index].heatNo = sampleItem.heatNo;
				// Convert testMethods from objects to an array of strings.
				newRows[index].availableTestMethods = sampleItem.testMethods.map(
					(method) => method.test_name
				);
				newRows[index].testMethod = "";
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

	// Submit the testing request.
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		// Send only the jobId (extracted from selectedJob.sample.jobId) and rows.
		const payload = { jobId: selectedJob?.sample?.jobId, rows };
		try {
			const res = await fetch("/api/testing-requests/new", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const result = await res.json();
			if (result.success) {
				console.log("Testing request submitted with ID:", result.requestId);
				toast.success("Request submitted successfully");
				setRows([getDefaultRow()]);
			} else {
				console.error("Error submitting testing request:", result.error);
				toast.error(result.error || "Failed to submit request");
			}
		} catch (err) {
			console.error("Submission error:", err);
			toast.error("Failed to submit request");
		}
		setLoading(false);
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
						{jobs.map((job) => (
							<SelectItem key={job.id} value={job.id}>
								{job.sample.jobId} - {job.sample.projectName}
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
													{selectedJob?.sampleDetails?.map((item, idx) => (
														<SelectItem key={idx} value={String(idx)}>
															{item.itemNo || `Item ${idx + 1}`}
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
				<Button type="submit" disabled={loading}>
					{loading ? "Submitting..." : "Submit Form"}
				</Button>
			</div>
		</form>
	);
}

export default SampleRequestForm;
