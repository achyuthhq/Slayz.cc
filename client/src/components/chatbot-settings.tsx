import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { themeSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const chatbotSchema = themeSchema.pick({
  chatbot: true,
}).extend({
  chatbot: z.object({
    enabled: z.boolean(),
    systemPrompt: z.string().optional(),
    position: z.enum(["bottom-right", "bottom-left", "top-right", "top-left"]),
    style: z.object({
      buttonColor: z.string(),
      buttonGradient: z.object({
        startColor: z.string(),
        endColor: z.string(),
      }).optional(),
      bubbleColor: z.string().optional(),
      bubbleGradient: z.object({
        startColor: z.string(),
        endColor: z.string(),
      }).optional(),
      textColor: z.string().optional(),
      font: z.string().optional(),
    }),
    welcomeMessage: z.string(),
    placeholderText: z.string(),
  }),
});

type ChatbotSettings = z.infer<typeof chatbotSchema>;

interface ChatbotSettingsFormProps {
  defaultValues: ChatbotSettings;
  onSubmit: (values: ChatbotSettings) => void | Promise<void>;
}

export function ChatbotSettingsForm({
  defaultValues,
  onSubmit,
}: ChatbotSettingsFormProps) {
  const { toast } = useToast();
  const form = useForm<ChatbotSettings>({
    resolver: zodResolver(chatbotSchema),
    defaultValues,
    mode: "onChange",
  });

  const handleSubmit = async (values: ChatbotSettings) => {
    try {
      await onSubmit(values);
      toast({
        title: "Chatbot settings saved",
        description: "Your changes have been applied successfully",
      });
    } catch (error) {
      console.error("Failed to save chatbot settings:", error);
      toast({
        title: "Failed to save settings",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="chatbot.enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Enable Chatbot</FormLabel>
                <FormDescription>
                  Display an AI chatbot on your profile page
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="chatbot.systemPrompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Enter the system prompt for your chatbot..."
                    className="resize-none"
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  This is the initial prompt that defines your chatbot's personality and behavior
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chatbot.position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chatbot position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chatbot.style.buttonColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button Color</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      type="text"
                      placeholder="#000000"
                      value={field.value || "#0070f3"}
                    />
                    <Input
                      type="color"
                      value={field.value || "#0070f3"}
                      onChange={field.onChange}
                      className="w-12 p-1 h-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chatbot.style.buttonGradient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button Gradient</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="#000000"
                          value={field.value?.startColor || "#0070f3"}
                          onChange={(e) => {
                            field.onChange({
                              ...field.value,
                              startColor: e.target.value,
                            });
                          }}
                          className="flex-1"
                        />
                        <Input
                          type="color"
                          value={field.value?.startColor || "#0070f3"}
                          onChange={(e) => {
                            field.onChange({
                              ...field.value,
                              startColor: e.target.value,
                            });
                          }}
                          className="w-12 p-1 h-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>End Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="#000000"
                          value={field.value?.endColor || "#0070f3"}
                          onChange={(e) => {
                            field.onChange({
                              ...field.value,
                              endColor: e.target.value,
                            });
                          }}
                          className="flex-1"
                        />
                        <Input
                          type="color"
                          value={field.value?.endColor || "#0070f3"}
                          onChange={(e) => {
                            field.onChange({
                              ...field.value,
                              endColor: e.target.value,
                            });
                          }}
                          className="w-12 p-1 h-10"
                        />
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chatbot.style.bubbleColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bubble Color</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      type="text"
                      placeholder="#000000"
                      value={field.value || "#f5f5f5"}
                    />
                    <Input
                      type="color"
                      value={field.value || "#f5f5f5"}
                      onChange={field.onChange}
                      className="w-12 p-1 h-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chatbot.style.bubbleGradient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bubble Gradient</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="#000000"
                          value={field.value?.startColor || "#f5f5f5"}
                          onChange={(e) => {
                            field.onChange({
                              ...field.value,
                              startColor: e.target.value,
                            });
                          }}
                          className="flex-1"
                        />
                        <Input
                          type="color"
                          value={field.value?.startColor || "#f5f5f5"}
                          onChange={(e) => {
                            field.onChange({
                              ...field.value,
                              startColor: e.target.value,
                            });
                          }}
                          className="w-12 p-1 h-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>End Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="#000000"
                          value={field.value?.endColor || "#f5f5f5"}
                          onChange={(e) => {
                            field.onChange({
                              ...field.value,
                              endColor: e.target.value,
                            });
                          }}
                          className="flex-1"
                        />
                        <Input
                          type="color"
                          value={field.value?.endColor || "#f5f5f5"}
                          onChange={(e) => {
                            field.onChange({
                              ...field.value,
                              endColor: e.target.value,
                            });
                          }}
                          className="w-12 p-1 h-10"
                        />
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chatbot.welcomeMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Welcome Message</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter a welcome message..."
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chatbot.placeholderText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Placeholder</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter placeholder text..."
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={!form.formState.isDirty}>
          {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}