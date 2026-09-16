import { FunctionDeclaration, Type } from "@google/genai";

const transactionProperties = {
  id: {
    type: Type.STRING,
    description: "The unique identifier of the Transaction",
  },
  amount: {
    type: Type.NUMBER,
    description: "The amounth of the transaction",
  },
  type: {
    type: Type.STRING,
    enum: ["income", "expense"],
    description: "The type the transaction, either  'income' or 'expense'",
  },
  category: {
    type: Type.STRING,
    enum: ["Food & Drink", "Transport", "Reword", "Salary", "Invest", "Others"],
    description: "The Category of the transaction",
  },
  description: {
    type: Type.STRING,
    description:
      "A brief description of the transaction, first letter capitalized",
  },
  date: {
    type: Type.STRING,
    description: 'The date of the transaction in the format "YYYY-MM-DD"',
  },
};

export const getTransactionDeclaration: FunctionDeclaration = {
  name: "get_transaction",
  description: "Get all transaction from the user's financial history",
  parameters: {
    type: Type.OBJECT,
    properties: transactionProperties,
  },
};

export const createTransactionDeclaration: FunctionDeclaration = {
  name: "create_transaction",
  description:
    "Create a new transaction in the user's financial history based on the provided details.",
  parameters: {
    type: Type.OBJECT,
    properties: transactionProperties,
    required: ["amount", "description", "type", "category", "date"],
  },
};

export const deleteTransactionDeclaration: FunctionDeclaration = {
  name: "delete_transaction",
  description:
    "Delete an existing transaction from user's financial history based on the provided data.",
  parameters: {
    type: Type.OBJECT,
    properties: transactionProperties,
  },
};

export const updateTransactionDeclaration: FunctionDeclaration = {
  name: "update_transaction",
  description:
    "update an existing transaction from user's financial history based on the provided data.",
  parameters: {
    type: Type.OBJECT,
    properties: transactionProperties,
  },
};
