import axios from "axios";

// Base URL for API - uses Next.js env convention
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
        "Content-Type": "application/json",
    },
});

export const publicApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add interceptor to include auth token and sandbox tenant header
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        // Check for normal auth token first
        let token = localStorage.getItem("access_token");

        // During onboarding, use the onboarding_token if no access_token exists
        if (!token) {
            token = localStorage.getItem("onboarding_token");
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Owner sandbox mode: include sandbox tenant header
        const isOwner = localStorage.getItem("is_owner") === "true";
        const sandboxTenant = localStorage.getItem("sandbox_tenant");
        if (isOwner && sandboxTenant) {
            config.headers["X-Sandbox-Tenant"] = sandboxTenant;
        }
    }
    return config;
});

// Global error response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Timeout error
        if (error.code === "ECONNABORTED") {
            error.userMessage = "Permintaan timeout. Server terlalu lama merespons, silakan coba lagi.";
            return Promise.reject(error);
        }

        // Network error (no response from server)
        if (!error.response) {
            error.userMessage = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.";
            return Promise.reject(error);
        }

        const status = error.response.status;
        const data = error.response.data;

        // Use backend error message if available, else provide default
        let userMessage = data?.error || data?.message || "";

        switch (status) {
            case 401:
                userMessage = userMessage || "Sesi Anda telah berakhir. Silakan login kembali.";
                if (typeof window !== "undefined") {
                    const pathname = window.location.pathname;
                    const isOwnerPath = pathname.startsWith("/owner");
                    const isLoginPage = pathname === "/login" || pathname === "/owner/login";

                    // Only redirect if NOT on a login page already
                    if (!isLoginPage) {
                        localStorage.removeItem("access_token");
                        if (isOwnerPath) {
                            window.location.href = "/owner/login";
                        } else {
                            window.location.href = "/login";
                        }
                    }
                }
                break;
            case 403:
                userMessage = userMessage || "Anda tidak memiliki akses ke fitur ini.";
                break;
            case 404:
                userMessage = userMessage || "Data tidak ditemukan.";
                break;
            case 409:
                userMessage = userMessage || "Data sudah ada atau terjadi konflik.";
                break;
            case 422:
                userMessage = userMessage || "Data tidak valid. Mohon periksa kembali.";
                break;
            case 500:
            case 502:
            case 503:
                userMessage = "Terjadi kesalahan pada server. Silakan coba lagi nanti.";
                break;
            default:
                userMessage = userMessage || "Terjadi kesalahan. Silakan coba lagi.";
        }

        error.userMessage = userMessage;
        return Promise.reject(error);
    }
);

// ============ Types ============
export interface RegisterInput {
    name: string;
    email: string;
    whatsapp: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: User;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    tenant_id: string;
    tenant?: Tenant;
}

export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    plan_type: "sekolah" | "pesantren" | "hybrid";
    subscription_tier: "basic" | "premium";
    status: string;
}

// ============ Auth API ============
export const authApi = {
    login: async (input: LoginInput): Promise<LoginResponse> => {
        const response = await api.post("/api/v1/auth/login", input);
        return response.data;
    },

    me: async (): Promise<{ user: User }> => {
        const response = await api.get("/api/v1/auth/me");
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post("/api/v1/auth/logout");
    },

    forgotPassword: async (email: string): Promise<{ message: string }> => {
        const response = await api.post("/api/v1/auth/forgot-password", { email });
        return response.data;
    },

    resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
        const response = await api.post("/api/v1/auth/reset-password", { token, password });
        return response.data;
    },
};

