import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Trash2, Sparkles, BookOpen, 
  FileText, GraduationCap, AlertCircle, RefreshCw,
  HelpCircle, ClipboardList, Lightbulb
} from 'lucide-react';
import { aiService } from '../services/aiService';

export default function AITutor({ subject, category, lesson, difficulty, lessonId, selectedPart, triggerPrompt, setTriggerPrompt }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your **SciLearn AI Tutor** for today's lesson: **${lesson}**. 

I have loaded the lesson context and am ready to assist. Ask me a question, or click any of the **Quick Actions** below to get started!`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const chatEndRef = useRef(null);

  // Trigger prompt programmatically (from other studio panels)
  useEffect(() => {
    if (triggerPrompt) {
      handleSendMessage(triggerPrompt);
      if (setTriggerPrompt) {
        setTriggerPrompt('');
      }
    }
  }, [triggerPrompt, setTriggerPrompt]);

  // Auto-scroll to the bottom of the chat when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend, actionType = '') => {
    if (!textToSend.trim()) return;

    // 1. Add user message
    const userMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    // 2. Call AI service
    try {
      const context = { subject, category, lesson, difficulty, lessonId, selectedPart, history: messages };
      const aiResponseText = await aiService.askTutor(context, textToSend, actionType);
      
      const aiMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('[AITutor] Error generating response:', err);
      setError('Connection timeout. Please check your internet or proxy and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    handleSendMessage(input);
  };

  const handleQuickAction = (actionLabel, actionType) => {
    if (loading) return;
    const promptText = `Quick Action: Run "${actionLabel}" for this lesson.`;
    handleSendMessage(promptText, actionType);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: `Chat cleared! How can I help you with **${lesson}** now?`,
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  // Dynamic suggested prompts based on the active lesson
  const getSuggestedPrompts = () => {
    if (lessonId === 'heart') {
      return [
        { label: "Why 4 chambers?", query: "Why does the heart have four chambers?" },
        { label: "Role of myocardium?", query: "Explain the role and function of the myocardium." },
        { label: "How do valves work?", query: "How do heart valves prevent backflow?" }
      ];
    }
    if (lessonId === 'brain-cns') {
      return [
        { label: "What is cerebellum?", query: "What does the cerebellum do?" },
        { label: "How neurons interact?", query: "Explain how neurons communicate across synapses." },
        { label: "Blood-brain barrier?", query: "What is the blood-brain barrier?" }
      ];
    }
    if (lessonId === 'stomach-digestive-process') {
      return [
        { label: "Why gastric acid?", query: "What does stomach acid do and why is it highly acidic?" },
        { label: "How pepsin works?", query: "Explain how pepsin aids in protein digestion." },
        { label: "Protection from self-digestion?", query: "How does the stomach protect itself from self-digestion?" }
      ];
    }
    if (lessonId === 'plant-cell-structure') {
      return [
        { label: "Why cell wall?", query: "Why do plant cells have a cell wall?" },
        { label: "Role of chloroplast?", query: "What is a chloroplast?" },
        { label: "Function of vacuole?", query: "What is the function of the vacuole?" }
      ];
    }
    if (lessonId === 'velocity-accel') {
      return [
        { label: "Velocity vs Speed?", query: "What is the difference between velocity and speed?" },
        { label: "Explain acceleration?", query: "What does acceleration mean in physics?" },
        { label: "How graphs relate?", query: "How are displacement, velocity, and acceleration graphs related to each other?" }
      ];
    }
    if (lessonId === 'newtons-laws') {
      return [
        { label: "Explain Law 1 (Inertia)", query: "Explain Newton's First Law of Motion and give a real-world example." },
        { label: "How F=ma works", query: "Explain Newton's Second Law of Motion (F=ma) and how altering mass affects acceleration." },
        { label: "Explain Law 3 Pairs", query: "Explain Newton's Third Law of Motion (Action & Reaction) with rocket thrust as an example." }
      ];
    }
    if (lessonId === 'friction-drag') {
      return [
        { label: "Static vs Kinetic?", query: "What is the difference between static and kinetic friction?" },
        { label: "Friction calculation?", query: "How do you calculate friction forces using normal force?" },
        { label: "Terminal velocity?", query: "What is terminal velocity and how does air drag affect falling speed?" }
      ];
    }
    if (lessonId === 'bohr-model') {
      return [
        { label: "What is a shell?", query: "What is an electron shell and how many electrons can they hold?" },
        { label: "Why electrons jump?", query: "Why do electrons jump levels and emit light?" },
        { label: "Excitation energy?", query: "What is excitation energy and how does it relate to ground vs excited states?" }
      ];
    }
    if (lessonId === 'electron-config') {
      return [
        { label: "Aufbau Principle?", query: "What is the Aufbau Principle and how does it work?" },
        { label: "Hund's Rule?", query: "Explain Hund's Rule and degenerate orbitals." },
        { label: "Pauli Exclusion?", query: "What is the Pauli Exclusion Principle and why does spin matter?" }
      ];
    }
    if (lessonId === 'ph-poh-scale') {
      return [
        { label: "What is pH?", query: "What is pH and how is the pH scale defined?" },
        { label: "Strong vs Weak Acids?", query: "What is the difference between a strong acid like HCl and a weak acid like acetic acid?" },
        { label: "How do indicators work?", query: "Explain how pH indicators work and change color." }
      ];
    }
    if (lessonId === 'acid-base-titrations') {
      return [
        { label: "What is neutralization?", query: "What is neutralization in chemistry and what products are formed?" },
        { label: "Titration equivalence?", query: "What is the equivalence point of a titration and how do we calculate it?" },
        { label: "How do indicators work?", query: "Why do indicators like phenolphthalein change color at specific pH values?" }
      ];
    }
    if (lessonId === 'newton-gravitation') {
      return [
        { label: "Inverse-Square Law?", query: "Explain the inverse-square law of gravitation and how distance affects force." },
        { label: "What is Universal G?", query: "What is the Gravitational Constant G and why is it so small?" },
        { label: "Orbits & Free-Fall?", query: "How does gravity provide the centripetal force for planetary orbits?" }
      ];
    }
    if (lessonId === 'work-energy-theorem') {
      return [
        { label: "What is the Theorem?", query: "Explain the Work-Energy Theorem and write down its main formula." },
        { label: "Negative Work?", query: "How does friction perform negative work and where does the lost kinetic energy go?" },
        { label: "Work on an Incline?", query: "How do we calculate the work done by gravity and normal force when a block slides down an incline?" }
      ];
    }
    if (lessonId === 'ohms-law') {
      return [
        { label: "Explain Ohm's Law", query: "Explain Georg Ohm's law and the V = I * R relationship." },
        { label: "Voltage vs Current?", query: "How do voltage and resistance affect the flow of electrical current?" },
        { label: "What limits current?", query: "What is electrical resistance and how do resistors limit flow?" }
      ];
    }
    if (lessonId === 'kirchhoffs-laws') {
      return [
        { label: "Junction Rule?", query: "Explain Kirchhoff's Junction Rule and how it represents conservation of charge." },
        { label: "Loop Rule?", query: "Explain Kirchhoff's Loop Rule and how it represents conservation of energy." },
        { label: "Solving Multi-Loops?", query: "What is the systematic process to solve for branch currents in a multi-loop circuit?" }
      ];
    }
    if (lessonId === 'magnetic-fields') {
      return [
        { label: "Lorentz Force Eq?", query: "What is the Lorentz Force equation and how are electric and magnetic forces combined?" },
        { label: "Right-Hand Rule?", query: "Explain how the Right-Hand Rule works to find the direction of the magnetic force." },
        { label: "Cyclotron Radius?", query: "How does the magnetic field strength and charge affect the radius of a circular trajectory?" }
      ];
    }
    if (lessonId === 'wave-properties') {
      return [
        { label: "Wave Equation?", query: "What is the wave speed formula and how does speed relate to frequency and wavelength?" },
        { label: "Frequency vs Period?", query: "Explain the difference between wave frequency and wave period, and how they relate." },
        { label: "What is Amplitude?", query: "What does the amplitude of a wave represent, and how does it relate to the wave's energy?" }
      ];
    }
    if (lessonId === 'ionic-vs-covalent') {
      return [
        { label: "How is NaCl formed?", query: "Explain the electron transfer in NaCl formation." },
        { label: "Ionic vs Covalent?", query: "What are the main differences between ionic and covalent bonds?" },
        { label: "Sharing electrons?", query: "How does electron sharing work in covalent molecules?" }
      ];
    }
    if (lessonId === 'balancing-equations') {
      return [
        { label: "How to balance?", query: "What are the steps to balance a chemical equation?" },
        { label: "Conservation of mass?", query: "How does balancing equations verify conservation of mass?" },
        { label: "Coefficient vs Subscript?", query: "What is the difference between a coefficient and a subscript?" }
      ];
    }
    if (lessonId === 'hydrocarbons') {
      return [
        { label: "Alkanes vs Alkenes?", query: "Explain the difference between alkanes, alkenes, and alkynes." },
        { label: "Saturated hydrocarbons?", query: "What does saturated mean in organic chemistry?" },
        { label: "How to name hydrocarbons?", query: "What are the IUPAC rules for naming simple hydrocarbons?" }
      ];
    }
    return [
      { label: "Explain core topic", query: "Explain the main topic of this lesson in detail." },
      { label: "What are key concepts?", query: "Give me an overview of the key concepts for this lesson." },
      { label: "Key exam tips?", query: "What are the most important focus areas for an exam on this topic?" }
    ];
  };

  const getSuggestedQuestions = () => {
    if (lessonId === 'heart') {
      return [
        "What is the aorta?",
        "How does blood flow through the heart?",
        "What is the role of the left ventricle?",
        "Explain systemic and pulmonary circulation."
      ];
    }
    if (lessonId === 'brain-cns') {
      return [
        "What is the cerebrum?",
        "How do neurons communicate?",
        "What is the role of the cerebellum?",
        "Explain the central nervous system."
      ];
    }
    if (lessonId === 'stomach-digestive-process') {
      return [
        "What is gastric acid?",
        "How does the stomach digest proteins?",
        "What is the role of the pylorus?",
        "Explain cardial reflux protection."
      ];
    }
    if (lessonId === 'plant-cell-structure') {
      return [
        "What is a chloroplast?",
        "Why do plant cells have a cell wall?",
        "What is the function of the vacuole?",
        "How does photosynthesis occur?"
      ];
    }
    if (lessonId === 'velocity-accel') {
      return [
        "What is displacement?",
        "What is deceleration?",
        "How do you calculate acceleration?",
        "What is the formula for displacement under constant acceleration?"
      ];
    }
    if (lessonId === 'newtons-laws') {
      return [
        "What is inertia?",
        "How is force calculated?",
        "Explain equal and opposite forces.",
        "What happens when mass is doubled for the same force?"
      ];
    }
    if (lessonId === 'friction-drag') {
      return [
        "What is the difference between static and kinetic friction?",
        "How is terminal velocity reached?",
        "Explain the variables in the drag equation.",
        "Why is the kinetic friction coefficient lower than static?"
      ];
    }
    if (lessonId === 'bohr-model') {
      return [
        "What are quantized electron energy levels?",
        "Explain how photon emission produces color spectra.",
        "How many electrons can fit in the n=3 shell?",
        "What is the ground state of an atom?"
      ];
    }
    if (lessonId === 'electron-config') {
      return [
        "What is the Aufbau Principle?",
        "Why are transition subshells like 3d filled differently?",
        "Explain Pauli Exclusion and Hund's Rule.",
        "How do subshell shapes (s, p, d, f) differ in 3D?"
      ];
    }
    if (lessonId === 'ph-poh-scale') {
      return [
        "What is the mathematical definition of pH?",
        "Why does hydrochloric acid ionize completely in water?",
        "How do indicators change color based on protonation?",
        "Explain the relation between pH and pOH."
      ];
    }
    if (lessonId === 'acid-base-titrations') {
      return [
        "What is a neutralization reaction?",
        "How does acid-base titration work?",
        "What is the equivalence point?",
        "Why does phenolphthalein turn pink?"
      ];
    }
    if (lessonId === 'ionic-vs-covalent') {
      return [
        "What is NaCl's bonding mechanism?",
        "Why do metals form cations?",
        "What is electrostatic attraction?",
        "Explain electron sharing."
      ];
    }
    if (lessonId === 'balancing-equations') {
      return [
        "Why must chemical equations be balanced?",
        "How do coefficients balance atoms?",
        "Balance the synthesis of water.",
        "What is the law of conservation of mass?"
      ];
    }
    if (lessonId === 'hydrocarbons') {
      return [
        "What is methane's formula?",
        "Define alkenes and alkynes.",
        "What are saturated hydrocarbons?",
        "Explain ethene's double bond."
      ];
    }
    return [
      "What is the core topic?",
      "Can you summarize this lesson?",
      "What are the key exam tips?",
      "Explain the main structures."
    ];
  };

  return (
    <div className="glass-panel p-4 rounded-[24px] border-white/10 flex flex-col bg-[#050914]/40 backdrop-blur-xl shadow-2xl relative overflow-hidden h-[580px] w-full gap-3">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-48 h-48 bg-brand-purple/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col gap-2 border-b border-white/5 pb-2.5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-gradient-to-tr from-brand-purple/20 to-brand-cyan/20 border border-brand-cyan/30 text-brand-cyan relative shrink-0">
              <Bot className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold text-white tracking-wide uppercase">
                  SciLearn AI Tutor
                </h3>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse border border-[#050914]" title="Lesson Focus Mode Enabled" />
              </div>
              <p className="text-[9px] text-gray-400">
                Your AI tutor for this lesson
              </p>
            </div>
          </div>
          
          <button
            onClick={clearChat}
            title="Clear chat history"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all duration-200"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-xl bg-black/45 border border-white/5 p-3 space-y-3 relative z-10 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-start gap-2 max-w-[88%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="p-1.5 rounded-full border bg-brand-cyan/10 border-brand-cyan/30 text-white shrink-0">
                  <Bot className="h-3 w-3" />
                </div>
              )}
              
              <div className={`rounded-xl px-3 py-2 text-[11px] leading-relaxed relative ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-brand-purple to-brand-cyan text-white shadow-lg font-medium rounded-tr-none'
                  : 'bg-[#0f1424]/90 border border-white/5 text-gray-300 rounded-tl-none prose prose-invert max-w-none'
              }`}>
                {msg.sender === 'ai' ? (
                  <div className="space-y-1">
                    {msg.text.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) {
                        return <h4 key={i} className="text-xs font-extrabold text-white mt-1.5 mb-0.5">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('* ') || line.startsWith('- ')) {
                        return <li key={i} className="list-disc list-inside ml-1.5">{line.substring(2)}</li>;
                      }
                      const parts = line.split('**');
                      if (parts.length > 1) {
                        return (
                          <p key={i}>
                            {parts.map((part, index) => index % 2 === 1 ? <strong key={index} className="text-white font-bold">{part}</strong> : part)}
                          </p>
                        );
                      }
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                ) : (
                  <div>
                    <p>{msg.text}</p>
                    <div className="text-[7.5px] text-white/50 text-right mt-1 flex items-center justify-end gap-1 font-semibold">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:30 AM'} ✓✓
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {loading && (
          <div className="flex items-start gap-2 max-w-[85%]">
            <div className="p-1.5 rounded-full border bg-brand-cyan/10 border-brand-cyan/30 text-white shrink-0">
              <Bot className="h-3 w-3" />
            </div>
            <div className="bg-[#0f1424]/90 border border-white/5 rounded-xl rounded-tl-none px-3 py-2 flex items-center gap-1">
              <span className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-[10.5px] text-red-200">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <div className="flex-1 flex items-center justify-between">
              <span>{error}</span>
              <button 
                onClick={() => handleSendMessage(messages[messages.length - 1]?.text || 'Retry last request')}
                className="flex items-center gap-1 text-[9px] font-bold text-red-300 hover:text-white uppercase transition-colors"
              >
                <RefreshCw className="h-2.5 w-2.5" /> Retry
              </button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 2x2 Suggested Questions section */}
      <div className="relative z-10 space-y-1.5">
        <span className="text-[9.5px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
          <span className="text-amber-400">✦</span> Suggested Questions
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {getSuggestedQuestions().map((question, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(question)}
              disabled={loading}
              className="text-left p-2.5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-cyan/35 text-[9.5px] text-gray-300 hover:text-white transition-all duration-200 font-semibold leading-relaxed disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input Submit Panel */}
      <form onSubmit={handleFormSubmit} className="relative z-10 flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask anything about ${lesson}...`}
          disabled={loading}
          className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan/20 transition-all duration-200 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan p-2.5 text-white transition-all shadow-lg hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
