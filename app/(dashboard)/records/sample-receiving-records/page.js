"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";
import TestMethodsDropdown from "@/components/common/TestMethodsDropdown";
import { testMethods } from "@/lib/constants";

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

const testTypes = [
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
const LabeledInput = ({ label, ...props }) => (
	<div className="mb-4">
		<Label className="font-bold text-gray-700">{label}</Label>
		<Input className="mt-1" {...props} />
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
		<tr>
			{/* Description */}
			<td className="p-2">
				<Textarea
					name="description"
					value={detail.description}
					onChange={handleChange}
					placeholder="Enter sample description"
					className="w-full"
				/>
			</td>
			{/* Type of Sample (Select Dropdown) */}
			<td className="p-2">
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
				</select>
			</td>
			{/* Test Type (Select Dropdown) */}
			<td className="p-2">
				<select
					name="testType"
					value={detail.testType}
					onChange={handleChange}
					className="w-full rounded border border-gray-300 p-2">
					<option value="">Select Test Type</option>
					{testTypes.map((test) => (
						<option key={test} value={test}>
							{test}
						</option>
					))}
				</select>
			</td>
			{/* Quantity */}
			<td className="p-2">
				<Input
					type="number"
					name="quantity"
					value={detail.quantity}
					onChange={handleChange}
					placeholder="Qty"
					className="w-full"
				/>
			</td>
			{/* Condition */}
			<td className="p-2">
				<Textarea
					name="condition"
					value={detail.condition}
					onChange={handleChange}
					placeholder="Sample Condition"
					className="w-full"
				/>
			</td>
			{/* Test Methods */}
			<td className="p-2">
				<TestMethodsDropdown
					options={testMethods}
					selected={detail.testMethods}
					onChange={(newSelected) => onTestMethodsChange(index, newSelected)}
				/>
			</td>
			{/* Count */}
			<td className="p-2 text-center">{detail.testMethods.length}</td>
			{/* Actions */}
			<td className="p-2 text-center">
				<Button
					variant="outline"
					onClick={() => onRemove(index)}
					className="bg-red-500 text-white hover:bg-red-600">
					<Trash className="w-4 h-4" />
				</Button>
			</td>
		</tr>
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
		<div className="overflow-x-auto overflow-y-hidden">
			<table className="w-full min-w-[1100px]">
				<thead className="bg-gray-200">
					<tr>
						<th className="p-2">Description</th>
						<th className="p-2">Type of Sample</th>
						<th className="p-2">Test Type</th>
						<th className="p-2">Qty</th>
						<th className="p-2">Condition</th>
						<th className="p-2">Test Methods</th>
						<th className="p-2">Count</th>
						<th className="p-2">Actions</th>
					</tr>
				</thead>
				<tbody>
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
				</tbody>
			</table>
		</div>
		<Button
			onClick={onAddRow}
			className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full">
			<Plus className="w-4 h-4 mr-2" /> Add Another Row
		</Button>
	</div>
);

/* Main Component */
const AddSampleLots = () => {
	const initialReceiveDate = new Date().toISOString().split("T")[0];

	// Global form state (without per-row fields)
	const [sample, setSample] = useState({
		clientName: "",
		projectName: "",
		receiveDate: initialReceiveDate,
		phone: "",
		receivedBy: "",
		remarks: "",
	});

	// Initialize sample details with per-row fields, including sampleType and testType as select values.
	const [sampleDetails, setSampleDetails] = useState([
		{
			description: "",
			sampleType: "",
			testType: "",
			quantity: "",
			condition: "",
			testMethods: [],
		},
	]);

	// Handler for changes in sample details (other than test methods)
	const handleChange = (index, e) => {
		const { name, value } = e.target;
		const updatedDetails = [...sampleDetails];
		updatedDetails[index][name] = value;
		setSampleDetails(updatedDetails);
	};

	// Handler for updating test methods in a sample detail row
	const handleTestMethodsChange = (index, newSelected) => {
		const updatedDetails = [...sampleDetails];
		updatedDetails[index].testMethods = newSelected;
		setSampleDetails(updatedDetails);
	};

	const addSampleDetailRow = () => {
		setSampleDetails([
			...sampleDetails,
			{
				description: "",
				sampleType: "",
				testType: "",
				quantity: "",
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

	const handleSubmit = () => {
		console.log("Sample Data Submitted:", { ...sample, sampleDetails });
		alert("Sample added successfully!");
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 md:p-6">
			<Card className="w-full max-w-7xl mx-4 bg-white shadow-md p-6">
				<CardHeader>
					<h2 className="text-xl font-bold text-gray-800 text-center">
						GRIPCO Material Testing Lab
					</h2>
					<p className="text-center text-gray-600">
						Global Resources Inspection Contracting Company
					</p>
				</CardHeader>

				<CardContent>
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
					{/* Sample Details Table */}
					<SampleDetailsTable
						sampleDetails={sampleDetails}
						onRowChange={handleChange}
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
						Add Sample
					</Button>
				</CardContent>
			</Card>
		</div>
	);
};

export default AddSampleLots;
