"use client";

import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const columns = [
	{ key: "jobAssigned", label: "Job Assigned #" },
	{ key: "requestNumber", label: "Request #" },
	{ key: "requestDate", label: "Request Date" },
	{ key: "client", label: "Client" },
	{ key: "project", label: "Project" },
	{ key: "totalSamples", label: "Total no of Samples" },
	{ key: "plannedTestDate", label: "Planned Test Date" },
	{ key: "requestBy", label: "Request By" },
	{ key: "remarks", label: "Remarks" },
];

const sampleRequests = [
	{
		jobAssigned: "J101",
		requestNumber: "REQ001",
		requestDate: "2024-04-11",
		client: "ABC Corp",
		project: "Project Alpha",
		totalSamples: 5,
		plannedTestDate: "2024-04-15",
		requestBy: "John Doe",
		remarks: "Urgent",
	},
	{
		jobAssigned: "J102",
		requestNumber: "REQ002",
		requestDate: "2024-04-12",
		client: "XYZ Ltd.",
		project: "Project Beta",
		totalSamples: 2,
		plannedTestDate: "2024-04-18",
		requestBy: "Jane Smith",
		remarks: "",
	},
];

function SubmittedRequestsPage() {
	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-4">Submitted Requests</h1>
			<div className="overflow-x-auto bg-white shadow-md rounded-lg">
				<Table className="w-full">
					<TableHeader>
						<TableRow className="bg-gray-200">
							{columns.map((col) => (
								<TableHead key={col.key} className="p-3 text-center">
									{col.label}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{sampleRequests.length > 0 ? (
							sampleRequests.map((row, index) => (
								<TableRow key={index} className="border-b border-gray-200">
									{columns.map((col) => (
										<TableCell key={col.key} className="p-3 text-center">
											{row[col.key]}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="text-center p-3">
									No requests available.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}

export default SubmittedRequestsPage;
