// Curriculum data for SciLearn AI Platform

export const subjects = {
  biology: {
    id: 'biology',
    title: 'Biology',
    description: 'Explore the fascinating science of life, from microscopic cells to complex human anatomy.',
    icon: 'Dna',
    topicsCount: 3,
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
          { id: 'eye-iris', title: 'Eye / Iris Anatomy', duration: '15 mins', difficulty: 'Intermediate', xp: 100, sketchfabId: 'a572a1cf05c64391b15809796e903f7e' }
        ]
      },
      {
        id: 'plant-biology',
        title: 'Plant Biology',
        description: 'Study plant structures, growth, reproduction, and adaptation mechanisms.',
        lessons: [
          { id: 'plant-cell-structure', title: 'Structure of Plant Cells', duration: '10 mins', difficulty: 'Beginner', xp: 50, sketchfabId: 'f258c65762e5435c9d58c1aa136b557a' }
        ]
      },
      {
        id: 'photosynthesis',
        title: 'Photosynthesis',
        description: 'How plants convert light energy into chemical energy.',
        lessons: [
          { id: 'light-reactions', title: 'Photosystem I & II Light Capture', duration: '25 mins', difficulty: 'Advanced', xp: 100 },
          { id: 'photosynthesis-process', title: 'Photosynthesis Process', duration: '20 mins', difficulty: 'Advanced', xp: 100, sketchfabId: 'acb8f9771ac84986a70f9c5f5de9d2c0' }
        ]
      }
    ]
  },
  physics: {
    id: 'physics',
    title: 'Physics',
    description: 'Learn the fundamental laws of nature, from forces and energy to wave mechanics.',
    icon: 'Atom',
    topicsCount: 7,
    color: 'from-cyan-500 to-blue-500',
    glowColor: 'rgba(6, 182, 212, 0.2)',
    topics: [
      {
        id: 'motion',
        title: 'Motion',
        description: 'Kinematics, velocity, acceleration, and graphing motion over time.',
        lessons: [
          { id: 'velocity-accel', title: 'Displacement, Velocity & Acceleration', duration: '15 mins', difficulty: 'Beginner', xp: 50 }
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
        description: 'Universal gravitation, Newtonian orbits, and gravitational fields.',
        lessons: [
          { id: 'newton-gravitation', title: 'Newtonian Universal Gravitation', duration: '15 mins', difficulty: 'Beginner' }
        ]
      },
      {
        id: 'energy',
        title: 'Energy',
        description: 'Work, kinetic and potential energy, and conservation laws.',
        lessons: [
          { id: 'work-energy-theorem', title: 'The Work-Energy Theorem', duration: '18 mins', difficulty: 'Beginner' }
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
          { id: 'magnetic-fields', title: 'Lorentz Force & Wire Magnetic Fields', duration: '20 mins', difficulty: 'Intermediate' }
        ]
      },
      {
        id: 'waves',
        title: 'Waves',
        description: 'Transverse and longitudinal waves, frequency, and wave interference.',
        lessons: [
          { id: 'wave-properties', title: 'Amplitude, Frequency & Wavelength', duration: '12 mins', difficulty: 'Beginner' }
        ]
      }
    ]
  },
  chemistry: {
    id: 'chemistry',
    title: 'Chemistry',
    description: 'Investigate chemical processes, structure of matter, and the reactions that shape our world.',
    icon: 'FlaskConical',
    topicsCount: 5,
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
          { id: 'ionic-vs-covalent', title: 'Ionic vs. Covalent Bonds', duration: '12 mins', difficulty: 'Beginner' }
        ]
      },
      {
        id: 'chemical-reactions',
        title: 'Chemical Reactions',
        description: 'Types of reactions, stoichiometry, and balancing chemical equations.',
        lessons: [
          { id: 'balancing-equations', title: 'Law of Conservation of Mass & Balancing', duration: '15 mins', difficulty: 'Beginner' }
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
        id: 'organic-chemistry',
        title: 'Organic Chemistry',
        description: 'Nomenclature of hydrocarbons, functional groups, and basic mechanisms.',
        lessons: [
          { id: 'hydrocarbons', title: 'Alkanes, Alkenes & Alkynes Nomenclature', duration: '20 mins', difficulty: 'Intermediate' }
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
