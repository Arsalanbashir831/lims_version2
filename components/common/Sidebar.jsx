"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Menu } from "lucide-react";
// Adjust these imports based on your UI library paths
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
	{ name: "Dashboard", href: "/" },
	{
		name: "Testing",
		subItems: [
			{ name: "Proficiency Testing", href: "/testing/proficiency" },
			{ name: "Calibration Testing", href: "/testing/calibration" },
		],
	},
	{ name: "Lab Equipments", href: "/records/lab-equipments" },
	{
		name: "Records",
		subItems: [
			{
				name: "Sample Receiving Records",
				href: "/records/sample-receiving-records",
			},
			{ name: "Jobs", href: "/records/jobs" },
			{ name: "Test Certificates", href: "/records/test-certificates" },
		],
	},
	{
		name: "Laboratory Management",
		subItems: [{ name: "Lab Test", href: "/lab-management/lab-test" }],
	},
];

const personalItems = [
	{ name: "Profile", href: "/profile" },
	{ name: "Logout", href: "/logout" },
];

export default function Sidebar() {
	const pathname = usePathname();
	const [expandedSections, setExpandedSections] = useState({});
	const [open, setOpen] = useState(false);

	const toggleSection = (section) => {
		setExpandedSections((prev) => ({
			...prev,
			[section]: !prev[section],
		}));
	};

	// Close the mobile sidebar on link click
	const handleLinkClick = () => {
		setOpen(false);
	};

	// Common sidebar content for both mobile and desktop
	const sidebarContent = (
		<div className="flex flex-col w-full bg-gray-900 text-white p-6 shadow-lg h-screen overflow-hidden">
			<h2 className="text-2xl font-bold mb-6">LIMS Dashboard</h2>
			<nav className="flex flex-col gap-2 flex-grow">
				{navItems.map((item) =>
					item.subItems ? (
						<div key={item.name} className="relative">
							<button
								onClick={() => toggleSection(item.name)}
								className="flex justify-between items-center w-full p-3 rounded-md text-left transition-all duration-300 hover:bg-gray-800">
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
								className="overflow-hidden">
								<div className="ml-5 flex flex-col gap-2 mt-1">
									{item.subItems.map((sub) => (
										<Link
											key={sub.href}
											href={sub.href}
											className={`p-2 rounded-md transition ${
												pathname === sub.href
													? "bg-green-600"
													: "hover:bg-gray-700"
											}`}
											onClick={handleLinkClick}>
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
							onClick={handleLinkClick}>
							{item.name}
						</Link>
					)
				)}
			</nav>
			<div className="mt-auto flex flex-col gap-2">
				{personalItems.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={`p-3 rounded-md transition ${
							pathname === item.href ? "bg-green-600" : "hover:bg-gray-700"
						}`}
						onClick={handleLinkClick}>
						{item.name}
					</Link>
				))}
			</div>
		</div>
	);

	return (
		<>
			{/* Mobile Sidebar */}
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<Button variant="ghost" className="md:hidden fixed top-4 left-4 z-50">
						<Menu className="h-6 w-6" />
					</Button>
				</SheetTrigger>
				<SheetContent
					side="left"
					className="bg-gray-900 text-white p-0 h-screen overflow-hidden">
					{sidebarContent}
				</SheetContent>
			</Sheet>

			{/* Desktop Sidebar */}
			<aside className="hidden md:flex w-1/5 max-w-[30%] h-screen overflow-hidden">
				{sidebarContent}
			</aside>
		</>
	);
}
