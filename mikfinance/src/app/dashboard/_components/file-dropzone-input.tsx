import { cn } from "@/lib/utils";
import { UploadCloudIcon } from "lucide-react";
import { useRef, useState } from "react";
import { UseFormSetValues } from "react-hook-form";

export default function FileDropzoneInput({
  refetch,
  setValues,
}: {
  refetch: () => void;
  setValues: UseFormSetValues<{
    amount: string;
    type: "income" | "expense";
    category: string;
    date: string;
    description: string;
  }>;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input type="file" ref={fileInputRef} className="hidden" />
      <div className="flex flex-col items-center">
        <UploadCloudIcon
          className={cn(
            "size-8",
            isDragging ? "text-primary" : "text-muted-foreground",
          )}
        />
        <div className="space-y-1 text-center">
          <p className="text-sm font-medium"> Drag & Drop Receipt Here</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {" "}
            or click to browse
          </p>
        </div>
      </div>
    </div>
  );
}
