"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

interface ManagerAssignmentProps {
  propertyId: string;
  currentManagerId: string | null;
  onAssigned: () => void;
}

export function ManagerAssignment({ 
  propertyId, 
  currentManagerId, 
  onAssigned 
}: ManagerAssignmentProps) {
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await fetch("/api/landlord/members");
      const data = await response.json();
      setManagers(data.managers || []);
    } catch (error) {
      console.error("載入代管人員失敗");
    }
  };

  const handleAssign = async (managerId: string | null) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/landlord/properties/${propertyId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ managerId }),
      });
      if (!response.ok) throw new Error("分派失敗");
      toast.success(managerId ? "已分派管理員" : "管理員已移除，由房東親自管理");
      onAssigned();
    } catch (error) {
      toast.error("操作失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const currentManager = managers.find(m => m.id === currentManagerId);

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs">
        <Shield className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-slate-500 font-medium">代管人員:</span>
        {currentManager ? (
          <span className="text-slate-900 font-semibold">{currentManager.name}</span>
        ) : (
          <span className="text-amber-600 font-semibold italic">⚠️ 房東親自管理</span>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="xs" className="h-6 px-2 text-[10px]" disabled={isLoading}>
            <UserPlus className="w-3 h-3 mr-1" />
            {currentManagerId ? "更換" : "指派"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            className="text-xs text-amber-600 font-bold" 
            onClick={() => handleAssign(null)}
          >
            <X className="w-3 h-3 mr-2" />
            移除管理員 (由我管理)
          </DropdownMenuItem>
          {managers.map((m) => (
            <DropdownMenuItem 
              key={m.id} 
              className="text-xs" 
              onClick={() => handleAssign(m.id)}
            >
              <Shield className="w-3 h-3 mr-2 text-blue-500" />
              {m.name} ({m.email})
            </DropdownMenuItem>
          ))}
          {managers.length === 0 && (
            <DropdownMenuItem className="text-xs text-slate-400" disabled>
              無代管人員可選
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}