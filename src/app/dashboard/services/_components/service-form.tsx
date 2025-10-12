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
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { createService, updateService } from '@/lib/fetcher';
import type { Service } from '@/lib/types';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório.'),
  price: z.coerce.number().min(0.01, 'Preço deve ser positivo.'),
  duration: z.coerce.number().int().min(1, 'Duração é obrigatória.'),
});

type FormValues = z.infer<typeof formSchema>;

type ServiceFormProps = {
  onSuccess: () => void;
  service?: Service;
};

export function ServiceForm({ onSuccess, service }: ServiceFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: service?.name || '',
      price: service?.price || 0,
      duration: service?.duration || 0,
    },
  });

  const { isSubmitting } = form.formState;
  const { reset } = form;

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        price: service.price,
        duration: service.duration,
      });
    } else {
      reset({
        name: '',
        price: 0,
        duration: 0,
      });
    }
  }, [service, reset]);

  async function onSubmit(data: FormValues) {
    try {
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      if (!user?.barbershop) {
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

      if (service) {
        console.log('caiu aqui');
        // Edit
        const success = await updateService(service, payload);
        if (success) {
          toast({ title: 'Serviço Atualizado', description: 'O serviço foi atualizado com sucesso.' });
        } else {
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o serviço.' });
        }
      } else {
        // Create
        const success = await createService(payload);
        if (success) {
          toast({ title: 'Serviço Criado', description: 'O novo serviço foi adicionado com sucesso.' });
        } else {
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível criar o serviço.' });
        }
      }

      reset({ name: '', price: 0, duration: 0 });
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar o serviço. Tente novamente.',
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
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : service ? 'Atualizar Serviço' : 'Criar Serviço'}
        </Button>
      </form>
    </Form>
  );
}
