"use client";

import React, { useState } from "react";
import ReusableTable from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";

const Page = () => {
  const columns = [
    { key: "jobId", label: "Job ID" },
    { key: "sampleId", label: "Sample ID" },
    { key: "clientName", label: "Client Name" },
    { key: "projectName", label: "Project Name" },
  ];

  const [data, setData] = useState([
    { jobId: "J001", sampleId: "S001", clientName: "ABC Corp", projectName: "Project Alpha" },
    { jobId: "J002", sampleId: "S002", clientName: "XYZ Ltd", projectName: "Project Beta" },
  ]);

  // Example function to add a new worksheet record
  const handleAddWorksheet = () => {
    const newRecord = {
      jobId: `J00${data.length + 1}`,
      sampleId: `S00${data.length + 1}`,
      clientName: "New Client",
      projectName: "New Project",
    };
    setData([...data, newRecord]);
    console.log("Worksheet added:", newRecord);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Worksheet Records</h1>
        <p className="text-gray-600 mb-6">
          Overview of all sample records with associated job information.
        </p>
        <div className="mb-4">
          <Button onClick={handleAddWorksheet} className="bg-green-500 hover:bg-green-600 text-white">
            Add Worksheet
          </Button>
        </div>
        <ReusableTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Page;
