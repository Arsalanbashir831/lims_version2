"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import htmlDocx from "html-docx-js/dist/html-docx";
import { generateCertificateHTML } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Certificate from "@/components/reports/Certificate";

const pageBreakStyle = {
	pageBreakAfter: "always", // older spec
	breakAfter: "page", // newer spec
};

export default function CertificatePreview({
	certificateId,
	showButton = true,
}) {
	// Use the passed-in certificateId prop, or fall back to URL params
	const params = useParams();
	const id = certificateId || params?.id;

	const [certificateData, setCertificateData] = useState(null);
	const [loading, setLoading] = useState(true);

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

	// Download the certificate as a .docx file
	const downloadDocx = async () => {
		if (!certificateData) return;
		const groupHTMLs = [];
		for (const group of certificateData.groups || []) {
			const singleCertHTML = await generateCertificateHTML(
				certificateData,
				group
			);
			groupHTMLs.push(`
        <div style="page-break-after: always;">
          ${singleCertHTML}
        </div>
      `);
		}
		const finalHTML = `
      <html>
        <head><meta charset="UTF-8"><title>Certificates</title></head>
        <body style="margin: 0; padding: 0;">
          ${groupHTMLs.join("")}
        </body>
      </html>
    `;

		const blob = htmlDocx.asBlob(finalHTML);
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "certificate.docx";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	if (loading) return <p>Loading...</p>;
	if (!certificateData) return <p>Certificate not found.</p>;

	return (
		<div className="container mx-auto p-4">
			{showButton && (
				<div className="flex justify-end mb-4">
					<Button onClick={downloadDocx}>Download File</Button>
				</div>
			)}
			<div id="certificate-content">
				{certificateData.groups?.map((group, idx) => (
					<Certificate
						key={idx}
						certificate={certificateData}
						group={group}
						pageStyle={pageBreakStyle}
					/>
				))}
			</div>
		</div>
	);
}