// ============ Owner API ============
export const ownerApi = {
    login: async (input: LoginInput): Promise<LoginResponse> => {
        const response = await api.post("/api/v1/owner/login", input);
        return response.data;
    },

    getTenants: async () => {
        const response = await api.get("/api/v1/owner/tenants");
        return response.data;
    },

    getTenantDetail: async (id: string) => {
        const response = await api.get(`/api/v1/owner/tenants/${id}`);
        return response.data;
    },

    updateTenantStatus: async (id: string, status: string) => {
        const response = await api.put(`/api/v1/owner/tenants/${id}/status`, { status });
        return response.data;
    },

    getRegistrations: async () => {
        const response = await api.get("/api/v1/owner/registrations");
        return response.data;
    },

    getTransactions: async () => {
        const response = await api.get("/api/v1/owner/transactions");
        return response.data;
    },

    getDisbursements: async () => {
        const response = await api.get("/api/v1/owner/disbursements");
        return response.data;
    },

    approveDisbursement: async (id: string) => {
        const response = await api.post(`/api/v1/owner/disbursements/${id}/approve`);
        return response.data;
    },

    rejectDisbursement: async (id: string, reason: string) => {
        const response = await api.post(`/api/v1/owner/disbursements/${id}/reject`, { reason });
        return response.data;
    },

    getNotifications: async () => {
        const response = await api.get("/api/v1/owner/notifications");
        return response.data;
    },

    getDashboardStats: async () => {
        const response = await api.get("/api/v1/owner/stats");
        return response.data;
    },

    upsertContent: async (data: { key: string; value: string; type: string }) => {
        const response = await api.post("/api/v1/owner/content", data);
        return response.data;
    },

    impersonate: async (tenantId: string) => {
        const response = await api.post("/api/v1/owner/impersonate", { tenant_id: tenantId });
        return response.data;
    },

    // WhatsApp Connection
    getWhatsAppStatus: async () => {
        const response = await api.get("/api/v1/owner/whatsapp/status");
        return response.data;
    },

    connectWhatsApp: async () => {
        const response = await api.post("/api/v1/owner/whatsapp/connect");
        return response.data;
    },

    disconnectWhatsApp: async () => {
        const response = await api.post("/api/v1/owner/whatsapp/disconnect");
        return response.data;
    },

    // Notification Templates
    getNotificationTemplates: async () => {
        const response = await api.get("/api/v1/owner/notification-templates");
        return response.data;
    },

    getNotificationTemplate: async (id: string) => {
        const response = await api.get(`/api/v1/owner/notification-templates/${id}`);
        return response.data;
    },

    updateNotificationTemplate: async (id: string, data: any) => {
        const response = await api.put(`/api/v1/owner/notification-templates/${id}`, data);
        return response.data;
    },

    createNotificationTemplate: async (data: any) => {
        const response = await api.post("/api/v1/owner/notification-templates", data);
        return response.data;
    },

    deleteNotificationTemplate: async (id: string) => {
        const response = await api.delete(`/api/v1/owner/notification-templates/${id}`);
        return response.data;
    },

    testNotificationTemplate: async (id: string, data: { phone: string; variables: any }) => {
        const response = await api.post(`/api/v1/owner/notification-templates/${id}/test`, data);
        return response.data;
    },

    // Billing Automation
    generateInvoices: async () => {
        const response = await api.post("/api/v1/owner/invoices/generate");
        return response.data;
    },

    broadcastOverdue: async () => {
        const response = await api.post("/api/v1/owner/invoices/broadcast");
        return response.data;
    },
};

