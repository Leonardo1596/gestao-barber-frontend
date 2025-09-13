'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';
import api from '@/services/api';
import type { Barber, Barbershop } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BarberForm } from './_components/barber-form';
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

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const { toast } = useToast();

  async function fetchData() {
    try {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      if (user && user.barbershop) {
        const [barbersResponse] = await Promise.all([
          api.get(`barbers/barbershop/${user.barbershop}`)
        ]);
        setBarbers(barbersResponse.data);
      } else if (user) {
        const [barbersResponse, barbershopsResponse] = await Promise.all([
          api.get('/barbers'),
          api.get('/barbershops')
        ]);
        setBarbers(barbersResponse.data);
        setBarbershops(barbershopsResponse.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleFormSuccess = () => {
    fetchData();
    setIsDialogOpen(false);
  }

  const openDeleteConfirm = (barber: Barber) => {
    setSelectedBarber(barber);
    setIsConfirmOpen(true);
  };

  const handleDeleteBarber = async () => {
    if (!selectedBarber) return;

    try {
      // Assuming the barber object has an _id property
      await api.delete(`/delete-barber/${selectedBarber.id}`);
      toast({
        title: 'Barbeiro Excluído',
        description: 'O barbeiro foi excluído com sucesso.',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to delete barber:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Excluir',
        description: 'Não foi possível excluir o barbeiro. Tente novamente.',
      });
    } finally {
      setIsConfirmOpen(false);
      setSelectedBarber(null);
    }
  };

  const columns = getColumns(barbershops, openDeleteConfirm);

  return (
    <div>
      <PageHeader title="Barbeiros">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Barbeiro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Barbeiro</DialogTitle>
              <DialogDescription>
                Preencha os detalhes abaixo para adicionar um novo barbeiro.
              </DialogDescription>
            </DialogHeader>
            <BarberForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      <DataTable 
        columns={columns} 
        data={barbers}
        filterColumn="name"
        filterPlaceholder="Filtrar por nome..."
      />

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o barbeiro
              e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBarber}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
