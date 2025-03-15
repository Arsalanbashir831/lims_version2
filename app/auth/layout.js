import GuestRoute from "@/components/GuestRoute";

export default function DashboardLayout({ children }) {
	return (
		<>
			<GuestRoute>{children}</GuestRoute>;
		</>
	);
}
