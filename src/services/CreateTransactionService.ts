import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

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
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (value > total)
        throw new AppError('You dont have enough cash, stranger!');
    }

    let categoryTransaction = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryTransaction) {
      categoryTransaction = categoryRepository.create({ title: category });
      await categoryRepository.save(categoryTransaction);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: categoryTransaction,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
