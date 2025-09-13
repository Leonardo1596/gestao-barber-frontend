export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  barbershopId?: string;
};

export type Barbershop = {
  id: string;
  name: string;
};

export type Barber = {
  id: string;
  name: string;
  barbershopId: string;
};

export type Service = {
  id: string;
  name: string;
  price: number;
  duration: number; // in minutes
  barbershopId: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  barbershopId: string;
};

export type Appointment = {
  id: string;
  customerName: string;
  barbershopId: string;
  barberId: string;
  serviceIds: string[];
  date: string;
  time: string;
  paymentMethod: 'Dinheiro' | 'Cartão de Crédito' | 'Pix';
  status: 'Agendado' | 'Concluído' | 'Cancelado';
};

export type TransactionDetails = 
  | { kind: 'appointment', appointmentId: string }
  | { kind: 'product_sale', productId: string, quantity: number, barberId: string }
  | { kind: 'general' };

export type Transaction = {
  id: string;
  barbershopId: string;
  userId: string;
  type: 'revenue' | 'expense';
  amount: number;
  description: string;
  date: string;
  status: 'Pendente' | 'Completo' | 'Falhou';
  details: TransactionDetails;
};

export type Report = {
	receitas: number;
	despesas: number;
	receitaLiquida: number;
	margemDeLucro: number;
	receitasDeAgendamento: number;
	receitasDeProduto: number;
	produtosVendidos: number;
	agendamentosConcluidos: number;
	servicosConcluidos: number;
	ticketMedioPorAgendamento: number;
	ticketMedioPorServico: number;
};
