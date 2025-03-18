import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export async function getBase64FromUrl(url) {
	// Fetch the image as a blob
	const response = await fetch(url);
	const blob = await response.blob();

	// Convert blob to base64
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			// The result includes the prefix "data:image/png;base64,..."
			resolve(reader.result);
		};
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

export function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			// Remove the "data:image/jpeg;base64," prefix if needed.
			const base64 = reader.result.split(",")[1];
			resolve(base64);
		};
		reader.onerror = (error) => reject(error);
	});
}
