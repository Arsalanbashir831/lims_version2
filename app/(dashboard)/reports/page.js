"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash } from "lucide-react";
import { IASLogo } from "@/components/common/IASLogo";

function CertificatesPage() {
	const router = useRouter();
	// State to hold the list of certificate records.
	const [data, setData] = useState([]);

	// Fetch certificates on mount.
	useEffect(() => {
		const fetchCertificates = async () => {
			try {
				const res = await fetch("/api/certificates/");
				const result = await res.json();
				if (result.success) {
					// Map certificate data to table rows.
					const mappedData = result.certificates.map((cert) => {
						const details =
							cert.groups && cert.groups.length > 0
								? cert.groups[0].certificateDetails
								: {};
						return {
							id: cert.id,
							certificateNumber: cert.issuanceNumber || "",
							requestId: cert.requestId,
							issueDate: details.issueDate || "",
							clientName: details.clientNameCert || "",
							projectName: details.projectNameCert || "",
							labName: details.labName || "",
							raw: cert, // store full object for preview/edit if needed
						};
					});

					setData(mappedData);
				} else {
					toast.error(result.error || "Failed to fetch certificates");
				}
			} catch (error) {
				console.error("Error fetching certificates:", error);
				toast.error("Error fetching certificates");
			}
		};
		fetchCertificates();
	}, []);

	// Handlers for preview, edit, and delete actions.
	const handlePreview = (row) => {
		// Navigate to /reports/[id]
		router.push(`/reports/${row.id}/preview`);
	};

	const handleEdit = (row) => {
		// Navigate to /reports/[id]
		router.push(`/reports/${row.id}`);
	};

	const handleDelete = async (row) => {
		try {
			const res = await fetch(`/api/certificates/${row.id}`, {
				method: "DELETE",
			});
			const result = await res.json();
			if (result.success) {
				setData(data.filter((item) => item.id !== row.id));
				toast.success("Certificate deleted successfully");
			} else {
				toast.error(result.error || "Failed to delete certificate");
			}
		} catch (error) {
			console.error("Error deleting certificate:", error);
			toast.error("Error deleting certificate");
		}
	};

	// Define columns for the certificates table.
	const columns = [
		{ key: "certificateNumber", label: "Certificate #" },
		{ key: "requestId", label: "Request #" },
		{ key: "issueDate", label: "Issue Date" },
		{ key: "clientName", label: "Client" },
		{ key: "projectName", label: "Project" },
		{ key: "labName", label: "Laboratory" },
	];

	return (
		<div className="container mx-auto p-4 sm:p-6 lg:p-8 md:max-w-5xl">
			<div className="flex justify-between items-end mb-6">
				<h1 className="text-2xl font-semibold text-gray-800 mb-6">
					Certificates
				</h1>
				<IASLogo />
			</div>
			{/* Certificates Table */}
			<div className="overflow-x-auto">
				<Table>
					<TableHeader className="bg-gray-200">
						<TableRow>
							{columns.map((col) => (
								<TableHead key={col.key} className="p-2 border">
									{col.label}
								</TableHead>
							))}
							<TableHead className="p-2 border">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((row) => (
							<TableRow key={row.id} className="border-b">
								{columns.map((col) => (
									<TableCell key={col.key} className="p-2 border">
										{row[col.key]}
									</TableCell>
								))}
								<TableCell className="p-2 border">
									<div className="flex gap-2">
										<Button
											size="sm"
											onClick={() => handlePreview(row)}
											className="bg-blue-500 text-white hover:bg-blue-600">
											<Eye className="w-4 h-4" />
										</Button>
										<Button
											size="sm"
											onClick={() => handleEdit(row)}
											className="bg-green-500 text-white hover:bg-green-600">
											<Pencil className="w-4 h-4" />
										</Button>
										<Button
											size="sm"
											variant="destructive"
											onClick={() => handleDelete(row)}
											className="bg-red-500 text-white hover:bg-red-600">
											<Trash className="w-4 h-4" />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<ScrollArea className="mt-4">
				<ScrollBar orientation="horizontal" />
			</ScrollArea>
		</div>
	);
}

export default CertificatesPage;
