/**
 * Curated list of allowed topics and keywords for lesson locking.
 * Helps keep the AI Tutor strictly focused on the subject at hand.
 */
export const lessonFilters = {
  // Biology
  heart: {
    lessonName: "The Heart & Circulatory System",
    allowedTopics: [
      "Heart Anatomy",
      "Blood Circulation",
      "Heart Chambers",
      "Arteries and Veins",
      "Cardiac Function"
    ],
    keywords: [
      "heart", "cardiac", "circulation", "circulatory", "blood", "artery", "arteries", "vein", "veins",
      "chamber", "chambers", "atrium", "atria", "ventricle", "ventricles", "valve", "valves",
      "aorta", "pulmonary", "systemic", "beat", "heartbeat", "rhythm", "pulse", "pacemaker", "sa node",
      "myocardium", "oxygenated", "deoxygenated", "tricuspid", "bicuspid", "mitral", "cardiovascular"
    ]
  },
  "brain-cns": {
    lessonName: "The Brain & Central Nervous System",
    allowedTopics: [
      "Brain Anatomy",
      "Central Nervous System",
      "Cerebrum & Lobes",
      "Brainstem & Cerebellum",
      "Neurons & Synapses"
    ],
    keywords: [
      "brain", "cns", "nervous", "cerebrum", "cerebellum", "stem", "brainstem", "lobe", "lobes",
      "frontal", "parietal", "occipital", "temporal", "neuron", "neurons", "glial", "synapse", "synapses",
      "spinal", "cord", "myelin", "axon", "dendrite", "neurotransmitter", "action potential", "reflex",
      "hypothalamus", "thalamus", "hippocampus", "amygdala", "cortex", "meninges", "barrier", "bbb"
    ]
  },
  "stomach-digestive-process": {
    lessonName: "The Stomach & Digestive Process",
    allowedTopics: [
      "Stomach Anatomy",
      "Digestive Functions",
      "Gastric Acid & Enzymes",
      "Blood Supply & Arteries",
      "Protein Digestion"
    ],
    keywords: [
      "stomach", "digest", "digestion", "digestive", "cardia", "fundus", "body", "pylorus", "sphincter",
      "acid", "gastric", "hcl", "hydrochloric", "pepsin", "pepsinogen", "enzyme", "enzymes", "mucus",
      "mucosal", "bicarbonate", "chyme", "esophagus", "peristalsis", "protein", "proteins", "arteries",
      "celiac", "gastrointestinal"
    ]
  },
  "eye-iris": {
    lessonName: "Eye / Iris Anatomy",
    allowedTopics: [
      "Eye Anatomy",
      "Iris and Pupil Mechanics",
      "Cornea and Lens Function",
      "Retina and Photoreceptors",
      "Visual Signal Pathway"
    ],
    keywords: [
      "eye", "iris", "pupil", "cornea", "lens", "retina", "photoreceptor", "photoreceptors",
      "rod", "rods", "cone", "cones", "nerve", "optic nerve", "vision", "visual", "light",
      "aperture", "constriction", "dilation", "sphincter", "dilator", "pupillae", "ciliary",
      "refraction", "focus", "retinal", "blind spot", "photons", "fovea", "macula", "sclera", "choroid"
    ]
  },
  "plant-cell-structure": {
    lessonName: "Structure of Plant Cells",
    allowedTopics: [
      "Plant Cell Organelles",
      "Cell Wall & Cellulose",
      "Chloroplasts & Photosynthesis",
      "Central Vacuole",
      "Turgor Pressure"
    ],
    keywords: [
      "plant cell", "organelle", "organelles", "cell wall", "cellulose", "chloroplast", "chloroplasts",
      "vacuole", "vacuoles", "turgor", "plastid", "photosynthesis", "chlorophyll", "cytoplasm",
      "membrane", "eukaryotic", "tonoplast", "plasmodesmata", "plant", "cells", "nucleus", "nucleolus",
      "mitochondria", "endoplasmic reticulum", "er", "golgi", "ribosome", "ribosomes"
    ]
  },
  "photosynthesis-process": {
    lessonName: "Photosynthesis Process",
    allowedTopics: [
      "Photosynthesis Overview",
      "Chloroplast Structure",
      "Light-dependent Reactions",
      "Calvin Cycle",
      "ATP and NADPH Production",
      "Carbon Fixation"
    ],
    keywords: [
      "photosynthesis", "chloroplast", "chloroplasts", "thylakoid", "thylakoids", "granum", "grana",
      "stroma", "chlorophyll", "pigment", "pigments", "photon", "photons", "light", "photosystem",
      "ps1", "ps2", "nadph", "nadp+", "atp", "adp", "synthase", "proton", "gradient", "rubisco",
      "calvin", "cycle", "fixation", "g3p", "glucose", "sugar", "sugars", "water", "splitting", "oxygen",
      "co2", "carbon dioxide", "dark reactions", "light reactions", "reduction", "regeneration"
    ]
  },
  "light-reactions": {
    lessonName: "Photosystem I & II Light Capture",
    allowedTopics: [
      "Photosystem I",
      "Photosystem II",
      "Light-dependent Reactions",
      "Electron Transport Chain",
      "Photophosphorylation",
      "Water Splitting"
    ],
    keywords: [
      "photosystem", "psii", "psi", "chlorophyll", "light", "reactions", "thylakoid", "membrane",
      "electron", "transport", "chain", "etc", "water", "splitting", "photolysis", "oxygen", "protons",
      "atp", "nadph", "nadp+", "adp", "synthase", "photophosphorylation", "gradient", "plastoquinone",
      "plastocyanin", "ferredoxin", "lumen", "photosystem i", "photosystem ii"
    ]
  },

  // Physics
  "velocity-accel": {
    lessonName: "Displacement, Velocity & Acceleration",
    allowedTopics: [
      "Displacement",
      "Velocity Vectors",
      "Acceleration Rate",
      "Motion Graphing",
      "Kinematics Basics"
    ],
    keywords: [
      "displacement", "velocity", "acceleration", "motion", "speed", "vector", "scalar", "kinematics",
      "time", "position", "distance", "graph", "derivatives", "slope"
    ]
  },
  "newtons-laws": {
    lessonName: "Newton's Three Laws of Motion",
    allowedTopics: [
      "Newton's Laws",
      "Inertia (First Law)",
      "F=ma (Second Law)",
      "Action-Reaction (Third Law)",
      "Net Forces"
    ],
    keywords: [
      "newton", "laws", "law", "motion", "inertia", "force", "mass", "acceleration", "action", "reaction",
      "f=ma", "net force", "gravity", "weight", "equilibrium"
    ]
  },
  "friction-drag": {
    lessonName: "Coefficient of Friction & Drag Forces",
    allowedTopics: [
      "Static & Kinetic Friction",
      "Coefficient of Friction",
      "Drag Forces",
      "Terminal Velocity",
      "Air Resistance"
    ],
    keywords: [
      "friction", "drag", "coefficient", "static", "kinetic", "resistance", "air", "terminal", "velocity",
      "normal force", "fluid", "viscosity"
    ]
  },
  "newton-gravitation": {
    lessonName: "Newtonian Universal Gravitation",
    allowedTopics: [
      "Universal Gravitation",
      "Gravitational Constant (G)",
      "Inverse-Square Law",
      "Gravitational Fields",
      "Orbits & Kepler"
    ],
    keywords: [
      "gravity", "gravitation", "universal", "constant", "inverse-square", "masses", "distance", "field",
      "force", "orbit", "planetary"
    ]
  },
  "work-energy-theorem": {
    lessonName: "The Work-Energy Theorem",
    allowedTopics: [
      "Work-Energy relationship",
      "Work Done",
      "Kinetic Energy",
      "Net Force",
      "Frictional Dissipation"
    ],
    keywords: [
      "work", "energy", "kinetic", "theorem", "force", "displacement", "ramp", "incline", "friction", "normal force", "mechanical"
    ]
  },

  "ohms-law": {
    lessonName: "Ohm's Law & Circuit Schematics",
    allowedTopics: [
      "Ohm's Law",
      "Voltage, Current, Resistance",
      "Circuits",
      "Schematics",
      "Resistors"
    ],
    keywords: [
      "ohms", "ohm", "voltage", "volt", "volts", "current", "ampere", "amp", "amps", "resistance",
      "resistor", "circuit", "schematic", "series", "parallel", "battery", "multimeter", "v=ir", "voltage drop"
    ]
  },
  "kirchhoffs-laws": {
    lessonName: "Kirchhoff's Junction & Loop Rules",
    allowedTopics: [
      "Kirchhoff's Junction Rule (KCL)",
      "Kirchhoff's Loop Rule (KVL)",
      "Conservation of Charge",
      "Conservation of Energy",
      "Branch Currents",
      "Junction Node",
      "Multi-Loop Circuits"
    ],
    keywords: [
      "kirchhoff", "kirchhoff's", "junction", "loop", "rules", "kcl", "kvl", "conservation", "charge", "energy", "node", "branch", "current", "voltage", "resistor", "battery", "loop rule", "junction rule"
    ]
  },
  "magnetic-fields": {
    lessonName: "Lorentz Force & Wire Magnetic Fields",
    allowedTopics: [
      "Lorentz Force",
      "Magnetic Fields",
      "Electric Fields",
      "Cyclotron Motion",
      "Right-Hand Rule"
    ],
    keywords: [
      "lorentz", "magnetic", "field", "fields", "electric", "force", "charge", "velocity", "vector", "cyclotron", "right-hand", "helix", "helical", "trajectory"
    ]
  },
  "wave-properties": {
    lessonName: "Amplitude, Frequency & Wavelength",
    allowedTopics: [
      "Wave Fundamentals",
      "Wave Amplitude",
      "Wave Frequency",
      "Wavelength",
      "Wave Period",
      "Wave Speed Equation"
    ],
    keywords: [
      "wave", "waves", "amplitude", "frequency", "wavelength", "period", "speed", "hertz", "hz", "lambda", "crest", "trough", "transverse", "longitudinal", "equilibrium"
    ]
  },


  // Chemistry
  "bohr-model": {
    lessonName: "The Bohr Model & Quantum Energy Levels",
    allowedTopics: [
      "Bohr Model",
      "Subatomic Particles",
      "Energy Levels (Shells)",
      "Photons & Emission",
      "Quantum Jump"
    ],
    keywords: [
      "bohr", "atom", "atomic", "nucleus", "proton", "protons", "neutron", "neutrons", "electron",
      "electrons", "energy level", "shell", "shells", "orbit", "orbits", "photon", "emission", "quantum",
      "rydberg", "absorption"
    ]
  },
  "ionic-vs-covalent": {
    lessonName: "Ionic vs. Covalent Bonds",
    allowedTopics: [
      "Chemical Bonding",
      "Ionic Bonds",
      "Covalent Bonds",
      "Electronegativity",
      "Valence Electrons"
    ],
    keywords: [
      "ionic", "covalent", "bond", "bonding", "bonds", "electronegativity", "valence", "electron", "electrons",
      "sharing", "transfer", "cation", "anion", "salt", "molecule", "molecular"
    ]
  },
  "ph-poh-scale": {
    lessonName: "Understanding pH & Strong vs Weak Acids",
    allowedTopics: [
      "Acids and Bases",
      "pH and pOH Scale",
      "Acid/Base Indicators",
      "Ionization and Dissociation",
      "Strong vs Weak Acids"
    ],
    keywords: [
      "ph", "poh", "acid", "acids", "base", "bases", "indicator", "indicators", "strong", "weak",
      "dissociation", "ionization", "dissociate", "ionize", "ion", "ions", "concentration",
      "hydrochloric", "hcl", "sulfuric", "h2so4", "acetic", "ch3cooh", "citric", "water",
      "h2o", "sodium hydroxide", "naoh", "ammonia", "nh3", "soap", "litmus", "neutral",
      "alkaline", "alkalinity", "acidity", "proton", "hydroxide", "h+", "oh-", "hydronium", "h3o+"
    ]
  },
  "acid-base-titrations": {
    lessonName: "Neutralization & Titration",
    allowedTopics: [
      "Acids and Bases",
      "Neutralization Reaction",
      "Acid-Base Titration",
      "Equivalence Point",
      "Titrant and Analyte",
      "pH Indicators & Color Transition"
    ],
    keywords: [
      "neutralization", "neutralize", "neutralized", "titration", "titrations", "titrate", "titrating",
      "equivalence", "endpoint", "end point", "moles", "molarity", "volume", "concentration",
      "burette", "flask", "indicator", "indicators", "phenolphthalein", "methyl orange", "bromothymol",
      "acid", "base", "h+", "oh-", "h2o", "salt", "nacl", "hcl", "naoh", "water", "stoichiometric", "dilution"
    ]
  },
  "electron-config": {
    lessonName: "Electron Configurations",
    allowedTopics: [
      "Electron Subshells",
      "Aufbau Principle",
      "Pauli Exclusion Principle",
      "Hund's Rule",
      "Quantum Numbers"
    ],
    keywords: [
      "electron", "configuration", "configurations", "subshell", "subshells", "orbital", "orbitals",
      "aufbau", "pauli", "exclusion", "hund", "hund's", "spin", "quantum", "numbers", "valence",
      "shell", "shells", "filling", "energy", "level", "levels", "s subshell", "p subshell", "d subshell", "f subshell"
    ]
  },
  "balancing-equations": {
    lessonName: "Chemical Equation Balancing",
    allowedTopics: [
      "Chemical Reactions",
      "Equation Balancing",
      "Conservation of Mass",
      "Stoichiometric Coefficients"
    ],
    keywords: [
      "balance", "balancing", "equation", "equations", "chemical", "reaction", "reactions", "reactant", "reactants",
      "product", "products", "coefficient", "coefficients", "subscript", "subscripts", "mass", "conservation", "atom", "atoms"
    ]
  },
  "hydrocarbons": {
    lessonName: "Alkanes, Alkenes & Alkynes Nomenclature",
    allowedTopics: [
      "Hydrocarbons",
      "Alkanes",
      "Alkenes",
      "Alkynes",
      "Nomenclature",
      "Covalent Bonding"
    ],
    keywords: [
      "hydrocarbon", "hydrocarbons", "alkane", "alkanes", "alkene", "alkenes", "alkyne", "alkynes",
      "nomenclature", "naming", "double bond", "triple bond", "methane", "ethane", "ethene", "ethyne",
      "carbon", "hydrogen", "saturated", "unsaturated"
    ]
  }
};

