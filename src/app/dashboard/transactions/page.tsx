import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { transactions } from '@/lib/data';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SmartTransactionForm } from './_components/smart-transaction-form';

export default function TransactionsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <PageHeader title="Transações">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Transação Manual
          </Button>
        </PageHeader>
        <DataTable 
          columns={columns} 
          data={transactions}
          filterColumn="description"
          filterPlaceholder="Filtrar por descrição..."
        />
      </div>
    </div>
  );
}
