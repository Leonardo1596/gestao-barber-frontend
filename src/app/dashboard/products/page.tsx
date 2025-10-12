'use client';

import { useEffect, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';
import type { Product } from '@/lib/types';
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
import { ProductForm } from './_components/product-form';
import { SaleForm } from './_components/sellProductDialog'
import { fetchProducts, deleteProduct } from '@/lib/fetcher';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch products
    fetchProducts().then((data) => {
      setProducts(data);
    });
  }, []);

  function handleEditProduct(product: Product) {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

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
    const success = await deleteProduct(selectedProduct);

    if (success) {
      toast({ title: "Produto excluído com sucesso." });
      fetchProducts().then((data) => {
        setProducts(data);
      });
    } else {
      toast({ title: "Erro ao excluir produto.", variant: "destructive" });
    }

    setIsConfirmOpen(false);
    setSelectedProduct(null);
  }

  const handleFormSuccess = () => {
    fetchProducts().then((data) => {
      setProducts(data);
    });
    setSelectedProduct(null); 
    setIsDialogOpen(false);
  };

  return (
    <div>
      <PageHeader title="Produtos">
        <Dialog 
          open={isDialogOpen} 
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
                setSelectedProduct(null); 
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedProduct(null)}> 
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para {selectedProduct ? 'editar o produto selecionado' : 'adicionar um novo produto'}.
              </DialogDescription>
            </DialogHeader>
            <ProductForm 
              key={selectedProduct?._id || 'new-product-form'} 
              onSuccess={handleFormSuccess} 
              product={selectedProduct} 
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <DataTable
        columns={getColumns(handleDeleteProduct, handleEditProduct, handleSellProduct)}
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
              onSuccess={() => {
                fetchProducts().then((data) => {
                  setProducts(data);
                });
                setIsSaleModalOpen(false)
              }}
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