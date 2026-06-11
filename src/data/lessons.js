export const lessonsData = {
  // Biology - Human Anatomy
  heart: {
    title: "The Heart & Circulatory System",
    subject: "biology",
    topic: "human-anatomy",
    description: "Learn how the human heart functions as a muscular double-pump, directing oxygenated and deoxygenated blood flow.",
    sketchfabId: "e48637d3399a4e5184bdf169929dc36e",
    overview: "The human heart is a complex four-chambered muscular organ located in the mediastinum. Its primary role is to drive systemic circulation (sending oxygenated blood to tissues) and pulmonary circulation (sending deoxygenated blood to the lungs).",
    keyConcepts: [
      { name: "Myocardium", desc: "The thick middle muscular layer of the heart wall responsible for contraction." },
      { name: "Double Circulation", desc: "A system where blood passes through the heart twice in one complete circuit (Pulmonary and Systemic)." },
      { name: "Sinoatrial (SA) Node", desc: "The heart's natural pacemaker located in the right atrium that regulates rhythmic contractions." }
    ],
    facts: {
      fun: "Your heart beats about 100,000 times a day and pumps approximately 2,000 gallons of blood through 60,000 miles of vessels.",
      exam: "Ventricles have significantly thicker walls than atria, and the left ventricle is the thickest because it must pump blood to the entire body.",
      application: "Pacemakers are electronic devices implanted under the skin to correct arrhythmias by sending electrical pulses to stimulate a normal heart rate."
    },
    summary: "The heart's design separates oxygenated and deoxygenated blood, ensuring maximum metabolic efficiency needed for human survival."
  },
  "brain-cns": {
    title: "The Brain & Central Nervous System",
    subject: "biology",
    topic: "human-anatomy",
    description: "Explore the neural network of the cerebrum, cerebellum, and brain stem that coordinates human behavior and cognition.",
    sketchfabId: "0aa0e33c5c854d1bab7bac9e1c7acaec",
    overview: "The brain acts as the central processor of the nervous system. Encased in the skull, it translates sensory inputs, controls voluntary and involuntary actions, and stores memory.",
    sections: [
      {
        title: "Brain Structure",
        content: "The human brain is divided into distinct anatomical regions including the cerebrum, cerebellum, and brainstem. Each division coordinates specific physiological and cognitive tasks."
      },
      {
        title: "Cerebrum",
        content: "Representing the largest part of the brain, the cerebrum features left and right hemispheres. It handles reasoning, emotional expression, sensory integration, memory retrieval, and language formulation."
      },
      {
        title: "Brainstem",
        content: "Serving as the conduit to the spinal cord, the brainstem regulates essential autonomous systems. It dictates heart rhythm, respiration mechanics, vaso-activities, and sleep cycles."
      },
      {
        title: "Central Nervous System",
        content: "Composed of the brain and spinal cord, the Central Nervous System (CNS) processes incoming sensory messages and relays outgoing motor command instructions."
      }
    ],
    keyConcepts: [
      { name: "Cerebral Cortex", desc: "The outer gray matter layer of the cerebrum responsible for high-level thinking, sensory perception, and motor control." },
      { name: "Action Potential", desc: "An electrical signal that travels along neuron membranes to transmit data over distances." },
      { name: "Synapse", desc: "The junction between two neurons where neurotransmitters convey chemical signals." }
    ],
    facts: {
      fun: "The brain contains roughly 86 billion neurons, and generates enough electrical energy to power a small 20-watt light bulb.",
      exam: "The blood-brain barrier is a highly selective semipermeable border that blocks toxins and pathogens in circulating blood from entering brain tissues.",
      application: "Understanding neural mapping allows scientists to build brain-computer interfaces (BCIs) that help paralyzed patients move robotic limbs."
    },
    summary: "The central nervous system links sensory perception to physical responses, serving as the cognitive foundation for all human action."
  },
  "stomach-digestive-process": {
    title: "The Stomach & Digestive Process",
    subject: "biology",
    topic: "human-anatomy",
    description: "Delve into mechanical churning and chemical breakdown processes occurring inside the gastric chamber.",
    sketchfabId: "b802a793c81b4c78a382324619134742",
    overview: "The stomach is a J-shaped muscular organ that receives chewed food. It acts as a temporary reservoir, mixing food with acidic gastric secretions to form a semi-liquid paste called chyme.",
    sections: [
      {
        title: "Anatomy of the Stomach",
        content: "The stomach is structurally divided into four main regions: the Cardia (the entry point surrounding the esophageal opening), the Fundus (the rounded superior dome), the Body of the Stomach (the primary central mixing chamber), and the Pylorus (the distal funnel-shaped outlet leading into the duodenum)."
      },
      {
        title: "Digestive Functions",
        content: "The stomach drives digestion through physical breakdown and chemical hydrolysis. Mechanical churning is facilitated by three layers of smooth muscle (oblique, circular, and longitudinal) that blend food into chyme."
      },
      {
        title: "Gastric Juices & Enzymes",
        content: "Gastric glands secrete highly concentrated Gastric Acid (hydrochloric acid) to create a pH of 1.5 to 3.5. This denatures dietary proteins and kills foreign pathogens. The active enzyme pepsin initiates protein digestion by cleaving peptide bonds."
      },
      {
        title: "Blood Supply of the Stomach",
        content: "Oxygenated blood is distributed to the stomach via branches of the celiac trunk. The lesser curvature is supplied by the left and right gastric arteries, while the greater curvature is supplied by the gastro-omental arteries."
      }
    ],
    keyConcepts: [
      { name: "Peristalsis", desc: "Wavelike muscular contractions that push food through the digestive tract." },
      { name: "Pepsin", desc: "A gastric enzyme that breaks down complex proteins into smaller peptides under highly acidic conditions." },
      { name: "Mucosal Barrier", desc: "A thick layer of alkaline mucus that protects the stomach lining from self-digestion by hydrochloric acid." }
    ],
    facts: {
      fun: "The hydrochloric acid in your stomach is strong enough to dissolve metal, yet the stomach lining replaces itself every few days to prevent self-digestion.",
      exam: "Stomach pH ranges from 1.5 to 3.5, creating the optimal denaturing environment for proteins and neutralizing harmful microorganisms.",
      application: "Antacids contain weak bases like magnesium hydroxide to neutralize excess gastric acid and relieve indigestion."
    },
    summary: "Through a combination of muscular churning and specialized enzymes, the stomach converts solid food into nutrient-dense chyme ready for intestinal absorption."
  },
  lungs: {
    title: "The Lungs & Respiratory Mechanics",
    subject: "biology",
    topic: "human-anatomy",
    description: "Understand the pressure gradients, airway networks, and alveolar gas exchange that support respiration.",
    sketchfabId: "50c60965e6834b6b8b0e77d0799f2a96",
    overview: "Respiration depends on a pair of spongy, elastic lungs located in the thoracic cavity. Gas exchange occurs across the thin membranes of millions of microscopic air sacs called alveoli.",
    keyConcepts: [
      { name: "Alveoli", desc: "Tiny air sacs at the ends of bronchioles where oxygen diffuses into the bloodstream and carbon dioxide diffuses out." },
      { name: "Diaphragm", desc: "A dome-shaped muscle beneath the lungs that contracts to create a negative pressure vacuum, drawing air in." },
      { name: "Surfactant", desc: "A fluid compound that reduces surface tension in alveoli, preventing lung collapse during exhalation." }
    ],
    facts: {
      fun: "If flattened out, the total surface area of your lungs' alveoli would cover a standard tennis court.",
      exam: "Gas exchange occurs purely via passive diffusion across the alveolar-capillary membrane, driven by partial pressure gradients.",
      application: "Mechanical ventilators regulate pressure inside the chest cavity to assist or replace manual breathing in respiratory failure patients."
    },
    summary: "Respiration supplies constant oxygen to fuel cellular respiration, using simple pressure changes to maintain continuous gas exchange."
  },

  // Biology - Plant Biology
  "plant-cell-structure": {
    title: "Structure of Plant Cells",
    subject: "biology",
    topic: "plant-biology",
    description: "Examine the unique cell walls, large central vacuoles, and chloroplasts that distinguish plant cells from animal cells.",
    sketchfabId: "f258c65762e5435c9d58c1aa136b557a",
    overview: "Plant cells are eukaryotic cells containing specialized organelles that support growth, energy production, and photosynthesis.",
    keyConcepts: [
      { name: "Cell Wall", desc: "Provides structure and protection." },
      { name: "Cell Membrane", desc: "Controls movement of substances." },
      { name: "Nucleus", desc: "Contains DNA." },
      { name: "Chloroplast", desc: "Site of photosynthesis." },
      { name: "Central Vacuole", desc: "Stores water and nutrients." },
      { name: "Mitochondria", desc: "Produces ATP energy." }
    ],
    practiceQuestions: [
      "What is the function of the chloroplast?",
      "Why do plant cells contain a large vacuole?",
      "Compare cell wall and cell membrane.",
      "Explain the role of the nucleus."
    ],
    quiz: [
      {
        question: "Which organelle is responsible for performing photosynthesis in plant cells?",
        options: ["Mitochondria", "Chloroplast", "Nucleus", "Central Vacuole"],
        answer: 1,
        explanation: "Chloroplasts contain chlorophyll which absorbs sunlight to synthesize food via photosynthesis."
      },
      {
        question: "What is the primary function of the rigid cell wall in a plant cell?",
        options: ["To control what enters and leaves the cell", "To produce energy in the form of ATP", "To provide structure, support, and protection", "To store genetic material"],
        answer: 2,
        explanation: "The cell wall is made of cellulose and provides structural support to keep plants upright."
      },
      {
        question: "Which organelle in plant cells stores water and maintains turgor pressure?",
        options: ["Central Vacuole", "Golgi Apparatus", "Ribosome", "Lysosome"],
        answer: 0,
        explanation: "The large central vacuole stores water and nutrients, creating turgor pressure that keeps the plant cell rigid."
      },
      {
        question: "What is the function of the cell membrane?",
        options: ["Contains the DNA of the cell", "Controls the movement of substances in and out of the cell", "Produces proteins", "Absorbs light energy"],
        answer: 1,
        explanation: "The semi-permeable cell membrane regulates transport of molecules in and out of the cell."
      },
      {
        question: "Where is the DNA primarily located in a plant cell?",
        options: ["Cytoplasm", "Chloroplast", "Nucleus", "Ribosomes"],
        answer: 2,
        explanation: "The nucleus houses the cell's genetic material (DNA) and acts as the control center."
      }
    ],
    suggestedReading: [
      { title: "Photosynthesis Basics", desc: "Learn how plants capture light and convert it into sugar." },
      { title: "Plant Cell vs Animal Cell", desc: "A comparison of key structural differences." },
      { title: "Chloroplast Function", desc: "An in-depth look at thylakoid membranes and light absorption." }
    ],
    facts: {
      fun: "Plant cells have a rigid outer cell wall made of cellulose, which helps the plant stand upright without a skeleton.",
      exam: "Chloroplasts contain green chlorophyll pigments that capture sunlight, converting it into chemical energy via photosynthesis.",
      application: "Understanding plant cell wall structure is crucial for creating biodegradable plastics, textiles, and biofuels."
    },
    summary: "The rigid cell wall, chloroplasts, and a large central vacuole work together to support photosynthesis and structure in plant organisms."
  },

  // Physics - Gravity & Solar System
  "newton-gravitation": {
    title: "Newtonian Universal Gravitation",
    subject: "physics",
    topic: "gravity",
    description: "Analyze the attractive force that acts between all masses in the universe, following the inverse-square law.",
    sketchfabId: "4d9a46a6f1ea47bfae6717a61d152b1b",
    overview: "Sir Isaac Newton formulated that gravity is a universal attractive force that acts between any two bodies with mass, proportional to the product of their masses and inversely proportional to the square of their distance.",
    keyConcepts: [
      { name: "Inverse-Square Law", desc: "As the distance between two masses doubles, the gravitational force drops by a factor of four." },
      { name: "Gravitational Constant (G)", desc: "The empirical constant reflecting the strength of gravity, equal to 6.674 x 10^-11 N m²/kg²." },
      { name: "Centripetal Force", desc: "The center-seeking force that keeps a celestial body revolving in a circular or elliptical orbit." }
    ],
    facts: {
      fun: "Because gravitational pull depends on mass, you would weigh only 16.5% of your Earth weight if standing on the Moon.",
      exam: "Gravity provides the necessary centripetal force that maintains planetary and satellite orbits; without it, bodies would fly off in straight lines.",
      application: "Engineers use orbital math to position communications satellites in geostationary orbits so they hover above the same spot on Earth."
    },
    summary: "Universal gravitation governs both falling objects on Earth and the massive orbits of planets, forming the foundation of classical astrophysics."
  },

  "orbital-mechanics": {
    title: "Kepler's Laws of Planetary Motion",
    subject: "physics",
    topic: "solar-system",
    description: "Trace the elliptical paths, sweeping orbital areas, and orbital periods of planets moving around stars.",
    sketchfabId: "4d9a46a6f1ea47bfae6717a61d152b1b",
    overview: "Johannes Kepler described planetary motion through three mathematical laws, detailing how planets travel in ellipses with the Sun at one focus and move faster when closer to their star.",
    keyConcepts: [
      { name: "Elliptical Orbits", desc: "Orbits shape like stretched circles with varying eccentricity, rather than perfect circles." },
      { name: "Perihelion & Aphelion", desc: "Perihelion is the orbital point closest to the Sun (fastest speed); Aphelion is the point furthest away (slowest speed)." },
      { name: "Harmonic Law", desc: "The square of a planet's orbital period is directly proportional to the cube of the semi-major axis of its orbit." }
    ],
    facts: {
      fun: "Earth travels fastest in its orbit during early January when it reaches perihelion, which is closest to the Sun.",
      exam: "Kepler's Second Law means that a line segment joining a planet and the Sun sweeps out equal areas during equal intervals of time.",
      application: "Space agencies utilize gravitational slingshots, using planets' orbital motion to accelerate spacecraft without burning fuel."
    },
    summary: "Kepler's Laws accurately predicted planetary positions, bridging classical observation with Newton's gravitational dynamics."
  },

  // Physics - Motion
  "velocity-accel": {
    title: "Displacement, Velocity & Acceleration",
    subject: "physics",
    topic: "motion",
    description: "Understand the fundamentals of kinematics: position, displacement, speed, velocity, and acceleration.",
    overview: "Kinematics is the branch of mechanics that describes the motion of points, bodies, and systems of bodies without considering the forces that cause them to move. By defining position, displacement, velocity, and acceleration, we can precisely model how objects move through space over time.",
    keyConcepts: [
      { name: "Sports Car", desc: "The vehicle undergoing motion, whose state is defined by its position, velocity, and acceleration." },
      { name: "Displacement & Position", desc: "Displacement is the vector change in position from the starting point (x0 = 0 m)." },
      { name: "Velocity Arrow", desc: "A vector arrow representing the rate of change of position, pointing forward with length scaling with velocity (v)." },
      { name: "Acceleration Arrow", desc: "A vector arrow representing the rate of change of velocity (a), pointing forward during acceleration and backward during deceleration." },
      { name: "Motion Trail", desc: "A visual path tracking the history of the vehicle's position over time, visualizing displacement gradients." },
      { name: "Distance Markers", desc: "Physical scales along the track measuring absolute displacement in meters." }
    ],
    facts: {
      fun: "In physics, we model the car as a point mass to simplify equations of motion, ignoring air drag and mechanical friction.",
      exam: "Displacement can be positive or negative, unlike total distance traveled, which is always positive. Acceleration is the slope of a velocity-time graph.",
      application: "Autonomous driving systems rely on continuous integration of position, velocity, and acceleration data to navigate routes safely."
    },
    summary: "Understanding displacement, velocity, and acceleration is the foundational step in physics, allowing us to describe all motion in the universe.",
    suggestedReading: [
      { title: "Kinematics Fundamentals", desc: "Introduction to vectors, scalars, and motion in one dimension." },
      { title: "Graphing Motion", desc: "How to interpret position, velocity, and acceleration graphs over time." },
      { title: "The Big Three Equations", desc: "Deriving and applying kinematic formulas under constant acceleration." }
    ],
    quiz: [
      {
        question: "What is the difference between displacement and distance?",
        options: [
          "Displacement is a vector quantity representing the net change in position, while distance is a scalar representing the total path traveled.",
          "Displacement is always larger than distance.",
          "Displacement is a scalar quantity, while distance is a vector.",
          "There is no difference; they are identical."
        ],
        answer: 0,
        explanation: "Displacement measures the straight-line distance from start to end with a direction (vector), whereas distance is the total path length traveled (scalar)."
      },
      {
        question: "If a car travels 60 meters East and then 20 meters West, what is its displacement and total distance traveled?",
        options: [
          "Displacement: 40 meters East, Distance: 80 meters",
          "Displacement: 80 meters, Distance: 40 meters East",
          "Displacement: 40 meters, Distance: 40 meters",
          "Displacement: 80 meters, Distance: 80 meters"
        ],
        answer: 0,
        explanation: "Displacement is the net change in position: 60 - 20 = 40 meters East. Distance is the total path traveled: 60 + 20 = 80 meters."
      },
      {
        question: "Which of the following defines velocity?",
        options: [
          "The rate of change of speed.",
          "The rate of change of position with direction (displacement over time).",
          "The total distance divided by total time.",
          "The rate of change of acceleration."
        ],
        answer: 1,
        explanation: "Velocity is the rate of change of position, calculated as displacement divided by time. It is a vector quantity."
      },
      {
        question: "What does a constant positive acceleration look like on a Velocity vs. Time graph?",
        options: [
          "A horizontal straight line.",
          "A straight line sloping upwards.",
          "A parabolic curve bending upwards.",
          "A straight line sloping downwards."
        ],
        answer: 1,
        explanation: "Acceleration is the slope of the Velocity vs. Time graph. Constant positive acceleration means the slope is constant and positive, resulting in a straight line sloping upwards."
      },
      {
        question: "If a car is moving forward with a velocity of 25 m/s and has an acceleration of -5 m/s², what is happening to the car's motion?",
        options: [
          "It is speeding up.",
          "It is moving backward at 5 m/s².",
          "It is slowing down (decelerating).",
          "It remains at a constant speed of 25 m/s."
        ],
        answer: 2,
        explanation: "When acceleration and velocity have opposite signs, the object slows down. Here, velocity is positive (forward) and acceleration is negative (backward), causing deceleration."
      }
    ]
  },
  "newtons-laws": {
    title: "Newton's Three Laws of Motion",
    subject: "physics",
    topic: "force",
    description: "Investigate how force, mass, and acceleration dictate the movement of everything in the universe.",
    overview: "Newton's three laws of motion describe the relationship between the forces acting on a body and its motion. Together, they form the foundation of classical mechanics.",
    keyConcepts: [
      { name: "Net Force", desc: "The vector sum of all forces acting on an object, which determines its change in motion." },
      { name: "Inertia", desc: "The natural tendency of an object to resist changes in its state of rest or motion." },
      { name: "Action-Reaction", desc: "The principle that forces always arise in pairs: if body A exerts force on body B, B exerts an equal and opposite force on A." }
    ],
    facts: {
      fun: "Seatbelts save lives by opposing your inertia. When a car stops suddenly, you keep moving forward until the seatbelt exerts a stopping force.",
      exam: "Remember that F = ma is a vector equation. Net force and acceleration must always point in the same direction.",
      application: "Space travel operates entirely on the action-reaction principle. Ion thrusters expel ionized propellant particles to push spacecraft forward."
    },
    summary: "By understanding Newton's laws, we can predict and analyze how structures, vehicles, and astronomical bodies interact under any force configuration.",
    quiz: [
      {
        question: "A spaceship is traveling in deep space with its engines turned off. What will happen to its motion?",
        options: [
          "It will slowly come to a stop due to lack of thrust.",
          "It will continue moving in a straight line at a constant speed.",
          "It will begin to orbit the nearest star immediately.",
          "It will instantly drop to zero velocity."
        ],
        answer: 1,
        explanation: "According to Newton's First Law (Inertia), an object in motion continues to move at a constant velocity in a straight line unless acted upon by an external net force. In deep space, with no friction or gravity, it maintains its state of motion."
      },
      {
        question: "If you double the net force acting on an object and simultaneously halve its mass, what happens to its acceleration?",
        options: [
          "It remains unchanged.",
          "It is doubled.",
          "It is quadrupled.",
          "It is halved."
        ],
        answer: 2,
        explanation: "Since a = F/m, doubling the force (2F) and halving the mass (m/2) yields an acceleration of (2F)/(m/2) = 4 * (F/m), which is four times the original acceleration."
      },
      {
        question: "A massive truck collides head-on with a small passenger car. During the collision, which vehicle experiences the greater force?",
        options: [
          "The truck, because of its larger mass.",
          "The car, because it suffers more damage.",
          "Both experience the exact same magnitude of force.",
          "Neither, forces are zero during collisions."
        ],
        answer: 2,
        explanation: "Newton's Third Law states that forces are always equal and opposite. During a collision, the force the truck exerts on the car is equal in magnitude to the force the car exerts on the truck. The car suffers more damage only because it has less mass and structure to withstand that force."
      },
      {
        question: "A force of 30 N is applied to a box, causing it to accelerate at 5 m/s². What is the mass of the box?",
        options: [
          "6 kg",
          "150 kg",
          "0.16 kg",
          "25 kg"
        ],
        answer: 0,
        explanation: "Using F = ma, we can solve for mass: m = F / a = 30 N / 5 m/s² = 6 kg."
      },
      {
        question: "When a magician pulls a tablecloth from under some dishes without knocking them over, which physical property is being demonstrated?",
        options: [
          "Action-reaction forces",
          "Inertia",
          "Aerodynamic lift",
          "Electromagnetic repulsion"
        ],
        answer: 1,
        explanation: "The dishes have inertia, meaning they tend to stay at rest. Because the tablecloth is pulled very quickly, the brief frictional force is not enough to overcome their inertia and move them, so they remain resting in place."
      }
    ]
  },

  "friction-drag": {
    title: "Coefficient of Friction & Drag Forces",
    subject: "physics",
    topic: "force",
    description: "Explore static and kinetic friction coefficients across different materials and examine how drag forces and terminal velocity govern falling bodies.",
    overview: "Forces resisting motion are fundamental to mechanical systems. Friction arises when two solid surfaces slide or attempt to slide past each other, governed by the coefficient of friction and normal force. Drag forces, on the other hand, arise when an object moves through a fluid (like air), depending on speed, cross-sectional area, and fluid density. When upward drag matches downward gravity, a falling object reaches terminal velocity.",
    keyConcepts: [
      { name: "Normal Force (F_N)", desc: "The perpendicular contact force exerted by a surface on an object. For a horizontal surface, F_N = m * g." },
      { name: "Coefficient of Friction (μ)", desc: "A dimensionless ratio of friction force to normal force. μ_s is for static (starting) friction, while μ_k is for kinetic (sliding) friction." },
      { name: "Drag Force (F_D)", desc: "A resistive force exerted by a fluid (like air) opposing an object's motion, proportional to velocity squared (v²) at high speeds." },
      { name: "Terminal Velocity", desc: "The constant speed reached by a falling object when the upward drag force equals the downward gravitational force, resulting in zero net force and zero acceleration." },
      { name: "Parachute Area & Air Density", desc: "Factors that directly scale the drag force. Increasing the parachute size or air density increases the drag force, lowering the terminal velocity." }
    ],
    facts: {
      fun: "Without friction, you wouldn't be able to walk, write with a pencil, or drive a car, as wheels would spin in place without grip!",
      exam: "Friction always opposes the direction of relative motion (or tendency of motion). Drag force always acts in the direction opposite to the object's velocity.",
      application: "Skydivers use large, lightweight parachutes to increase their cross-sectional area, generating enough drag force to reduce their terminal velocity from 200 km/h to a safe landing speed of 18 km/h."
    },
    summary: "Friction and drag are motion-resisting forces. Friction depends on normal force and surface materials, whereas drag depends on velocity, fluid density, and surface area. Both forces act to dissipate kinetic energy and limit maximum speeds.",
    suggestedReading: [
      { title: "Static vs. Kinetic Friction", desc: "An in-depth explanation of why it takes more force to start an object moving than to keep it sliding." },
      { title: "Fluid Dynamics and Air Resistance", desc: "The physics behind drag forces and the drag equation." },
      { title: "Terminal Velocity Mechanics", desc: "Mathematical derivation of terminal velocity for falling bodies." }
    ],
    quiz: [
      {
        question: "How does the coefficient of static friction (μ_s) typically compare to the coefficient of kinetic friction (μ_k) for the same materials?",
        options: [
          "μ_s is generally greater than μ_k",
          "μ_s is generally less than μ_k",
          "μ_s is always equal to μ_k",
          "There is no relation between them"
        ],
        answer: 0,
        explanation: "The coefficient of static friction (μ_s) is almost always greater than the coefficient of kinetic friction (μ_k) because it requires more force to break the micro-welds between stationary surfaces than to keep them sliding."
      },
      {
        question: "A block of mass 10 kg is sliding on a horizontal concrete surface with a kinetic friction coefficient of 0.5. What is the magnitude of the kinetic friction force? (Use g = 9.8 m/s²)",
        options: [
          "98 N",
          "49 N",
          "10 N",
          "5 N"
        ],
        answer: 1,
        explanation: "The normal force F_N = m * g = 10 * 9.8 = 98 N. The kinetic friction force F_f = μ_k * F_N = 0.5 * 98 = 49 N."
      },
      {
        question: "When a falling parachutist reaches terminal velocity, what is their net acceleration?",
        options: [
          "9.8 m/s² downward",
          "9.8 m/s² upward",
          "0 m/s²",
          "It depends on the mass of the parachutist"
        ],
        answer: 2,
        explanation: "At terminal velocity, the upward drag force is exactly equal to the downward gravitational force. The net force is zero, which means the acceleration is 0 m/s² and speed remains constant."
      },
      {
        question: "Which of the following actions will INCREASE the drag force acting on a falling object at a given speed?",
        options: [
          "Decreasing the air density",
          "Decreasing the cross-sectional area (size) of the object",
          "Increasing the surface area or opening a parachute",
          "Reducing the object's speed"
        ],
        answer: 2,
        explanation: "Drag force is directly proportional to air density, speed squared, and cross-sectional area. Opening a parachute increases the cross-sectional area, which increases drag."
      },
      {
        question: "If the mass of a falling object is doubled but its drag coefficient and cross-sectional area remain the same, what happens to its terminal velocity?",
        options: [
          "It increases",
          "It decreases",
          "It remains exactly the same",
          "It drops to zero"
        ],
        answer: 0,
        explanation: "Terminal velocity occurs when drag equals gravity: 0.5 * ρ * v² * C_d * A = m * g. Solving for terminal velocity: v = sqrt((2 * m * g) / (ρ * C_d * A)). Increasing mass (m) increases the terminal velocity because a larger force (more gravity) is needed to balance the drag."
      }
    ]
  },

  // Chemistry - Atoms & Molecular bonding
  "bohr-model": {
    title: "The Bohr Model & Quantum Energy Levels",
    subject: "chemistry",
    topic: "atomic-structure",
    description: "Explore atomic structures where electrons orbit the nucleus in discrete, quantized energy shells.",
    sketchfabId: "2cc716075e7a469fa77884d6b67ad7f5",
    overview: "Niels Bohr proposed that electrons travel in circular orbits around a positively charged nucleus. Electrons can only occupy fixed orbits (energy levels) and emit or absorb light when jumping between them.",
    keyConcepts: [
      { name: "Quantized Orbits", desc: "Specific pathways where electrons can orbit without radiating energy away." },
      { name: "Photon Emission", desc: "Release of a packet of light energy when an electron drops from a higher energy level to a lower one." },
      { name: "Ground State", desc: "The lowest potential energy level configuration available to an electron." }
    ],
    facts: {
      fun: "The neon signs you see in cities glow because electrons are being excited by electricity and emitting colored photons as they drop back to ground state.",
      exam: "The energy of an emitted photon equals the difference between the initial and final energy levels of the electron (E = hf).",
      application: "Flame tests use emission colors to identify metal ions in compounds, which is how fireworks are formulated to produce specific colors."
    },
    summary: "The Bohr Model introduced quantum transitions to atomic structure, explaining why elements emit distinct spectral lines of light.",
    suggestedReading: [
      { title: "Quantum Leaps & Energy Levels", desc: "How electrons jump between quantized shells and the history of Niels Bohr's discovery." },
      { title: "Electromagnetic Spectrum & Emission Spectra", desc: "Understanding element flame colors, gas discharge tubes, and spectral line equations." },
      { title: "Ground vs. Excited State Configuration", desc: "The rules governing electron placement in atoms and quantum number definitions." }
    ],
    quiz: [
      {
        question: "Who proposed that electrons travel in circular orbits at fixed distances (shells) around a positively charged nucleus?",
        options: [
          "Ernest Rutherford",
          "Niels Bohr",
          "John Dalton",
          "J.J. Thomson"
        ],
        answer: 1,
        explanation: "Niels Bohr proposed the planetary model of the atom in 1913, introducing quantized electron shells where electrons orbit without radiating energy."
      },
      {
        question: "What occurs when an electron transitions from a higher shell (e.g., n=3) to a lower shell (e.g., n=2)?",
        options: [
          "A photon of light is absorbed",
          "A photon of light is emitted",
          "A proton is converted into a neutron",
          "The mass of the atom doubles"
        ],
        answer: 1,
        explanation: "When an electron drops to a lower energy level (closer to the nucleus), it loses potential energy, which is released as an emitted photon of light."
      },
      {
        question: "Which of the following represents the lowest potential energy state of an atom's electrons?",
        options: [
          "Excited State",
          "Ground State",
          "Transitional State",
          "Ionized State"
        ],
        answer: 1,
        explanation: "The Ground State represents the lowest energy configuration, where all electrons occupy the lowest possible shells (starting at n=1)."
      },
      {
        question: "What determines the specific color (wavelength) of light emitted when an electron jumps to a lower shell?",
        options: [
          "The size of the nucleus",
          "The speed of the orbit",
          "The energy difference between the two shells",
          "The number of neutrons in the nucleus"
        ],
        answer: 2,
        explanation: "The energy difference between the shells (ΔE = E_final - E_initial) is directly related to the photon's frequency and wavelength (E = h * f = h * c / λ)."
      },
      {
        question: "How can an electron be coaxed to jump from the ground state to an excited state?",
        options: [
          "It must emit a photon of light",
          "It must capture a free neutron",
          "It must absorb a photon with energy matching the transition gap",
          "It must undergo radioactive decay"
        ],
        answer: 2,
        explanation: "For an electron to jump to a higher energy level (excitation), it must absorb a photon of light whose energy matches the exact difference between the two shells."
      }
    ]
  },
  "electron-config": {
    title: "s, p, d, f Electron Configurations",
    subject: "chemistry",
    topic: "atomic-structure",
    description: "Explore the 3D shapes of s, p, d, and f orbitals and learn to configure electrons using Aufbau, Hund, and Pauli principles.",
    sketchfabId: "2cc716075e7a469fa77884d6b67ad7f5",
    overview: "Electron configurations describe the arrangement of electrons in an atom's orbitals. By understanding s, p, d, and f subshells and their distinct three-dimensional quantum probability shapes, we can predict atomic reactivity, chemical bonding, and magnetic properties.",
    keyConcepts: [
      { name: "Aufbau Principle", desc: "Electrons occupy the lowest energy orbitals available first (e.g., 1s before 2s, 2p before 3s)." },
      { name: "Pauli Exclusion Principle", desc: "No two electrons in an atom can have the same four quantum numbers; an orbital holds at most 2 electrons with opposite spins (↑↓)." },
      { name: "Hund's Rule", desc: "For degenerate (equal energy) orbitals, electrons fill them singly with parallel spins first before pairing up." }
    ],
    facts: {
      fun: "Gold is yellow and copper is reddish-brown because relativistic effects on their outermost s and d electrons alter the energy gaps, shifting their absorption spectra.",
      exam: "Chromium ([Ar] 3d⁵ 4s¹) and Copper ([Ar] 3d¹⁰ 4s¹) are famous exceptions to the Aufbau order because half-filled or fully-filled d subshells offer extra thermodynamic stability.",
      application: "MRIs utilize the magnetic spins of unpaired hydrogen electrons to align and snap back under radio waves, mapping bodily tissues non-invasively."
    },
    summary: "Electron configuration dictates the chemical identity of elements. Subshell fillings follow the Aufbau, Hund, and Pauli principles, forming the basis of the periodic table's layout.",
    suggestedReading: [
      { title: "Quantum Numbers & Orbital Nodes", desc: "How quantum numbers (n, l, ml, ms) dictate orbital size, shape, orientation, and electron spin." },
      { title: "Aufbau Principle Exceptions", desc: "An in-depth look at Chromium, Copper, and other transition metals that cheat the Aufbau sequence." },
      { title: "Valence Electrons & Reactivity", desc: "Connecting electron configuration to the periodic groups and chemical bonding behaviors." }
    ],
    quiz: [
      {
        question: "Which principle states that electrons must occupy the lowest energy orbitals available before filling higher ones?",
        options: [
          "Hund's Rule",
          "Aufbau Principle",
          "Pauli Exclusion Principle",
          "Heisenberg Uncertainty Principle"
        ],
        answer: 1,
        explanation: "The Aufbau Principle (from German 'aufbau' meaning 'building up') dictates that orbitals are filled in order of increasing energy."
      },
      {
        question: "What is the maximum number of electrons that can occupy a single 'd' orbital subshell (e.g., the entire 3d subshell consisting of 5 orbitals)?",
        options: [
          "2 electrons",
          "6 electrons",
          "10 electrons",
          "14 electrons"
        ],
        answer: 2,
        explanation: "A 'd' subshell contains 5 distinct orbitals (m_l = -2, -1, 0, +1, +2). Since each individual orbital can hold a maximum of 2 electrons, the total subshell capacity is 5 * 2 = 10 electrons."
      },
      {
        question: "Why do degenerate orbitals (like the three 2p orbitals) fill singly with parallel spins first before pairing up?",
        options: [
          "To satisfy the Pauli Exclusion Principle",
          "To minimize electrostatic repulsion between electrons (Hund's Rule)",
          "Because single electrons have greater mass",
          "Because the nucleus exerts a stronger pull on single electrons"
        ],
        answer: 1,
        explanation: "Hund's Rule states that degenerate orbitals fill singly first to minimize electron-electron electrostatic repulsion, which is energetically favorable."
      },
      {
        question: "What is the correct electron configuration for a ground-state Carbon atom (Z = 6)?",
        options: [
          "1s² 2s² 2p²",
          "1s² 2s⁴",
          "1s² 2s¹ 2p³",
          "1s² 2s² 2p¹ 3s¹"
        ],
        answer: 0,
        explanation: "Carbon has 6 electrons. Following the Aufbau order, 2 go into 1s, 2 go into 2s, and the remaining 2 go into the 2p subshell: 1s² 2s² 2p²."
      },
      {
        question: "Which element represents a well-known exception to the standard Aufbau configuration, resulting in a fully-filled 'd' subshell?",
        options: [
          "Sodium (Na)",
          "Oxygen (O)",
          "Copper (Cu)",
          "Iron (Fe)"
        ],
        answer: 2,
        explanation: "Copper (Z = 29) has a ground-state configuration of [Ar] 3d¹⁰ 4s¹ instead of [Ar] 3d⁹ 4s² because the fully-filled 3d subshell is exceptionally stable."
      }
    ]
  },
  "ph-poh-scale": {
    title: "Understanding pH & Strong vs Weak Acids",
    subject: "chemistry",
    topic: "acids-and-bases",
    description: "Explore the pH scale, measure ionization of strong vs weak acids, and observe indicator changes in a virtual laboratory.",
    overview: "Acids and bases are defined by their ability to donate or accept protons (H+). The pH scale measures the hydrogen ion concentration logarithmically, ranging from 0 (highly acidic) to 14 (highly basic). Acid strength refers to how completely an acid dissociates into ions in water, distinguishing strong acids like HCl from weak acids like CH3COOH.",
    keyConcepts: [
      { name: "pH Scale", desc: "A logarithmic measure of hydrogen ion concentration, running from 0 (acidic) to 14 (basic), with 7 being neutral." },
      { name: "Strong Acid (Complete Dissociation)", desc: "Acids like HCl that release virtually all hydrogen ions into solution." },
      { name: "Weak Acid (Partial Dissociation)", desc: "Acids like CH3COOH that exist mostly as intact molecules in equilibrium with a small fraction of ions." },
      { name: "pH Indicator", desc: "Chemical dyes that change color when protonated or deprotonated, visually indicating a solution's acidity." }
    ],
    facts: {
      fun: "Our stomach acid has a pH of about 1.5 to 3.5, which is strong enough to dissolve metal, yet protected by a thick mucus lining.",
      exam: "Remember: pH is logarithmic. A change of 1 pH unit represents a tenfold (10x) change in H+ concentration!",
      application: "Agriculturalists monitor soil pH closely because different plants require specific acidic or alkaline ranges to absorb nutrients."
    },
    summary: "Acids and bases are characterized by pH and ionization strength. Strong acids ionize completely, creating high H+ concentrations, while weak acids form equilibria. Indicators allow us to visually determine pH values through color shifts.",
    suggestedReading: [
      { title: "Logarithmic Functions in Chemistry", desc: "Understanding how negative logarithms scale hydrogen ion values." },
      { title: "Weak Acid Equilibria (Ka)", desc: "Deriving the acid dissociation constant and calculating weak acid pH." },
      { title: "Buffer Systems in Human Blood", desc: "How bicarbonate buffers maintain blood pH at a strict 7.4." }
    ],
    quiz: [
      {
        question: "What does a pH of 7 signify at room temperature (25°C)?",
        options: [
          "A highly acidic solution with excess H+ ions",
          "A neutral solution where the concentrations of H+ and OH- are equal",
          "A highly basic solution with excess OH- ions",
          "A solution that contains no water molecules"
        ],
        answer: 1,
        explanation: "At 25°C, pure water has [H+] = [OH-] = 1.0 x 10^-7 M, resulting in a neutral pH of 7."
      },
      {
        question: "Which of the following defines a strong acid?",
        options: [
          "It has a very high pH value close to 14",
          "It dissociates completely into ions in aqueous solution",
          "It contains a very low concentration of hydrogen atoms",
          "It can only be neutralized by a weak base"
        ],
        answer: 1,
        explanation: "Strong acids (like HCl) ionize or dissociate virtually 100% in water, leaving no intact molecules in the solution."
      },
      {
        question: "If Solution A has a pH of 3 and Solution B has a pH of 5, how does the hydrogen ion concentration [H+] of Solution A compare to Solution B?",
        options: [
          "Solution A has 2 times higher [H+] than Solution B",
          "Solution A has 20 times higher [H+] than Solution B",
          "Solution A has 100 times higher [H+] than Solution B",
          "Solution A has 100 times lower [H+] than Solution B"
        ],
        answer: 2,
        explanation: "Since pH is logarithmic: 10^(5 - 3) = 10^2 = 100. Thus, pH 3 has 100 times more hydrogen ions than pH 5."
      },
      {
        question: "Which equation represents the ionization of a weak acid in water?",
        options: [
          "HCl → H+ + Cl-",
          "NaOH → Na+ + OH-",
          "CH3COOH ⇌ H+ + CH3COO-",
          "NaCl → Na+ + Cl-"
        ],
        answer: 2,
        explanation: "Weak acids do not dissociate completely; they form a reversible equilibrium represented by the double arrow (⇌)."
      },
      {
        question: "What color would you expect a highly basic solution (pH = 13) to turn under a standard universal indicator?",
        options: [
          "Red",
          "Yellow",
          "Green",
          "Purple/Violet"
        ],
        answer: 3,
        explanation: "Universal indicator colors run from red (strongly acidic, pH 0-3), green (neutral, pH 7), to purple/violet (strongly basic, pH 12-14)."
      }
    ]
  },
  "acid-base-titrations": {
    title: "Neutralization & Titration",
    subject: "chemistry",
    topic: "acids-and-bases",
    description: "Perform virtual titrations, measure pH curves, identify equivalence points, and calculate unknown concentrations.",
    overview: "Neutralization is the reaction between an acid and a base to produce water and a salt, represented by H⁺ + OH⁻ → H₂O. Titration is a laboratory procedure where a solution of known concentration (titrant) is slowly added to a solution of unknown concentration (analyte) until the equivalence point is reached. The equivalence point occurs when the moles of acid equal the moles of base, often indicated by a visual color change in a pH indicator.",
    keyConcepts: [
      { name: "Equivalence Point", desc: "The point in a titration where the quantity of titrant added is chemically equivalent to the quantity of analyte." },
      { name: "Titrant & Analyte", desc: "The titrant is the solution of known concentration in the burette. The analyte is the solution of unknown concentration in the flask." },
      { name: "Neutralization Reaction", desc: "The chemical reaction where H⁺ (from acid) and OH⁻ (from base) combine to form water molecules and a neutral salt." },
      { name: "End Point & Indicators", desc: "The endpoint is where the indicator changes color. Indicators are selected so the endpoint matches the equivalence point." }
    ],
    facts: {
      fun: "In a perfect titration of strong acid and strong base, adding just a single drop of base near the equivalence point can cause the pH to shoot up from 4 to 10!",
      exam: "At the equivalence point, the moles of H⁺ equal the moles of OH⁻. Use the formula: M_acid * V_acid * n_acid = M_base * V_base * n_base.",
      application: "Titrations are used in food industries to measure acidity levels in products like vinegar, milk, and fruit juices to ensure quality control."
    },
    summary: "Acid-base titration allows the determination of unknown concentrations through controlled neutralization. Visualizing the H+ and OH- ions combining into water at the molecular level explains the steep change in the pH curve at the equivalence point.",
    suggestedReading: [
      { title: "Calculating Titration Curves", desc: "A step-by-step mathematical guide to calculating pH at different stages of titration." },
      { title: "Selecting the Right Indicator", desc: "How the pKa of an indicator determines its transition pH range and suitability for different acid-base strengths." },
      { title: "Polyprotic Acid Titrations", desc: "Understanding titration curves with multiple equivalence points like phosphoric acid." }
    ],
    quiz: [
      {
        question: "What chemical equation represents the net ionic neutralization of a strong acid with a strong base?",
        options: [
          "HCl + NaOH → NaCl + H2O",
          "H+ + OH- → H2O",
          "Na+ + Cl- → NaCl",
          "H2O ⇌ H+ + OH-"
        ],
        answer: 1,
        explanation: "In all strong acid-strong base neutralizations, the spectator ions (Na+ and Cl-) do not participate, leaving the net ionic reaction: H+ + OH- → H2O."
      },
      {
        question: "Which point of a titration represents the exact moment when the moles of acid equal the moles of base?",
        options: [
          "End Point",
          "Equivalence Point",
          "Neutrality Point",
          "Half-Equivalence Point"
        ],
        answer: 1,
        explanation: "The Equivalence Point is the stoichiometric point where moles of titrant equal moles of analyte. The End Point is when the indicator actually changes color."
      },
      {
        question: "If it requires 25.0 mL of 0.10 M NaOH to neutralize 50.0 mL of an unknown HCl solution, what is the molarity of the HCl?",
        options: [
          "0.050 M",
          "0.10 M",
          "0.20 M",
          "0.025 M"
        ],
        answer: 0,
        explanation: "Using M_acid * V_acid = M_base * V_base: M_acid * 50.0 mL = 0.10 M * 25.0 mL. Solving for M_acid yields 0.050 M."
      },
      {
        question: "Why is phenolphthalein a suitable indicator for a strong acid-strong base titration?",
        options: [
          "It changes color at exactly pH 7.0",
          "Its color transition range (pH 8.2-10) lies on the extremely steep vertical section of the titration curve",
          "It is a strong base itself and speeds up the reaction",
          "It reacts with water to release more hydronium ions"
        ],
        answer: 1,
        explanation: "Since the titration curve has a nearly vertical pH jump from pH 4 to 10 at the equivalence point, any indicator changing color in this range (like phenolphthalein) will show the endpoint at virtually the exact equivalence volume."
      },
      {
        question: "In a titration of a weak acid (in flask) with a strong base (in burette), what would you expect the pH to be at the equivalence point?",
        options: [
          "Exactly 7.0",
          "Less than 7.0 (acidic)",
          "Greater than 7.0 (basic)",
          "Exactly 1.0"
        ],
        answer: 2,
        explanation: "At the equivalence point, the weak acid is converted completely to its conjugate base. This conjugate base undergoes hydrolysis with water to produce OH- ions, resulting in a basic pH (> 7.0)."
      }
    ]
  }
};

export const getLessonDataById = (lessonId) => {
  if (lessonsData[lessonId]) {
    return lessonsData[lessonId];
  }
  
  // Default dynamic template for lessons not explicitly filled
  return {
    title: "Interactive Lesson Module",
    subject: "science",
    topic: "general",
    description: "Learn core theories, terms, and systems associated with this curriculum chapter.",
    sketchfabId: "2cc716075e7a469fa77884d6b67ad7f5", // Fallback atomic model
    overview: "This chapter covers the historical breakthroughs, equations, and experimental setups that define this scientific topic.",
    keyConcepts: [
      { name: "Hypothesis", desc: "A proposed explanation made on the basis of limited evidence as a starting point for investigation." },
      { name: "Empirical Data", desc: "Information acquired by observation or experimentation." }
    ],
    facts: {
      fun: "Scientific breakthroughs often occur through collaborative trials and observation of unexpected results.",
      exam: "Always balance your formulas and verify physical constants before computing final values.",
      application: "Understanding these principles underpins modern manufacturing, medicine, and technologies."
    },
    summary: "By mastering these fundamentals, you build a basis for advanced research and applied science engineering."
  };
};
