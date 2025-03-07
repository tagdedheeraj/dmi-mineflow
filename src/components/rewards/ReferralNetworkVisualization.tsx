
import React, { useEffect, useRef } from 'react';
import { Users } from 'lucide-react';

interface ReferralNetworkVisualizationProps {
  network: any[];
}

const ReferralNetworkVisualization: React.FC<ReferralNetworkVisualizationProps> = ({ network }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current || network.length === 0) return;
    
    // Clear previous visualization
    const container = canvasRef.current;
    container.innerHTML = '';
    
    // Create visualization (simple DOM-based tree)
    const tree = document.createElement('div');
    tree.className = 'flex flex-col items-center';
    
    // Create root node (current user)
    const rootNode = createNode('You', 'bg-dmi/20 text-dmi border-dmi/30');
    tree.appendChild(rootNode);
    
    // Add level 1 connections
    const level1Container = document.createElement('div');
    level1Container.className = 'flex flex-wrap justify-center mt-4 gap-2';
    
    // Filter level 1 referrals
    const level1Referrals = network.filter(node => node.level === 1);
    
    // Add connecting lines from root to level 1
    if (level1Referrals.length > 0) {
      const linesContainer = document.createElement('div');
      linesContainer.className = 'w-0.5 h-4 bg-gray-300 mx-auto';
      tree.appendChild(linesContainer);
    }
    
    // Add level 1 nodes
    level1Referrals.forEach(referral => {
      const node = createNode(referral.name || 'User', 'bg-blue-100 text-blue-700 border-blue-200');
      level1Container.appendChild(node);
      
      // Check if this referral has any level 2 referrals
      const level2Referrals = network.filter(node => node.level === 2 && node.parentId === referral.id);
      
      if (level2Referrals.length > 0) {
        // Add container for level 2 referrals under this level 1 referral
        const level2Container = document.createElement('div');
        level2Container.className = 'flex flex-wrap justify-center mt-2 gap-1';
        
        // Add connecting line
        const lineContainer = document.createElement('div');
        lineContainer.className = 'w-0.5 h-2 bg-gray-300 mx-auto';
        
        // Add level 2 nodes
        level2Referrals.forEach(l2Referral => {
          const l2Node = createNode(l2Referral.name || 'User', 'bg-green-100 text-green-700 border-green-200 text-xs py-1 px-2');
          level2Container.appendChild(l2Node);
        });
        
        // Create a wrapper for this branch
        const branchWrapper = document.createElement('div');
        branchWrapper.className = 'flex flex-col items-center';
        branchWrapper.appendChild(node);
        branchWrapper.appendChild(lineContainer);
        branchWrapper.appendChild(level2Container);
        
        level1Container.appendChild(branchWrapper);
      } else {
        level1Container.appendChild(node);
      }
    });
    
    tree.appendChild(level1Container);
    container.appendChild(tree);
    
  }, [network]);
  
  // Helper function to create a node element
  const createNode = (name: string, colorClasses: string) => {
    const node = document.createElement('div');
    node.className = `rounded-full py-2 px-3 flex items-center border ${colorClasses} text-sm whitespace-nowrap`;
    
    const icon = document.createElement('span');
    icon.className = 'mr-1';
    icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
    
    const text = document.createElement('span');
    text.textContent = name;
    
    node.appendChild(icon);
    node.appendChild(text);
    
    return node;
  };
  
  // Fallback UI for empty network
  if (network.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Users className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-500">Your referral network will appear here once you have referrals.</p>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-auto flex items-center justify-center p-2" ref={canvasRef}>
      {/* Network visualization will be rendered here */}
    </div>
  );
};

export default ReferralNetworkVisualization;
