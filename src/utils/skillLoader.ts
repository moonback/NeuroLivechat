/// <reference types="vite/client" />
/**
 * Skill Loader Utility
 * Dynamically imports all markdown files from the ../skills directory
 * and aggregates them into a single string for the System Instruction.
 */

export const loadSkills = async (): Promise<string> => {
  // Use Vite's glob import to find all .md files in the skills directory
  // We use { query: '?raw', import: 'default' } to get the file content as a string
  const skillFiles = import.meta.glob('../skills/*.md', { 
    query: '?raw', 
    import: 'default',
    eager: true 
  });

  let aggregatedSkills = "\n\n### COMPÉTENCES DISPONIBLES (SKILLS) :\n";
  aggregatedSkills += "Tu dois utiliser les informations ci-dessous pour étendre tes capacités et suivre les règles spécifiques à chaque domaine.\n\n";

  for (const path in skillFiles) {
    const content = skillFiles[path] as string;
    const fileName = path.split('/').pop()?.replace('.md', '') || 'unknown';
    
    aggregatedSkills += `--- SKILL: ${fileName.toUpperCase()} ---\n`;
    aggregatedSkills += content + "\n\n";
  }

  return aggregatedSkills;
};
