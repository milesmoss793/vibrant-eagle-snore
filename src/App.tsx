import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import AddExpense from "./pages/AddExpense";
import ViewExpenses from "./pages/ViewExpenses";
import ExpenseSummary from "./pages/ExpenseSummary";
import { ExpenseProvider } from "./context/ExpenseContext";
import { IncomeProvider } from "./context/IncomeContext";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import { BudgetProvider } from "./context/BudgetContext"; // New import
import AddIncome from "./pages/AddIncome";
import ViewIncome from "./pages/ViewIncome";
import ManageBudgets from "./pages/ManageBudgets"; // New import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserPreferencesProvider>
        <BudgetProvider> {/* Wrap with BudgetProvider */}
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ExpenseProvider>
                <IncomeProvider>
                  <Routes>
                    <Route path="/" element={<MainLayout />}>
                      <Route index element={<Index />} />
                      <Route path="add-expense" element={<AddExpense />} />
                      <Route path="view-expenses" element={<ViewExpenses />} />
                      <Route path="add-income" element={<AddIncome />} />
                      <Route path="view-income" element={<ViewIncome />} />
                      <Route path="expense-summary" element={<ExpenseSummary />} />
                      <Route path="manage-budgets" element={<ManageBudgets />} /> {/* New Route */}
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </IncomeProvider>
              </ExpenseProvider>
            </BrowserRouter>
          </TooltipProvider>
        </BudgetProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;