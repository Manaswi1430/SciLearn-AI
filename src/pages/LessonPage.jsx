import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronRight, 
  Check, 
  Loader2, 
  Activity,
  Bot,
  BookOpen,
  ClipboardList
} from 'lucide-react';
import { getLessonById, getTopicById } from '../data/curriculum';
import { getLessonDataById } from '../data/lessons';
import { getLessonParts } from '../data/lessonParts';
import { useAuth } from '../contexts/AuthContext';
import { markLessonComplete } from '../firebase/firestore';
import Unified3DViewer from '../components/Unified3DViewer';
import AITutor from '../components/AITutor';
import { useModelInteraction } from '../hooks/useModelInteraction';

export default function LessonPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshProfile } = useAuth();
  
  const [completing, setCompleting] = useState(false);
  const [aiTriggerPrompt, setAiTriggerPrompt] = useState('');
  const [showAllParts, setShowAllParts] = useState(false);
  const [activeTab, setActiveTab] = useState('tutor'); // 'tutor', 'content', 'practice'

  // Quiz States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Dynamic Kinematics Practice States
  const [practiceProblem, setPracticeProblem] = useState(null);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [practiceFeedback, setPracticeFeedback] = useState('');
  const [practiceIsCorrect, setPracticeIsCorrect] = useState(false);

  const handleCheckPracticeAnswer = () => {
    const studentAns = parseFloat(practiceAnswer.trim());
    if (isNaN(studentAns)) {
      setPracticeFeedback('Please enter a valid numeric value.');
      return;
    }
    setPracticeChecked(true);
    if (Math.abs(studentAns - practiceProblem.answer) < 0.1) {
      setPracticeIsCorrect(true);
      setPracticeFeedback(practiceProblem.explanation);
    } else {
      setPracticeIsCorrect(false);
      setPracticeFeedback(`Not quite. Try recalculating! Formula check: ${practiceProblem.formulaHint || 'v = v0 + a * t'}`);
    }
  };

  const handleNextPracticeProblem = () => {
    let prob = null;

    if (id === 'newtons-laws') {
      const types = ['force', 'mass', 'acceleration', 'action-reaction'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'acceleration') {
        const m = Math.floor(Math.random() * 15) + 2; // 2-16 kg
        const a = Math.floor(Math.random() * 8) + 2;  // 2-9 m/s^2
        const f = m * a;
        prob = {
          question: `A crate with a mass of ${m} kg is pushed across a frictionless ice rink with a net force of ${f} N. What is the acceleration of the crate in m/s²?`,
          answer: a,
          formulaHint: 'a = F / m',
          explanation: `According to Newton's Second Law, a = F / m. In this case, a = ${f} N / ${m} kg = ${a} m/s².`
        };
      } else if (type === 'force') {
        const m = Math.floor(Math.random() * 12) + 3; // 3-14 kg
        const a = Math.floor(Math.random() * 6) + 2;  // 2-7 m/s^2
        const f = m * a;
        prob = {
          question: `An astronaut needs to accelerate a ${m} kg scientific instrument in space at a rate of ${a} m/s². How much net force in Newtons (N) must the astronaut apply?`,
          answer: f,
          formulaHint: 'F = m * a',
          explanation: `Newton's Second Law states that F = m × a. Here, F = ${m} kg × ${a} m/s² = ${f} Newtons.`
        };
      } else if (type === 'mass') {
        const a = Math.floor(Math.random() * 5) + 2;  // 2-6 m/s^2
        const f = (Math.floor(Math.random() * 10) + 3) * a; // ensures integer mass
        const m = f / a;
        prob = {
          question: `A drone propeller exerts an upward thrust force of ${f} N on a cargo package. If the package accelerates upward at a rate of ${a} m/s² (neglecting gravity for simplicity), what is the mass of the package in kg?`,
          answer: m,
          formulaHint: 'm = F / a',
          explanation: `Rearranging Newton's Second Law gives m = F / a. Here, m = ${f} N / ${a} m/s² = ${m} kg.`
        };
      } else {
        const f = Math.floor(Math.random() * 400) + 100; // 100-500 N
        prob = {
          question: `A skateboarder pushes backward against the ground with a horizontal force of ${f} N. According to Newton's Third Law, what is the magnitude of the forward force in Newtons (N) that the ground exerts on the skateboarder?`,
          answer: f,
          formulaHint: 'Action = Reaction (equal magnitude)',
          explanation: `Newton's Third Law states that every action has an equal and opposite reaction. Therefore, the forward force exerted by the ground is equal in magnitude to the backward force: ${f} Newtons.`
        };
      }
    } else if (id === 'friction-drag') {
      const types = ['kinetic-friction', 'static-friction-threshold', 'drag-force-net', 'terminal-velocity-drag'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'kinetic-friction') {
        const m = Math.floor(Math.random() * 12) + 4; // 4-15 kg
        const mu = [0.1, 0.2, 0.3, 0.5, 0.6][Math.floor(Math.random() * 5)];
        const ans = Math.round(mu * m * 9.8 * 100) / 100;
        prob = {
          question: `A block with a mass of ${m} kg is sliding across a surface with a coefficient of kinetic friction μ_k = ${mu}. What is the magnitude of the kinetic friction force acting on it in Newtons? (Use g = 9.8 m/s² and round to 2 decimal places)`,
          answer: ans,
          formulaHint: 'F_k = μ_k * m * g',
          explanation: `The kinetic friction force is given by F_k = μ_k * F_N. On a flat surface, the Normal Force F_N = m * g = ${m} * 9.8 = ${(m*9.8).toFixed(1)} N. Therefore, F_k = ${mu} * ${(m*9.8).toFixed(1)} = ${ans} N.`
        };
      } else if (type === 'static-friction-threshold') {
        const m = Math.floor(Math.random() * 10) + 5; // 5-14 kg
        const mu = [0.25, 0.4, 0.5, 0.7, 0.8][Math.floor(Math.random() * 5)];
        const ans = Math.round(mu * m * 9.8 * 100) / 100;
        prob = {
          question: `A crate with a mass of ${m} kg is at rest on a surface with a coefficient of static friction μ_s = ${mu}. What is the minimum horizontal force in Newtons required to overcome static friction and start moving the crate? (Use g = 9.8 m/s² and round to 2 decimal places)`,
          answer: ans,
          formulaHint: 'F_s_max = μ_s * m * g',
          explanation: `To start moving the crate, the applied force must exceed the maximum static friction force: F_s_max = μ_s * F_N = μ_s * m * g = ${mu} * ${m} * 9.8 = ${ans} N.`
        };
      } else if (type === 'drag-force-net') {
        const m = Math.floor(Math.random() * 30) + 50; // 50-79 kg
        const drag = Math.floor(Math.random() * 4) * 100 + 200; // 200, 300, 400, 500 N
        const gForce = m * 9.8;
        const ans = Math.round((gForce - drag) * 100) / 100;
        prob = {
          question: `A ${m} kg skydiver is falling through the air. At a certain speed, they experience an upward air drag force of ${drag} N. What is the net downward force in Newtons acting on the skydiver? (Use g = 9.8 m/s²)`,
          answer: ans,
          formulaHint: 'F_net = F_gravity - F_drag = (m * g) - F_drag',
          explanation: `The gravitational force pulling the skydiver down is F_g = m * g = ${m} * 9.8 = ${gForce} N. The net force is F_net = F_g - F_drag = ${gForce} - ${drag} = ${ans} N.`
        };
      } else {
        const m = Math.floor(Math.random() * 20) + 65; // 65-84 kg
        const ans = Math.round(m * 9.8 * 100) / 100;
        prob = {
          question: `A skydiver of mass ${m} kg has opened their parachute and reached terminal velocity. What is the magnitude of the upward drag force in Newtons acting on them? (Use g = 9.8 m/s²)`,
          answer: ans,
          formulaHint: 'At terminal velocity: F_drag = F_gravity = m * g',
          explanation: `At terminal velocity, the net acceleration is zero, meaning the upward drag force must exactly balance the downward gravitational force: F_drag = F_gravity = m * g = ${m} * 9.8 = ${ans} N.`
        };
      }
    } else if (id === 'bohr-model') {
      const types = ['shell-capacity', 'transition-energy', 'neutron-count'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'shell-capacity') {
        const shell = Math.floor(Math.random() * 3) + 1; // n=1, 2, or 3
        const cap = 2 * shell * shell;
        prob = {
          question: `According to the Bohr model, what is the maximum number of electrons that can occupy the energy shell n = ${shell}? (Use the formula 2n²)`,
          answer: cap,
          formulaHint: 'Max Capacity = 2 * n^2',
          explanation: `Using the Bohr electron capacity formula (2n²), the maximum electrons for shell n = ${shell} is 2 × (${shell})² = 2 × ${shell * shell} = ${cap}.`
        };
      } else if (type === 'transition-energy') {
        const initial = Math.floor(Math.random() * 3) + 2; // n=2, 3, or 4
        const final = Math.floor(Math.random() * (initial - 1)) + 1; // lower shell
        const eInitial = -13.6 / (initial * initial);
        const eFinal = -13.6 / (final * final);
        const diff = Math.abs(eFinal - eInitial);
        const ans = Math.round(diff * 100) / 100;
        
        prob = {
          question: `An electron in a hydrogen atom drops from shell n = ${initial} (E = ${eInitial.toFixed(2)} eV) to shell n = ${final} (E = ${eFinal.toFixed(2)} eV). What is the energy of the emitted photon in eV? (Round your answer to 2 decimal places)`,
          answer: ans,
          formulaHint: 'ΔE = |E_final - E_initial|',
          explanation: `The energy of the emitted photon equals the difference in energy levels: ΔE = |${eFinal.toFixed(2)} eV - (${eInitial.toFixed(2)} eV)| = ${diff.toFixed(2)} eV.`
        };
      } else {
        const elements = [
          { name: 'Carbon-14', Z: 6, A: 14 },
          { name: 'Oxygen-18', Z: 8, A: 18 },
          { name: 'Helium-4', Z: 2, A: 4 },
          { name: 'Chlorine-35', Z: 17, A: 35 },
          { name: 'Sodium-23', Z: 11, A: 23 }
        ];
        const elem = elements[Math.floor(Math.random() * elements.length)];
        const neutrons = elem.A - elem.Z;
        prob = {
          question: `An isotope of ${elem.name} has an atomic number of ${elem.Z} (number of protons) and a mass number of ${elem.A}. How many neutrons does this atom's nucleus contain?`,
          answer: neutrons,
          formulaHint: 'Neutrons = Mass Number (A) - Atomic Number (Z)',
          explanation: `The number of neutrons is found by subtracting the atomic number (protons) from the mass number: ${elem.A} - ${elem.Z} = ${neutrons} neutrons.`
        };
      }
    } else if (id === 'electron-config') {
      const types = ['subshell-capacity', 'valence-electrons', 'atomic-number-config', 'unpaired-electrons'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'subshell-capacity') {
        const subshells = [
          { name: 's', cap: 2, l: 0 },
          { name: 'p', cap: 6, l: 1 },
          { name: 'd', cap: 10, l: 2 },
          { name: 'f', cap: 14, l: 3 }
        ];
        const sub = subshells[Math.floor(Math.random() * subshells.length)];
        prob = {
          question: `What is the maximum number of electrons that can occupy any single "${sub.name}" subshell (regardless of energy level)?`,
          answer: sub.cap,
          formulaHint: 'Subshell capacity = 2 * (2*l + 1), where l is the azimuthal quantum number.',
          explanation: `For an "${sub.name}" subshell, the azimuthal quantum number l is ${sub.l}. The number of orbitals is 2*l + 1 = ${2*sub.l + 1}. Since each orbital can hold 2 electrons, the maximum capacity is ${sub.cap} electrons.`
        };
      } else if (type === 'valence-electrons') {
        const elements = [
          { name: 'Carbon (Z=6)', val: 4, config: '1s² 2s² 2p²' },
          { name: 'Nitrogen (Z=7)', val: 5, config: '1s² 2s² 2p³' },
          { name: 'Oxygen (Z=8)', val: 6, config: '1s² 2s² 2p⁴' },
          { name: 'Neon (Z=10)', val: 8, config: '1s² 2s² 2p⁶' },
          { name: 'Sodium (Z=11)', val: 1, config: '1s² 2s² 2p⁶ 3s¹' }
        ];
        const elem = elements[Math.floor(Math.random() * elements.length)];
        prob = {
          question: `How many valence (outermost shell) electrons are present in a ground-state atom of ${elem.name}?`,
          answer: elem.val,
          formulaHint: 'Count the electrons in the highest principal energy level (n).',
          explanation: `${elem.name} has the configuration ${elem.config}. The highest energy level is n=${elem.val === 1 ? '3' : '2'}, which contains ${elem.val} electron(s).`
        };
      } else if (type === 'atomic-number-config') {
        const configs = [
          { str: '1s² 2s² 2p⁶', z: 10 },
          { str: '1s² 2s² 2p⁶ 3s²', z: 12 },
          { str: '1s² 2s² 2p⁶ 3s² 3p³', z: 15 },
          { str: '1s² 2s² 2p⁶ 3s² 3p⁶', z: 18 },
          { str: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s²', z: 20 }
        ];
        const conf = configs[Math.floor(Math.random() * configs.length)];
        prob = {
          question: `An unknown ground-state element has the electron configuration: ${conf.str}. What is the atomic number (Z) of this element?`,
          answer: conf.z,
          formulaHint: 'For a neutral atom, Atomic Number = Sum of all superscripts in the configuration.',
          explanation: `Summing the electrons in the subshells: 2 + 2 + 6 + 2 + ... = ${conf.z}. Therefore, Z = ${conf.z}.`
        };
      } else {
        const elements = [
          { name: 'Carbon (Z=6, 1s² 2s² 2p²)', un: 2, sub: '2p' },
          { name: 'Nitrogen (Z=7, 1s² 2s² 2p³)', un: 3, sub: '2p' },
          { name: 'Oxygen (Z=8, 1s² 2s² 2p⁴)', un: 2, sub: '2p' }
        ];
        const elem = elements[Math.floor(Math.random() * elements.length)];
        prob = {
          question: `According to Hund's Rule, how many unpaired electrons are present in the ground state of ${elem.name}?`,
          answer: elem.un,
          formulaHint: "Distribute electrons singly into equal-energy orbitals of the subshell first before pairing them up.",
          explanation: `The ${elem.sub} subshell has 3 orbitals. Hund's rule requires filling them singly first. For ${elem.name}, this results in ${elem.un} unpaired electrons.`
        };
      }
    } else if (id === 'ph-poh-scale') {
      const types = ['ph-calc', 'poh-calc', 'acid-strength', 'concentration-calc'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'ph-calc') {
        const ph = Math.floor(Math.random() * 6) + 1; // pH 1 to 6 (acidic)
        const concStr = `1.0 × 10⁻${ph}`;
        prob = {
          question: `An aqueous solution has a hydrogen ion concentration [H⁺] of ${concStr} M. Calculate the pH of the solution.`,
          answer: ph,
          formulaHint: 'pH = -log10([H⁺])',
          explanation: `Using the pH formula: pH = -log10([H⁺]) = -log10(${concStr}) = ${ph}. Since it is less than 7, the solution is acidic.`
        };
      } else if (type === 'poh-calc') {
        const ph = Math.floor(Math.random() * 11) + 2; // pH 2 to 12
        const poh = 14 - ph;
        prob = {
          question: `A solution is measured to have a pH of ${ph}. What is the pOH of this solution?`,
          answer: poh,
          formulaHint: 'pH + pOH = 14',
          explanation: `In any aqueous solution at 25°C, pH + pOH = 14. Therefore, pOH = 14 - pH = 14 - ${ph} = ${poh}.`
        };
      } else if (type === 'concentration-calc') {
        const ph = Math.floor(Math.random() * 5) + 8; // pH 8 to 12 (basic)
        const poh = 14 - ph;
        prob = {
          question: `A basic solution has a pH of ${ph}. What is its hydroxide ion concentration [OH⁻] in moles per liter? Enter only the negative exponent (i.e. if the concentration is 1.0 × 10⁻⁵ M, enter 5).`,
          answer: poh,
          formulaHint: 'pOH = 14 - pH, [OH⁻] = 10^-pOH',
          explanation: `First, calculate pOH: pOH = 14 - pH = 14 - ${ph} = ${poh}. The hydroxide ion concentration is [OH⁻] = 10^-pOH = 1.0 × 10⁻${poh} M. The negative exponent is ${poh}.`
        };
      } else {
        const optionsList = [
          { name: 'Hydrochloric acid (HCl)', answer: 1, typeStr: 'Strong Acid', desc: 'dissociates completely in water' },
          { name: 'Sodium Hydroxide (NaOH)', answer: 5, typeStr: 'Strong Base', desc: 'ionizes completely in water, releasing hydroxide ions' },
          { name: 'Acetic acid (CH3COOH)', answer: 2, typeStr: 'Weak Acid', desc: 'ionizes only partially in water, establishing equilibrium' },
          { name: 'Ammonia (NH3)', answer: 4, typeStr: 'Weak Base', desc: 'reacts partially with water to produce OH- ions' }
        ];
        const selected = optionsList[Math.floor(Math.random() * optionsList.length)];
        prob = {
          question: `Identify the classification of ${selected.name}. Choose the option number:\n1: Strong Acid\n2: Weak Acid\n3: Neutral\n4: Weak Base\n5: Strong Base`,
          answer: selected.answer,
          formulaHint: 'Consider if it is an acid/base and its extent of dissociation.',
          explanation: `${selected.name} is classified as a ${selected.typeStr} because it ${selected.desc}.`
        };
      }
    } else if (id === 'acid-base-titrations') {
      const types = ['titration-molarity', 'equivalence-volume', 'neutralization-moles'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'titration-molarity') {
        const vBase = [12.5, 20.0, 25.0, 37.5, 50.0][Math.floor(Math.random() * 5)];
        const mBase = 0.10;
        const vAcid = 25.0;
        const mAcid = parseFloat(((mBase * vBase) / vAcid).toFixed(3));
        prob = {
          question: `A ${vAcid} mL sample of HCl of unknown concentration is titrated to the equivalence point with ${mBase.toFixed(2)} M NaOH. If it requires exactly ${vBase.toFixed(1)} mL of NaOH to reach the endpoint, what is the molarity (M) of the HCl solution?`,
          answer: mAcid,
          formulaHint: 'M_acid = (M_base * V_base) / V_acid',
          explanation: `Using the dilution/titration formula (M_acid * V_acid = M_base * V_base): M_acid * ${vAcid} mL = ${mBase.toFixed(2)} M * ${vBase.toFixed(1)} mL. Solving for M_acid gives: (${mBase.toFixed(2)} * ${vBase.toFixed(1)}) / ${vAcid} = ${mAcid} M.`
        };
      } else if (type === 'equivalence-volume') {
        const vAcid = [10.0, 20.0, 25.0, 30.0][Math.floor(Math.random() * 4)];
        const mAcid = [0.05, 0.10, 0.15, 0.20][Math.floor(Math.random() * 4)];
        const mBase = 0.10;
        const vBase = parseFloat(((mAcid * vAcid) / mBase).toFixed(2));
        prob = {
          question: `What volume of ${mBase.toFixed(2)} M NaOH (mL) is required to completely neutralize ${vAcid.toFixed(1)} mL of ${mAcid.toFixed(2)} M HCl solution?`,
          answer: vBase,
          formulaHint: 'V_base = (M_acid * V_acid) / M_base',
          explanation: `Using the titration formula: V_base = (M_acid * V_acid) / M_base = (${mAcid.toFixed(2)} M * ${vAcid.toFixed(1)} mL) / ${mBase.toFixed(2)} M = ${vBase} mL.`
        };
      } else {
        const molesHCl = parseFloat((0.01 + Math.random() * 0.09).toFixed(3)); // 0.010 to 0.100 moles
        prob = {
          question: `How many moles of sodium hydroxide (NaOH) are required to completely neutralize an aqueous solution containing exactly ${molesHCl.toFixed(3)} moles of hydrochloric acid (HCl)?`,
          answer: molesHCl,
          formulaHint: '1 mole of HCl reacts with 1 mole of NaOH (1:1 ratio)',
          explanation: `The neutralization reaction is HCl + NaOH → NaCl + H₂O. Since the stoichiometric ratio is 1:1, neutralizing ${molesHCl.toFixed(3)} moles of HCl requires exactly ${molesHCl.toFixed(3)} moles of NaOH.`
        };
      }
    } else {
      const types = ['velocity', 'acceleration', 'displacement1', 'displacement2'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'velocity') {
        const v = Math.floor(Math.random() * 20) + 5; // 5-25 m/s
        const t = Math.floor(Math.random() * 10) + 3; // 3-12 s
        prob = {
          question: `A car moves at a constant velocity of ${v} m/s for ${t} seconds. Find the distance traveled in meters.`,
          answer: v * t,
          formulaHint: 'd = v * t',
          explanation: `For constant velocity, distance is calculated as: d = v × t. In this case, d = ${v} m/s × ${t} s = ${v * t} meters.`
        };
      } else if (type === 'acceleration') {
        const v0 = Math.floor(Math.random() * 15) + 5; // 5-20 m/s
        const a = Math.floor(Math.random() * 6) + 2; // 2-7 m/s^2
        const t = Math.floor(Math.random() * 8) + 2; // 2-9 s
        prob = {
          question: `A car starts with an initial velocity of ${v0} m/s and accelerates at a rate of ${a} m/s² for ${t} seconds. What is its final velocity in m/s?`,
          answer: v0 + a * t,
          formulaHint: 'v = v0 + a * t',
          explanation: `The final velocity is given by the formula: v = v₀ + a × t. Here, v = ${v0} m/s + (${a} m/s² × ${t} s) = ${v0} + ${a * t} = ${v0 + a * t} m/s.`
        };
      } else if (type === 'displacement1') {
        const a = Math.floor(Math.random() * 4) + 2; // 2-5 m/s^2
        const t = (Math.floor(Math.random() * 5) + 1) * 2; // Make t even so t^2 is divisible nicely
        prob = {
          question: `A sports car starts from rest (v₀ = 0 m/s) and accelerates at a rate of ${a} m/s² for ${t} seconds. Find the total distance traveled in meters.`,
          answer: 0.5 * a * t * t,
          formulaHint: 'd = 0.5 * a * t^2',
          explanation: `The distance traveled from rest is: d = 0.5 × a × t². Here, d = 0.5 × ${a} m/s² × (${t} s)² = 0.5 × ${a} × ${t * t} = ${0.5 * a * t * t} meters.`
        };
      } else {
        const a = Math.floor(Math.random() * 4) + 2; // 2-5 m/s^2
        const v0 = a * (Math.floor(Math.random() * 5) + 3); // integer result
        prob = {
          question: `A car traveling at ${v0} m/s decelerates at a rate of -${a} m/s² until it comes to a complete stop. How many seconds does it take to stop?`,
          answer: v0 / a,
          formulaHint: 't = v0 / a',
          explanation: `Since the final velocity v = 0, we can use the formula 0 = v₀ - a × t, which simplifies to t = v₀ / a. Here, t = ${v0} / ${a} = ${v0 / a} seconds.`
        };
      }
    }

    setPracticeProblem(prob);
    setPracticeAnswer('');
    setPracticeChecked(false);
    setPracticeFeedback('');
    setPracticeIsCorrect(false);
  };

  // Initialize practice problem on lesson loading
  useEffect(() => {
    if (id === 'velocity-accel' || id === 'newtons-laws' || id === 'friction-drag' || id === 'bohr-model' || id === 'electron-config' || id === 'ph-poh-scale' || id === 'acid-base-titrations') {
      handleNextPracticeProblem();
    }
  }, [id]);

  const lessonInfo = getLessonById(id);
  const lessonContent = getLessonDataById(id);
  const topicInfo = lessonInfo ? getTopicById(lessonInfo.topicId) : null;
  const isLessonCompleted = userProfile?.completedLessons?.includes(id);

  // Hook for 3D interactions
  const { 
    selectedPart, 
    hoveredPart, 
    clickPosition, 
    selectPart, 
    hoverPart,
    resetSelection,
    setClickPosition
  } = useModelInteraction();

  // Load structures checklist database
  const lessonPartsList = getLessonParts(id, lessonContent);
  
  // Find active selected structure details
  const activePartInfo = lessonPartsList.find(
    p => p.name.toLowerCase() === (selectedPart || '').toLowerCase()
  );

  // Show first 5 items, expand remaining if showAllParts is toggled
  const visibleParts = showAllParts ? lessonPartsList : lessonPartsList.slice(0, 5);

  const handleResetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  // Reset state on lesson change
  useEffect(() => {
    resetSelection();
    setShowAllParts(false);
    setActiveTab('tutor');
    handleResetQuiz();
  }, [id, resetSelection]);

  const handleCompleteLesson = async () => {
    if (isLessonCompleted || completing) return;
    setCompleting(true);
    try {
      await markLessonComplete(currentUser.uid, id);
      await refreshProfile();
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setCompleting(false);
    }
  };

  const handleSelectOption = (optIdx) => {
    setSelectedOption(optIdx);
    setIsAnswered(true);
    if (quizQuestions[currentQuestionIdx].answer === optIdx) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < quizQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
    }
  };

  if (!lessonInfo || !lessonContent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Lesson Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-2 font-semibold text-white"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Resolve practice questions
  const practiceQuestions = lessonContent.practiceQuestions || [
    `Explain the biological importance and function of ${lessonInfo.title} in your own words.`,
    `How does the structure of the components in ${lessonInfo.title} support their overall function?`,
    `What real-world applications or diseases are associated with ${lessonInfo.title}?`
  ];

  // Resolve suggested readings
  const suggestedReading = lessonContent.suggestedReading || [
    { title: `${lessonInfo.title} Basics`, desc: `An introduction to the fundamentals of ${lessonInfo.title}.` },
    { title: `Exploring ${topicInfo?.title || 'this topic'}`, desc: `A deeper dive into the context and systems of ${topicInfo?.title || 'the subject'}.` },
    { title: `Advanced Concepts in ${lessonInfo.title}`, desc: `Looking at modern research and advanced mechanisms.` }
  ];

  // Resolve quiz questions
  // Resolve quiz questions
  const quizQuestions = lessonContent.quiz || (lessonContent.keyConcepts || []).map((concept, idx) => ({
    question: `Which of the following best describes the function or role of the ${concept.name}?`,
    options: [
      concept.desc,
      `It has no active role in the system of ${lessonInfo.title}.`,
      `It acts as a secondary backup structure.`,
      `It is only present in synthetic laboratory models.`
    ],
    answer: 0,
    explanation: `The ${concept.name} is key to ${lessonInfo.title}: ${concept.desc}`
  }));

  const isSimulator = ['velocity-accel', 'newtons-laws', 'friction-drag', 'bohr-model', 'electron-config', 'ph-poh-scale', 'acid-base-titrations'].includes(id);

  const renderLeftSidebar = (widthClass = "w-full lg:w-[220px]") => (
    <div className={`${widthClass} shrink-0 flex flex-col gap-4`}>
      {/* Structures Checklist Card */}
      <div className="glass-panel p-4 rounded-[24px] border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-3 shadow-xl">
        <div>
          <h3 className="text-[11px] font-extrabold text-white uppercase tracking-wider">
            Structures Checklist
          </h3>
          <p className="text-[9px] text-gray-500">Select a structure to explore</p>
        </div>

        {/* Checklist list */}
        <div className="space-y-1">
          {visibleParts.map((part, index) => {
            const isActive = (selectedPart || '').toLowerCase() === part.name.toLowerCase();
            
            // Varied colored dots matching the reference layout
            const dotColors = [
              'bg-pink-500', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
              'bg-cyan-500', 'bg-rose-500', 'bg-indigo-500', 'bg-amber-500',
              'bg-violet-500', 'bg-teal-500'
            ];
            const dotColor = dotColors[index % dotColors.length];

            return (
              <button
                key={part.id}
                onClick={() => selectPart(part.name)}
                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-[11px] transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 font-bold' 
                    : 'text-gray-300 hover:text-white border border-transparent hover:bg-white/5 font-semibold'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isActive ? 'bg-brand-cyan animate-pulse' : dotColor}`} />
                  <span className="truncate">{part.name}</span>
                </div>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-brand-cyan/25 text-brand-cyan' : 'bg-white/5 text-gray-500'
                }`}>
                  {index + 1}
                </span>
              </button>
            );
          })}

          {/* Collapsible toggle */}
          {lessonPartsList.length > 5 && (
            <button
              onClick={() => setShowAllParts(!showAllParts)}
              className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-[11px] text-gray-400 hover:text-white hover:bg-white/5 font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-600" />
                <span>{showAllParts ? 'Less Structures' : 'More Structures'}</span>
              </div>
              <ChevronRight className={`h-3.5 w-3.5 transform transition-transform duration-200 ${
                showAllParts ? 'rotate-90' : ''
              }`} />
            </button>
          )}
        </div>
      </div>

      {/* Active Structure Information Card */}
      {activePartInfo ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-4 rounded-[24px] border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col justify-between shadow-xl aspect-square w-full relative overflow-hidden group border-brand-cyan/20"
        >
          {/* Subtle glowing orb */}
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-brand-cyan/10 rounded-full blur-xl pointer-events-none group-hover:bg-brand-cyan/20 transition-all duration-300" />
          
          <div className="space-y-2 relative z-10 flex-1 overflow-y-auto scrollbar-thin pr-1">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
              <span className="text-[11px] font-extrabold text-brand-cyan uppercase tracking-wider">
                {activePartInfo.name}
              </span>
            </div>
            
            <div className="space-y-1.5">
              <p className="text-[10px] text-gray-300 leading-relaxed">
                <span className="text-gray-400 font-bold block">Function:</span>
                {activePartInfo.desc}
              </p>
              
              {activePartInfo.fact && (
                <p className="text-[10px] text-gray-400 leading-relaxed italic border-t border-white/5 pt-1.5">
                  <span className="text-brand-cyan font-bold not-italic block mb-0.5">💡 Did you know?</span>
                  {activePartInfo.fact}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setAiTriggerPrompt(`Explain the role and biological importance of the ${activePartInfo.name} in this lesson.`)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 mt-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[9px] font-bold text-gray-300 hover:text-white transition-all duration-200"
          >
            <span>Ask AI Tutor</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </motion.div>
      ) : (
        <div className="glass-panel p-4 rounded-[24px] border-white/10 bg-[#050914]/40 backdrop-blur-xl text-center text-gray-500 text-[10px] leading-relaxed shadow-xl aspect-square flex items-center justify-center">
          Click a structure checklist item or 3D meshes to inspect.
        </div>
      )}
    </div>
  );

  const renderRightPanelContent = () => (
    <>
      {/* Tabs Navigation */}
      <div className="flex items-center p-1 rounded-2xl bg-[#050914]/60 border border-white/5 backdrop-blur-xl">
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'tutor'
              ? 'bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-cyan/35 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <Bot className="h-3.5 w-3.5" />
          AI Tutor
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'content'
              ? 'bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-cyan/35 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Lesson Guide
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
            activeTab === 'practice'
              ? 'bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 border border-brand-cyan/35 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Practice & Quiz
        </button>
      </div>

      {/* Active Tab Panel Content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'tutor' && (
          <AITutor
            subject={lessonInfo.subjectTitle || 'Science'}
            category={topicInfo?.title || lessonInfo.topicTitle || 'General'}
            lesson={lessonInfo.title}
            difficulty={lessonInfo.difficulty || 'Beginner'}
            lessonId={lessonInfo.id}
            selectedPart={selectedPart}
            triggerPrompt={aiTriggerPrompt}
            setTriggerPrompt={setAiTriggerPrompt}
          />
        )}

        {activeTab === 'content' && (
          <div className="glass-panel p-5 rounded-[24px] border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-4 shadow-2xl h-[580px] overflow-y-auto scrollbar-thin w-full">
            {/* Overview Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                Overview
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3.5 rounded-xl border border-white/5">
                {lessonContent.overview}
              </p>
            </div>

            {/* Key Concepts Section (Balanced square style cards) */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-purple" />
                Key Concepts
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {lessonContent.keyConcepts.map((concept, idx) => (
                  <div key={idx} className="glass-panel p-3.5 rounded-2xl border-white/5 hover:border-brand-purple/30 transition-all duration-300 flex flex-col gap-1 bg-[#090d1a]/55">
                    <span className="text-xs font-bold text-white tracking-wide">{concept.name}</span>
                    <span className="text-[10px] text-gray-400 leading-relaxed">{concept.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Reading Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-pink" />
                Suggested Reading
              </h3>
              <div className="space-y-2">
                {suggestedReading.map((reading, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-200 group">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors">{reading.title}</h4>
                      <p className="text-[9px] text-gray-500">{reading.desc}</p>
                    </div>
                    <span className="text-[9px] font-bold text-brand-pink bg-brand-pink/10 border border-brand-pink/20 px-2.5 py-1 rounded-lg flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      Read <ChevronRight className="h-2.5 w-2.5" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="glass-panel p-5 rounded-[24px] border-white/10 bg-[#050914]/40 backdrop-blur-xl flex flex-col gap-4 shadow-2xl h-[580px] overflow-y-auto scrollbar-thin w-full">
            {(id === 'velocity-accel' || id === 'newtons-laws' || id === 'friction-drag' || id === 'bohr-model' || id === 'electron-config' || id === 'ph-poh-scale' || id === 'acid-base-titrations') ? (
              /* Custom Kinematics/Forces/Friction/Bohr/Config/pH/Titration Laboratory Practice */
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse" />
                  {id === 'velocity-accel' ? 'Kinematics Laboratory Practice' : 
                   id === 'newtons-laws' ? "Newton's Laws Practice" : 
                   id === 'friction-drag' ? 'Friction & Drag Practice' :
                   id === 'bohr-model' ? 'Bohr Model Practice' :
                   id === 'electron-config' ? 'Electron Configuration Practice' :
                   id === 'ph-poh-scale' ? 'Acids & Bases Practice' :
                   'Neutralization & Titration Practice'}
                </h3>

                {practiceProblem && (
                  <div className="glass-panel p-4 rounded-2xl border-white/5 bg-[#090d1a]/55 space-y-4">
                    <p className="text-xs font-bold text-gray-200 leading-relaxed">
                      {practiceProblem.question}
                    </p>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={practiceAnswer}
                        onChange={(e) => setPracticeAnswer(e.target.value)}
                        placeholder="Enter numerical value..."
                        disabled={practiceChecked && practiceIsCorrect}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-950/60 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-brand-cyan text-xs transition-colors"
                      />
                      {!practiceChecked || !practiceIsCorrect ? (
                        <button
                          onClick={handleCheckPracticeAnswer}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-xs font-bold text-white transition-all shadow hover:brightness-110"
                        >
                          Check
                        </button>
                      ) : (
                        <button
                          onClick={handleNextPracticeProblem}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white transition-all shadow hover:bg-emerald-500"
                        >
                          Next Problem
                        </button>
                      )}
                    </div>

                    {practiceFeedback && (
                      <div className={`p-3 rounded-xl border text-[10px] leading-relaxed transition-all duration-300 ${
                        practiceIsCorrect 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400 font-medium'
                      }`}>
                        <span className="font-extrabold block mb-0.5 uppercase tracking-wider">
                          {practiceIsCorrect ? 'Correct!' : 'Incorrect'}
                        </span>
                        {practiceFeedback}
                      </div>
                    )}

                    {practiceChecked && !practiceIsCorrect && (
                      <button
                        onClick={handleNextPracticeProblem}
                        className="text-[10px] text-gray-500 hover:text-white underline transition-colors block text-center w-full"
                      >
                        Skip this problem
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Standard Practice Questions */
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
                  Practice Exercises
                </h3>
                <div className="space-y-2">
                  {practiceQuestions.map((q, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-gray-300 leading-relaxed">
                      <span className="font-mono text-brand-cyan font-bold">{idx + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive MCQ Quiz */}
            <div className="space-y-3 border-t border-white/5 pt-4">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Lesson Quiz
              </h3>

              {quizFinished ? (
                <div className="glass-panel p-4 rounded-2xl border-emerald-500/20 bg-emerald-500/5 text-center space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Check className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-extrabold text-white">Quiz Completed!</h4>
                    <p className="text-xs text-gray-400">
                      You scored <span className="text-emerald-400 font-bold">{score}</span> out of <span className="text-white font-bold">{quizQuestions.length}</span> correct.
                    </p>
                  </div>
                  <button
                    onClick={handleResetQuiz}
                    className="rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-2 text-xs font-bold text-white transition-all shadow-lg hover:brightness-110"
                  >
                    Retake Quiz
                  </button>
                </div>
              ) : (
                <div className="glass-panel p-4 rounded-2xl border-white/5 bg-[#090d1a]/55 space-y-4">
                  {/* Progress Header */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                    <span>QUESTION {currentQuestionIdx + 1} OF {quizQuestions.length}</span>
                    <span className="text-brand-cyan font-mono">SCORE: {score}</span>
                  </div>

                  {/* Question Text */}
                  <p className="text-xs font-bold text-white leading-relaxed">
                    {quizQuestions[currentQuestionIdx].question}
                  </p>

                  {/* Options List */}
                  <div className="space-y-2">
                    {quizQuestions[currentQuestionIdx].options.map((option, optIdx) => {
                      const isSelected = selectedOption === optIdx;
                      const isCorrectOpt = quizQuestions[currentQuestionIdx].answer === optIdx;
                      
                      let btnClass = 'border-white/5 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white';
                      if (isAnswered) {
                        if (isCorrectOpt) {
                          btnClass = 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300 font-bold';
                        } else if (isSelected) {
                          btnClass = 'border-red-500/30 bg-red-500/20 text-red-300 font-bold';
                        } else {
                          btnClass = 'border-white/5 bg-white/5 text-gray-500 opacity-60 cursor-not-allowed';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isAnswered}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full flex items-center justify-between text-left px-3 py-2.5 rounded-xl text-xs transition-all duration-200 border ${btnClass}`}
                        >
                          <span>{option}</span>
                          {isAnswered && isCorrectOpt && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                          {isAnswered && isSelected && !isCorrectOpt && <span className="text-red-400 font-mono">✕</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation and Next Button */}
                  {isAnswered && (
                    <div className="space-y-3 border-t border-white/5 pt-3 animate-fadeIn">
                      <p className="text-[10px] text-gray-400 leading-relaxed italic bg-black/20 p-2.5 rounded-lg">
                        <span className="text-brand-cyan font-bold not-italic block mb-0.5">Explanation:</span>
                        {quizQuestions[currentQuestionIdx].explanation}
                      </p>
                      <button
                        onClick={handleNextQuestion}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan text-xs font-bold text-white hover:brightness-110 transition-all duration-200 shadow-md"
                      >
                        {currentQuestionIdx < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Top Header & Breadcrumbs & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-white/5 pb-4 gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            <span className="hover:text-white transition-colors">{lessonInfo.subjectTitle}</span>
            <ChevronRight className="h-2.5 w-2.5" />
            <span className="hover:text-white transition-colors">{topicInfo?.title || lessonInfo.topicTitle}</span>
            <ChevronRight className="h-2.5 w-2.5" />
            <span className="text-gray-300">{lessonInfo.title}</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            {lessonInfo.title}
            <span className="rounded-full bg-brand-cyan/10 border border-brand-cyan/20 px-2.5 py-0.5 text-[10px] font-bold text-brand-cyan">
              {lessonInfo.difficulty || 'Beginner'}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/topic/${lessonInfo.topicId}`)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Topic
          </button>
          <button
            onClick={handleCompleteLesson}
            disabled={isLessonCompleted || completing}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold text-white transition-all shadow-md ${
              isLessonCompleted
                ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-purple to-brand-cyan hover:brightness-110'
            }`}
          >
            {completing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : isLessonCompleted ? (
              <>
                <Check className="h-3.5 w-3.5" /> Completed (+{lessonInfo.xp || 50} XP)
              </>
            ) : (
              'Mark Complete'
            )}
          </button>
        </div>
      </div>

      {/* Main learning studio layout */}
      {isSimulator ? (
        <div className="flex flex-col gap-6 w-full animate-fadeIn">
          {/* Top: 3D Simulator */}
          <div className="w-full h-[620px] rounded-[24px] overflow-hidden shadow-2xl border border-white/10 bg-slate-950">
            <Unified3DViewer
              mode="sketchfab"
              sketchfabId={lessonContent.sketchfabId}
              title={lessonContent.title}
              lessonName={lessonInfo.title}
              modelPath={`/models/${lessonInfo.subjectId}/${lessonInfo.id}.glb`}
              lessonId={lessonInfo.id}
              selectedPart={selectedPart}
              onSelectPart={selectPart}
              hoveredPart={hoveredPart}
              onHoverPart={hoverPart}
              clickPosition={clickPosition}
              onClickPosition={setClickPosition}
            />
          </div>

          {/* Bottom: Left checklist panel and Right tabbed content (AI Tutor) */}
          <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
            {renderLeftSidebar("w-full lg:w-[240px]")}
            <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
              {renderRightPanelContent()}
            </div>
          </div>
        </div>
      ) : (
        /* Regular 3-Column Layout */
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {renderLeftSidebar("w-full lg:w-[220px]")}
          
          {/* CENTER PANEL */}
          <div className="flex-1 min-w-0 flex flex-col">
            <Unified3DViewer
              mode="sketchfab"
              sketchfabId={lessonContent.sketchfabId}
              title={lessonContent.title}
              lessonName={lessonInfo.title}
              modelPath={`/models/${lessonInfo.subjectId}/${lessonInfo.id}.glb`}
              lessonId={lessonInfo.id}
              selectedPart={selectedPart}
              onSelectPart={selectPart}
              hoveredPart={hoveredPart}
              onHoverPart={hoverPart}
              clickPosition={clickPosition}
              onClickPosition={setClickPosition}
            />
          </div>

          {/* RIGHT PANEL */}
          <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 flex flex-col gap-4">
            {renderRightPanelContent()}
          </div>
        </div>
      )}
    </div>
  );
}
