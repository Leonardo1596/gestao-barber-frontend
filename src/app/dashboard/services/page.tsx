'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';
import api from '@/services/api';
import type { Service } from '@/lib/types';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
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
    fetchServices();
  }, []);

  return (
    <div>
      <PageHeader title="Serviços">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
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
