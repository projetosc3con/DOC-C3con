import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  ListTodo,
  Users,
  Plus,
  Search,
  Trash2,
  Edit2,
  ChevronRight,
  Building2,
  Mail,
  Phone
} from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Cliente } from '../types';
import { ClientFormModal } from '../components/settings/ClientFormModal';
import { ListEntryFormModal } from '../components/settings/ListEntryFormModal';

type SettingsTab = 'phases' | 'classification' | 'hiring' | 'clients';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('phases');
  const [listItems, setListItems] = useState<string[]>([]);
  const [mappedItems, setMappedItems] = useState<{ id: string | number; name: string; description: string; color: string }[]>([]);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [editingItemName, setEditingItemName] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | number | null>(null);

  const listConfig: Record<string, { tableKey: string, label: string }> = {
    phases: { tableKey: 'Fases de projeto', label: 'Fase' },
    classification: { tableKey: 'Classificações', label: 'Classificação' },
    hiring: { tableKey: 'Contratações', label: 'Contratação' }
  };

  const tabs = [
    { id: 'phases', label: 'Fases de projeto', icon: Layers },
    { id: 'classification', label: 'Classificações', icon: ListTodo },
    { id: 'hiring', label: 'Contratações', icon: Layers },
    { id: 'clients', label: 'Clientes Cadastrados', icon: Users },
  ];

  const fetchListFromSupabase = async (tab: string) => {
    if (!listConfig[tab]) return;
    try {
      const { data, error } = await supabase
        .from('Listas')
        .select('itens')
        .eq('nomeLista', listConfig[tab].tableKey)
        .single();

      if (error) throw error;

      if (data && data.itens) {
        setListItems(data.itens);
        const colors = ['bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-slate-500', 'bg-rose-500', 'bg-violet-500'];
        const mapped = data.itens.map((item: string, index: number) => ({
          id: item, // Use the name as ID for stability
          name: item,
          description: `Parâmetro de ${listConfig[tab].label.toLowerCase()} definido como ${item}.`,
          color: colors[index % colors.length]
        }));
        setMappedItems(mapped);
      }
    } catch (err) {
      console.error(`Erro ao buscar ${tab}:`, err);
    }
  };

  useEffect(() => {
    if (listConfig[activeTab]) {
      setConfirmDelete(null);
      fetchListFromSupabase(activeTab);
    } else {
      setConfirmDelete(null);
    }
  }, [activeTab]);

  const updateListInSupabase = async (newItens: string[]) => {
    const config = listConfig[activeTab];
    if (!config) return;
    try {
      const { error } = await supabase
        .from('Listas')
        .update({ itens: newItens, updatedAt: new Date().toISOString() })
        .eq('nomeLista', config.tableKey);
      if (error) throw error;
      await fetchListFromSupabase(activeTab);
    } catch (err) {
      console.error(`Erro ao salvar ${activeTab}:`, err);
      alert('Erro ao salvar alterações.');
    }
  };

  const handleItemSave = async (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    // Converte para minúsculas apenas para comparação, para evitar duplicatas indiferentes a caixa
    const itemExists = listItems.some(item => item.toLowerCase() === trimmed.toLowerCase());

    if (editingItemName) {
      if (editingItemName === trimmed) {
        setIsListModalOpen(false);
        return;
      }
      
      if (itemExists && editingItemName.toLowerCase() !== trimmed.toLowerCase()) {
        alert('Este item já existe.');
        return;
      }
      const newItens = listItems.map(p => p === editingItemName ? trimmed : p);
      await updateListInSupabase(newItens);
    } else {
      if (itemExists) {
        alert('Este item já existe.');
        return;
      }
      await updateListInSupabase([...listItems, trimmed]);
    }
    
    setIsListModalOpen(false);
    setEditingItemName(null);
  };

  const handleCreateItem = () => {
    setEditingItemName(null);
    setIsListModalOpen(true);
  };

  const handleEditItem = (name: string) => {
    setEditingItemName(name);
    setIsListModalOpen(true);
  };

  const handleDeleteItem = async (itemName: string) => {
    setConfirmDelete(null);
    const newItens = listItems.filter(p => p !== itemName);
    await updateListInSupabase(newItens);
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('Clientes')
        .select('*')
        .order('nome');

      if (error) throw error;
      if (data) setClients(data as Cliente[]);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'clients') {
      fetchClients();
    }
  }, [activeTab]);

  const handleDeleteClient = async (id: string) => {
    try {
      const { error } = await supabase.from('Clientes').delete().eq('id', id);
      if (error) throw error;
      setClients(clients.filter(c => c.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      alert('Erro ao excluir cliente.');
    }
  };

  const handleCreateNew = () => {
    if (activeTab === 'clients') {
      setEditingClient(null);
      setIsClientModalOpen(true);
    } else if (listConfig[activeTab]) {
      handleCreateItem();
    } else {
      alert('Novo registro para esta aba estará disponível em breve.');
    }
  };



  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Configurações"
        subtitle="Gerencie os parâmetros globais do sistema e cadastros base."
      />

      <div className="p-4 sm:p-8 space-y-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-zinc-800/50 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={`Buscar ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
              />
            </div>
            <button
               onClick={handleCreateNew} 
               className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus size={18} />
              <span>Novo Registro</span>
            </button>
          </div>

          <div className="p-0">
            <AnimatePresence mode="wait">
              {(activeTab === 'phases' || activeTab === 'classification' || activeTab === 'hiring') && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="divide-y divide-slate-100 dark:divide-zinc-800"
                >
                  {mappedItems.map((item) => (
                    <div key={item.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={cn("w-3 h-12 rounded-full", item.color)} />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-slate-100">{item.name}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AnimatePresence mode="wait">
                          {confirmDelete === item.id ? (
                            <motion.div
                              key="confirm"
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center gap-2"
                            >
                              <span className="text-[10px] font-black uppercase text-red-600 mr-2">Tem certeza?</span>
                              <button
                                onClick={() => handleDeleteItem(item.name)}
                                className="px-3 py-1 bg-red-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                              >
                                Sim
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 rounded-md text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                              >
                                Não
                              </button>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="actions"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <button 
                                onClick={() => handleEditItem(item.name)}
                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => setConfirmDelete(item.id)}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}



              {activeTab === 'clients' && (
                <motion.div
                  key="clients"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
                >
                    {clients.map((client) => (
                      <div key={client.id} className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-indigo-600/50 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-lg flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 dark:border-zinc-700">
                            <Building2 size={24} />
                          </div>
                          <div className="flex items-center gap-1 min-h-[32px]">
                            <AnimatePresence mode="wait">
                              {confirmDelete === client.id ? (
                                <motion.div
                                  key="confirm"
                                  initial={{ opacity: 0, x: 5 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 5 }}
                                  className="flex items-center gap-1"
                                >
                                  <button
                                    onClick={() => handleDeleteClient(client.id)}
                                    className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-black uppercase tracking-tighter hover:bg-red-700"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="px-2 py-1 bg-slate-200 dark:bg-zinc-700 text-slate-600 dark:text-slate-400 rounded text-[10px] font-black uppercase tracking-tighter"
                                  >
                                    Não
                                  </button>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="actions"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center gap-1"
                                >
                                  <button 
                                    onClick={() => { setEditingClient(client); setIsClientModalOpen(true); }}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => setConfirmDelete(client.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{client.nome}</h4>
                        <p className="text-xs font-bold text-indigo-600 uppercase mb-4">{client.setor || 'Sem setor listado'}</p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Mail size={14} />
                            <span className="truncate">{client.email || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Phone size={14} />
                            <span>{client.telefone || '—'}</span>
                          </div>
                        </div>

                        <button className="mt-6 w-full py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2">
                          Ver Projetos
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
    </div>

    <ListEntryFormModal
      isOpen={isListModalOpen}
      onClose={() => setIsListModalOpen(false)}
      title={listConfig[activeTab]?.label || 'Registro'}
      label={listConfig[activeTab]?.label || 'Nome'}
      initialValue={editingItemName || ''}
      onSave={handleItemSave}
    />

    <ClientFormModal
      isOpen={isClientModalOpen}
      onClose={() => setIsClientModalOpen(false)}
      cliente={editingClient}
      onSuccess={() => {
        setIsClientModalOpen(false);
        fetchClients();
      }}
    />
  </div>
);
};
