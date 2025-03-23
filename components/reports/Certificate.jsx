"use client";

import React from "react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import MethodPreviewTable from "./MethodPreviewTable";
import Image from "next/image";
import QRCode from "react-qr-code";

export default function Certificate({ certificate, group, pageStyle }) {
	// Top-level fields in the certificate document
	const {
		id,
		requestId,
		jobId,
		clientName,
		projectName,
		sampleDate,
		issuanceNumber,
	} = certificate;
	console.log("certificate", certificate);
	// Fields specific to each group/test method
	const { testMethod, certificateDetails, tableData, footer, specimenId } =
		group;

	// Example: Construct the live preview URL for your app (adjust domain/path as needed)
	const livePreviewUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/public/certificate/${id}/`;

	// Gather unique image URLs from the table data.
	const images =
		tableData && Array.isArray(tableData)
			? Array.from(
					new Set(tableData.map((row) => row.images).filter((img) => !!img))
			  )
			: [];

	return (
		<Card className="mt-4 gap-0 certificate-page" style={pageStyle}>
			{/* TOP BAR WITH LOGOS */}
			<CardHeader>
				<div className="flex justify-between items-start">
					{/* Left: GRIPCO logo */}
					<div className="relative w-64">
						{/* <Image
							src="/logo.jpg"
							alt="GRIPCO Logo"
							width={400}
							height={400}
							className="object-contain"
						/> */}
						<div
							style={{
								width: "200px",
								height: "100px",
								backgroundImage: `url(/logo.jpg)`,
								backgroundSize: "contain",
								backgroundRepeat: "no-repeat",
								backgroundPosition: "center",
							}}
						/>
					</div>
					{/* Right: IAS logo & QR code */}
					<div className="flex items-start gap-2">
						{/* IAS logo */}
						{/* <Image
							src="/ias_logo.jpg"
							alt="IAS"
							width={80}
							height={80}
							className="object-contain"
						/> */}
						<div
							style={{
								width: "100px",
								height: "100px",
								backgroundImage: `url(/ias_logo.jpg)`,
								backgroundSize: "contain",
								backgroundRepeat: "no-repeat",
								backgroundPosition: "center",
							}}
						/>
						{/* Small QR code that points to the live preview URL */}
						<QRCode
							value={livePreviewUrl}
							size={80} // Adjust size as desired
						/>
					</div>
				</div>

				<Separator className="my-2" />
				<div className="mt-2">
					<CardTitle className="uppercase text-lg m-0">
						Test Certificate
					</CardTitle>
				</div>
			</CardHeader>

			<CardContent className="pt-0">
				{/* TWO-COLUMN LAYOUT FOR CLIENT/PROJECT & DATES/REFERENCES */}
				<div className="flex justify-between gap-4 mb-4">
					{/* LEFT COLUMN */}
					<div className="w-1/2">
						<InfoLine
							label="Client Name"
							value={certificateDetails?.clientNameCert || clientName}
						/>
						<InfoLine
							label="PO #"
							value={certificateDetails?.poNumber || "N/A"}
						/>
						<InfoLine
							label="Customer Name"
							value={certificateDetails?.customerNameNo || "N/A"}
						/>
						<InfoLine label="Atten" value={certificateDetails?.attn || "N/A"} />
						<InfoLine
							label="Project Name"
							value={certificateDetails?.projectNameCert || projectName}
						/>
						<InfoLine
							label="MTC No"
							value={certificateDetails?.mtcNo || "N/A"}
						/>
						<InfoLine
							label="Name of Laboratory"
							value={certificateDetails?.labName || "N/A"}
						/>
						<InfoLine
							label="Address"
							value={certificateDetails?.labAddress || "N/A"}
						/>
						<InfoLine
							label="Sample Description"
							value={certificateDetails?.sampleDescription || "N/A"}
						/>
						<InfoLine
							label="Material Grade"
							value={certificateDetails?.materialGrade || "N/A"}
						/>
						<InfoLine
							label="Temperature"
							value={certificateDetails?.temperature || "N/A"}
						/>
						<InfoLine
							label="Humidity"
							value={certificateDetails?.humidity || "N/A"}
						/>
						<InfoLine
							label="Test Equipment"
							value={certificateDetails?.testEquipment || "N/A"}
						/>
						<InfoLine
							label="Test Method"
							value={certificateDetails?.testMethod || "N/A"}
						/>
						<InfoLine
							label="Sample Prep Method"
							value={certificateDetails?.samplePrepMethod || "N/A"}
						/>
					</div>

					{/* RIGHT COLUMN */}
					<div className="w-1/2 text-right">
						<InfoLine
							label="Date of Sampling"
							value={certificateDetails?.dateOfSampling || "N/A"}
						/>
						<InfoLine
							label="Date of Testing"
							value={certificateDetails?.dateOfTesting || "N/A"}
						/>
						<InfoLine
							label="Issue Date"
							value={certificateDetails?.issueDate || "N/A"}
						/>
						<InfoLine
							label="Gripco Ref No"
							value={certificateDetails?.gripcoRefNo || "N/A"}
						/>
						<InfoLine label="Issuance #" value={issuanceNumber || "N/A"} />
						<InfoLine
							label="Revision #"
							value={certificateDetails?.revisionNo || "N/A"}
						/>
					</div>
				</div>

				{/* HEADER FOR TABLE */}
				<h3 className="text-base font-semibold mb-2 uppercase">
					{`${testMethod} - (${specimenId})` || "N/A"}
				</h3>
				{/* Render the table without the image column */}
				<MethodPreviewTable
					testMethod={testMethod}
					tableData={tableData}
					hideImageColumn={true}
				/>
				{/* Render images below the table */}
				{images.length > 0 && (
					<div className="mt-4">
						{/* <h4 className="font-semibold mb-2">Images:</h4> */}
						<div className="flex flex-col items-center justify-center flex-wrap gap-4">
							{images.map((imgUrl, idx) => (
								// <div
								// 	key={idx}
								// 	className="w-3/4 h-64 border rounded"
								// 	style={{
								// 		backgroundImage: `url(${imgUrl})`,
								// 		backgroundSize: "contain",
								// 		backgroundRepeat: "no-repeat",
								// 		backgroundPosition: "center",
								// 	}}
								// />
								<div key={idx} className="w-full h-64 relative">
									<Image
										src={imgUrl}
										alt={`Specimen ${specimenId} Image ${idx + 1}`}
										className="max-w-xs object-contain border rounded"
										fill
									/>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>

			{/* SIGNATURE & LEGAL SECTION */}
			<CardFooter className="pt-4 flex-col">
				<div className="self-start">
					<p className="text-sm">
						<strong>Tested By:</strong> {footer?.testedBy || "N/A"}
					</p>
					<p className="text-sm">
						<strong>Witnessed By:</strong> {footer?.witnessedBy || "N/A"}
					</p>
				</div>
				<Separator className="my-2" />
				<div className="text-xs">
					<p>
						<strong>Commercial Registration No:</strong> 2015253768
					</p>
					<p>
						All Works and services carried out by GRIPCO Material Testing Saudia
						are subjected to and conducted with the standard terms and
						conditions of GRIPCO Material Testing, which are available on the
						GRIPCO Site or upon request.
					</p>
					<p>
						This document may not be reproduced other than in full except with
						the prior written approval of the issuing laboratory.
					</p>
					<p>
						These results relate only to the item(s) tested/sampling conducted
						by the organization indicated.
					</p>
					<p>No deviations were observed during the testing process.</p>
				</div>
			</CardFooter>
		</Card>
	);
}

function InfoLine({ label, value }) {
	return (
		<p className="m-0 text-sm">
			<strong>{label}:</strong> {value || "N/A"}
		</p>
	);
}
