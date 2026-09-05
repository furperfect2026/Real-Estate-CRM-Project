"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Loader2, ArrowRight, ShieldCheck, Users, PhoneCall, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PRESET_ROLES } from "@/hooks/use-active-role";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "rohit.nalpe@tathastuinfra.com",
      password: "password123",
    }
  });

  const handleQuickRoleLogin = (roleId: string, email: string, portalTitle: string, name: string) => {
    setIsLoading(true);
    setValue("email", email);
    setValue("password", "password123");
    
    // Set localStorage active role
    if (typeof window !== "undefined") {
      localStorage.setItem("tathastu_active_role", roleId);
    }
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Logged in as ${name} (${portalTitle})`);
      router.push("/dashboard");
    }, 600);
  };

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    
    // Auto-detect role from email
    if (typeof window !== "undefined") {
      const matched = PRESET_ROLES.find(r => r.email.toLowerCase() === data.email.toLowerCase());
      if (matched) {
        localStorage.setItem("tathastu_active_role", matched.id);
      }
    }

    setTimeout(() => {
      setIsLoading(false);
      toast.success("Welcome back to Tathastu Infra!");
      router.push("/dashboard");
    }, 800);
  }

  return (
    <Card className="glass shadow-xl border-slate-200/80 bg-white animate-in fade-in zoom-in-95 duration-500 max-w-md w-full">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex justify-center mb-1">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xs">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-xl text-center font-bold tracking-tight text-slate-900">
          Tathastu Infra CRM Sign In
        </CardTitle>
        <CardDescription className="text-center text-slate-500 text-xs">
          Select a role perspective or enter your assigned credentials
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 1-Click Role Perspective Selector */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            ⚡ Quick Demo Access by Role & ID
          </label>
          <div className="grid grid-cols-1 gap-2">
            {/* Super Admin - Rohit Nalpe */}
            <div
              onClick={() => handleQuickRoleLogin("admin_1", "rohit.nalpe@tathastuinfra.com", "Super Admin Portal", "Rohit Nalpe")}
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Rohit Nalpe</span>
                    <span className="text-[9px] font-extrabold bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded">
                      ADM-001
                    </span>
                  </div>
                  <div className="text-[11px] text-blue-700 font-medium">Super Admin Portal (Full Org Access)</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Manager - Anmol */}
            <div
              onClick={() => handleQuickRoleLogin("mgr_1", "anmol@tathastuinfra.com", "Manager Portal", "Anmol")}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Anmol</span>
                    <span className="text-[9px] font-extrabold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">
                      MGR-001
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-medium">Manager Portal (Team Deals & Pipeline)</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Executive & Caller - Gayatri */}
            <div
              onClick={() => handleQuickRoleLogin("emp_1", "gayatri@tathastuinfra.com", "Caller Workbench", "Gayatri")}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span>Gayatri</span>
                    <span className="text-[9px] font-extrabold bg-purple-200 text-purple-900 px-1.5 py-0.2 rounded">
                      CLR-001
                    </span>
                  </div>
                  <div className="text-[11px] text-purple-700 font-medium">Caller Desk (My Calling Queue & AI)</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200" />
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">or sign in manually</span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address</Label>
            <Input
              id="email"
              placeholder="name@tathastuinfra.com"
              type="email"
              disabled={isLoading}
              className="bg-slate-50 border-slate-300 text-slate-900 text-xs h-9 focus-visible:bg-white focus-visible:ring-primary"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-[11px] text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-medium text-slate-500 hover:text-primary transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              className="bg-slate-50 border-slate-300 text-slate-900 text-xs h-9 focus-visible:bg-white focus-visible:ring-primary"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-[11px] text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-semibold h-9 mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In to Workspace <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="pt-0 pb-4">
        <div className="text-center w-full text-[11px] text-slate-500">
          Tathastu Infra Real Estate Operating System • v2.4
        </div>
      </CardFooter>
    </Card>
  );
}
