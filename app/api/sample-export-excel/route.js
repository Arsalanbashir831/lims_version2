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
				ext: { width: 350, height: 50 },
			});
			worksheet.getRow(1).height = 80;
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
				tl: { col: 5, row: 0 },
				ext: { width: 100, height: 80 },
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
		worksheet.mergeCells("B1:F1");
		let headerCell = worksheet.getCell("B1");
		headerCell.value = "GRIPCO MATERIAL TESTING";
		headerCell.font = { bold: true, size: 16 };
		headerCell.alignment = { horizontal: "center", vertical: "middle" };

		worksheet.mergeCells("B2:F2");
		let subHeaderCell = worksheet.getCell("B2");
		subHeaderCell.value =
			"LIMS Coordinator on authority of GRIPCO MATERIAL TESTING";
		subHeaderCell.font = { bold: true, size: 12 };
		subHeaderCell.alignment = { horizontal: "center", vertical: "middle" };

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
			const detailKeys = Object.keys(sampleDetails[0]);
			// Create header row for details
			detailKeys.forEach((hdr, idx) => {
				let headerCell = worksheet.getCell(currentRow, idx + 1);
				headerCell.value = hdr;
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

			// Data rows for sample details
			sampleDetails.forEach((detail, detailIdx) => {
				let rowNumber = currentRow + detailIdx + 1;
				detailKeys.forEach((colKey, colIndex) => {
					let cell = worksheet.getCell(rowNumber, colIndex + 1);
					cell.value = detail[colKey] || "";
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
