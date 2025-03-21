"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import htmlDocx from "html-docx-js/dist/html-docx";
import ExcelJS from "exceljs";
import QRCode from "qrcode"; // For generating the QR code data URI
import { Button } from "@/components/ui/button";
import { generateCertificateHTML } from "@/lib/utils"; // Your existing docx generator
import Certificate from "@/components/reports/Certificate";

// If you have a utility to fetch a URL as a data URI:
async function fetchAsDataURI(url) {
	try {
		const res = await fetch(url);
		const blob = await res.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch (err) {
		console.error("Error fetching image:", err);
		return null;
	}
}

const pageBreakStyle = {
	pageBreakAfter: "always",
	breakAfter: "page",
};

export default function CertificatePreview({
	certificateId,
	showButton = true,
}) {
	const params = useParams();
	const id = certificateId || params?.id;

	const [certificateData, setCertificateData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchCertificate() {
			try {
				const res = await fetch(`/api/certificates/${id}`);
				if (!res.ok) throw new Error("Failed to fetch certificate data");
				const data = await res.json();
				setCertificateData(data.certificate);
			} catch (error) {
				console.error("Error fetching certificate:", error);
			} finally {
				setLoading(false);
			}
		}
		if (id) fetchCertificate();
	}, [id]);

	// -----------------------
	//   1) DOCX Download
	// -----------------------
	// const downloadDocx = async () => {
	// 	if (!certificateData) return;
	// 	const groupHTMLs = [];

	// 	for (const group of certificateData.groups || []) {
	// 		for (const specimenSection of group.specimenSections || []) {
	// 			// Create a group object that overrides tableData with this specimen's tableData.
	// 			const groupForSpecimen = {
	// 				...group,
	// 				tableData: specimenSection.tableData,
	// 				specimenId: specimenSection.specimenId,
	// 			};
	// 			const singleCertHTML = await generateCertificateHTML(
	// 				certificateData,
	// 				groupForSpecimen
	// 			);
	// 			groupHTMLs.push(`
	//         <div style="page-break-after: always;">
	//           ${singleCertHTML}
	//         </div>
	//       `);
	// 		}
	// 	}

	// 	const finalHTML = `
	//     <html>
	//       <head><meta charset="UTF-8"><title>Certificates</title></head>
	//       <body style="margin: 0; padding: 0;">
	//         ${groupHTMLs.join("")}
	//       </body>
	//     </html>
	//   `;

	// 	const blob = htmlDocx.asBlob(finalHTML);
	// 	const url = URL.createObjectURL(blob);
	// 	const link = document.createElement("a");
	// 	link.href = url;
	// 	link.download = "certificate.docx";
	// 	document.body.appendChild(link);
	// 	link.click();
	// 	document.body.removeChild(link);
	// 	URL.revokeObjectURL(url);
	// };

	// -----------------------
	//   2) EXCEL Download
	// -----------------------
	const downloadExcel = async () => {
		if (!certificateData) return;

		// 1) Prepare images as data URIs (GRIPCO logo, IAS logo, QR code)
		const gripcoLogoDataUri = await fetchAsDataURI("/logo.jpg");
		const iasLogoDataUri = await fetchAsDataURI("/ias_logo.jpg");
		// Build the livePreviewUrl if you do the same as in generateCertificateHTML
		const livePreviewUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/public/certificate/${certificateData.requestId}`;
		const qrCodeDataUri = await QRCode.toDataURL(livePreviewUrl, {
			margin: 1,
			width: 60,
		});

		// Convert each data URI to a buffer
		const logoGripcoBuffer = gripcoLogoDataUri
			? Buffer.from(gripcoLogoDataUri.split(",")[1], "base64")
			: null;
		const logoIasBuffer = iasLogoDataUri
			? Buffer.from(iasLogoDataUri.split(",")[1], "base64")
			: null;
		const qrCodeBuffer = qrCodeDataUri
			? Buffer.from(qrCodeDataUri.split(",")[1], "base64")
			: null;

		// 2) Create a new workbook
		const workbook = new ExcelJS.Workbook();

		// Optional: Set workbook properties
		workbook.creator = "GRIPCO";
		workbook.created = new Date();

		// For each group + specimen, create a new worksheet
		const { groups = [] } = certificateData;
		for (let g = 0; g < groups.length; g++) {
			const group = groups[g];
			const { specimenSections = [] } = group;

			for (let s = 0; s < specimenSections.length; s++) {
				const specimen = specimenSections[s];
				const sheetName = `G${g + 1}-S${s + 1}`;
				const worksheet = workbook.addWorksheet(sheetName);

				// ---------- Insert images into the workbook ----------
				let gripcoLogoId, iasLogoId, qrCodeId;
				if (logoGripcoBuffer) {
					gripcoLogoId = workbook.addImage({
						buffer: logoGripcoBuffer,
						extension: "jpeg",
					});
				}
				if (logoIasBuffer) {
					iasLogoId = workbook.addImage({
						buffer: logoIasBuffer,
						extension: "jpeg",
					});
				}
				if (qrCodeBuffer) {
					qrCodeId = workbook.addImage({
						buffer: qrCodeBuffer,
						extension: "png",
					});
				}

				// Set some column widths so we have space
				worksheet.columns = [
					{ width: 20 }, // Col A
					{ width: 20 }, // Col B
					{ width: 20 }, // Col C
					{ width: 20 }, // Col D
					{ width: 20 }, // Col E
					{ width: 20 }, // Col F
					{ width: 20 }, // Col G
					{ width: 20 }, // Col H
				];

				// Insert the images in row 1, adjusting the positions as needed.
				// Example: GRIPCO logo on left, IAS + QR code on the right.
				if (gripcoLogoId) {
					worksheet.addImage(gripcoLogoId, {
						tl: { col: 0, row: 0 }, // top-left corners
						ext: { width: 200, height: 70 }, // size in px
					});
				}
				if (iasLogoId) {
					worksheet.addImage(iasLogoId, {
						tl: { col: 6, row: 0 },
						ext: { width: 50, height: 70 },
					});
				}
				if (qrCodeId) {
					worksheet.addImage(qrCodeId, {
						tl: { col: 7, row: 0 },
						ext: { width: 60, height: 60 },
					});
				}

				// We can merge some cells for the "Test Certificate" title
				worksheet.mergeCells("A3", "H3");
				const titleCell = worksheet.getCell("A3");
				titleCell.value = "TEST CERTIFICATE";
				titleCell.alignment = { horizontal: "center" };
				titleCell.font = { bold: true, size: 14 };

				// -------------- Certificate Info (left column) --------------
				// We'll place these in row 5-20 or so, adjusting as needed
				// You can also merge cells if you want a single wide cell.
				const certInfo = group.certificateDetails || {};
				// Some convenient row index references
				let rowIndex = 5;
				function setLabelValue(label, value) {
					// Label in col A, value in col B
					const labelCell = worksheet.getCell(`A${rowIndex}`);
					labelCell.value = label;
					labelCell.font = { bold: true };
					const valueCell = worksheet.getCell(`B${rowIndex}`);
					valueCell.value = value || "N/A";
					rowIndex++;
				}

				// Left side
				setLabelValue(
					"Client Name:",
					certInfo.clientNameCert || certificateData.clientName
				);
				setLabelValue("PO #:", certInfo.poNumber);
				setLabelValue("Customer Name:", certInfo.customerNameNo);
				setLabelValue("Atten:", certInfo.attn);
				setLabelValue(
					"Project Name:",
					certInfo.projectNameCert || certificateData.projectName
				);
				setLabelValue("MTC No:", certInfo.mtcNo);
				setLabelValue("Name of Laboratory:", certInfo.labName);
				setLabelValue("Address:", certInfo.labAddress);
				setLabelValue("Sample Desc:", certInfo.sampleDescription);
				setLabelValue("Material Grade:", certInfo.materialGrade);
				setLabelValue("Temperature:", certInfo.temperature);
				setLabelValue("Humidity:", certInfo.humidity);
				setLabelValue("Test Equipment:", certInfo.testEquipment);
				setLabelValue("Test Method:", certInfo.testMethod);
				setLabelValue("Sample Prep:", certInfo.samplePrepMethod);

				// -------------- Certificate Info (right column) --------------
				// Let's do it from col F and G
				let rowIndexRight = 5;
				function setLabelValueRight(label, value) {
					const labelCell = worksheet.getCell(`F${rowIndexRight}`);
					labelCell.value = label;
					labelCell.font = { bold: true };
					const valueCell = worksheet.getCell(`G${rowIndexRight}`);
					valueCell.value = value || "N/A";
					rowIndexRight++;
				}

				setLabelValueRight("Date of Sampling:", certInfo.dateOfSampling);
				setLabelValueRight("Date of Testing:", certInfo.dateOfTesting);
				setLabelValueRight("Issue Date:", certInfo.issueDate);
				setLabelValueRight(
					"Gripco Ref No:",
					certInfo.gripcoRefNo || certificateData.gripcoRefNo
				);
				setLabelValueRight("Issuance #:", certificateData.issuanceNumber);
				setLabelValueRight("Revision #:", certInfo.revisionNo);

				// -------------- Specimen & TestMethod Title --------------
				worksheet.mergeCells("A21", "H21");
				const specTitleCell = worksheet.getCell("A21");
				specTitleCell.value = `Specimen ${specimen.specimenId || "N/A"} – ${
					group.testMethod || "N/A"
				}`;
				specTitleCell.font = { bold: true, size: 12 };
				specTitleCell.alignment = { horizontal: "left" };

				// -------------- Table Data --------------
				const tableData = specimen.tableData || [];
				if (tableData.length > 0) {
					const columns = Object.keys(tableData[0]).filter(
						(col) => col.toLowerCase() !== "images"
					);

					// We'll place the table header at row 23
					let tableStartRow = 23;
					let colStart = 1; // 'A' is col 1 in ExcelJS
					// Insert header row
					columns.forEach((colName, idx) => {
						const cell = worksheet.getCell(tableStartRow, colStart + idx);
						cell.value = colName;
						cell.font = { bold: true };
						cell.alignment = { horizontal: "center" };
						cell.border = {
							top: { style: "thin" },
							left: { style: "thin" },
							right: { style: "thin" },
							bottom: { style: "thin" },
						};
						cell.fill = {
							type: "pattern",
							pattern: "solid",
							fgColor: { argb: "FFDCE6F1" },
						};
					});

					// Insert rows
					for (let r = 0; r < tableData.length; r++) {
						const rowObj = tableData[r];
						const excelRow = worksheet.getRow(tableStartRow + 1 + r);
						columns.forEach((colName, cIdx) => {
							const cell = excelRow.getCell(colStart + cIdx);
							cell.value = rowObj[colName] ?? "";
							cell.alignment = { vertical: "top", wrapText: true };
							cell.border = {
								top: { style: "thin" },
								left: { style: "thin" },
								right: { style: "thin" },
								bottom: { style: "thin" },
							};
						});
					}
				}

				// -------------- Tested By / Witnessed By --------------
				let signRow = 25 + tableData.length; // Some offset after the table
				worksheet.getCell(`A${signRow}`).value = "Tested By:";
				worksheet.getCell(`A${signRow}`).font = { bold: true };
				worksheet.getCell(`B${signRow}`).value =
					group.footer?.testedBy || "N/A";

				worksheet.getCell(`D${signRow}`).value = "Witnessed By:";
				worksheet.getCell(`D${signRow}`).font = { bold: true };
				worksheet.getCell(`E${signRow}`).value =
					group.footer?.witnessedBy || "N/A";

				// -------------- Disclaimers --------------
				let disclaimRow = signRow + 2;
				// We'll merge disclaimers across columns A->H, each line in a separate row
				function setDisclaimer(text) {
					worksheet.mergeCells(`A${disclaimRow}:H${disclaimRow}`);
					const cell = worksheet.getCell(`A${disclaimRow}`);
					cell.value = text;
					cell.font = { size: 10 };
					cell.alignment = { wrapText: true };
					disclaimRow++;
				}

				setDisclaimer("Commercial Registration No: 2015253768");
				setDisclaimer(
					"All Works and services carried out by GRIPCO Material Testing Saudia..."
				);
				setDisclaimer(
					"This document may not be reproduced other than in full except with the prior written approval..."
				);
				setDisclaimer(
					"These results relate only to the item(s) tested/sampling conducted..."
				);
				setDisclaimer(
					"No deviations were observed during the testing process."
				);

				// Optional: adjust page setup for printing
				worksheet.pageSetup = {
					paperSize: 9, // A4
					orientation: "portrait",
					fitToPage: true,
					fitToWidth: 1,
					fitToHeight: 0,
					margins: {
						left: 0.3,
						right: 0.3,
						top: 0.5,
						bottom: 0.5,
						header: 0,
						footer: 0,
					},
				};
			}
		}

		// 3) Write the workbook to a file for download
		const buffer = await workbook.xlsx.writeBuffer();
		const blob = new Blob([buffer], { type: "application/octet-stream" });
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = "certificate.xlsx";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	if (loading) return <p>Loading...</p>;
	if (!certificateData) return <p>Certificate not found.</p>;

	return (
		<div className="container mx-auto p-4">
			{showButton && (
				<div className="flex space-x-2 justify-end mb-4">
					<Button onClick={downloadExcel}>Download Excel</Button>
				</div>
			)}
			<div id="certificate-content">
				{certificateData.groups?.map((group, groupIdx) => (
					<div key={`group-${groupIdx}`} className="mb-8">
						{group.specimenSections?.map((specimen, specimenIdx) => {
							return (
								<div
									key={`group-${groupIdx}-specimen-${specimenIdx}`}
									className="mb-6 rounded">
									{/* Render your HTML/React certificate preview here */}
									<Certificate
										certificate={certificateData}
										group={{
											...group,
											tableData: specimen.tableData,
											specimenId: specimen.specimenId,
										}}
										pageStyle={pageBreakStyle}
										hideImageColumn={true}
									/>
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
}
