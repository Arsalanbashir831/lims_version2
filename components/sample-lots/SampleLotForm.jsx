"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";
import TestMethodsDropdown from "@/components/common/TestMethodsDropdown";
import { ROUTES, testMethods } from "@/lib/constants";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Arrays for select options
const typeOfSamples = [
	"carbon steel",
	"stainless steel",
	"nickle",
	"duplex ss",
	"cast iron",
	"cs",
	"zinc coated",
	"flanges",
];

const materialTypes = [
	"round",
	"plate",
	"pipe",
	"fitting",
	"fastner",
	"clad pipe",
	"pipe",
	"flanges",
	"sheet",
	"cs",
];

/* Reusable form field components */
const LabeledInput = ({ label, readOnly, ...props }) => (
	<div className="mb-4">
		<Label className="font-bold text-gray-700">{label}</Label>
		<Input className="mt-1" readOnly={readOnly} {...props} />
	</div>
);

const LabeledTextarea = ({ label, ...props }) => (
	<div className="mb-4">
		<Label className="font-bold text-gray-700">{label}</Label>
		<Textarea className="mt-1" {...props} />
	</div>
);

/* Component for a single row in the Sample Details table */
const SampleDetailRow = ({
	index,
	detail,
	onChange,
	onTestMethodsChange,
	onRemove,
}) => {
	const handleChange = (e) => {
		onChange(index, e);
	};

	return (
		<TableRow>
			{/* Description */}
			<TableCell className="p-2">
				<Textarea
					name="description"
					value={detail.description}
					onChange={handleChange}
					placeholder="Enter sample description"
					className="w-full"
				/>
			</TableCell>
			{/* MTC No. */}
			<TableCell className="p-2">
				<Input
					name="mtcNo"
					value={detail.mtcNo}
					onChange={handleChange}
					placeholder="MTC No."
					className="w-full"
				/>
			</TableCell>
			{/* Type of Sample */}
			<TableCell className="p-2">
				<select
					name="sampleType"
					value={detail.sampleType}
					onChange={handleChange}
					className="w-full rounded border border-gray-300 p-2">
					<option value="">Select Type of Sample</option>
					{typeOfSamples.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
					<option value="Other">Other</option>
				</select>
				{detail.sampleType === "Other" && (
					<Input
						name="customSampleType"
						value={detail.customSampleType || ""}
						onChange={handleChange}
						placeholder="Enter custom sample type"
						className="mt-2 w-full"
					/>
				)}
			</TableCell>
			{/* Material Type */}
			<TableCell className="p-2">
				<select
					name="materialType"
					value={detail.materialType}
					onChange={handleChange}
					className="w-full rounded border border-gray-300 p-2">
					<option value="">Select Material Type</option>
					{materialTypes.map((material, index) => (
						<option key={index} value={material}>
							{material}
						</option>
					))}
				</select>
			</TableCell>
			{/* Heat No. */}
			<TableCell className="p-2">
				<Input
					name="heatNo"
					value={detail.heatNo}
					onChange={handleChange}
					placeholder="Heat No."
					className="w-full"
				/>
			</TableCell>
			{/* Condition */}
			<TableCell className="p-2">
				<Textarea
					name="condition"
					value={detail.condition}
					onChange={handleChange}
					placeholder="Sample Condition"
					className="w-full"
				/>
			</TableCell>
			{/* Test Methods */}
			<TableCell className="p-2">
				<TestMethodsDropdown
					options={testMethods}
					selected={detail.testMethods}
					onChange={(newSelected) => onTestMethodsChange(index, newSelected)}
				/>
			</TableCell>
			{/* Number Test */}
			<TableCell className="p-2 text-center">
				{detail.testMethods.length}
			</TableCell>
			{/* Actions */}
			<TableCell className="p-2 text-center">
				<Button
					variant="outline"
					onClick={() => onRemove(index)}
					className="bg-red-500 text-white hover:bg-red-600">
					<Trash className="w-4 h-4" />
				</Button>
			</TableCell>
		</TableRow>
	);
};

/* Component for the entire Sample Details table */
const SampleDetailsTable = ({
	sampleDetails,
	onRowChange,
	onTestMethodsChange,
	onAddRow,
	onRemoveRow,
}) => (
	<div className="p-3 mb-4">
		<h3 className="font-bold text-gray-700 mb-3">Sample Details</h3>
		{/* Wrap table in a scrollable container */}
		<ScrollArea className="max-w-full">
			<Table className="min-w-[1100px] w-full">
				<TableHeader className="bg-gray-200">
					<TableRow>
						<TableHead className="p-2">Description</TableHead>
						<TableHead className="p-2">MTC Number</TableHead>
						<TableHead className="p-2">Type of Sample</TableHead>
						<TableHead className="p-2">Material Type</TableHead>
						<TableHead className="p-2">Heat No.</TableHead>
						<TableHead className="p-2">Condition</TableHead>
						<TableHead className="p-2">Test Methods</TableHead>
						<TableHead className="p-2">Number Test</TableHead>
						<TableHead className="p-2">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sampleDetails.map((detail, index) => (
						<SampleDetailRow
							key={index}
							index={index}
							detail={detail}
							onChange={onRowChange}
							onTestMethodsChange={onTestMethodsChange}
							onRemove={onRemoveRow}
						/>
					))}
				</TableBody>
			</Table>
			<ScrollBar orientation="horizontal" />
		</ScrollArea>
		<Button
			onClick={onAddRow}
			className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full">
			<Plus className="w-4 h-4 mr-2" /> Add Another Row
		</Button>
	</div>
);

