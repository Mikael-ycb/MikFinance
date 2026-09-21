import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { generateChart } from "@/features/ai/generative-content";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ChartPieIcon,
  Files,
  Loader2Icon,
  Sparkles,
  SparklesIcon,
} from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  request: z.string().min(1, "Request is required"),
});

const COLORS = [
  "#10b981",
  "#f43f5e",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "64748b",
];

export default function GenerativeContent() {
  const [insightType, setInsightType] = useState<"chart" | "image" | "video">(
    "chart",
  );

  const [result, setResult] = useState<{
    type: "chart";
    chartType: "bar" | "pie";
    data: { name: string; value: number }[];
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      request: "",
    },
  });

  const { mutate, isPending, error } = useMutation({
    mutationFn: async (request: string) => {
      switch (insightType) {
        case "chart":
          const result = await generateChart(request);
          return { ...result, type: "chart" };
        default:
          return null;
      }
    },
    onSuccess: (response) => {
      setResult(response);
      toast.success(`Success generate ${insightType}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to process your request.",
      );
    },
  });

  function onSummit(data: z.infer<typeof formSchema>) {
    mutate(data.request);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSummit(form.getValues());
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <SparklesIcon className="size-5 text-primary" />
            Generative AI Insight
          </CardTitle>
          <form
            className="flex flex-col lg:flex-row lg:items-center gap-2"
            onSubmit={form.handleSubmit(onSummit)}
          >
            <ButtonGroup>
              <Button
                variant={insightType === "chart" ? "default" : "secondary"}
                type="button"
                size="icon"
                onClick={() => setInsightType("chart")}
              >
                <ChartPieIcon />
              </Button>
            </ButtonGroup>
            <div className="flex flex-row gap-2">
              <Controller
                control={form.control}
                name="request"
                render={({ field }) => (
                  <Field>
                    <Input
                      {...field}
                      id="form-request"
                      placeholder="Insert your request..."
                      className="w-50 lg:w-70"
                      onKeyDown={handleKeyDown}
                      disabled={isPending}
                    />
                  </Field>
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                <span className="hidden lg:inline">
                  {result ? "Update" : "Generate"}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-destructive p-4 border-destructive/50 bg-destructive/10 rounded-lg">
            {error.message}
          </div>
        )}
        {!result && (
          <div className="h-70 flex items-center justify-center border-2 border-dashed rounded-lg">
            {isPending ? (
              <div>
                <Loader2Icon className="size-8 animate-spin" />
                <span>AI is Generating insight</span>
              </div>
            ) : (
              <span className="text-muted-foreground/50 text-lg">
                Generate insight content with AI
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
