"use client";

import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
	ChevronDown, Menu, LayoutDashboard, FlaskConical, Beaker, FileText,
	FilePlus, FolderOpen, Settings, User, LogOut, X, PackagePlus,
	PackageSearch, ClipboardList, ClipboardPlus, TestTubeDiagonal, Building,
} from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { logOut } from "@/lib/auth";
import { toast } from "sonner";
import { ScrollArea } from "../ui/scroll-area"; // Adjust path if needed
import { cn } from "@/lib/utils"; // Adjust path if needed

// --- Data with Icons (Keep as is) ---
const navItems = [
	{ name: "Dashboard", href: "/", icon: LayoutDashboard },
	{
		name: "Testing",
		icon: TestTubeDiagonal,
		subItems: [
			{ name: "Proficiency Testing", href: "/testing/proficiency" },
			{ name: "Calibration Testing", href: "/testing/calibration" },
		],
	},
	{ name: "Lab Equipments", href: "/lab-equipments", icon: Beaker },
	{
		name: "Sample Receiving",
		icon: PackageSearch,
		subItems: [
			{ name: "Add New Job", href: "/jobs/new", icon: PackagePlus },
			{ name: "Job Records", href: "/jobs", icon: FolderOpen },
		],
	},
	{
		name: "Sample Prep & Request",
		icon: FlaskConical,
		subItems: [
			{ name: "Add Request", href: "/requests/new", icon: ClipboardPlus },
			{ name: "Request Records", href: "/requests", icon: ClipboardList },
		],
	},
	{
		name: "Test Reports",
		icon: FileText,
		subItems: [
			{ name: "Add Reports", href: "/reports/new", icon: FilePlus },
			{ name: "View Reports", href: "/reports", icon: FolderOpen },
		],
	},
];

const personalItems = [
	{ name: "Profile", href: ROUTES.USER.PROFILE, icon: User },
];

