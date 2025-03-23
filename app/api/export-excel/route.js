import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

export async function POST(req) {
	try {
		// Parse request body
		const { columns, data, fileName, logoBase64, imagePath } = await req.json();

		// Create a new workbook and worksheet
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Records");

		// Set column widths for a professional layout
		worksheet.columns = [
			{ header: "A", width: 25 },
			{ header: "B", width: 40 },
			{ header: "C", width: 20 },
			{ header: "D", width: 20 },
			{ header: "E", width: 20 },
			{ header: "F", width: 20 },
		];

		// Process Logo:
		// Priority: If logoBase64 is provided, use it; else if imagePath is provided, attempt to read from local file.
		let logoImageId;
		if (logoBase64) {
			// Use base64 directly (make sure to remove any prefix if present)
			logoImageId = workbook.addImage({ base64: logoBase64, extension: "jpg" });
		} else if (imagePath) {
			const absoluteLogoPath = path.join(process.cwd(), "public", imagePath);
			if (fs.existsSync(absoluteLogoPath)) {
				const logoBuffer = fs.readFileSync(absoluteLogoPath);
				logoImageId = workbook.addImage({
					buffer: logoBuffer,
					extension: "jpg",
				});
			}
		}

		// Insert the logo into the worksheet (if available)
		if (logoImageId !== undefined && logoImageId !== null) {
			// Merge cells A1:C1 as the image container
			worksheet.mergeCells("A1:B1");
			worksheet.addImage(logoImageId, {
				tl: { col: 0, row: 0 },
				br: { col: 2, row: 1 },
				editAs: "oneCell",
			});
			worksheet.getRow(1).height = 80;
		}

		// Create Header Section (start header text at row 3 to avoid overlapping the logo)
		worksheet.mergeCells("B3:E3");
		const titleCell = worksheet.getCell("B3");
		titleCell.value = "GRIPCO MATERIAL TESTING";
		titleCell.font = { bold: true, size: 16 };
		titleCell.alignment = { horizontal: "center", vertical: "middle" };
		worksheet.getRow(3).height = 25;

		worksheet.mergeCells("B4:E4");
		const coordinatorCell = worksheet.getCell("B4");
		coordinatorCell.value =
			"LIMS Coordinator on authority of GRIPCO MATERIAL TESTING";
		coordinatorCell.font = { bold: true, size: 12 };
		coordinatorCell.alignment = { horizontal: "center", vertical: "middle" };
		worksheet.getRow(4).height = 20;

		worksheet.mergeCells("B6:E6");
		const recordTitle = worksheet.getCell("B6");
		recordTitle.value = fileName || "Testing Records";
		recordTitle.font = { bold: true, size: 12 };
		recordTitle.alignment = { horizontal: "center" };

		// Write Table Data: Start table at row 11
		let currentRow = 7;
		const headerRow = worksheet.getRow(currentRow);
		columns.forEach((col, idx) => {
			const cell = headerRow.getCell(idx + 1);
			cell.value = col.label;
			cell.font = { bold: true };
			cell.alignment = { horizontal: "center", vertical: "middle" };
			cell.fill = {
				type: "pattern",
				pattern: "solid",
				fgColor: { argb: "FFCCCCCC" },
			};
			cell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
		});
		headerRow.commit();
		currentRow++;

		data.forEach((rowObj) => {
			const row = worksheet.getRow(currentRow);
			columns.forEach((col, idx) => {
				const cell = row.getCell(idx + 1);
				cell.value = rowObj[col.key] || "";
				cell.alignment = { horizontal: "center", vertical: "middle" };
				cell.border = {
					top: { style: "thin" },
					left: { style: "thin" },
					bottom: { style: "thin" },
					right: { style: "thin" },
				};
			});
			row.commit();
			currentRow++;
		});

		// 11) Footer Section
		currentRow += 2;
		// Underscores
		worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
		let footerCell1 = worksheet.getCell(`A${currentRow}`);
		footerCell1.value = "________________________";
		footerCell1.alignment = { horizontal: "center", vertical: "middle" };
		footerCell1.font = { bold: true, size: 10 };
		currentRow++;

		// LIMS Coordinator line
		worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
		let footerCell2 = worksheet.getCell(`A${currentRow}`);
		footerCell2.value = "LIMS Coordinator on authority of";
		footerCell2.alignment = { horizontal: "center", vertical: "middle" };
		footerCell2.font = { bold: true, size: 10 };
		currentRow++;

		// Company name
		worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
		let footerCell3 = worksheet.getCell(`A${currentRow}`);
		footerCell3.value = "GRIPCO MATERIAL TESTING";
		footerCell3.alignment = { horizontal: "center", vertical: "middle" };
		footerCell3.font = { bold: true, size: 10 };
		currentRow++;

		// Blank row for spacing
		worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
		let spacingRow = worksheet.getCell(`A${currentRow}`);
		spacingRow.value = "";
		currentRow++;

		// Another footer line
		worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
		let footerCell5 = worksheet.getCell(`A${currentRow}`);
		footerCell5.value =
			"LIMS Coordinator on authority of GRIPCO MATERIAL TESTING";
		footerCell5.alignment = {
			horizontal: "center",
			vertical: "middle",
			wrapText: true,
		};
		footerCell5.font = { bold: true, size: 10 };

		// 12) Append Statement Section at the End with borders
		currentRow += 2; // additional spacing
		worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
		let newStatementLabel = worksheet.getCell(`A${currentRow}`);
		newStatementLabel.value = "Statement:";
		newStatementLabel.font = { bold: true, size: 12 };
		// Add borders around the statement cell
		newStatementLabel.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
		currentRow++;

		worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
		let newRegCell = worksheet.getCell(`A${currentRow}`);
		newRegCell.value =
			"Commercial Registration No: 2015253768 (IAS accredited lab reference # TL-1305)";
		newRegCell.font = { size: 11 };
		newRegCell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
		currentRow++;

		worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
		let newLongStatementCell = worksheet.getCell(`A${currentRow}`);
		newLongStatementCell.value =
			"All works and services carried out by GLOBAL RESOURCES INSPECTION CONTRACTING COMPANY (GRIPCO Material Testing Saudia) " +
			"are subjected to and conducted with the standard terms and conditions of GRIPCO MATERIAL TESTING which are available " +
			"at the GRIPCO Site Terms and Conditions or upon request. This document may not be reproduced other than in full except " +
			"with the prior written approval of the issuing laboratory. These results relate only to the item(s) tested/sampling " +
			"conducted by the organization indicated. No deviations were observed during the testing process.";
		newLongStatementCell.font = { size: 10 };
		newLongStatementCell.alignment = { wrapText: true };
		newLongStatementCell.border = {
			top: { style: "thin" },
			left: { style: "thin" },
			bottom: { style: "thin" },
			right: { style: "thin" },
		};
		worksheet.getRow(currentRow).height = 90;

		// Generate Excel file buffer
		const buffer = await workbook.xlsx.writeBuffer();
		const dynamicFileName = fileName || "Proficiency_Testing.xlsx";

		return new NextResponse(buffer, {
			status: 200,
			headers: {
				"Content-Disposition": `attachment; filename=${dynamicFileName}`,
				"Content-Type":
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			},
		});
	} catch (error) {
		console.error("Error generating Excel file with ExcelJS:", error);
		return new NextResponse("Error generating file", { status: 500 });
	}
}
