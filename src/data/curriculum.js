// Curriculum data for SciLearn AI Platform

export const subjects = {
  biology: {
    id: 'biology',
    title: 'Biology',
    description: 'Explore the fascinating science of life, from microscopic cells to complex human anatomy.',
    icon: 'Dna',
    topicsCount: 8,
    color: 'from-emerald-500 to-teal-400',
    glowColor: 'rgba(16, 185, 129, 0.2)',
    topics: [
      {
        id: 'human-anatomy',
        title: 'Human Anatomy',
        description: 'Understand the systems and organs that keep the human body functioning.',
        lessons: [
          { id: 'heart', title: 'The Heart & Circulatory System', duration: '15 mins', difficulty: 'Beginner' },
          { id: 'brain-cns', title: 'The Brain & Central Nervous System', duration: '20 mins', difficulty: 'Advanced', xp: 150, sketchfabId: '0aa0e33c5c854d1bab7bac9e1c7acaec' },
          { id: 'stomach-digestive-process', title: 'The Stomach & Digestive Process', duration: '12 mins', difficulty: 'Beginner', xp: 50, sketchfabId: 'b802a793c81b4c78a382324619134742' },
          { id: 'lungs', title: 'The Lungs & Respiratory Mechanics', duration: '15 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'plant-biology',
        title: 'Plant Biology',
        description: 'Study plant structures, growth, reproduction, and adaptation mechanisms.',
        lessons: [
          { id: 'plant-cell-structure', title: 'Structure of Plant Cells', duration: '10 mins', difficulty: 'Beginner', xp: 50, sketchfabId: 'f258c65762e5435c9d58c1aa136b557a' },
          { id: 'vascular-system', title: 'Xylem & Phloem Transport', duration: '18 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'cell-biology',
        title: 'Cell Biology',
        description: 'Investigate the building blocks of life, cellular respiration, and division.',
        lessons: [
          { id: 'mitochondria', title: 'Mitochondria & ATP Generation', duration: '25 mins', difficulty: 'Advanced' },
          { id: 'mitosis', title: 'Mitosis vs. Meiosis Division', duration: '20 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'genetics',
        title: 'Genetics',
        description: 'Decode DNA structure, genes, inheritance patterns, and mutations.',
        lessons: [
          { id: 'dna-structure', title: 'DNA Double Helix & Base Pairing', duration: '15 mins', difficulty: 'Beginner' },
          { id: 'mendelian-genetics', title: 'Punnett Squares & Dominance', duration: '22 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'photosynthesis',
        title: 'Photosynthesis',
        description: 'How plants convert light energy into chemical energy.',
        lessons: [
          { id: 'light-reactions', title: 'Photosystem I & II Light Capture', duration: '25 mins', difficulty: 'Advanced' },
          { id: 'calvin-cycle', title: 'Dark Reactions & Carbon Fixation', duration: '20 mins', difficulty: 'Advanced' }
        ]
      },
      {
        id: 'digestive-system',
        title: 'Digestive System',
        description: 'The biochemical process of breaking down nutrients.',
        lessons: [
          { id: 'enzymes', title: 'Amylase, Pepsin & Lipase Enzymes', duration: '15 mins', difficulty: 'Intermediate' },
          { id: 'nutrient-absorption', title: 'Small Intestine Villi Mechanics', duration: '15 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'respiratory-system',
        title: 'Respiratory System',
        description: 'Mechanisms of gas exchange and breathing control.',
        lessons: [
          { id: 'alveoli', title: 'Alveolar Gas Exchange', duration: '12 mins', difficulty: 'Beginner' },
          { id: 'hemoglobin', title: 'Oxygen Transport via Hemoglobin', duration: '18 mins', difficulty: 'Advanced' }
        ]
      },
      {
        id: 'nervous-system',
        title: 'Nervous System',
        description: 'Explore neural signaling, synapses, and sensory organs.',
        lessons: [
          { id: 'action-potential', title: 'Neuronal Depolarization & Action Potential', duration: '28 mins', difficulty: 'Advanced' },
          { id: 'synaptic-transmission', title: 'Neurotransmitters & Synapses', duration: '18 mins', difficulty: 'Intermediate' }
        ]
      }
    ]
  },
  physics: {
    id: 'physics',
    title: 'Physics',
    description: 'Learn the fundamental laws of nature, from forces and energy to the solar system.',
    icon: 'Atom',
    topicsCount: 9,
    color: 'from-cyan-500 to-blue-500',
    glowColor: 'rgba(6, 182, 212, 0.2)',
    topics: [
      {
        id: 'motion',
        title: 'Motion',
        description: 'Kinematics, velocity, acceleration, and graphing motion over time.',
        lessons: [
          { id: 'velocity-accel', title: 'Displacement, Velocity & Acceleration', duration: '15 mins', difficulty: 'Beginner', xp: 50 },
          { id: 'kinematic-equations', title: 'Deriving the Big Three Equations', duration: '25 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'force',
        title: 'Force',
        description: 'Newtons Laws of Motion, friction, and vector forces in equilibrium.',
        lessons: [
          { id: 'newtons-laws', title: 'Newton\'s Three Laws of Motion', duration: '15 mins', difficulty: 'Beginner' },
          { id: 'friction-drag', title: 'Coefficient of Friction & Drag Forces', duration: '20 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'gravity',
        title: 'Gravity',
        description: 'Universal gravitation, Keplerian orbits, and gravitational fields.',
        lessons: [
          { id: 'newton-gravitation', title: 'Newtonian Universal Gravitation', duration: '15 mins', difficulty: 'Beginner' },
          { id: 'spacetime-curvature', title: 'Einstein\'s Curved Spacetime Overview', duration: '30 mins', difficulty: 'Advanced' }
        ]
      },
      {
        id: 'energy',
        title: 'Energy',
        description: 'Work, kinetic and potential energy, and conservation laws.',
        lessons: [
          { id: 'work-energy-theorem', title: 'The Work-Energy Theorem', duration: '18 mins', difficulty: 'Beginner' },
          { id: 'conservation-energy', title: 'Conservation of Mechanical Energy', duration: '22 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'electricity',
        title: 'Electricity',
        description: 'Electric charge, currents, resistance, and Ohm\'s Law.',
        lessons: [
          { id: 'ohms-law', title: 'Ohm\'s Law & Circuit Schematics', duration: '12 mins', difficulty: 'Beginner' },
          { id: 'kirchhoffs-laws', title: 'Kirchhoff\'s Junction & Loop Rules', duration: '24 mins', difficulty: 'Advanced' }
        ]
      },
      {
        id: 'magnetism',
        title: 'Magnetism',
        description: 'Magnetic fields, electromagnetism, and Faraday\'s Law.',
        lessons: [
          { id: 'magnetic-fields', title: 'Lorentz Force & Wire Magnetic Fields', duration: '20 mins', difficulty: 'Intermediate' },
          { id: 'faradays-induction', title: 'Electromagnetic Induction & Generators', duration: '25 mins', difficulty: 'Advanced' }
        ]
      },
      {
        id: 'waves',
        title: 'Waves',
        description: 'Transverse and longitudinal waves, frequency, and wave interference.',
        lessons: [
          { id: 'wave-properties', title: 'Amplitude, Frequency & Wavelength', duration: '12 mins', difficulty: 'Beginner' },
          { id: 'wave-interference', title: 'Superposition & Standing Waves', duration: '20 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'optics',
        title: 'Optics',
        description: 'Reflection, refraction, lenses, mirrors, and wave optics.',
        lessons: [
          { id: 'snells-law', title: 'Snell\'s Law & Total Internal Reflection', duration: '18 mins', difficulty: 'Intermediate' },
          { id: 'diffraction-interference', title: 'Double Slit Interference Experiment', duration: '22 mins', difficulty: 'Advanced' }
        ]
      },
      {
        id: 'solar-system',
        title: 'Solar System',
        description: 'Celestial orbits, planets, stars, and basic cosmology.',
        lessons: [
          { id: 'orbital-mechanics', title: 'Kepler\'s Laws of Planetary Motion', duration: '20 mins', difficulty: 'Intermediate' },
          { id: 'stellar-evolution', title: 'Lifecycle of Stars: Nebula to Black Hole', duration: '25 mins', difficulty: 'Intermediate' }
        ]
      }
    ]
  },
  chemistry: {
    id: 'chemistry',
    title: 'Chemistry',
    description: 'Investigate chemical processes, structure of matter, and the reactions that shape our world.',
    icon: 'FlaskConical',
    topicsCount: 7,
    color: 'from-violet-500 to-fuchsia-500',
    glowColor: 'rgba(139, 92, 246, 0.2)',
    topics: [
      {
        id: 'atomic-structure',
        title: 'Atomic Structure',
        description: 'Subatomic particles, electron configuration, and isotopic notation.',
        lessons: [
          { id: 'bohr-model', title: 'The Bohr Model & Quantum Energy Levels', duration: '15 mins', difficulty: 'Beginner' },
          { id: 'electron-config', title: 's, p, d, f Electron Configurations', duration: '25 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'chemical-bonding',
        title: 'Chemical Bonding',
        description: 'Ionic, covalent, metallic bonding, and Lewis structures.',
        lessons: [
          { id: 'ionic-vs-covalent', title: 'Ionic vs. Covalent Bonds', duration: '12 mins', difficulty: 'Beginner' },
          { id: 'molecular-geometry', title: 'VSEPR Theory & Molecular Shapes', duration: '22 mins', difficulty: 'Advanced' }
        ]
      },
      {
        id: 'chemical-reactions',
        title: 'Chemical Reactions',
        description: 'Types of reactions, stoichiometry, and balancing chemical equations.',
        lessons: [
          { id: 'balancing-equations', title: 'Law of Conservation of Mass & Balancing', duration: '15 mins', difficulty: 'Beginner' },
          { id: 'stoichiometry-calculations', title: 'Mole-to-Mole & Mass-to-Mass Ratios', duration: '25 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'acids-and-bases',
        title: 'Acids and Bases',
        description: 'pH scale, Bronsted-Lowry theory, and titration reactions.',
        lessons: [
          { id: 'ph-poh-scale', title: 'Understanding pH & Strong vs Weak Acids', duration: '15 mins', difficulty: 'Beginner' },
          { id: 'acid-base-titrations', title: 'Neutralization & Titration Math', duration: '22 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'periodic-table',
        title: 'Periodic Table',
        description: 'Periodic trends including electronegativity, atomic radius, and ionization energy.',
        lessons: [
          { id: 'periodic-trends', title: 'Electronegativity, Ionization & Atomic Radius', duration: '18 mins', difficulty: 'Intermediate' },
          { id: 'element-groups', title: 'Alkali Metals, Halogens, & Noble Gases', duration: '12 mins', difficulty: 'Beginner' }
        ]
      },
      {
        id: 'organic-chemistry',
        title: 'Organic Chemistry',
        description: 'Nomenclature of hydrocarbons, functional groups, and basic mechanisms.',
        lessons: [
          { id: 'hydrocarbons', title: 'Alkanes, Alkenes & Alkynes Nomenclature', duration: '20 mins', difficulty: 'Intermediate' },
          { id: 'functional-groups', title: 'Alcohols, Ethers, Aldehydes & Ketones', duration: '25 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'electrochemistry',
        title: 'Electrochemistry',
        description: 'Redox reactions, galvanic cells, and electrolysis.',
        lessons: [
          { id: 'redox-reactions', title: 'Oxidation Numbers & Half-Reactions', duration: '20 mins', difficulty: 'Intermediate' },
          { id: 'galvanic-voltaic-cells', title: 'Anodes, Cathodes & Cell Potential', duration: '28 mins', difficulty: 'Advanced' }
        ]
      }
    ]
  }
};

// Help helper to get lessons by ID
export const getTopicById = (topicId) => {
  for (const subKey in subjects) {
    const topic = subjects[subKey].topics.find(t => t.id === topicId);
    if (topic) {
      return {
        ...topic,
        subjectId: subKey,
        subjectTitle: subjects[subKey].title
      };
    }
  }
  return null;
};

export const getLessonById = (lessonId) => {
  for (const subKey in subjects) {
    for (const topic of subjects[subKey].topics) {
      const lesson = topic.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return {
          ...lesson,
          topicId: topic.id,
          topicTitle: topic.title,
          subjectId: subKey,
          subjectTitle: subjects[subKey].title
        };
      }
    }
  }
  return null;
};
