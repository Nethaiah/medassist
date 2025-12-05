/**
 * OpenFDA API Integration
 * Provides drug interaction checking, adverse events, and drug labeling data
 * API Docs: https://open.fda.gov/apis/
 */

const FDA_BASE_URL = 'https://api.fda.gov';

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: 'major' | 'moderate' | 'minor';
  description: string;
}

export interface AdverseEvent {
  reaction: string;
  severity: string;
  frequency?: string;
}

/**
 * Search drug labels for a specific medication
 */
export async function searchDrugLabel(drugName: string): Promise<any | null> {
  try {
    const url = `${FDA_BASE_URL}/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(drugName)}"&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`FDA API returned ${response.status} for drug: ${drugName}`);
      return null;
    }
    
    const data = await response.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.error('Error fetching drug label:', error);
    return null;
  }
}

/**
 * Check for drug interactions using OpenFDA data
 */
export async function checkDrugInteractions(
  medications: string[],
  currentMedications: string
): Promise<DrugInteraction[]> {
  const interactions: DrugInteraction[] = [];
  
  // Parse current medications
  const currentMeds = currentMedications
    .split(/[,;]/)
    .map(m => m.trim())
    .filter(m => m.length > 0);
  
  if (currentMeds.length === 0) {
    return interactions;
  }
  
  // Check each recommended medication for interactions
  for (const newMed of medications) {
    try {
      const label = await searchDrugLabel(newMed);
      
      if (label?.drug_interactions) {
        const interactionText = Array.isArray(label.drug_interactions)
          ? label.drug_interactions.join(' ')
          : label.drug_interactions;
        
        // Check if any current medication is mentioned in interaction text
        for (const currentMed of currentMeds) {
          const mentionsInteraction = interactionText
            .toLowerCase()
            .includes(currentMed.toLowerCase());
          
          if (mentionsInteraction) {
            interactions.push({
              drug1: newMed,
              drug2: currentMed,
              severity: determineSeverity(interactionText),
              description: extractInteractionDescription(interactionText, currentMed)
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error checking interactions for ${newMed}:`, error);
    }
  }
  
  return interactions;
}

/**
 * Get adverse events for a medication
 */
export async function getAdverseEvents(drugName: string): Promise<AdverseEvent[]> {
  try {
    const url = `${FDA_BASE_URL}/drug/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(drugName)}"&count=patient.reaction.reactionmeddrapt.exact&limit=5`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    
    return (data.results || []).map((result: any) => ({
      reaction: result.term,
      severity: 'moderate', // FDA doesn't provide severity directly
      frequency: `${result.count} reports`
    }));
  } catch (error) {
    console.error('Error fetching adverse events:', error);
    return [];
  }
}

/**
 * Check if drug has contraindications for specific conditions
 */
export async function checkContraindications(
  drugName: string,
  conditions: string[]
): Promise<string[]> {
  const contraindications: string[] = [];
  
  try {
    const label = await searchDrugLabel(drugName);
    
    if (label?.contraindications) {
      const contraindicationText = Array.isArray(label.contraindications)
        ? label.contraindications.join(' ')
        : label.contraindications;
      
      for (const condition of conditions) {
        if (contraindicationText.toLowerCase().includes(condition.toLowerCase())) {
          contraindications.push(`${drugName} is contraindicated in ${condition}`);
        }
      }
    }
    
    // Check warnings and precautions too
    if (label?.warnings_and_cautions) {
      const warningsText = Array.isArray(label.warnings_and_cautions)
        ? label.warnings_and_cautions.join(' ')
        : label.warnings_and_cautions;
      
      for (const condition of conditions) {
        if (warningsText.toLowerCase().includes(condition.toLowerCase())) {
          contraindications.push(`Caution: ${drugName} requires monitoring with ${condition}`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking contraindications:', error);
  }
  
  return contraindications;
}

/**
 * Helper: Determine severity from interaction text
 */
function determineSeverity(text: string): 'major' | 'moderate' | 'minor' {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('contraindicated') || 
      lowerText.includes('severe') ||
      lowerText.includes('life-threatening')) {
    return 'major';
  }
  
  if (lowerText.includes('caution') || 
      lowerText.includes('monitor') ||
      lowerText.includes('adjust')) {
    return 'moderate';
  }
  
  return 'minor';
}

/**
 * Helper: Extract specific interaction description
 */
function extractInteractionDescription(fullText: string, drugName: string): string {
  // Find the sentence mentioning the drug
  const sentences = fullText.split(/[.!?]+/);
  const relevantSentence = sentences.find(s => 
    s.toLowerCase().includes(drugName.toLowerCase())
  );
  
  return relevantSentence?.trim() || 'Potential drug interaction detected';
}

/**
 * Validate medication dosage using FDA label data
 */
export async function validateDosage(
  drugName: string,
  dosage: string,
  patientAge?: number
): Promise<{ valid: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  
  try {
    const label = await searchDrugLabel(drugName);
    
    if (label?.dosage_and_administration) {
      const dosageText = Array.isArray(label.dosage_and_administration)
        ? label.dosage_and_administration.join(' ')
        : label.dosage_and_administration;
      
      // Check for pediatric/geriatric warnings
      if (patientAge && patientAge < 18 && dosageText.toLowerCase().includes('pediatric')) {
        warnings.push('Pediatric dosage adjustment may be required');
      }
      
      if (patientAge && patientAge >= 65 && dosageText.toLowerCase().includes('geriatric')) {
        warnings.push('Geriatric dosage adjustment may be required');
      }
      
      // Check for renal/hepatic impairment mentions
      if (dosageText.toLowerCase().includes('renal impairment')) {
        warnings.push('Renal function should be assessed for dosage adjustment');
      }
      
      if (dosageText.toLowerCase().includes('hepatic impairment')) {
        warnings.push('Hepatic function should be assessed for dosage adjustment');
      }
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  } catch (error) {
    console.error('Error validating dosage:', error);
    return { valid: true, warnings: ['Unable to validate dosage with FDA data'] };
  }
}
