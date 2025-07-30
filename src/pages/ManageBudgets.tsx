import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "@/components/ui/use-toast";
import { useBudgets, Budget } from "@/context/BudgetContext";

const budgetFormSchema = z.object({
  category: z.string().min(1, { message: "Please select a category." }),
  limit: z.coerce.number().min(0.01, { message: "Limit must be positive." }),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

const categories = [
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Education",
  "Rent",
  "Other",
];

const ManageBudgets: React.FC = () => {
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudgets();
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: "",
      limit: undefined,
    },
  });

  React.useEffect(() => {
    if (editingBudget) {
      form.reset({
        category: editingBudget.category,
        limit: editingBudget.limit,
      });
    } else {
      form.reset({
        category: "",
        limit: undefined,
      });
    }
  }, [editingBudget, form]);

  const onSubmit = (values: BudgetFormValues) => {
    if (editingBudget) {
      updateBudget({ ...values, id: editingBudget.id });
      toast({
        title: "Budget Updated!",
        description: `Category: ${values.category}, Limit: $${values.limit.toFixed(2)}`,
      });
      setEditingBudget(null);
    } else {
      // Check if budget for this category already exists
      if (budgets.some(b => b.category === values.category)) {
        toast({
          title: "Category Already Budgeted",
          description: `A budget for ${values.category} already exists. Please edit the existing one.`,
          variant: "destructive",
        });
        return;
      }
      addBudget(values);
      toast({
        title: "Budget Added!",
        description: `Category: ${values.category}, Limit: $${values.limit.toFixed(2)}`,
      });
    }
    form.reset({
      category: "",
      limit: undefined,
    });
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
  };

  const handleDelete = (id: string) => {
    deleteBudget(id);
    toast({
      title: "Budget Deleted!",
      description: "The budget entry has been removed.",
    });
  };

  return (
    <div className="flex justify-center py-8">
      <div className="w-full max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{editingBudget ? "Edit Budget" : "Set New Budget"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!!editingBudget}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="limit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Limit</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {editingBudget ? "Save Changes" : "Set Budget"}
                </Button>
                {editingBudget && (
                  <Button variant="outline" className="w-full mt-2" onClick={() => setEditingBudget(null)}>
                    Cancel Edit
                  </Button>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Your Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            {budgets.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No budgets set yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Limit</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {budgets.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell>{budget.category}</TableCell>
                        <TableCell className="text-right">${budget.limit.toFixed(2)}</TableCell>
                        <TableCell className="flex justify-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(budget)}>
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
                                  budget entry.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(budget.id)}>
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
      </div>
    </div>
  );
};

export default ManageBudgets;