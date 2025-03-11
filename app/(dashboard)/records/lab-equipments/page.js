"use client";

import { useState } from "react";
import ReusableTable from "@/components/common/ReusableTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

const LabEquipments = () => {
  const columns = [
    { key: "srNo", label: "SR#" },
    { key: "equipmentName", label: "Equipment Name" },
    { key: "equipmentSerial", label: "Equipment Serial #" },
    { key: "status", label: "Status" },
    { key: "lastVerification", label: "Last Internal Verification Date" },
    { key: "verificationDue", label: "Internal Verification Due Date" },
    { key: "createdBy", label: "Created By" },
    { key: "updatedBy", label: "Updated By" },
    { key: "remarks", label: "Remarks" },
  ];

  const [data, setData] = useState([
    {
      srNo: "1",
      equipmentName: "Spectrophotometer",
      equipmentSerial: "SP-12345",
      status: "In Use",
      lastVerification: "2024-04-01",
      verificationDue: "2025-04-01",
      createdBy: "John Doe",
      updatedBy: "Jane Smith",
      remarks: "Operational",
    },
    {
      srNo: "2",
      equipmentName: "pH Meter",
      equipmentSerial: "PH-67890",
      status: "Under Maintenance",
      lastVerification: "2024-03-15",
      verificationDue: "2025-03-15",
      createdBy: "Alice",
      updatedBy: "Bob",
      remarks: "Needs repair",
    },
  ]);

  const [newEquipment, setNewEquipment] = useState({
    srNo: "",
    equipmentName: "",
    equipmentSerial: "",
    status: "",
    lastVerification: "",
    verificationDue: "",
    createdBy: "",
    updatedBy: "",
    remarks: "",
  });

  const [editIndex, setEditIndex] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileName, setFileName] = useState("Equipment_Inventory.xlsx");

  const handleChange = (e) => {
    setNewEquipment({ ...newEquipment, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = () => {
    if (editIndex !== null) {
      const updatedData = [...data];
      updatedData[editIndex] = newEquipment;
      setData(updatedData);
    } else {
      setData([...data, { ...newEquipment, srNo: data.length + 1 }]);
    }
    setNewEquipment({
      srNo: "",
      equipmentName: "",
      equipmentSerial: "",
      status: "",
      lastVerification: "",
      verificationDue: "",
      createdBy: "",
      updatedBy: "",
      remarks: "",
    });
    setEditIndex(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (index) => {
    setNewEquipment(data[index]);
    setEditIndex(index);
    setIsDialogOpen(true);
  };

  const handleDelete = (index) => {
    setData(data.filter((_, i) => i !== index));
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await fetch("/api/export-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns, data, fileName }),
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Equipment Inventory List</h1>

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
              <Button className="bg-green-600 hover:bg-green-700 text-white">Add Equipment</Button>
            </DialogTrigger>
            <DialogContent className="p-6">
              <DialogTitle>{editIndex !== null ? "Edit" : "Add"} Equipment</DialogTitle>
              <div className="grid gap-4 mt-4">
                {columns.map((col) =>
                  col.key !== "srNo" ? (
                    <div key={col.key}>
                      <label className="text-gray-700 font-medium">{col.label}</label>
                      <Input name={col.key} value={newEquipment[col.key]} onChange={handleChange} />
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

export default LabEquipments;
