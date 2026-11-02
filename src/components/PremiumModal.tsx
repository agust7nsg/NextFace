import React from 'react';
import PaywallModal from './PaywallModal';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  return <PaywallModal isOpen={isOpen} onClose={onClose} />;
}
