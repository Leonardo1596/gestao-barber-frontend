'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { Appointment } from '@/lib/types';
import { barbers, services as allServices } from '@/lib/data';

export const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: 'customerName',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: 'barberId',
    header: 'Barbeiro',
    cell: ({ row }) => {
      const barber = barbers.find((b) => b.id === row.original.barberId);
      return barber ? barber.name : 'N/A';
    },
  },
  {
    accessorKey: 'serviceIds',
    header: 'Serviços',
    cell: ({ row }) => {
        const serviceIds = row.original.serviceIds;
        const appointmentServices = allServices.filter(s => serviceIds.includes(s.id));
        return (
            <div className="flex flex-wrap gap-1">
                {appointmentServices.map(s => <Badge key={s.id} variant="secondary">{s.name}</Badge>)}
            </div>
        )
    }
  },
  {
    accessorKey: 'date',
    header: 'Data e Hora',
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      // Adjust for timezone offset
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
      const formattedDate = new Intl.DateTimeFormat('pt-BR').format(adjustedDate);
      return `${formattedDate} às ${row.original.time}`;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
      if (status === 'Concluído') variant = 'default';
      if (status === 'Cancelado') variant = 'destructive';
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(appointment.id)}>Copiar ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
