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
    } else if (id === 'newton-gravitation') {
      const types = ['inverse-square', 'mass-change', 'orbital-speed'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'inverse-square') {
        const F = [80, 120, 160, 200, 400][Math.floor(Math.random() * 5)];
        prob = {
          question: `The gravitational force between two celestial bodies is measured to be ${F} N. If the distance between the bodies is doubled, what is the new gravitational force in Newtons (N)?`,
          answer: F / 4,
          formulaHint: 'F_new = F / (distance_factor^2)',
          explanation: `According to the inverse-square law, gravitational force is inversely proportional to the square of the distance (F ∝ 1/r²). When distance is doubled, the force decreases by a factor of 2² = 4. Thus, F_new = ${F} N / 4 = ${F / 4} N.`
        };
      } else if (type === 'mass-change') {
        const F = [10, 20, 30, 50, 100][Math.floor(Math.random() * 5)];
        const m1Factor = [2, 3][Math.floor(Math.random() * 2)];
        const m2Factor = [2, 4][Math.floor(Math.random() * 2)];
        const ans = F * m1Factor * m2Factor;
        prob = {
          question: `Two stars exert a gravitational force of ${F} N on each other. If the mass of Star 1 is multiplied by ${m1Factor} and the mass of Star 2 is multiplied by ${m2Factor} while keeping the distance constant, what is the new force in Newtons (N)?`,
          answer: ans,
          formulaHint: 'F_new = F * mass1_factor * mass2_factor',
          explanation: `Newton's Law of Universal Gravitation states that force is directly proportional to the product of the two masses (F ∝ m₁ × m₂). Multiplying the masses by ${m1Factor} and ${m2Factor} multiplies the force by ${m1Factor} × ${m2Factor} = ${m1Factor * m2Factor}. Thus, F_new = ${F} N × ${m1Factor * m2Factor} = ${ans} N.`
        };
      } else {
        const pairs = [
          { M: 100, r: 4, v: 5 },
          { M: 144, r: 4, v: 6 },
          { M: 256, r: 4, v: 8 },
          { M: 400, r: 4, v: 10 },
          { M: 900, r: 9, v: 10 }
        ];
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        prob = {
          question: `Under simplified units where G = 1, a planet of mass M = ${pair.M} is orbited by a small satellite at a circular orbital radius r = ${pair.r}. What is the stable orbital velocity (v) of the satellite?`,
          answer: pair.v,
          formulaHint: 'v = sqrt(G * M / r)',
          explanation: `For a stable circular orbit, gravity provides the centripetal force (G*M*m/r² = m*v²/r), which simplifies to v = sqrt(G*M/r). With G = 1, v = sqrt(${pair.M} / ${pair.r}) = sqrt(${pair.M / pair.r}) = ${pair.v}.`
        };
      }
    } else if (id === 'work-energy-theorem') {
      const types = ['work-calc', 'ke-calc', 'velocity-calc'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'work-calc') {
        const F = Math.floor(Math.random() * 30) + 10; // 10-39 N
        const d = Math.floor(Math.random() * 8) + 3;  // 3-10 m
        prob = {
          question: `A student applies a constant force of ${F} N to push a box across a frictionless horizontal surface for a distance of ${d} meters. What is the work done on the box in Joules (J)?`,
          answer: F * d,
          formulaHint: 'W = F * d',
          explanation: `Since the force is horizontal and in the same direction as the displacement (θ = 0°), work is simply: W = F × d = ${F} N × ${d} m = ${F * d} Joules.`
        };
      } else if (type === 'ke-calc') {
        const m = [2, 4, 6, 8][Math.floor(Math.random() * 4)];
        const v = Math.floor(Math.random() * 6) + 2; // 2-7 m/s
        const ke = 0.5 * m * v * v;
        prob = {
          question: `A block of mass m = ${m} kg is sliding along a horizontal surface with a velocity of v = ${v} m/s. What is the kinetic energy (KE) of the block in Joules (J)?`,
          answer: ke,
          formulaHint: 'KE = 0.5 * m * v^2',
          explanation: `Kinetic energy is calculated as: KE = 0.5 × m × v². Here, KE = 0.5 × ${m} kg × (${v} m/s)² = 0.5 × ${m} × ${v * v} = ${ke} Joules.`
        };
      } else {
        const pairs = [
          { m: 2, W: 25, v: 5 },
          { m: 4, W: 50, v: 5 },
          { m: 4, W: 8, v: 2 },
          { m: 2, W: 36, v: 6 },
          { m: 8, W: 100, v: 5 }
        ];
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        prob = {
          question: `A block of mass m = ${pair.m} kg is initially at rest on a frictionless surface. An applied force does exactly W = ${pair.W} Joules of net work on the block. What is its final velocity in m/s?`,
          answer: pair.v,
          formulaHint: 'v = sqrt(2 * W / m)',
          explanation: `According to the Work-Energy Theorem, W_net = ΔKE. Since the block starts from rest, W = KE_final = 0.5 × m × v². Solving for v gives v = sqrt(2 × W / m) = sqrt(2 × ${pair.W} / ${pair.m}) = sqrt(${2 * pair.W / pair.m}) = ${pair.v} m/s.`
        };
      }
    } else if (id === 'conservation-energy') {
      const types = ['pe-calc', 'velocity-calc', 'total-calc'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'pe-calc') {
        const m = [100, 200, 500][Math.floor(Math.random() * 3)];
        const h = Math.floor(Math.random() * 11) + 5; // 5-15 m
        // g = 9.8
        const pe = m * 9.8 * h;
        prob = {
          question: `A roller coaster cart of mass m = ${m} kg is positioned at the top of a hill at a height of h = ${h} meters. Taking the acceleration due to gravity g = 9.8 m/s², what is the gravitational potential energy (PE) of the cart in Joules (J)?`,
          answer: pe,
          formulaHint: 'PE = m * g * h',
          explanation: `Gravitational potential energy is calculated using: PE = m × g × h. In this case, PE = ${m} kg × 9.8 m/s² × ${h} m = ${pe} Joules.`
        };
      } else if (type === 'velocity-calc') {
        const heights = [5, 20, 45, 80];
        const h = heights[Math.floor(Math.random() * heights.length)];
        // g = 10
        const v = Math.sqrt(2 * 10 * h);
        prob = {
          question: `A roller coaster cart starts from rest (v₀ = 0) at the top of a frictionless hill of height h = ${h} meters. Taking the acceleration due to gravity g = 10 m/s², what is the speed of the cart at the bottom of the hill (height = 0) in m/s?`,
          answer: v,
          formulaHint: 'v = sqrt(2 * g * h)',
          explanation: `By Conservation of Energy, PE at the top equals KE at the bottom: m × g × h = 0.5 × m × v². This simplifies to v = sqrt(2 × g × h). Here, v = sqrt(2 × 10 × ${h}) = sqrt(${20 * h}) = ${v} m/s.`
        };
      } else {
        const ke = [500, 1000, 1500, 2000][Math.floor(Math.random() * 4)];
        const pe = [1000, 2000, 3000, 4000][Math.floor(Math.random() * 4)];
        prob = {
          question: `A roller coaster cart of mass m = 200 kg has a kinetic energy of KE = ${ke} J and a potential energy of PE = ${pe} J at a certain point. What is the total mechanical energy (E) of the cart in Joules (J)?`,
          answer: ke + pe,
          formulaHint: 'E = KE + PE',
          explanation: `Total mechanical energy is simply the sum of kinetic and potential energy: E = KE + PE. Here, E = ${ke} J + ${pe} J = ${ke + pe} Joules.`
        };
      }
    } else if (id === 'ohms-law') {
      const types = ['current-calc', 'voltage-calc', 'resistance-calc'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'current-calc') {
        const voltages = [6, 12, 24, 36];
        const resistances = [2, 3, 4, 6];
        const V = voltages[Math.floor(Math.random() * voltages.length)];
        const R = resistances[Math.floor(Math.random() * resistances.length)];
        const I = V / R;
        prob = {
          question: `A simple circuit contains a DC battery with a voltage of V = ${V} V and a resistor of R = ${R} Ω. What is the electric current (I) flowing in the circuit in Amperes (A)?`,
          answer: I,
          formulaHint: 'I = V / R',
          explanation: `According to Ohm's Law, current is voltage divided by resistance: I = V / R. In this case, I = ${V} V / ${R} Ω = ${I.toFixed(2)} Amperes.`
        };
      } else if (type === 'voltage-calc') {
        const I = Math.floor(Math.random() * 4) + 2; // 2-5 A
        const R = [2, 4, 5, 10][Math.floor(Math.random() * 4)];
        const V = I * R;
        prob = {
          question: `An electric current of I = ${I} A flows through a resistor with a resistance of R = ${R} Ω. What is the voltage drop (V) across this resistor in Volts (V)?`,
          answer: V,
          formulaHint: 'V = I * R',
          explanation: `Using Ohm's Law in the form V = I × R, we calculate: V = ${I} A × ${R} Ω = ${V} Volts.`
        };
      } else {
        const voltages = [9, 15, 20, 30];
        const currents = [1.5, 3, 5, 2];
        const pairIdx = Math.floor(Math.random() * voltages.length);
        const V = voltages[pairIdx];
        const I = currents[pairIdx];
        const R = V / I;
        prob = {
          question: `A light bulb draws a current of I = ${I} A when connected to a V = ${V} V battery. What is the electrical resistance (R) of the bulb in Ohms (Ω)?`,
          answer: R,
          formulaHint: 'R = V / I',
          explanation: `By rearranging Ohm's Law, we get resistance: R = V / I. Here, R = ${V} V / ${I} A = ${R} Ω.`
        };
      }
    } else if (id === 'kirchhoffs-laws') {
      const types = ['junction-calc', 'loop-calc', 'branch-calc'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'junction-calc') {
        const I1 = Math.floor(Math.random() * 5) + 2; // 2-6 A
        const I2 = Math.floor(Math.random() * 5) + 1; // 1-5 A
        prob = {
          question: `At a circuit junction, three wires meet. Current I₁ = ${I1} A flows into the junction, and current I₂ = ${I2} A flows into the junction. By Kirchhoff's Junction Rule, how much current (I₃) in Amperes must leave the junction?`,
          answer: I1 + I2,
          formulaHint: 'I_in = I_out',
          explanation: `According to Kirchhoff's Junction Rule (Current Law), the sum of currents entering a junction equals the sum of currents leaving it: I_in = I_out. Here, I₃ = I₁ + I₂ = ${I1} A + ${I2} A = ${I1 + I2} A.`
        };
      } else if (type === 'loop-calc') {
        const V = [9, 12, 24][Math.floor(Math.random() * 3)];
        const V1 = Math.floor(Math.random() * (V - 4)) + 2;
        prob = {
          question: `A single closed loop consists of a battery of voltage V = ${V} V and two resistors connected in series. If the voltage drop across the first resistor is V₁ = ${V1} V, what is the voltage drop (V₂) across the second resistor in Volts (V)?`,
          answer: V - V1,
          formulaHint: 'V_battery - V₁ - V₂ = 0',
          explanation: `According to Kirchhoff's Loop Rule (Voltage Law), the algebraic sum of changes in potential around any closed loop must be zero: V_battery - V₁ - V₂ = 0. Therefore, V₂ = V_battery - V₁ = ${V} V - ${V1} V = ${V - V1} V.`
        };
      } else {
        const I_total = Math.floor(Math.random() * 6) + 4; // 4-9 A
        const I1 = Math.floor(Math.random() * (I_total - 2)) + 1;
        prob = {
          question: `A total current of I_total = ${I_total} A enters a junction node and branches into two parallel paths. If the current through the first branch is measured as I₁ = ${I1} A, what is the current (I₂) flowing through the second branch in Amperes (A)?`,
          answer: I_total - I1,
          formulaHint: 'I_total = I₁ + I₂',
          explanation: `By Kirchhoff's Junction Rule, the total current entering must equal the total current leaving: I_total = I₁ + I₂. Rearranging gives I₂ = I_total - I₁ = ${I_total} A - ${I1} A = ${I_total - I1} Amperes.`
        };
      }
    } else if (id === 'magnetic-fields') {
      const types = ['magnetic-force', 'cyclotron-radius', 'electric-force'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'magnetic-force') {
        const q = [1, 2, 3, 5][Math.floor(Math.random() * 4)];
        const v = [10, 20, 30, 40][Math.floor(Math.random() * 4)];
        const B = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        prob = {
          question: `A particle of charge q = ${q} C moves with speed v = ${v} m/s perpendicular to a uniform magnetic field B = ${B} T. What is the magnitude of the magnetic Lorentz force (F_b) in Newtons (N)?`,
          answer: q * v * B,
          formulaHint: 'F_b = q * v * B',
          explanation: `For motion perpendicular to the magnetic field (θ = 90°), the magnetic force is: F_b = q × v × B. Here, F_b = ${q} C × ${v} m/s × ${B} T = ${q * v * B} Newtons.`
        };
      } else if (type === 'cyclotron-radius') {
        const m = 2; // kg
        const q = 1; // C
        const v = [6, 12, 18, 24][Math.floor(Math.random() * 4)];
        const B = [2, 3, 4, 6][Math.floor(Math.random() * 4)];
        const r = (m * v) / (q * B);
        prob = {
          question: `A particle of mass m = ${m} kg and charge q = ${q} C enters a uniform magnetic field B = ${B} T perpendicular to field lines with speed v = ${v} m/s. What is the cyclotron orbit radius (r) in meters?`,
          answer: r,
          formulaHint: 'r = (m * v) / (q * B)',
          explanation: `The magnetic force provides the centripetal force: q × v × B = (m × v²) / r. Solving for r gives r = (m × v) / (q × B). Here, r = (${m} kg × ${v} m/s) / (${q} C × ${B} T) = ${r.toFixed(2)} meters.`
        };
      } else {
        const q = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
        const E = [100, 200, 300, 500][Math.floor(Math.random() * 4)];
        prob = {
          question: `A charged particle of charge q = ${q} C is placed in a uniform electric field of strength E = ${E} N/C. What is the magnitude of the electric force (F_e) acting on the particle in Newtons (N)?`,
          answer: q * E,
          formulaHint: 'F_e = q * E',
          explanation: `The force experienced by a charge in an electric field is simply: F_e = q × E. In this case, F_e = ${q} C × ${E} N/C = ${q * E} Newtons.`
        };
      }
    } else if (id === 'wave-properties') {
      const types = ['speed-calc', 'period-calc', 'wavelength-calc'];
      const type = types[Math.floor(Math.random() * types.length)];

      if (type === 'speed-calc') {
        const f = [2, 5, 10, 20][Math.floor(Math.random() * 4)];
        const L = [1.5, 2, 4, 5][Math.floor(Math.random() * 4)];
        prob = {
          question: `A periodic wave has a frequency of f = ${f} Hz and a wavelength of λ = ${L} meters. What is the propagation speed (v) of this wave in meters per second (m/s)?`,
          answer: f * L,
          formulaHint: 'v = f * λ',
          explanation: `The speed of a wave is calculated by multiplying its frequency by its wavelength: v = f × λ. In this case, v = ${f} Hz × ${L} m = ${f * L} m/s.`
        };
      } else if (type === 'period-calc') {
        const f = [4, 5, 8, 10][Math.floor(Math.random() * 4)];
        const T = 1 / f;
        prob = {
          question: `A water ripple propagates with a frequency of f = ${f} Hz. Find the period (T) of the wave in seconds.`,
          answer: T,
          formulaHint: 'T = 1 / f',
          explanation: `The period of a wave is the reciprocal of its frequency: T = 1 / f. Therefore, T = 1 / ${f} Hz = ${T.toFixed(3)} seconds.`
        };
      } else {
        const f = [85, 170, 340][Math.floor(Math.random() * 3)];
        const v = 340; // speed of sound
        const L = v / f;
        prob = {
          question: `A sound wave propagates through air at speed v = ${v} m/s. If the frequency of the sound is f = ${f} Hz, what is its wavelength (λ) in meters?`,
          answer: L,
          formulaHint: 'λ = v / f',
          explanation: `Rearranging the wave equation v = f × λ gives the wavelength: λ = v / f. In this case, λ = ${v} m/s / ${f} Hz = ${L.toFixed(1)} meters.`
        };
      }
    } else if (id === 'ionic-vs-covalent' || id === 'molecular-geometry') {
      const questions = [
        { q: "What type of bond forms when electrons are completely transferred from a metal to a nonmetal?", a: "Ionic", hint: "Electrostatic attraction between opposite ions", exp: "Ionic bonds result from electron transfer (typically metal to nonmetal)." },
        { q: "What type of bond forms when two nonmetals share valence electrons?", a: "Covalent", hint: "Shared electron pairs", exp: "Covalent bonds result from electron sharing between atoms of similar electronegativity." }
      ];
      const selected = questions[Math.floor(Math.random() * questions.length)];
      prob = {
        question: selected.q,
        answer: selected.a,
        formulaHint: selected.hint,
        explanation: selected.exp
      };
    } else if (id === 'balancing-equations' || id === 'stoichiometry-calculations') {
      prob = {
        question: "To balance: __ H₂ + O₂ → 2 H₂O, what coefficient goes in front of H₂?",
        answer: 2,
        formulaHint: "Count total hydrogen atoms on both sides",
        explanation: "Since the products side has 2 H2O (4 hydrogens), the reactants side must have 2 H2 (4 hydrogens)."
      };
    } else if (id === 'periodic-trends' || id === 'element-groups') {
      prob = {
        question: "Which element has the highest electronegativity on the periodic table? (Write full name)",
        answer: "Fluorine",
        formulaHint: "Electronegativity increases up and to the right",
        explanation: "Fluorine has the highest electronegativity value (3.98) due to its small radius and high effective nuclear charge."
      };
    } else if (id === 'hydrocarbons' || id === 'functional-groups') {
      prob = {
        question: "What is the molecular formula of ethanol?",
        answer: "C2H5OH",
        formulaHint: "Two carbons, a hydroxyl group",
        explanation: "Ethanol consists of an ethyl group bonded to a hydroxyl group: C2H5OH."
      };
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

  useEffect(() => {
    handleNextPracticeProblem();
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

  const isSimulator = [
    'velocity-accel', 'newtons-laws', 'friction-drag', 'bohr-model', 'electron-config', 
    'ph-poh-scale', 'acid-base-titrations', 'newton-gravitation', 'work-energy-theorem', 
    'ohms-law', 'kirchhoffs-laws', 'magnetic-fields', 'wave-properties',
    'ionic-vs-covalent', 'molecular-geometry', 'balancing-equations', 'stoichiometry-calculations',
    'periodic-trends', 'element-groups', 'hydrocarbons', 'functional-groups'
  ].includes(id);

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
