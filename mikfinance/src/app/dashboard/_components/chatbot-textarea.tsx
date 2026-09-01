import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { BrainIcon, SendIcon } from "lucide-react";
import { Dispatch, KeyboardEvent, SetStateAction } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formScema = z.object({
  message: z.string().min(1, "Message is required"),
});

export default function ChatbotTextarea({
  sendMessage,
  isThinking,
  setIsThinking,
  mode,
  setMode,
}: {
  sendMessage: (message: string) => void;
  isThinking: boolean;
  setIsThinking: Dispatch<SetStateAction<boolean>>;
  mode: "general" | "personal";
  setMode: Dispatch<SetStateAction<"general" | "personal">>;
}) {
  const form = useForm<z.infer<typeof formScema>>({
    resolver: zodResolver(formScema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formScema>) {
    sendMessage(data.message);
    form.reset();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(form.getValues());
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col p-2 bg-secondary rounded-2xl"
    >
      <Controller
        control={form.control}
        name="message"
        render={({ field, fieldState }) => (
          <Field>
            <textarea
              {...field}
              id="form-message"
              placeholder="Ask Mik AI here"
              autoComplete="off"
              className="h-16 px-3 py-2 rounded-md resize-none focus:outline-none"
              onKeyDown={handleKeyDown}
            />
          </Field>
        )}
      />
      <div className="flex items-center justify-between">
        <div className="flex item-center gap-2">
          <Toggle
            variant="outline"
            size="sm"
            pressed={isThinking}
            onPressedChange={setIsThinking}
            className={cn("text-xs px-0 py-0 h-8 w-8", {
              "bg-primary/10! ": isThinking,
            })}
          >
            <BrainIcon />
          </Toggle>
          <Select
            value={mode}
            onValueChange={(value: "general" | "personal") => setMode(value)}
          >
            <SelectTrigger size="sm" className="capitalize">
              <SelectValue>{mode}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="personal">personal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="text-primary hover:bg-primary/10 hover:text-primary cursor-pointer disabled:bg-transparent"
          >
            <SendIcon className="size-5" />
          </Button>
        </div>
      </div>
    </form>
  );
}
