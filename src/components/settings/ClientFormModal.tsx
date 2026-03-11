import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Cliente } from '../../types';
import { X, Save, Building2, User, Mail, Phone, Briefcase, FileCode2, Loader2 } from 'lucide-react';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente?: Cliente | null;
  onSuccess: () => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({ isOpen, onClose, cliente, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cnpj: '',
    telefone: '',
    setor: '',
    pontoFocal: ''
  });

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        email: cliente.email || '',
        cnpj: cliente.cnpj || '',
        telefone: cliente.telefone || '',
        setor: cliente.setor || '',
        pontoFocal: cliente.pontoFocal || ''
      });
    } else {
      setFormData({ nome: '', email: '', cnpj: '', telefone: '', setor: '', pontoFocal: '' });
    }
  }, [cliente, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (cliente) {
        // Atualizar
        const { error } = await supabase
          .from('Clientes')
          .update({
            nome: formData.nome,
            email: formData.email,
            cnpj: formData.cnpj,
            telefone: formData.telefone,
            setor: formData.setor,
            pontoFocal: formData.pontoFocal,
            updatedAt: new Date().toISOString()
          })
          .eq('id', cliente.id);

        if (error) throw error;
      } else {
        // Criar
        const { error } = await supabase
          .from('Clientes')
          .insert([{
            nome: formData.nome,
            email: formData.email,
            cnpj: formData.cnpj,
            telefone: formData.telefone,
            setor: formData.setor,
            pontoFocal: formData.pontoFocal
          }]);

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Building2 className="text-indigo-600" />
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Razão Social / Nome <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  type="text"
                  placeholder="Nome da empresa"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                CNPJ
              </label>
              <div className="relative">
                <FileCode2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  type="text"
                  placeholder="00.000.000/0001-00"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300"> E-mail </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="contato@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300"> Telefone </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  type="text"
                  placeholder="(00) 0000-0000"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300"> Setor/Indústria </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="setor"
                  value={formData.setor}
                  onChange={handleChange}
                  type="text"
                  placeholder="Tecnologia, Logística..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300"> Ponto Focal </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  name="pontoFocal"
                  value={formData.pontoFocal}
                  onChange={handleChange}
                  type="text"
                  placeholder="Nome do contato principal"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-600 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {loading ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
