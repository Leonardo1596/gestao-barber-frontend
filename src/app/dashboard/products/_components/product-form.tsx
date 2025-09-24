'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(1, 'Nome do produto é obrigatório.'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Preço deve ser maior que 0.',
  }),
  quantity: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Quantidade deve ser maior que 0.',
    }),
  description: z.string().min(1, 'Descrição é obrigatória.'),
});

type FormValues = z.infer<typeof formSchema>;

type ProductFormProps = {
  onSuccess: () => void;
};

export function ProductForm({ onSuccess }: ProductFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      price: '',
      quantity: '',
      description: '',
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: FormValues) {
    try {
      const user = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user')!)
        : null;

      if (!user?.barbershop) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Usuário ou barbearia não encontrado.',
        });
        return;
      }

      const payload: Partial<Product> = {
        name: data.name,
        price: Number(data.price),
        quantity: Number(data.quantity),
        description: data.description,
        barbershop: user.barbershop,
      };

      await api.post('/create-product', payload);

      toast({
        title: 'Produto Criado',
        description: 'O novo produto foi adicionado com sucesso.',
      });

      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Criar Produto',
        description: 'Não foi possível criar o produto. Tente novamente.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Produto</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço (R$)</FormLabel>
              <FormControl>
                <Input placeholder="0.00" type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantidade</FormLabel>
              <FormControl>
                <Input placeholder="0" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input placeholder="Digite uma descrição do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Adicionar Produto'}
        </Button>
      </form>
    </Form>
  );
}
