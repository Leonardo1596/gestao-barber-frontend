'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import {
  getAppointmentColumns,
  getProductColumns,
  getExpenseColumns,
} from './columns';
import type { Appointment, Product, Expense, Barber } from '@/lib/types';
import { MonthSelector } from '../_components/MonthSelector';
import { fetchTransactions, fetchBarbers } from '@/lib/fetcher';
import { Button } from '@/components/ui/button';

export default function TransactionsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [transactionType, setTransactionType] = useState<
    'appointments' | 'products' | 'expenses'
  >('appointments');

  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  useEffect(() => {
    if (!dateRange) return;
    Promise.all([
      fetchTransactions(dateRange.start, dateRange.end),
      fetchBarbers(),
    ]).then(([transactionsData, barbersData]) => {
      if (transactionsData && Array.isArray(transactionsData)) {
        const appointmentsData = transactionsData.filter(
          (t: any) => t.appointment
        );
        const productsData = transactionsData.filter((t: any) => t.quantity);
        const expensesData = transactionsData.filter(
          (t: any) => t.type === 'saida'
        );

        setAppointments(appointmentsData);
        setProducts(productsData);
        setExpenses(expensesData);
      } else {
        setAppointments([]);
        setProducts([]);
        setExpenses([]);
      }
      setBarbers(barbersData || []);
    });
  }, [dateRange]);
  console.log(appointments);

  const handleMonthChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
  }, []);

  const { columns, data, filterColumn, filterPlaceholder } = useMemo(() => {
    switch (transactionType) {
      case 'appointments':
        return {
          columns: getAppointmentColumns(barbers),
          data: appointments,
          filterColumn: 'clientName',
          filterPlaceholder: 'Filtrar por cliente...',
        };
      case 'products':
        return {
          columns: getProductColumns(barbers),
          data: products,
          filterColumn: 'name',
          filterPlaceholder: 'Filtrar por produto...',
        };
      case 'expenses':
        return {
          columns: getExpenseColumns(),
          data: expenses,
          filterColumn: 'description',
          filterPlaceholder: 'Filtrar por descrição...',
        };
    }
  }, [transactionType, appointments, products, expenses, barbers]);

  return (
    <div>
      <PageHeader title="Transações">
        <div className="flex flex-col md:flex-row justify-end items-end md:items-center gap-4">
          <MonthSelector onRangeChange={handleMonthChange} />
        </div>
      </PageHeader>

      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => setTransactionType('appointments')}
          variant={transactionType === 'appointments' ? 'default' : 'outline'}
        >
          Agendamentos
        </Button>
        <Button
          onClick={() => setTransactionType('products')}
          variant={transactionType === 'products' ? 'default' : 'outline'}
        >
          Produtos
        </Button>
        <Button
          onClick={() => setTransactionType('expenses')}
          variant={transactionType === 'expenses' ? 'default' : 'outline'}
        >
          Despesas
        </Button>
      </div>

      <DataTable
        columns={columns as any}
        data={data}
        filterColumn={filterColumn}
        filterPlaceholder={filterPlaceholder}
      />
    </div>
  );
}
