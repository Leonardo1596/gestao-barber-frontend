'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2 } from 'lucide-react';
import { generateReportInsights, GenerateReportInsightsInput } from '@/ai/flows/generate-report-insights';
import api from '../../services/api';

const reportLabels: Record<string, string> = {
  revenues: 'Receitas',
  expenses: 'Despesas',
  netRevenue: 'Receita Líquida',
  profitMargin: 'Margem de Lucro',
  appointmentRevenues: 'Receitas de Agendamento',
  productRevenues: 'Receitas de Produto',
  productsSold: 'Produtos Vendidos',
  completedAppointments: 'Agendamentos Concluídos',
  completedServices: 'Serviços Concluídos',
  averageTicketAppointment: 'Ticket Médio por Agendamento',
  averageTicketService: 'Ticket Médio por Serviço',
};

function formatValue(key: string, value: number) {
  if (key === 'profitMargin') return `${value.toFixed(2)}%`;
  if (
    [
      'revenues',
      'expenses',
      'netRevenue',
      'appointmentRevenues',
      'productRevenues',
      'averageTicketAppointment',
      'averageTicketService',
    ].includes(key)
  ) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }
  return value;
}

export default function ReportsPage() {
  const [isPending, startTransition] = useTransition();
  const [insights, setInsights] = useState<string | null>(null);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
  const [barberList, setBarberList] = useState<any[]>([]);
  const [report, setReport] = useState<Record<string, number> | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);

  // Fetch barbers
  useEffect(() => {
    async function fetchBarbers() {
      try {
        const response = await api.get(`barbers/barbershop/${user.barbershop}`);
        setBarberList(response.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchBarbers();
  }, []);

  // Fetch report
  async function fetchReport() {
    try {
      const url = selectedBarber
        ? `/report-by-barber-and-period/barbershop/${user.barbershop}/${selectedBarber}/2025-09-10/2025-09-14`
        : `/report-by-period/barbershop/${user.barbershop}/2025-09-08/2025-09-14`;

      const response = await api.get(url);
      setReport(response.data);
    } catch (err) {
      console.error('Erro ao buscar report:', err);
    }
  }

  // Re-fetch report sempre que o filtro mudar
  useEffect(() => {
    fetchReport();
  }, [selectedBarber]);

  const handleGenerateInsights = () => {
    startTransition(async () => {
      if (!report) return;

      const input: GenerateReportInsightsInput = {
        reportData: report,
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
          <Select
            onValueChange={(value) => setSelectedBarber(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por barbeiro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os barbeiros</SelectItem>
              {barberList.map((barber) => (
                <SelectItem key={barber._id} value={barber._id}>
                  {barber.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PageHeader>

      <div className="space-y-6">
        {report && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.keys(reportLabels).map((key) => (
              <Card key={key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{reportLabels[key]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatValue(key, report[key] || 0)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div>
          <Button onClick={handleGenerateInsights} disabled={isPending || !report}>
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
              <AlertDescription className="mt-2 whitespace-pre-wrap">{insights}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
