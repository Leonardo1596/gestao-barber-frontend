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

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  async function fetchData() {
    try {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      if (user && user.barbershop) {
        const [barbersResponse, barbershopsResponse] = await Promise.all([
          api.get(`/barbers/barbershop/${user.barbershop}`),
          api.get('/barbershops')
        ]);
        setBarbers(barbersResponse.data);
        setBarbershops(barbershopsResponse.data);
      } else if (user) {
        // admin case
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

  const columns = getColumns(barbershops);

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
