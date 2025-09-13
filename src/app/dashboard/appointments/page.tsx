'use client';

import { useState, useEffect } from 'react';
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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { toast } = useToast();

  async function fetchData() {
    try {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      if (user && user.barbershop) {
        const [appointmentsResponse, barbersResponse, servicesResponse] = await Promise.all([
          api.get(`/appointments/barbershop/${user.barbershop}`),
          api.get(`/barbers/barbershop/${user.barbershop}`),
          api.get(`/services/barbershop/${user.barbershop}`),
        ]);
        setAppointments(appointmentsResponse.data);
        setBarbers(barbersResponse.data);
        setServices(servicesResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar dados',
        description: 'Não foi possível carregar os dados. Tente novamente.',
      });
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSuccess = () => {
    fetchData();
    setIsDialogOpen(false);
  };

  const openDeleteConfirm = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsConfirmOpen(true);
  };

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await api.delete(`/delete-appointment/${selectedAppointment._id}`);
      toast({
        title: 'Agendamento Excluído',
        description: 'O agendamento foi excluído com sucesso.',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Excluir',
        description: 'Não foi possível excluir o agendamento. Tente novamente.',
      });
    } finally {
      setIsConfirmOpen(false);
      setSelectedAppointment(null);
    }
  };

  const handleCompleteAppointment = async (appointment: Appointment) => {
    try {
      await api.put(`/update-appointment/${appointment._id}`, { status: 'concluido' });
      toast({
        title: 'Agendamento Concluído',
        description: 'O agendamento foi marcado como concluído e a transação foi criada.',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to complete appointment:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Concluir',
        description: 'Não foi possível concluir o agendamento. Tente novamente.',
      });
    }
  };

  const columns = getColumns(barbers, services, openDeleteConfirm, handleCompleteAppointment);

  return (
    <div>
      <PageHeader title="Agendamentos">
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

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
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
    </div>
  );
}
