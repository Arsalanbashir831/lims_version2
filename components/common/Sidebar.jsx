"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, Menu } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { logOut } from "@/lib/auth";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area";

const navItems = [
	{ name: "Dashboard", href: "/" },
	{
		name: "Testing",
		subItems: [
			{ name: "Proficiency Testing", href: "/testing/proficiency" },
			{ name: "Calibration Testing", href: "/testing/calibration" },
		],
	},
	{ name: "Lab Equipments", href: "/lab-equipments" },
	{
		name: "Sample Receiving Records",
		subItems: [
			{ name: "Add New Job", href: "/jobs/new" },
			{ name: "Job Records", href: "/jobs" },
		],
	},
	{
		name: "Sample Prepration & Test Request",
		subItems: [
			{ name: "Add Request", href: "/requests/new" },
			{ name: "Request Records", href: "/requests" },
		],
	},
	{
		name: "Test Reports",
		subItems: [
			{ name: "Add Reports", href: "/reports/new" },
			{ name: "View Reports", href: "/reports" },
		],
	},
];

const personalItems = [
	{ name: "Profile", href: ROUTES.USER.PROFILE },
	{ name: "Logout" },
];

export default function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	// Use a single state variable to track the open section
	const [openSection, setOpenSection] = useState(null);
	const [open, setOpen] = useState(false);

	const toggleSection = (section) => {
		setOpenSection(openSection === section ? null : section);
	};

	// Close the mobile sidebar on link click
	const handleLinkClick = () => {
		setOpen(false);
	};

	const handleLogout = async (e) => {
		e.preventDefault();
		const result = await logOut();
		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success("Successfully logged out!");
			// Redirect to login page or home
			router.push(ROUTES.AUTH.LOGIN);
		}
	};

	const sidebarContent = (
		<div className="flex flex-col w-full bg-gray-900 text-white p-6 shadow-lg h-screen">
			<h2 className="text-2xl font-bold mb-6">LIMS Dashboard</h2>
			{/* Navigation items container made scrollable */}
			<ScrollArea className="flex-grow overflow-y-auto">
				<nav className="flex flex-col gap-2">
					{navItems.map((item) =>
						item.subItems ? (
							<div key={item.name} className="relative">
								<button
									onClick={() => toggleSection(item.name)}
									className="flex justify-between items-center w-full p-3 rounded-md text-left transition-all duration-300 hover:bg-gray-800">
									{item.name}
									<ChevronDown
										className={`w-4 h-4 transition-transform duration-300 ${
											openSection === item.name ? "rotate-180" : ""
										}`}
									/>
								</button>
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{
										height: openSection === item.name ? "auto" : 0,
										opacity: openSection === item.name ? 1 : 0,
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
			</ScrollArea>
			<div className="mt-auto flex flex-col gap-2">
				{personalItems.map((item) =>
					item.name === "Logout" ? (
						<Button
							variant="ghost"
							key={item.name}
							onClick={handleLogout}
							className="px-3 py-6 rounded-md transition hover:bg-gray-700 hover:text-white text-left justify-start cursor-pointer">
							{item.name}
						</Button>
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
			<aside className="hidden md:flex w-1/5 max-w-[30%] h-screen">
				{sidebarContent}
			</aside>
		</>
	);
}