/**
 * Resolves filter topics and keywords for a lesson, compiling a dynamic fallback if not Curated.
 * @param {string} lessonId - The unique key of the lesson
 * @param {Object} lessonInfo - Curated lesson metadata
 * @param {Object} lessonContent - Conceptual lesson content
 */
export const getLessonFilter = (lessonId, lessonInfo, lessonContent) => {
  if (lessonFilters[lessonId]) {
    return lessonFilters[lessonId];
  }

  // Fallback generator for uncurated/future lessons
  const title = lessonInfo?.title || lessonContent?.title || "This Science Lesson";
  const category = lessonInfo?.topicTitle || "General";
  const subject = lessonInfo?.subjectTitle || "Science";
  const concepts = lessonContent?.keyConcepts || [];

  const allowedTopics = [
    `${title} Concepts`,
    `${category} Principles`,
    `${subject} Foundation`,
    ...concepts.slice(0, 3).map(c => c.name)
  ];

  // Tokenize keywords (strip punctuation, lower case, split spaces)
  const tokenSet = new Set();
  
  const addTokens = (str) => {
    if (!str) return;
    str.toLowerCase()
       .replace(/[^\w\s-]/g, '')
       .split(/\s+/)
       .forEach(token => {
         if (token.length > 2) tokenSet.add(token);
       });
  };

  addTokens(title);
  addTokens(category);
  addTokens(subject);
  concepts.forEach(c => {
    addTokens(c.name);
    addTokens(c.desc);
  });

  // Filter common grammatical stop-words
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'from', 'about', 'our', 'your', 'this', 'that',
    'these', 'those', 'are', 'was', 'were', 'have', 'has', 'had', 'been', 'will',
    'would', 'could', 'should', 'between', 'under', 'above', 'below', 'into', 'onto'
  ]);

  const keywords = Array.from(tokenSet).filter(word => !stopWords.has(word));

  return {
    lessonName: title,
    allowedTopics,
    keywords
  };
};
