import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings } from "lucide-react";
import { DocumentTitle } from "@/components/document-title";
import { PremiumFeatureDialog } from "@/components/premium-feature-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Theme } from "@shared/schema";

const chatbotSchema = z.object({
  enabled: z.boolean(),
  systemPrompt: z.string().min(1, "System prompt is required"),
  position: z.enum(["bottom-right", "bottom-left", "top-right", "top-left"]),
  name: z.string().min(1, "Bot name is required"),
  greeting: z.string().min(1, "Greeting message is required"),
  style: z.object({
    buttonColor: z.string(),
    themeColor: z.string(),
    avatarUrl: z.string().url("Please enter a valid URL").optional(),
  })
});

type ChatbotSettings = z.infer<typeof chatbotSchema>;

export default function ChatbotPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState("");
  const isPremium = user?.subscriptionStatus === "premium";

  const defaultValues: ChatbotSettings = {
    enabled: user?.theme?.chatbot?.enabled ?? false,
    systemPrompt: user?.theme?.chatbot?.systemPrompt ?? "You are a helpful assistant.",
    position: user?.theme?.chatbot?.position ?? "bottom-right",
    name: user?.theme?.chatbot?.name ?? "Assistant",
    greeting: user?.theme?.chatbot?.greeting ?? "Hello! How can I help you today?",
    style: {
      buttonColor: user?.theme?.chatbot?.style?.buttonColor ?? "#ffffff",
      themeColor: user?.theme?.chatbot?.style?.themeColor ?? "#1a1a1a",
      avatarUrl: user?.theme?.chatbot?.style?.avatarUrl,
    }
  };

  const form = useForm<ChatbotSettings>({
    resolver: zodResolver(chatbotSchema),
    defaultValues
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { theme: Partial<Theme> }) => {
      if (!isPremium) {
        setPremiumFeatureName("AI Chatbot");
        setShowPremiumDialog(true);
        return;
      }

      const response = await apiRequest("PATCH", "/api/profile", updates);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Chatbot settings saved",
        description: "Your changes have been applied successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save settings",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
  });

  const onSubmit = async (values: ChatbotSettings) => {
    if (!isPremium) {
      setPremiumFeatureName("AI Chatbot");
      setShowPremiumDialog(true);
      return;
    }

    try {
      await updateProfileMutation.mutate({
        theme: {
          ...user?.theme,
          chatbot: values
        }
      });
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container p-6 mx-auto">
      <DocumentTitle title="Chatbot Settings" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Chatbot Settings</h1>
          <p className="text-white/70">Customize your profile's chat assistant</p>
        </div>
      </div>

      <Card className="p-6 border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Configuration</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="enabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-white/10 p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Chatbot</FormLabel>
                    <FormDescription className="text-white/70">
                      Show the chat assistant on your profile
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={!isPremium}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {!isPremium && (
              <div className="mt-2 p-3 bg-black/20 border border-white/5 rounded text-sm text-white/70">
                The AI chatbot feature is only available with a premium subscription
              </div>
            )}

            {isPremium && form.watch("enabled") && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bot Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter bot name..."
                          className="bg-white/5 border-white/10"
                          disabled={!isPremium}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="greeting"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Greeting Message</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter greeting message..."
                          className="bg-white/5 border-white/10"
                          disabled={!isPremium}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="systemPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter instructions for your chatbot..."
                          className="bg-white/5 border-white/10 min-h-[100px]"
                          disabled={!isPremium}
                        />
                      </FormControl>
                      <FormDescription className="text-white/70">
                        This defines how your chatbot should behave
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!isPremium}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Select position" />
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

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Appearance</h3>

                  <FormField
                    control={form.control}
                    name="style.buttonColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              {...field}
                              type="text"
                              className="bg-white/5 border-white/10 flex-1"
                              disabled={!isPremium}
                            />
                            <Input
                              type="color"
                              value={field.value}
                              onChange={field.onChange}
                              className="w-12 p-1 h-10"
                              disabled={!isPremium}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="style.themeColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme Color</FormLabel>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              {...field}
                              type="text"
                              className="bg-white/5 border-white/10 flex-1"
                              disabled={!isPremium}
                            />
                            <Input
                              type="color"
                              value={field.value}
                              onChange={field.onChange}
                              className="w-12 p-1 h-10"
                              disabled={!isPremium}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-white/70">
                          This color will be used for the chat window theme
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="style.avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avatar URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="url"
                            placeholder="https://example.com/avatar.png"
                            className="bg-white/5 border-white/10"
                            value={field.value || ""}
                            disabled={!isPremium}
                          />
                        </FormControl>
                        <FormDescription className="text-white/70">
                          Enter a direct URL to an image (PNG, JPG, WebP)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateProfileMutation.isPending || !isPremium}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </form>
        </Form>
      </Card>

      <PremiumFeatureDialog
        open={showPremiumDialog}
        onOpenChange={setShowPremiumDialog}
        featureName={premiumFeatureName}
      />
    </div>
  );
}