"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    fullName: "Arsalan Bashir",
    email: "arsalanbashir831@gmail.com",
    phone: "+966 55 123 4567",
    gender: "Male",
    maritalStatus: "Single",
    nationality: "Pakistani",
    department: "Sales",
    position: "Sales Executive",
    employeeID: "567443",
    branchName: "Dammam",
    employmentStatus: "Joined",
    lineManager: "ABC",
    contractType: "Permanent",
    contractDuration: "2 Months",
    contractIssuanceDate: "2025-01-22",
    contractExpiryDate: "2025-01-23",
    basicSalary: "312.00",
    houseAllowance: "421.00",
    transportAllowance: "3122.00",
    foodAllowance: "122.96",
    totalSalary: "3212.97",
    overtimeHourlyRate: "11.97",
    leaveEntitlement: "20",
    gosiNumber: "321321",
    idNumber: "321321",
    idIssueDate: "2025-01-22",
    idExpiryDate: "2025-01-17",
    passportNumber: "321312",
    passportIssueDate: "2025-01-23",
    passportExpiryDate: "2025-01-31",
    bankName: "Al Rajhi",
    accountNumber: "123456789",
    iban: "SA123456789",
    profilePicture: "/profile.jpg", // Replace with actual path
  });

  const [editUser, setEditUser] = useState(user);

  const handleChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setUser(editUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditUser(user);
    setIsEditing(false);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-md bg-white p-8 rounded-lg">
        <CardHeader className="text-center">
          <Avatar className="mx-auto w-28 h-28">
            <AvatarImage src={user.profilePicture} alt="Profile Picture" />
            <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl mt-4">{user.fullName}</CardTitle>
          <p className="text-gray-600">{user.position} - {user.department}</p>
        </CardHeader>

        {/* Profile Details */}
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Personal Information</h2>
              {["fullName", "email", "phone", "gender", "maritalStatus", "nationality"].map((field) => (
                <div key={field} className="mb-3">
                  <Label>{field.replace(/([A-Z])/g, " $1").trim()}</Label>
                  <Input
                    name={field}
                    value={editUser[field]}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              ))}
            </div>

            {/* Employment Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Employment Details</h2>
              {["employeeID", "branchName", "employmentStatus", "lineManager", "contractType", "contractDuration"].map((field) => (
                <div key={field} className="mb-3">
                  <Label>{field.replace(/([A-Z])/g, " $1").trim()}</Label>
                  <Input
                    name={field}
                    value={editUser[field]}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              ))}
            </div>

            {/* Salary Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Salary & Allowances</h2>
              {["basicSalary", "houseAllowance", "transportAllowance", "foodAllowance", "totalSalary"].map((field) => (
                <div key={field} className="mb-3">
                  <Label>{field.replace(/([A-Z])/g, " $1").trim()}</Label>
                  <Input
                    name={field}
                    value={editUser[field]}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              ))}
            </div>

            {/* ID & Bank Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">ID & Bank Details</h2>
              {["idNumber", "idIssueDate", "idExpiryDate", "passportNumber", "passportIssueDate", "passportExpiryDate", "bankName", "accountNumber", "iban"].map((field) => (
                <div key={field} className="mb-3">
                  <Label>{field.replace(/([A-Z])/g, " $1").trim()}</Label>
                  <Input
                    name={field}
                    value={editUser[field]}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Edit Buttons */}
          <div className="text-center mt-6">
            {!isEditing ? (
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
