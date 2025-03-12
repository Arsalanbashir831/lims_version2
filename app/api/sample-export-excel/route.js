import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import fs from "fs";
import path from "path";

export async function POST(req) {
	try {
		const {
			fileName,
			imagePath,
			logoBase64,
			sampleInfo,
			sampleDetails,
			otherInfo,
		} = await req.json();

		// 1) Create a new workbook and worksheet
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet("Sample Sheet");

		// 2) Attempt to add a logo. Priority:
		//    1) If logoBase64 is provided, use that.
		//    2) Else if imagePath is provided, read from public folder with fs.
		let logoImageId;
		if (logoBase64) {
			// If we have a Base64 string
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

		// 3) Insert the logo into the worksheet (if found)
		// Instead of `if (logoImageId)`, check if it's not undefined or null
		if (logoImageId !== undefined && logoImageId !== null) {
			worksheet.addImage(logoImageId, {
				tl: { col: 0, row: 0 },
				ext: { width: 350, height: 50 },
			});
			worksheet.getRow(1).height = 80;
		}

		// 4) Set column widths for professional layout
		worksheet.getColumn("A").width = 25;
		worksheet.getColumn("B").width = 50;
		worksheet.getColumn("C").width = 20;
		worksheet.getColumn("D").width = 20;
		worksheet.getColumn("E").width = 20;
		worksheet.getColumn("F").width = 20;

		// 5) Create header section with merges, logos, & statements

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

		worksheet.mergeCells("B4:F4");
		let statementLabel = worksheet.getCell("B4");
		statementLabel.value = "Statement:";
		statementLabel.font = { bold: true, size: 12 };
		statementLabel.alignment = { horizontal: "center" };

		worksheet.mergeCells("B5:F5");
		let regCell = worksheet.getCell("B5");
		regCell.value =
			"Commercial Registration No: 2015253768 (IAS accredited lab reference # TL-1305)";
		regCell.font = { size: 11 };
		regCell.alignment = { horizontal: "center" };

		worksheet.mergeCells("B6:F6");
		let longStatementCell = worksheet.getCell("B6");
		longStatementCell.value =
			"All works and services carried out by GLOBAL RESOURCES INSPECTION CONTRACTING COMPANY (GRIPCO Material Testing Saudia) " +
			"are subjected to and conducted with the standard terms and conditions of GRIPCO Material Testing which are available " +
			"at the GRIPCO Site Terms and Conditions or upon request. This document may not be reproduced other than in full except " +
			"with the prior written approval of the issuing laboratory. These results relate only to the item(s) tested/sampling " +
			"conducted by the organization indicated. No deviations were observed during the testing process.";
		longStatementCell.font = { size: 10 };
		longStatementCell.alignment = { horizontal: "center", wrapText: true };

		worksheet.mergeCells("B7:F7");
		worksheet.mergeCells("B9:F9");

		// 6) Insert Sample Info
		let currentRow = 11;
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

		// 7) Insert Sample Details
		currentRow += 2;
		if (sampleDetails && sampleDetails.length > 0) {
			const detailKeys = Object.keys(sampleDetails[0]);
			// Create header row
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

			// Data rows
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

		// 8) Other Sample Information
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

		// 9) Footer
		currentRow += 2;
		//  underscores
		worksheet.mergeCells(`A${currentRow}:F${currentRow}`);
		let footerCell1 = worksheet.getCell(`A${currentRow}`);
		footerCell1.value = "________________________";
		footerCell1.alignment = { horizontal: "center", vertical: "middle" };
		footerCell1.font = { bold: true, size: 10 };
		currentRow++;

		// LIMS coordinator line
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

		// Another line
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

		// 10) Generate Excel & Return
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
