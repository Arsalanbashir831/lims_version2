"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/" },
  {
    name: "Testing",
    subItems: [
      { name: "Proficiency Testing", href: "/testing/proficiency" },
      { name: "Calibration Testing", href: "/testing/calibration" },
    ],
  },
  {
    name: "Records",
    subItems: [
      { name: "Lab Equipments", href: "/records/lab-equipments" },
      { name: "Add Sample Lots", href: "/records/add-sample-lots" },
      { name: "Sample Lots", href: "/records/sample-lots" },
    ],
  },
  {
    name: "Laboratory Management",
    subItems: [
      { name: "Lab Test", href: "/lab-management/lab-test" },
      { name: "Test Certificates", href: "/lab-management/test-certificates" },
      { name: "Worksheets", href: "/lab-management/worksheets" },
    ],
  },
  {
    name: "Personal",
    subItems: [
      { name: "Profile", href: "/profile" },
      { name: "Logout", href: "/logout" },
    ],
  },
];

export default function DashboardLayout({ children }) {
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const pathname = usePathname();

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-1/5 max-w-[30%] bg-gray-900 text-white p-6 shadow-lg min-h-screen">
        <h2 className="text-2xl font-bold mb-6 text-left">LIMS Dashboard</h2>
        <nav className="flex flex-col gap-2">
          {navItems.map((item) =>
            item.subItems ? (
              <div key={item.name} className="relative">
                <button
                  onClick={() => toggleSection(item.name)}
                  className="flex justify-between items-center w-full p-3 rounded-md text-left transition-all duration-300 hover:bg-gray-800"
                >
                  {item.name}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      expandedSections[item.name] ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: expandedSections[item.name] ? "auto" : 0,
                    opacity: expandedSections[item.name] ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="ml-5 flex flex-col gap-2 mt-1">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`p-2 rounded-md transition ${
                          pathname === sub.href ? "bg-green-600" : "hover:bg-gray-700"
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`p-3 rounded-md transition ${
                  pathname === item.href ? "bg-green-600" : "hover:bg-gray-700"
                }`}
              >
                {item.name}
              </Link>
            )
          )}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" className="md:hidden fixed top-4 left-4">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-gray-900 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">ERP Dashboard</h2>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) =>
              item.subItems ? (
                <div key={item.name} className="relative">
                  <button
                    onClick={() => toggleSection(item.name)}
                    className="flex justify-between items-center w-full p-3 rounded-md text-left transition-all duration-300 hover:bg-gray-800"
                  >
                    {item.name}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        expandedSections[item.name] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: expandedSections[item.name] ? "auto" : 0,
                      opacity: expandedSections[item.name] ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="ml-5 flex flex-col gap-2 mt-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`p-2 rounded-md transition ${
                            pathname === sub.href ? "bg-green-600" : "hover:bg-gray-700"
                          }`}
                          onClick={() => setOpen(false)}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-3 rounded-md transition ${
                    pathname === item.href ? "bg-green-600" : "hover:bg-gray-700"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
