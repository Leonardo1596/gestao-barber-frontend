"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Appointment, Product, Expense, Barber } from "@/lib/types";

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
	barbers: Barber[]
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
];

export const getProductColumns = (barbers: Barber[]): ColumnDef<Product>[] => [
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
];

export const getExpenseColumns = (): ColumnDef<Expense>[] => [
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
];
