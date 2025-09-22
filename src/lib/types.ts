export type User = {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'manager';
  barbershopId?: string;
};

export type Barbershop = {
  id: string;
  _id?: string;
  name: string;
};

export type Barber = {
  id: string;
  _id?: string;
  name: string;
  barbershopId: string;
};

export type Service = {
  id: string;
  _id?: string;
  name: string;
  price: number;
  duration: number; // in minutes
  barbershopId: string;
};

export type Product = {
  id: string;
  _id?: string;
  name: string;
  price: number;
  quantity: number;
  barbershopId: string;
};

export type Appointment = {
  id: string;
  _id?: string;
  clientName: string;
  barbershop: string;
  barber: string;
  services: string[];
  date: string;
  hour: string;
  paymentMethod: 'dinheiro' | 'cartao' | 'pix';
  status: 'agendado' | 'concluido' | 'cancelado';
};

export type TransactionDetails = 
  | { kind: 'appointment', appointmentId: string }
  | { kind: 'product_sale', productId: string, quantity: number, barberId: string }
  | { kind: 'general' };

export type Transaction = {
  id: string;
  _id?: string;
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
