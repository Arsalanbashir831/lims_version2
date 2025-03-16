import React, { useState } from "react";
import { Input } from "../ui/input";

export default function SpecimenIdInput({
	specimenIds,
	setSpecimenIds,
	maxSpecimenCount,
}) {
	const [inputValue, setInputValue] = useState("");

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && inputValue.trim() !== "") {
			// Check if maximum specimen count has been reached.
			if (maxSpecimenCount && specimenIds.length >= maxSpecimenCount) {
				e.preventDefault();
				return;
			}
			setSpecimenIds([...specimenIds, inputValue.trim()]);
			setInputValue("");
			e.preventDefault();
		} else if (e.key === "Backspace" && inputValue === "") {
			setSpecimenIds(specimenIds.slice(0, -1));
		}
	};

	return (
		<div className="flex flex-wrap border p-2">
			{specimenIds.map((id, index) => (
				<span key={index} className="bg-blue-200 px-2 py-1 m-1 rounded text-sm">
					{id}
				</span>
			))}
			<Input
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder="Enter ID and press Enter"
				className="flex-1 outline-none"
			/>
		</div>
	);
}
