import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

/**
 * POST /api/download-sheet
 *
 * Expects a JSON body:
 * {
 *   "columns": [ { key: "fieldName", label: "Column Header" }, ... ],
 *   "data": [ { fieldName: value, ... }, ... ],
 *   "fileName": optional string for output file name
 * }
 */
export async function POST(req) {
  try {
    // 1) Parse request body
    const { columns, data, fileName } = await req.json();

    // 2) Create a new workbook and a worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Records");

    // --- A) Apply some default styling/column widths
    // Enough columns to handle your dynamic table plus some space for header merges
    worksheet.columns = [
      { header: "A", width: 20 },
      { header: "B", width: 40 },
      { header: "C", width: 20 },
      { header: "D", width: 20 },
      { header: "E", width: 20 },
      { header: "F", width: 20 },
    ];

    // --- B) Create a "Header" Section
    // Merge cells for a "company title" row
    worksheet.mergeCells("B1:E1");
    const titleCell = worksheet.getCell("B1");
    titleCell.value = "GRIPCO MATERIAL TESTING";
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getRow(1).height = 25;

    // Next row for coordinator authority
    worksheet.mergeCells("B2:E2");
    const coordinatorCell = worksheet.getCell("B2");
    coordinatorCell.value = "LIMS Coordinator on authority of GRIPCO MATERIAL TESTING";
    coordinatorCell.font = { bold: true, size: 12 };
    coordinatorCell.alignment = { horizontal: "center" };
    worksheet.getRow(2).height = 20;

    // Some blank spacing row if desired
    worksheet.getRow(3).height = 5;

    // Statement label row
    worksheet.mergeCells("B4:E4");
    const statementLabel = worksheet.getCell("B4");
    statementLabel.value = "Statement:";
    statementLabel.font = { bold: true, size: 12 };
    statementLabel.alignment = { horizontal: "center" };

    // Registration row
    worksheet.mergeCells("B5:E5");
    const regCell = worksheet.getCell("B5");
    regCell.value = "Commercial Registration No: 2015253768 (IAS accredited lab reference # TL-1305)";
    regCell.font = { size: 11 };
    regCell.alignment = { horizontal: "center" };

    // A longer statement
    worksheet.mergeCells("B6:E6");
    const longStatementCell = worksheet.getCell("B6");
    longStatementCell.value =
      "All Works and services carried out by GLOBAL RESOURCES INSPECTION CONTRACTING COMPANY (GRIPCO Material Testing Saudia) " +
      "are subjected to and conducted with the standard terms and condition of GRIPCO Material Testing Which are available at " +
      "GRIPCO Site Terms and condition or upon Request. This Document may not be reproduced other than in full except with the " +
      "prior written approval of the issuing laboratory. This Results relate only to the Item(s) tested sampling conducted by " +
      "the organization indicated. No deviations were observed during the testing process.";
    longStatementCell.font = { size: 10 };
    longStatementCell.alignment = { horizontal: "center", wrapText: true };
    worksheet.getRow(6).height = 50;

    // Another blank row
    worksheet.getRow(7).height = 5;

    // Title row for the record name or fileName
    worksheet.mergeCells("B8:E8");
    const recordTitle = worksheet.getCell("B8");
    recordTitle.value = fileName || "Testing Records";
    recordTitle.font = { bold: true, size: 12 };
    recordTitle.alignment = { horizontal: "center" };

    // --- C) Write the Table Data
    // We'll start the table at row 10
    let currentRow = 10;

    // 1) Insert Table Headers
    const headerRow = worksheet.getRow(currentRow);
    columns.forEach((col, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = col.label;
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFCCCCCC" }, // Light gray
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

    // 2) Insert Table Data Rows
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

    // Some spacing after table
    currentRow += 2;

    // --- D) Footer
    // We'll place the footer at the bottom, starting at currentRow
    worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
    const footLine1 = worksheet.getCell(`B${currentRow}`);
    footLine1.value = "____________________";
    footLine1.alignment = { horizontal: "center" };
    footLine1.font = { bold: true, size: 11 };
    currentRow++;

    worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
    const footLine2 = worksheet.getCell(`B${currentRow}`);
    footLine2.value = "LIMS Coordinator on authority of";
    footLine2.alignment = { horizontal: "center" };
    footLine2.font = { bold: true, size: 11 };
    currentRow++;

    worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
    const footLine3 = worksheet.getCell(`B${currentRow}`);
    footLine3.value = "GRIPCO MATERIAL TESTING";
    footLine3.alignment = { horizontal: "center" };
    footLine3.font = { bold: true, size: 11 };
    currentRow++;

    // Optionally add spacing
    worksheet.getRow(currentRow).height = 8;
    currentRow++;

    // Footer statement
    worksheet.mergeCells(`B${currentRow}:E${currentRow}`);
    const footLine4 = worksheet.getCell(`B${currentRow}`);
    footLine4.value =
      "All Works and services carried out by GLOBAL RESOURCES INSPECTION CONTRACTING COMPANY " +
      "(GRIPCO Material Testing Saudia)... etc.";
    footLine4.alignment = { horizontal: "center", wrapText: true };
    footLine4.font = { bold: true, size: 10 };
    worksheet.getRow(currentRow).height = 40;

    // --- E) Generate Excel Buffer & Return
    const dynamicFileName = fileName || "Proficiency_Testing.xlsx";
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename=${dynamicFileName}`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Error generating Excel file with ExcelJS:", error);
    return new NextResponse("Error generating file", { status: 500 });
  }
}
      