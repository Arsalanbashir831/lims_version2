"use client";

import { useState } from "react";
import ReusableTable from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { getBase64FromUrl } from "@/lib/utils";

const CalibrationTestingPage = () => {
  const columns = [
    { key: "srNo", label: "SR#" },
    { key: "equipmentName", label: "Equipment/Instrument Name" },
    { key: "equipmentSerial", label: "Equipment Serial #" },
    { key: "calibrationVendor", label: "Calibration Vendor" },
    { key: "calibrationDate", label: "Calibration Date" },
    { key: "calibrationDueDate", label: "Calibration Due Date" },
    { key: "calibrationCertification", label: "Calibration Certification" },
    { key: "createdBy", label: "Created by" },
    { key: "updatedBy", label: "Updated by" },
    { key: "remarks", label: "Remarks" },
  ];

  const [data, setData] = useState([
    {
      srNo: "1",
      equipmentName: "Spectrophotometer",
      equipmentSerial: "SP-12345",
      calibrationVendor: "Vendor A",
      calibrationDate: "2024-04-01",
      calibrationDueDate: "2025-04-01",
      calibrationCertification: "Certified",
      createdBy: "John Doe",
      updatedBy: "Jane Smith",
      remarks: "In good condition",
    },
    {
      srNo: "2",
      equipmentName: "pH Meter",
      equipmentSerial: "PH-67890",
      calibrationVendor: "Vendor B",
      calibrationDate: "2024-03-15",
      calibrationDueDate: "2025-03-15",
      calibrationCertification: "Pending",
      createdBy: "Alice",
      updatedBy: "Bob",
      remarks: "Requires recalibration",
    },
  ]);

  const [newTest, setNewTest] = useState({
    srNo: "",
    equipmentName: "",
    equipmentSerial: "",
    calibrationVendor: "",
    calibrationDate: "",
    calibrationDueDate: "",
    calibrationCertification: "",
    createdBy: "",
    updatedBy: "",
    remarks: "",
  });

  const [editIndex, setEditIndex] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileName, setFileName] = useState("Calibration_Testing.xlsx");

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
      equipmentName: "",
      equipmentSerial: "",
      calibrationVendor: "",
      calibrationDate: "",
      calibrationDueDate: "",
      calibrationCertification: "",
      createdBy: "",
      updatedBy: "",
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

  const handleDownloadExcel = async () => {
      const dataUrl = await getBase64FromUrl("/logo.png");
        // dataUrl is something like "data:image/png;base64,iVBORw0KG..."
    
        // 2) We only need the part after "base64,"
        const base64String = dataUrl.split("base64,")[1];
    try {
      const response = await fetch("/api/export-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns, data, fileName , base64String ,imagePath:'logo.png' }),
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
      {/* Responsive Container */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Calibration Testing</h1>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full sm:w-64"
              placeholder="Enter file name"
            />
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleDownloadExcel}>
              Download Excel
            </Button>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white">Add Calibration Test</Button>
            </DialogTrigger>
            <DialogContent className="p-6">
              <DialogTitle>{editIndex !== null ? "Edit" : "Add"} Calibration Test</DialogTitle>
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
    </div>
  );
};

export default CalibrationTestingPage;
