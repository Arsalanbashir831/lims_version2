import Image from "next/image";

export function IASLogo() {
	return (
		<div className="flex items-center justify-center">
			<Image
				src="/ias_logo.jpg"
				alt="IAS Logo"
				width={80}
				height={80}
				priority
			/>
		</div>
	);
}
