import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { products } from '@/lib/data';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';

export default function ProductsPage() {
  return (
    <div>
      <PageHeader title="Produtos">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </PageHeader>
      <DataTable 
        columns={columns} 
        data={products}
        filterColumn="name"
        filterPlaceholder="Filtrar por nome..."
      />
    </div>
  );
}
