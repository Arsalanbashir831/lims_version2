import React from "react";
import { testMethods } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import CertificateDetails from "./CertificateDetails";
import SpecimenSection from "./SpecimenSection";

export default function TestMethodCard({
	groupKey,
	row,
	values,
	onChange,
	sections,
	extraRows,
	addSection,
	onAddRow,
	onRemoveRow,
	onRemoveSection,
	selected,
	customCols,
	setCustomCols,
}) {
	// Find base test columns
	const baseColumns =
		testMethods.find((t) => t.test_name === row.testMethod)?.test_columns || [];

	return (
		<Card className="mb-6 shadow-sm">
			<CardHeader>
				<CardTitle>{row.testMethod}</CardTitle>
			</CardHeader>
			<CardContent>
				{/* Certificate details section */}
				<CertificateDetails
					groupKey={groupKey}
					row={row.certificateDetails || row}
					values={values}
					onChange={onChange}
					selected={selected}
				/>

				{/* Add specimen button */}
				<div className="flex justify-end items-center mb-4">
					<Button
						onClick={() => addSection(groupKey)}
						disabled={!sections[groupKey]}>
						Add Specimen
					</Button>
				</div>

				{/* Render each specimen section */}
				{sections[groupKey]?.map((idx) => (
					<SpecimenSection
						key={idx}
						groupKey={groupKey}
						idx={idx}
						row={row}
						columns={baseColumns}
						values={values}
						onChange={onChange}
						extraIds={extraRows[`${groupKey}-specimen-${idx}`] || []}
						onAddRow={onAddRow}
						onRemoveRow={onRemoveRow}
						onRemoveSection={onRemoveSection}
						customCols={customCols}
						setCustomCols={setCustomCols}
					/>
				))}

				{/* Remarks field */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Remarks
					</label>
					<Input
						type="text"
						value={values[`remarks-${groupKey}`] || row.remarks || ""}
						onChange={(e) => onChange(`remarks-${groupKey}`, e.target.value)}
						placeholder="Add any remarks"
						className="w-full"
					/>
				</div>

				{/* Footer inputs: Tested By and Witnessed By */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							Tested By
						</label>
						<Input
							type="text"
							value={
								values[`cert-${groupKey}-testedBy`] ||
								row.footer?.testedBy ||
								""
							}
							onChange={(e) =>
								onChange(`cert-${groupKey}-testedBy`, e.target.value)
							}
							placeholder="Tested By"
						/>
					</div>
					<div className="flex flex-col">
						<label className="text-sm font-medium text-gray-700 mb-1">
							Witnessed By
						</label>
						<Input
							type="text"
							value={
								values[`cert-${groupKey}-witnessedBy`] ||
								row.footer?.witnessedBy ||
								""
							}
							onChange={(e) =>
								onChange(`cert-${groupKey}-witnessedBy`, e.target.value)
							}
							placeholder="Witnessed By"
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
