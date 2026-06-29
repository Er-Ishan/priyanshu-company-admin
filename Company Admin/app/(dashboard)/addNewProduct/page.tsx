"use client";

import React, { useEffect, useState } from "react";
import { View, ArrowLeft, Plus, Check, Clock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/ProtectedRoute";
import RichTextEditor from "@/components/RichTextEditor";
import { useSession } from "next-auth/react";
import { backendProxyPath } from "@/app/lib/backendProxy";

const API_BASE = ""; // no longer used in browser code

export default function AddParkingProduct() {
  const [form, setForm] = useState({
    airport_name: "",
    terminals: [] as string[],
    service_provider: "",
    product_name: "",
    website_display: "Y",
    airport_number: "",
    booking_email: "",
    airport_charges: "",
    operational_from: "",
    operational_to: "",
    book_short_hours: "",
    commission: "",
    product_extra: "",
    nonflex: "",
    service_type: "",
    recommended: "",
    product_description: "",
    product_overview: "",
    dropoff_procedure: "",
    directions: "",
    status: "Active",
    point_1: "",
    point_2: "",
    point_3: "",
    point_4: "",
    point_5: "",
    point_6: "",
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [terminalInput, setTerminalInput] = useState("");
  const [terminalList, setTerminalList] = useState<string[]>([]);

  const [message, setMessage] = useState("");
  const [airportList, setAirportList] = useState<AirportDropdown[]>([]);


  const { data: session } = useSession();

  useEffect(() => {
    fetch(backendProxyPath("/api/airports"))
      .then((res) => res.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
        setAirportList(list);
      })
      .catch((err) => console.error("Error fetching airports:", err));
  }, []);

  useEffect(() => {
    const company =
      (session?.user as any)?.company_name ||
      (session?.user as any)?.companyName ||
      "";
    if (company) {
      setForm((prev) => ({ ...prev, service_provider: String(company) }));
      return;
    }

    // Fallback: hydrate via server session endpoint
    fetch("/api/session/me")
      .then((r) => r.json())
      .then((json) => {
        const c = json?.user?.company_name || "";
        if (c) setForm((prev) => ({ ...prev, service_provider: String(c) }));
      })
      .catch(() => { });
  }, [session?.user?.company_name]);



  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addTerminal = () => {
    const value = terminalInput.trim();

    if (!value) return;

    if (!terminalList.includes(value)) {
      const updated = [...terminalList, value];

      setTerminalList(updated);

      setForm({
        ...form,
        terminals: updated,
      });
    }

    setTerminalInput("");
  };

  const removeTerminal = (index: number) => {
    const updated = terminalList.filter((_, i) => i !== index);

    setTerminalList(updated);

    setForm({
      ...form,
      terminals: updated,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage("");

    const res = await fetch(backendProxyPath("/api/parking/product/create"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Error saving product");
      return;
    }

    const newProductId = data.id;

    // ⬇ UPLOAD IMAGE IF SELECTED
    if (selectedImage && newProductId) {
      const formData = new FormData();
      formData.append("image", selectedImage);

      try {
        await fetch(backendProxyPath(`/api/parking/product/update-image/${newProductId}`), {
          method: "PUT",
          body: formData,
        });
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    }

    setMessage("Parking Product added successfully!");

    setForm({
      airport_name: "",
      terminals: [] as string[],
      service_provider: "",
      product_name: "",
      website_display: "Y",
      airport_number: "",
      booking_email: "",
      airport_charges: "",
      operational_from: "",
      operational_to: "",
      book_short_hours: "",
      commission: "",
      product_extra: "",
      nonflex: "",
      service_type: "",
      recommended: "",
      product_description: "",
      product_overview: "",
      dropoff_procedure: "",
      directions: "",
      status: "Active",
      point_1: "",
      point_2: "",
      point_3: "",
      point_4: "",
      point_5: "",
      point_6: "",
    });
  };

  type AirportDropdown = {
    airport_id: number;
    airport_name: string;
    iata_code: string;
  };

  const generateTimeOptions = () => {
    const options: { value: string; label: string }[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of ["00", "15", "30", "45"]) {
        const value = `${String(h).padStart(2, "0")}:${m}`;
        options.push({ value, label: value }); // Label is same as value for 24h format
      }
    }
    return options;
  };

  const TIME_OPTIONS = generateTimeOptions();



  return (
    <ProtectedRoute>
      <div className="w-full min-h-screen px-4 py-8 space-y-8 max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h6 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 leading-none">
              Management
            </h6>
            <h1 className="text-4xl font-black tracking-tight text-foreground leading-none">
              Add New Product
            </h1>
            <p className="text-sm text-muted-foreground mt-3 max-w-lg font-medium">
              Create a new parking inventory item. Define its operational hours, procedures, and service type.
            </p>
          </div>
          <Button
            variant="outline"
            className="h-12 rounded-xl px-6 font-bold flex items-center gap-2 border-border/50 hover:bg-muted/50 transition-all"
            onClick={() => (window.location.href = "/viewProducts")}
          >
            <ArrowLeft size={20} /> Back to Products
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* LEFT COLUMN: BASIC & OPERATIONAL */}
            <div className="xl:col-span-2 space-y-8">
              {/* BASIC DETAILS */}
              <div className="glass border-border/50 rounded-2xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Plus size={18} />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">Basic Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Airport Name *</label>
                    <select
                      name="airport_name"
                      value={form.airport_name}
                      onChange={handleChange}
                      className="h-12 w-full bg-background/50 border-border/50 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    >
                      <option value="">Select Airport</option>
                      {airportList.map((a) => (
                        <option key={a.airport_id} value={a.airport_name}>
                          {a.airport_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Service Provider</label>
                    <Input
                      name="service_provider"
                      value={form.service_provider}
                      readOnly
                      className="h-12 rounded-xl bg-muted/30 border-border/50 font-medium cursor-not-allowed opacity-80"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Product Name *</label>
                    <Input
                      name="product_name"
                      value={form.product_name}
                      onChange={handleChange}
                      placeholder="e.g. Heathrow Meet & Greet Premium"
                      className="h-12 rounded-xl bg-background/50 border-border/50 font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Website Display</label>
                    <select
                      name="website_display"
                      value={form.website_display}
                      onChange={handleChange}
                      className="h-12 w-full bg-background/50 border-border/50 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value="Y">Yes (Y)</option>
                      <option value="N">No (N)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Airport Number</label>
                    <Input
                      name="airport_number"
                      value={form.airport_number}
                      onChange={handleChange}
                      placeholder="Operational contact number"
                      className="h-12 rounded-xl bg-background/50 border-border/50 font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Booking Email *</label>
                    <Input
                      type="email"
                      name="booking_email"
                      value={form.booking_email}
                      onChange={handleChange}
                      placeholder="confirmation@provider.com"
                      className="h-12 rounded-xl bg-background/50 border-border/50 font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                      Airport Terminals
                    </label>

                    <div className="rounded-2xl border border-border/50 bg-background/50 p-4">

                      <div className="flex flex-wrap gap-2 mb-4">
                        {terminalList.map((terminal, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-full text-sm font-medium"
                          >
                            {terminal}

                            <button
                              type="button"
                              onClick={() => removeTerminal(index)}
                              className="text-white hover:text-red-200"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>

                      <Input
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder="Type Terminal Name and press Enter"
                        className="h-12 rounded-xl"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTerminal();
                          }
                        }}
                      />

                      <p className="text-xs text-muted-foreground mt-2">
                        Example: Terminal 1 ↵ Terminal 2 ↵ Terminal 3 ↵
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OPERATIONAL DETAILS */}
              <div className="glass border-border/50 rounded-2xl p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <Clock size={18} />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">Operational Hours</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Opening Time</label>
                    <div className="relative">
                      <select
                        name="operational_from"
                        value={form.operational_from}
                        onChange={handleChange}
                        className="h-12 w-full bg-background/50 border-border/50 rounded-xl px-4 pl-11 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                      >
                        <option value="">Select Time</option>
                        {TIME_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Closing Time</label>
                    <div className="relative">
                      <select
                        name="operational_to"
                        value={form.operational_to}
                        onChange={handleChange}
                        className="h-12 w-full bg-background/50 border-border/50 rounded-xl px-4 pl-11 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                      >
                        <option value="">Select Time</option>
                        {TIME_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Service Type</label>
                    <select
                      name="service_type"
                      value={form.service_type}
                      onChange={handleChange}
                      className="h-12 w-full bg-background/50 border-border/50 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value="">Select Type</option>
                      <option value="Meet & Greet">Meet & Greet</option>
                      <option value="Park & Ride">Park & Ride</option>
                      <option value="Self Park">Self Park</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Flexibility</label>
                    <select
                      name="nonflex"
                      value={form.nonflex}
                      onChange={handleChange}
                      className="h-12 w-full bg-background/50 border-border/50 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                      <option value="">Select Flexibility</option>
                      <option value="Refundable">Refundable</option>
                      <option value="Non-Refundable">Non-Refundable</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CONTENT & SUMMARY */}
            <div className="space-y-8">

              {/* STATUS SUMMARY */}
              <div className="glass border-border/50 rounded-2xl p-8 shadow-sm bg-primary/5 space-y-6">
                <div className="space-y-2 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">Status</p>
                  <p className="text-2xl font-black text-foreground">Ready to Save</p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Create Product
                </Button>
                {message && (
                  <p className={cn("text-center text-xs font-bold p-3 rounded-xl", message.includes("success") ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600")}>
                    {message}
                  </p>
                )}
              </div>

              {/* MEDIA / IMAGE UPLOAD */}
              <div className="glass border-border/50 rounded-2xl p-8 shadow-sm space-y-6">
                <h3 className="text-sm font-black tracking-widest uppercase text-muted-foreground">Product Media</h3>

                <div className="space-y-4">
                  <div
                    className="aspect-video w-full rounded-2xl border-2 border-dashed border-border/50 bg-background/50 flex flex-col items-center justify-center overflow-hidden group relative cursor-pointer hover:border-primary/50 transition-all"
                    onClick={() => document.getElementById('image-upload-input')?.click()}
                  >
                    {previewImage ? (
                      <>
                        <img src={previewImage} className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="secondary" size="sm" className="font-bold">Replace Image</Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-muted-foreground group-hover:text-primary transition-colors">
                        <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center">
                          <Plus size={24} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-black uppercase tracking-widest">Upload Product Image</p>
                          <p className="text-[10px] font-medium mt-1">Click or drag and drop</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="image-upload-input"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedImage(file);
                        setPreviewImage(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {previewImage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 rounded-lg"
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewImage(null);
                      }}
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCT FEATURES (6 POINTS) */}
          <div className="glass border-border/50 rounded-2xl p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border/50 pb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Check size={18} />
              </div>
              <h3 className="text-lg font-black tracking-tight">Product Features</h3>
              <p className="text-xs text-muted-foreground font-medium ml-2">(Displayed as highlights on the website)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Point {num}</label>
                    <span className="text-[9px] font-bold text-muted-foreground/40">{(form as any)[`point_${num}`]?.length || 0}/50</span>
                  </div>
                  <div className="relative group">
                    <Input
                      name={`point_${num}`}
                      value={(form as any)[`point_${num}`]}
                      onChange={handleChange}
                      placeholder="Features..."
                      maxLength={50}
                      className="h-12 rounded-xl bg-background/50 border-border/50 font-medium pl-10 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FULL WIDTH: RICH TEXT SECTIONS */}
          <div className="glass border-border/50 rounded-3xl p-8 shadow-sm space-y-10 bg-background/50">
            <div className="grid grid-cols-1 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Product Description *</label>
                <div className="rounded-2xl overflow-hidden border border-border/50 shadow-inner h-[300px]">
                  <RichTextEditor
                    value={form.product_description || ""}
                    onChange={(val) => setForm({ ...form, product_description: val })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Product Overview Popup</label>
                <div className="rounded-2xl overflow-hidden border border-border/50 shadow-inner h-[300px]">
                  <RichTextEditor
                    value={form.product_overview || ""}
                    onChange={(val) => setForm({ ...form, product_overview: val })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Drop-off Procedure *</label>
                <div className="rounded-2xl overflow-hidden border border-border/50 shadow-inner h-[300px]">
                  <RichTextEditor
                    value={form.dropoff_procedure || ""}
                    onChange={(val) => setForm({ ...form, dropoff_procedure: val })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Directions *</label>
                <div className="rounded-2xl overflow-hidden border border-border/50 shadow-inner h-[300px]">
                  <RichTextEditor
                    value={form.directions || ""}
                    onChange={(val) => setForm({ ...form, directions: val })}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}