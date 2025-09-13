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
import type { Appointment, Barber, Service } from '@/lib/types';

export const getColumns = (
  barbers: Barber[],
  services: Service[],
  onDelete: (appointment: Appointment) => void
): ColumnDef<Appointment>[] => [
  {
    accessorKey: 'clientName',
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
    accessorKey: 'barber',
    header: 'Barbeiro',
    cell: ({ row }) => {
      const barber = row.original.barber as Barber;
      return barber ? barber.name : 'N/A';
    },
  },
  {
    accessorKey: 'serviceIds',
    header: 'Serviços',
    cell: ({ row }) => {
        const serviceIds = row.original.serviceIds || [];
        const appointmentServices = services.filter(s => serviceIds.includes(s._id!));
        return (
            <div className="flex flex-wrap gap-1">
                {appointmentServices.length > 0 
                  ? appointmentServices.map(s => <Badge key={s._id} variant="secondary">{s.name}</Badge>)
                  : 'N/A'
                }
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
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
      if (status === 'concluido') variant = 'default';
      if (status === 'cancelado') variant = 'destructive';
      if (status === 'agendado') variant = 'outline';
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(appointment._id!)}>Copiar ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => onDelete(appointment)}
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
