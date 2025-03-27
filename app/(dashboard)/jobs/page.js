"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import ReusableSampleLotsTable from "@/components/common/ReusableSlotsTable";
import { getBase64FromUrl, restrictUser } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IASLogo } from "@/components/common/IASLogo";
import { getAuth } from "firebase/auth";

const SampleLotsPage = () => {
	// Table columns – these keys should exist at the top level of each job record.
	const columns = [
		{ key: "jobId", label: "Job Id" },
		{ key: "projectName", label: "Project Name" },
		{ key: "clientName", label: "Client Name" },
		{ key: "sampleDate", label: "Sample Date" },
		{ key: "noItems", label: "No Items" },
		{ key: "endUser", label: "End User" },
	];

	const [data, setData] = useState([]);
	const [userRole, setUserRole] = useState(null);
	const [selectedRow, setSelectedRow] = useState(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const router = useRouter();

	// Fetch job records from the API and flatten the nested sample object.
	const fetchJobs = async () => {
		try {
			// Get current user
			const auth = getAuth();
			const currentUser = auth.currentUser;
			if (!currentUser) {
				console.error("No user is currently logged in.");
				return;
			}
			const userId = currentUser.uid;

			const res = await fetch(`/api/jobs?userId=${userId}`, { method: "GET" });
			const json = await res.json();
			if (res.ok) {
				// Flatten each job by merging the top-level "sample" fields.
				const flattenedJobs = json.jobs.map((job) => {
					const sample = job.sample || {};
					return {
						id: job.id,
						jobId: sample.jobId,
						projectName: sample.projectName,
						clientName: sample.clientName,
						sampleDate: sample.receiveDate, // using receiveDate as sample date
						noItems: job.sampleDetails ? job.sampleDetails.length : 0,
						endUser: sample.endUser,
						sampleDetails: job.sampleDetails,
					};
				});
				setData(flattenedJobs);
				setUserRole(json.userRole || null);
			} else {
				toast.error(json.error || "Failed to fetch jobs");
			}
		} catch (error) {
			console.error("Error fetching jobs:", error);
			toast.error("Error fetching jobs.");
		}
	};

	useEffect(() => {
		fetchJobs();
	}, []);

	// Open preview dialog
	const handlePreview = (row) => {
		setSelectedRow(row);
		setIsDialogOpen(true);
	};

	// Navigate to edit page when edit is clicked
	const handleEdit = (row) => {
		if (!restrictUser(userRole)) {
			router.push(`/jobs/${row.id}`);
		} else {
			toast.error("You do not have permission to edit this job.");
		}
	};

	// Call API to delete a job and refresh the list
	const handleDelete = async (row) => {
		try {
			const res = await fetch(`/api/jobs/${row.id}`, { method: "DELETE" });
			const json = await res.json();
			if (res.ok) {
				toast.success("Job deleted successfully");
				fetchJobs();
			} else {
				toast.error(json.error || "Failed to delete job");
			}
		} catch (error) {
			console.error("Error deleting job:", error);
			toast.error("Error deleting job.");
		}
	};

	// Row-specific Excel download callback remains unchanged.
	const handleDownload = async (row) => {
		try {
			const dataUrl = await getBase64FromUrl("/logo.jpg");
			const base64String = dataUrl.split("base64,")[1];
			const rightLogoUrl = await getBase64FromUrl("/ias_logo.jpg");
			const rightLogoBase64String = rightLogoUrl.split("base64,")[1];
			const payload = {
				fileName: `Sample_${row.jobId}.xlsx`,
				logoBase64: base64String,
				rightLogoBase64: rightLogoBase64String,
				sampleInfo: {
					jobId: row.jobId,
					projectName: row.projectName,
					clientName: row.clientName,
					sampleDate: row.sampleDate,
					noItems: row.noItems,
					endUser: row.endUser,
				},
				sampleDetails: (row.sampleDetails || []).map((detail) => ({
					...detail,
					testMethods: detail.testMethods
						? detail.testMethods.map((method) => method.test_name).join(", ")
						: "",
				})),
			};

			const response = await fetch("/api/sample-export-excel", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) throw new Error("Failed to download Excel file");

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = payload.fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} catch (error) {
			console.error("Error downloading Excel file:", error);
		}
	};

	return (
		<div className="p-6 bg-gray-100 min-h-screen">
			<div className="mx-auto container">
				<div className="flex justify-between items-end mb-6">
					<h1 className="text-2xl font-semibold text-gray-800 mb-6">
						Job Records
					</h1>
					<IASLogo />
				</div>
				<ReusableSampleLotsTable
					columns={columns}
					data={data}
					onPreview={handlePreview}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onDownload={handleDownload}
					isEditingDisabled={restrictUser(userRole)}
				/>
			</div>

			{/* Preview dialog remains available */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="p-6 !max-w-3xl mx-auto">
					<DialogTitle className="text-center text-xl font-bold mb-4">
						Preview Job Record
					</DialogTitle>
					{selectedRow && (
						<div className="space-y-4">
							{columns.map((col) => (
								<div key={col.key} className="flex justify-between">
									<span className="font-medium">{col.label}:</span>
									<span>{selectedRow[col.key]}</span>
								</div>
							))}
							{selectedRow.sampleDetails?.length > 0 && (
								<div className="mt-4">
									<h3 className="font-medium mb-2">Sample Details</h3>
									<table className="w-full border-collapse">
										<thead className="bg-gray-200">
											<tr>
												<th className="p-2 border">Description</th>
												<th className="p-2 border">MTC No</th>
												<th className="p-2 border">Sample Type</th>
												<th className="p-2 border">Material Type</th>
												<th className="p-2 border">Heat No</th>
												<th className="p-2 border">Condition</th>
												<th className="p-2 border">Test Methods</th>
											</tr>
										</thead>
										<tbody>
											{selectedRow.sampleDetails.map((detail, index) => (
												<tr key={index} className="border-b">
													<td className="p-2 border">{detail.description}</td>
													<td className="p-2 border">{detail.mtcNo}</td>
													<td className="p-2 border">{detail.sampleType}</td>
													<td className="p-2 border">{detail.materialType}</td>
													<td className="p-2 border">{detail.heatNo}</td>
													<td className="p-2 border">{detail.condition}</td>
													<td className="p-2 border">
														{detail.testMethods
															?.map((tm) => tm.test_name)
															.join(", ")}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
							<div className="flex justify-end mt-4">
								<Button onClick={() => setIsDialogOpen(false)}>Close</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default SampleLotsPage;
