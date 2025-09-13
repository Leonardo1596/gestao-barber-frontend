import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { barbers } from '@/lib/data';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';

export default function BarbersPage() {
  return (
    <div>
      <PageHeader title="Barbeiros">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Barbeiro
        </Button>
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
