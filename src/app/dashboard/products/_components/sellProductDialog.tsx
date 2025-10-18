"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { format, set } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fetchBarbers } from "@/lib/fetcher";

interface SaleFormProps {
	product: { _id: string; name: string };
	onSuccess: () => void;
}

interface Barber {
	_id: string;
	name: string;
}

const formSchema = z.object({
	barberId: z.string().min(1, "Selecione um barbeiro."),
	quantity: z.number().min(1, "Quantidade mínima é 1."),
	date: z.date({ required_error: "Data é obrigatória." }),
});

type FormValues = z.infer<typeof formSchema>;

export function SaleForm({ product, onSuccess }: SaleFormProps) {
	const { toast } = useToast();
	const [barbers, setBarbers] = useState<Barber[]>([]);
	const [loadingBarbers, setLoadingBarbers] = useState(true);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			barberId: "",
			quantity: 1,
			date: new Date(),
		},
	});

	const { control, handleSubmit, setValue } = form;
	const watchedDate = useWatch({ control, name: "date" });

	useEffect(() => {
		// Fetch barbers
		fetchBarbers().then((data) => {
			setBarbers(data);
			setLoadingBarbers(false);
		});
	}, [toast]);

	async function onSubmit(data: FormValues) {
		try {
			const user = localStorage.getItem("user")
				? JSON.parse(localStorage.getItem("user")!)
				: null;
			if (!user?.barbershop) {
				toast({
					title: "Barbearia não encontrada",
					variant: "destructive",
				});
				return;
			}

			await api.post("/create-transaction", {
				type: "entrada",
				entryType: "produto-vendido",
				description: product.description,
				product: product._id,
				barber: data.barberId,
				quantity: data.quantity,
				date: format(data.date, "yyyy-MM-dd"),
				barbershop: user.barbershop,
			});

			toast({ title: "Venda registrada com sucesso!" });
			form.reset();
			onSuccess();
		} catch (err) {
			console.error(err);
			if (err.response.data.message) {
				toast({
					title: err.response.data.message,
					variant: "destructive",
				});
				return;
			}
			toast({ title: "Erro ao registrar venda", variant: "destructive" });
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={control}
					name="barberId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Barbeiro</FormLabel>
							<FormControl>
								<Select
									value={field.value}
									onValueChange={field.onChange}
									disabled={loadingBarbers}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={
												loadingBarbers
													? "Carregando..."
													: "Selecione um barbeiro"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{barbers.map((b) => (
											<SelectItem
												key={b._id}
												value={b._id}
											>
												{b.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="quantity"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Quantidade</FormLabel>
							<FormControl>
								<Input
									type="number"
									min={1}
									value={field.value}
									onChange={(e) =>
										field.onChange(Number(e.target.value))
									}
									autoComplete="off"
									autoFocus={false}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={control}
					name="date"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Data</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant="outline"
											className="w-full text-left font-normal"
										>
											{field.value
												? format(field.value, "PPP", {
														locale: ptBR,
												  })
												: "Escolha uma data"}
											<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent
									align="start"
									className="w-auto p-0"
								>
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

				<Button
					type="submit"
					className="w-full"
					disabled={form.formState.isSubmitting}
				>
					{form.formState.isSubmitting ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : (
						"Registrar Venda"
					)}
				</Button>
			</form>
		</Form>
	);
}
