"use client";

import { Button } from "@/components/ui/button";
import { handleChat } from "@/features/ai/chat";
import { BotIcon, XIcon } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ChatbotDrawer() {
  const [conversation, setConversation] = useState<
    {
      role: string;
      parts: {
        text: string;
      }[];
    }[]
  >([
    {
      role: "user",
      parts: [
        {
          text: "Hello",
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "Hello, how can i help you?",
        },
      ],
    },
  ]);

  return (
    <Drawer direction="right" modal={false}>
      <DrawerTrigger className="fixed bottom-4 right-4" asChild>
        <Button
          className="size-14 rounded-full"
          size="icon-lg"
          // onClick={async () => {
          //   const result = await handleChat();
          //   console.log(result);
          // }}
        >
          <BotIcon className="size-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-screen! md:w-110!">
        <DrawerHeader>
          <div>
            <DrawerTitle className="font-bold text-primary">
              AI Financeial Advisor
            </DrawerTitle>
            <DrawerDescription>
              Get personalized financial advice.
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="outline" size="icon">
              <XIcon />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="no-scrollbar overflow-y-auto px-4 h-full">
          {conversation.length > 0 ? (
            <div className="flex-col h-full overflow-x-hidden no-scrollbar overflow-y-auto gap-8">
              {conversation.map((message, index) => (
                <div
                  key={`conversation-${index}`}
                  className={cn(
                    "flex flex-col gap-2",
                    message.role === "model" ? "items-start" : "items-end",
                  )}
                >
                  <div
                    className={cn("flex flex-col w-full", {
                      "bg-primary/20 text-primary px-5 py-2 rounded-3xl rounted-br-md w-fit max-w-3/4":
                        message.role === "user",
                    })}
                  >
                    {message.parts[0].text}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-3xl font-bold text-primary">Hello Fuck!!!</h2>
              <h4 className="text-xl">What can i help you Motherfucker?</h4>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
