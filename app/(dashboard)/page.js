"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const employeeData = {
  fullName: "Arsalan Bashir",
  email: "arsalanbashir831@gmail.com",
  employeeType: "Sales",
  employeeID: "567443",
  gender: "Male",
  maritalStatus: "Single",
  nationality: "Pakistani",
  branchName: "Dammam",
  department: "Sales",
  position: "Sales",
  contractType: "Permanent",
  joiningDate: "2025-01-05",
  employmentStatus: "Joined",
  lineManager: "ABC",
  contractDuration: "2 Months",
  contractIssuanceDate: "2025-01-22",
  contractExpiryDate: "2025-01-23",
  contractedHoursPerDay: "1",
  basicSalary: "312.00",
  houseAllowance: "421.00",
  transportAllowance: "3122.00",
  foodAllowance: "122.96",
  otherAllowance: "320.96",
  gosiSalary: "321320.96",
  totalSalary: "3212.97",
  overtimeType: "Fixed",
  overtimeHourlyRate: "11.97",
  leaveEntitlement: "20",
  gosiNumber: "321321",
  saudiArrivalDate: "2025-01-29",
  idType: "3123",
  idNumber: "321321",
  nameInIDEnglish: "Arsalan Bashir",
  nameInIDArabic: "Arsalan Bashir",
  idIssueDate: "2025-01-22",
  idExpiryDate: "2025-01-17",
  idIssuePlace: "ewqewq",
  iqamaProfession: "fewfew",
  passportNumber: "321312",
  passportName: "dsadsa",
  passportIssueDate: "2025-01-23",
  passportExpiryDate: "2025-01-31",
  passportIssuePlace: "ddwqwdsa",
  localDrivingLicenseNumber: "dsadas",
  localDrivingLicenseExpiry: "2025-01-24",
  bankName: "dsadas",
  accountNumber: "dsade312324dwd",
  iban: "ewqewde321321",
  profilePicture: "/profile.jpg", // Replace with actual path
  idFile: "/id-document.pdf", // Replace with actual path
};

export default function EmployeeDashboard() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      {/* Employee Profile Section */}
      <Card className="max-w-6xl mx-auto shadow-md bg-white p-8 rounded-lg">
        <CardHeader className="text-center">
          <Avatar className="mx-auto w-28 h-28">
            <AvatarImage src={employeeData.profilePicture} alt="Employee Profile" />
            <AvatarFallback>{employeeData.fullName.charAt(0)}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl mt-4">{employeeData.fullName}</CardTitle>
          <p className="text-gray-600 text-lg">{employeeData.position} - {employeeData.department}</p>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {/* Personal Information Section */}
          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Personal Information</h2>
            <p><strong>Email:</strong> {employeeData.email}</p>
            <p><strong>Gender:</strong> {employeeData.gender}</p>
            <p><strong>Marital Status:</strong> {employeeData.maritalStatus}</p>
            <p><strong>Nationality:</strong> {employeeData.nationality}</p>
          </div>

          {/* Employment Information Section */}
          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Employment Details</h2>
            <p><strong>Employee ID:</strong> {employeeData.employeeID}</p>
            <p><strong>Branch:</strong> {employeeData.branchName}</p>
            <p><strong>Joining Date:</strong> {employeeData.joiningDate}</p>
            <p><strong>Employment Status:</strong> {employeeData.employmentStatus}</p>
            <p><strong>Line Manager:</strong> {employeeData.lineManager}</p>
          </div>

          {/* Salary Information Section */}
          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Salary & Benefits</h2>
            <p><strong>Basic Salary:</strong> ${employeeData.basicSalary}</p>
            <p><strong>House Allowance:</strong> ${employeeData.houseAllowance}</p>
            <p><strong>Transport Allowance:</strong> ${employeeData.transportAllowance}</p>
            <p><strong>Food Allowance:</strong> ${employeeData.foodAllowance}</p>
            <p><strong>Total Salary:</strong> ${employeeData.totalSalary}</p>
          </div>

          {/* Contract & ID Details */}
          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Contract Details</h2>
            <p><strong>Contract Type:</strong> {employeeData.contractType}</p>
            <p><strong>Contract Duration:</strong> {employeeData.contractDuration}</p>
            <p><strong>Contract Issuance:</strong> {employeeData.contractIssuanceDate}</p>
            <p><strong>Contract Expiry:</strong> {employeeData.contractExpiryDate}</p>
          </div>

          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">ID Information</h2>
            <p><strong>ID Number:</strong> {employeeData.idNumber}</p>
            <p><strong>Name in ID:</strong> {employeeData.nameInIDEnglish}</p>
            <p><strong>ID Issue Date:</strong> {employeeData.idIssueDate}</p>
            <p><strong>ID Expiry Date:</strong> {employeeData.idExpiryDate}</p>
          </div>

          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Bank & Payments</h2>
            <p><strong>Bank Name:</strong> {employeeData.bankName}</p>
            <p><strong>Account Number:</strong> {employeeData.accountNumber}</p>
            <p><strong>IBAN:</strong> {employeeData.iban}</p>
          </div>
        </CardContent>

        {/* Download Buttons */}
        <CardContent className="flex justify-between mt-6">
          <Button asChild>
            <a href={employeeData.profilePicture} download>
              Download Profile Picture
            </a>
          </Button>

          <Button asChild variant="outline">
            <a href={employeeData.idFile} download>
              Download ID File
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
