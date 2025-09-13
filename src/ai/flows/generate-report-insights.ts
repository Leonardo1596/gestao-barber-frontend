'use server';

/**
 * @fileOverview AI-powered report insights generator for barbershop performance.
 *
 * - generateReportInsights - A function that takes report data and generates insights.
 * - GenerateReportInsightsInput - The input type for the generateReportInsights function.
 * - GenerateReportInsightsOutput - The return type for the generateReportInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportInsightsInputSchema = z.object({
  reportData: z.object({
    revenues: z.number(),
    expenses: z.number(),
    netRevenue: z.number(),
    profitMargin: z.number(),
    appointmentRevenues: z.number(),
    productRevenues: z.number(),
    productsSold: z.number(),
    completedAppointments: z.number(),
    completedServices: z.number(),
    averageTicketAppointment: z.number(),
    averageTicketService: z.number(),
  }).describe('Report data containing key performance metrics.'),
  barbershopName: z.string().describe('The name of the barbershop.'),
  barberName: z.string().optional().describe('The name of the barber if the report is filtered by barber.'),
});
export type GenerateReportInsightsInput = z.infer<typeof GenerateReportInsightsInputSchema>;

const GenerateReportInsightsOutputSchema = z.object({
  insights: z.string().describe('AI-generated insights and summary of the report data.'),
});
export type GenerateReportInsightsOutput = z.infer<typeof GenerateReportInsightsOutputSchema>;

export async function generateReportInsights(input: GenerateReportInsightsInput): Promise<GenerateReportInsightsOutput> {
  return generateReportInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportInsightsPrompt',
  input: {schema: GenerateReportInsightsInputSchema},
  output: {schema: GenerateReportInsightsOutputSchema},
  prompt: `You are an AI assistant that analyzes barbershop performance reports and provides actionable insights and summaries.

  Analyze the following report data for {{barbershopName}}{{#if barberName}} filtered by barber {{barberName}}{{/if}}:

  Revenues: {{reportData.revenues}}
  Expenses: {{reportData.expenses}}
  Net Revenue: {{reportData.netRevenue}}
  Profit Margin: {{reportData.profitMargin}}
  Appointment Revenues: {{reportData.appointmentRevenues}}
  Product Revenues: {{reportData.productRevenues}}
  Products Sold: {{reportData.productsSold}}
  Completed Appointments: {{reportData.completedAppointments}}
  Completed Services: {{reportData.completedServices}}
  Average Ticket Appointment: {{reportData.averageTicketAppointment}}
  Average Ticket Service: {{reportData.averageTicketService}}

  Provide a concise summary of the report, highlighting key trends, strengths, and areas for improvement. Suggest data driven recommendations to increase revenue, optimize expenses, and improve overall profitability. Focus on actionable insights that the admin or manager can implement.
  `,
});

const generateReportInsightsFlow = ai.defineFlow(
  {
    name: 'generateReportInsightsFlow',
    inputSchema: GenerateReportInsightsInputSchema,
    outputSchema: GenerateReportInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
