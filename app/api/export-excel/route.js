import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

export async function POST(req) {
	try {
		// Parse request body
		const {
			columns,
			data,
			fileName,
			logoBase64,
			imagePath,
			rightLogoBase64,
			rightImagePath,
		} = await req.json();

		// Create a new workbook and worksheet
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Records");

		// 2) Attempt to add the left logo. Priority:
		//    1) If logoBase64 is provided, use that.
		//    2) Else if imagePath is provided, read from public folder with fs.
		let logoImageId;
		if (logoBase64) {
			// If we have a Base64 string for left logo
			const buffer = Buffer.from(logoBase64, "base64");
			logoImageId = workbook.addImage({ buffer, extension: "png" });
		} else if (imagePath) {
			// If environment permits local fs reading
			const absoluteLogoPath = path.join(process.cwd(), "public", imagePath);
			if (fs.existsSync(absoluteLogoPath)) {
				const logoBuffer = fs.readFileSync(absoluteLogoPath);
				logoImageId = workbook.addImage({
					buffer: logoBuffer,
					extension: "png",
				});
			}
		}

		// 3) Insert the left logo into the worksheet (if found)
		if (logoImageId !== undefined && logoImageId !== null) {
			worksheet.addImage(logoImageId, {
				tl: { col: 0, row: 0 },
				ext: { width: 350, height: 100 },
			});
			worksheet.getRow(1).height = 120;
		}

		// 4) Attempt to add the right logo. Priority:
		//    1) If rightLogoBase64 is provided, use that.
		//    2) Else if rightImagePath is provided, read from public folder with fs.
		let rightLogoImageId;
		if (rightLogoBase64) {
			const buffer = Buffer.from(rightLogoBase64, "base64");
			rightLogoImageId = workbook.addImage({ buffer, extension: "png" });
		} else if (rightImagePath) {
			const absoluteRightLogoPath = path.join(
				process.cwd(),
				"public",
				rightImagePath
			);
			if (fs.existsSync(absoluteRightLogoPath)) {
				const logoBuffer = fs.readFileSync(absoluteRightLogoPath);
				rightLogoImageId = workbook.addImage({
					buffer: logoBuffer,
					extension: "png",
				});
			}
		}

		// 5) Insert the right logo into the worksheet (if found)
		if (rightLogoImageId !== undefined && rightLogoImageId !== null) {
			// Place the right logo in the top right. Column F (0-based index: 5)
			worksheet.addImage(rightLogoImageId, {
				tl: { col: 6, row: 0 },
				ext: { width: 100, height: 100 },
			});
		}

		// Create Header Section (start header text at row 3 to avoid overlapping the logo)
		worksheet.mergeCells("B3:F3");
		const titleCell = worksheet.getCell("B3");
		titleCell.value = "GRIPCO MATERIAL TESTING LABORATORY";
		titleCell.font = { bold: true, size: 16 };
		titleCell.alignment = { horizontal: "center", vertical: "middle" };
		worksheet.getRow(3).height = 25;

		worksheet.mergeCells("B5:F5");
		const recordTitle = worksheet.getCell("B5");
		recordTitle.value = fileName.split(".")[0];
		recordTitle.font = { bold: true, size: 12 };
		recordTitle.alignment = { horizontal: "center" };

		// add updated date next to the title and it must have dynamic width
		// to fit the date string
		const updatedDate = worksheet.getCell("G5");
		updatedDate.value = `Updated: ${new Date().toLocaleDateString()}`;
		updatedDate.font = { bold: true, size: 10 };
		updatedDate.alignment = { horizontal: "center" };
		updatedDate.width = 19;

		// Write Table Data: Start table at row 7
		let currentRow = 7;

		// Dynamically calculate column widths for the table.
		const dynamicWidths = columns.map((col) => {
			// Use header length as initial max.
			let maxLen = col.label ? col.label.toString().length : 10;
			// Iterate through each data row to get the max text length.
			data.forEach((rowObj) => {
				const cellText = rowObj[col.key] ? rowObj[col.key].toString() : "";
				if (cellText.length > maxLen) {
					maxLen = cellText.length;
				}
			});
			// Add extra padding (e.g., 2 characters).
			return maxLen + 2;
		});

		// Apply the calculated widths to the worksheet columns.
		dynamicWidths.forEach((width, idx) => {
			worksheet.getColumn(idx + 1).width = width;
		});

		// Create the header row.
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

		// Write data rows.
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
		footerCell2.value =
			"LIMS Coordinator on authority of GRIPCO MATERIAL TESTING";
		footerCell2.alignment = { horizontal: "center", vertical: "middle" };
		footerCell2.font = { bold: true, size: 10 };
		currentRow++;

		// Blank row for spacing
		worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
		let spacingRow = worksheet.getCell(`A${currentRow}`);
		spacingRow.value = "";
		currentRow++;

		// 12) Append Statement Section at the End with borders
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
		worksheet.getRow(currentRow).height = 110;

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
