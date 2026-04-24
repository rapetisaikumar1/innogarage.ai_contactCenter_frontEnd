'use client';

import { use } from 'react';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ candidateId: string }>;
}

// Redirect old deep-link URLs to the main inbox page
// The main /inbox page now handles conversation selection inline
export default function ConversationPage({ params }: Props) {
  const { candidateId } = use(params);
  redirect(`/inbox?candidate=${candidateId}`);
}
