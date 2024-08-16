'use client';

import * as z from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SignInResponse } from 'next-auth/react';

const FormSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

type FormData = z.infer<typeof FormSchema>;

type LoginFormProps = {
  setOpenModal?: (value: boolean) => void;
};

export default function LoginForm({ setOpenModal }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    const { email, password } = data;

    try {
      const response: SignInResponse | undefined = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (!response?.error) {
        if (setOpenModal) {
          setOpenModal(false);
        }
        router.push(searchParams.get('callback') || '/');
        router.refresh();
        toast('Login successful', { description: 'You have been logged in.' });
      }

      if (!response?.ok) {
        throw new Error('Network response was not ok');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast('Login failed', { description: error.message });
      } else {
        toast('Login failed', { description: 'An unknown error occurred.' });
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="text-white p-4 md:p-16 border-[1.5px] rounded-lg border-gray-300 bg-slate-500 dark:bg-red-950 flex flex-col items-center justify-center gap-y-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provide Email</FormLabel>
              <FormControl>
                <Input
                  className="text-black dark:text-white"
                  placeholder="Email"
                  {...field}
                  type="text"
                />
              </FormControl>
              <FormMessage {...field} className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provide Password</FormLabel>
              <FormControl>
                <Input
                  className="text-black dark:text-white"
                  placeholder="Password"
                  {...field}
                  type="password"
                />
              </FormControl>
              <FormMessage {...field} className="text-xs" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="hover:scale-110 hover:bg-cyan-700"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </Form>
  );
}
