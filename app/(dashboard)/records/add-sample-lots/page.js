"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash } from "lucide-react";

const AddSampleLots = () => {
  const [sample, setSample] = useState({
    sampleNumber: "",
    clientName: "",
    date: "",
    phone: "",
    receivedBy: "",
    remarks: "",
  });

  const [sampleDetails, setSampleDetails] = useState([
    { description: "", quantity: "", condition: "" },
  ]);

  const handleChange = (e) => {
    setSample({ ...sample, [e.target.name]: e.target.value });
  };

  const handleSampleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const updatedDetails = [...sampleDetails];
    updatedDetails[index][name] = value;
    setSampleDetails(updatedDetails);
  };

  const addSampleDetailRow = () => {
    setSampleDetails([...sampleDetails, { description: "", quantity: "", condition: "" }]);
  };

  const removeSampleDetailRow = (index) => {
    const updatedDetails = sampleDetails.filter((_, i) => i !== index);
    setSampleDetails(updatedDetails);
  };

  const handleSubmit = () => {
    console.log("Sample Data Submitted:", { ...sample, sampleDetails });
    alert("Sample added successfully!");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex justify-center">
      <Card className="w-full max-w-2xl bg-white shadow-md p-6">
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-800 text-center">
            GRIPCO Material Testing Lab
          </h2>
          <p className="text-center text-gray-600">
            Global Resources Inspection Contracting Company
          </p>
        </CardHeader>

        <CardContent>
          {/* Sample Number and Client Name */}
          <div className="mb-4">
            <Label className="font-bold text-gray-700">S.NO.</Label>
            <Input
              type="text"
              name="sampleNumber"
              value={sample.sampleNumber}
              onChange={handleChange}
              placeholder="001"
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <Label className="font-bold text-gray-700">Client Name</Label>
            <Input
              type="text"
              name="clientName"
              value={sample.clientName}
              onChange={handleChange}
              placeholder="Enter Client Name"
              className="mt-1"
            />
          </div>

          {/* Sample Details Table */}
          <div className=" p-3 mb-4">
            <h3 className="font-bold text-gray-700 mb-3">Sample Details</h3>

            <table className="w-full ">
              <thead className="bg-gray-200">
                <tr>
                  <th className=" p-2">Sample Description</th>
                  <th className=" p-2">Qty</th>
                  <th className=" p-2">Sample Condition</th>
                  <th className=" p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sampleDetails.map((detail, index) => (
                  <tr key={index}>
                    <td className=" p-2">
                      <Textarea
                        name="description"
                        value={detail.description}
                        onChange={(e) => handleSampleDetailChange(index, e)}
                        placeholder="Enter sample description"
                        className="w-full"
                      />
                    </td>
                    <td className=" p-2">
                      <Input
                        type="number"
                        name="quantity"
                        value={detail.quantity}
                        onChange={(e) => handleSampleDetailChange(index, e)}
                        placeholder="Qty"
                        className="w-full"
                      />
                    </td>
                    <td className="p-2">
                      <Textarea
                        name="condition"
                        value={detail.condition}
                        onChange={(e) => handleSampleDetailChange(index, e)}
                        placeholder="Sample Condition"
                        className="w-full"
                      />
                    </td>
                    <td className=" p-2 text-center">
                      <Button
                        variant="outline"
                        onClick={() => removeSampleDetailRow(index)}
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
              onClick={addSampleDetailRow}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Another Row
            </Button>
          </div>

          {/* Additional Details */}
          <div className="mb-4">
            <Label className="font-bold text-gray-700">Date</Label>
            <Input
              type="date"
              name="date"
              value={sample.date}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <Label className="font-bold text-gray-700">Phone</Label>
            <Input
              type="tel"
              name="phone"
              value={sample.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="mt-1"
            />
          </div>

          <div className="mb-4">
            <Label className="font-bold text-gray-700">Received By</Label>
            <Input
              type="text"
              name="receivedBy"
              value={sample.receivedBy}
              onChange={handleChange}
              placeholder="Enter receiver's name"
              className="mt-1"
            />
          </div>

         

          <div className="mb-4">
            <Label className="font-bold text-gray-700">Remarks</Label>
            <Textarea
              name="remarks"
              value={sample.remarks}
              onChange={handleChange}
              placeholder="Additional remarks"
              className="mt-1"
            />
          </div>

          {/* Terms & Conditions */}
          <div className="border-t border-gray-400 pt-4 text-sm text-gray-700">
            <h3 className="font-bold">Terms & Conditions</h3>
            <p>Sample will be discarded after one month without any prior notification.</p>
          </div>

          <Button onClick={handleSubmit} className="w-full bg-blue-600 mt-6 hover:bg-blue-700 text-white">
            Add Sample
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddSampleLots;
