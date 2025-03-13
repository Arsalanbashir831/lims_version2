"use client";

import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronDown } from "lucide-react";

export default function TestMethodsDropdown({ options, selected, onChange }) {
	const toggleOption = (option) => {
		let newSelected;
		if (selected.some((item) => item.test_id === option.test_id)) {
			newSelected = selected.filter((item) => item.test_id !== option.test_id);
		} else {
			newSelected = [...selected, option];
		}
		onChange(newSelected);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" className="w-full justify-between">
					{/* Wrap badges in a ScrollArea for horizontal scrolling */}
					<ScrollArea className="w-[200px]">
						<div className="flex flex-nowrap gap-1">
							{selected.length > 0 ? (
								selected.map((item) => (
									<span
										key={item.test_id}
										className="bg-blue-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
										{item.test_name}
									</span>
								))
							) : (
								<span className="text-gray-500 whitespace-nowrap">
									Select Test Methods
								</span>
							)}
						</div>
						<ScrollBar orientation="horizontal" />
					</ScrollArea>
					<ChevronDown className="w-4 h-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-full z-50" align="start" sideOffset={5}>
				{options.map((option) => (
					<DropdownMenuCheckboxItem
						key={option.test_id}
						checked={selected.some((item) => item.test_id === option.test_id)}
						onCheckedChange={() => toggleOption(option)}
						// Prevent the dropdown from closing on select
						onSelect={(event) => event.preventDefault()}>
						{option.test_name}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
