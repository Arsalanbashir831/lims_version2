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

		worksheet.getRow(5).height = 5; // Blank spacing row

		worksheet.mergeCells("B6:E6");
		const statementLabel = worksheet.getCell("B6");
		statementLabel.value = "Statement:";
		statementLabel.font = { bold: true, size: 12 };
		statementLabel.alignment = { horizontal: "center" };

		worksheet.mergeCells("B7:E7");
		const regCell = worksheet.getCell("B7");
		regCell.value =
			"Commercial Registration No: 2015253768 (IAS accredited lab reference # TL-1305)";
		regCell.font = { size: 11 };
		regCell.alignment = { horizontal: "center" };

		worksheet.mergeCells("B8:E8");
		const longStatementCell = worksheet.getCell("B8");
		longStatementCell.value =
			"All Works and services carried out by GLOBAL RESOURCES INSPECTION CONTRACTING COMPANY (GRIPCO Material Testing Saudia) " +
			"are subjected to and conducted with the standard terms and condition of GRIPCO Material Testing Which are available at " +
			"GRIPCO Site Terms and condition or upon Request. This Document may not be reproduced other than in full except with the " +
			"prior written approval of the issuing laboratory. This Results relate only to the Item(s) tested sampling conducted by " +
			"the organization indicated. No deviations were observed during the testing process.";
		longStatementCell.font = { size: 10 };
		longStatementCell.alignment = { horizontal: "center", wrapText: true };
		worksheet.getRow(8).height = 50;

		worksheet.getRow(9).height = 5; // Additional blank spacing

		worksheet.mergeCells("B10:E10");
		const recordTitle = worksheet.getCell("B10");
		recordTitle.value = fileName || "Testing Records";
		recordTitle.font = { bold: true, size: 12 };
		recordTitle.alignment = { horizontal: "center" };

		// Write Table Data: Start table at row 11
		let currentRow = 11;
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

		// Add spacing after table
		currentRow += 2;

		// Footer Section: Each line in its own merged row (B:E)
		worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
		const footerRow1 = worksheet.getCell(`B${currentRow}`);
		footerRow1.value = "____________________";
		footerRow1.alignment = { horizontal: "center", vertical: "middle" };
		footerRow1.font = { bold: true, size: 11 };
		currentRow++;

		worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
		const footerRow2 = worksheet.getCell(`B${currentRow}`);
		footerRow2.value = "LIMS Coordinator on authority of";
		footerRow2.alignment = { horizontal: "center", vertical: "middle" };
		footerRow2.font = { bold: true, size: 11 };
		currentRow++;

		worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
		const footerRow3 = worksheet.getCell(`B${currentRow}`);
		footerRow3.value = "GRIPCO MATERIAL TESTING";
		footerRow3.alignment = { horizontal: "center", vertical: "middle" };
		footerRow3.font = { bold: true, size: 11 };
		currentRow++;

		// Blank row for spacing
		worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
		const blankRow = worksheet.getCell(`B${currentRow}`);
		blankRow.value = "";
		currentRow++;

		// Footer final statement
		worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
		const footerRow4 = worksheet.getCell(`B${currentRow}`);
		footerRow4.value =
			"All Works and services carried out by GLOBAL RESOURCES INSPECTION CONTRACTING COMPANY (GRIPCO Material Testing Saudia)... etc.";
		footerRow4.alignment = {
			horizontal: "center",
			vertical: "middle",
			wrapText: true,
		};
		footerRow4.font = { bold: true, size: 11 };
		worksheet.getRow(currentRow).height = 40;

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
