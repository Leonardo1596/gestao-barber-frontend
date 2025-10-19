"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MonthSelector } from "./_components/MonthSelector";
import { fetchBarbers, fetchReport } from "../../lib/fetcher";
import { RevenuesChart } from "./_components/revenues-chart";
import { RecentActivity } from "./_components/recent-activity";

const reportLabels: Record<string, string> = {
	revenues: "Receitas",
	expenses: "Despesas",
	netRevenue: "Receita Líquida",
	profitMargin: "Margem de Lucro",
	appointmentRevenues: "Receitas de Agendamento",
	productRevenues: "Receitas de Produto",
	productsSold: "Produtos Vendidos",
	completedAppointments: "Agendamentos Concluídos",
	completedServices: "Serviços Concluídos",
	averageTicketAppointment: "Ticket Médio por Agendamento",
	averageTicketService: "Ticket Médio por Serviço",
};

function formatValue(key: string, value: number) {
	if (key === "profitMargin") return `${value.toFixed(2)}%`;
	if (
		[
			"revenues",
			"expenses",
			"netRevenue",
			"appointmentRevenues",
			"productRevenues",
			"averageTicketAppointment",
			"averageTicketService",
		].includes(key)
	) {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	}
	return value;
}

export default function ReportsPage() {
	const router = useRouter();
	const [barberList, setBarberList] = useState<any[]>([]);
	const [report, setReport] = useState<Record<string, number> | null>(null);
	const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
	const [user, setUser] = useState<any>(null);
	const [dateRange, setDateRange] = useState<{
		start: Date;
		end: Date;
	} | null>(null);

	const handleMonthChange = useCallback((start: Date, end: Date) => {
		setDateRange({ start, end });
	}, []);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const storedUser = localStorage.getItem("user");
			if (storedUser) setUser(JSON.parse(storedUser));
			if (!storedUser) router.push("/");
		}
	}, [router]);

	useEffect(() => {
		// Fetch barbers
		fetchBarbers().then((data) => setBarberList(data));

		// Fetch report
		if (!dateRange) return;
		fetchReport(dateRange.start, dateRange.end, selectedBarber).then(
			(data) => setReport(data)
		);
	}, [dateRange, selectedBarber]);

	if (!user) return <div></div>;

	const chartData = report
		? [
				{ name: "Receitas", total: report.revenues },
				{ name: "Despesas", total: report.expenses },
		  ]
		: [];

	return (
		<div>
			<PageHeader title="Relatórios">
				<div className="w-full flex flex-row justify-start items-center gap-2 mt-2 md:justify-end">
					<div className="w-[140px] sm:w-[280px]">
						<MonthSelector onRangeChange={handleMonthChange} />
					</div>
					<div className="w-[120px] sm:w-[180px]">
						<Select
							onValueChange={(value) =>
								setSelectedBarber(
									value === "all" ? null : value
								)
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Filtrar por barbeiro" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									Todos os barbeiros
								</SelectItem>
								{barberList.map((barber) => (
									<SelectItem
										key={barber._id}
										value={barber._id}
									>
										{barber.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>
			</PageHeader>

			<div className="space-y-6 mt-4">
				{report && Object.keys(reportLabels).length > 0 && (
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{Object.keys(reportLabels).map((key) => (
							<Card key={key}>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">
										{reportLabels[key]}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">
										{formatValue(key, report[key] ?? 0)}
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Visão Geral</CardTitle>
					</CardHeader>
					<CardContent className="pl-2">
						<RevenuesChart data={chartData} />
					</CardContent>
				</Card>
				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Atividade Recente</CardTitle>
					</CardHeader>
					<CardContent>
						<RecentActivity />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
