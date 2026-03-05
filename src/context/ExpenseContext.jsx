import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ExpenseContext = createContext();

export const useExpenses = () => useContext(ExpenseContext);

const LOCAL_STORAGE_KEY = 'expense_tracker_transactions';

export const ExpenseProvider = ({ children }) => {
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction) => {
    setTransactions(prev => [{ id: uuidv4(), ...transaction }, ...prev]);
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // 1. Total Income
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // 2. Total Cash Outflow (Money that actually left my wallet)
  const totalAmountSpent = transactions
    .filter(t => t.type === 'expense' && (!t.split?.shared || t.split.whoPaid === 'me'))
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // 3. Current Wallet Balance (Physical Cash)
  const amountIHave = totalIncome - totalAmountSpent;

  // 4. Receivables and Payables (Accounting Logic)
  let totalOweMe = 0; // Total friends owe me
  let totalIOwe = 0;  // Total I owe friends

  const friendBalances = transactions
    .filter(t => t.type === 'expense' && t.split?.shared)
    .reduce((acc, curr) => {
      const { whoPaid, people, friendName } = curr.split;
      const amount = Number(curr.amount);
      const splitPortion = amount / people;
      const friend = friendName || 'Friend';

      if (!acc[friend]) acc[friend] = { oweMe: 0, iOwe: 0 };

      if (whoPaid === 'me') {
        // I paid the full bill.
        // For the 'Shared' page balance (per named friend), we only track their specific share.
        acc[friend].oweMe += splitPortion;
        // BUT for my global Wealth accounting, ALL other shares are owed back to me (people - 1)
        totalOweMe += splitPortion * (people - 1);
      } else {
        // Friend paid the full bill.
        // I owe my individual split portion back.
        acc[friend].iOwe += splitPortion;
        totalIOwe += splitPortion;
      }
      return acc;
    }, {});

  // 5. Final Net Wealth (Settled balance including all debts/credits)
  const finalSettledBalance = amountIHave + totalOweMe - totalIOwe;

  return (
    <ExpenseContext.Provider value={{
      transactions,
      addTransaction,
      deleteTransaction,
      totalIncome,
      totalAmountSpent,
      amountIHave,
      totalOweMe,
      totalIOwe,
      finalSettledBalance,
      sharedBalances: friendBalances
    }}>
      {children}
    </ExpenseContext.Provider>
  );
};
