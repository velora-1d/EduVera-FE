"use client";

import { useEffect, useState, useCallback } from "react";
import { ownerApi } from "@/lib/api";
import {
    MessageSquare,
    Edit3,
    Send,
    Search,
    RefreshCw,
    Save,
    Info,
    Loader2,
    Plus,
    Trash2,
    ToggleLeft,
    ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import { showToast } from "@/components/ui/Toast";

interface NotificationTemplate {
    id: string;
    event_type: string;
    channel: string;
    template_name: string;
    template_content: string;
    variables: string;
    is_active: boolean;
    updated_at: string;
}

const EMPTY_TEMPLATE: Partial<NotificationTemplate> = {
    event_type: "",
    channel: "whatsapp_owner",
    template_name: "",
    template_content: "",
    variables: "",
    is_active: true,
};

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Create/Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<NotificationTemplate> | null>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [saving, setSaving] = useState(false);

    // Delete Confirmation State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTemplate, setDeletingTemplate] = useState<NotificationTemplate | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Test Modal State
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [testingTemplate, setTestingTemplate] = useState<NotificationTemplate | null>(null);
    const [testPhone, setTestPhone] = useState("");
    const [testVariables, setTestVariables] = useState<Record<string, string>>({});
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ownerApi.getNotificationTemplates();
            setTemplates(data.data || []);
        } catch (error) {
            console.error("Gagal memuat template", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    // === CREATE ===
    const handleOpenCreate = () => {
        setEditingTemplate({ ...EMPTY_TEMPLATE });
        setIsCreateMode(true);
        setIsEditModalOpen(true);
    };

    const handleCreate = async () => {
        if (!editingTemplate) return;
        if (!editingTemplate.event_type || !editingTemplate.channel || !editingTemplate.template_content) {
            showToast("Event type, channel, dan konten pesan wajib diisi", "error");
            return;
        }
        setSaving(true);
        try {
            await ownerApi.createNotificationTemplate({
                event_type: editingTemplate.event_type,
                channel: editingTemplate.channel,
                template_name: editingTemplate.template_name,
                template_content: editingTemplate.template_content,
                variables: editingTemplate.variables,
                is_active: editingTemplate.is_active ?? true,
            });
            showToast("Template berhasil dibuat!", "success");
            setIsEditModalOpen(false);
            fetchTemplates();
        } catch (error: any) {
            showToast(error.userMessage || "Gagal membuat template", "error");
        } finally {
            setSaving(false);
        }
    };

    // === UPDATE ===
    const handleEdit = (template: NotificationTemplate) => {
        setEditingTemplate({ ...template });
        setIsCreateMode(false);
        setIsEditModalOpen(true);
    };

    const handleSave = async () => {
        if (!editingTemplate || !editingTemplate.id) return;
        setSaving(true);
        try {
            await ownerApi.updateNotificationTemplate(editingTemplate.id, {
                template_name: editingTemplate.template_name,
                template_content: editingTemplate.template_content,
                variables: editingTemplate.variables,
                is_active: editingTemplate.is_active,
            });
            showToast("Template berhasil diperbarui!", "success");
            setIsEditModalOpen(false);
            fetchTemplates();
        } catch (error: any) {
            showToast(error.userMessage || "Gagal memperbarui template", "error");
        } finally {
            setSaving(false);
        }
    };

    // === DELETE ===
    const handleOpenDelete = (template: NotificationTemplate) => {
        setDeletingTemplate(template);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingTemplate) return;
        setDeleting(true);
        try {
            await ownerApi.deleteNotificationTemplate(deletingTemplate.id);
            showToast("Template berhasil dihapus!", "success");
            setIsDeleteModalOpen(false);
            setDeletingTemplate(null);
            fetchTemplates();
        } catch (error: any) {
            showToast(error.userMessage || "Gagal menghapus template", "error");
        } finally {
            setDeleting(false);
        }
    };

    // === TEST ===
    const handleOpenTest = (template: NotificationTemplate) => {
        setTestingTemplate(template);
        setTestPhone("");
        const vars: Record<string, string> = {};
        if (template.variables) {
            template.variables.split(",").forEach(v => {
                vars[v.trim()] = "";
            });
        }
        setTestVariables(vars);
        setTestResult(null);
        setIsTestModalOpen(true);
    };

    const handleTestSend = async () => {
        if (!testingTemplate) return;
        setTestLoading(true);
        try {
            const res = await ownerApi.testNotificationTemplate(testingTemplate.id, {
                phone: testPhone,
                variables: testVariables,
            });
            setTestResult(res.data);
        } catch (error: any) {
            showToast(error.userMessage || "Gagal mengetes template", "error");
        } finally {
            setTestLoading(false);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.event_type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getChannelBadge = (channel: string) => {
        switch (channel) {
            case "whatsapp_owner":
                return <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium">WA Owner</span>;
            case "whatsapp_tenant":
                return <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full font-medium">WA Tenant</span>;
            case "telegram":
                return <span className="bg-sky-500/20 text-sky-400 text-xs px-2 py-0.5 rounded-full font-medium">Telegram</span>;
            default:
                return <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-medium">{channel}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-7 h-7 text-emerald-500" />
                        Template Notifikasi
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Kelola template pesan otomatis untuk berbagai event sistem.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <Input
                            placeholder="Cari template..."
                            className="pl-10 bg-slate-900 border-slate-800 focus:border-emerald-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={handleOpenCreate}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Buat Baru
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <Card key={template.id} className="p-5 flex flex-col hover:border-slate-700 transition-colors bg-slate-900 border-slate-800">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-white font-bold">{template.template_name}</h4>
                                    <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mt-0.5">
                                        {template.event_type}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {getChannelBadge(template.channel)}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${template.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                        {template.is_active ? "Aktif" : "Nonaktif"}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 bg-slate-950/50 rounded-lg p-3 border border-slate-800/50 mb-4 line-clamp-4">
                                <p className="text-slate-400 text-sm whitespace-pre-wrap leading-relaxed">
                                    {template.template_content}
                                </p>
                            </div>

                            {template.variables && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                    {template.variables.split(",").map(v => (
                                        <code key={v} className="bg-slate-800 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded">
                                            {"{{ " + v.trim() + " }}"}
                                        </code>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-slate-800/50">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all font-medium"
                                    onClick={() => handleEdit(template)}
                                >
                                    <Edit3 className="w-4 h-4 mr-2 text-emerald-400" />
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all"
                                    onClick={() => handleOpenTest(template)}
                                >
                                    <Send className="w-4 h-4 text-blue-400" />
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-slate-800 hover:bg-red-900/50 text-slate-200 border border-slate-700 hover:border-red-500/50 transition-all"
                                    onClick={() => handleOpenDelete(template)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {filteredTemplates.length === 0 && (
                        <div className="col-span-full py-20 text-center space-y-3">
                            <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                                <MessageSquare className="w-8 h-8 text-slate-700" />
                            </div>
                            <p className="text-slate-500">Tidak ada template yang ditemukan.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Create / Edit */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={isCreateMode ? "Buat Template Baru" : "Edit Template"}
            >
                {editingTemplate && (
                    <div className="space-y-5">
                        {isCreateMode && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Tipe Event</label>
                                    <Input
                                        value={editingTemplate.event_type || ""}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, event_type: e.target.value })}
                                        placeholder="contoh: registration_approved, payment_received"
                                        className="bg-slate-900 border-slate-800"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Channel</label>
                                    <select
                                        value={editingTemplate.channel || "whatsapp_owner"}
                                        onChange={(e) => setEditingTemplate({ ...editingTemplate, channel: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                    >
                                        <option value="whatsapp_owner">WhatsApp Owner</option>
                                        <option value="whatsapp_tenant">WhatsApp Tenant</option>
                                        <option value="telegram">Telegram</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Nama Template</label>
                            <Input
                                value={editingTemplate.template_name || ""}
                                onChange={(e) => setEditingTemplate({ ...editingTemplate, template_name: e.target.value })}
                                placeholder="contoh: Notifikasi Registrasi Diterima"
                                className="bg-slate-900 border-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <label className="text-sm font-medium text-slate-300">Konten Pesan</label>
                                <span className="text-[10px] text-slate-500">Karakter: {(editingTemplate.template_content || "").length}</span>
                            </div>
                            <textarea
                                value={editingTemplate.template_content || ""}
                                onChange={(e) => setEditingTemplate({ ...editingTemplate, template_content: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none h-48"
                                placeholder="Tulis konten pesan di sini. Gunakan {{variabel}} untuk variabel dinamis."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Variabel (pisahkan koma)</label>
                            <Input
                                value={editingTemplate.variables || ""}
                                onChange={(e) => setEditingTemplate({ ...editingTemplate, variables: e.target.value })}
                                placeholder="contoh: nama_lembaga, nama_admin, subdomain"
                                className="bg-slate-900 border-slate-800"
                            />
                            {editingTemplate.variables && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    <span className="text-[10px] text-slate-500 w-full mb-0.5">Preview variabel:</span>
                                    {editingTemplate.variables.split(",").map(v => (
                                        <code key={v} className="bg-slate-800 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded">
                                            {"{{ " + v.trim() + " }}"}
                                        </code>
                                    ))}
                                </div>
                            )}
                        </div>

                        {!isCreateMode && (
                            <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                                <span className="text-sm text-slate-300">Status Template</span>
                                <button
                                    onClick={() => setEditingTemplate({ ...editingTemplate, is_active: !editingTemplate.is_active })}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    {editingTemplate.is_active ?
                                        <><ToggleRight className="w-6 h-6 text-emerald-400" /> <span className="text-emerald-400">Aktif</span></> :
                                        <><ToggleLeft className="w-6 h-6 text-slate-500" /> <span className="text-slate-500">Nonaktif</span></>
                                    }
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                            <Button
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 h-10 text-white"
                                onClick={isCreateMode ? handleCreate : handleSave}
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                {isCreateMode ? "Buat Template" : "Simpan Perubahan"}
                            </Button>
                            <Button
                                variant="outline"
                                className="border-slate-800 h-10 text-slate-300"
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Hapus Template"
            >
                {deletingTemplate && (
                    <div className="space-y-5">
                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 space-y-2">
                            <p className="text-sm text-red-400">
                                Apakah Anda yakin ingin menghapus template berikut?
                            </p>
                            <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                                <p className="text-white font-bold">{deletingTemplate.template_name}</p>
                                <p className="text-slate-500 text-xs mt-1">{deletingTemplate.event_type} · {deletingTemplate.channel}</p>
                            </div>
                            <p className="text-xs text-red-400/70">
                                Tindakan ini tidak dapat dibatalkan. Template yang dihapus tidak dapat dikembalikan.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700 h-10 text-white"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                Ya, Hapus Template
                            </Button>
                            <Button
                                variant="outline"
                                className="border-slate-800 h-10 text-slate-300"
                                onClick={() => setIsDeleteModalOpen(false)}
                            >
                                Batal
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Test Kirim */}
            <Modal
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
                title="Test Kirim Notifikasi"
            >
                {testingTemplate && (
                    <div className="space-y-5">
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex gap-2.5">
                            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-400/90 leading-relaxed">
                                Fitur ini memungkinkan Anda melakukan preview pesan dengan variabel yang diisi secara manual.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Nomor WhatsApp Tujuan</label>
                                <Input
                                    value={testPhone}
                                    onChange={(e) => setTestPhone(e.target.value)}
                                    placeholder="628123456789"
                                    className="bg-slate-900 border-slate-800"
                                />
                            </div>

                            {Object.keys(testVariables).length > 0 && (
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-slate-300">Isi Variabel</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {Object.keys(testVariables).map(key => (
                                            <div key={key} className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono">
                                                    {key}
                                                </span>
                                                <Input
                                                    value={testVariables[key]}
                                                    onChange={(e) => setTestVariables({ ...testVariables, [key]: e.target.value })}
                                                    className="pl-24 bg-slate-900 border-slate-800 h-9 text-sm"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {testResult && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300">Preview Pesan</label>
                                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
                                    {testResult.parsed}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 pt-2">
                            <Button
                                className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 text-white"
                                onClick={handleTestSend}
                                disabled={testLoading || !testPhone}
                            >
                                {testLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                Preview & Test
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
