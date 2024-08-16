'use client';

import * as z from 'zod';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

const FormSchema = z.object({
  email: z.string().email({
    message: 'Invalid email address.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

type FormData = z.infer<typeof FormSchema>;

export default function RegisterForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('Submitting form', data);

    const { email, password } = data;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      router.push('/auth/login');

      // Process response here
      toast('Registration Successful', { description: 'You can now login.' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast('Registration Failed', { description: error.message });
      } else {
        toast('Registration Failed', {
          description: 'An unknown error occurred.',
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Email" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Password" {...field} type="password" />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
