import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Trash2, Power, PowerOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useRecurring, Frequency } from "@/context/RecurringContext";
import { useCategories } from "@/context/CategoryContext";

const recurringFormSchema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.coerce.number().min(0.01, { message: "Amount must be positive." }),
  categoryOrSource: z.string().min(1, { message: "Please select a category or source." }),
  frequency: z.enum(['daily', 'weekly', 'bi-weekly', 'three-weeks', 'monthly', 'yearly']),
  startDate: z.date({ required_error: "A start date is required." }),
  endDate: z.date().optional(),
  description: z.string().optional(),
});

type RecurringFormValues = z.infer<typeof recurringFormSchema>;

const RecurringTransactions: React.FC = () => {
  const { recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } = useRecurring();
  const { expenseCategories, incomeSources } = useCategories();

  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringFormSchema),
    defaultValues: {
      type: 'expense',
      amount: undefined,
      categoryOrSource: "",
      frequency: 'monthly',
      description: "",
      startDate: new Date(),
    },
  });

  const transactionType = form.watch('type');

  const onSubmit = (values: RecurringFormValues) => {
    addRecurringTransaction(values);
    toast({
      title: "Recurring Transaction Added",
      description: `A new ${values.frequency} ${values.type} has been scheduled.`,
    });
    form.reset({
      type: 'expense',
      amount: undefined,
      categoryOrSource: "",
      frequency: 'monthly',
      description: "",
      startDate: new Date(),
    });
  };

  const toggleActive = (transaction: any) => {
    updateRecurringTransaction({ ...transaction, isActive: !transaction.isActive });
    toast({
      title: transaction.isActive ? "Deactivated" : "Activated",
      description: `Recurring ${transaction.type} is now ${transaction.isActive ? 'inactive' : 'active'}.`,
    });
  };

  return (
    <div className="space-y-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Schedule Recurring</CardTitle>
            <CardDescription>Set up automated expenses or income.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryOrSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{transactionType === 'expense' ? 'Category' : 'Source'}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${transactionType === 'expense' ? 'category' : 'source'}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(transactionType === 'expense' ? expenseCategories : incomeSources).map((item) => (
                            <SelectItem key={item} value={item}>{item}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                          <SelectItem value="three-weeks">Every 3 weeks</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Rent, Netflix, Salary" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">Schedule</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* List Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Schedules</CardTitle>
            <CardDescription>Manage your recurring transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            {recurringTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recurring transactions scheduled.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Next Due</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recurringTransactions.map((t) => (
                      <TableRow key={t.id} className={!t.isActive ? "opacity-50" : ""}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium capitalize">{t.type}</span>
                            <span className="text-xs text-muted-foreground">{t.categoryOrSource}</span>
                          </div>
                        </TableCell>
                        <TableCell className={t.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                          ${t.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="capitalize">{t.frequency.replace('-', ' ')}</TableCell>
                        <TableCell>
                          {t.lastProcessedDate 
                            ? format(new Date(t.lastProcessedDate), "MMM dd") 
                            : format(new Date(t.startDate), "MMM dd")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={t.isActive ? "default" : "secondary"}>
                            {t.isActive ? "Active" : "Paused"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => toggleActive(t)}>
                            {t.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteRecurringTransaction(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

export default RecurringTransactions;