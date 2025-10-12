"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Barber, Service, Appointment } from "@/lib/types";
import { createAppointment, updateAppointment } from "@/lib/fetcher";

const formSchema = z.object({
	clientName: z.string().min(1, "Nome do cliente é obrigatório."),
	barber: z.string().min(1, "Barbeiro é obrigatório."),
	serviceIds: z.array(z.string()).min(1, "Selecione pelo menos um serviço."),
	date: z.date({ required_error: "Data é obrigatória." }),
	hour: z.string().min(1, "Hora é obrigatória."),
	paymentMethod: z.enum(["dinheiro", "cartao", "pix"], {
		required_error: "Método de pagamento é obrigatório.",
	}),
});

type FormValues = z.infer<typeof formSchema>;

type AppointmentFormProps = {
	barbers: Barber[];
	services: Service[];
	onSuccess: () => void;
	appointment?: Appointment;
};

export function AppointmentForm({
	barbers,
	services,
	onSuccess,
	appointment,
}: AppointmentFormProps) {
	const { toast } = useToast();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			clientName: appointment?.clientName,
			barber: appointment?.barber,
			serviceIds: appointment?.services || [],
			date: appointment?.date
				? new Date(
						new Date(appointment.date).getTime() +
							new Date(appointment.date).getTimezoneOffset() *
								60000
				  )
				: new Date(),
			hour: appointment?.hour,
			paymentMethod: appointment?.paymentMethod,
		},
	});

	const { control, setValue, reset } = form;
	const { isSubmitting } = form.formState;

	const [availableTimes, setAvailableTimes] = useState<string[]>([]);
	const [loadingTimes, setLoadingTimes] = useState(false);

	const watchedBarberId = useWatch({ control, name: "barber" });
	const watchedDate = useWatch({ control, name: "date" });

	useEffect(() => {
		if (!watchedBarberId || !watchedDate) {
			setAvailableTimes([]);
			setLoadingTimes(false);
			return;
		}

		const user = localStorage.getItem("user")
			? JSON.parse(localStorage.getItem("user")!)
			: null;
		if (!user?.barbershop) {
			setAvailableTimes([]);
			return;
		}

		let cancelled = false;
		async function fetchAvailableTimes() {
			setLoadingTimes(true);
			setAvailableTimes([]);
			try {
				const formattedDate = format(watchedDate, "yyyy-MM-dd");
				const res = await api.get(
					`/available-times/${formattedDate}/${watchedBarberId}/${user.barbershop}`
				);
				if (!cancelled) {
					setAvailableTimes(Array.isArray(res.data) ? res.data : []);
				}
			} catch (err) {
				console.error("Erro ao buscar horários disponíveis:", err);
				if (!cancelled) {
					setAvailableTimes([]);
					toast({
						variant: "destructive",
						title: "Erro",
						description:
							"Não foi possível carregar os horários disponíveis.",
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
				clientName: data.clientName,
				barber: data.barber,
				services: data.serviceIds,
				barbershop: user.barbershop,
				date: format(data.date, "yyyy-MM-dd"),
				hour: data.hour,
				paymentMethod: data.paymentMethod,
			};

			if (appointment) {
				const success = await updateAppointment(appointment, payload);
				if (success) {
					toast({
						title: "Agendamento Atualizado",
						description:
							"O agendamento foi atualizado com sucesso.",
					});
				} else {
					toast({
						variant: "destructive",
						title: "Erro ao Atualizar",
						description:
							"Não foi possível atualizar o agendamento.",
					});
				}
			} else {
				const success = await createAppointment(payload);
				if (success) {
					toast({
						title: "Agendamento Criado",
						description:
							"O novo agendamento foi criado com sucesso.",
					});
				} else {
					toast({
						variant: "destructive",
						title: "Erro ao Criar",
						description: "Não foi possível criar o agendamento.",
					});
				}
			}

			onSuccess();
			reset();
		} catch (error) {
			console.error("Erro ao salvar agendamento:", error);
			toast({
				variant: "destructive",
				title: "Erro",
				description:
					"Não foi possível salvar o agendamento. Tente novamente.",
			});
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				{/* Nome do Cliente */}
				<FormField
					control={form.control}
					name="clientName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nome do Cliente</FormLabel>
							<FormControl>
								<Input
									placeholder="Nome completo do cliente"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Barbeiro */}
				<FormField
					control={form.control}
					name="barber"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Barbeiro</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value ?? ""}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Selecione um barbeiro" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{barbers.map((barber) => (
										<SelectItem
											key={barber._id}
											value={barber._id ?? ""}
										>
											{barber.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Serviços */}
				<FormField
					control={form.control}
					name="serviceIds"
					render={() => (
						<FormItem>
							<FormLabel>Serviços</FormLabel>
							<FormDescription>
								Selecione os serviços para este agendamento.
							</FormDescription>
							{services.map((item) => (
								<FormField
									key={item._id}
									control={form.control}
									name="serviceIds"
									render={({ field }) => (
										<FormItem className="flex flex-row items-center space-x-2">
											<FormControl>
												<Checkbox
													checked={field.value?.includes(
														item._id!
													)}
													onCheckedChange={(
														checked
													) => {
														const current =
															field.value || [];
														field.onChange(
															checked
																? [
																		...current,
																		item._id!,
																  ]
																: current.filter(
																		(id) =>
																			id !==
																			item._id
																  )
														);
													}}
												/>
											</FormControl>
											<FormLabel>{item.name}</FormLabel>
										</FormItem>
									)}
								/>
							))}
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Data */}
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
											variant="outline"
											className={cn(
												"w-full text-left font-normal",
												!field.value &&
													"text-muted-foreground"
											)}
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
									className="w-auto p-0"
									align="start"
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

				{/* Hora */}

				<FormField
					control={form.control}
					name="hour"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Hora</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue
											placeholder={
												watchedBarberId && watchedDate
													? loadingTimes
														? "Carregando..."
														: "Selecione um horário"
													: "Selecione barbeiro e data primeiro"
											}
										/>
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									{loadingTimes ? (
										<div className="p-2 text-sm">
											Carregando horários...
										</div>
									) : !watchedBarberId || !watchedDate ? (
										<div className="p-2 text-sm">
											Selecione barbeiro e data para ver
											horários
										</div>
									) : availableTimes.length === 0 ? (
										<div className="p-2 text-sm">
											Nenhum horário disponível
										</div>
									) : (
										availableTimes.map((time) => (
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

				{/* Pagamento */}
				<FormField
					control={form.control}
					name="paymentMethod"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Método de Pagamento</FormLabel>
							<Select
								onValueChange={field.onChange}
								value={field.value}
							>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder="Selecione o método" />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value="dinheiro">
										Dinheiro
									</SelectItem>
									<SelectItem value="cartao">
										Cartão de Crédito
									</SelectItem>
									<SelectItem value="pix">Pix</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="w-full"
					disabled={isSubmitting}
				>
					{isSubmitting ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : appointment ? (
						"Atualizar Agendamento"
					) : (
						"Criar Agendamento"
					)}
				</Button>
			</form>
		</Form>
	);
}
