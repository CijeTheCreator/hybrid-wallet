'use client';

import { TransactionDetails } from '@/components/TransactionDetails';

interface TransactionPageProps {
  params: {
    id: string;
  };
}

export default function TransactionPage({ params }: TransactionPageProps) {
  return <TransactionDetails transactionId={params.id} />;
}