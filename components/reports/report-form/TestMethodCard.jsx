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
}) {
	const columns =
		testMethods.find((t) => t.test_name === row.testMethod)?.test_columns || [];
	return (
		<Card className="mb-6 shadow-sm">
			<CardHeader>
				<CardTitle>{row.testMethod}</CardTitle>
			</CardHeader>
			<CardContent>
				<CertificateDetails
					groupKey={groupKey}
					row={row}
					values={values}
					onChange={onChange}
					selected={selected}
				/>
				<div className="flex justify-end items-center mb-4">
					<Button
						variant=""
						onClick={() => addSection(groupKey)}
						disabled={!sections[groupKey]}>
						Add Specimen
					</Button>
				</div>
				{sections[groupKey]?.map((idx) => (
					<SpecimenSection
						key={idx}
						groupKey={groupKey}
						idx={idx}
						row={row}
						columns={columns}
						values={values}
						onChange={onChange}
						extraIds={extraRows[`${groupKey}-specimen-${idx}`] || []}
						onAddRow={onAddRow}
						onRemoveRow={onRemoveRow}
						onRemoveSection={onRemoveSection}
					/>
				))}
				{/* Remarks Field */}
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
			</CardContent>
		</Card>
	);
}
