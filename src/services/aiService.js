import { GoogleGenerativeAI } from '@google/generative-ai';
import { getLessonDataById } from '../data/lessons';
import { getLessonFilter } from '../data/lessonFilters';
import { lessonParts } from '../data/lessonParts';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize GoogleGenerativeAI if an API key is present
let genAI = null;
if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key') {
  try {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  } catch (err) {
    console.error('[AIService] Failed to initialize GoogleGenerativeAI SDK:', err);
  }
}

/**
 * Reusable AI Service for SciLearn AI using GoogleGenerativeAI
 */
export const aiService = {
  /**
   * Generates or retrieves flashcards for a lesson.
   */
  getLessonFlashcards(lessonData) {
    if (!lessonData) return [];
    if (lessonData.flashcards && lessonData.flashcards.length > 0) {
      return lessonData.flashcards;
    }
    const flashcards = [];
    if (lessonData.keyConcepts) {
      lessonData.keyConcepts.forEach(concept => {
        flashcards.push({
          front: `What is ${concept.name}?`,
          back: concept.desc
        });
      });
    }
    if (lessonData.facts) {
      if (lessonData.facts.fun) {
        flashcards.push({
          front: `Fascinating Fact about ${lessonData.title}`,
          back: lessonData.facts.fun
        });
      }
      if (lessonData.facts.exam) {
        flashcards.push({
          front: `Exam Tip for ${lessonData.title}`,
          back: lessonData.facts.exam
        });
      }
      if (lessonData.facts.application) {
        flashcards.push({
          front: `Real-World Application of ${lessonData.title}`,
          back: lessonData.facts.application
        });
      }
    }
    return flashcards;
  },

  /**
   * Validates if a student's question is relevant to the active lesson's filter topics and keywords.
   */
  isQuestionRelated(question, filter) {
    // Quick Actions bypass the relevance check
    if (question.startsWith('Quick Action:')) {
      return true;
    }

    const query = question.toLowerCase().trim();
    
    // Allow basic greetings/help calls to let the tutor greet back or explain its purpose
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'help', 'tutor'];
    if (greetings.includes(query.replace(/[^\w]/g, ''))) {
      return true;
    }

    // Clean up query text for word checking
    const cleanedQuery = query.replace(/[^\w\s]/g, ' ');
    const queryWords = cleanedQuery.split(/\s+/).filter(w => w.length > 0);

    // 1. Direct keyword check
    for (const keyword of filter.keywords) {
      const kw = keyword.toLowerCase();
      if (kw.includes(' ')) {
        if (cleanedQuery.includes(kw)) {
          return true;
        }
      } else {
        if (queryWords.includes(kw)) {
          return true;
        }
        // Substring match for longer words to support plurals/conjugations (e.g., "veins" matching "vein")
        if (kw.length > 3 && cleanedQuery.includes(kw)) {
          return true;
        }
      }
    }

    // 2. Allowed topic check (individual descriptive words)
    for (const topic of filter.allowedTopics) {
      const topicWords = topic.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
      for (const tw of topicWords) {
        // Skip short grammatical words in topic checking
        if (tw.length > 3 && queryWords.includes(tw)) {
          return true;
        }
      }
    }

    return false;
  },

  /**
   * Generates a context-aware explanation or response
   * @param {Object} context - The context object containing subject, category, lesson, and difficulty
   * @param {string} question - The student's question
   * @param {string} actionType - Optional quick action override (explain, summarize, etc.)
   */
  async askTutor(context, question, actionType = '') {
    const { subject, lesson, lessonId, history } = context;
    let response = await this._askTutorInternal(context, question, actionType);
    
    // Repetition check: avoid returning the exact same response as the last AI message
    const lastAiMessage = history && history.length > 0
      ? [...history].reverse().find(m => m.sender === 'ai')?.text
      : null;

    if (lastAiMessage && response === lastAiMessage) {
      response += `\n\n*(Note: Feel free to ask a follow-up or explore other subtopics of **${lesson}** if you need a different perspective!)*`;
    }

    console.log(`[AITutor Debug]
- Active Subject: ${subject}
- Active Lesson: ${lesson} (${lessonId})
- User Question: "${question}"
- Final Response Displayed:
${response}`);
    
    return response;
  },

  async _askTutorInternal(context, question, actionType = '') {
    const { subject, category, lesson, difficulty, lessonId, selectedPart } = context;

    // 0. Perform Lesson-Lock Verification
    const lessonInfo = { title: lesson, topicTitle: category, subjectTitle: subject, difficulty };
    const lessonData = getLessonDataById(lessonId);
    const filter = getLessonFilter(lessonId, lessonInfo, lessonData);

    if (!this.isQuestionRelated(question, filter)) {
      const rejectionReason = `Question does not relate to allowed topics: ${filter.allowedTopics.join(', ')} or keywords.`;
      const finalRejection = `I am currently helping with the ${filter.lessonName} lesson. Please ask a lesson-related question.`;
      
      console.log(`[AITutor Debug]
- Active Subject: ${subject}
- Active Lesson: ${filter.lessonName} (${lessonId})
- User Question: "${question}"
- Prompt Sent To Gemini: (N/A - Rejected locally due to unrelated topic)
- Gemini Response: (N/A)
- Rejection Reason: ${rejectionReason}`);

      return finalRejection;
    }

    // Generate Flashcards
    const flashcards = this.getLessonFlashcards(lessonData);
    const flashcardsText = flashcards.length > 0
      ? flashcards.map((f, i) => `Flashcard ${i + 1} - Q: ${f.front} | A: ${f.back}`).join('\n')
      : 'No flashcards available.';

    const simulationText = lessonData?.sketchfabId
      ? `3D Model (Sketchfab ID: ${lessonData.sketchfabId})`
      : `Interactive 2D/3D Canvas Simulator for ${filter.lessonName}`;

    const historyText = context.history && context.history.length > 0
      ? context.history.slice(-10).map(m => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n')
      : 'No previous messages.';

    // 1. If SDK is initialized, run official GoogleGenerativeAI content generation
    if (genAI) {
      try {
        const prompt = `You are a dedicated science teacher and educational AI tutor for SciLearn AI.

Lesson Context:
- Current Subject: ${subject}
- Current Topic: ${category}
- Current Lesson: ${filter.lessonName}
- Lesson Summary: ${lessonData?.summary || ''}
- Lesson Notes: ${lessonData?.overview || ''}
- Current Simulation: ${simulationText}

Lesson Flashcards:
${flashcardsText}

Conversation History:
${historyText}

Strict Lesson Restrictions:
- ONLY answer questions related to the active lesson topic (${filter.allowedTopics.join(', ')}).
- If the student asks a question about an unrelated topic (e.g. asking about unrelated science, history, sports, coding, or popular culture):
  Do not answer it. Instead, politely say: "I am currently helping with the ${filter.lessonName} lesson. Please ask a lesson-related question."
- Keep your answers highly educational, accurate, concise, and structured with markdown.
- Answer directly from the lesson flashcards when appropriate.
- Avoid repeating identical answers or explanations unless the student repeats the exact same question. Offer variety, context retention, and follow-up understanding.

Student Question: ${question}
Tutor Response:`;

        console.log(`[AITutor Debug]
- Active Subject: ${subject}
- Active Lesson: ${filter.lessonName} (${lessonId})
- User Question: "${question}"
- Prompt Sent To Gemini:
${prompt}`);

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();
        
        console.log(`[AITutor Debug]
- Gemini Response:
${textResponse}`);

        if (textResponse) {
          return textResponse;
        }
      } catch (error) {
        console.error('[AIService] SDK generateContent failed, falling back to simulator:', error);
      }
    }

    // 2. Intelligent local simulator fallback (simulates network lag and answers contextually)
    console.log(`[AITutor Debug]
- Active Subject: ${subject}
- Active Lesson: ${filter.lessonName} (${lessonId})
- User Question: "${question}"
- Prompt Sent To Gemini: (N/A - Fallback Mode)
- Gemini Response: (N/A - Fallback Mode)`);

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay

    const title = lessonData?.title || lesson;
    const overview = lessonData?.overview || '';
    const summary = lessonData?.summary || '';
    const desc = lessonData?.description || '';
    const concepts = lessonData?.keyConcepts || [];
    const facts = lessonData?.facts || {};

    const firstConcept = concepts[0]?.name || 'Hypothesis';
    const firstConceptDesc = concepts[0]?.desc || 'An educated guess.';

    // Handle Quick Actions
    if (actionType === 'explain') {
      return `### 📖 Explaining: ${title}

${overview}

Here are the key concepts that define this topic:
${concepts.map(c => `* **${c.name}**: ${c.desc}`).join('\n')}

Let me know if you would like me to dive deeper into any of these specific areas!`;
    }

    if (actionType === 'summarize') {
      return `### 📝 Lesson Summary: ${title}

Here is a summary of our lesson on **${title}**:
* ${summary}

**Core Insights**:
* **Mechanism**: ${firstConceptDesc}
* **Real-World Impact**: ${facts.application || 'Applies to medical and industrial engineering.'}`;
    }

    if (actionType === 'facts') {
      return `### 💡 Key Facts: ${title}

* **Fascinating Fact**: ${facts.fun || 'Scientific breakthroughs often occur through collaborative trials.'}
* **Real-World Application**: ${facts.application || 'Understanding these principles underpins modern technology.'}`;
    }

    if (actionType === 'tips') {
      return `### 🎓 Exam Study Tips: ${title}

Here is an essential focus area for exams on **${title}** (${difficulty} level):
* **Exam Tip**: ${facts.exam || 'Always double-check formulas and constant values before writing the final solution.'}
* **Focus Area**: Be ready to define and describe the role of **${firstConcept}**.`;
    }

    if (actionType === 'notes') {
      return `### 📒 Study Notes: ${title}

**Subject**: ${subject} | **Topic**: ${category}
**Difficulty**: ${difficulty} Level

#### 1. Overview & Function
${overview}

#### 2. Key Terms & Concepts
${concepts.map(c => `* **${c.name}**: ${c.desc}`).join('\n')}

#### 3. Real-World Context
* ${facts.application || 'Applies to everyday mechanics.'}

*Notes generated automatically by SciLearn AI Tutor.*`;
    }

    if (actionType === 'practice') {
      return `### ✏️ Practice Questions: ${title}

Test your knowledge of the **${title}** with these exercises:

1. **Conceptual**: How does the structure of this system support its overall function?
2. **Analysis**: Explain the importance of **${firstConcept}** based on what we read.
3. **Application**: What is a real-world scenario where the principles of ${title} are applied?

*Try jotting down your answers in your Study Notes panel on the right!*`;
    }

    // Handle general student questions using semantic keyword matching
    const q = question.toLowerCase().trim();

    // A. Map natural question keywords to actionTypes dynamically
    if (q.includes('summary') || q.includes('summarize')) {
      return this.askTutor(context, question, 'summarize');
    }
    if (q.includes('fact') || q.includes('application') || q.includes('real world') || q.includes('did you know')) {
      return this.askTutor(context, question, 'facts');
    }
    if (q.includes('exam') || q.includes('study') || q.includes('tip') || q.includes('tips')) {
      return this.askTutor(context, question, 'tips');
    }
    if (q.includes('note') || q.includes('notes')) {
      return this.askTutor(context, question, 'notes');
    }
    if (q.includes('practice') || q.includes('question') || q.includes('quiz') || q.includes('test')) {
      return this.askTutor(context, question, 'practice');
    }

    // B. Check if the question references any specific structure from lessonParts (e.g. from Structures Checklist)
    const parts = lessonParts[lessonId];
    if (parts) {
      for (const part of parts) {
        const partName = part.name.toLowerCase();
        if (q.includes(partName) || q.includes(part.id.toLowerCase().replace('-', ' ')) || q.includes(part.id.toLowerCase().replace('_', ' '))) {
          return `### 🔍 Exploring Structure: ${part.name}
          
**Function**:
${part.desc}

**Key Fact**:
${part.fact}

*Feel free to select other structures from the checklist or ask general questions about this lesson!*`;
        }
      }
    }

    // C. Check if the question references any key concept defined in the lesson data
    if (lessonData && lessonData.keyConcepts) {
      for (const concept of lessonData.keyConcepts) {
        const conceptName = concept.name.toLowerCase();
        if (q.includes(conceptName) || 
            (conceptName.length > 4 && q.includes(conceptName.substring(0, conceptName.length - 1)))) {
          return `### 💡 Concept Focus: ${concept.name}
          
${concept.desc}

*This is a core concept in the **${title}** lesson. Feel free to ask more details about it!*`;
        }
      }
    }

    // D. Check if the question matches a flashcard question
    for (const card of flashcards) {
      const frontWords = card.front.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
      const questionWords = q.replace(/[^\w\s]/g, '').split(/\s+/);
      const overlap = frontWords.filter(w => w.length > 3 && questionWords.includes(w));
      if (overlap.length >= 2 || q.includes(card.front.toLowerCase()) || card.front.toLowerCase().includes(q)) {
        return `### 📇 Flashcard Answer: ${card.front}
        
${card.back}

*This answer is pulled directly from the lesson flashcards!*`;
      }
    }

    // Heart questions
    if (lessonId === 'heart') {
      if (q.includes('chamber') || q.includes('four') || q.includes('4')) {
        return `### 🫀 Why the heart has 4 chambers:
The human heart has **four chambers** (two upper atria, two lower ventricles) to keep oxygenated and deoxygenated blood completely separate. 

* **Pulmonary Circuit**: The right side receives oxygen-depleted blood from the body and pumps it to the lungs.
* **Systemic Circuit**: The left side receives oxygen-rich blood from the lungs and pumps it to the rest of the body.

This separation prevents blood mixing, allowing for maximum oxygen delivery efficiency, which supports the high metabolic rate required by warm-blooded mammals.`;
      }
      if (q.includes('beat') || q.includes('rate') || q.includes('rhythm') || q.includes('pacemaker') || q.includes('sa node')) {
        return `### ⚡ Heartbeat and Rhythm Control:
The heart is regulated by the **Sinoatrial (SA) Node**, which acts as the natural pacemaker. Located in the right atrium, it generates electrical impulses that spread through the myocardium (muscle), causing the chambers to contract rhythmically. On average, the heart beats 100,000 times a day to pump vital nutrients and oxygen.`;
      }
      if (q.includes('thick') || q.includes('left ventricle') || q.includes('walls')) {
        return `### 🩸 Left Ventricle Wall Thickness:
The left ventricle has much thicker walls than the right ventricle. This is an anatomical adaptation: the right ventricle only needs to pump blood to the nearby lungs, while the left ventricle must generate enough pressure to pump blood throughout the entire body (systemic circulation).`;
      }
    }

    // Brain questions
    if (lessonId === 'brain-cns') {
      if (q.includes('neuron') || q.includes('cells') || q.includes('how many')) {
        return `### 🧠 Neuronal Structure and Count:
The human brain contains approximately **86 billion neurons**. These cells are the core processors of the nervous system. They communicate using electrical **action potentials** along their membranes and pass chemical signals to adjacent neurons across junctions called **synapses**.`;
      }
      if (q.includes('barrier') || q.includes('bbb') || q.includes('blood')) {
        return `### 🛡️ The Blood-Brain Barrier (BBB):
The **blood-brain barrier** is a highly selective semipermeable border of endothelial cells. It acts as a shield, preventing toxins, pathogens, and foreign substances in circulating blood from entering brain tissues, while allowing essential nutrients like glucose and oxygen to pass through freely.`;
      }
      if (q.includes('cerebrum') || q.includes('cortex') || q.includes('largest')) {
        return `### 🌐 Cerebrum and Cerebral Cortex:
The **cerebrum** is the largest division of the brain, split into left and right hemispheres. Its outer surface, the **cerebral cortex** (gray matter), coordinates high-level cognitive functions, including reasoning, language, emotion, sensory interpretation, and voluntary motor controls.`;
      }
      if (q.includes('stem') || q.includes('brainstem') || q.includes('autonomic')) {
        return `### 🔌 The Brainstem and Autonomic Control:
The **brainstem** connects the cerebrum and spinal cord. It is responsible for critical, life-sustaining autonomic processes. It regulates your breathing, heart rate, blood pressure, and sleep-wake cycles without conscious effort.`;
      }
    }

    // Stomach questions
    if (lessonId === 'stomach-digestive-process') {
      if (q.includes('acid') || q.includes('ph') || q.includes('hydrochloric') || q.includes('hcl')) {
        return `### 🧪 Stomach Acid (HCl):
Stomach acid consists of **hydrochloric acid (HCl)**, which is secreted by specialized cells in the stomach lining. It lowers the stomach pH to between **1.5 and 3.5**. This extreme acidity serves two major purposes:
1. It kills most bacteria and pathogens consumed with food.
2. It denatures proteins, unfolding their 3D shapes so digestive enzymes can easily cleave them.`;
      }
      if (q.includes('pepsin') || q.includes('enzyme') || q.includes('protein')) {
        return `### 🥩 Protein Digestion & Pepsin:
Protein digestion begins chemically in the stomach. The main enzyme responsible is **pepsin**. Secreted in an inactive form (pepsinogen) to prevent self-digestion, it is activated by hydrochloric acid. Once active, pepsin cleaves proteins into smaller peptide chains.`;
      }
      if (q.includes('protect') || q.includes('mucus') || q.includes('self-digest') || q.includes('mucosal')) {
        return `### 🛡️ The Mucosal Barrier:
The stomach prevents self-digestion through a **mucosal barrier**. This is a physical and chemical layer of thick, alkaline mucus containing bicarbonate ions. It neutralizes stomach acid near the cell lining, protecting the stomach wall from being digested by HCl and pepsin.`;
      }
      if (q.includes('cardia') || q.includes('fundus') || q.includes('body') || q.includes('pylorus')) {
        return `### 📐 Anatomy of the Stomach:
The stomach has four major regions:
* **Cardia**: The entry point where the esophagus meets the stomach.
* **Fundus**: The upper rounded dome storing temporary gases.
* **Body**: The main central mixing reservoir where churning occurs.
* **Pylorus**: The lower funnel leading to the small intestine, controlled by the pyloric sphincter.`;
      }
    }

    // Plant Cell questions
    if (lessonId === 'plant-cell-structure') {
      if (q.includes('chloroplast')) {
        return `### 🍃 What is a chloroplast?
A **chloroplast** is a specialized organelle found in plant and algal cells. Its main function is to conduct **photosynthesis**, where it captures light energy from the sun and converts it into chemical energy (glucose) that the plant uses for growth and fuel.

* **Structure**: Chloroplasts have double membranes, and contain stacks of thylakoid discs (grana) surrounded by a fluid called the stroma.
* **Chlorophyll**: They contain green pigments called chlorophyll, which absorb blue and red light, reflecting green light and giving plants their characteristic color.`;
      }
      if (q.includes('cell wall') || q.includes('wall')) {
        return `### 🧱 Why do plant cells have a cell wall?
Unlike animal cells, plant cells possess a rigid, outer layer called the **cell wall**, located outside the cell membrane. 

Plant cells have a cell wall for several vital reasons:
1. **Structural Support**: It acts as an external skeleton, helping herbaceous plants grow upright against gravity.
2. **Protection**: It protects the cell from mechanical stress and physical damage.
3. **Turgor Pressure Resistance**: When the vacuole fills with water, it pushes against the cell wall. The rigid wall prevents the cell from bursting, maintaining 'turgor pressure' which keeps the plant firm and crisp.`;
      }
      if (q.includes('vacuole')) {
        return `### 💧 What is the function of the vacuole?
The **central vacuole** is a massive, membrane-bound organelle that is unique to plant cells. It performs several key roles:

* **Turgor Pressure**: It stores water, creating pressure against the cell wall. This turgor pressure keeps the plant cells rigid, preventing the plant from wilting.
* **Storage**: It holds nutrients, water, and proteins, and acts as a reservoir.
* **Waste Disposal**: It sequesters waste products to protect the rest of the cytoplasm from contamination.`;
      }
      if (q.includes('photosynthesis')) {
        return `### ☀️ How does photosynthesis occur?
**Photosynthesis** is the process by which plants, algae, and some bacteria convert light energy into chemical energy.

**Chemical Equation**:
$$\\text{6CO}_2 + \\text{6H}_2\\text{O} + \\text{light} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + \\text{6O}_2$$

**The two main stages**:
1. **Light-Dependent Reactions**: Occur in the thylakoid membranes of the chloroplast. Chlorophyll absorbs solar energy and uses it to split water molecules, generating ATP, NADPH, and releasing oxygen gas as a byproduct.
2. **Calvin Cycle (Light-Independent Reactions)**: Occurs in the stroma. Carbon dioxide is captured and combined using ATP and NADPH to build sugars like glucose.`;
      }
    }

    // Physics - Displacement, Velocity & Acceleration questions
    if (lessonId === 'velocity-accel') {
      if (q.includes('difference') || q.includes('speed vs') || q.includes('vs speed') || (q.includes('speed') && q.includes('velocity'))) {
        return `### ⚖️ Speed vs. Velocity
While often used interchangeably in everyday conversation, they have distinct definitions in physics:

* **Speed** is a **scalar quantity** (has only magnitude, no direction). It measures how fast an object is moving (e.g., "The car moves at 25 m/s").
* **Velocity** is a **vector quantity** (has both magnitude and direction). It measures how fast and in what direction an object moves (e.g., "The car moves at 25 m/s East").

**Example**: If a car drives in a circle at a constant speed of 20 m/s, its **speed is constant**, but its **velocity is constantly changing** because its direction of travel is changing at every point.`;
      }
      if (q.includes('velocity')) {
        return `### 🏹 What is Velocity?
**Velocity** is defined as the rate at which an object changes its position. It is a **vector quantity**, which means it has both:
1. **Magnitude** (the speed, e.g., 30 m/s)
2. **Direction** (e.g., East, forward, or along the positive x-axis)

**Formula**:
$$v = \\frac{\\Delta x}{\\Delta t} = \\frac{x_{\\text{final}} - x_{\\text{initial}}}{\\Delta t}$$

Where $\\Delta x$ represents displacement and $\\Delta t$ represents elapsed time. In our simulator, the velocity slider lets you set this rate directly!`;
      }
      if (q.includes('acceleration') || q.includes('deceleration') || q.includes('decelerate')) {
        return `### ⚡ What is Acceleration?
**Acceleration** is the rate of change of velocity over time. Like velocity, it is a **vector quantity** (has both magnitude and direction).

**Formula**:
$$a = \\frac{\\Delta v}{\\Delta t} = \\frac{v_{\\text{final}} - v_{\\text{initial}}}{\\Delta t}$$

**Key Points**:
* **Speeding Up**: Occurs when velocity and acceleration point in the same direction (both positive or both negative).
* **Slowing Down (Deceleration)**: Occurs when acceleration points in the opposite direction of velocity (e.g., positive velocity with negative acceleration, like braking).
* **Units**: Measured in meters per second squared (m/s²).`;
      }
      if (q.includes('displacement') || q.includes('distance')) {
        return `### 📍 What is Displacement?
**Displacement** is the net change in position of an object. It is a **vector quantity** representing the shortest straight-line path from the starting point to the ending point.

**Displacement vs. Distance**:
* **Distance** (scalar) is the total length of the actual path traveled.
* **Displacement** (vector) is the straight-line gap between start and end.

**Example**: If you walk 5 meters East and then 5 meters West, your total **distance** traveled is 10 meters, but your net **displacement** is 0 meters because you ended up exactly where you started!`;
      }
    }

    // Physics - Newton's Laws questions
    if (lessonId === 'newtons-laws') {
      if (q.includes('inertia') || q.includes('first law') || q.includes('law 1') || q.includes('rest') || q.includes('motion')) {
        return `### 📦 Newton's First Law (Law of Inertia)
Newton's First Law states that an object at rest stays at rest, and an object in motion stays in motion with a constant velocity, unless acted upon by a net external force.

* **Inertia** is an object's resistance to a change in its motion. An object's mass is a direct measure of its inertia.
* **Real-world example**: When a bus turns sharply, passengers sway sideways because their bodies tend to continue moving forward in a straight line.
* **Friction's Role**: On Earth, friction is the external force that slows sliding objects down. In our simulator, when friction is OFF (ice), the box slides at a constant speed forever once pushed, demonstrating Law 1 perfectly!`;
      }
      if (q.includes('fma') || q.includes('second law') || q.includes('law 2') || q.includes('mass') || q.includes('force') || q.includes('acceleration')) {
        return `### ⚡ Newton's Second Law (F = ma)
Newton's Second Law defines the relationship between force, mass, and acceleration:
$$F = m \\cdot a \\quad \\Rightarrow \\quad a = \\frac{F}{m}$$

* **Force (F)**: Directly proportional to acceleration. Doubling the force doubles the acceleration.
* **Mass (m)**: Inversely proportional to acceleration. Doubling the mass halves the acceleration.
* **Direction**: The acceleration vector always points in the exact direction of the net force vector.
* In our simulator, you can adjust mass and force sliders to see how acceleration reacts instantly. For instance, notice how a heavier box accelerates slower under the same force!`;
      }
      if (q.includes('reaction') || q.includes('third law') || q.includes('law 3') || q.includes('action') || q.includes('opposite') || q.includes('skater') || q.includes('rocket')) {
        return `### 🚀 Newton's Third Law (Action & Reaction)
Newton's Third Law states that for every action, there is an equal and opposite reaction.

* **Force Pairs**: Forces always occur in pairs. If body A exerts a force on body B ($F_{\\text{action}}$), B exerts a force on A ($F_{\\text{reaction}}$) that is equal in magnitude but opposite in direction.
* **Rocket Launch Example**: The rocket engine pushes hot exhaust gases downward (Action Force). In response, the exhaust gases push the rocket upward with an equal force (Reaction Force/Thrust).
* **Collision Example**: When two skaters push each other, they slide in opposite directions with equal force, but the lighter skater accelerates faster due to Law 2!`;
      }
      if (q.includes('friction') || q.includes('static') || q.includes('kinetic') || q.includes('ice')) {
        return `### 🛷 Friction Forces (Static vs. Kinetic)
Friction opposes motion between two surfaces in contact:

* **Static Friction**: The resistance force that keeps a stationary object at rest. To move the object, the applied force must exceed the maximum static friction ($f_s = \\mu_s \\cdot N$).
* **Kinetic Friction**: The friction force acting on an object while it is sliding. It is usually lower than static friction.
* In our Inertia Simulator, you can toggle friction ON or OFF to see how a static friction threshold blocks movement until the applied force is high enough. If friction is OFF, even the tiniest force immediately accelerates the box!`;
      }
    }

    // Friction & Drag questions
    if (lessonId === 'friction-drag') {
      if (q.includes('static') || q.includes('kinetic') || (q.includes('difference') && q.includes('friction'))) {
        return `### 🛷 Static vs. Kinetic Friction
Friction opposes relative motion between two contacting surfaces. It is categorized into two main states:

* **Static Friction (F_s)**: The resisting force that prevents a stationary object from starting to slide. It builds up to balance any applied force until it reaches a maximum limit:
  $$F_{s,\\text{max}} = \\mu_s \\cdot F_N$$
* **Kinetic Friction (F_k)**: The resisting force that acts on an object once it is already in motion. It is a constant value:
  $$F_k = \\mu_k \\cdot F_N$$

**Why μ_s > μ_k**: Microscopic contact points (welds) form between stationary surfaces. Once the object starts sliding, these points don't have time to fully establish, which is why kinetic friction is lower and it's easier to keep the block moving than to start it.`;
      }
      if (q.includes('coefficient') || q.includes('normal force') || q.includes('mass') || q.includes('calculate friction')) {
        return `### 📐 Calculating Friction Forces
Friction force is directly proportional to the **Normal Force ($F_N$)** pressing the surfaces together:
$$F_f = \\mu \\cdot F_N$$

For a horizontal surface at rest under gravity:
$$F_N = m \\cdot g$$

* **Effect of Mass**: Doubling the block's mass doubles the normal force, which exactly doubles both the static and kinetic friction limits.
* **Coefficients (μ)**:
  * **Ice**: $\\mu_s \\approx 0.1$, $\\mu_k \\approx 0.03$ (very slick, minimal force needed)
  * **Wood**: $\\mu_s \\approx 0.4$, $\\mu_k \\approx 0.3$ (moderate grip)
  * **Concrete**: $\\mu_s \\approx 0.7$, $\\mu_k \\approx 0.5$ (high grip)
  * **Sand**: $\\mu_s \\approx 0.9$, $\\mu_k \\approx 0.8$ (extremely high resistance)`;
      }
      if (q.includes('terminal') || q.includes('terminal velocity') || q.includes('balance') || q.includes('falling')) {
        return `### 🪂 Terminal Velocity
When an object is dropped, gravity accelerates it downward. As speed increases, the upward **drag force ($F_D$)** also increases. 

Eventually, the upward drag force grows until it exactly balances the downward force of gravity ($F_g = m \\cdot g$). 
At this point:
* **Net Force** ($F_{\\text{net}}$) = $0$
* **Acceleration** ($a$) = $0\\text{ m/s}^2$
* **Velocity** ($v$) becomes constant, which is called **Terminal Velocity ($v_t$)**.

**Formula for Terminal Velocity**:
$$v_t = \\sqrt{\\frac{2 \\cdot m \\cdot g}{\\rho \\cdot C_d \\cdot A}}$$

Where $m$ is mass, $\\rho$ is air density, $C_d$ is the drag coefficient, and $A$ is the parachute cross-sectional area.`;
      }
      if (q.includes('drag') || q.includes('air resistance') || q.includes('parachute') || q.includes('density') || q.includes('viscosity')) {
        return `### 🌀 Drag Force & Fluid Resistance
Drag force is the resistance experienced by an object moving through a fluid (such as air). At moderate to high speeds, it is governed by the quadratic drag equation:
$$F_D = \\frac{1}{2} \\rho \\cdot v^2 \\cdot C_d \\cdot A$$

Where:
* **$\\rho$ (Air Density)**: Thicker fluids increase drag force.
* **$v$ (Velocity)**: Drag increases with the square of speed ($v^2$). If you double your speed, the drag force quadruples!
* **$C_d$ (Drag Coefficient)**: Depends on the shape's aerodynamics (a flat parachute has a much higher $C_d$ than a streamlined bullet).
* **$A$ (Cross-sectional Area)**: Opening a parachute increases the surface area $A$, generating massive drag to slow the fall.`;
      }
    }

    // Bohr Model questions
    if (lessonId === 'bohr-model') {
      if (q.includes('shell') || q.includes('capacity') || q.includes('orbit') || q.includes('level')) {
        return `### 🛢️ Electron Shells & Energy Levels
In the Bohr Model, electrons orbit the nucleus only in specific, concentric paths called **shells** (or energy levels), designated by the principal quantum number $n$:

* **Quantized Levels**: The shells are numbered $n=1, n=2, n=3, n=4, \\dots$ starting from the one closest to the nucleus.
* **Electron Capacities**: Using the formula $2n^2$, the maximum capacity of each shell is:
  * **$n=1$ (K Shell)**: Max $2$ electrons
  * **$n=2$ (L Shell)**: Max $8$ electrons
  * **$n=3$ (M Shell)**: Max $18$ electrons
  * **$n=4$ (N Shell)**: Max $32$ electrons
* **Energy State**: Shells closer to the nucleus have *lower* potential energy, while shells further out have *higher* energy.`;
      }
      if (q.includes('jump') || q.includes('level') || q.includes('emission') || q.includes('absorption') || q.includes('photon') || q.includes('transition')) {
        return `### ⚛️ Why Electrons Jump Levels (Quantum Transitions)
Electrons jump between energy levels by absorbing or emitting discrete packets of energy called **photons**:

* **Photon Absorption (Excitation)**: When an electron absorbs a photon with the *exact* energy difference between its current shell and a higher shell, it jumps outward (e.g., $n=1 \\rightarrow n=2$ or $n=3$).
* **Photon Emission (Relaxation)**: An electron in an outer shell is unstable. It will eventually drop down to a lower shell, releasing its excess potential energy as an emitted photon of light.
* **Energy Difference Formula**: The energy ($E$) of the photon matches the shell transition gap:
  $$E = \\Delta E = E_{\\text{outer}} - E_{\\text{inner}} = h \\cdot f$$
  Where $h$ is Planck's constant and $f$ is the light's frequency, determining its specific color!`;
      }
      if (q.includes('excitation') || q.includes('excited') || q.includes('ground state')) {
        return `### 🌟 Ground State vs. Excited State
An atom's electronic configuration determines its energy state:

* **Ground State**: The lowest energy, most stable configuration where all electrons occupy the innermost shells available (e.g., hydrogen's single electron in $n=1$).
* **Excited State**: A temporary, high-energy configuration where one or more electrons have absorbed energy and jumped to a higher shell (e.g., hydrogen's electron in $n=2$ or $n=3$).
* **Excitation Energy**: The specific threshold amount of energy required to kick an electron from its ground state to a higher level. If the incoming energy is less than this threshold, the electron cannot transition!`;
      }
      if (q.includes('nucleus') || q.includes('proton') || q.includes('neutron') || q.includes('atomic')) {
        return `### 🔮 The Atomic Nucleus (Protons & Neutrons)
The center of the atom is the **nucleus**, which holds virtually all the atom's mass:

* **Protons**: Positively charged subatomic particles. The number of protons is the **Atomic Number ($Z$)**, which dictates which element the atom belongs to (e.g., Carbon has 6 protons, Neon has 10).
* **Neutrons**: Electrically neutral particles that act as a nuclear 'glue' holding the positive protons together via the Strong Nuclear Force.
* **Electrons**: Tiny negatively charged particles orbiting in shells outside the nucleus, balancing the positive charge of the protons.`;
      }
    }

    // Electron Configurations questions
    if (lessonId === 'electron-config') {
      if (q.includes('aufbau') || q.includes('filling') || q.includes('sequence') || q.includes('order')) {
        return `### 📈 The Aufbau Principle
The **Aufbau Principle** (from the German word *Aufbau* meaning "building up") states that in the ground state of an atom, electrons fill subshells of the lowest available energy levels first before occupying higher levels (e.g., 1s fills before 2s, 2s before 2p, 2p before 3s, etc.).

* **The Madelung Rule (n + l Rule)**: Subshell energies increase as the sum of the principal quantum number ($n$) and the azimuthal quantum number ($l$) increases. If two subshells have the same value of $n+l$, the one with the lower $n$ value has lower energy (e.g., 4s ($4+0=4$) fills before 3d ($3+2=5$)).
* **Aufbau Exceptions**: Transition metals like **Chromium** ([Ar] 3d⁵ 4s¹) and **Copper** ([Ar] 3d¹⁰ 4s¹) deviate from the expected filling sequence because half-filled or fully-filled d subshells are exceptionally stable.`;
      }
      if (q.includes('hund') || q.includes('rule') || q.includes('degenerate') || q.includes('parallel')) {
        return `### 🐕 Hund's Rule of Maximum Multiplicity
**Hund's Rule** states that for a given electron configuration, the lowest energy term is the one with the greatest value of spin multiplicity. Practically, this means that for degenerate orbitals (orbitals of equal energy, like the three 2p orbitals):

1. Electrons fill the orbitals **singly** first.
2. All singly occupied orbitals must have electrons with **parallel spins** (pointing in the same direction, usually spin-up ↑).
3. Electrons only begin to **pair up** (spin-down ↓) after every orbital in the subshell contains at least one electron.

* **Physical Rationale**: Keeping electrons in separate orbitals minimizes electrostatic electron-electron repulsion, which is energetically more stable.`;
      }
      if (q.includes('pauli') || q.includes('exclusion') || q.includes('spin') || q.includes('opposite')) {
        return `### 🚫 The Pauli Exclusion Principle
Proposed by Wolfgang Pauli in 1925, the **Pauli Exclusion Principle** states that:
* No two electrons in the same atom can have the identical set of all four quantum numbers ($n, l, m_l, m_s$).
* Because an orbital is defined by the first three quantum numbers ($n, l, m_l$), any single orbital can hold a **maximum of two electrons**.
* These two electrons must have **opposite spins** (spin quantum number $m_s = +1/2$ and $m_s = -1/2$, often denoted as ↑ and ↓).

If you try to place a third electron in a single orbital or place two electrons with the same spin, you violate the Pauli principle, which is physically impossible for fermions (like electrons).`;
      }
      if (q.includes('orbital') || q.includes('shape') || q.includes('dumbbell') || q.includes('clover') || q.includes('s') || q.includes('p') || q.includes('d') || q.includes('f')) {
        return `### 🔮 Shapes and Capacities of s, p, d, f Orbitals
Orbitals represent three-dimensional boundary surfaces where there is a 90% probability of finding an electron:

* **s Orbitals ($l = 0$)**: Spherical in shape. Each shell has 1 s-orbital, holding a max of **2 electrons**.
* **p Orbitals ($l = 1$)**: Dumbbell-shaped, oriented along the axes: $p_x, p_y, p_z$. Starting at $n=2$, each level has 3 p-orbitals, holding a max of **6 electrons**.
* **d Orbitals ($l = 2$)**: Cloverleaf-shaped (with one donut-collared shape $d_{z^2}$). Starting at $n=3$, each level has 5 d-orbitals, holding a max of **10 electrons**.
* **f Orbitals ($l = 3$)**: Multi-lobed, complex shapes. Starting at $n=4$, each level has 7 f-orbitals, holding a max of **14 electrons**.`;
      }
      if (q.includes('valence') || q.includes('outer') || q.includes('chemical') || q.includes('reactivity')) {
        return `### ⚡ Valence Electrons & Periodic Reactivity
**Valence electrons** are the electrons located in the outermost shell (highest principal quantum number $n$) of an atom. They dictate how an element bonds and reacts:

* **Octet Rule**: Main-group elements tend to gain, lose, or share electrons to achieve a stable configuration of 8 valence electrons (like the noble gases).
* **Finding Valence Count**: Sum the electrons in the outermost s and p subshells. E.g., Chlorine ($1s^2 2s^2 2p^6 3s^2 3p^5$) has the highest shell $n=3$, which holds $2 + 5 = 7$ valence electrons.`;
      }
    }

    // Acids and Bases (pH & pOH) questions
    if (lessonId === 'ph-poh-scale') {
      if (q.includes('what is ph') || q.includes('definition') || q.includes('scale') || q.includes('poh') || q.includes('neutral') || q.includes('alkaline')) {
        return `### 🌡️ Understanding the pH and pOH Scales
**pH** stands for **"potential of Hydrogen"** (or power of Hydrogen) and is a logarithmic scale measuring the concentration of hydrogen ions ($[H^+]$ or hydronium ions $[H_3O^+]$) in a solution:
$$\\text{pH} = -\\log_{10}[H^+]$$

* **The Scale (0 to 14)**:
  * **pH < 7**: Acidic (higher $[H^+]$ concentration). Lower pH = stronger acidity.
  * **pH = 7**: Neutral (like pure water, where $[H^+] = [OH^-] = 10^{-7}\\text{ M}$ at $25^\\circ\\text{C}$).
  * **pH > 7**: Basic/Alkaline (lower $[H^+]$, higher hydroxide $[OH^-]$ concentration).
* **The pOH Scale**: Measures hydroxide ion concentration: $\\text{pOH} = -\\log_{10}[OH^-]$. In aqueous solutions at $25^\\circ\\text{C}$, they are linked by:
  $$\\text{pH} + \\text{pOH} = 14$$

*Note: Each single unit change on the pH scale represents a tenfold (10x) change in $[H^+]$ concentration. For example, a solution with pH 3 has 10 times more $H^+$ ions than a solution with pH 4.*`;
      }
      if (q.includes('strong') || q.includes('weak') || q.includes('dissociation') || q.includes('ionization') || q.includes('hcl') || q.includes('acetic') || q.includes('dissociate') || q.includes('ionize')) {
        return `### ⚡ Strong vs. Weak Acids: Molecular Ionization
The strength of an acid is determined by its **extent of dissociation (ionization)** in water:

1. **Strong Acids**: Ionize **completely** (nearly 100%) in aqueous solution.
   * **Examples**: Hydrochloric acid ($HCl$), Sulfuric acid ($H_2SO_4$).
   * **HCl Equation**: $HCl(aq) \\rightarrow H^+(aq) + Cl^-(aq)$
   * *Observation*: In a strong acid solution, virtually all original acid molecules split into free $H^+$ and conjugate base anions. No intact $HCl$ molecules remain.
2. **Weak Acids**: Ionize only **partially** (typically less than 5%) in water, establishing a dynamic chemical equilibrium.
   * **Examples**: Acetic acid ($CH_3COOH$, vinegar), Citric acid.
   * **Acetic Acid Equation**: $CH_3COOH(aq) \\rightleftharpoons H^+(aq) + CH_3COO^-(aq)$
   * *Observation*: A weak acid solution consists mostly of intact, neutral, undissociated molecules, with only a small quantity of free $H^+$ and anions.

* **Acid Ionization Constant ($K_a$)**: Measures acid strength. Stronger acids have larger $K_a$ values, representing greater dissociation.*`;
      }
      if (q.includes('indicator') || q.includes('color') || q.includes('litmus') || q.includes('universal') || q.includes('change')) {
        return `### 🧪 How pH Indicators Work
**pH indicators** are weak organic acids or bases that change color in response to changes in hydrogen ion concentration ($[H^+]$):
$$\\text{HIn}(aq) \\rightleftharpoons H^+(aq) + \\text{In}^-(aq)$$

* **Acidic Environment (excess $H^+$)**: According to Le Chatelier's principle, adding $H^+$ shifts the equilibrium to the left. The indicator exists primarily in its protonated form ($\\text{HIn}$), exhibiting its acidic color (e.g., red for litmus, colorless for phenolphthalein).
* **Basic Environment (depleted $H^+$)**: Adding a base removes $H^+$ (forming water: $H^+ + OH^- \\rightarrow H_2O$). The equilibrium shifts to the right. The indicator exists primarily in its deprotonated conjugate base form ($\\text{In}^-$), exhibiting its basic color (e.g., blue for litmus, pink for phenolphthalein).
* In our virtual laboratory, different solutions display indicator colors corresponding to their pH values on a continuous spectrum from red (highly acidic) to purple (highly basic).`;
      }
    }

    // Neutralization and Titrations questions
    if (lessonId === 'acid-base-titrations') {
      if (q.includes('neutral') || q.includes('reaction') || q.includes('equation') || q.includes('salt') || q.includes('water')) {
        return `### 🚰 Neutralization Reactions
A **neutralization reaction** is a chemical reaction in which an acid and a base react quantitatively with each other to produce water and a salt:
$$\\text{Acid} + \\text{Base} \\rightarrow \\text{Salt} + \\text{Water}$$

* **Net Ionic Equation**: For any strong acid-strong base reaction in water, the actual reaction is the combination of hydronium ($H^+$) and hydroxide ($OH^-$) ions to form water:
  $$H^+(aq) + OH^-(aq) \\rightarrow H_2O(l)$$
* **Example (HCl + NaOH)**:
  $$HCl(aq) + NaOH(aq) \\rightarrow NaCl(aq) + H_2O(l)$$
  Here, sodium ($Na^+$) and chloride ($Cl^-$) are spectator ions that remain dissolved, forming common table salt ($NaCl$) if the water is evaporated.
* **Particle view**: In the simulator, you can see $H^+$ (red) and $OH^-$ (blue) ions combining to form stable $H_2O$ (cyan) molecules, releasing a brief spark of energy!`;
      }
      if (q.includes('titra') || q.includes('work') || q.includes('analyte') || q.includes('titrant') || q.includes('burette') || q.includes('flask')) {
        return `### 🧪 How Acid-Base Titration Works
**Titration** is a quantitative analytical laboratory technique used to determine the unknown concentration of an identified analyte (in the flask) by slowly adding a titrant of known concentration (from the burette).

* **Apparatus**:
  * **Burette**: A long, graduated glass tube with a stopcock at the bottom. It holds the **titrant** (e.g., $0.10\\text{ M NaOH}$) and measures the exact volume added.
  * **Erlenmeyer Flask**: Holds the **analyte** of unknown concentration (e.g., $25.0\\text{ mL}$ of $HCl$) along with a few drops of indicator.
* **Procedure**: Open the stopcock to add the titrant drop-by-drop while swirling the flask until the indicator permanently changes color (endpoint), signaling that neutralization is complete.`;
      }
      if (q.includes('equiv') || q.includes('point') || q.includes('endpoint') || q.includes('end point') || q.includes('calculation')) {
        return `### 🎯 Equivalence Point vs. Endpoint
* **Equivalence Point**: The theoretical point in a titration where the quantity of added titrant is stoichiometrically equal to the quantity of analyte in the sample:
  $$\\text{moles of } H^+ = \\text{moles of } OH^-$$
  For a strong acid-strong base titration, this occurs at exactly **pH = 7.0**.
* **Endpoint**: The physical point in the laboratory where the pH indicator changes color. We select indicators whose transition range matches the steep vertical section of the pH titration curve so that the endpoint is as close to the equivalence point as possible.
* **Standard Calculation**:
  $$M_{\\text{acid}} \\cdot V_{\\text{acid}} = M_{\\text{base}} \\cdot V_{\\text{base}}$$
  For monoprotic systems, if you know three values, you can solve for the fourth!`;
      }
      if (q.includes('indicator') || q.includes('phenolphthalein') || q.includes('pink') || q.includes('color')) {
        return `### 🌸 Indicators and Phenolphthalein transitions
In titrations, **phenolphthalein** is the most common indicator for strong base titrations:

* **pH < 8.2**: The solution remains **colorless** (acidic/neutral range).
* **pH 8.2 - 10.0**: The solution transitions to a **light pink**. The faint, persistent pink color (lasting 30 seconds of swirling) represents the true titration endpoint.
* **pH > 10.0**: The solution becomes a deep **fuchsia/purple**.
* **Other Indicators**:
  * **Bromothymol Blue**: Transitions from yellow (acidic) to green (neutral, pH 6.0-7.6) to blue (basic).
  * **Methyl Orange**: Transitions from red (acidic, pH 3.1) to yellow (basic, pH > 4.4).`;
      }
    }


    // Improved dynamic lesson-specific fallback response
    const conceptList = concepts.map(c => `• **${c.name}**: ${c.desc}`).join('\n');
    return `### 💡 SciLearn AI Tutor: ${title}

I can help you explore the key concepts of **${title}**. 

Here is what we are focusing on in this lesson:
${conceptList}

**Interesting Fact**:
${facts.fun || 'This lesson explores fundamental scientific principles.'}

Please ask a question about any of these concepts, select a structure from the checklist to inspect, or let me know if you would like study notes or practice questions!`;
  }
};
