"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Trash, Download } from "lucide-react";

const ReusableSampleLotsTable = ({
	columns,
	data,
	onPreview,
	onEdit,
	onDelete,
	onDownload,
}) => {
	return (
		<div className="overflow-x-auto bg-white shadow-md rounded-lg md:max-w-6xl mx-auto">
			<Table className="w-full">
				<TableHeader>
					<TableRow className="bg-gray-200">
						{columns.map((col) => (
							<TableHead key={col.key} className="p-3 text-center">
								{col.label}
							</TableHead>
						))}
						<TableHead className="p-3 text-center">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.length > 0 ? (
						data.map((row, index) => (
							<TableRow key={index} className="border-b border-gray-200">
								{columns.map((col) => (
									<TableCell key={col.key} className="p-3 text-center">
										{col.key === "testMethods" && Array.isArray(row[col.key])
											? row[col.key].map((method, idx) => (
													<span
														key={idx}
														className="inline-block bg-blue-500 text-white px-2 py-1 rounded-full mr-1">
														{method}
													</span>
											  ))
											: row[col.key]}
									</TableCell>
								))}
								<TableCell className="p-3 text-center flex justify-center gap-2">
									<Button
										variant="outline"
										onClick={() => onPreview(row)}
										className="bg-blue-500 text-white hover:bg-blue-600">
										<Eye className="w-4 h-4" />
									</Button>
									<Button
										variant="outline"
										onClick={() => onEdit(row)}
										className="bg-green-500 text-white hover:bg-green-600">
										<Pencil className="w-4 h-4" />
									</Button>
									<Button
										variant="outline"
										onClick={() => onDelete(row)}
										className="bg-red-500 text-white hover:bg-red-600">
										<Trash className="w-4 h-4" />
									</Button>
									<Button
										variant="outline"
										onClick={() => onDownload(row)}
										className="bg-purple-500 text-white hover:bg-purple-600">
										<Download className="w-4 h-4" />
									</Button>
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columns.length + 1}
								className="text-center p-3">
								No sample lots available.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};

export default ReusableSampleLotsTable;
