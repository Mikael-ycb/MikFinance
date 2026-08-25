"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { BrainIcon, SendIcon, SparklesIcon } from "lucide-react";
import { Dispatch, KeyboardEvent, SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formScema = z.object({
  message: z.string().min(1, "Message is required"),
});

export default function WizardInput() {
  const form = useForm<z.infer<typeof formScema>>({
    resolver: zodResolver(formScema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formScema>) {
    form.reset();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(form.getValues());
    }
  }

  return (
    <Card className="w-full border-primary/20 p-0">
      <CardContent className="">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col p-2 bg-secondary rounded-2xl"
        >
          <div className="text-primary">
            <SparklesIcon className="size-5" />
          </div>
          <Controller
            control={form.control}
            name="message"
            render={({ field, fieldState }) => (
              <Field>
                <input
                  {...field}
                  id="form-message"
                  placeholder="Ask Mik AI here"
                  autoComplete="off"
                  className="h-14 focus:outline-none"
                  onKeyDown={handleKeyDown}
                />
              </Field>
            )}
          />
          <Button type="submit" size="icon" variant="ghost">
            <SendIcon className="size-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
