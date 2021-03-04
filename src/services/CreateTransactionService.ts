import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const transactionsList = await transactionsRepository.find();
    const { total } = await transactionsRepository.getBalance(transactionsList);

    if (type === 'outcome' && value > total) {
      throw new AppError(
        'Transação inválida: valor da transação maior que o saldo do usuário!',
        400,
      );
    }

    let foundCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!foundCategory) {
      foundCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(foundCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: foundCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
