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
  lungs: {
    lessonName: "The Lungs & Respiratory Mechanics",
    allowedTopics: [
      "Lungs Anatomy",
      "Respiratory Mechanics",
      "Alveoli Gas Exchange",
      "Diaphragm & Breathing",
      "Oxygen Transport"
    ],
    keywords: [
      "lungs", "lung", "respiratory", "respiration", "breathe", "breathing", "inhale", "exhale",
      "alveoli", "alveolar", "gas exchange", "oxygen", "co2", "carbon dioxide", "bronchi", "bronchioles",
      "trachea", "diaphragm", "pleural", "ventilation", "pulmonary", "hemoglobin", "bronchial"
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
  "vascular-system": {
    lessonName: "Xylem & Phloem Transport",
    allowedTopics: [
      "Xylem Structure",
      "Phloem Structure",
      "Transpiration Stream",
      "Translocation Process",
      "Water & Sugar Transport"
    ],
    keywords: [
      "xylem", "phloem", "transport", "vascular", "transpiration", "translocation", "sieve", "vessel",
      "water", "sugar", "nutrients", "sap", "stomata", "cohesion", "adhesion", "root", "stem", "leaves", "tracheid"
    ]
  },
  mitochondria: {
    lessonName: "Mitochondria & ATP Generation",
    allowedTopics: [
      "Mitochondria Anatomy",
      "Adenosine Triphosphate (ATP)",
      "Cellular Respiration",
      "Krebs Cycle",
      "Electron Transport Chain"
    ],
    keywords: [
      "mitochondria", "mitochondrion", "atp", "respiration", "krebs", "electron transport", "matrix",
      "cristae", "membrane", "glucose", "energy", "glycolysis", "phosphorylation", "synthase", "cellular"
    ]
  },
  mitosis: {
    lessonName: "Mitosis vs. Meiosis Division",
    allowedTopics: [
      "Cell Division",
      "Mitosis Phases",
      "Meiosis Phases",
      "Chromosomes & Centromeres",
      "Diploid vs. Haploid Cells"
    ],
    keywords: [
      "mitosis", "meiosis", "division", "chromosome", "chromosomes", "chromatid", "spindle", "centromere",
      "prophase", "metaphase", "anaphase", "telophase", "cytokinesis", "diploid", "haploid", "gamete", "somatic", "replication"
    ]
  },
  "dna-structure": {
    lessonName: "DNA Double Helix & Base Pairing",
    allowedTopics: [
      "DNA Structure",
      "Double Helix Shape",
      "Nucleotides & Bases",
      "Base Pairing (A-T, G-C)",
      "Hydrogen Bonding"
    ],
    keywords: [
      "dna", "deoxyribonucleic", "helix", "nucleotide", "nucleotides", "adenine", "thymine", "guanine",
      "cytosine", "base pair", "pairing", "phosphate", "deoxyribose", "hydrogen bond", "replication", "complementary"
    ]
  },
  "mendelian-genetics": {
    lessonName: "Punnett Squares & Dominance",
    allowedTopics: [
      "Mendelian Laws",
      "Punnett Squares",
      "Dominant vs. Recessive",
      "Genotype & Phenotype",
      "Alleles Inheritance"
    ],
    keywords: [
      "mendel", "genetics", "punnett", "square", "dominant", "recessive", "genotype", "phenotype",
      "allele", "alleles", "heterozygous", "homozygous", "trait", "inheritance", "codominance"
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
  "kinematic-equations": {
    lessonName: "Deriving the Big Three Equations",
    allowedTopics: [
      "Kinematic Equations",
      "Constant Acceleration",
      "Derivation Steps",
      "Free Fall Motion",
      "Motion Vectors"
    ],
    keywords: [
      "kinematic", "equations", "derivation", "derive", "acceleration", "motion", "constant", "free fall",
      "displacement", "velocity", "initial", "final", "time"
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
  "spacetime-curvature": {
    lessonName: "Einstein's Curved Spacetime Overview",
    allowedTopics: [
      "General Relativity",
      "Curved Spacetime",
      "Equivalence Principle",
      "Gravitational Lensing",
      "Black Holes"
    ],
    keywords: [
      "einstein", "relativity", "spacetime", "curvature", "equivalence", "lensing", "black hole", "mass",
      "gravity", "warp", "time dilation"
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
  "orbital-mechanics": {
    lessonName: "Kepler's Laws of Planetary Motion",
    allowedTopics: [
      "Kepler's Laws",
      "Planetary Orbits",
      "Gravity",
      "Orbital Velocity",
      "Ellipse & Focus"
    ],
    keywords: [
      "kepler", "planetary", "motion", "orbit", "orbits", "gravity", "gravitation", "ellipse", "elliptical",
      "period", "velocity", "focus", "foci", "aphelion", "perihelion", "semi-major", "planetary orbits"
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
  "molecular-geometry": {
    lessonName: "VSEPR Theory & Molecular Shapes",
    allowedTopics: [
      "VSEPR Theory",
      "Molecular Geometry",
      "Electron Domains",
      "Bond Angles",
      "Polarity"
    ],
    keywords: [
      "vsepr", "geometry", "molecular", "shape", "shapes", "domain", "domains", "angle", "angles",
      "polar", "polarity", "linear", "bent", "trigonal", "tetrahedral", "lone pair", "lone pairs"
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
