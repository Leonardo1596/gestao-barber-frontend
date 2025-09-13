import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { appointments } from '@/lib/data';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';

export default function AppointmentsPage() {
  return (
    <div>
      <PageHeader title="Agendamentos">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </PageHeader>
      <DataTable 
        columns={columns} 
        data={appointments}
        filterColumn="customerName"
        filterPlaceholder="Filtrar por cliente..."
      />
    </div>
  );
}
