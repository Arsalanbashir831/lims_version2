"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SampleLotForm from "@/components/sample-lots/SampleLotForm";
import { toast } from "sonner";

const EditSampleLots = () => {
	const { id } = useParams();
	const [jobData, setJobData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (id) {
			// Fetch the job details using the document id from the URL.
			const fetchJob = async () => {
				try {
					const res = await fetch(`/api/jobs/${id}`);
					const json = await res.json();
					if (res.ok) {
						setJobData(json.job); // Assumes the response returns { job: { ... } }
					} else {
						toast.error(json.error || "Failed to fetch job data");
					}
				} catch (error) {
					console.error("Error fetching job data:", error);
					toast.error("Error fetching job data.");
				} finally {
					setLoading(false);
				}
			};
			fetchJob();
		}
	}, [id]);

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 md:p-6">
			<Card className="w-full max-w-4xl mx-4 bg-white shadow-md p-6">
				<CardHeader>
					<h2 className="text-xl font-bold text-gray-800 text-center">
						GRIPCO Material Testing Lab
					</h2>
					<p className="text-center text-gray-600">
						Global Resources Inspection Contracting Company
					</p>
				</CardHeader>
				<CardContent>
					{jobData ? (
						<SampleLotForm
							initialSample={jobData.sample}
							initialSampleDetails={jobData.sampleDetails}
							jobDocId={id}
						/>
					) : (
						<div>No job data found.</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default EditSampleLots;
