'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import {
	getAppointmentColumns,
	getProductColumns,
	getExpenseColumns,
} from "./columns";
import type { Appointment, Product, Expense, Barber } from "@/lib/types";
import { MonthSelector } from "../_components/MonthSelector";
import { fetchTransactions, fetchBarbers } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { ExpenseForm } from "./_components/expense-form";

export default function TransactionsPage() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [products, setProducts] = useState<Product[]>([]);
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [barbers, setBarbers] = useState<Barber[]>([]);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isMarkAsPaidDialogOpen, setIsMarkAsPaidDialogOpen] = useState(false);
	const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
	const [selectedTransaction, setSelectedTransaction] = useState<Appointment | Product | Expense | null>(null);
	const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
	const [transactionType, setTransactionType] = useState<
		"appointments" | "products" | "expenses"
	>("appointments");

	const [dateRange, setDateRange] = useState<{
		start: Date;
		end: Date;
	} | null>(null);

	const { toast } = useToast();

	useEffect(() => {
		if (!dateRange) return;
		Promise.all([
			fetchTransactions(dateRange.start, dateRange.end),
			fetchBarbers(),
		]).then(([transactionsData, barbersData]) => {
			if (transactionsData && Array.isArray(transactionsData)) {
				const appointmentsData = transactionsData.filter((t: any) => t.clientName);
				const productsData = transactionsData.filter((t: any) => t.quantity);
				const expensesData = transactionsData.filter(
					(t: any) => t.type === "saida"
				);

				setAppointments(appointmentsData);
				setProducts(productsData);
				setExpenses(expensesData);
			} else {
				setAppointments([]);
				setProducts([]);
				setExpenses([]);
			}
			setBarbers(barbersData || []);
		});
	}, [dateRange]);

	const handleMonthChange = useCallback((start: Date, end: Date) => {
		setDateRange({ start, end });
	}, []);

	const openDeleteDialog = (transaction: Appointment | Product | Expense) => {
		setSelectedTransaction(transaction);
		setIsDeleteDialogOpen(true);
	};

	const openMarkAsPaidDialog = (transaction: Appointment | Product | Expense) => {
		setSelectedTransaction(transaction);
		setIsMarkAsPaidDialogOpen(true);
	};

	const handleDeleteTransaction = async () => {
		if (!selectedTransaction) return;

		try {
			await api.delete(`/delete-transaction/${selectedTransaction._id}`);
			toast({
				title: "Transação Excluída",
				description: "A transação foi excluída com sucesso.",
			});
			if (dateRange) {
				const transactionsData = await fetchTransactions(
					dateRange.start,
					dateRange.end
				);
				const appointmentsData = transactionsData.filter((t: any) => t.clientName);
				const productsData = transactionsData.filter((t: any) => t.quantity);
				const expensesData = transactionsData.filter(
					(t: any) => t.type === "saida"
				);
				setAppointments(appointmentsData);
				setProducts(productsData);
				setExpenses(expensesData);
			}
		} catch (error) {
			console.error("Failed to delete transaction:", error);
			toast({
				variant: "destructive",
				title: "Erro ao Excluir",
				description:
					"Não foi possível excluir a transação. Tente novamente.",
			});
		} finally {
			setIsDeleteDialogOpen(false);
			setSelectedTransaction(null);
		}
	};

	const handleMarkAsPaid = async () => {
		if (!selectedTransaction) return;

		try {
			const isAppointment = "clientName" in selectedTransaction;
			const successMessage = isAppointment
				? "Agendamento concluído com sucesso."
				: "Transação marcada como paga.";

			await api.put(`/mark-as-paid/${selectedTransaction._id}`);
			toast({
				title: "Transação Atualizada",
				description: successMessage,
			});
			if (dateRange) {
				const transactionsData = await fetchTransactions(
					dateRange.start,
					dateRange.end
				);
				const appointmentsData = transactionsData.filter((t: any) => t.clientName);
				const productsData = transactionsData.filter((t: any) => t.quantity);
				const expensesData = transactionsData.filter(
					(t: any) => t.type === "saida"
				);
				setAppointments(appointmentsData);
				setProducts(productsData);
				setExpenses(expensesData);
			}
		} catch (error) {
			console.error("Failed to mark as paid:", error);
			toast({
				variant: "destructive",
				title: "Erro ao Marcar como Pago",
				description:
					"Não foi possível marcar a transação como paga. Tente novamente.",
			});
		} finally {
			setIsMarkAsPaidDialogOpen(false);
			setSelectedTransaction(null);
		}
	};

	const handleExpenseFormSuccess = () => {
		if (!dateRange) return;
		fetchTransactions(dateRange.start, dateRange.end).then((transactionsData) => {
			const expensesData = transactionsData.filter(
				(t: any) => t.type === "saida"
			);
			setExpenses(expensesData);
		});
		setIsExpenseDialogOpen(false);
	};

	const { columns, data, filterColumn, filterPlaceholder } = useMemo(() => {
		switch (transactionType) {
			case "appointments":
				return {
					columns: getAppointmentColumns(
						barbers,
						openDeleteDialog,
						openMarkAsPaidDialog
					),
					data: appointments,
					filterColumn: "clientName",
					filterPlaceholder: "Filtrar por cliente...",
				};
			case "products":
				return {
					columns: getProductColumns(
						barbers,
						openDeleteDialog,
						openMarkAsPaidDialog
					),
					data: products,
					filterColumn: "name",
					filterPlaceholder: "Filtrar por produto...",
				};
			case "expenses":
				return {
					columns: getExpenseColumns(openDeleteDialog, openMarkAsPaidDialog),
					data: expenses,
					filterColumn: "description",
					filterPlaceholder: "Filtrar por descrição...",
				};
		}
	}, [transactionType, appointments, products, expenses, barbers]);

	return (
		<div>
			<PageHeader title="Transações">
				<div className="flex flex-col md:flex-row justify-end items-end md:items-center gap-4">
					<MonthSelector onRangeChange={handleMonthChange} />
					{transactionType === "expenses" && (
						<Dialog
							open={isExpenseDialogOpen}
							onOpenChange={setIsExpenseDialogOpen}
						>
							<DialogTrigger asChild>
								<Button>
									<PlusCircle className="mr-2 h-4 w-4" />
									Adicionar Despesa
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>
										{selectedExpense
											? "Editar Despesa"
											: "Adicionar Despesa"}
									</DialogTitle>
								</DialogHeader>
								<ExpenseForm
									onSuccess={handleExpenseFormSuccess}
									expense={selectedExpense || undefined}
								/>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</PageHeader>

			<div className="flex gap-2 mb-4">
				<Button
					onClick={() => setTransactionType("appointments")}
					variant={
						transactionType === "appointments"
							? "default"
							: "outline"
					}
				>
					Agendamentos
				</Button>
				<Button
					onClick={() => setTransactionType("products")}
					variant={
						transactionType === "products" ? "default" : "outline"
					}
				>
					Produtos
				</Button>
				<Button
					onClick={() => setTransactionType("expenses")}
					variant={
						transactionType === "expenses" ? "default" : "outline"
					}
				>
					Despesas
				</Button>
			</div>

			<DataTable
				columns={columns as any}
				data={data as any[]}
				filterColumn={filterColumn}
				filterPlaceholder={filterPlaceholder}
			/>

			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
						<AlertDialogDescription>
							Essa ação não pode ser desfeita. Isso excluirá
							permanentemente a transação.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteTransaction}>
							Continuar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={isMarkAsPaidDialogOpen}
				onOpenChange={setIsMarkAsPaidDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Marcar como Pago</AlertDialogTitle>
						<AlertDialogDescription>
							Tem certeza de que deseja marcar esta transação como paga?
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction onClick={handleMarkAsPaid}>
							Confirmar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