// ============ Pesantren API ============
export const pesantrenApi = {
    // Dashboard
    getDashboardStats: async () => {
        const response = await api.get("/api/v1/pesantren/dashboard/stats");
        return response.data;
    },

    // SPP
    getSPPList: async () => {
        const response = await api.get("/api/v1/pesantren/spp");
        return response.data;
    },

    createSPP: async (data: any) => {
        const response = await api.post("/api/v1/pesantren/spp", data);
        return response.data;
    },

    updateSPP: async (id: string, data: any) => {
        const response = await api.put(`/api/v1/pesantren/spp/${id}`, data);
        return response.data;
    },

    deleteSPP: async (id: string) => {
        const response = await api.delete(`/api/v1/pesantren/spp/${id}`);
        return response.data;
    },

    recordPayment: async (id: string, data: any) => {
        const response = await api.post(`/api/v1/pesantren/spp/${id}/pay`, data);
        return response.data;
    },

    getSPPStats: async () => {
        const response = await api.get("/api/v1/pesantren/spp/stats");
        return response.data;
    },

    getSPPOverdue: async () => {
        const response = await api.get("/api/v1/pesantren/spp/overdue");
        return response.data;
    },

    uploadProof: async (id: string, data: FormData) => {
        const response = await api.post(`/api/v1/pesantren/spp/${id}/upload-proof`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    confirmPayment: async (id: string) => {
        const response = await api.post(`/api/v1/pesantren/spp/${id}/confirm`);
        return response.data;
    },

    // Profil
    getProfil: async () => {
        const response = await api.get("/api/v1/pesantren/profil");
        return response.data;
    },

    // Syahriah (Monthly fee) - Online payment (Premium only)
    createSyahriahPayment: async (data: any) => {
        const response = await api.post("/api/v1/payment/syahriah/create", data);
        return response.data;
    },
};

// ============ Sekolah API ============
export const sekolahApi = {
    // Dashboard
    getDashboardStats: async () => {
        const response = await api.get("/api/v1/sekolah/dashboard/stats");
        return response.data;
    },

    // === Akademik ===
    getSiswaList: async () => {
        const response = await api.get("/api/v1/sekolah/akademik/siswa");
        return response.data;
    },

    createSiswa: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/akademik/siswa", data);
        return response.data;
    },

    getGuruList: async () => {
        const response = await api.get("/api/v1/sekolah/akademik/guru");
        return response.data;
    },

    createGuru: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/akademik/guru", data);
        return response.data;
    },

    getMapelList: async () => {
        const response = await api.get("/api/v1/sekolah/akademik/mapel");
        return response.data;
    },

    getKelasList: async () => {
        const response = await api.get("/api/v1/sekolah/akademik/kelas");
        return response.data;
    },

    createKelas: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/akademik/kelas", data);
        return response.data;
    },

    // === Kepesantrenan ===
    getPelanggaranAturanList: async () => {
        const response = await api.get("/api/v1/sekolah/kepesantrenan/aturan");
        return response.data;
    },

    createPelanggaranAturan: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/kepesantrenan/aturan", data);
        return response.data;
    },

    getPelanggaranSiswaList: async () => {
        const response = await api.get("/api/v1/sekolah/kepesantrenan/pelanggaran");
        return response.data;
    },

    createPelanggaranSiswa: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/kepesantrenan/pelanggaran", data);
        return response.data;
    },

    getPerizinanList: async () => {
        const response = await api.get("/api/v1/sekolah/kepesantrenan/perizinan");
        return response.data;
    },

    createPerizinan: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/kepesantrenan/perizinan", data);
        return response.data;
    },

    // === Asrama ===
    getAsramaList: async () => {
        const response = await api.get("/api/v1/sekolah/asrama/gedung");
        return response.data;
    },

    createAsrama: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/asrama/gedung", data);
        return response.data;
    },

    getKamarList: async () => {
        const response = await api.get("/api/v1/sekolah/asrama/kamar");
        return response.data;
    },

    createKamar: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/asrama/kamar", data);
        return response.data;
    },

    getPenempatanList: async () => {
        const response = await api.get("/api/v1/sekolah/asrama/penempatan");
        return response.data;
    },

    createPenempatan: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/asrama/penempatan", data);
        return response.data;
    },

    // === Tahfidz ===
    getTahfidzSetoranList: async () => {
        const response = await api.get("/api/v1/sekolah/tahfidz/setoran");
        return response.data;
    },

    createTahfidzSetoran: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/tahfidz/setoran", data);
        return response.data;
    },

    // === Diniyah ===
    getDiniyahKitabList: async () => {
        const response = await api.get("/api/v1/sekolah/diniyah/kitab");
        return response.data;
    },

    createDiniyahKitab: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/diniyah/kitab", data);
        return response.data;
    },

    // === E-Rapor ===
    getRaporList: async () => {
        const response = await api.get("/api/v1/sekolah/erapor");
        return response.data;
    },

    createRapor: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/erapor", data);
        return response.data;
    },

    // === Tabungan ===
    getTabunganList: async () => {
        const response = await api.get("/api/v1/sekolah/tabungan");
        return response.data;
    },

    createTabunganMutasi: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/tabungan/mutasi", data);
        return response.data;
    },

    // === Kalender ===
    getKalenderEvents: async () => {
        const response = await api.get("/api/v1/sekolah/kalender");
        return response.data;
    },

    createKalenderEvent: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/kalender", data);
        return response.data;
    },

    // === Profil ===
    getProfil: async () => {
        const response = await api.get("/api/v1/sekolah/profil");
        return response.data;
    },

    updateProfil: async (data: any) => {
        const response = await api.put("/api/v1/sekolah/profil", data);
        return response.data;
    },

    // === Laporan ===
    getReportData: async () => {
        const response = await api.get("/api/v1/sekolah/laporan");
        return response.data;
    },

    // === Analytics ===
    getAnalytics: async () => {
        const response = await api.get("/api/v1/sekolah/dashboard/analytics");
        return response.data;
    },

    // === Attendance/Absensi ===
    getAttendance: async (date: string, kelas: string) => {
        const response = await api.get(`/api/v1/sekolah/attendance?date=${date}&kelas=${kelas}`);
        return response.data;
    },

    saveAttendance: async (date: string, kelas: string, records: any[]) => {
        const response = await api.post("/api/v1/sekolah/attendance", { date, kelas, records });
        return response.data;
    },

    // === SPP ===
    getSPPList: async () => {
        const response = await api.get("/api/v1/sekolah/spp");
        return response.data;
    },

    getSPPStats: async () => {
        const response = await api.get("/api/v1/sekolah/spp/stats");
        return response.data;
    },

    createSPPPayment: async (data: any) => {
        const response = await api.post("/api/v1/payment/spp/create", data);
        return response.data;
    },

    // Manual payment (available for all tiers)
    recordSPPPayment: async (id: string, data: any) => {
        const response = await api.post(`/api/v1/sekolah/spp/${id}/pay`, data);
        return response.data;
    },
};

