"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

// A simple reusable select component
function Select({ name, value, onChange, options, placeholder, className }) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`border p-2 rounded ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default function LabTestForm() {
  // Track current step
  const [step, setStep] = useState(1);

  // Step 1 state
  const [step1Data, setStep1Data] = useState({
    contractor: "",
    project: "",
    itemDescription: "",
    remarks: "",
    specimenOrientation: "",
    jobAssignDate: "",
  });

  // Step 2 state: dynamic sample record rows
  const [sampleRecords, setSampleRecords] = useState([
    { sampleLot: "", testMethod: "", remarks: "" },
  ]);

  // Handle change for step 1 fields
  const handleStep1Change = (e) => {
    setStep1Data({ ...step1Data, [e.target.name]: e.target.value });
  };

  // Handle change for sample records fields
  const handleSampleRecordChange = (index, e) => {
    const { name, value } = e.target;
    const newRecords = [...sampleRecords];
    newRecords[index][name] = value;
    setSampleRecords(newRecords);
  };

  const addSampleRecordRow = () => {
    setSampleRecords([...sampleRecords, { sampleLot: "", testMethod: "", remarks: "" }]);
  };

  const removeSampleRecordRow = (index) => {
    const newRecords = sampleRecords.filter((_, i) => i !== index);
    setSampleRecords(newRecords);
  };

  // Handle final submission (here just logs data)
  const handleSubmit = () => {
    const finalData = { ...step1Data, sampleRecords };
    console.log("Submitted Data:", finalData);
    alert("Lab Test Data Submitted!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Lab Test – Add Sample Lots
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractor" className="font-medium">
                    Contractor
                  </Label>
                  <Input
                    id="contractor"
                    name="contractor"
                    value={step1Data.contractor}
                    onChange={handleStep1Change}
                    placeholder="Enter contractor name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="project" className="font-medium">
                    Project
                  </Label>
                  <Input
                    id="project"
                    name="project"
                    value={step1Data.project}
                    onChange={handleStep1Change}
                    placeholder="Enter project name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="itemDescription" className="font-medium">
                    Item Description
                  </Label>
                  <Input
                    id="itemDescription"
                    name="itemDescription"
                    value={step1Data.itemDescription}
                    onChange={handleStep1Change}
                    placeholder="Enter item description"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="remarks" className="font-medium">
                    Remarks
                  </Label>
                  <Input
                    id="remarks"
                    name="remarks"
                    value={step1Data.remarks}
                    onChange={handleStep1Change}
                    placeholder="Enter remarks"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="specimenOrientation" className="font-medium">
                    Specimen Orientation and Location
                  </Label>
                  <Input
                    id="specimenOrientation"
                    name="specimenOrientation"
                    value={step1Data.specimenOrientation}
                    onChange={handleStep1Change}
                    placeholder="Enter orientation & location"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="jobAssignDate" className="font-medium">
                    Job Number Assign Date
                  </Label>
                  <Input
                    id="jobAssignDate"
                    name="jobAssignDate"
                    type="date"
                    value={step1Data.jobAssignDate}
                    onChange={handleStep1Change}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button
                  onClick={() => setStep(2)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold mb-4">Add Sample Lot Records</h2>
              <p className="text-sm text-gray-600 mb-4">
                For each sample lot record, select a sample lot, choose a test method, and provide remarks.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 border">SAMPLE LOT</th>
                      <th className="p-2 border">Test Methods</th>
                      <th className="p-2 border">Remarks</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleRecords.map((record, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 border">
                          {/* Example sample lot options */}
                          <Select
                            name="sampleLot"
                            value={record.sampleLot}
                            onChange={(e) => handleSampleRecordChange(index, e)}
                            options={[
                              { value: "Sample Lot 1", label: "Sample Lot 1" },
                              { value: "Sample Lot 2", label: "Sample Lot 2" },
                              { value: "Sample Lot 3", label: "Sample Lot 3" },
                            ]}
                            placeholder="Select Sample Lot"
                          />
                        </td>
                        <td className="p-2 border">
                          {/* Test Methods as select dropdown */}
                          <Select
                            name="testMethod"
                            value={record.testMethod}
                            onChange={(e) => handleSampleRecordChange(index, e)}
                            options={[
                              { value: "Method A", label: "Method A" },
                              { value: "Method B", label: "Method B" },
                              { value: "Method C", label: "Method C" },
                            ]}
                            placeholder="Select Test Method"
                          />
                        </td>
                        <td className="p-2 border">
                          <Input
                            name="remarks"
                            value={record.remarks}
                            onChange={(e) => handleSampleRecordChange(index, e)}
                            placeholder="Enter remarks"
                          />
                        </td>
                        <td className="p-2 border text-center">
                          <Button
                            variant="outline"
                            onClick={() => removeSampleRecordRow(index)}
                            className="bg-red-500 text-white hover:bg-red-600"
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button
                onClick={addSampleRecordRow}
                className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full"
              >
                Add Another Row
              </Button>
              <div className="flex justify-between mt-6">
                <Button onClick={() => setStep(1)} variant="outline">
                  Previous
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
