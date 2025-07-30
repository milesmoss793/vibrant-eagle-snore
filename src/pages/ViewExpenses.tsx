import React, { useState, useMemo } from "react";
import { useExpenses, Expense } from "@/context/ExpenseContext";
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
import EditExpenseDialog from "@/components/EditExpenseDialog";

type SortKey = "date" | "category" | "amount";
type SortOrder = "asc" | "desc";

const ViewExpenses: React.FC = () => {
  const { expenses, deleteExpense } = useExpenses();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc"); // Default to descending date

  const handleDelete = (id: string) => {
    deleteExpense(id);
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditDialogOpen(true);
  };

  const sortedExpenses = useMemo(() => {
    const sortableExpenses = [...expenses];
    sortableExpenses.sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "date") {
        compareValue = a.date.getTime() - b.date.getTime();
      } else if (sortBy === "category") {
        compareValue = a.category.localeCompare(b.category);
      } else if (sortBy === "amount") {
        compareValue = a.amount - b.amount;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });
    return sortableExpenses;
  }, [expenses, sortBy, sortOrder]);

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-center">All Expenses</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={(value: SortKey) => setSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="category">Category</SelectItem>
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
          {expenses.length === 0 ? (
            <p className="text-center text-muted-foreground">No expenses recorded yet. Add some!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{format(expense.date, "PPP")}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                      <TableCell>{expense.description || "-"}</TableCell>
                      <TableCell className="flex justify-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(expense)}>
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
                                expense entry.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(expense.id)}>
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
      {selectedExpense && (
        <EditExpenseDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          expense={selectedExpense}
        />
      )}
    </div>
  );
};

export default ViewExpenses;