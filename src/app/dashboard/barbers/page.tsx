'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';
import api from '@/services/api';
import type { Barber } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BarberForm } from './_components/barber-form';

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function fetchBarbers() {
    try {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      if (user && user.barbershop) {
        const response = await api.get(`/barbers/barbershop/${user.barbershop}`);
        setBarbers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch barbers:', error);
    }
  }

  useEffect(() => {
    fetchBarbers();
  }, []);
  
  const handleFormSuccess = () => {
    fetchBarbers();
    setIsDialogOpen(false);
  }

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
    </div>
  );
}