// ============ Export API ============
export const exportApi = {
    exportStudents: async (format: "pdf" | "xlsx" = "pdf") => {
        const response = await api.get(`/api/v1/export/students?format=${format}`, {
            responseType: "blob",
        });
        return response.data;
    },

    exportPayments: async (format: "pdf" | "xlsx" = "pdf") => {
        const response = await api.get(`/api/v1/export/payments?format=${format}`, {
            responseType: "blob",
        });
        return response.data;
    },

    exportAttendance: async (kelas: string, month: string, format: "pdf" | "xlsx" = "pdf") => {
        const response = await api.get(`/api/v1/export/attendance?kelas=${kelas}&month=${month}&format=${format}`, {
            responseType: "blob",
        });
        return response.data;
    },
};

// ============ E-Rapor API ============
export const eraporApi = {
    getSubjects: async () => {
        const response = await api.get("/api/v1/sekolah/erapor/subjects");
        return response.data;
    },

    createSubject: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/erapor/subjects", data);
        return response.data;
    },

    updateSubject: async (id: string, data: any) => {
        const response = await api.put(`/api/v1/sekolah/erapor/subjects/${id}`, data);
        return response.data;
    },

    deleteSubject: async (id: string) => {
        const response = await api.delete(`/api/v1/sekolah/erapor/subjects/${id}`);
        return response.data;
    },

    saveGrade: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/erapor/grades", data);
        return response.data;
    },

    batchSaveGrades: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/erapor/grades/batch", data);
        return response.data;
    },

    getStudentGrades: async (studentId: string) => {
        const response = await api.get(`/api/v1/sekolah/erapor/grades/student/${studentId}`);
        return response.data;
    },

    getSubjectGrades: async (subjectId: string) => {
        const response = await api.get(`/api/v1/sekolah/erapor/grades/subject/${subjectId}`);
        return response.data;
    },

    getStudentRapor: async (studentId: string, semester: string) => {
        const response = await api.get(`/api/v1/sekolah/erapor/rapor/${studentId}/${semester}`);
        return response.data;
    },

    generateRapor: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/erapor/generate", data);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get("/api/v1/sekolah/erapor/stats");
        return response.data;
    },

    getCurriculum: async () => {
        const response = await api.get("/api/v1/sekolah/erapor/curriculum");
        return response.data;
    },

    setCurriculum: async (data: any) => {
        const response = await api.put("/api/v1/sekolah/erapor/curriculum", data);
        return response.data;
    },

    getRaporHistory: async () => {
        const response = await api.get("/api/v1/sekolah/erapor/rapor/history");
        return response.data;
    },
};

// ============ SDM API ============
export const sdmApi = {
    getEmployees: async () => {
        const response = await api.get("/api/v1/sekolah/sdm/employees");
        return response.data;
    },

    createEmployee: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/sdm/employees", data);
        return response.data;
    },

    updateEmployee: async (id: string, data: any) => {
        const response = await api.put(`/api/v1/sekolah/sdm/employees/${id}`, data);
        return response.data;
    },

    deleteEmployee: async (id: string) => {
        const response = await api.delete(`/api/v1/sekolah/sdm/employees/${id}`);
        return response.data;
    },

    getPayrollByPeriod: async () => {
        const response = await api.get("/api/v1/sekolah/sdm/payroll");
        return response.data;
    },

    generatePayroll: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/sdm/payroll/generate", data);
        return response.data;
    },

    markPayrollPaid: async (id: string) => {
        const response = await api.post(`/api/v1/sekolah/sdm/payroll/${id}/pay`);
        return response.data;
    },

    getPaySlip: async (id: string) => {
        const response = await api.get(`/api/v1/sekolah/sdm/payroll/${id}/slip`);
        return response.data;
    },

    downloadPaySlip: async (id: string) => {
        const response = await api.get(`/api/v1/sekolah/sdm/payroll/${id}/slip/download`, {
            responseType: "blob",
        });
        return response.data;
    },

    getPayrollConfig: async () => {
        const response = await api.get("/api/v1/sekolah/sdm/payroll/config");
        return response.data;
    },

    savePayrollConfig: async (data: any) => {
        const response = await api.put("/api/v1/sekolah/sdm/payroll/config", data);
        return response.data;
    },

    getAttendance: async () => {
        const response = await api.get("/api/v1/sekolah/sdm/attendance");
        return response.data;
    },

    recordAttendance: async (data: any) => {
        const response = await api.post("/api/v1/sekolah/sdm/attendance", data);
        return response.data;
    },

    getAttendanceSummary: async () => {
        const response = await api.get("/api/v1/sekolah/sdm/attendance/summary");
        return response.data;
    },
};

