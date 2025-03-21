import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import QRCode from "qrcode";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export async function getBase64FromUrl(url) {
	// Fetch the image as a blob
	const response = await fetch(url);
	const blob = await response.blob();

	// Convert blob to base64
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			// The result includes the prefix "data:image/png;base64,..."
			resolve(reader.result);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

export function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			// Remove the "data:image/jpeg;base64," prefix if needed.
			const base64 = reader.result.split(",")[1];
			resolve(base64);
		};
		reader.onerror = (error) => reject(error);
	});
}

export async function generateCertificateHTML(certificate, group) {
	// Convert local images (logos) to data URIs:
	const gripcoLogoDataUri = await fetchDataUri("/logo.jpg");
	const iasLogoDataUri = await fetchDataUri("/ias_logo.jpg");

	// Construct the live preview URL (adjust as needed)
	const livePreviewUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/public/certificate/${certificate.requestId}`;
	// Generate a QR code data URI from the live preview URL.
	const qrCodeDataUri = await QRCode.toDataURL(livePreviewUrl, {
		margin: 1,
		width: 60,
	});

	// top-level fields
	const {
		requestId,
		jobId,
		clientName,
		projectName,
		sampleDate,
		issuanceNumber,
	} = certificate;
	// group-level fields
	const { testMethod, certificateDetails, tableData, footer } = group;

	// Convert any "images" in tableData to data URIs
	const convertedTableData = await convertImagesInTableData(tableData);

	return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Certificate</title>
        <style>
          /* Force Letter size with 0.5" margins */
          @page {
            size: 8.5in 11in;
            margin: 0.5in;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 12px;
          }
          h2, h3 {
            margin: 5px 0;
          }
          /* Flex header styles */
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .header-right {
            display: flex;
            gap: 8px;
            align-items: center;
          }
          /* Optional: add a bottom border to separate header if needed */
          .header-container {
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
          }
        </style>
      </head>
      <body>
        <!-- Header section using flex -->
        <div class="header-container">
          <!-- Left side: GRIPCO logo -->
          <div class="header-left">
            <!-- EXACT SIZE: 1.72" wide x 0.6" high -->
            <img
              src="${gripcoLogoDataUri}"
              alt="GRIPCO Logo"
              style="width: 1.72in; height: 0.6in;"
            />
          </div>
          <!-- Right side: IAS logo then QR code -->
          <div class="header-right">
            <!-- EXACT SIZE: 0.5" wide x 0.7" high -->
            <img
              src="${iasLogoDataUri}"
              alt="IAS Logo"
              style="width: 0.5in; height: 0.7in;"
            />
            <!-- EXACT SIZE: 0.63" wide x 0.63" high -->
            <img
              src="${qrCodeDataUri}"
              alt="QR Code"
              style="width: 0.63in; height: 0.63in;"
            />
          </div>
        </div>

        <!-- Title row -->
        <div style="text-align: center; margin-bottom: 10px;">
          <h2 style="text-transform: uppercase; font-size: 16px;">
            Test Certificate
          </h2>
        </div>

        <!-- Horizontal line -->
        <hr style="margin: 4px 10px;" />

        <!-- Client & Project Info Row -->
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <!-- Left column (Client/Project info) -->
          <tr>
            <td style="width: 50%; vertical-align: top; padding: 5px 0;">
              <p style="margin: 4px 0;"><strong>Client Name:</strong> ${
								certificateDetails?.clientNameCert || clientName || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>PO #:</strong> ${
								certificateDetails?.poNumber || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Customer Name:</strong> ${
								certificateDetails?.customerNameNo || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Atten:</strong> ${
								certificateDetails?.attn || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Project Name:</strong> ${
								certificateDetails?.projectNameCert || projectName || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>MTC No:</strong> ${
								certificateDetails?.mtcNo || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Name of Laboratory:</strong> ${
								certificateDetails?.labName || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Address:</strong> ${
								certificateDetails?.labAddress || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Sample Description:</strong> ${
								certificateDetails?.sampleDescription || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Material Grade:</strong> ${
								certificateDetails?.materialGrade || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Temperature:</strong> ${
								certificateDetails?.temperature || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Humidity:</strong> ${
								certificateDetails?.humidity || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Test Equipment:</strong> ${
								certificateDetails?.testEquipment || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Test Method:</strong> ${
								certificateDetails?.testMethod || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Sample Prep Method:</strong> ${
								certificateDetails?.samplePrepMethod || "N/A"
							}</p>
            </td>
            <!-- Right column (Dates & Refs) -->
            <td style="width: 50%; vertical-align: top; padding: 5px 0; text-align: right;">
              <p style="margin: 4px 0;"><strong>Date of Sampling:</strong> ${
								certificateDetails?.dateOfSampling || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Date of Testing:</strong> ${
								certificateDetails?.dateOfTesting || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Issue Date:</strong> ${
								certificateDetails?.issueDate || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Gripco Ref No:</strong> ${
								certificateDetails?.gripcoRefNo || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Issuance #:</strong> ${
								issuanceNumber || "N/A"
							}</p>
              <p style="margin: 4px 0;"><strong>Revision #:</strong> ${
								certificateDetails?.revisionNo || "N/A"
							}</p>
            </td>
          </tr>
        </table>

        <!-- Test Method Title -->
        <div style="padding: 5px 0;">
          <h3 style="text-transform: uppercase; font-size: 14px; margin: 10px 0;">${
						testMethod || "N/A"
					}</h3>
        </div>

        <!-- Table Data (tableData) -->
        <div style="padding: 0 10px;">
          ${await generateTestMethodTableHTML(testMethod, convertedTableData)}
        </div>

        <!-- Signature & disclaimers -->
        <div style="padding: 10px 0;">
          <p style="margin: 4px 0;"><strong>Tested By:</strong> ${
						footer?.testedBy || "N/A"
					}</p>
          <p style="margin: 4px 0;"><strong>Witnessed By:</strong> ${
						footer?.witnessedBy || "N/A"
					}</p>
          <hr />
          <p style="font-size: 10px; margin: 6px 0;">
            <strong>Commercial Registration No:</strong> 2015253768
          </p>
          <p style="font-size: 10px; margin: 6px 0;">
            All Works and services carried out by GRIPCO Material Testing Saudia are subjected to and conducted
            with the standard terms and conditions of GRIPCO Material Testing, which are available on the GRIPCO
            site or upon request.
          </p>
          <p style="font-size: 10px; margin: 6px 0;">
            This document may not be reproduced other than in full except with the prior written approval of the issuing laboratory.
          </p>
          <p style="font-size: 10px; margin: 6px 0;">
            These results relate only to the item(s) tested/sampling conducted by the organization indicated.
          </p>
          <p style="font-size: 10px; margin: 6px 0;">
            No deviations were observed during the testing process.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Convert "images" column in tableData to data URIs.
 */
async function convertImagesInTableData(tableData) {
	if (!Array.isArray(tableData)) return tableData;
	const newData = [];
	for (const row of tableData) {
		const newRow = { ...row };
		const imageCol = Object.keys(row).find(
			(col) => col.toLowerCase() === "images"
		);
		if (imageCol && row[imageCol]) {
			try {
				const dataUri = await fetchDataUri(row[imageCol]);
				newRow[
					imageCol
				] = `<img src="${dataUri}" alt="Method Image" style="max-width: 80px; max-height: 80px;" />`;
			} catch (error) {
				console.error("Error converting method image:", error);
			}
		}
		newData.push(newRow);
	}
	return newData;
}

/**
 * Attempt to fetch an image from the given src and return a data URI.
 */
async function fetchDataUri(src) {
	if (!src || typeof src !== "string") return "";
	try {
		const res = await fetch(src);
		const blob = await res.blob();
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch (error) {
		console.error("fetchDataUri error:", error);
		return "";
	}
}

/**
 * Build the table for testMethod using columns derived from the first row of data.
 */
async function generateTestMethodTableHTML(testMethod, tableData = []) {
	if (!Array.isArray(tableData) || tableData.length === 0) {
		return `<p style="font-size: 12px;">No data available.</p>`;
	}

	const columns = Object.keys(tableData[0] || {});
	const thead = `
    <thead style="background: #f2f2f2;">
      <tr>
        ${columns
					.map(
						(col) =>
							`<th style="border: 1px solid #ccc; padding: 4px; text-align: left;">${col}</th>`
					)
					.join("")}
      </tr>
    </thead>
  `;

	const rowsHTML = tableData
		.map((row) => {
			const cells = columns
				.map((col) => {
					const cellValue = row[col] ?? "";
					return `<td style="border: 1px solid #ccc; padding: 4px; vertical-align: top;">${cellValue}</td>`;
				})
				.join("");
			return `<tr>${cells}</tr>`;
		})
		.join("");

	const tbody = `<tbody>${rowsHTML}</tbody>`;
	return `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 10px;">
      ${thead}
      ${tbody}
    </table>
  `;
}
