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
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  price: z.coerce.number().min(0.01, 'Preço deve ser positivo.'),
  duration: z.coerce.number().int().min(1, 'Duração é obrigatória.'),
});

type FormValues = z.infer<typeof formSchema>;

type ServiceFormProps = {
  onSuccess: () => void;
}

export function ServiceForm({ onSuccess }: ServiceFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(data: FormValues) {
    try {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      if (!user || !user.barbershop) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Usuário ou barbearia não encontrado.',
        });
        return;
      }

      const payload = {
        ...data,
        barbershopId: user.barbershop,
      };

      await api.post('/create-service', payload);

      toast({
        title: 'Serviço Criado',
        description: 'O novo serviço foi adicionado com sucesso.',
      });
      form.reset({name: '', price: 0, duration: 0});
      onSuccess();
    } catch (error) {
      console.error('Failed to create service:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Criar Serviço',
        description: 'Não foi possível criar o serviço. Tente novamente.',
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
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Corte Masculino" {...field} />
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
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duração (minutos)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Criar Serviço'}
        </Button>
      </form>
    </Form>
  );
}
