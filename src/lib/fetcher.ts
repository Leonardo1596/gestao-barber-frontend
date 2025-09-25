import { format } from "date-fns";
import api from "../services/api";

export async function fetchBarbers() {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

    if (!user) return;
    try {
        const response = await api.get(`barbers/barbershop/${user.barbershop}`);

        return response.data;

    } catch (err) {
        console.error('Erro ao buscar barbeiros:', err);
    }

};

export async function fetchReport(startDate: Date, endDate: Date, selectedBarber?: string | null) {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

    const from = format(startDate, "yyyy-MM-dd");
    const to = format(endDate, "yyyy-MM-dd");

    try {
        const url = selectedBarber
            ? `/report-by-barber-and-period/barbershop/${user.barbershop}/${selectedBarber}/${from}/${to}`
            : `/report-by-period/barbershop/${user.barbershop}/${from}/${to}`;

        const response = await api.get(url);
        return response.data || {};
    } catch (err) {
        console.error('Erro ao buscar report:', err);
    }
    return from;
};

export async function fetchServices() {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

    if (!user) return;
    try {
        if (user && user.barbershop) {
            const response = await api.get(`/services/barbershop/${user.barbershop}`);
            return response.data;
        }
    } catch (err) {
        console.error('Erro ao buscar serviços:', err);
    }
};

export async function fetchProducts() {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

    if (!user) return;
    try {
        const response = await api.get(`/products/barbershop/${user.barbershop}`);
        return response.data;
    } catch (err) {
        console.error('Erro ao buscar produtos:', err);
    }
};

export async function fetchAppointments(startDate: Date, endDate: Date) {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

    const from = format(startDate, "yyyy-MM-dd");
    const to = format(endDate, "yyyy-MM-dd");

    if (!user) return;
    try {
        if (user && user.barbershop) {
            const response = await api.get(`/appointments-by-date/barbershop/${user.barbershop}?startDate=${from}&endDate=${to}`)
            return response.data;;
        }
    } catch (err) {
        console.error('Erro ao buscar agendamentos:', err);
    }
};