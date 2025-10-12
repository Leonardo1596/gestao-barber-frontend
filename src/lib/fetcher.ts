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

// Create product
export async function createProduct(product: any) {
    console.log('passou aqui');
    try {
        await api.post('/create-product', product);
        return true;
    } catch (err) {
        console.error("Erro ao criar produto:", err);
        return false;
    }
};

// Delete product
export async function deleteProduct(selectedProduct?: any) {
    if (!selectedProduct) return false;

    try {
        await api.delete(`/delete-product/${selectedProduct._id}`);
        return true;
    } catch (err) {
        console.error("Erro ao excluir produto:", err);
        return false;
    }
};

// Update Product
export async function updateProduct(selectedProduct?: any, updatedProduct?: any) {
    if (!selectedProduct) return false;

    try {
        await api.put(`/update-product/${selectedProduct._id}`, updatedProduct);
        return true;
    } catch (err) {
        console.error("Erro ao atualizar produto:", err);
        return false;
    }
};

// Create barber
export async function createBarber(barber: any) {
    try {
        await api.post('/create-barber', barber);
        return true;
    } catch (err) {
        console.error("Erro ao criar barbeiro:", err);
        return false;
    }
};

// Create service
export async function createService(service: any) {
    try {
        await api.post('/create-service', service);
        return true;
    } catch (err) {
        console.error("Erro ao criar serviço:", err);
        return false;
    }
};

// Delete service
export async function deleteService(selectedService?: any) {
    if (!selectedService) return false;

    try {
        await api.delete(`/delete-service/${selectedService._id}`);
        return true;
    } catch (err) {
        console.error("Erro ao excluir serviço:", err);
        return false;
    }
};

// Update service
export async function updateService(selectedService?: any, updatedService?: any) {
    if (!selectedService) return false;

    try {
        await api.put(`/update-service/${selectedService._id}`, updatedService);
        return true;
    } catch (err) {
        console.error("Erro ao atualizar serviço:", err);
        return false;
    }
};

// Create appointment
export async function createAppointment(appointment: any) {
    try {
        await api.post('/create-appointment', appointment);
        return true;
    } catch (err) {
        console.error("Erro ao criar agendamento:", err);
        return false;
    }
};

// Delete appointment
export async function deleteAppointment(selectedAppointment?: any) {
    if (!selectedAppointment) return false;

    try {
        await api.delete(`/delete-appointment/${selectedAppointment._id}`);
        return true;
    } catch (err) {
        console.error("Erro ao excluir agendamento:", err);
        return false;
    }
};

// Update appointment
export async function updateAppointment(selectedAppointment?: any, updatedAppointment?: any) {
    if (!selectedAppointment) return false;

    try {
        await api.put(`/update-appointment/${selectedAppointment._id}`, updatedAppointment);
        return true;
    } catch (err) {
        console.error("Erro ao atualizar agendamento:", err);
        return false;
    }
};