import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import AddExpense from "./pages/AddExpense";
import ViewExpenses from "./pages/ViewExpenses";
import ExpenseSummary from "./pages/ExpenseSummary";
import { ExpenseProvider } from "./context/ExpenseContext";
import { IncomeProvider } from "./context/IncomeContext"; // New import
import AddIncome from "./pages/AddIncome"; // New import
import ViewIncome from "./pages/ViewIncome"; // New import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ExpenseProvider>
          <IncomeProvider> {/* Wrap with IncomeProvider */}
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Index />} />
                <Route path="add-expense" element={<AddExpense />} />
                <Route path="view-expenses" element={<ViewExpenses />} />
                <Route path="add-income" element={<AddIncome />} /> {/* New route */}
                <Route path="view-income" element={<ViewIncome />} /> {/* New route */}
                <Route path="expense-summary" element={<ExpenseSummary />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </IncomeProvider>
        </ExpenseProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;