// ============ Subscription API ============
export const subscriptionApi = {
    getSubscription: async () => {
        const response = await api.get("/api/v1/subscription");
        return response.data;
    },

    getPricing: async () => {
        const response = await api.get("/api/v1/subscription/pricing");
        return response.data;
    },

    calculateUpgrade: async (data: any) => {
        const response = await api.post("/api/v1/subscription/calculate-upgrade", data);
        return response.data;
    },

    upgradePlan: async (data: any) => {
        const response = await api.post("/api/v1/subscription/upgrade", data);
        return response.data;
    },

    downgradePlan: async (data: any) => {
        const response = await api.post("/api/v1/subscription/downgrade", data);
        return response.data;
    },
};

// ============ Payment API ============
export const paymentApi = {
    createTransaction: async (data: any) => {
        const response = await api.post("/api/v1/payment/create", data);
        return response.data;
    },

    getStatus: async (orderId: string) => {
        const response = await api.get(`/api/v1/payment/status/${orderId}`);
        return response.data;
    },

    createSPPPayment: async (data: {
        spp_id: string;
        tenant_id: string;
        amount: number;
        student_name: string;
        parent_email: string;
    }) => {
        const response = await api.post("/api/v1/payment/spp/create", data);
        return response.data;
    },
};

// ============ Content API (for Landing Page) ============
export const contentApi = {
    get: async (key: string): Promise<any> => {
        try {
            const response = await api.get(`/api/v1/public/content/${key}`);
            const data = response.data;
            if (data.type === "json" && typeof data.value === "string") {
                try {
                    data.value = JSON.parse(data.value);
                } catch {
                    // keep as string if parse fails
                }
            }
            return data;
        } catch {
            return null;
        }
    },
};

// ============ Onboarding API ============
export const onboardingApi = {
    register: async (data: any) => {
        const response = await api.post("/api/v1/onboarding/register", data);
        return response.data;
    },

    institution: async (data: any) => {
        const response = await api.post("/api/v1/onboarding/institution", data);
        return response.data;
    },

    checkSubdomain: async (subdomain: string) => {
        const response = await api.post("/api/v1/onboarding/check-subdomain", { subdomain });
        return response.data;
    },

    subdomain: async (data: any) => {
        const response = await api.post("/api/v1/onboarding/subdomain", data);
        return response.data;
    },

    bankAccount: async (data: any) => {
        const response = await api.post("/api/v1/onboarding/bank-account", data);
        return response.data;
    },

    confirm: async (data: any) => {
        const response = await api.post("/api/v1/onboarding/confirm", data);
        return response.data;
    },

    getStatus: async (id: string) => {
        const response = await api.get(`/api/v1/onboarding/status/${id}`);
        return response.data;
    },
};

// ============ Tenant WhatsApp API (Premium Only) ============
export const tenantWhatsAppApi = {
    connect: async () => {
        const response = await api.post("/api/v1/tenant/whatsapp/connect");
        return response.data;
    },

    getStatus: async () => {
        const response = await api.get("/api/v1/tenant/whatsapp/status");
        return response.data;
    },

    disconnect: async () => {
        const response = await api.post("/api/v1/tenant/whatsapp/disconnect");
        return response.data;
    },

    sendTest: async (phone: string, message?: string) => {
        const response = await api.post("/api/v1/tenant/whatsapp/test", {
            phone,
            message: message || "Ini adalah pesan test dari EduVera"
        });
        return response.data;
    },
};

export default api;
