"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";
import TestMethodsDropdown from "@/components/common/TestMethodsDropdown";
import { testMethods } from "@/lib/constants";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
					type="number"
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
				</select>
			</TableCell>
			{/* Material Type */}
			<TableCell className="p-2">
				<select
					name="materialType"
					value={detail.materialType}
					onChange={handleChange}
					className="w-full rounded border border-gray-300 p-2">
					<option value="">Select Material Type</option>
					{materialTypes.map((material) => (
						<option key={material} value={material}>
							{material}
						</option>
					))}
				</select>
			</TableCell>
			{/* Heat No. */}
			<TableCell className="p-2">
				<Input
					type="number"
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

const SampleLotForm = ({ initialData, onSubmit }) => {
	const defaultSample = {
		clientName: "",
		projectName: "",
		endUser: "",
		receiveDate: new Date().toISOString().split("T")[0],
		phone: "",
		receivedBy: "",
		remarks: "",
	};
	const defaultDetails = [
		{
			description: "",
			mtcNo: "",
			sampleType: "",
			materialType: "",
			heatNo: "",
			condition: "",
			testMethods: [],
		},
	];

	const [sample, setSample] = useState(initialData?.sample || defaultSample);
	const [sampleDetails, setSampleDetails] = useState(
		initialData?.sampleDetails || defaultDetails
	);

	const handleChange = (index, e) => {
		const { name, value } = e.target;
		const updatedDetails = [...sampleDetails];
		updatedDetails[index][name] = value;
		setSampleDetails(updatedDetails);
	};

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
				mtcNo: "",
				sampleType: "",
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

	const handleSubmit = () => {
		onSubmit({ sample, sampleDetails });
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
		</div>
	);
};

export default SampleLotForm;
