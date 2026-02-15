import React, { useState, useMemo } from "react";
import { useIncome, Income } from "@/context/IncomeContext";
import { useCategories } from "@/context/CategoryContext";
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
import { Edit, Trash2, CalendarIcon } from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

type SortKey = "date" | "source" | "amount";
type SortOrder = "asc" | "desc";

const ViewIncome: React.FC = () => {
  const { income, deleteIncome } = useIncome();
  const { incomeSources } = useCategories();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIncomeEntry, setSelectedIncomeEntry] = useState<Income | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const handleDelete = (id: string) => {
    deleteIncome(id);
  };

  const handleEdit = (incomeEntry: Income) => {
    setSelectedIncomeEntry(incomeEntry);
    setIsEditDialogOpen(true);
  };

  const filteredAndSortedIncome = useMemo(() => {
    let currentIncome = [...income];

    if (selectedSource !== "all") {
      currentIncome = currentIncome.filter(
        (entry) => entry.source === selectedSource
      );
    }

    if (dateRange?.from) {
      currentIncome = currentIncome.filter((entry) => {
        const incomeDate = new Date(entry.date.getFullYear(), entry.date.getMonth(), entry.date.getDate());
        const fromDate = new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate());
        const toDate = dateRange.to ? new Date(dateRange.to.getFullYear(), dateRange.to.getMonth(), dateRange.to.getDate()) : fromDate;
        
        return incomeDate >= fromDate && incomeDate <= toDate;
      });
    }

    currentIncome.sort((a, b) => {
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
    return currentIncome;
  }, [income, selectedSource, dateRange, sortBy, sortOrder]);

  return (
    <div className="flex justify-center py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-center">All Income</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {incomeSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Filter by Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
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
          {filteredAndSortedIncome.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No income found for the selected filters.</p>
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
                  {filteredAndSortedIncome.map((entry) => (
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