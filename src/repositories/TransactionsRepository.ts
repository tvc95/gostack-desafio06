import { EntityRepository, Repository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(transactionsList: Transaction[]): Promise<Balance> {
    const incomeReducer = (
      acc: number,
      currentValue: Transaction,
      index: number,
      array: Transaction[],
    ) => {
      if (array[index].type === 'income') {
        return acc + Number(currentValue.value);
      }
      return acc;
    };

    const outcomeReducer = (
      acc: number,
      currentValue: Transaction,
      index: number,
      array: Transaction[],
    ) => {
      if (array[index].type === 'outcome') {
        return acc + Number(currentValue.value);
      }
      return acc;
    };

    const totalIncome = transactionsList.reduce(incomeReducer, 0);
    const totalOutcome = transactionsList.reduce(outcomeReducer, 0);

    const balance = {
      income: totalIncome,
      outcome: totalOutcome,
      total: totalIncome - totalOutcome,
    };

    return balance;
  }
}

export default TransactionsRepository;
