// src/app/dashboard/layout.js (or wherever your layout file is)
import Sidebar from "@/components/common/Sidebar"; // Adjust path if needed
import ProtectedRoute from "@/components/ProtectedRoute"; // Adjust path if needed
import { ScrollArea } from "@/components/ui/scroll-area"; // Adjust path if needed

export default function DashboardLayout({ children }) {
	return (
		<div className="flex h-screen bg-gray-100"> {/* Use a slightly less stark background like bg-muted/40 or bg-slate-100 */}
			<Sidebar />

			<div className="flex flex-1 flex-col overflow-hidden"> {/* This container manages vertical layout */}

				{/* Optional Header can go here */}
				{/* <header className="shrink-0 bg-white shadow-sm px-4 md:px-6 py-3 border-b border-gray-200">
                    <h1 className="text-lg font-semibold text-gray-800">Page Title Placeholder</h1>
                </header> */}

				{/* Scrollable Content Area */}
				{/* Add min-h-0 here! */}
				<ScrollArea className="flex-1 p-4 md:p-6 min-h-0">
					<ProtectedRoute>{children}</ProtectedRoute>
                    {/* Optional: Add a max-width container if you don't want content stretching infinitely wide */}
                    {/* <div className="max-w-7xl mx-auto">
                        <ProtectedRoute>{children}</ProtectedRoute>
                    </div> */}
				</ScrollArea>

			</div>
		</div>
	);
}