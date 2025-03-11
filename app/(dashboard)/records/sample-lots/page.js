"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Trash } from "lucide-react";
import ReusableSampleLotsTable from "@/components/common/ReusableSlotsTable";
import { getBase64FromUrl } from "@/lib/utils";

const SampleLotsPage = () => {
  // Define columns for the main table (excluding sample description)
  const columns = [
    { key: "srNo", label: "S.NO" },
    { key: "clientName", label: "Client Name" },

    { key: "date", label: "Date" },
    { key: "phone", label: "Phone" },
    { key: "receivedBy", label: "Received By" },
    { key: "signature", label: "Signature" },
    { key: "remarks", label: "Remarks" },
  ];

  // Sample data, with each record having sampleDetails as an array of objects
  const [data, setData] = useState([
    {
      srNo: "1",
      clientName: "ABC Corp",
     
      date: "2024-04-10",
      phone: "+966 55 123 4567",
      receivedBy: "John Doe",
      signature: "Signed",
      remarks: "No Issues",
      sampleDetails: [
        { sampleDescription: "Chemical Analysis", qty: "3", condition: "Good" },
        { sampleDescription: "Microbiology Test", qty: "2", condition: "Fair" },
      ],
    },
    {
      srNo: "2",
      clientName: "XYZ Ltd.",
      date: "2024-04-12",
      phone: "+966 55 789 1011",
      receivedBy: "Jane Smith",
      signature: "Signed",
      remarks: "Requires rechecking",
      sampleDetails: [
        { sampleDescription: "Water Quality", qty: "10", condition: "Damaged" },
      ],
    },
  ]);

  // State for dialog and its mode ("preview" or "edit")
  const [selectedRow, setSelectedRow] = useState(null);
  const [dialogMode, setDialogMode] = useState("preview");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // For editing, we use a separate state that includes sampleDetails as an array
  const [editRow, setEditRow] = useState(null);

  // Open preview dialog
  const handlePreview = (row) => {
    setSelectedRow(row);
    setDialogMode("preview");
    setIsDialogOpen(true);
  };

  // Open edit dialog and create a copy for editing
  const handleEdit = (row) => {
    setSelectedRow(row);
    setEditRow({ ...row, sampleDetails: row.sampleDetails ? [...row.sampleDetails] : [] });
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  const handleDelete = (row) => {
    const newData = data.filter((item) => item.srNo !== row.srNo);
    setData(newData);
  };

 
 // onDownload callback for row-specific Excel download
 const handleDownload = async (row) => {
    const dataUrl = await getBase64FromUrl("/logo.png");
    // dataUrl is something like "data:image/png;base64,iVBORw0KG..."

    // 2) We only need the part after "base64,"
    const base64String = dataUrl.split("base64,")[1];
    try {
      // Build payload using dynamic data from the row
      const payload = {
        fileName: `Sample_${row.srNo}.xlsx`,
       
        logoBase64: base64String, // pass base64 to backend
        sampleInfo: {
          srNo: row.srNo,
          clientName: row.clientName,
          date: row.date,
         
        },
        sampleDetails: row.sampleDetails || [],
        otherInfo: {
            phone: row.phone,
            receivedBy: row.receivedBy,
            signature: row.signature,
            remarks: row.remarks,
        } // You can add additional info here if needed
      };

      const response = await fetch("/api/sample-export-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to download Excel file");
      }

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

  // For main fields in edit mode
  const handleChangeEdit = (e) => {
    setEditRow({ ...editRow, [e.target.name]: e.target.value });
  };

  // For sample details rows in edit mode
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
    const updatedDetails = editRow.sampleDetails.filter((_, i) => i !== index);
    setEditRow({ ...editRow, sampleDetails: updatedDetails });
  };

  const handleSaveEdit = () => {
    const updatedData = data.map((item) =>
      item.srNo === editRow.srNo ? editRow : item
    );
    setData(updatedData);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Sample Lots</h1>
      <ReusableSampleLotsTable
        columns={columns}
        data={data}
        onPreview={handlePreview}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownload={handleDownload}
      />

      {/* Dialog for Preview and Edit */}
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
                  <span>{selectedRow[col.key]}</span>
                </div>
              ))}
              {selectedRow.sampleDetails && selectedRow.sampleDetails.length > 0 && (
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
                        value={editRow[col.key]}
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
                <Button
                  onClick={addDetailRow}
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full"
                >
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
