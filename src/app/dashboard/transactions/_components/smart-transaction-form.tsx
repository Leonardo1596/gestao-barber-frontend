'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  categorizeTransaction,
  CategorizeTransactionOutput,
} from '@/ai/flows/categorize-transaction-type';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Wand2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { barbers, barbershops, products, users } from '@/lib/data';

const formSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória.'),
  aiDescription: z.string().optional(),
  type: z.enum(['revenue', 'expense'], { required_error: 'Tipo é obrigatório.' }),
  amount: z.coerce.number().min(0.01, 'Valor deve ser positivo.'),
  date: z.date({ required_error: 'Data é obrigatória.' }),
  barbershopId: z.string().min(1, 'Barbearia é obrigatória.'),
  userId: z.string().min(1, 'Usuário é obrigatório.'),
  status: z.enum(['Pendente', 'Completo', 'Falhou'], { required_error: 'Status é obrigatório.' }),
  revenueType: z.enum(['product_sale', 'appointment', 'other']).optional(),
  productId: z.string().optional(),
  quantity: z.coerce.number().optional(),
  barberId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function SmartTransactionForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'Completo',
      barbershopId: 'shop-1',
      userId: 'user-2'
    },
  });
  
  const transactionType = form.watch('type');
  const revenueType = form.watch('revenueType');

  function onSubmit(data: FormValues) {
    console.log(data);
    toast({
        title: 'Transação Criada',
        description: 'A nova transação foi adicionada com sucesso.'
    });
    form.reset();
  }

  const handleCategorize = () => {
    const aiDescription = form.getValues('aiDescription');
    if (!aiDescription) {
        form.setError('aiDescription', { message: 'Por favor, descreva a transação.'})
        return;
    };

    startTransition(async () => {
        try {
            const result: CategorizeTransactionOutput = await categorizeTransaction({ transactionDescription: aiDescription });
            
            form.setValue('type', result.category);
            form.setValue('amount', result.details.amount);
            form.setValue('date', new Date(result.details.date));
            if(result.details.serviceProvided) {
                form.setValue('description', `Serviço: ${result.details.serviceProvided}`);
                form.setValue('revenueType', 'appointment');
            }
            if(result.details.productSold) {
                form.setValue('description', `Venda: ${result.details.productSold}`);
                form.setValue('revenueType', 'product_sale');
            }

            toast({
                title: 'Transação Categorizada!',
                description: 'Os detalhes foram preenchidos pela IA.'
            })

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Erro da IA',
                description: 'Não foi possível categorizar a transação.'
            })
        }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="aiDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Inteligente</FormLabel>
              <FormControl>
                <Textarea placeholder="Ex: Venda de 2 pomadas para o barbeiro Miguel por R$70 em 28/07/2024" {...field} />
              </FormControl>
              <FormMessage />
              <Button type="button" size="sm" onClick={handleCategorize} disabled={isPending} className="w-full">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Wand2 className="mr-2 h-4 w-4"/>}
                 Categorizar com IA
              </Button>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Transação</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="revenue">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {transactionType === 'revenue' && (
            <FormField
            control={form.control}
            name="revenueType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Entrada</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de entrada" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="appointment">Agendamento</SelectItem>
                    <SelectItem value="product_sale">Venda de Produto</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Descrição</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField control={form.control} name="amount" render={({ field }) => (
          <FormItem><FormLabel>Valor (R$)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>

        {revenueType === 'product_sale' && (
            <>
                <FormField control={form.control} name="productId" render={({ field }) => (
                    <FormItem><FormLabel>Produto</FormLabel>
                    <Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem><FormLabel>Quantidade</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="barberId" render={({ field }) => (
                    <FormItem><FormLabel>Barbeiro</FormLabel>
                    <Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                    <SelectContent>{barbers.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                    </Select><FormMessage /></FormItem>
                )}/>
            </>
        )}

        <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem className="flex flex-col"><FormLabel>Data</FormLabel>
                <Popover><PopoverTrigger asChild>
                    <FormControl>
                        <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                        {field.value ? format(field.value, 'PPP', { locale: ptBR }) : <span>Escolha uma data</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                </PopoverContent>
                </Popover><FormMessage />
            </FormItem>
        )}/>
        <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
            <SelectContent><SelectItem value="Completo">Completo</SelectItem><SelectItem value="Pendente">Pendente</SelectItem><SelectItem value="Falhou">Falhou</SelectItem></SelectContent>
            </Select><FormMessage /></FormItem>
        )}/>

        <Button type="submit" className="w-full">Criar Transação</Button>
      </form>
    </Form>
  );
}
