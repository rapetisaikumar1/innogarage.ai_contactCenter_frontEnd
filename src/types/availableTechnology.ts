export type TechnologyCategory =
  | 'MARKETING_AUTOMATION_ADOBE_STACK'
  | 'DATA_ANALYTICS_CDP'
  | 'CORE_ENGINEERING_DEVELOPMENT'
  | 'AUTOMATION_TESTING_VALIDATION'
  | 'INFRASTRUCTURE_OPERATIONS'
  | 'ENTERPRISE_TOOLS_BUSINESS_SYSTEMS'
  | 'SEMICONDUCTOR_HARDWARE'
  | 'MISC_OTHER';

export interface AvailableTechnology {
  id: string;
  name: string;
  category: TechnologyCategory;
  description: string | null;
  candidateCount: number;
  createdAt: string;
  updatedAt: string;
}

export const TECHNOLOGY_CATEGORY_ORDER: TechnologyCategory[] = [
  'MARKETING_AUTOMATION_ADOBE_STACK',
  'DATA_ANALYTICS_CDP',
  'CORE_ENGINEERING_DEVELOPMENT',
  'AUTOMATION_TESTING_VALIDATION',
  'INFRASTRUCTURE_OPERATIONS',
  'ENTERPRISE_TOOLS_BUSINESS_SYSTEMS',
  'SEMICONDUCTOR_HARDWARE',
  'MISC_OTHER',
];

export const TECHNOLOGY_CATEGORY_LABELS: Record<TechnologyCategory, string> = {
  MARKETING_AUTOMATION_ADOBE_STACK: 'Marketing Automation & Adobe Stack',
  DATA_ANALYTICS_CDP: 'Data & Analytics / CDP',
  CORE_ENGINEERING_DEVELOPMENT: 'Core Engineering & Development',
  AUTOMATION_TESTING_VALIDATION: 'Automation, Testing & Validation',
  INFRASTRUCTURE_OPERATIONS: 'Infrastructure & Operations',
  ENTERPRISE_TOOLS_BUSINESS_SYSTEMS: 'Enterprise Tools & Business Systems',
  SEMICONDUCTOR_HARDWARE: 'Semiconductor & Hardware',
  MISC_OTHER: 'Misc / Other',
};

export const TECHNOLOGY_CATEGORY_SUMMARIES: Record<TechnologyCategory, string> = {
  MARKETING_AUTOMATION_ADOBE_STACK: 'Campaign orchestration, CRM alignment, and Adobe ecosystem capabilities.',
  DATA_ANALYTICS_CDP: 'Data products, interoperability, analytics platforms, and AI-driven delivery.',
  CORE_ENGINEERING_DEVELOPMENT: 'Hands-on engineering roles spanning product development and field enablement.',
  AUTOMATION_TESTING_VALIDATION: 'Quality engineering, validation disciplines, and workflow automation coverage.',
  INFRASTRUCTURE_OPERATIONS: 'Operational technologies that support infrastructure resilience and delivery.',
  ENTERPRISE_TOOLS_BUSINESS_SYSTEMS: 'Business systems, workforce tooling, finance operations, and planning platforms.',
  SEMICONDUCTOR_HARDWARE: 'Specialized hardware and silicon-domain capability coverage.',
  MISC_OTHER: 'Additional technologies and niche capabilities tracked outside the main clusters.',
};