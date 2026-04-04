"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResponsiveDrawerProps {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
}

/**
 * 響應式抽屜元件
 * 在手機端顯示為 Bottom Drawer，在 PC 端顯示為 Dialog Modal
 * 符合 ui_design_spec.md 以人體工學為主的移動端操作規範
 */
export function ResponsiveDrawer({
  children,
  open,
  onOpenChange,
  title,
  description,
}: ResponsiveDrawerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DrawerPrimitive.Portal>
          <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <DrawerPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[95vh] flex-col rounded-t-[20px] bg-white border-t border-slate-200 focus-visible:outline-none">
            <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-slate-200" />
            <div className="flex flex-col gap-1 p-6 pb-0">
              <DrawerPrimitive.Title className="text-lg font-bold text-slate-900">
                {title}
              </DrawerPrimitive.Title>
              {description && (
                <DrawerPrimitive.Description className="text-sm text-slate-500">
                  {description}
                </DrawerPrimitive.Description>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-6 pt-2 pb-safe">
              {children}
            </div>
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Portal>
      </DrawerPrimitive.Root>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="pt-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}