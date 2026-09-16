import { generateChart } from "@/features/ai/generative-content";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
}
