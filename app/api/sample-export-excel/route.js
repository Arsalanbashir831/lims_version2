import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

export async function POST(req) {
	try {
		// Added rightLogoBase64 and rightImagePath from the request payload
		const {
			fileName,
			imagePath,
			logoBase64,
			rightLogoBase64,
			rightImagePath,
			sampleInfo,
			sampleDetails,
			otherInfo,
		} = await req.json();

		// 1) Create a new workbook and worksheet
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Sample Sheet");

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
				tl: { col: 7, row: 0 },
				ext: { width: 100, height: 100 },
			});
		}

		// 6) Set column widths for professional layout
		worksheet.getColumn("A").width = 25;
		worksheet.getColumn("B").width = 50;
		worksheet.getColumn("C").width = 20;
		worksheet.getColumn("D").width = 20;
		worksheet.getColumn("E").width = 20;
		worksheet.getColumn("F").width = 20;

		// 7) Create header section with merges (without the statement block)
		worksheet.mergeCells("B2:G2");
		let headerCell = worksheet.getCell("B2");
		headerCell.value = "GRIPCO MATERIAL TESTING LABORATORY";
		headerCell.font = { bold: true, size: 16 };
		headerCell.alignment = { horizontal: "center", vertical: "middle" };

		// 8) Insert Sample Info
		let currentRow = 4;
		worksheet.getCell(`A${currentRow}`).value = "Sample Information";
		worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
		currentRow++;

		for (const key in sampleInfo || {}) {
			let keyCell = worksheet.getCell(`A${currentRow}`);
			keyCell.value = key;
			keyCell.font = { bold: true };
			keyCell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};

			let valCell = worksheet.getCell(`B${currentRow}`);
			valCell.value = sampleInfo[key];
			valCell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
			currentRow++;
		}

		// 9) Insert Sample Details
		currentRow += 2;
		if (sampleDetails && sampleDetails.length > 0) {
			// Define keys and headers in the desired order.
			const detailColumns = [
				{ key: "itemNo", header: "item name" },
				{ key: "description", header: "Description" },
				{ key: "mtcNo", header: "MTC No" },
				{ key: "sampleType", header: "Sample Type" },
				{ key: "materialType", header: "Material Type" },
				{ key: "heatNo", header: "Heat No" },
				{ key: "condition", header: "Condition" },
				{ key: "testMethods", header: "Test Methods" },
			];

			// Dynamically calculate column widths.
			const dynamicWidths = detailColumns.map((col) => {
				// Start with the header's text length.
				let maxLen = col.header ? col.header.toString().length : 10;
				// Check each detail row for the maximum length.
				sampleDetails.forEach((detail) => {
					const text = detail[col.key] ? detail[col.key].toString() : "";
					if (text.length > maxLen) {
						maxLen = text.length;
					}
				});
				// Add extra padding, e.g., 2 characters.
				return maxLen + 2;
			});

			// Apply the calculated widths to the worksheet columns.
			dynamicWidths.forEach((width, idx) => {
				worksheet.getColumn(idx + 1).width = width;
			});

			// Create header row for details.
			detailColumns.forEach((col, idx) => {
				let headerCell = worksheet.getCell(currentRow, idx + 1);
				headerCell.value = col.header;
				headerCell.font = { bold: true };
				headerCell.alignment = { horizontal: "center" };
				headerCell.fill = {
					type: "pattern",
					pattern: "solid",
					fgColor: { argb: "FFCCCCCC" },
				};
				headerCell.border = {
					top: { style: "thin" },
					left: { style: "thin" },
					bottom: { style: "thin" },
					right: { style: "thin" },
				};
			});

			// Write data rows for sample details.
			sampleDetails.forEach((detail, detailIdx) => {
				let rowNumber = currentRow + detailIdx + 1;
				detailColumns.forEach((col, colIndex) => {
					let cell = worksheet.getCell(rowNumber, colIndex + 1);
					cell.value = detail[col.key] || "";
					cell.border = {
						top: { style: "thin" },
						left: { style: "thin" },
						bottom: { style: "thin" },
						right: { style: "thin" },
					};
				});
			});
			currentRow += sampleDetails.length + 1;
		}

		// 10) Insert Other Sample Information
		currentRow += 2;
		worksheet.getCell(`A${currentRow}`).value = "Other Sample Information";
		worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
		currentRow++;
		for (const key in otherInfo || {}) {
			let keyCell = worksheet.getCell(`A${currentRow}`);
			keyCell.value = key;
			keyCell.font = { bold: true };
			keyCell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
			let valCell = worksheet.getCell(`B${currentRow}`);
			valCell.value = otherInfo[key];
			valCell.border = {
				top: { style: "thin" },
				left: { style: "thin" },
				bottom: { style: "thin" },
				right: { style: "thin" },
			};
			currentRow++;
		}

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
		worksheet.getRow(currentRow).height = 60;

		// 13) Generate Excel & Return
		const buffer = await workbook.xlsx.writeBuffer();
		const dynamicFileName = fileName ? fileName : "Sample_Data.xlsx";

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
