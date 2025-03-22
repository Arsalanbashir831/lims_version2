"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import SampleRequestForm from "@/components/sample-lots/SampleRequestForm";

const AddRequestPage = () => {
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
					<SampleRequestForm />
				</CardContent>
			</Card>
		</div>
	);
};

export default AddRequestPage;
