import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { services } from '@/lib/data';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';

export default function ServicesPage() {
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
