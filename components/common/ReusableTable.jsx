import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const ReusableTable = ({ columns, data, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto border rounded-lg shadow-md bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-200 text-gray-700 font-semibold">
            {columns.map((col) => (
              <TableHead key={col.key} className="px-4 py-2 text-center">{col.label}</TableHead>
            ))}
            <TableHead className="px-4 py-2 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-gray-100 transition">
                {columns.map((col) => (
                  <TableCell key={col.key} className="px-4 py-2 text-center">
                    {row[col.key]}
                  </TableCell>
                ))}
                <TableCell className="px-4 py-2 text-center">
                  <Button size="sm" variant="outline" className="mr-2" onClick={() => onEdit(rowIndex)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(rowIndex)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="text-center text-gray-500 py-4">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReusableTable;
