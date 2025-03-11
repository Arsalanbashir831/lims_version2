"use client";

import { useState } from "react";
import ReusableTable from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

const ProficiencyTestingPage = () => {
  const columns = [
    { key: "srNo", label: "Sr#" },
    { key: "description", label: "Description of Testing Scope" },
    { key: "provider1", label: "PT Provider 1" },
    { key: "provider2", label: "PT Provider 2" },
    { key: "lastTestDate", label: "Last Test Date" },
    { key: "dueDate", label: "Due Date" },
    { key: "nextScheduledDate", label: "Next Scheduled Date" },
    { key: "status", label: "Status" },
    { key: "remarks", label: "Remarks" },
  ];

  const [data, setData] = useState([
    {
      srNo: "1",
      description: "Chemical Analysis",
      provider1: "Provider A",
      provider2: "Provider B",
      lastTestDate: "2024-03-10",
      dueDate: "2024-06-10",
      nextScheduledDate: "2024-09-10",
      status: "Completed",
      remarks: "Passed",
    },
    {
      srNo: "2",
      description: "Microbiology Test",
      provider1: "Provider X",
      provider2: "Provider Y",
      lastTestDate: "2024-03-12",
      dueDate: "2024-06-12",
      nextScheduledDate: "2024-09-12",
      status: "Pending",
      remarks: "Awaiting Results",
    },
  ]);

  const [newTest, setNewTest] = useState({
    srNo: "",
    description: "",
    provider1: "",
    provider2: "",
    lastTestDate: "",
    dueDate: "",
    nextScheduledDate: "",
    status: "",
    remarks: "",
  });

  const [editIndex, setEditIndex] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileName, setFileName] = useState("Proficiency_Testing.xlsx");

  const handleChange = (e) => {
    setNewTest({ ...newTest, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = () => {
    if (editIndex !== null) {
      const updatedData = [...data];
      updatedData[editIndex] = newTest;
      setData(updatedData);
    } else {
      setData([...data, { ...newTest, srNo: data.length + 1 }]);
    }
    setNewTest({
      srNo: "",
      description: "",
      provider1: "",
      provider2: "",
      lastTestDate: "",
      dueDate: "",
      nextScheduledDate: "",
      status: "",
      remarks: "",
    });
    setEditIndex(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (index) => {
    setNewTest(data[index]);
    setEditIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  // Convert static image (/logo.png) to Base64
  const convertImageToBase64 = async (imagePath) => {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });
  };

  const handleDownloadExcel = async () => {
    try {
      const logoBase64 = await convertImageToBase64("/logo.png");
      const response = await fetch("/api/export-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns, data, logoBase64, fileName }),
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Proficiency Testing</h1>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Input
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="w-64"
            placeholder="Enter file name"
          />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleDownloadExcel}>
            Download Excel
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">Add Proficiency Test</Button>
          </DialogTrigger>
          <DialogContent className="p-6">
            <DialogTitle>{editIndex !== null ? "Edit" : "Add"} Proficiency Test</DialogTitle>
            <div className="grid gap-4 mt-4">
              {columns.map((col) =>
                col.key !== "srNo" ? (
                  <div key={col.key}>
                    <label className="text-gray-700 font-medium">{col.label}</label>
                    <Input name={col.key} value={newTest[col.key]} onChange={handleChange} />
                  </div>
                ) : null
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="ml-3 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleAddOrUpdate}>
                  {editIndex !== null ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ReusableTable columns={columns} data={data} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
};

export default ProficiencyTestingPage;
