"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Expense } from "@/lib/types";

const formSchema = z.object({
	description: z.string().min(1, "Descrição é obrigatória."),
	amount: z.coerce.number().min(0.01, "Valor deve ser maior que zero."),
	date: z.date({ required_error: "Data é obrigatória." }),
});

type FormValues = z.infer<typeof formSchema>;

type ExpenseFormProps = {
	onSuccess: () => void;
	expense?: Expense;
};

export function ExpenseForm({ onSuccess, expense }: ExpenseFormProps) {
	const { toast } = useToast();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			description: expense?.description,
			amount: expense?.amount,
			date: expense?.date
				? new Date(
						new Date(expense.date).getTime() +
							new Date(expense.date).getTimezoneOffset() * 60000
				  )
				: new Date(),
		},
	});

	const { reset } = form;
	const { isSubmitting } = form.formState;

	async function onSubmit(data: FormValues) {
		try {
			const user = localStorage.getItem("user")
				? JSON.parse(localStorage.getItem("user")!)
				: null;
			if (!user?.barbershop) {
				toast({
					variant: "destructive",
					title: "Erro",
					description: "Usuário ou barbearia não encontrado.",
				});
				return;
			}

			const payload = {
				...data,
                type: "saida",
				barbershop: user.barbershop,
				date: format(data.date, "yyyy-MM-dd"),
			};

			if (expense) {
				await api.put(`/update-transaction/${expense._id}`, payload);
				toast({
					title: "Despesa Atualizada",
					description: "A despesa foi atualizada com sucesso.",
				});
			} else {
				await api.post("/create-transaction", payload);
				toast({
					title: "Despesa Criada",
					description: "A nova despesa foi criada com sucesso.",
				});
			}

			onSuccess();
			reset();
		} catch (error) {
			console.error("Erro ao salvar despesa:", error);
			toast({
				variant: "destructive",
				title: "Erro",
				description:
					"Não foi possível salvar a despesa. Tente novamente.",
			});
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Descrição</FormLabel>
							<FormControl>
								<Input placeholder="Ex: Aluguel" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="amount"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Valor</FormLabel>
							<FormControl>
								<Input type="number" placeholder="0,00" {...field} />
							</FormControl>
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
											variant={"outline"}
											className={cn(
												"w-full text-left font-normal",
												!field.value && "text-muted-foreground"
											)}
										>
											{field.value ? (
												format(field.value, "PPP", {
													locale: ptBR,
												})
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

				<Button type="submit" className="w-full" disabled={isSubmitting}>
					{isSubmitting ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : expense ? (
						"Atualizar Despesa"
					) : (
						"Adicionar Despesa"
					)}
				</Button>
			</form>
		</Form>
	);
}
