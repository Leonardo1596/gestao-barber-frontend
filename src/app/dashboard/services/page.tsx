'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';
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
import { fetchServices, deleteService } from '@/lib/fetcher';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchServices().then((data) => setServices(data));
  }, []);

  const handleFormSuccess = () => {
    fetchServices().then((data) => setServices(data));
    setSelectedService(null);
    setIsDialogOpen(false);
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  const openDeleteConfirm = (service: Service) => {
    setSelectedService(service);
    setIsConfirmOpen(true);
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;

    try {
      const success = await deleteService(selectedService);
      if (success) {
        toast({ title: 'Serviço excluído com sucesso.' });
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro ao excluir serviço.',
        });
      }

      fetchServices().then((data) => setServices(data));
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir serviço.',
        description: 'Não foi possível excluir o serviço. Tente novamente.',
      });
    } finally {
      setIsConfirmOpen(false);
      setSelectedService(null);
    }
  };

  const columns = getColumns(openDeleteConfirm, handleEditService);

  return (
    <div>
      <PageHeader title="Serviços">
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setSelectedService(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedService(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedService ? 'Editar Serviço' : 'Novo Serviço'}
              </DialogTitle>
              <DialogDescription>
                Preencha os detalhes abaixo para{' '}
                {selectedService ? 'editar o serviço selecionado' : 'adicionar um novo serviço'}.
              </DialogDescription>
            </DialogHeader>

            <ServiceForm
              key={selectedService?._id || 'new-service-form'}
              onSuccess={handleFormSuccess}
              service={selectedService}
            />
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
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o serviço.
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
