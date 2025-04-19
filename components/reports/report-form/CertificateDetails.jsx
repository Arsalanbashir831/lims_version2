import { Input } from "@/components/ui/input";
import { CERT_FIELDS } from "@/lib/constants";
import React from "react";

export default function CertificateDetails({
	groupKey,
	row,
	values,
	onChange,
	selected,
}) {
	console.log("CertificateDetails", { groupKey, row, values, selected });
	const defaults = {
		clientNameCert: row.clientNameCert || selected.clientName,
		projectNameCert: selected.projectName,
		gripcoRefNo: row.gripcoRefNo || selected.jobId,
		dateOfSampling: selected.sampleDate?.split("T")[0],
		issueDate: new Date().toISOString().split("T")[0],
		dateOfTesting: row.plannedTestDate,
		mtcNo: row.mtcNo,
		testMethod: row.testMethod,
		customerNameNo: row.customerNameNo,
		customerPO: row.customerPO,
		sampleDescription: row.itemDescription,
		revisionNo: row.revisionNo,
		poNumber: row.poNumber,
		attn: row.attn,
		labName:
			row.labName || "GLOBAL RESOURCE INSPECTION CONTRACTING COMPANY-DAMMAM",
		labAddress:
			row.labAddress || "P.O. Box 100, Dammam 31411, Kingdom of Saudi Arabia",
		materialGrade: row.materialGrade,
		temperature: row.temperature,
		humidity: row.humidity,
		samplePrepMethod: row.samplePrepMethod,
		testEquipment: row.testEquipment,
	};

	return (
		<div className="p-4 border rounded bg-gray-50 mb-4">
			<h3 className="text-lg font-bold mb-3">Certificate Details</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{CERT_FIELDS.map(({ key, label, type }) => {
					const fieldKey = `cert-${groupKey}-${key}`;
					const val = values[fieldKey] ?? defaults[key] ?? "";
					return (
						<div key={fieldKey} className="flex flex-col">
							<label className="text-sm font-medium text-gray-700">
								{label}
							</label>
							<Input
								type={type}
								value={val}
								onChange={(e) => onChange(fieldKey, e.target.value)}
								placeholder={label}
							/>
						</div>
					);
				})}
			</div>
		</div>
	);
}
