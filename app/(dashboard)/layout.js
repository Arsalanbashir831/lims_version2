import Sidebar from "@/components/common/Sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardLayout({ children }) {
	return (
		<div className="flex h-screen bg-gray-100 overflow-hidden">
			<Sidebar />

			{/* Main Content */}
			<ScrollArea className="flex-1">{children}</ScrollArea>
		</div>
	);
}
