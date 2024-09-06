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
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';

const FormSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required.',
      invalid_type_error: 'Email must be a string.',
    })
    .email({
      message: 'Invalid email address.',
    }),
  password: z
    .string({
      required_error: 'Password is required.',
      invalid_type_error: 'Password must be a string.',
    })
    .min(6, {
      message: 'Password must be at least 6 characters.',
    }),
  passwordConfirm: z
    .string({
      required_error: 'Password Confirm is required.',
      invalid_type_error: 'Password Confirm must be a string.',
    })
    .min(6, {
      message: 'Password Confirm must be at least 6 characters.',
    }),
  name: z
    .string({
      required_error: 'Name is required.',
      invalid_type_error: 'Name must be a string.',
    })
    .min(3, {
      message: 'Name must be at least 3 characters.',
    }),
  phone: z
    .string({
      required_error: 'Phone number is required.',
      invalid_type_error: 'Phone number must be a string.',
    })
    .min(10, {
      message: 'Phone number must be at least 10 characters.',
    }),
  address: z
    .string({
      required_error: 'Address is required.',
      invalid_type_error: 'Address must be a string.',
    })
    .min(10, {
      message: 'Address must be at least 10 characters.',
    }),
  website: z
    .string({
      required_error: 'Website URL is required.',
      invalid_type_error: 'Website URL must be a string.',
    })
    .url({
      message: 'Invalid website URL.',
    }),
  image: z
    .string({
      required_error: 'Image URL is required.',
      invalid_type_error: 'Image URL must be a string.',
    })
    .url({
      message: 'Invalid image URL.',
    }),
  bio: z
    .string({
      required_error: 'Bio is required.',
      invalid_type_error: 'Bio must be a string.',
    })
    .min(10, {
      message: 'Bio must be at least 10 characters.',
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
      passwordConfirm: '',
      name: '',
      phone: '',
      address: '',
      website: '',
      image: '',
      bio: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('Submitting form', data);

    const {
      email,
      password,
      passwordConfirm,
      name,
      phone,
      address,
      website,
      image,
      bio,
    } = data;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          passwordConfirm,
          name,
          phone,
          address,
          website,
          image,
          bio,
        }),
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
      <motion.form
        animate={{
          scale: [0.5, 1],
          opacity: [0, 1],
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-10"
      >
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-5 text-white rounded-lg gap-y-6 mt-5 w-full overflow-y-scroll">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-black dark:text-white">
                  Enter Email
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder="Email"
                    {...field}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-black dark:text-white">
                  Enter Password
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder="Password"
                    {...field}
                    type="password"
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-black dark:text-white">
                  Enter Password Confirm
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder="Password Confirm"
                    {...field}
                    type="password"
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-black dark:text-white">
                  Enter Name
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder="Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-black dark:text-white">
                  Enter Phone
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder="Phone"
                    {...field}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-black dark:text-white">
                  Enter Image URL
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder="Image URL"
                    {...field}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-black dark:text-white">
                  Enter Website
                </FormLabel>
                <FormControl className="w-full">
                  <Input
                    className="text-black dark:text-white w-full"
                    placeholder="Website"
                    {...field}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-black dark:text-white">
                  Enter Address
                </FormLabel>
                <FormControl className="w-full">
                  <Textarea
                    className="text-black dark:text-white w-full"
                    placeholder="Address"
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs text-black dark:text-white">
                  Enter Bio
                </FormLabel>
                <FormControl className="w-full">
                  <Textarea
                    className="text-black dark:text-white w-full"
                    placeholder="Bio"
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage {...field} className="text-xs text-rose-300" />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="hover:scale-105 w-full">
          Submit
        </Button>
      </motion.form>
    </Form>
  );
}
