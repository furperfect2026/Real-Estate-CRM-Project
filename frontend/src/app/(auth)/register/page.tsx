"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Building2, Loader2, ArrowRight } from 'lucide-react';

const registerSchema = z.object({
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { registerMutation } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        router.push('/dashboard');
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="glass shadow-xl border-slate-200/80 bg-white max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex justify-center mb-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-xs">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center font-bold tracking-tight text-slate-900">
            Create an account
          </CardTitle>
          <CardDescription className="text-center text-slate-500 text-xs">
            Start managing your properties, leads, and sales pipeline
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="organizationName" className="text-xs font-semibold text-slate-700">
                Organization Name
              </Label>
              <Input
                id="organizationName"
                {...form.register('organizationName')}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white focus-visible:ring-primary"
                placeholder="Acme Realty"
              />
              {form.formState.errors.organizationName && (
                <p className="text-xs text-destructive">{form.formState.errors.organizationName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs font-semibold text-slate-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  {...form.register('firstName')}
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white focus-visible:ring-primary"
                  placeholder="John"
                />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs font-semibold text-slate-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  {...form.register('lastName')}
                  className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white focus-visible:ring-primary"
                  placeholder="Doe"
                />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-destructive">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white focus-visible:ring-primary"
                placeholder="john@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                {...form.register('phone')}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white focus-visible:ring-primary"
                placeholder="+91 98765 43210"
              />
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
                className="bg-slate-50 border-slate-300 text-slate-900 text-sm focus-visible:bg-white focus-visible:ring-primary"
                placeholder="••••••••"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs text-xs font-medium h-9"
            >
              {registerMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign up <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
            <div className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