const SampleLotForm = ({
	initialSample = null,
	initialSampleDetails = null,
	jobDocId = null,
}) => {
	const router = useRouter();
	// Default sample for a new job lot
	const defaultSample = {
		clientName: "",
		projectName: "",
		endUser: "",
		receiveDate: new Date().toISOString().split("T")[0],
		phone: "",
		receivedBy: "",
		remarks: "",
	};

	// Default sample details
	const defaultDetails = [
		{
			itemNo: "",
			description: "",
			mtcNo: "",
			sampleType: "",
			customSampleType: "",
			materialType: "",
			heatNo: "",
			condition: "",
			testMethods: [],
		},
	];

	// Initialize sample details with transformation: if initial sample type doesn't match, set as "Other"
	const [sampleDetails, setSampleDetails] = useState(() => {
		if (initialSampleDetails) {
			return initialSampleDetails.map((detail) => {
				if (detail.sampleType && !typeOfSamples.includes(detail.sampleType)) {
					return {
						...detail,
						customSampleType: detail.sampleType,
						sampleType: "Other",
					};
				}
				return detail;
			});
		}
		return defaultDetails;
	});

	// Use initial sample if provided or default sample
	const [sample, setSample] = useState(
		initialSample ? initialSample : defaultSample
	);

	const handleDetailChange = (index, e) => {
		const { name, value } = e.target;
		const updatedDetails = [...sampleDetails];
		updatedDetails[index][name] = value;
		setSampleDetails(updatedDetails);
	};

	const handleTestMethodsChange = (index, newSelected) => {
		// Filter each selected test method to only include test_id and test_name
		const filtered = newSelected.map((method) => ({
			test_id: method.test_id,
			test_name: method.test_name,
		}));
		const updatedDetails = [...sampleDetails];
		updatedDetails[index].testMethods = filtered;
		setSampleDetails(updatedDetails);
	};

	const addSampleDetailRow = () => {
		setSampleDetails([
			...sampleDetails,
			{
				itemNo: "",
				description: "",
				mtcNo: "",
				sampleType: "",
				customSampleType: "",
				materialType: "",
				heatNo: "",
				condition: "",
				testMethods: [],
			},
		]);
	};

	const removeSampleDetailRow = (index) => {
		const updatedDetails = sampleDetails.filter((_, i) => i !== index);
		setSampleDetails(updatedDetails);
	};

	const handleSampleFieldChange = (e) => {
		setSample({ ...sample, [e.target.name]: e.target.value });
	};

	// Submit handler – if jobDocId exists, update the job; otherwise, create a new sample lot.
	const handleSubmit = async () => {
		try {
			// Transform sampleDetails: if sampleType is "Other", use the customSampleType value.
			const transformedSampleDetails = sampleDetails.map((detail) => {
				const effectiveSampleType =
					detail.sampleType === "Other"
						? detail.customSampleType
						: detail.sampleType;
				// Optionally, omit customSampleType from the payload.
				const { customSampleType, ...rest } = detail;
				return { ...rest, sampleType: effectiveSampleType };
			});

			const endpoint = jobDocId ? `/api/jobs/${jobDocId}` : "/api/jobs/new";
			const method = jobDocId ? "PUT" : "POST";

			const response = await fetch(endpoint, {
				method: method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					sample,
					sampleDetails: transformedSampleDetails,
				}),
			});

			if (!response.ok) {
				throw new Error(
					jobDocId ? "Failed to update sample lot" : "Failed to add sample lot"
				);
			}

			// The API response might include the generated jobId and updated sampleDetails.
			const result = await response.json();
			toast.success(
				jobDocId ? "Job updated successfully" : "Job added successfully"
			);
			// Reset the form after successful submission
			setSample(defaultSample);
			setSampleDetails(defaultDetails);
			router.push(ROUTES.DASHBOARD.JOBS.INDEX);
		} catch (error) {
			console.error(
				jobDocId ? "Error updating sample lot:" : "Error adding sample lot:",
				error
			);
			toast.error(
				jobDocId ? "Error updating sample lot." : "Error adding sample lot."
			);
		}
	};

	return (
		<div>
			{/* Top-level fields */}
			<LabeledInput
				label="Client Name"
				type="text"
				name="clientName"
				value={sample.clientName}
				onChange={handleSampleFieldChange}
				placeholder="Enter Client Name"
			/>
			<LabeledInput
				label="Project Name"
				type="text"
				name="projectName"
				value={sample.projectName}
				onChange={handleSampleFieldChange}
				placeholder="Enter Project Name"
			/>
			<LabeledInput
				label="End User"
				type="text"
				name="endUser"
				value={sample.endUser}
				onChange={handleSampleFieldChange}
				placeholder="Enter End User"
			/>
			{/* Sample Details Table */}
			<SampleDetailsTable
				sampleDetails={sampleDetails}
				onRowChange={handleDetailChange}
				onTestMethodsChange={handleTestMethodsChange}
				onAddRow={addSampleDetailRow}
				onRemoveRow={removeSampleDetailRow}
			/>
			{/* Receiving Details */}
			<LabeledInput
				label="Receive Date"
				type="date"
				name="receiveDate"
				value={sample.receiveDate}
				onChange={handleSampleFieldChange}
			/>
			<LabeledInput
				label="Phone No."
				type="tel"
				name="phone"
				value={sample.phone}
				onChange={handleSampleFieldChange}
				placeholder="Enter phone number"
			/>
			<LabeledInput
				label="Received By"
				type="text"
				name="receivedBy"
				value={sample.receivedBy}
				onChange={handleSampleFieldChange}
				placeholder="Enter receiver's name"
			/>
			<LabeledTextarea
				label="Remarks"
				name="remarks"
				value={sample.remarks}
				onChange={handleSampleFieldChange}
				placeholder="Additional remarks"
			/>
			<div className="border-t border-gray-400 pt-4 text-sm text-gray-700">
				<h3 className="font-bold">Terms & Conditions</h3>
				<p>
					Sample will be discarded after one month without any prior
					notification.
				</p>
			</div>
			<Button
				onClick={handleSubmit}
				className="w-full bg-blue-600 mt-6 hover:bg-blue-700 text-white">
				{jobDocId ? "Save Changes" : "Add Sample"}
			</Button>
		</div>
	);
};

export default SampleLotForm;
