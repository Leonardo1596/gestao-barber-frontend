'use client';

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';
import type { Product } from '@/lib/types';
import api from '@/services/api';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ProductForm } from './_components/product-from';
import { SaleForm } from './_components/sellProductDialog'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const { toast } = useToast();

  async function fetchProducts() {
    try {
      const user = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!)
        : null;
      const response = await api.get(`/products/barbershop/${user.barbershop}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  function handleDeleteProduct(product: Product) {
    setSelectedProduct(product);
    setIsConfirmOpen(true);
  }

  function handleSellProduct(product: Product) {
    setSelectedProduct(product);
    setIsSaleModalOpen(true);
  }

  async function confirmDelete() {
    if (!selectedProduct) return;

    try {
      await api.delete(`/delete-product/${selectedProduct._id}`);
      toast({ title: 'Produto excluído com sucesso.' });
      setProducts(products.filter((p) => p._id !== selectedProduct._id));
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({ title: 'Erro ao excluir produto.', variant: 'destructive' });
    } finally {
      setIsConfirmOpen(false);
      setSelectedProduct(null);
    }
  }

  const handleFormSuccess = () => {
    fetchProducts();
    setIsDialogOpen(false);
  };

  return (
    <div>
      <PageHeader title="Produtos">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para adicionar um novo produto.
              </DialogDescription>
            </DialogHeader>
            <ProductForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <DataTable
        columns={getColumns(handleDeleteProduct, handleSellProduct)}
        data={products}
        filterColumn="name"
        filterPlaceholder="Filtrar por nome..."
      />

      <Dialog open={isSaleModalOpen} onOpenChange={setIsSaleModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Efetuar Venda</DialogTitle>
            <DialogDescription>
              Preencha os dados para registrar a venda.
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <SaleForm
              product={selectedProduct}
              onSuccess={() => setIsSaleModalOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso excluirá permanentemente o produto e seus
              dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
