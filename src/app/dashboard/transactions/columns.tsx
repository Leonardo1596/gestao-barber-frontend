'use client';

import type { ColumnDef } from "@tanstack/react-table";
import type { Appointment, Product, Expense, Barber } from "@/lib/types";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("pt-BR", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
};

const formatCurrency = (value: number) => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(value);
};

export const getAppointmentColumns = (
	barbers: Barber[],
	onDelete: (transaction: Appointment | Product | Expense) => void
): ColumnDef<Appointment>[] => [
	{
		accessorKey: "clientName",
		header: "Cliente",
	},
	{
		accessorKey: "value",
		header: "Valor",
		cell: ({ row }) => formatCurrency(row.original.amount),
	},
	{
		accessorKey: "description",
		header: "Descrição",
	},
	{
		accessorKey: "date",
		header: "Data",
		cell: ({ row }) => formatDate(row.original.date),
	},
	{
		accessorKey: "barberId",
		header: "Barbeiro",
		cell: ({ row }) => {
			const barber = barbers.find((b) => b._id === row.original.barber);
			return barber ? barber.name : "N/A";
		},
	},
	{
		accessorKey: "status",
		header: "Status",
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const transaction = row.original;
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
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => onDelete(transaction)}
						>
							Excluir
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export const getProductColumns = (
	barbers: Barber[],
	onDelete: (transaction: Appointment | Product | Expense) => void
): ColumnDef<Product>[] => [
	{
		accessorKey: "value",
		header: "Valor",
		cell: ({ row }) => formatCurrency(row.original.amount),
	},
	{
		accessorKey: "description",
		header: "Descrição",
	},
	{
		accessorKey: "date",
		header: "Data",
		cell: ({ row }) => formatDate(row.original.date),
	},
	{
		accessorKey: "quantity",
		header: "Quantidade",
	},
	{
		accessorKey: "barberId",
		header: "Barbeiro",
		cell: ({ row }) => {
			const barber = barbers.find((b) => b._id === row.original.barber);
			return barber ? barber.name : "N/A";
		},
	},
	{
		accessorKey: "status",
		header: "Status",
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const transaction = row.original;
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
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => onDelete(transaction)}
						>
							Excluir
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

export const getExpenseColumns = (
	onDelete: (transaction: Appointment | Product | Expense) => void
): ColumnDef<Expense>[] => [
	{
		accessorKey: "value",
		header: "Valor",
		cell: ({ row }) => formatCurrency(row.original.amount),
	},
	{
		accessorKey: "description",
		header: "Descrição",
	},
	{
		accessorKey: "date",
		header: "Data",
		cell: ({ row }) => formatDate(row.original.date),
	},
	{
		accessorKey: "status",
		header: "Status",
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const transaction = row.original;
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
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => onDelete(transaction)}
						>
							Excluir
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
