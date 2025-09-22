"use client";

import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';
import type { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const { toast } = useToast();

  async function fetchProducts() {
    try {
      const user = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!)
        : null;

      if (!user?.barbershop) {
        console.error('Usuário inválido ou sem barbearia.');
        return;
      }

      const response = await api.get(`/products/barbershop/${user.barbershop}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: "Tente novamente mais tarde."
      });
    }
  }

  async function handleDeleteService() {
    console.log(selectedService);
    if (!selectedService) return;


    toast({
      title: "Serviço excluído",
      description: "O serviço foi removido com sucesso."
    });
    setIsConfirmOpen(false);
  }

  useEffect(() => {
    fetchProducts();
  }, []);

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

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o serviço
              e removerá seus dados de nossos servidores.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
