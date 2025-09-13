// categorize-transaction-type.ts
'use server';

/**
 * @fileOverview This flow uses AI to categorize transactions as either revenue or expense
 * and extracts relevant details such as product sold or service provided.
 *
 * - categorizeTransaction - An async function that takes a transaction description as input and returns
 *   a categorized transaction object with details.
 * - CategorizeTransactionInput - The input type for the categorizeTransaction function.
 * - CategorizeTransactionOutput - The return type for the categorizeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTransactionInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('A description of the transaction, including details such as amount, date, and items/services involved.'),
});

export type CategorizeTransactionInput = z.infer<typeof CategorizeTransactionInputSchema>;

const CategorizeTransactionOutputSchema = z.object({
  category: z.enum(['revenue', 'expense']).describe('The category of the transaction (revenue or expense).'),
  details: z
    .object({
      productSold: z.string().optional().describe('The name of the product sold, if applicable.'),
      serviceProvided: z.string().optional().describe('The name of the service provided, if applicable.'),
      amount: z.number().describe('The transaction amount.'),
      date: z.string().describe('The transaction date (YYYY-MM-DD).'),
    })
    .describe('Details about the transaction, including product sold or service provided, amount, and date.'),
});

export type CategorizeTransactionOutput = z.infer<typeof CategorizeTransactionOutputSchema>;

export async function categorizeTransaction(input: CategorizeTransactionInput): Promise<CategorizeTransactionOutput> {
  return categorizeTransactionFlow(input);
}

const categorizeTransactionPrompt = ai.definePrompt({
  name: 'categorizeTransactionPrompt',
  input: {schema: CategorizeTransactionInputSchema},
  output: {schema: CategorizeTransactionOutputSchema},
  prompt: `You are an AI assistant that categorizes financial transactions as either "revenue" or "expense" and extracts relevant details.

  Analyze the following transaction description and provide the category and details in JSON format.

  Transaction Description: {{{transactionDescription}}}

  Ensure that the "date" is in YYYY-MM-DD format.
  If there's no product sold or service provided, omit these fields.
  Do not add any other properties to the json. Adhere to schema.`,
});

const categorizeTransactionFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionFlow',
    inputSchema: CategorizeTransactionInputSchema,
    outputSchema: CategorizeTransactionOutputSchema,
  },
  async input => {
    const {output} = await categorizeTransactionPrompt(input);
    return output!;
  }
);
