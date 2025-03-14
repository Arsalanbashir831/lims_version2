"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import ReusableSampleLotsTable from "@/components/common/ReusableSlotsTable";
import { getBase64FromUrl } from "@/lib/utils";

const SampleLotsPage = () => {
  // Updated columns with new keys and labels
  const columns = [
    { key: "srNo", label: "S.No" },
    { key: "jobId", label: "Job Id" },
    { key: "projectName", label: "Project Name" },
    { key: "clientName", label: "Client Name" },
    { key: "specimenId", label: "Specimen Id" },
    { key: "typeOfSample", label: "Type of Sample" },
    { key: "testType", label: "Test Type" },
    { key: "testMethods", label: "Test Methods" },
    { key: "sampleRecievingDate", label: "Sample Recieving Date" },
    { key: "testStarted", label: "Test Started" },
    { key: "testEnded", label: "Test Ended" },
    { key: "testedBy", label: "Tested By" },
    { key: "status", label: "Status" },
    { key: "remarks", label: "Remarks" },
    { key: "discardDate", label: "Discard Date" },
  ];

  // Updated sample data with all new fields and testMethods as an array
  const [data, setData] = useState([
    {
      srNo: "1",
      jobId: "J101",
      projectName: "Project Alpha",
      clientName: "ABC Corp",
      specimenId: "SP001",
      typeOfSample: "Blood",
      testType: "Chemical Analysis",
      testMethods: ["Method A", "Method C"],
      sampleRecievingDate: "2024-04-10",
      testStarted: "2024-04-11",
      testEnded: "2024-04-12",
      testedBy: "John Doe",
      status: "Completed",
      remarks: "No issues",
      discardDate: "2024-04-15",
      sampleDetails: [
        { sampleDescription: "Chemical Analysis", qty: "3", condition: "Good" },
        { sampleDescription: "Microbiology Test", qty: "2", condition: "Fair" },
      ],
    },
    {
      srNo: "2",
      jobId: "J102",
      projectName: "Project Beta",
      clientName: "XYZ Ltd.",
      specimenId: "SP002",
      typeOfSample: "Urine",
      testType: "Water Quality",
      testMethods: ["Method B"],
      sampleRecievingDate: "2024-04-12",
      testStarted: "2024-04-13",
      testEnded: "2024-04-14",
      testedBy: "Jane Smith",
      status: "Pending",
      remarks: "Requires rechecking",
      discardDate: "2024-04-20",
      sampleDetails: [
        { sampleDescription: "Water Quality", qty: "10", condition: "Damaged" },
      ],
    },
  ]);

  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogMode, setDialogMode] = useState("preview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // Open preview dialog
  const handlePreview = (row) => {
    setSelectedRow(row);
    setDialogMode("preview");
    setIsDialogOpen(true);
  };

  // Open edit dialog by cloning the selected row (including sampleDetails)
  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditRow({ ...row, sampleDetails: row.sampleDetails ? [...row.sampleDetails] : [] });
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleDelete = (row) => {
    setData(data.filter((item) => item.srNo !== row.srNo));
  };

  // Row-specific Excel download callback
  const handleDownload = async (row) => {
    try {
      const dataUrl = await getBase64FromUrl("/logo.png");
      const base64String = dataUrl.split("base64,")[1];
      const payload = {
        fileName: `Sample_${row.srNo}.xlsx`,
        logoBase64: base64String,
        sampleInfo: {
          srNo: row.srNo,
          jobId: row.jobId,
          projectName: row.projectName,
          clientName: row.clientName,
          specimenId: row.specimenId,
          typeOfSample: row.typeOfSample,
          testType: row.testType,
          testMethods: row.testMethods,
          sampleRecievingDate: row.sampleRecievingDate,
          testStarted: row.testStarted,
          testEnded: row.testEnded,
          testedBy: row.testedBy,
          status: row.status,
          remarks: row.remarks,
          discardDate: row.discardDate,
        },
        sampleDetails: row.sampleDetails || [],
      };

      const response = await fetch("/api/sample-export-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to download Excel file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = payload.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading Excel file:", error);
    }
  };

  // Handle changes in edit mode; converts testMethods from a comma-separated string to an array
  const handleChangeEdit = (e) => {
    const { name, value } = e.target;
    if (name === "testMethods") {
      setEditRow({ ...editRow, testMethods: value.split(",").map((method) => method.trim()) });
    } else {
      setEditRow({ ...editRow, [name]: value });
    }
  };

  // Handle changes in sample details rows during edit
  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDetails = [...editRow.sampleDetails];
    updatedDetails[index] = { ...updatedDetails[index], [name]: value };
    setEditRow({ ...editRow, sampleDetails: updatedDetails });
  };

  const addDetailRow = () => {
    setEditRow({
      ...editRow,
      sampleDetails: [...editRow.sampleDetails, { sampleDescription: "", qty: "", condition: "" }],
    });
  };

  const removeDetailRow = (index) => {
    setEditRow({
      ...editRow,
      sampleDetails: editRow.sampleDetails.filter((_, i) => i !== index),
    });
  };

  const handleSaveEdit = () => {
    setData(data.map((item) => (item.srNo === editRow.srNo ? editRow : item)));
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
     <div className="m-auto w-7xl">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Sample Lots</h1>

      <ReusableSampleLotsTable
        columns={columns}
        data={data}
        onPreview={handlePreview}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />
     </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-6 max-w-3xl mx-auto">
          <DialogTitle className="text-center text-xl font-bold mb-4">
            {dialogMode === "preview" ? "Preview Sample Lot" : "Edit Sample Lot"}
          </DialogTitle>

          {dialogMode === "preview" && selectedRow && (
            <div className="space-y-4">
              {columns.map((col) => (
                <div key={col.key} className="flex justify-between">
                  <span className="font-medium">{col.label}:</span>
                  <span>
                    {col.key === "testMethods" && Array.isArray(selectedRow[col.key])
                      ? selectedRow[col.key].map((method, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-blue-500 text-white px-2 py-1 rounded-full mr-1"
                          >
                            {method}
                          </span>
                        ))
                      : selectedRow[col.key]}
                  </span>
                </div>
              ))}

              {selectedRow.sampleDetails?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Sample Details</h3>
                  <table className="w-full border-collapse">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="p-2 border">Description</th>
                        <th className="p-2 border">Qty</th>
                        <th className="p-2 border">Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRow.sampleDetails.map((detail, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 border">{detail.sampleDescription}</td>
                          <td className="p-2 border">{detail.qty}</td>
                          <td className="p-2 border">{detail.condition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}

          {dialogMode === "edit" && editRow && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {columns.map((col) =>
                  col.key !== "srNo" ? (
                    <div key={col.key} className="flex flex-col">
                      <label className="font-medium">{col.label}:</label>
                      <Input
                        name={col.key}
                        value={
                          col.key === "testMethods" && Array.isArray(editRow[col.key])
                            ? editRow[col.key].join(", ")
                            : editRow[col.key]
                        }
                        onChange={handleChangeEdit}
                      />
                    </div>
                  ) : null
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Sample Details</h3>
                <table className="w-full border-collapse">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 border">Description</th>
                      <th className="p-2 border">Qty</th>
                      <th className="p-2 border">Condition</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editRow.sampleDetails.map((detail, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 border">
                          <Input
                            name="sampleDescription"
                            value={detail.sampleDescription}
                            onChange={(e) => handleDetailChange(index, e)}
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            name="qty"
                            value={detail.qty}
                            onChange={(e) => handleDetailChange(index, e)}
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            name="condition"
                            value={detail.condition}
                            onChange={(e) => handleDetailChange(index, e)}
                          />
                        </td>
                        <td className="p-2 border text-center">
                          <Button
                            variant="outline"
                            onClick={() => removeDetailRow(index)}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Button onClick={addDetailRow} className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full">
                  Add Another Row
                </Button>
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SampleLotsPage;
