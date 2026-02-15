import React from "react";
import { 
  Utensils, 
  Car, 
  Zap, 
  ShoppingBag, 
  HeartPulse, 
  GraduationCap, 
  Home as HomeIcon, 
  Coffee, 
  Wallet, 
  MoreHorizontal,
  Gift,
  TrendingUp,
  Briefcase
} from "lucide-react";

export const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('food') || n.includes('restaurant') || n.includes('eat')) return <Utensils className="h-4 w-4" />;
  if (n.includes('transport') || n.includes('car') || n.includes('fuel')) return <Car className="h-4 w-4" />;
  if (n.includes('utilit') || n.includes('bill') || n.includes('electricity')) return <Zap className="h-4 w-4" />;
  if (n.includes('shop') || n.includes('cloth') || n.includes('buy')) return <ShoppingBag className="h-4 w-4" />;
  if (n.includes('health') || n.includes('med') || n.includes('doctor')) return <HeartPulse className="h-4 w-4" />;
  if (n.includes('educat') || n.includes('school') || n.includes('book')) return <GraduationCap className="h-4 w-4" />;
  if (n.includes('rent') || n.includes('home') || n.includes('mortgage')) return <HomeIcon className="h-4 w-4" />;
  if (n.includes('coffee') || n.includes('cafe') || n.includes('drink')) return <Coffee className="h-4 w-4" />;
  if (n.includes('salary') || n.includes('paycheck') || n.includes('work')) return <Briefcase className="h-4 w-4" />;
  if (n.includes('gift') || n.includes('present')) return <Gift className="h-4 w-4" />;
  if (n.includes('invest') || n.includes('stock') || n.includes('profit')) return <TrendingUp className="h-4 w-4" />;
  if (n.includes('income') || n.includes('freelance')) return <Wallet className="h-4 w-4" />;
  return <MoreHorizontal className="h-4 w-4" />;
};