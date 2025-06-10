import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ErrorNode = {
  errors?: string[];
  properties?: Record<string, ErrorNode>;
};

export const collectErrorMessages = (node: ErrorNode): string[] => {
  const messages: string[] = [];

  if (Array.isArray(node?.errors)) {
    messages.push(...node.errors);
  }
  if (node?.properties && typeof node.properties === 'object') {
    Object.values(node.properties).forEach((childNode) => {
      messages.push(...collectErrorMessages(childNode));
    });
  }

  return messages;
};
