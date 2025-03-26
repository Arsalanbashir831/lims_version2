"use client";

import React, { useState, useEffect, useRef } from "react";
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
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription, // Added for better context
    CardFooter
} from "@/components/ui/card"; // Import Card components
import { toast } from "sonner";
import SpecimenIdInput from "@/components/common/SpecimenIdInput"; // Ensure path is correct
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { Plus, Trash2, Send, Loader2 } from "lucide-react"; // Icons
import { cn } from "@/lib/utils"; // For conditional classes

// Helper function to create a default row.
const getDefaultRow = () => ({
	itemNo: "",
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

// Component for a single testing item row (now a Card)
// Component for a single testing item row (now a Card)
function TestingItemCard({
	itemData,
	index,
	selectedJob,
	onRowChange,
	onSpecimenIdsChange,
	onRemoveRow,
	isOnlyRow,
}) {
	const handleInputChange = (field, value) => {
		onRowChange(index, field, value);
	};

    const handleSelectChange = (field, value) => {
        onRowChange(index, field, value);
    };

	// Add specific placeholder for date input
    const dateInputRef = useRef(null);
    const [isDateFocused, setIsDateFocused] = useState(false);


	return (
        // Subtle shadow, standard rounding
		<Card className="mb-4 shadow-sm border border-slate-200 rounded-lg">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-5 border-b bg-slate-50 rounded-t-lg">
                {/* Header text style closer to image */}
				<CardTitle className="text-base font-medium text-slate-800">
					Testing Item #{index + 1}
                    {itemData.itemDescription && ` - ${itemData.itemDescription}`}
				</CardTitle>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={() => onRemoveRow(index)}
					disabled={isOnlyRow}
                    className={cn("h-7 w-7", isOnlyRow && "invisible")} // Smaller button, hide if only row
                >
					<Trash2 className="h-4 w-4 text-destructive hover:text-red-700" />
                    <span className="sr-only">Remove Item</span>
				</Button>
			</CardHeader>
            {/* Increased padding and gaps */}
			<CardContent className="p-5 md:p-6">
                {/* Grid with increased gaps */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                    {/* --- Row 1 --- */}
                    {/* Item No Selection */}
					<div className="space-y-1"> {/* Reduced space */}
						<Label htmlFor={`itemNo-${index}`} className="text-xs font-medium text-slate-600">Select Job Item *</Label>
						<Select
							value={itemData.itemNo}
							onValueChange={(value) => handleSelectChange("itemNo", value)}
                            required
                        >
                            {/* Style trigger like input */}
							<SelectTrigger id={`itemNo-${index}`} className="h-9 bg-white border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500">
								<SelectValue placeholder="Select Sample Item" />
							</SelectTrigger>
							<SelectContent>
								{selectedJob?.sampleDetails?.map((item, idx) => (
									<SelectItem key={idx} value={String(idx)} className="text-sm">
										{item.itemNo || `Sample Item ${idx + 1}`} ({item.description})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

                    {/* Item Description (read-only) */}
                    <div className="space-y-1">
                        <Label htmlFor={`itemDesc-${index}`} className="text-xs font-medium text-slate-600">Item Description</Label>
                        <Input
                            id={`itemDesc-${index}`}
                            value={itemData.itemDescription}
                            readOnly
                            className="h-9 bg-slate-100 border-slate-200 text-sm cursor-default" // Read-only style
                        />
                    </div>

                    {/* Heat # (read-only) */}
                    <div className="space-y-1">
                        <Label htmlFor={`heatNo-${index}`} className="text-xs font-medium text-slate-600">Heat #</Label>
                        <Input
                            id={`heatNo-${index}`}
                            value={itemData.heatNo}
                            readOnly
                            className="h-9 bg-slate-100 border-slate-200 text-sm cursor-default" // Read-only style
                        />
                    </div>

                    {/* --- Row 2 --- */}
                    {/* Test Method Selection */}
                    <div className="space-y-1">
                        <Label htmlFor={`testMethod-${index}`} className="text-xs font-medium text-slate-600">Test Method *</Label>
                        <Select
                            value={itemData.testMethod}
                            onValueChange={(value) => handleSelectChange("testMethod", value)}
                            disabled={!itemData.availableTestMethods || itemData.availableTestMethods.length === 0}
                            required
                        >
                            <SelectTrigger id={`testMethod-${index}`} className="h-9 bg-white border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500">
                                <SelectValue placeholder="Select Test Method" />
                            </SelectTrigger>
                            <SelectContent>
                                {itemData.availableTestMethods?.map((method, idx) => (
                                    <SelectItem key={idx} value={method} className="text-sm">
                                        {method}
                                    </SelectItem>
                                ))}
                                {itemData.availableTestMethods?.length === 0 && (
                                    <div className="px-2 py-1.5 text-xs text-muted-foreground italic">No methods available</div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dimension/Specification */}
					<div className="space-y-1">
						<Label htmlFor={`dimensionSpec-${index}`} className="text-xs font-medium text-slate-600">Dimension/Specification & Location</Label>
						<Input
                            id={`dimensionSpec-${index}`}
							value={itemData.dimensionSpec}
							onChange={(e) => handleInputChange("dimensionSpec", e.target.value)}
                            placeholder="e.g., 10mm dia, Surface"
                            className="h-9 bg-white border-slate-300 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
						/>
					</div>

                    {/* No of Samples */}
                    <div className="space-y-1">
                        <Label htmlFor={`noOfSamples-${index}`} className="text-xs font-medium text-slate-600">No. of Samples *</Label>
                        <Input
                            id={`noOfSamples-${index}`}
                            type="number"
                            min="0"
                            value={itemData.noOfSamples}
                            onChange={(e) => handleInputChange("noOfSamples", e.target.value)}
                            required
                            className="h-9 bg-white border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* --- Row 3 --- */}
                    {/* No of Specimen */}
                    <div className="space-y-1">
                        <Label htmlFor={`noOfSpecimen-${index}`} className="text-xs font-medium text-slate-600">No. of Specimen *</Label>
                        <Input
                            id={`noOfSpecimen-${index}`}
                            type="number"
                            min="0"
                            value={itemData.noOfSpecimen}
                            onChange={(e) => handleInputChange("noOfSpecimen", e.target.value)}
                            required
                            className="h-9 bg-white border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                     {/* Planned Test Date */}
                    <div className="space-y-1 relative"> {/* Added relative for potential icon positioning */}
                        <Label htmlFor={`plannedTestDate-${index}`} className="text-xs font-medium text-slate-600">Planned Test Date</Label>
                        <Input
                            ref={dateInputRef}
                            id={`plannedTestDate-${index}`}
                            type={isDateFocused || itemData.plannedTestDate ? "date" : "text"} // Switch type based on focus/value
                            value={itemData.plannedTestDate}
                            placeholder="DD/MM/YYYY" // Show placeholder when type is text
                            onChange={(e) => handleInputChange("plannedTestDate", e.target.value)}
                            onFocus={() => setIsDateFocused(true)}
                            onBlur={() => setIsDateFocused(false)}
                            className="h-9 bg-white border-slate-300 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                        />
                         {/* Optional: You could absolutely position a Calendar icon here if needed */}
                         {/* <CalendarDays className="absolute right-3 top-[calc(0.25rem+0.6rem)] h-4 w-4 text-slate-400 pointer-events-none" /> */}
                    </div>

                    {/* Request By */}
                    <div className="space-y-1">
                        <Label htmlFor={`requestBy-${index}`} className="text-xs font-medium text-slate-600">Requested By</Label>
                        <Input
                            id={`requestBy-${index}`}
                            value={itemData.requestBy}
                            onChange={(e) => handleInputChange("requestBy", e.target.value)}
                            placeholder="Enter requester name"
                            className="h-9 bg-white border-slate-300 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* --- Row 4 (Spanning) --- */}
                    {/* Assign Specimen ID */}
                    <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                        <Label className="text-xs font-medium text-slate-600">Assign Specimen IDs (Count: {itemData.specimenIds?.length || 0} / Max: {parseInt(itemData.noOfSpecimen, 10) || 0}) *</Label>
                        <SpecimenIdInput
                            specimenIds={itemData.specimenIds}
                            setSpecimenIds={(ids) => onSpecimenIdsChange(index, ids)}
                            maxSpecimenCount={parseInt(itemData.noOfSpecimen, 10) || 0}
                             // Style the SpecimenIdInput's internal elements if needed
                        />
                         {/* Add validation message styling if SpecimenIdInput doesn't handle it */}
                        {(parseInt(itemData.noOfSpecimen, 10) > 0 && itemData.specimenIds.length !== parseInt(itemData.noOfSpecimen, 10)) && (
                           <p className="text-xs text-red-600 pt-0.5">Please assign exactly {itemData.noOfSpecimen} specimen IDs.</p>
                        )}
                    </div>

                    {/* Remarks */}
                    <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                        <Label htmlFor={`remarks-${index}`} className="text-xs font-medium text-slate-600">Remarks</Label>
                        <Textarea
                            id={`remarks-${index}`}
                            value={itemData.remarks}
                            onChange={(e) => handleInputChange("remarks", e.target.value)}
                            placeholder="Add any relevant remarks..."
                            rows={2}
                            className="bg-white border-slate-300 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
				</div>
			</CardContent>
		</Card>
	);
}

// --- Keep the SampleRequestForm component as is from the previous version ---
// (Including imports like useRef, CalendarDays if you add the icon)
// ... (rest of the SampleRequestForm logic) ...

function SampleRequestForm() {
	const router = useRouter();
	const [jobs, setJobs] = useState([]);
	const [selectedJobId, setSelectedJobId] = useState("");
	const [selectedJob, setSelectedJob] = useState(null);
	const [rows, setRows] = useState([getDefaultRow()]);
	const [loadingJobs, setLoadingJobs] = useState(true); // Loading state for jobs
	const [submitting, setSubmitting] = useState(false); // Submitting state

	// Fetch jobs
	useEffect(() => {
		const fetchJobs = async () => {
            setLoadingJobs(true);
			try {
				const res = await fetch("/api/jobs/"); // Ensure this endpoint is correct
				const data = await res.json();
				if (data.success) {
					setJobs(data.jobs);
				} else {
					toast.error(data.error || "Failed to fetch jobs");
				}
			} catch (err) {
				console.error("Failed to fetch jobs:", err);
				toast.error("Failed to fetch jobs");
			} finally {
                setLoadingJobs(false);
            }
		};
		fetchJobs();
	}, []);

	// Job selection handler
	const handleJobSelect = (value) => {
		setSelectedJobId(value);
		const job = jobs.find((j) => j.id === value);
		setSelectedJob(job);
        // Reset rows only if a *new* job is selected, keep if re-selecting the same job?
        // This resets every time for simplicity now.
		setRows([getDefaultRow()]);
	};

	// Add row handler
	const handleAddRow = () => {
		setRows([...rows, getDefaultRow()]);
	};

	// Remove row handler
	const handleRemoveRow = (index) => {
        // Already checked for rows.length > 1 inside the component, but double-check is fine
		if (rows.length > 1) {
            setRows(rows.filter((_, i) => i !== index));
		} else {
            toast.info("At least one testing item is required.");
        }
	};

	// Update row field handler
	const handleRowChange = (index, field, value) => {
		const newRows = [...rows];
		newRows[index][field] = value;

		if (field === "itemNo" && selectedJob) {
			const sampleDetails = selectedJob.sampleDetails || [];
			const sampleItem = sampleDetails.find((_, idx) => String(idx) === value);
			if (sampleItem) {
				newRows[index].itemDescription = sampleItem.description || "";
				newRows[index].heatNo = sampleItem.heatNo || "";
				newRows[index].availableTestMethods = Array.isArray(sampleItem.testMethods)
                    ? sampleItem.testMethods.map((method) => method?.test_name).filter(Boolean) // Handle potential missing test_name
                    : [];
                // Reset test method if available methods change
                if (!newRows[index].availableTestMethods.includes(newRows[index].testMethod)) {
                    newRows[index].testMethod = "";
                }
			} else {
				// Clear related fields if item number is invalid or cleared
                newRows[index].itemDescription = "";
				newRows[index].heatNo = "";
				newRows[index].availableTestMethods = [];
				newRows[index].testMethod = "";
			}
		}
		setRows(newRows);
	};

	// Specimen IDs update handler
	const handleSpecimenIdsChange = (index, newSpecimenIds) => {
		const newRows = [...rows];
		newRows[index].specimenIds = newSpecimenIds;
		setRows(newRows);
	};

	// Submit handler
	const handleSubmit = async (e) => {
		e.preventDefault();
        if (!selectedJobId || !selectedJob) {
            toast.error("Please select a Job first.");
            return;
        }
        // Basic Validation (example: check required fields in each row)
        for(let i = 0; i < rows.length; i++){
            const row = rows[i];
            if (!row.itemNo || !row.testMethod || !row.noOfSamples || !row.noOfSpecimen || (parseInt(row.noOfSpecimen, 10) > 0 && row.specimenIds.length !== parseInt(row.noOfSpecimen, 10)) ) {
                 toast.error(`Please complete all required (*) fields and assign the correct number of specimen IDs for Testing Item #${i + 1}.`);
                 return;
            }
        }

		setSubmitting(true);
        const toastId = toast.loading("Submitting testing request...");

		const payload = { jobId: selectedJob?.sample?.jobId, rows }; // Ensure jobId path is correct

		try {
			const res = await fetch("/api/testing-requests/new", { // Ensure endpoint is correct
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const result = await res.json();
			if (result.success) {
				toast.success("Request submitted successfully!", { id: toastId });
				// Reset form state after successful submission
                setSelectedJobId("");
                setSelectedJob(null);
                setRows([getDefaultRow()]);
				router.push(ROUTES.DASHBOARD.REQUESTS.INDEX); // Redirect
			} else {
				toast.error(result.error || "Failed to submit request.", { id: toastId });
			}
		} catch (err) {
			console.error("Submission error:", err);
			toast.error("An unexpected error occurred during submission.", { id: toastId });
		} finally {
            setSubmitting(false);
        }
	};

	return (
        // Use max-width and center the form
		<div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
            <form onSubmit={handleSubmit}>
                {/* Section 1: Job Selection */}
                <Card className="mb-6 shadow-sm">
                    <CardHeader>
                        <CardTitle>Select Job</CardTitle>
                        <CardDescription>Choose the Job containing the samples you want to request tests for.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingJobs ? (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin"/>
                                <span>Loading jobs...</span>
                            </div>
                        ) : (
                            <div className="max-w-md"> {/* Limit width of select */}
                                <Label htmlFor="job-select" className="sr-only">Select Job ID</Label>
                                <Select value={selectedJobId} onValueChange={handleJobSelect} required>
                                    <SelectTrigger id="job-select">
                                        <SelectValue placeholder="Select Job ID - Project Name" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobs.length > 0 ? (
                                            jobs.map((job) => (
                                                <SelectItem key={job.id} value={job.id}>
                                                    {job.sample?.jobId || 'N/A'} - {job.sample?.projectName || 'N/A'}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="px-2 py-1.5 text-sm text-muted-foreground italic">No jobs available</div>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Section 2: Testing Items (Only show if a job is selected) */}
                {selectedJobId && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-foreground mb-3">Testing Items</h2>
                        {rows.map((row, index) => (
                            <TestingItemCard
                                key={index} // Using index is okay if rows aren't drastically reordered, otherwise use unique IDs if available
                                itemData={row}
                                index={index}
                                selectedJob={selectedJob}
                                onRowChange={handleRowChange}
                                onSpecimenIdsChange={handleSpecimenIdsChange}
                                onRemoveRow={handleRemoveRow}
                                isOnlyRow={rows.length === 1}
                            />
                        ))}

                        {/* Add Row Button */}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddRow}
                            className="w-full border-dashed hover:bg-muted/50"
                            disabled={submitting}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Another Testing Item
                        </Button>
                    </div>
                )}

                {/* Section 3: Submission */}
                {selectedJobId && (
                     <div className="mt-8 flex justify-end">
                        <Button type="submit" disabled={submitting || rows.length === 0} size="lg">
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Submit Request
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </form>
		</div>
	);
}

export default SampleRequestForm;