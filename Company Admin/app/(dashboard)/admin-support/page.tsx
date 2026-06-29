"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Download,
  X,
  Paperclip,
  Loader2,
  Calendar,
  Shield,
  Search,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Ticket {
  id: number;
  ticket_no: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  attachment: string | null;
}

interface ChatMessage {
  id: number;
  sender_type: "company_admin" | "super_admin";
  message: string;
  attachments: string | null;
  created_at: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const FILE_BASE = API_BASE.replace('/api', ''); // Removes /api if it exists to get the server root

export default function AdminSupport() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newTicketFileRef = useRef<HTMLInputElement>(null);

  // New Ticket Form State
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState("Medium");
  const [creating, setCreating] = useState(false);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/session/me", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data);
        if (data?.user?.company_id || data?.company_id) {
          // Trigger fetch in next effect
        }
      });
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchTickets();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`/api/backend/api/admin-support/tickets`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: number) => {
    try {
      const res = await fetch(`/api/backend/api/admin-support/tickets/${ticketId}/chat`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedTicket || (!newMessage.trim() && !fileInputRef.current?.files?.length)) return;

    setSending(true);
    const formData = new FormData();
    formData.append("message", newMessage);
    formData.append("senderType", "company_admin");
    formData.append("senderId", currentUser?.user?.id || currentUser?.id || 1);
    
    if (fileInputRef.current?.files) {
      for (const file of fileInputRef.current.files) {
        formData.append("attachments", file);
      }
    }

    try {
      const res = await fetch(`/api/backend/api/admin-support/tickets/${selectedTicket.id}/chat`, {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchMessages(selectedTicket.id);
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    const formData = new FormData();
    formData.append("subject", newSubject);
    formData.append("message", newDescription);
    formData.append("priority", newPriority);
    formData.append("companyId", currentUser?.user?.company_id || currentUser?.company_id || 1);
    formData.append("customer_name", currentUser?.name || "Company Admin");
    formData.append("customer_email", currentUser?.email || "admin@example.com");

    if (newTicketFileRef.current?.files) {
      for (const file of newTicketFileRef.current.files) {
        formData.append("attachments", file);
      }
    }

    try {
      const res = await fetch(`/api/backend/api/admin-support/tickets`, {
        method: "POST",
        credentials: "include",
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setShowNewModal(false);
        setNewSubject("");
        setNewDescription("");
        fetchTickets();
      }
    } catch (error) {
      console.error("Failed to create ticket", error);
    } finally {
      setCreating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "in progress": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "resolved": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-400";
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.ticket_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-140px)] w-full gap-6 p-1">
      {/* Sidebar - Ticket List */}
      <div className="flex w-1/3 flex-col rounded-2xl border bg-white shadow-sm dark:bg-slate-800/50 backdrop-blur-xl">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Admin Support</h1>
            <Button size="sm" className="rounded-xl gap-2 h-10 px-4" onClick={() => setShowNewModal(true)}>
              <Plus size={18} />
              New Ticket
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search tickets..." 
              className="pl-10 h-10 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-4 opacity-10" />
              <p className="text-sm">No support tickets found.</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <motion.div
                layout
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={cn(
                  "p-4 rounded-xl cursor-pointer transition-all border border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 group",
                  selectedTicket?.id === ticket.id ? "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800" : ""
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground group-hover:text-blue-500 transition-colors">
                    {ticket.ticket_no}
                  </span>
                  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold", getStatusColor(ticket.status))}>
                    {ticket.status}
                  </span>
                </div>
                <h3 className="font-semibold text-sm line-clamp-1 mb-1">{ticket.subject}</h3>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                   <div className="flex items-center gap-1">
                     <Calendar size={12} />
                     {new Date(ticket.created_at).toLocaleDateString()}
                   </div>
                   <div className={cn(
                     "w-1.5 h-1.5 rounded-full",
                     ticket.priority === 'High' || ticket.priority === 'Urgent' ? 'bg-rose-500' : 'bg-blue-400'
                   )} />
                   {ticket.priority}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col rounded-2xl border bg-white shadow-sm dark:bg-slate-800/50 backdrop-blur-xl overflow-hidden relative">
        {selectedTicket ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b bg-white dark:bg-slate-800/50 z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Shield size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">{selectedTicket.subject}</h2>
                  <p className="text-xs text-muted-foreground">Ticket No: {selectedTicket.ticket_no}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", getStatusColor(selectedTicket.status))}>
                    {selectedTicket.status}
                  </span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Original Message */}
              <div className="flex gap-4 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs">
                   <UserIcon size={14} />
                </div>
                <div className="space-y-2">
                  <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-2xl rounded-tl-none">
                    <p className="text-sm whitespace-pre-wrap">{selectedTicket.message}</p>
                    {selectedTicket.attachment && (
                       <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600 grid grid-cols-1 gap-2">
                         {JSON.parse(selectedTicket.attachment).map((file: string, idx: number) => (
                           <a 
                             key={idx} 
                             href={`${FILE_BASE}${file}`} 
                             target="_blank" 
                             className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 text-xs hover:text-blue-500 transition-colors border"
                           >
                              <FileText size={14} />
                              <span className="flex-1 truncate">{file.split('/').pop()}</span>
                              <Download size={14} />
                           </a>
                         ))}
                       </div>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground ml-2">
                    {new Date(selectedTicket.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {messages.map((msg) => {
                const isAdmin = msg.sender_type === "company_admin";
                return (
                  <div key={msg.id} className={cn("flex gap-4 max-w-[80%]", isAdmin ? "ml-auto flex-row-reverse" : "")}>
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      isAdmin ? "bg-blue-500 text-white" : "bg-slate-900 text-white"
                    )}>
                       {isAdmin ? <UserIcon size={14} /> : <Shield size={14} />}
                    </div>
                    <div className={cn("space-y-2", isAdmin ? "text-right" : "")}>
                      <div className={cn(
                        "p-4 rounded-2xl",
                        isAdmin 
                          ? "bg-blue-500 text-white rounded-tr-none shadow-lg shadow-blue-500/10" 
                          : "bg-slate-100 dark:bg-slate-700/50 rounded-tl-none"
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        {msg.attachments && (
                           <div className={cn(
                             "mt-3 pt-3 border-t grid grid-cols-1 gap-2",
                             isAdmin ? "border-blue-400" : "border-slate-200 dark:border-slate-600"
                           )}>
                             {JSON.parse(msg.attachments).map((file: string, idx: number) => (
                               <a 
                                 key={idx} 
                                 href={`${FILE_BASE}${file}`} 
                                 target="_blank" 
                                 className={cn(
                                   "flex items-center gap-2 p-2 rounded-lg text-xs transition-colors border",
                                   isAdmin 
                                     ? "bg-blue-600 border-blue-400 hover:bg-blue-700 text-blue-100" 
                                     : "bg-white dark:bg-slate-800 hover:text-blue-500"
                                 )}
                               >
                                  <FileText size={14} />
                                  <span className="flex-1 truncate">{file.split('/').pop()}</span>
                                  <Download size={14} />
                               </a>
                             ))}
                           </div>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground mr-2">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t bg-white dark:bg-slate-800/80 backdrop-blur-md">
               <form onSubmit={handleSendMessage} className="space-y-4">
                  <div className="relative group">
                    <textarea 
                      placeholder="Type a message..."
                      className="w-full min-h-[100px] p-4 pr-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-inner"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="absolute right-3 bottom-3 flex items-center gap-2">
                      <input 
                        type="file" 
                        multiple 
                        className="hidden" 
                        ref={fileInputRef}
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
                      <button 
                         type="button"
                         onClick={() => fileInputRef.current?.click()}
                         className="p-2 text-muted-foreground hover:text-blue-500 transition-colors rounded-lg hover:bg-white dark:hover:bg-slate-800"
                      >
                        <Paperclip size={20} />
                      </button>
                      <button 
                        type="submit"
                        disabled={sending || (!newMessage.trim() && !fileInputRef.current?.files?.length)}
                        className="p-2.5 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-50 transition-all active:scale-95"
                      >
                        {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                      </button>
                    </div>
                  </div>
               </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-12">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-6 text-slate-300">
               <Shield size={48} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">Resolution Center</h2>
            <p className="text-muted-foreground max-w-sm">
              Select a ticket from the list or create a new one to communicate with the system administrator.
            </p>
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNewModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                 <div>
                   <h2 className="text-2xl font-bold tracking-tight">Create Support Ticket</h2>
                   <p className="text-sm text-muted-foreground">Explain your issue and a Super Admin will respond shortly.</p>
                 </div>
                 <button onClick={() => setShowNewModal(false)} className="p-2 text-muted-foreground hover:text-slate-900 dark:hover:text-white transition-colors">
                   <X size={24} />
                 </button>
              </div>

              <form onSubmit={handleCreateTicket} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Subject</label>
                    <Input 
                      placeholder="Brief summary of the issue"
                      className="h-12 rounded-xl"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Description</label>
                    <textarea 
                      placeholder="Detailed explanation of what's happening..."
                      className="w-full min-h-[120px] p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Priority</label>
                      <select 
                        className="w-full h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border px-3 outline-none"
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Attachments</label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full h-12 rounded-xl gap-2 text-muted-foreground"
                        onClick={() => newTicketFileRef.current?.click()}
                      >
                        <Paperclip size={16} />
                        Add Files
                        <input type="file" multiple className="hidden" ref={newTicketFileRef} accept=".jpg,.jpeg,.png,.pdf" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl" onClick={() => setShowNewModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating} className="flex-1 h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold">
                    {creating ? <Loader2 className="animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                    Create Ticket
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
