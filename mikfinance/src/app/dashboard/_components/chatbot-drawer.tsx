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

export default function ChatbotDrawer() {
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
      </DrawerContent>
    </Drawer>
  );
}
