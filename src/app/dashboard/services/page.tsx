'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';
import api from '@/services/api';
import type { Service } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ServiceForm } from './_components/service-form';
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { toast } = useToast();

  async function fetchServices() {
    try {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      if (user && user.barbershop) {
        const response = await api.get(`/services/barbershop/${user.barbershop}`);
        setServices(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  const handleFormSuccess = () => {
    fetchServices();
    setIsDialogOpen(false);
  };

  const openDeleteConfirm = (service: Service) => {
    setSelectedService(service);
    setIsConfirmOpen(true);
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      await api.delete(`/delete-service/${selectedService.id}`);
      toast({
        title: 'Serviço Excluído',
        description: 'O serviço foi excluído com sucesso.',
      });
      fetchServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Excluir',
        description: 'Não foi possível excluir o serviço. Tente novamente.',
      });
    } finally {
      setIsConfirmOpen(false);
      setSelectedService(null);
    }
  };
  
  const columns = getColumns(openDeleteConfirm);

  return (
    <div>
      <PageHeader title="Serviços">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Serviço</DialogTitle>
              <DialogDescription>
                Preencha os detalhes abaixo para adicionar um novo serviço.
              </DialogDescription>
            </DialogHeader>
            <ServiceForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable 
        columns={columns} 
        data={services}
        filterColumn="name"
        filterPlaceholder="Filtrar por nome..."
      />

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o serviço
              e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
