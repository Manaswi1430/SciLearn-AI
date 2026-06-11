export const modelFacts = {
  // Biology Heart
  LeftVentricle: {
    title: "Left Ventricle",
    fact: "Pumps oxygen-rich blood to the body.",
    description: "The thickest and strongest chamber of the heart. It must generate high pressure to pump blood throughout the systemic circulation."
  },
  RightVentricle: {
    title: "Right Ventricle",
    fact: "Pumps oxygen-poor blood to the lungs.",
    description: "Responsible for sending deoxygenated blood to the pulmonary artery, where it will absorb oxygen and release carbon dioxide."
  },
  Aorta: {
    title: "Aorta",
    fact: "Largest artery in the human body.",
    description: "Carries oxygen-rich blood away from the left ventricle to start its journey through the body."
  },
  LeftAtrium: {
    title: "Left Atrium",
    fact: "Receives oxygenated blood from the lungs.",
    description: "Receives blood from the pulmonary veins and pumps it into the left ventricle."
  },
  RightAtrium: {
    title: "Right Atrium",
    fact: "Receives oxygen-poor blood from the body.",
    description: "Blood returning from the body via the superior and inferior vena cava enters here before being pumped into the right ventricle."
  },

  // Biology Brain
  Cerebrum: {
    title: "Cerebrum",
    fact: "Controls voluntary actions and complex thought.",
    description: "The largest part of the brain, split into two hemispheres, handling thinking, learning, emotions, and sensory processing."
  },
  Cerebellum: {
    title: "Cerebellum",
    fact: "Coordinates balance and movement.",
    description: "Located at the back of the brain, it regulates posture, balance, and fine motor skills."
  },
  BrainStem: {
    title: "Brain Stem",
    fact: "Controls automatic functions like breathing.",
    description: "Connects the cerebrum and cerebellum to the spinal cord. It manages crucial involuntary systems like heart rate and respiration."
  },

  // Physics Solar System
  Sun: {
    title: "The Sun",
    fact: "Contains 99.8% of the Solar System's mass.",
    description: "A nearly perfect sphere of hot plasma, heated to incandescence by nuclear fusion reactions in its core."
  },
  Earth: {
    title: "Earth",
    fact: "Only known planet to support life.",
    description: "The third planet from the Sun, characterized by its liquid surface water, active plate tectonics, and nitrogen-oxygen atmosphere."
  },
  Mars: {
    title: "Mars",
    fact: "Known as the Red Planet due to iron oxide.",
    description: "A dusty, cold, desert world with a very thin atmosphere, featuring polar ice caps and the largest volcano in the solar system."
  },

  // Chemistry Atom
  Nucleus: {
    title: "Atomic Nucleus",
    fact: "Contains protons and neutrons.",
    description: "The very dense region at the center of an atom, containing almost all of its mass but taking up a tiny fraction of its volume."
  },
  Electrons: {
    title: "Electron Cloud",
    fact: "Negatively charged subatomic particles.",
    description: "Electrons orbit the nucleus in specific energy levels or probability clouds, determining the atom's chemical reactivity."
  }
};

export const getFactByMeshName = (name) => {
  if (!name) return null;
  // Normalize key by removing spaces, underscores, or numbers
  const normalizedKey = name.replace(/[\s_\-\d]/g, '').toLowerCase();
  
  const foundKey = Object.keys(modelFacts).find(key => 
    key.toLowerCase() === normalizedKey || 
    normalizedKey.includes(key.toLowerCase()) ||
    key.toLowerCase().includes(normalizedKey)
  );

  if (foundKey) {
    return modelFacts[foundKey];
  }

  // Fallback if no matching mesh is registered
  return {
    title: name.replace(/([A-Z])/g, ' $1').trim(), // format camelCase to "Title Part"
    fact: "Interactive structure identified.",
    description: "A component of the loaded 3D scientific model. Click other regions of the model to discover more educational details."
  };
};
