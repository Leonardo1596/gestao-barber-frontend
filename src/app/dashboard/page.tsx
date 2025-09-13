'use client';

import React, { useState, useTransition } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2 } from 'lucide-react';
import { barbers, barbershops, reportData as initialReportData } from '@/lib/data';
import type { Report } from '@/lib/types';
import { generateReportInsights, GenerateReportInsightsInput } from '@/ai/flows/generate-report-insights';

const reportLabels: { [key in keyof Report]: string } = {
  receitas: 'Receitas',
  despesas: 'Despesas',
  receitaLiquida: 'Receita Líquida',
  margemDeLucro: 'Margem de Lucro',
  receitasDeAgendamento: 'Receitas de Agendamento',
  receitasDeProduto: 'Receitas de Produto',
  produtosVendidos: 'Produtos Vendidos',
  agendamentosConcluidos: 'Agendamentos Concluídos',
  servicosConcluidos: 'Serviços Concluídos',
  ticketMedioPorAgendamento: 'Ticket Médio por Agendamento',
  ticketMedioPorServico: 'Ticket Médio por Serviço',
};

const translatedReportData: Report = {
  receitas: initialReportData.revenues,
  despesas: initialReportData.expenses,
  receitaLiquida: initialReportData.netRevenue,
  margemDeLucro: initialReportData.profitMargin,
  receitasDeAgendamento: initialReportData.appointmentRevenues,
  receitasDeProduto: initialReportData.productRevenues,
  produtosVendidos: initialReportData.productsSold,
  agendamentosConcluidos: initialReportData.completedAppointments,
  servicosConcluidos: initialReportData.completedServices,
  ticketMedioPorAgendamento: initialReportData.averageTicketAppointment,
  ticketMedioPorServico: initialReportData.averageTicketService,
};

function formatValue(key: keyof Report, value: number) {
  if (key === 'margemDeLucro') {
    return `${(value * 100).toFixed(2)}%`;
  }
  if (['receitas', 'despesas', 'receitaLiquida', 'receitasDeAgendamento', 'receitasDeProduto', 'ticketMedioPorAgendamento', 'ticketMedioPorServico'].includes(key)) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
  return value;
}

export default function ReportsPage() {
  const [isPending, startTransition] = useTransition();
  const [insights, setInsights] = useState<string | null>(null);

  const handleGenerateInsights = () => {
    startTransition(async () => {
      const input: GenerateReportInsightsInput = {
        reportData: initialReportData,
        barbershopName: 'Gestão Barber',
      };
      const result = await generateReportInsights(input);
      setInsights(result.insights);
    });
  };

  return (
    <div>
      <PageHeader title="Relatórios">
        <div className="flex items-center gap-2">
          <Select defaultValue="shop-1">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Barbearia" />
            </SelectTrigger>
            <SelectContent>
              {barbershops.map(shop => <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por barbeiro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os barbeiros</SelectItem>
              {barbers.map(barber => <SelectItem key={barber.id} value={barber.id}>{barber.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(translatedReportData) as Array<keyof Report>).map((key) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{reportLabels[key]}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatValue(key, translatedReportData[key])}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div>
            <Button onClick={handleGenerateInsights} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Gerar Insights com IA
                </>
              )}
            </Button>

            {insights && (
                 <Alert className="mt-4">
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle className="font-headline">Insights e Recomendações</AlertTitle>
                    <AlertDescription className="mt-2 whitespace-pre-wrap">
                        {insights}
                    </AlertDescription>
                </Alert>
            )}
        </div>
      </div>
    </div>
  );
}
