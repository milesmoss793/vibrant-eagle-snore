import React, { useState, useMemo } from "react";
import { useIncome, Income } from "@/context/IncomeContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditIncomeDialog from "@/components/EditIncomeDialog";

type SortKey = "date" | "source" | "amount";
type SortOrder = "asc" | "desc";

const ViewIncome: React.FC = () => {
  const { income, deleteIncome } = useIncome();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIncomeEntry, setSelectedIncomeEntry] = useState<Income | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc"); // Default to descending date

  const handleDelete = (id: string) => {
    deleteIncome(id);
  };

  const handleEdit = (incomeEntry: Income) => {
    setSelectedIncomeEntry(incomeEntry);
    setIsEditDialogOpen(true);
  };

  const sortedIncome = useMemo(() => {
    const sortableIncome = [...income];
    sortableIncome.sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "date") {
        compareValue = a.date.getTime() - b.date.getTime();
      } else if (sortBy === "source") {
        compareValue = a.source.localeCompare(b.source);
      } else if (sortBy === "amount") {
        compareValue = a.amount - b.amount;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });
    return sortableIncome;
  }, [income, sortBy, sortOrder]);

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-center">All Income</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={(value: SortKey) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(value: SortOrder) => setSortOrder(value)}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {income.length === 0 ? (
            <p className="text-center text-muted-foreground">No income recorded yet. Add some!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedIncome.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(entry.date, "PPP")}</TableCell>
                      <TableCell>{entry.source}</TableCell>
                      <TableCell className="text-right">${entry.amount.toFixed(2)}</TableCell>
                      <TableCell>{entry.description || "-"}</TableCell>
                      <TableCell className="flex justify-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                income entry.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {selectedIncomeEntry && (
        <EditIncomeDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          incomeEntry={selectedIncomeEntry}
        />
      )}
    </div>
  );
};

export default ViewIncome;