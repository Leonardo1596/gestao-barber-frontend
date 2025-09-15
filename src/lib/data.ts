import type { Barber, Service, Product, Appointment, Transaction, User, Barbershop } from './types';

export const barbershops: Barbershop[] = [
    { id: 'shop-1', name: 'Barbearia Centro' },
    { id: 'shop-2', name: 'Barbearia Filial' },
]

export const barbers: Barber[] = [
  { id: 'barber-1', name: 'Carlos', barbershopId: 'shop-1' },
  { id: 'barber-2', name: 'Miguel', barbershopId: 'shop-1' },
  { id: 'barber-3', name: 'Jonas', barbershopId: 'shop-2' },
  { id: 'barber-4', name: 'Lucas', barbershopId: 'shop-2' },
];

export const services: Service[] = [
  { id: 'service-1', name: 'Corte Masculino', price: 50, duration: 30, barbershopId: 'shop-1' },
  { id: 'service-2', name: 'Barba', price: 30, duration: 20, barbershopId: 'shop-1' },
  { id: 'service-3', name: 'Corte e Barba', price: 75, duration: 50, barbershopId: 'shop-1' },
  { id: 'service-4', name: 'Pezinho', price: 15, duration: 10, barbershopId: 'shop-2' },
];

export const products: Product[] = [
  { id: 'prod-1', name: 'Pomada Modeladora', price: 35, stock: 50, barbershopId: 'shop-1' },
  { id: 'prod-2', name: 'Óleo para Barba', price: 40, stock: 30, barbershopId: 'shop-1' },
  { id: 'prod-3', name: 'Shampoo para Cabelo', price: 25, stock: 100, barbershopId: 'shop-2' },
  { id: 'prod-4', name: 'Cera de Bigode', price: 20, stock: 45, barbershopId: 'shop-2' },
];

export const appointments: Appointment[] = [
  { id: 'appt-1', customerName: 'João Silva', barbershopId: 'shop-1', barberId: 'barber-1', serviceIds: ['service-1'], date: '2024-07-29', time: '10:00', paymentMethod: 'Cartão de Crédito', status: 'Concluído' },
  { id: 'appt-2', customerName: 'Marcos Oliveira', barbershopId: 'shop-1', barberId: 'barber-2', serviceIds: ['service-3'], date: '2024-07-29', time: '11:00', paymentMethod: 'Dinheiro', status: 'Agendado' },
  { id: 'appt-3', customerName: 'Pedro Costa', barbershopId: 'shop-2', barberId: 'barber-3', serviceIds: ['service-2', 'service-4'], date: '2024-07-30', time: '14:00', paymentMethod: 'Pix', status: 'Cancelado' },
];

export const transactions: Transaction[] = [
  { id: 'trans-1', barbershopId: 'shop-1', userId: 'user-2', type: 'revenue', amount: 50, description: 'Corte Masculino - João Silva', date: '2024-07-29', status: 'Completo', details: { kind: 'appointment', appointmentId: 'appt-1' } },
  { id: 'trans-2', barbershopId: 'shop-1', userId: 'user-2', type: 'expense', amount: 150, description: 'Compra de toalhas', date: '2024-07-28', status: 'Completo', details: { kind: 'general' } },
  { id: 'trans-3', barbershopId: 'shop-2', userId: 'user-1', type: 'revenue', amount: 35, description: 'Venda de produto', date: '2024-07-29', status: 'Completo', details: { kind: 'product_sale', productId: 'prod-3', quantity: 1, barberId: 'barber-3' } },
  { id: 'trans-4', barbershopId: 'shop-1', userId: 'user-2', type: 'revenue', amount: 40, description: 'Venda de produto', date: '2024-07-29', status: 'Completo', details: { kind: 'product_sale', productId: 'prod-2', quantity: 1, barberId: 'barber-1' } },
];

export const reportData = {
	"revenues": 125,
	"expenses": 150,
	"netRevenue": -25,
	"profitMargin": -0.2,
	"appointmentRevenues": 50,
	"productRevenues": 75,
	"productsSold": 2,
	"completedAppointments": 1,
	"completedServices": 1,
	"averageTicketAppointment": 50,
	"averageTicketService": 50
}
