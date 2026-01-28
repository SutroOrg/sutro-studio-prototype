import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { ROLE_OPTIONS } from "~/lib/mock-data";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Please select a role"),
  company: z.string().min(1, "Company is required"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSubmit: (data: SignupFormValues) => void;
}

export function SignupForm({ onSubmit }: SignupFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const role = watch("role");

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: "#030712" }}>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-heading)" }}>
            About you
          </h2>
          <p className="mt-2 text-zinc-400">
            Tell us a bit about yourself.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-zinc-300">Name</Label>
            <Input
              id="name"
              placeholder="Your name"
              className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Role</Label>
            <Select value={role} onValueChange={(val) => setValue("role", val, { shouldValidate: true })}>
              <SelectTrigger className="w-full border-zinc-700 bg-zinc-900 text-white">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company" className="text-zinc-300">Company</Label>
            <Input
              id="company"
              placeholder="Your company"
              className="border-zinc-700 bg-zinc-900 text-white placeholder:text-zinc-500"
              {...register("company")}
            />
            {errors.company && (
              <p className="text-xs text-destructive">{errors.company.message}</p>
            )}
          </div>
          <div className="pt-4">
            <Button type="submit">
              Get started
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
