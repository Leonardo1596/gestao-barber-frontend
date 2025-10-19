'use client';

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchTransactions } from "@/lib/fetcher";

export function RecentActivity() {
	const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

	useEffect(() => {
		const now = new Date();
		const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

		fetchTransactions(startOfMonth, now).then((data) => {
			// Get last 5 transactions
			const lastFive = data.slice(-5);
			setRecentTransactions(lastFive);
		});
	}, []);

	return (
		<div className="space-y-8">
			{recentTransactions.length > 0 ? (
				recentTransactions.map((transaction, index) => (
					<div key={index} className="flex items-center">
						<Avatar className="h-9 w-9">
							<AvatarImage src="/avatars/01.png" alt="Avatar" />
							<AvatarFallback>
								{transaction.clientName
									&& transaction.clientName.charAt(0) || transaction.type === "saida" && transaction.description.charAt(0) || transaction.quantity && transaction.description ? transaction.description.charAt(0) : "P"}
							</AvatarFallback>
						</Avatar>
						<div className="ml-4 space-y-1">
							<p className="text-sm font-medium leading-none">
								{transaction.description || transaction.clientName}
							</p>
							<p className="text-sm text-muted-foreground">
								{transaction.clientName && "Agendamento" || transaction.type === "saida" && "Despesa" || transaction.quantity && "Produto"}
							</p>
						</div>
						<div className="ml-auto font-medium">
							+R$
							{transaction.amount.toLocaleString("pt-BR", {
								minimumFractionDigits: 2,
							})}
						</div>
					</div>
				))
			) : (
				<p className="text-sm text-muted-foreground">
					Nenhuma atividade recente encontrada.
				</p>
			)}
		</div>
	);
}
