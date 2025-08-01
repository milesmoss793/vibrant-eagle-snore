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
import Dashboard from "./pages/Dashboard";
import { ExpenseProvider } from "./context/ExpenseContext";
import { IncomeProvider } from "./context/IncomeContext";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import AddIncome from "./pages/AddIncome";
import ViewIncome from "./pages/ViewIncome";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserPreferencesProvider>
        <Toaster />
        <Sonner />
        <TooltipProvider>
          <BrowserRouter>
            <ExpenseProvider>
              <IncomeProvider>
                <Routes>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Dashboard />} /> {/* Changed to Dashboard */}
                    <Route path="add-expense" element={<AddExpense />} />
                    <Route path="view-expenses" element={<ViewExpenses />} />
                    <Route path="add-income" element={<AddIncome />} />
                    <Route path="view-income" element={<ViewIncome />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </IncomeProvider>
            </ExpenseProvider>
          </BrowserRouter>
        </TooltipProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;