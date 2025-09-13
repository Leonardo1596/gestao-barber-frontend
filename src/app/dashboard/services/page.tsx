'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';
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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
  }

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
    </div>
  );
}
