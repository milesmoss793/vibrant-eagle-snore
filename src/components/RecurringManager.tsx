import React, { useEffect, useRef } from 'react';
import { useRecurring, RecurringTransaction, Frequency } from '@/context/RecurringContext';
import { useExpenses } from '@/context/ExpenseContext';
import { useIncome } from '@/context/IncomeContext';
import { addDays, addWeeks, addMonths, addYears, isBefore, isSameDay, startOfDay } from 'date-fns';
import { showSuccess } from '@/utils/toast';

const RecurringManager: React.FC = () => {
  const { recurringTransactions, updateRecurringTransaction } = useRecurring();
  const { addExpense } = useExpenses();
  const { addIncome } = useIncome();
  const processingRef = useRef(false);

  useEffect(() => {
    if (processingRef.current) return;
    
    const processRecurring = () => {
      processingRef.current = true;
      const today = startOfDay(new Date());
      let processedCount = 0;

      recurringTransactions.forEach((t) => {
        if (!t.isActive) return;

        let currentLastProcessed = t.lastProcessedDate ? startOfDay(new Date(t.lastProcessedDate)) : null;
        let nextOccurrence = currentLastProcessed 
          ? getNextDate(currentLastProcessed, t.frequency)
          : startOfDay(new Date(t.startDate));

        let updatedTransaction = { ...t };
        let hasChanges = false;

        // Process all missed occurrences up to today
        while (
          (isBefore(nextOccurrence, today) || isSameDay(nextOccurrence, today)) &&
          (!t.endDate || isBefore(nextOccurrence, startOfDay(new Date(t.endDate))) || isSameDay(nextOccurrence, startOfDay(new Date(t.endDate))))
        ) {
          if (t.type === 'expense') {
            addExpense({
              amount: t.amount,
              category: t.categoryOrSource,
              date: nextOccurrence,
              description: `(Recurring) ${t.description || ''}`,
            });
          } else {
            addIncome({
              amount: t.amount,
              source: t.categoryOrSource,
              date: nextOccurrence,
              description: `(Recurring) ${t.description || ''}`,
            });
          }

          updatedTransaction.lastProcessedDate = nextOccurrence;
          nextOccurrence = getNextDate(nextOccurrence, t.frequency);
          processedCount++;
          hasChanges = true;
        }

        if (hasChanges) {
          updateRecurringTransaction(updatedTransaction);
        }
      });

      if (processedCount > 0) {
        showSuccess(`Automatically processed ${processedCount} recurring transaction(s).`);
      }
      processingRef.current = false;
    };

    processRecurring();
  }, [recurringTransactions, addExpense, addIncome, updateRecurringTransaction]);

  const getNextDate = (date: Date, frequency: Frequency): Date => {
    switch (frequency) {
      case 'daily': return addDays(date, 1);
      case 'weekly': return addWeeks(date, 1);
      case 'monthly': return addMonths(date, 1);
      case 'yearly': return addYears(date, 1);
      default: return date;
    }
  };

  return null;
};

export default RecurringManager;