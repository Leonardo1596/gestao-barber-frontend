'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';
import api from '@/services/api';
import type { Appointment, Barber, Service } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AppointmentForm } from './_components/appointment-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { MonthSelector } from "../_components/MonthSelector";
import { fetchAppointments, fetchBarbers, fetchServices } from '@/lib/fetcher';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isCompleteConfirmOpen, setIsCompleteConfirmOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!dateRange) return;
    Promise.all([
      fetchAppointments(dateRange.start, dateRange.end),
      fetchBarbers(),
      fetchServices(),
    ]).then(([appointmentsData, barbersData, servicesData]) => {
      setAppointments(appointmentsData);
      setBarbers(barbersData);
      setServices(servicesData);
    });
  }, [dateRange]);

  const handleFormSuccess = () => {
    if (!dateRange) return;
    fetchAppointments(dateRange.start, dateRange.end).then((data) => {
      setAppointments(data);
    });
    setIsDialogOpen(false);
  };

  const openDeleteConfirm = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteConfirmOpen(true);
  };

  const openCompleteConfirm = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsCompleteConfirmOpen(true);
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await api.delete(`/delete-appointment/${selectedAppointment._id}`);
      toast({
        title: 'Agendamento Excluído',
        description: 'O agendamento foi excluído com sucesso.',
      });
      if (!dateRange) return;
      fetchAppointments(dateRange.start, dateRange.end).then((data) => {
        setAppointments(data);
      });
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Excluir',
        description: 'Não foi possível excluir o agendamento. Tente novamente.',
      });
    } finally {
      setIsDeleteConfirmOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleCompleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await api.put(`/update-appointment/${selectedAppointment._id}`, { status: 'concluido' });
      toast({
        title: 'Agendamento Concluído',
        description: 'O agendamento foi marcado como concluído e a transação foi criada.',
      });
      if (!dateRange) return;
      fetchAppointments(dateRange.start, dateRange.end).then((data) => {
        setAppointments(data);
      });
    } catch (error) {
      console.error('Failed to complete appointment:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Concluir',
        description: 'Não foi possível concluir o agendamento. Tente novamente.',
      });
    } finally {
      setIsCompleteConfirmOpen(false);
      setSelectedAppointment(null);
    }
  };

  const columns = getColumns(barbers, services, openDeleteConfirm, openCompleteConfirm);

  const handleMonthChange = useCallback((start: Date, end: Date) => {
    setDateRange({ start, end });
  }, []);

  return (
    <div>
      <PageHeader title="Agendamentos">
        <div className="flex flex-col md:flex-row justify-end items-end md:items-center gap-4">
          <MonthSelector onRangeChange={handleMonthChange} />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
              <DialogDescription>
                Preencha os detalhes abaixo para criar um novo agendamento.
              </DialogDescription>
            </DialogHeader>
            <AppointmentForm
              barbers={barbers}
              services={services}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable
        columns={columns}
        data={appointments}
        filterColumn="clientName"
        filterPlaceholder="Filtrar por cliente..."
      />

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o agendamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAppointment}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isCompleteConfirmOpen} onOpenChange={setIsCompleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Marcar como Concluído?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá marcar o agendamento como concluído e criar uma transação correspondente. Você confirma esta ação?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteAppointment}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
