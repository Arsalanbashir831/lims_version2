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

	// Construct the live preview URL (adjust as needed).
	const livePreviewUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/public/certificate/${certificate.requestId}`;
	// Generate a QR code data URI from the live preview URL.
	const qrCodeDataUri = await QRCode.toDataURL(livePreviewUrl, {
		margin: 1,
		width: 60, // This is the pixel dimension for the QR code, we’ll still size in inches below
	});

	// Top-level fields
	const { clientName, projectName, issuanceNumber } = certificate;
	// Group-level fields
	const { testMethod, certificateDetails, tableData, footer, specimenId } =
		group;

	// Build the main table of data (excluding images).
	const tableHTML = await generateTestMethodTableHTML(testMethod, tableData);
	// Build the images section below the table (if any).
	const imagesHTML = generateImagesSectionHTML(tableData);

	return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Certificate</title>
        <style>
          @page {
            size: 8.5in 11in !important;
            margin: 0.5in !important;
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
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            padding: 4px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background: #f2f2f2;
          }
          .images-container {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 10px;
          }
          .images-container img {
            max-width: 80px !important;
            max-height: 80px !important;
            border: 1px solid #ccc;
          }
        </style>
      </head>
      <body>

        <!-- HEADER SECTION (using a 2-column table to ensure logos stay on one line) -->
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <!-- Left cell: GRIPCO logo -->
            <td style="vertical-align: top; text-align: left;">
              <img
                src="${gripcoLogoDataUri}"
                alt="GRIPCO Logo"
                style="width: 2.72in; height: 0.95in;"
              />
            </td>
            <!-- Right cell: IAS logo + QR code side by side -->
            <td style="vertical-align: top; text-align: right; white-space: nowrap;">
              <img
                src="${iasLogoDataUri}"
                alt="IAS Logo"
                style="width: 0.6in; height: 0.91in; margin-right: 10px;"
              />
              <img
                src="${qrCodeDataUri}"
                alt="QR Code"
                style="width: 0.86in; height: 0.86in;"
              />
            </td>
          </tr>
        </table>

        <hr style="margin: 4px 0;" />

        <!-- TITLE ROW -->
        <div style="text-align: center; margin-bottom: 10px;">
          <h2 style="text-transform: uppercase; font-size: 16px;">
            Test Certificate
          </h2>
        </div>

        <!-- CLIENT/PROJECT INFO TABLE -->
        <table style="margin-top: 10px;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding: 5px 0;">
              <p style="margin: 4px 0;">
                <strong>Client Name:</strong>
                ${certificateDetails?.clientNameCert || clientName || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>PO #:</strong>
                ${certificateDetails?.poNumber || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Customer Name:</strong>
                ${certificateDetails?.customerNameNo || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Atten:</strong>
                ${certificateDetails?.attn || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Project Name:</strong>
                ${certificateDetails?.projectNameCert || projectName || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>MTC No:</strong>
                ${certificateDetails?.mtcNo || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Name of Laboratory:</strong>
                ${certificateDetails?.labName || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Address:</strong>
                ${certificateDetails?.labAddress || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Sample Description:</strong>
                ${certificateDetails?.sampleDescription || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Material Grade:</strong>
                ${certificateDetails?.materialGrade || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Temperature:</strong>
                ${certificateDetails?.temperature || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Humidity:</strong>
                ${certificateDetails?.humidity || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Test Equipment:</strong>
                ${certificateDetails?.testEquipment || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Test Method:</strong>
                ${certificateDetails?.testMethod || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Sample Prep Method:</strong>
                ${certificateDetails?.samplePrepMethod || "N/A"}
              </p>
            </td>
            <td style="width: 50%; vertical-align: top; padding: 5px 0; text-align: right;">
              <p style="margin: 4px 0;">
                <strong>Date of Sampling:</strong>
                ${certificateDetails?.dateOfSampling || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Date of Testing:</strong>
                ${certificateDetails?.dateOfTesting || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Issue Date:</strong>
                ${certificateDetails?.issueDate || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Gripco Ref No:</strong>
                ${certificateDetails?.gripcoRefNo || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Issuance #:</strong>
                ${issuanceNumber || "N/A"}
              </p>
              <p style="margin: 4px 0;">
                <strong>Revision #:</strong>
                ${certificateDetails?.revisionNo || "N/A"}
              </p>
            </td>
          </tr>
        </table>

        <!-- SPECIMEN & TEST METHOD TITLE -->
        <div style="padding: 5px 0;">
          <h3 style="text-transform: uppercase; font-size: 14px; margin: 10px 0;">
            Specimen ${specimenId || "N/A"} – ${testMethod || "N/A"}
          </h3>
        </div>

        <!-- MAIN DATA TABLE & IMAGES -->
        <div style="padding: 0 10px;">
          ${tableHTML}
          ${imagesHTML}
        </div>

        <!-- SIGNATURE & LEGAL SECTION -->
        <div style="padding: 10px 0;">
          <p style="margin: 4px 0;">
            <strong>Tested By:</strong>
            ${footer?.testedBy || "N/A"}
          </p>
          <p style="margin: 4px 0;">
            <strong>Witnessed By:</strong>
            ${footer?.witnessedBy || "N/A"}
          </p>
          <hr style="margin: 4px 10px;" />
          <p style="font-size: 10px; margin: 6px 0;">
            <strong>Commercial Registration No:</strong> 2015253768
          </p>
          <p style="font-size: 10px; margin: 6px 0;">
            All Works and services carried out by GRIPCO Material Testing Saudia are
            subjected to and conducted with the standard terms and conditions of GRIPCO
            Material Testing, which are available on the GRIPCO site or upon request.
          </p>
          <p style="font-size: 10px; margin: 6px 0;">
            This document may not be reproduced other than in full except with the
            prior written approval of the issuing laboratory.
          </p>
          <p style="font-size: 10px; margin: 6px 0;">
            These results relate only to the item(s) tested/sampling conducted by
            the organization indicated.
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
 * Build the table for testMethod using columns derived from the first row of data,
 * excluding the "images" column.
 */
async function generateTestMethodTableHTML(testMethod, tableData = []) {
	if (!Array.isArray(tableData) || tableData.length === 0) {
		return `<p style="font-size: 12px;">No data available.</p>`;
	}
	const columns = Object.keys(tableData[0] || {}).filter(
		(col) => col.toLowerCase() !== "images"
	);
	const thead = `
    <thead>
      <tr>
        ${columns
					.map(
						(col) =>
							`<th style="border: 1px solid #ccc; padding: 4px; background: #f2f2f2;">${col}</th>`
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

/**
 * Generate an HTML section for images that are found in the "images" column
 * of tableData. This section is placed below the table.
 */
function generateImagesSectionHTML(tableData = []) {
	if (!Array.isArray(tableData) || tableData.length === 0) return "";
	const imagesSet = new Set();
	tableData.forEach((row) => {
		Object.keys(row).forEach((col) => {
			if (col.toLowerCase() === "images" && row[col]) {
				imagesSet.add(row[col]);
			}
		});
	});
	const images = Array.from(imagesSet);
	if (images.length === 0) return "";
	const imagesHTML = images
		.map(
			(imgUrl) =>
				`<img src="${imgUrl}" alt="Specimen Image" style="max-width: 80px; max-height: 80px; border: 1px solid #ccc; margin-right: 5px;" />`
		)
		.join("");
	return `
    <div style="margin-top: 10px;">
      <h4 style="font-size: 12px; font-weight: bold; margin-bottom: 4px;">Images:</h4>
      <div class="images-container">
        ${imagesHTML}
      </div>
    </div>
  `;
}

/**
 * Attempt to fetch an image from the given src and return a data URI.
 * Falls back to the original URL if fetching fails.
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
		return src; // fallback: return the original src URL
	}
}

export function restrictUser(userRole) {
	if (userRole === "lab-technician") {
		return true;
	}
	return false;
}
