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

  const [barberList, setBarberList] = useState<any[]>([]);
  const [report, setReport] = useState<Record<string, number> | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null); // agora vem do useEffect

  // Pega usuário do localStorage apenas no cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch barbers
  useEffect(() => {
    if (!user) return;

    async function fetchBarbers() {
      try {
        const response = await api.get(`barbers/barbershop/${user.barbershop}`);
        setBarberList(response.data || []);
      } catch (err) {
        console.error('Erro ao buscar barbeiros:', err);
      }
    }
    fetchBarbers();
  }, [user]);

  // Fetch report
  const fetchReport = async () => {
    if (!user) return;

    try {
      const url = selectedBarber
        ? `/report-by-barber-and-period/barbershop/${user.barbershop}/${selectedBarber}/2025-09-10/2025-09-14`
        : `/report-by-period/barbershop/${user.barbershop}/2025-09-08/2025-09-14`;

      const response = await api.get(url);
      setReport(response.data || {});
    } catch (err) {
      console.error('Erro ao buscar report:', err);
      setReport({});
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedBarber, user]); // adiciona user como dependência

  const handleGenerateInsights = () => {
    startTransition(async () => {
      if (!report) return;

      const normalizedReport = {
        revenues: report.revenues ?? 0,
        expenses: report.expenses ?? 0,
        netRevenue: report.netRevenue ?? 0,
        profitMargin: report.profitMargin ?? 0,
        appointmentRevenues: report.appointmentRevenues ?? 0,
        productRevenues: report.productRevenues ?? 0,
        productsSold: report.productsSold ?? 0,
        completedAppointments: report.completedAppointments ?? 0,
        completedServices: report.completedServices ?? 0,
        averageTicketAppointment: report.averageTicketAppointment ?? 0,
        averageTicketService: report.averageTicketService ?? 0,
      };

      const input: GenerateReportInsightsInput = {
        reportData: normalizedReport,
        barbershopName: 'Gestão Barber',
      };

      try {
        const result = await generateReportInsights(input);
        setInsights(result.insights);
      } catch (err) {
        console.error('Erro ao gerar insights:', err);
        setInsights('Não foi possível gerar insights no momento.');
      }
    });
  };

  if (!user) return <div>Carregando...</div>; // espera pegar o user

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
        {report && Object.keys(reportLabels).length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.keys(reportLabels).map((key) => (
              <Card key={key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{reportLabels[key]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatValue(key, report[key] ?? 0)}</div>
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
