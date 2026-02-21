import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/layout/MainLayout";
import AddExpense from "./pages/AddExpense";
import ViewExpenses from "./pages/ViewExpenses";
import Dashboard from "./pages/Dashboard";
import { ExpenseProvider } from "./context/ExpenseContext";
import { IncomeProvider } from "./context/IncomeContext";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import { CategoryProvider } from "./context/CategoryContext";
import { RecurringProvider } from "./context/RecurringContext";
import { BudgetProvider } from "./context/BudgetContext";
import { GoalProvider } from "./context/GoalContext";
import { GameProvider } from "./context/GameContext";
import AddIncome from "./pages/AddIncome";
import ViewIncome from "./pages/ViewIncome";
import Settings from "./pages/Settings";
import RecurringTransactions from "./pages/RecurringTransactions";
import RecurringManager from "./components/RecurringManager";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Game from "./pages/Game";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserPreferencesProvider>
        <CategoryProvider>
          <RecurringProvider>
            <BudgetProvider>
              <GoalProvider>
                <GameProvider>
                  <Toaster />
                  <Sonner position="top-center" />
                  <TooltipProvider>
                    <BrowserRouter>
                      <ExpenseProvider>
                        <IncomeProvider>
                          <RecurringManager />
                          <Routes>
                            <Route path="/" element={<MainLayout />}>
                              <Route index element={<Dashboard />} />
                              <Route path="add-expense" element={<AddExpense />} />
                              <Route path="view-expenses" element={<ViewExpenses />} />
                              <Route path="add-income" element={<AddIncome />} />
                              <Route path="view-income" element={<ViewIncome />} />
                              <Route path="settings" element={<Settings />} />
                              <Route path="recurring" element={<RecurringTransactions />} />
                              <Route path="budgets" element={<Budgets />} />
                              <Route path="goals" element={<Goals />} />
                              <Route path="game" element={<Game />} />
                              <Route path="*" element={<NotFound />} />
                            </Route>
                          </Routes>
                        </IncomeProvider>
                      </ExpenseProvider>
                    </BrowserRouter>
                  </TooltipProvider>
                </GameProvider>
              </GoalProvider>
            </BudgetProvider>
          </RecurringProvider>
        </CategoryProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;