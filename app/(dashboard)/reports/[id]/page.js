"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReportForm from "@/components/reports/ReportForm";
export default function EditReportPage() {
	// Get the dynamic id from the route parameters.
	const { id } = useParams();
	const [reportData, setReportData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Fetch the certificate/report data from your API
		async function fetchReport() {
			try {
				const res = await fetch(`/api/certificates/${id}`);
				if (!res.ok) {
					throw new Error("Failed to fetch report data");
				}
				const data = await res.json();
				setReportData(data);
			} catch (error) {
				console.error("Error fetching report:", error);
			} finally {
				setLoading(false);
			}
		}
		fetchReport();
	}, [id]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!reportData) {
		return <div>Error: Report data not found.</div>;
	}

	return (
		<div className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-4">Edit Report {id}</h1>
			{/* Pass the fetched data as a prop to pre-populate the form */}
			<ReportForm initialData={reportData} />
		</div>
	);
}
