"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ReusableTable from "@/components/common/ReusableTable";

const Page = () => {
	const router = useRouter();

	const columns = [
		{ key: "jobId", label: "Job ID" },
		{ key: "sampleId", label: "Sample ID" },
		{ key: "clientName", label: "Client Name" },
		{ key: "projectName", label: "Project Name" },
	];

	const [data, setData] = useState([
		{
			jobId: "J001",
			sampleId: "S001",
			clientName: "ABC Corp",
			projectName: "Project Alpha",
		},
		{
			jobId: "J002",
			sampleId: "S002",
			clientName: "XYZ Ltd",
			projectName: "Project Beta",
		},
	]);

	// onEdit receives rowIndex from the ReusableTable. We then extract jobId and redirect.
	const handleEdit = (rowIndex) => {
		const record = data[rowIndex];
		router.push(`/lab-management/test-certificates/${record.jobId}`);
	};

	// Dummy delete callback (you can update as needed)
	const handleDelete = (rowIndex) => {
		setData(data.filter((_, idx) => idx !== rowIndex));
	};

	return (
		<div className="p-6 bg-gray-100 min-h-screen">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-800 mb-4">
					Lab Test Records
				</h1>
				<p className="text-gray-600 mb-6">
					Overview of all sample records with associated job information.
				</p>
				<ReusableTable
					columns={columns}
					data={data}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			</div>
		</div>
	);
};

export default Page;
