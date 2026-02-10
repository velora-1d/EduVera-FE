"use client";

import { useEffect, useState } from "react";
import { landingApi } from "@/services/landingApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Plus, Trash2, Loader2, RefreshCcw } from "lucide-react";
import { showToast } from "@/components/ui/Toast";

// Helper input harga
const InputHarga = ({ value, onChange, label }: { value: number; onChange: (val: number) => void; label: string }) => (
    <div className="space-y-1">
        <Label className="text-xs text-slate-400">{label}</Label>
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
            <Input
                type="number"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseInt(e.target.value) || 0)}
                className="pl-9 bg-slate-900 border-slate-700"
            />
        </div>
    </div>
);

export default function ContentPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("pricing");

    // Data States
    const [pricing, setPricing] = useState<any>(null);
    const [schoolFeatures, setSchoolFeatures] = useState<any[]>([]);
    const [pesantrenFeatures, setPesantrenFeatures] = useState<any[]>([]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [p, s, ps] = await Promise.all([
                landingApi.get("pricing_plans"),
                landingApi.get("features_school"),
                landingApi.get("features_pesantren")
            ]);

            if (p?.value) setPricing(p.value);
            if (s?.value) setSchoolFeatures(s.value);
            if (ps?.value) setPesantrenFeatures(ps.value);
        } catch (error) {
            console.error("Gagal memuat data konten", error);
            showToast("Gagal memuat data konten", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSimpanHarga = async () => {
        setSaving(true);
        try {
            await landingApi.update("pricing_plans", pricing);
            showToast("Harga paket berhasil disimpan!", "success");
        } catch (error) {
            showToast("Gagal menyimpan harga paket", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSimpanFiturSekolah = async () => {
        setSaving(true);
        try {
            await landingApi.update("features_school", schoolFeatures);
            showToast("Fitur Sekolah berhasil disimpan!", "success");
        } catch (error) {
            showToast("Gagal menyimpan fitur sekolah", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleSimpanFiturPesantren = async () => {
        setSaving(true);
        try {
            await landingApi.update("features_pesantren", pesantrenFeatures);
            showToast("Fitur Pesantren berhasil disimpan!", "success");
        } catch (error) {
            showToast("Gagal menyimpan fitur pesantren", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Editor Landing Page</h2>
                    <p className="text-slate-400">Atur konten dinamis halaman depan.</p>
                </div>
                <Button variant="outline" onClick={loadData} disabled={loading || saving}>
                    <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Muat Ulang
                </Button>
            </div>

            {/* Tab Menu */}
            <div className="flex space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                {[
                    { id: "pricing", label: "Harga Paket" },
                    { id: "features_school", label: "Fitur Sekolah" },
                    { id: "features_pesantren", label: "Fitur Pesantren" }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                            ? "bg-emerald-600 text-white shadow"
                            : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB HARGA PAKET */}
            {activeTab === "pricing" && (
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Atur Harga Paket</CardTitle>
                            <CardDescription>Edit harga bulanan dan tahunan untuk setiap paket langganan.</CardDescription>
                        </div>
                        <Button onClick={handleSimpanHarga} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Simpan Harga
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {pricing && ["sekolah", "pesantren", "hybrid"].map((plan: string) => (
                            <div key={plan} className="p-4 border border-slate-800 rounded-lg bg-slate-950/50">
                                <h3 className="text-lg font-bold text-white capitalize mb-4 flex items-center gap-2">
                                    <span className={`w-2 h-8 rounded-full ${plan === 'hybrid' ? 'bg-purple-500' : plan === 'sekolah' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                                    Paket {plan}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tier Basic */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-300 border-b border-slate-800 pb-2">Tier Basic</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputHarga
                                                label="Bulanan"
                                                value={pricing[plan]?.basic?.monthly || 0}
                                                onChange={(val) => setPricing({ ...pricing, [plan]: { ...pricing[plan], basic: { ...pricing[plan].basic, monthly: val } } })}
                                            />
                                            <InputHarga
                                                label="Tahunan"
                                                value={pricing[plan]?.basic?.annual || 0}
                                                onChange={(val) => setPricing({ ...pricing, [plan]: { ...pricing[plan], basic: { ...pricing[plan].basic, annual: val } } })}
                                            />
                                        </div>
                                    </div>
                                    {/* Tier Premium */}
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-amber-400 border-b border-slate-800 pb-2">Tier Premium</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputHarga
                                                label="Bulanan"
                                                value={pricing[plan]?.premium?.monthly || 0}
                                                onChange={(val) => setPricing({ ...pricing, [plan]: { ...pricing[plan], premium: { ...pricing[plan].premium, monthly: val } } })}
                                            />
                                            <InputHarga
                                                label="Tahunan"
                                                value={pricing[plan]?.premium?.annual || 0}
                                                onChange={(val) => setPricing({ ...pricing, [plan]: { ...pricing[plan], premium: { ...pricing[plan].premium, annual: val } } })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* TAB FITUR SEKOLAH */}
            {activeTab === "features_school" && (
                <EditorFitur
                    title="Fitur Sekolah"
                    items={schoolFeatures}
                    setItems={setSchoolFeatures}
                    onSave={handleSimpanFiturSekolah}
                    saving={saving}
                />
            )}

            {/* TAB FITUR PESANTREN */}
            {activeTab === "features_pesantren" && (
                <EditorFitur
                    title="Fitur Pesantren"
                    items={pesantrenFeatures}
                    setItems={setPesantrenFeatures}
                    onSave={handleSimpanFiturPesantren}
                    saving={saving}
                />
            )}
        </div>
    );
}

// Sub-komponen untuk Editing Fitur
const EditorFitur = ({ title, items, setItems, onSave, saving }: { title: string, items: any[], setItems: any, onSave: any, saving: boolean }) => {
    const tambahFitur = () => {
        setItems([...items, { title: "Fitur Baru", desc: "Deskripsi fitur", icon: "Star" }]);
    };

    const hapusFitur = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateFitur = (index: number, key: string, value: string) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [key]: value };
        setItems(newItems);
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-white">{title}</CardTitle>
                    <CardDescription>Edit daftar fitur yang ditampilkan di landing page.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={tambahFitur}>
                        <Plus className="w-4 h-4 mr-2" /> Tambah Fitur
                    </Button>
                    <Button onClick={onSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Simpan
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        Belum ada fitur. Klik "Tambah Fitur" untuk menambahkan.
                    </div>
                )}
                {items.map((item, i) => (
                    <div key={i} className="flex gap-4 items-start p-4 border border-slate-800 rounded bg-slate-950/30">
                        <div className="space-y-2 flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-400">Judul</Label>
                                    <Input
                                        value={item.title}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFitur(i, "title", e.target.value)}
                                        className="bg-slate-900 border-slate-700"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-400">Nama Icon (Lucide)</Label>
                                    <Input
                                        value={item.icon}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFitur(i, "icon", e.target.value)}
                                        className="bg-slate-900 border-slate-700"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-slate-400">Deskripsi</Label>
                                <Input
                                    value={item.desc}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFitur(i, "desc", e.target.value)}
                                    className="bg-slate-900 border-slate-700"
                                />
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => hapusFitur(i)} className="text-slate-500 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
