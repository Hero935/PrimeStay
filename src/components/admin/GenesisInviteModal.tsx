/**
 * GenesisInviteModal.tsx
 * Admin AIC v3 創世邀請系統 (Genesis Onboarding)
 * 專為房東 (Landlord) 與代管人員 (Manager) 設計的多步驟邀請流。
 */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Mail, 
  Building, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "IDENTITY" | "DETAILS" | "GOVERNANCE" | "GENESIS";

interface GenesisInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "LANDLORD" | "MANAGER";
}

export function GenesisInviteModal({ isOpen, onClose, type }: GenesisInviteModalProps) {
  const [step, setStep] = useState<Step>("IDENTITY");
  const [email, setEmail] = useState("");
  const [orgName, setOrgName] = useState("");

  const nextStep = () => {
    if (step === "IDENTITY") setStep("DETAILS");
    else if (step === "DETAILS") setStep("GOVERNANCE");
    else if (step === "GOVERNANCE") setStep("GENESIS");
  };

  const prevStep = () => {
    if (step === "DETAILS") setStep("IDENTITY");
    else if (step === "GOVERNANCE") setStep("DETAILS");
    else if (step === "GENESIS") setStep("GOVERNANCE");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#020617] border-slate-800 text-slate-100 p-0 overflow-hidden">
        {/* 頂部進度條 */}
        <div className="h-1 w-full bg-slate-900 flex">
           <div className={cn("h-full bg-indigo-500 transition-all duration-500", 
             step === "IDENTITY" ? "w-1/4" : 
             step === "DETAILS" ? "w-2/4" : 
             step === "GOVERNANCE" ? "w-3/4" : "w-full"
           )} />
        </div>

        <div className="p-6">
            <DialogHeader className="mb-8">
                <div className="flex items-center gap-2 mb-2 text-indigo-400">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[.2em]">Genesis Protocol</span>
                </div>
                <DialogTitle className="text-xl font-mono font-bold tracking-tight">
                    {step === "IDENTITY" && `Define ${type} Identity`}
                    {step === "DETAILS" && "Establish Organization"}
                    {step === "GOVERNANCE" && "Governance Constraints"}
                    {step === "GENESIS" && "Finalize Initiation"}
                </DialogTitle>
                <DialogDescription className="text-slate-500 text-xs mt-1">
                    {step === "IDENTITY" && "Specify the target node's primary communication channel."}
                    {step === "DETAILS" && "Link this identity to a structural platform entity."}
                    {step === "GOVERNANCE" && "Define the operational boundaries for this node."}
                    {step === "GENESIS" && "Commit the invitation hash to the Genesis registry."}
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-2">
                {step === "IDENTITY" && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Node Email (Primary Key)</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                                <Input 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="landlord@example.com" 
                                    className="bg-[#0F172A] border-slate-800 pl-10 h-11 text-sm focus-visible:ring-indigo-500/30"
                                />
                            </div>
                        </div>
                        <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
                            <ShieldCheck className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                            <p className="text-[10px] text-indigo-300 leading-relaxed">
                                The system will generate a unique AIC-Genesis hash linked to this identity. This cannot be modified after initiation.
                            </p>
                        </div>
                    </div>
                )}

                {step === "DETAILS" && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Organization Name</Label>
                            <div className="relative group">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
                                <Input 
                                    value={orgName}
                                    onChange={(e) => setOrgName(e.target.value)}
                                    placeholder="Enter structural name" 
                                    className="bg-[#0F172A] border-slate-800 pl-10 h-11 text-sm focus-visible:ring-emerald-500/30"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg border border-slate-800 bg-[#0F172A]/50">
                                <span className="text-[8px] font-bold text-slate-600 uppercase block mb-1">Region</span>
                                <span className="text-xs text-slate-300">Global Cluster</span>
                            </div>
                            <div className="p-3 rounded-lg border border-slate-800 bg-[#0F172A]/50">
                                <span className="text-[8px] font-bold text-slate-600 uppercase block mb-1">Quota</span>
                                <span className="text-xs text-slate-300 font-mono">∞ Unlimited</span>
                            </div>
                        </div>
                    </div>
                )}

                {step === "GOVERNANCE" && (
                    <div className="space-y-4">
                        <div className="p-4 border border-slate-800 rounded-xl space-y-4">
                             <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-[11px] font-bold text-slate-200">Mutation Access</div>
                                    <div className="text-[10px] text-slate-500">Allow node to modify system objects.</div>
                                </div>
                                <div className="h-5 w-10 bg-indigo-600 rounded-full flex items-center px-1">
                                    <div className="h-3 w-3 bg-white rounded-full ml-auto" />
                                </div>
                             </div>
                             <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <div className="text-[11px] font-bold text-slate-200">Financial Insights</div>
                                    <div className="text-[10px] text-slate-500">Node can view platform-wide MRR data.</div>
                                </div>
                                <div className="h-5 w-10 bg-slate-800 rounded-full flex items-center px-1">
                                    <div className="h-3 w-3 bg-slate-600 rounded-full" />
                                </div>
                             </div>
                        </div>
                        <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 text-[9px] w-full justify-center py-1">
                            GOVERNANCE MODEL: AIC-V3-STRICT
                        </Badge>
                    </div>
                )}

                {step === "GENESIS" && (
                    <div className="flex flex-col items-center text-center py-6 space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                            <Zap className="w-16 h-16 text-indigo-400 relative z-10" />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-lg font-bold text-slate-100">Ready for Initiation</h3>
                            <p className="text-xs text-slate-500 max-w-xs mx-auto">
                                Committing this node to the registry. The identity <span className="text-indigo-400 font-mono">{email || "N/A"}</span> will receive activation credentials shortly.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <DialogFooter className="mt-8 gap-2 sm:gap-0">
                {step !== "IDENTITY" && (
                    <Button 
                        variant="ghost" 
                        onClick={prevStep}
                        className="text-slate-500 hover:text-slate-100 uppercase text-[10px] font-black h-10 px-6"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                )}
                
                {step !== "GENESIS" ? (
                    <Button 
                        onClick={nextStep}
                        disabled={step === "IDENTITY" && !email}
                        className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white uppercase text-[10px] font-black tracking-widest h-10 px-6 rounded-lg transition-all"
                    >
                        Establish Next Phase <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button 
                        onClick={onClose}
                        className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white uppercase text-[10px] font-black tracking-[.2em] h-10 px-8 rounded-lg shadow-lg shadow-emerald-500/20 transition-all animate-pulse"
                    >
                        Commit Genesis Hash
                    </Button>
                )}
            </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}