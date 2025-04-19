import React, { useMemo, useState, useCallback, useEffect } from "react";
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
import { X } from "lucide-react";
import Image from "next/image";

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
	customCols,
	setCustomCols,
}) {
	console.log("SpecimenSection", {
		groupKey,
		idx,
		row,
		columns,
		values,
		requestId,
		extraIds,
		customCols,
	});
	const [editingIndex, setEditingIndex] = useState(null);
	const [tempName, setTempName] = useState("");

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

	// gather specimen IDs
	const specimenIds =
		row.specimenIds || row.specimenSections?.map((s) => s.specimenId) || [];
	const defaultId = row.specimenSections?.[idx]?.specimenId || null;
	const selectedId = values[idKey] !== "" ? values[idKey] : defaultId;

	console.log("values[idKey]", values[idKey]);
	console.log("specimenIds", specimenIds);
	console.log("defaultId", defaultId);
	console.log("selectedId", selectedId);

	// initialize default specimenId
	useEffect(() => {
		if (defaultId && values[idKey] === undefined) {
			onChange(idKey, defaultId);
		}
	}, [defaultId, idKey, onChange, values]);

	const addColumn = useCallback(
		(at, after) => {
			const pos = after ? at + 1 : at;
			setCustomCols([...customCols, { name: "New Column", pos }]);
		},
		[customCols, setCustomCols]
	);

	const handleUploadImage = useCallback(
		async (keyName, file) => {
			const preview = URL.createObjectURL(file);
			const storagePath = `certificates/${requestId}/${file.name}`;
			const snap = await uploadBytes(ref(storage, storagePath), file);
			const downloadURL = await getDownloadURL(snap.ref);
			onChange(keyName, { preview, downloadURL, storagePath });
		},
		[onChange, requestId]
	);

	const handleDeleteImage = useCallback(
		async (keyName) => {
			const cellVal = values[keyName];
			if (cellVal?.storagePath) {
				await deleteObject(ref(storage, cellVal.storagePath)).catch(() => {});
			}
			onChange(keyName, null);
		},
		[onChange, values]
	);

	const renderCell = (col, sectionIndex, extraId = null) => {
		const rowType = extraId !== null ? `extra-${extraId}` : "0";
		const keyName = `${specimenKey}-${rowType}-${col}`;

		// handle images
		if (col.toLowerCase() === "images") {
			// fallback to existing URL if no new upload
			const existingUrl =
				row.specimenSections?.[sectionIndex]?.tableData[0]?.images || null;
			const val = values[keyName]
				? values[keyName]
				: existingUrl
				? { preview: existingUrl, downloadURL: existingUrl, storagePath: null }
				: {};
			const preview = val.preview;
			return (
				<TableCell key={col} className="relative p-2">
					{preview ? (
						<div className="relative h-24">
							<Image
								src={preview}
								alt="Preview"
								width={96}
								height={96}
								className="w-full h-full object-contain"
							/>
							<Button
								variant="secondary"
								size="icon"
								className="absolute top-0 -right-2 w-fit h-fit p-0.5"
								onClick={() => handleDeleteImage(keyName)}>
								<X className="h-4 w-4" />
							</Button>
						</div>
					) : (
						<label className="w-24 h-24 border-dashed border-2 border-gray-300 flex items-center justify-center cursor-pointer text-gray-400">
							<span>Upload</span>
							<input
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleUploadImage(keyName, file);
								}}
							/>
						</label>
					)}
				</TableCell>
			);
		}

		// text/fallback for non-image
		let raw = "";
		if (row.specimenSections) {
			raw = row.specimenSections[sectionIndex]?.tableData[0]?.[col] || "";
		} else if (row[col.toLowerCase().replace(/ /g, "")]) {
			raw = row[col.toLowerCase().replace(/ /g, "")] || "";
		}
		const val = values[keyName] ?? raw;
		return (
			<TableCell key={col} className="p-2">
				<Input
					value={val}
					onChange={(e) => onChange(keyName, e.target.value)}
					size="sm"
				/>
			</TableCell>
		);
	};

	const allRows = [{ type: "base" }].concat(
		extraIds.map((id) => ({ type: "extra", extraId: id }))
	);

	return (
		<div className="border rounded-lg p-4 bg-white shadow-sm mb-6">
			<div className="flex justify-between items-center mb-4">
				<Select value={selectedId} onValueChange={(v) => onChange(idKey, v)}>
					<SelectTrigger className="w-full mr-2">
						{selectedId || "Select Specimen"}
					</SelectTrigger>
					<SelectContent>
						{specimenIds.map((id) => (
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
														setCustomCols(
															customCols.map((c) =>
																c.pos === i ? { ...c, name: tempName } : c
															)
														);
														setEditingIndex(null);
													}}
													onKeyDown={(e) =>
														e.key === "Enter" && e.currentTarget.blur()
													}
													className="border p-1 w-fit"
												/>
											) : (
												<span
													onDoubleClick={() =>
														isCustom && (setEditingIndex(i), setTempName(col))
													}
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
												<PopoverContent className="flex flex-col space-y-2 p-2 max-w-[150px]">
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
																setCustomCols(
																	customCols.filter((c) => c.pos !== i)
																)
															}>
															Remove
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
						{allRows.map(({ type, extraId }) => (
							<TableRow key={type === "base" ? "base" : extraId}>
								{displayColumns.map((col) =>
									renderCell(col, idx, type === "extra" ? extraId : null)
								)}
								<TableCell className="p-2">
									{type === "extra" && (
										<Button
											variant="outline"
											size="sm"
											onClick={() => onRemoveRow(specimenKey, extraId)}>
											Remove Row
										</Button>
									)}
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
