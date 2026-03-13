import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Users,
  Zap,
  Mail,
  MessageSquare,
  Phone,
  ShieldCheck,
  Globe,
  Sun,
  Moon,
  Instagram
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logoImg from '../assets/logo.png';
import screenshot1 from '../assets/doc-screenshot-1.jpg';
import screenshot2 from '../assets/doc-screenshot-2.jpg';
import screenshot3 from '../assets/doc-screenshot-3.jpg';
import screenshot4 from '../assets/doc-screenshot-4.jpg';
import screenshot5 from '../assets/doc-screenshot-5.jpg';
import screenshot6 from '../assets/doc-screenshot-6.jpg';
import screenshot7 from '../assets/doc-screenshot-7.jpg';
import screenshot8 from '../assets/doc-screenshot-8.jpg';
import screenshot9 from '../assets/doc-screenshot-9.jpg';
import { X, Maximize2 } from 'lucide-react';

export const LandingPage = () => {
  const { session, loading } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const screenshots = [screenshot1, screenshot4, screenshot5];
  const allScreenshots = [
    screenshot9, screenshot6, screenshot7, screenshot8
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [visionImageIndex, setVisionImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    empresa: '',
    mensagem: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % screenshots.length);
    }, 10000);
    const visionTimer = setInterval(() => {
      setVisionImageIndex((prevIndex) => (prevIndex + 1) % allScreenshots.length);
    }, 8000);
    return () => {
      clearInterval(timer);
      clearInterval(visionTimer);
    };
  }, [screenshots.length, allScreenshots.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Obrigado pelo contato! Nossa equipe retornará em breve.');
    setFormData({ ...formData, mensagem: '' });
  };

  const scrollToContact = () => {
    document.getElementById('contato')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!loading && session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 selection:bg-indigo-100 dark:selection:bg-indigo-900/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between h-20 sm:h-auto">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-slate-100 dark:border-zinc-800 p-0.5">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight uppercase leading-tight text-slate-900 dark:text-white">Doc</h2>
              <p className="text-[10px] font-medium text-indigo-600 tracking-tighter">Project Management</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-indigo-600 transition-colors border border-slate-200 dark:border-zinc-700"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link
              to="/login"
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors px-4 py-2 bg-slate-100/50 dark:bg-zinc-800/50 rounded-lg border border-slate-200/50 dark:border-zinc-700/50"
            >
              Acessar Sistema
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100 dark:border-indigo-800/30">
                <Zap className="w-3 h-3" />
                Gestão Ágil e Profissional
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[0.9] mb-6">
                Transforme sua Gestão de Projetos com o <span className="text-indigo-600">DOC</span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-zinc-400 mb-10 leading-relaxed max-w-xl">
                Software focado em entregar resultados reais seguindo os padrões globais do PMBOK. Centralize processos, otimize recursos e tenha visão analítica em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToContact}
                  className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 group"
                >
                  Solicitar Demonstração
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-4 px-6 py-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-slate-200 dark:bg-zinc-800" />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-500 dark:text-zinc-500">+10 Empresas Gerenciadas</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-2xl -m-4 blur-3xl" />
              <div className="relative bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl aspect-[16/10] overflow-hidden shadow-2xl">
                {/* Mockup */}
                <div className="w-full h-full flex flex-col">
                  <div className="bg-white dark:bg-zinc-800 h-8 border-b border-slate-200 dark:border-zinc-700 flex items-center px-4 gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <div className="w-2 h-2 rounded-full bg-yellow-400" />
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-zinc-950">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        <img
                          src={screenshots[currentImageIndex]}
                          alt={`DOC System Screenshot ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover object-top"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {/* Carousel Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {screenshots.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-indigo-600 w-4' : 'bg-slate-300 dark:bg-zinc-600'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="py-24 bg-white dark:bg-zinc-900/50">
          <div className="max-w-7xl mx-auto px-4 text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-black mb-6 uppercase tracking-tight">Excelência em <span className="text-indigo-600">Gestão Profissional</span></h2>
            <p className="text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
              Desenvolva projetos com alto nível de maturidade e controle total sobre prazos e custos através do método DOC.
            </p>
          </div>

          <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="text-amber-500" />,
                title: "Implantação Ágil",
                desc: "Comece a gerenciar seus projetos em poucos minutos com nossa interface intuitiva."
              },
              {
                icon: <Clock className="text-blue-500" />,
                title: "Tempo Real",
                desc: "Acompanhe o progresso físico e financeiro conforme os dados são inseridos."
              },
              {
                icon: <BarChart3 className="text-indigo-500" />,
                title: "BI Integrado",
                desc: "Dashboards analíticos nativos para tomada de decisão baseada em dados reais."
              },
              {
                icon: <ShieldCheck className="text-emerald-500" />,
                title: "Compliance PMBOK",
                desc: "Processos alinhados com as melhores práticas globais de gestão."
              }
            ].map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: idx * 0.15,
                  ease: "easeOut"
                }}
                whileHover={{ y: -10, transition: { delay: 0, duration: 0.2 } }}
                className="p-8 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:border-indigo-500/20 transition-all cursor-default"
              >
                <div className="w-12 h-12 bg-slate-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-6 border border-slate-100 dark:border-zinc-700">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-24 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-7xl mx-auto overflow-hidden bg-indigo-600 rounded-[2.5rem] relative"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
              <Globe className="w-full h-full scale-110 translate-x-1/2 -rotate-12" />
            </div>
            <div className="relative p-12 lg:p-20 grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 leading-tight uppercase tracking-tight">
                  Visão Analítica para <br />Negócios Complexos
                </h2>
                <div className="space-y-6">
                  {[
                    "Gestão de Milestones integrada ao Gantt",
                    "Todas as informações do projeto em um só lugar",
                    "Crie e atribua fluxos para o avanço de marcos",
                    "Acompanhe todo o histórico do projeto"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-indigo-100 font-bold">
                      <CheckCircle2 className="w-6 h-6 text-indigo-300 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-2xl -m-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 aspect-video shadow-2xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={visionImageIndex}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.7 }}
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => setSelectedImage(allScreenshots[visionImageIndex])}
                    >
                      <img
                        src={allScreenshots[visionImageIndex]}
                        alt={`DOC Visualization ${visionImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white">
                          <Maximize2 className="w-6 h-6" />
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Thumbnails Navigator */}
                  <div className="absolute bottom-4 left-0 right-0 px-4 flex justify-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    {allScreenshots.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setVisionImageIndex(idx);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 shrink-0 ${idx === visionImageIndex ? 'bg-white w-4' : 'bg-white/30'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Contact Form */}
        <section id="contato" className="py-24 px-4 bg-slate-50 dark:bg-zinc-950">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">Entre em Contato</h2>
              <p className="text-slate-500 dark:text-zinc-400 font-medium">Nosso time de consultores entrará em contato para agendar uma demonstração personalizada do sistema DOC.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.a
                href="mailto:projetosc3con@gmail.com"
                whileHover={{ y: -8, scale: 1.02 }}
                className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-shadow cursor-pointer group"
              >
                <Mail className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">E-mail</span>
                <span className="font-bold text-sm">projetosc3con@gmail.com</span>
              </motion.a>

              <motion.a
                href="https://wa.me/5567992683370"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -8, scale: 1.02 }}
                className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-shadow cursor-pointer group"
              >
                <Phone className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Atendimento</span>
                <span className="font-bold text-sm">(67) 99268-3370</span>
              </motion.a>

              <motion.a
                href="https://instagram.com/c3con"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -8, scale: 1.02 }}
                className="flex flex-col items-center p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-shadow cursor-pointer group"
              >
                <Instagram className="text-indigo-600 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Instagram</span>
                <span className="font-bold text-sm">@c3con</span>
              </motion.a>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 p-8 lg:p-12 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-xl"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">Nome Completo</label>
                  <input
                    required
                    type="text"
                    value={formData.nome}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Seu nome"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">E-mail Corporativo</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                    className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">Empresa / Organização</label>
                <input
                  required
                  type="text"
                  value={formData.empresa}
                  onChange={e => setFormData({ ...formData, empresa: e.target.value })}
                  placeholder="Nome da companhia"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                />
              </div>
              <div className="space-y-2 mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-500">Como podemos ajudar?</label>
                <textarea
                  required
                  value={formData.mensagem}
                  onChange={e => setFormData({ ...formData, mensagem: e.target.value })}
                  rows={4}
                  placeholder="Conte-nos brevemente sobre seus desafios"
                  className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg active:scale-[0.98]"
              >
                Enviar Solicitação
              </button>
            </motion.form>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-100 dark:bg-zinc-900 rounded p-0.5 border border-slate-200/50">
              <img src={logoImg} alt="logo" className="w-full h-full object-contain grayscale opacity-50" />
            </div>
            <span className="font-black text-xs tracking-tighter uppercase text-slate-900 dark:text-white">
              DOC <span className="text-indigo-600">Management</span>
            </span>
          </div>
          <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-600 tracking-widest">© 2026 DOC Project Management. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">Privacidade</a>
            <a href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600">Termos</a>
          </div>
        </div>
      </footer>

      {/* Lightbox / Zoom Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative max-w-7xl w-full max-h-full flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Zoomed Screenshot"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors border border-white/20"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