// --- Reusable Sidebar Content Component (Keep as is) ---
const SidebarContent = ({
	pathname,
	openSection,
	toggleSection,
	handleLinkClick, // <--- ADD THIS LINE
	handleLogout,
}) => {
    // ... (Keep the existing SidebarContent implementation)
    // Helper to determine if a link or its children are active
	const isActive = (item) => {
		if (item.href && pathname === item.href) {
			return true;
		}
		if (item.subItems) {
			return item.subItems.some((sub) => pathname === sub.href);
		}
		return false;
	};

	return (
		<div className="flex h-full flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 shadow-lg">
			{/* Header */}
			<div className="flex h-16 shrink-0 items-center justify-center border-b border-slate-700 px-4 lg:px-6">
				<Link
					href="/"
					className="flex items-center gap-2 text-xl font-semibold"
					onClick={handleLinkClick}>
					<Building className="h-6 w-6 text-emerald-400" />
					<span className="text-slate-50">LIMS Pro</span>
				</Link>
			</div>

			{/* Navigation */}
			<ScrollArea className="flex-1 px-3 py-4 lg:px-4"> {/* flex-1 makes ScrollArea take available space */}
				<nav className="flex flex-col gap-1">
					{navItems.map((item) => {
						const Icon = item.icon;
						const itemIsActive = isActive(item);

						return item.subItems ? (
							// Accordion Section (keep implementation)
                            <div key={item.name}>
								<button
									onClick={() => toggleSection(item.name)}
									className={cn(
										"flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150",
										"hover:bg-slate-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
										itemIsActive && !item.href ? "text-emerald-400" : "text-slate-200"
									)}>
									<span className="flex items-center gap-3">
										{Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
										{item.name}
									</span>
									<ChevronDown
										className={cn(
											"h-4 w-4 flex-shrink-0 transition-transform duration-300 ease-in-out",
											openSection === item.name ? "rotate-180" : ""
										)}
									/>
								</button>
								<AnimatePresence>
									{openSection === item.name && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: "auto", opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											transition={{ duration: 0.2, ease: "easeInOut" }}
											className="overflow-hidden">
											<div className="mt-1 flex flex-col gap-1 pl-8 pr-2 pt-1">
												{item.subItems.map((sub) => {
													const SubIcon = sub.icon;
													const subIsActive = pathname === sub.href;
													return (
														<Link
															key={sub.href}
															href={sub.href}
															onClick={handleLinkClick}
															className={cn(
																"group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
																"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-800",
																subIsActive
																	? "bg-emerald-600/80 text-white shadow-inner"
																	: "text-slate-300 hover:bg-slate-700/50 hover:text-slate-100"
															)}>
															{SubIcon ? (
																<SubIcon className="h-4 w-4 flex-shrink-0" />
															) : (
																<span className="w-4"></span>
															)}
															{sub.name}
														</Link>
													);
												})}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						) : (
                            // Single Link Section (keep implementation)
							<Link
								key={item.href}
								href={item.href}
								onClick={handleLinkClick}
								className={cn(
									"group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
									itemIsActive
										? "bg-emerald-600/80 text-white shadow-inner"
										: "text-slate-200 hover:bg-slate-700/50 hover:text-slate-100"
								)}>
								{Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
								{item.name}
							</Link>
						);
					})}
				</nav>
			</ScrollArea>

			{/* Footer / Personal Items */}
             {/* shrink-0 prevents the footer from shrinking */}
			<div className="shrink-0 border-t border-slate-700 p-3 lg:px-4 lg:py-4">
				<nav className="flex flex-col gap-1">
					{personalItems.map((item) => {
                        // Link Section (keep implementation)
						const Icon = item.icon;
						const itemIsActive = pathname === item.href;
						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={handleLinkClick}
								className={cn(
									"group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
									itemIsActive
										? "bg-emerald-600/80 text-white shadow-inner"
										: "text-slate-200 hover:bg-slate-700/50 hover:text-slate-100"
								)}>
								{Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
								{item.name}
							</Link>
						);
					})}
                     {/* Button Section (keep implementation) */}
					<Button
						variant="ghost"
						onClick={handleLogout}
						className={cn(
							"group flex w-full items-center justify-start gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150",
							"text-slate-300 hover:bg-red-900/30 hover:text-red-300",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
						)}>
						<LogOut className="h-5 w-5 flex-shrink-0" />
						Logout
					</Button>
				</nav>
			</div>
		</div>
	);
};


// --- Main Sidebar Component ---
export default function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const [openSection, setOpenSection] = useState(null);
	const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

	// useMemo and handlers (Keep as is)
    useMemo(() => {
		const activeParent = navItems.find((item) =>
			item.subItems?.some((sub) => sub.href === pathname)
		);
		// Open section if a child is active and section isn't already open
        // Adjusted logic slightly to avoid unnecessary state updates if already open
		if (activeParent && openSection !== activeParent.name) {
			// setOpenSection(activeParent.name); // Decide if you want auto-open on navigation
            // Keeping it manual might be less disruptive UX-wise. If you want auto-open, uncomment the line above.
		}
	}, [pathname, openSection]); // Dependency array includes openSection

	const toggleSection = (sectionName) => {
		setOpenSection((prevOpenSection) =>
			prevOpenSection === sectionName ? null : sectionName
		);
	};

	const handleLinkClick = () => {
		setIsMobileSheetOpen(false);
	};

	const handleLogout = async (e) => {
        // ... (Keep existing logout logic)
        e.preventDefault();
		const result = await logOut();
		handleLinkClick();
		if (result.error) {
			toast.error("Logout failed: " + result.error);
		} else {
			toast.success("Successfully logged out!");
			router.push(ROUTES.AUTH.LOGIN);
		}
	};

	const commonSidebarProps = {
		pathname,
		openSection,
		toggleSection,
		handleLinkClick,
		handleLogout,
	};

	return (
		<>
			{/* Mobile Sidebar: Sheet remains fixed */}
			<Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
				<SheetTrigger asChild>
					{/* Keep fixed positioning ONLY for the mobile trigger */}
					<Button
						variant="ghost"
						size="icon"
						className="fixed left-4 top-4 z-50 rounded-full bg-slate-800/50 p-2 text-slate-200 backdrop-blur-sm hover:bg-slate-700/70 md:hidden"
                    >
						<Menu className="h-6 w-6" />
						<span className="sr-only">Open Menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent
					side="left"
                    // Ensure sheet content takes full height and applies styles
					className="flex h-full w-72 flex-col border-r border-slate-700 bg-transparent p-0 md:hidden"
					closeClassName="text-slate-300 hover:text-white focus:ring-slate-500 top-3 right-3"
                >
                    {/* Pass all props needed by SidebarContent */}
					<SidebarContent {...commonSidebarProps} />
				</SheetContent>
			</Sheet>

			{/* Desktop Sidebar: No longer fixed, part of the flex layout */}
			{/* 'hidden md:flex' ensures it's hidden on mobile, shown as flex container on desktop */}
			{/* 'w-64 lg:w-72' defines the width */}
			{/* 'flex-col' ensures content inside stacks vertically */}
            {/* 'h-full' makes it take the full height defined by the parent in DashboardLayout */}
            {/* 'shrink-0' prevents the sidebar from shrinking if content is very narrow */}
			<aside className="hidden md:flex md:w-64 lg:w-72 md:flex-col h-full shrink-0">
                {/* Pass all props needed by SidebarContent */}
				<SidebarContent {...commonSidebarProps} />
			</aside>

            {/* NO NEED for manual padding on main content anymore */}
		</>
	);
}