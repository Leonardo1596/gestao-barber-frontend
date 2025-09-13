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
});

type FormValues = z.infer<typeof formSchema>;

type BarberFormProps = {
  onSuccess: () => void;
}

export function BarberForm({ onSuccess }: BarberFormProps) {
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
        barbershop: user.barbershop,
      };

      await api.post('/create-barber', payload);

      toast({
        title: 'Barbeiro Criado',
        description: 'O novo barbeiro foi adicionado com sucesso.',
      });
      form.reset({name: ''});
      onSuccess();
    } catch (error) {
      console.error('Failed to create barber:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Criar Barbeiro',
        description: 'Não foi possível criar o barbeiro. Tente novamente.',
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
                <Input placeholder="Nome do Barbeiro" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Criar Barbeiro'}
        </Button>
      </form>
    </Form>
  );
}
