import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	Table,
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
} from "@/components/ui/table";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import {
	ref,
	uploadBytes,
	getDownloadURL,
	deleteObject,
} from "firebase/storage";
import { storage } from "@/config/firebase-config";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function SpecimenSection({
	groupKey,
	idx,
	row,
	columns,
	values,
	requestId,
	onChange,
	extraIds = [],
	onAddRow,
	onRemoveRow,
	onRemoveSection,
}) {
	// Manage custom columns inserted by user
	const [customCols, setCustomCols] = useState([]); // { name, pos }
	// For inline editing of column names
	const [editingIndex, setEditingIndex] = useState(null);
	const [tempName, setTempName] = useState("");

	// Calculate the combined header list including custom columns
	const displayColumns = useMemo(() => {
		const base = [...columns];
		customCols
			.slice()
			.sort((a, b) => a.pos - b.pos)
			.forEach(({ name, pos }) => base.splice(pos, 0, name));
		return base;
	}, [columns, customCols]);

	const specimenKey = `${groupKey}-specimen-${idx}`;
	const idKey = `${specimenKey}-id`;
	const selectedId = values[idKey] || row.specimenIds?.[0] || "";

	function addColumn(at, after) {
		const name = "New Column";
		const pos = after ? at + 1 : at;
		setCustomCols((prev) => [...prev, { name, pos }]);
		setMenuIndex(null);
	}

	const handleDeleteImage = async (keyName) => {
		const cellVal = values[keyName];
		if (cellVal?.storagePath) {
			try {
				await deleteObject(ref(storage, cellVal.storagePath));
			} catch {}
		}
		onChange(keyName, null);
	};

	return (
		<div className="border rounded-lg p-4 bg-white shadow-sm mb-6">
			<div className="flex justify-between items-center mb-4">
				<Select value={selectedId} onValueChange={(v) => onChange(idKey, v)}>
					<SelectTrigger className="w-full mr-2">
						{selectedId || "Select Specimen"}
					</SelectTrigger>
					<SelectContent>
						{row.specimenIds?.map((id) => (
							<SelectItem key={id} value={id}>
								{id}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button
					variant="destructive"
					size="sm"
					onClick={() => onRemoveSection(groupKey, idx)}>
					Remove Section
				</Button>
			</div>

			<ScrollArea className="max-h-80 overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							{displayColumns.map((col, i) => {
								const isCustom = customCols.some((c) => c.pos === i);
								return (
									<TableHead
										key={`${col}-${i}`}
										className="relative group px-2">
										<div className="flex items-center justify-between">
											{editingIndex === i && isCustom ? (
												<Input
													size="sm"
													value={tempName}
													onChange={(e) => setTempName(e.target.value)}
													onBlur={() => {
														setCustomCols((prev) =>
															prev.map((c) =>
																c.pos === i ? { ...c, name: tempName } : c
															)
														);
														setEditingIndex(null);
													}}
													onKeyDown={(e) => {
														if (e.key === "Enter") e.currentTarget.blur();
													}}
													className="border p-1 w-fit"
												/>
											) : (
												<span
													onDoubleClick={() => {
														if (isCustom) {
															setEditingIndex(i);
															setTempName(col);
														}
													}}
													className="cursor-pointer text-center">
													{col}
												</span>
											)}
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="opacity-0 group-hover:opacity-100">
														+
													</Button>
												</PopoverTrigger>
												<PopoverContent>
													<Button size="sm" onClick={() => addColumn(i, false)}>
														Add Before
													</Button>
													<Button size="sm" onClick={() => addColumn(i, true)}>
														Add After
													</Button>
													{isCustom && (
														<Button
															size="sm"
															variant="destructive"
															onClick={() =>
																setCustomCols((prev) =>
																	prev.filter((c) => c.pos !== i)
																)
															}>
															Remove Column
														</Button>
													)}
												</PopoverContent>
											</Popover>
										</div>
									</TableHead>
								);
							})}
							<TableHead className="px-2">Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody>
						{/* Base Row */}
						<TableRow>
							{displayColumns.map((col) => {
								const keyName = `${groupKey}-specimen-${idx}-0-${col}`;
								const raw = row[col.toLowerCase().replace(/ /g, "")] || "";
								const val = values[keyName] ?? raw;
								if (col.toLowerCase() === "images") {
									const preview = val?.preview || val;
									return (
										<TableCell key={col} className="relative p-2">
											{preview ? (
												<div className="relative h-24">
													<img
														src={preview}
														alt="Preview"
														className="w-full h-full object-contain"
													/>
													<Button
														variant="ghost"
														size="icon"
														className="absolute top-1 right-1"
														onClick={() => handleDeleteImage(keyName)}>
														×
													</Button>
												</div>
											) : (
												<label className="block w-24 h-24 border-dashed border-2 border-gray-300 flex items-center justify-center cursor-pointer text-gray-400">
													<span>Upload</span>
													<input
														type="file"
														accept="image/*"
														className="hidden"
														onChange={async (e) => {
															const file = e.target.files?.[0];
															if (!file) return;
															const preview = URL.createObjectURL(file);
															const path = `certificates/${requestId}/${file.name}`;
															const snap = await uploadBytes(
																ref(storage, path),
																file
															);
															const url = await getDownloadURL(snap.ref);
															onChange(keyName, {
																preview,
																downloadURL: url,
																storagePath: path,
															});
														}}
													/>
												</label>
											)}
										</TableCell>
									);
								}
								return (
									<TableCell key={col} className="p-2">
										<Input
											value={val}
											onChange={(e) => onChange(keyName, e.target.value)}
											size="sm"
										/>
									</TableCell>
								);
							})}
							<TableCell className="p-2" />
						</TableRow>
						{/* Extra Rows - unchanged, mapping displayColumns similarly */}
						{extraIds.map((extraId) => (
							<TableRow key={extraId}>
								{displayColumns.map((col) => {
									const keyName = `${groupKey}-specimen-${idx}-extra-${extraId}-${col}`;
									const val = values[keyName] || "";
									return (
										<TableCell key={col} className="p-2">
											<Input
												value={val}
												onChange={(e) => onChange(keyName, e.target.value)}
												size="sm"
											/>
										</TableCell>
									);
								})}
								<TableCell className="p-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() => onRemoveRow(specimenKey, extraId)}>
										Remove Row
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
				<ScrollBar orientation="horizontal" />
			</ScrollArea>

			<div className="mt-4 flex items-center space-x-2">
				<Button
					size="sm"
					variant="outline"
					onClick={() => onAddRow(specimenKey)}>
					+ Add Row
				</Button>
			</div>
		</div>
	);
}
