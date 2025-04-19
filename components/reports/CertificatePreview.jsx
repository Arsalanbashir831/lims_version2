"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ExcelJS from "exceljs";
import QRCode from "qrcode"; // For generating the QR code data URI
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import Certificate from "@/components/reports/Certificate";

// Utility to fetch a URL as a data URI:
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
	const [isDownloading, setIsDownloading] = useState(false);

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

	console.log("Certificate Data:", certificateData);

	// -----------------------
	//   1) EXCEL Download
	// -----------------------
	const downloadExcel = async () => {
		if (!certificateData) return;

		// 1) Prepare images as data URIs (GRIPCO logo, IAS logo, QR code)
		const gripcoLogoDataUri = await fetchAsDataURI("/logo.jpg");
		const iasLogoDataUri = await fetchAsDataURI("/ias_logo.jpg");
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

		// 2) Create a new workbook and a single worksheet
		const workbook = new ExcelJS.Workbook();
		workbook.creator = "GRIPCO";
		workbook.created = new Date();

		const worksheet = workbook.addWorksheet("Certificates");

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

		// Example: add GRIPCO logo to the sheet
		if (logoGripcoBuffer) {
			const gripcoLogoId = workbook.addImage({
				buffer: logoGripcoBuffer,
				extension: "jpeg",
			});
			worksheet.addImage(gripcoLogoId, {
				tl: { col: 0, row: 0 },
				ext: { width: 200, height: 70 },
			});
		}

		// Initialize a row counter to keep track of where to add the next certificate block.
		let currentRow = 3; // Starting after images/header

		const { groups = [] } = certificateData;
		for (let g = 0; g < groups.length; g++) {
			const group = groups[g];
			const { specimenSections = [] } = group;

			for (let s = 0; s < specimenSections.length; s++) {
				const specimen = specimenSections[s];

				// --- Certificate Header ---
				worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
				const titleCell = worksheet.getCell(`A${currentRow}`);
				titleCell.value = "TEST CERTIFICATE";
				titleCell.alignment = { horizontal: "center" };
				titleCell.font = { bold: true, size: 14 };
				currentRow++;

				// --- Certificate Info (Left Column) ---
				const certInfo = group.certificateDetails || {};
				let rowIndexLeft = currentRow;
				function setLabelValue(label, value) {
					const labelCell = worksheet.getCell(`A${rowIndexLeft}`);
					labelCell.value = label;
					labelCell.font = { bold: true };
					const valueCell = worksheet.getCell(`B${rowIndexLeft}`);
					valueCell.value = value || "N/A";
					rowIndexLeft++;
				}
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

				// --- Certificate Info (Right Column) ---
				let rowIndexRight = currentRow;
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

				// Update currentRow to the maximum of the two sides
				currentRow = Math.max(rowIndexLeft, rowIndexRight) + 1;

				// --- Specimen & Test Method Title ---
				worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
				const specTitleCell = worksheet.getCell(`A${currentRow}`);
				specTitleCell.value = `Specimen ${specimen.specimenId || "N/A"} – ${
					group.testMethod || "N/A"
				}`;
				specTitleCell.font = { bold: true, size: 12 };
				specTitleCell.alignment = { horizontal: "left" };
				currentRow++;

				// --- Table Data ---
				const tableData = specimen.tableData || [];
				if (tableData.length > 0) {
					// Determine the columns (skipping any "images" field)
					const columns = Object.keys(tableData[0]).filter(
						(col) => col.toLowerCase() !== "images"
					);

					// Insert table header at the current row
					let headerRow = currentRow;
					columns.forEach((colName, idx) => {
						const cell = worksheet.getCell(headerRow, idx + 1);
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
					currentRow++;

					// Insert table rows
					for (let r = 0; r < tableData.length; r++) {
						const rowObj = tableData[r];
						columns.forEach((colName, cIdx) => {
							const cell = worksheet.getCell(currentRow, cIdx + 1);
							cell.value = rowObj[colName] ?? "";
							cell.alignment = { vertical: "top", wrapText: true };
							cell.border = {
								top: { style: "thin" },
								left: { style: "thin" },
								right: { style: "thin" },
								bottom: { style: "thin" },
							};
						});
						currentRow++;
					}
				}

				// --- Tested By / Witnessed By ---
				let signRow = currentRow;
				worksheet.getCell(`A${signRow}`).value = "Tested By:";
				worksheet.getCell(`A${signRow}`).font = { bold: true };
				worksheet.getCell(`B${signRow}`).value =
					group.footer?.testedBy || "N/A";

				worksheet.getCell(`D${signRow}`).value = "Witnessed By:";
				worksheet.getCell(`D${signRow}`).font = { bold: true };
				worksheet.getCell(`E${signRow}`).value =
					group.footer?.witnessedBy || "N/A";
				currentRow = signRow + 2;

				// --- Disclaimers ---
				function setDisclaimer(text) {
					worksheet.mergeCells(`A${currentRow}:H${currentRow}`);
					const cell = worksheet.getCell(`A${currentRow}`);
					cell.value = text;
					cell.font = { size: 10 };
					cell.alignment = { wrapText: true };
					currentRow++;
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

				// Add an empty row as a separator between certificates
				currentRow++;
			}
		}

		// Optional: adjust page setup for printing on the single worksheet
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

	// -----------------------
	//   2) PDF Download
	// -----------------------
	const downloadPdf = async () => {
		// Select each certificate element based on your structure.
		// Here we assume that each certificate preview is the inner div with classes "mb-6 rounded"
		const certificateElements = document.querySelectorAll(
			"#certificate-content .certificate-preview"
		);
		if (!certificateElements.length) return;

		setIsDownloading(true);
		// Create a new jsPDF instance (A4 size)
		const pdf = new jsPDF({
			orientation: "portrait",
			unit: "in",
			format: "a4",
		});
		const pdfWidth = pdf.internal.pageSize.getWidth();
		const pdfHeight = pdf.internal.pageSize.getHeight();

		// Iterate over each certificate element
		for (let i = 0; i < certificateElements.length; i++) {
			const element = certificateElements[i];

			// Force each certificate to start on a new page (except the very first certificate)
			if (i > 0) {
				pdf.addPage();
			}

			// Render the certificate element to a canvas using html2canvas
			const canvas = await html2canvas(element, {
				scale: 2,
				useCORS: true,
			});
			const canvasWidth = canvas.width;
			const canvasHeight = canvas.height;

			// Calculate the canvas height corresponding to one PDF page
			const segmentHeight = (pdfHeight * canvasWidth) / pdfWidth;
			const totalSegments = Math.ceil(canvasHeight / segmentHeight);

			// Split the certificate canvas into segments (pages)
			for (let j = 0; j < totalSegments; j++) {
				// For segments after the first in this certificate, add a new page
				if (j > 0) {
					pdf.addPage();
				}

				// Determine the height of the current segment (the last segment might be shorter)
				const currentSegmentHeight =
					j === totalSegments - 1
						? canvasHeight - j * segmentHeight
						: segmentHeight;

				// Create a temporary canvas to hold this segment
				const segmentCanvas = document.createElement("canvas");
				segmentCanvas.width = canvasWidth;
				segmentCanvas.height = currentSegmentHeight;
				const segmentCtx = segmentCanvas.getContext("2d");

				// Draw the corresponding segment from the main canvas
				segmentCtx.drawImage(
					canvas,
					0,
					j * segmentHeight, // source y coordinate
					canvasWidth,
					currentSegmentHeight, // source height
					0,
					0,
					canvasWidth,
					currentSegmentHeight // destination height
				);

				const segmentDataUrl = segmentCanvas.toDataURL("image/png");
				// Calculate the rendered height for the PDF page
				const renderedSegmentHeight =
					(currentSegmentHeight * pdfWidth) / canvasWidth;
				pdf.addImage(
					segmentDataUrl,
					"PNG",
					0,
					0,
					pdfWidth,
					renderedSegmentHeight
				);
			}
		}

		// Save the generated PDF file
		pdf.save("certificate.pdf");
		setIsDownloading(false);
	};

	if (loading) return <p>Loading...</p>;
	if (!certificateData) return <p>Certificate not found.</p>;

	return (
		<div className="container mx-auto p-4">
			{showButton && (
				<div className="flex space-x-2 justify-end mb-4">
					{/* <Button onClick={downloadExcel}>Download Excel</Button> */}
					<Button disabled={isDownloading} onClick={downloadPdf}>
						{isDownloading ? "Downloading..." : "Download PDF"}
					</Button>
				</div>
			)}
			<div id="certificate-content">
				{certificateData.groups?.map((group, groupIdx) => (
					<div key={`group-${groupIdx}`} className="mb-8">
						{group.specimenSections?.map((specimen, specimenIdx) => (
							<div
								key={`group-${groupIdx}-specimen-${specimenIdx}`}
								className="mb-6 rounded certificate-preview">
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
						))}
					</div>
				))}
			</div>
		</div>
	);
}
