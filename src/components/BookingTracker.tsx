"use client";

import { Check, Scissors, Hourglass, ShoppingBag, MapPin } from "lucide-react";

export function BookingTracker({ status, deliveryType = "SHOP_VISIT" }: { status: string; deliveryType?: string }) {
  const steps = [
    { key: "PENDING", label: "Request Sent", desc: "Awaiting tailor review", icon: Hourglass },
    { key: "ACCEPTED", label: "Tailor Confirmed", desc: "Booking accepted", icon: Check },
    ...(deliveryType === "HOME_VISIT" ? [{ key: "HOME_VISIT", label: "Home Visit", desc: "Tailor visit in progress", icon: MapPin }] : []),
    { key: "IN_PROGRESS", label: "In Sewing", desc: "Crafting your fit", icon: Scissors },
    { key: "COMPLETED", label: "Completed", desc: "Ready for pickup", icon: ShoppingBag }
  ];

  if (status === "REJECTED") {
    return (
      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs text-center font-medium mt-3">
        Booking request declined. Please contact tailor or request another service.
      </div>
    );
  }

  // Find index of current status
  const currentStepIndex = steps.findIndex((step) => step.key === status);
  // Default to 0 if not found
  const activeIndex = currentStepIndex !== -1 ? currentStepIndex : 0;

  return (
    <div className="py-4 mt-3 bg-background/20 rounded-2xl border border-border/40 p-4 space-y-4">
      <div className="relative flex justify-between items-center w-full">
        {/* Track Line */}
        <div className="absolute left-[8%] right-[8%] top-[14px] h-[3px] bg-border/40 -z-10 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-700 rounded-full"
            style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isPending = idx > activeIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1 text-center group">
              {/* Stepper Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100"
                    : isActive
                    ? "bg-background border-primary text-primary shadow-xl scale-110 animate-pulse"
                    : "bg-background border-border text-muted-foreground/60 scale-95"
                }`}
              >
                <StepIcon className="w-3.5 h-3.5" />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold mt-2 transition-colors duration-300 ${
                  isActive ? "text-primary font-extrabold" : "text-muted-foreground/80"
                }`}
              >
                {step.label}
              </span>
              
              {/* Desc */}
              <span className="text-[8px] text-muted-foreground/50 hidden md:block">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
