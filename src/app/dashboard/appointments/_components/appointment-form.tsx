'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Barber, Service } from '@/lib/types';

const formSchema = z.object({
  clientName: z.string().min(1, 'Nome do cliente é obrigatório.'),
  barberId: z.string().min(1, 'Barbeiro é obrigatório.'),
  serviceIds: z.array(z.string()).min(1, 'Selecione pelo menos um serviço.'),
  date: z.date({ required_error: 'Data é obrigatória.' }),
  hour: z.string().min(1, 'Hora é obrigatória.'),
  paymentMethod: z.enum(['dinheiro', 'cartao', 'pix'], { required_error: 'Método de pagamento é obrigatório.' }),
});

type FormValues = z.infer<typeof formSchema>;

type AppointmentFormProps = {
  barbers: Barber[];
  services: Service[];
  onSuccess: () => void;
};

export function AppointmentForm({ barbers, services, onSuccess }: AppointmentFormProps) {
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: '',
      barberId: '',
      serviceIds: [],
      hour: '',
      // paymentMethod intentionally left empty so user selects it
    },
  });

  const { control, setValue } = form;
  const { isSubmitting } = form.formState;

  // estados para horários
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // observa barbeiro e data
  const watchedBarberId = useWatch({ control, name: 'barberId' });
  const watchedDate = useWatch({ control, name: 'date' });

  // When barber or date changes, fetch available times
  useEffect(() => {
    // Clean previous selection of time always when barber/date change
    setValue('hour', '');

    // If dont have barber or date, clean list and return
    if (!watchedBarberId || !watchedDate) {
      setAvailableTimes([]);
      setLoadingTimes(false);
      return;
    }

    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    if (!user?.barbershop) {
      setAvailableTimes([]);
      return;
    }

    let cancelled = false;
    async function fetchAvailableTimes() {
      setLoadingTimes(true);
      setAvailableTimes([]);
      try {
        const formattedDate = format(watchedDate, 'yyyy-MM-dd');
        const res = await api.get(`/available-times/${formattedDate}/${watchedBarberId}/${user.barbershop}`);
        if (!cancelled) {
          setAvailableTimes(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err);
        if (!cancelled) {
          setAvailableTimes([]);
          toast({
            variant: 'destructive',
            title: 'Erro',
            description: 'Não foi possível carregar os horários disponíveis.',
          });
        }
      } finally {
        if (!cancelled) setLoadingTimes(false);
      }
    }

    fetchAvailableTimes();

    return () => {
      cancelled = true;
    };
  }, [watchedBarberId, watchedDate, setValue, toast]);

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

      const { barberId, serviceIds, ...restData } = data;
      const payload = {
        ...restData,
        barber: barberId,
        services: serviceIds,
        barbershop: user.barbershop,
        date: format(data.date, 'yyyy-MM-dd'),
      };

      await api.post('/create-appointment', payload);

      toast({
        title: 'Agendamento Criado',
        description: 'O novo agendamento foi criado com sucesso.',
      });
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to create appointment:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Criar Agendamento',
        description: 'Não foi possível criar o agendamento. Tente novamente.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Cliente</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="barberId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Barbeiro</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um barbeiro" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {barbers.map((barber) => (
                    <SelectItem key={barber._id} value={barber._id!}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serviceIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Serviços</FormLabel>
                <FormDescription>
                  Selecione os serviços para este agendamento.
                </FormDescription>
              </div>
              {services.map((item) => (
                <FormField
                  key={item._id}
                  control={form.control}
                  name="serviceIds"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item._id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item._id!)}
                            onCheckedChange={(checked) => {
                              const currentServices = field.value || [];
                              return checked
                                ? field.onChange([...currentServices, item._id!])
                                : field.onChange(
                                    currentServices.filter(
                                      (value) => value !== item._id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {item.name}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP', { locale: ptBR })
                      ) : (
                        <span>Escolha uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      watchedBarberId && watchedDate
                        ? (loadingTimes ? 'Carregando...' : 'Selecione um horário')
                        : 'Selecione barbeiro e data primeiro'
                    } />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {/* On loading */}
                  {loadingTimes ? (
                    <div className="p-2 text-sm">Carregando horários...</div>
                  ) : !watchedBarberId || !watchedDate ? (
                    <div className="p-2 text-sm">Selecione barbeiro e data para ver horários</div>
                  ) : availableTimes.length === 0 ? (
                    <div className="p-2 text-sm">Nenhum horário disponível</div>
                  ) : (
                    availableTimes.map((time) => (
                      // valor nunca será string vazia -> evita erro do SelectItem
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentMethod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pagamento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Agendamento'}
        </Button>
      </form>
    </Form>
  );
}
