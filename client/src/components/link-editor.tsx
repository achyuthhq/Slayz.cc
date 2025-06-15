import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  Droppable,
  DroppableProvided,
  DropResult
} from "react-beautiful-dnd";
import { Grip, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SOCIAL_PLATFORMS } from "@/lib/social-platforms";
import { SocialLink } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { SiGithub, SiGitlab, SiLinkedin, SiInstagram, SiYoutube, SiTiktok, SiBitcoin, SiLitecoin, SiTether } from "react-icons/si";
import { useSubscriptionCheck } from "@/lib/subscription";
import { useToast as useToastUI } from "@/components/ui/use-toast";

const SOCIAL_PLATFORMS = [
  { id: "github", name: "GitHub", icon: SiGithub, color: "#333" },
  { id: "gitlab", name: "GitLab", icon: SiGitlab, color: "#FC6D26" },
  { id: "linkedin", name: "LinkedIn", icon: SiLinkedin, color: "#0077B5" },
  { id: "instagram", name: "Instagram", icon: SiInstagram, color: "#E4405F" },
  { id: "youtube", name: "YouTube", icon: SiYoutube, color: "#FF0000" },
  { id: "tiktok", name: "TikTok", icon: SiTiktok, color: "#000000" },
  { id: "bitcoin", name: "Bitcoin", icon: SiBitcoin, color: "#F7931A", isCrypto: true },
  { id: "litecoin", name: "Litecoin", icon: SiLitecoin, color: "#345D9D", isCrypto: true },
  { id: "usdt", name: "USDT", icon: SiTether, color: "#26A17B", isCrypto: true },
  { id: "website", name: "Website", icon: null, color: "#FFFFFF" },
];

interface LinkEditorProps {
  links?: SocialLink[];
}

export function LinkEditor({ links = [] }: LinkEditorProps) {
  const { toast } = useToast();
  const { canAddMoreSocialLinks, maxSocialLinks } = useSubscriptionCheck();
  const [newLink, setNewLink] = useState({ url: "", icon: "", title: "" });
  const [editingUrl, setEditingUrl] = useState<string | null>(null);
  const [tempUrl, setTempUrl] = useState("");
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (link: Omit<SocialLink, "id" | "userId" | "clickCount">) => {
      if (!canAddMoreSocialLinks(links.length)) {
        setShowPremiumDialog(true);
        throw new Error("Premium required for more social links");
      }

      const res = await apiRequest("POST", "/api/links", link);
      if (!res.ok) throw new Error("Failed to create link");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      setNewLink({ url: "", icon: "", title: "" });
      toast({ title: "Link added successfully" });
    },
    onError: (error: Error) => {
      if (!error.message.includes("Premium required")) {
        toast({
          title: "Failed to add link",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<SocialLink> & { id: string }) => {
      const res = await apiRequest("PATCH", `/api/links/${id}`, data);
      if (!res.ok) {
        throw new Error("Failed to update link");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      setEditingUrl(null);
      toast({
        title: "Link updated successfully",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/links/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete link");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      toast({
        title: "Link deleted successfully",
      });
    },
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    items.forEach((item, index) => {
      if (item.order !== index) {
        updateMutation.mutate({
          id: item.id,
          order: index
        });
      }
    });
  };

  const handleUrlEditStart = (link: SocialLink) => {
    setEditingUrl(link.id);
    setTempUrl(link.url);
  };

  const handleUrlEditSave = (link: SocialLink) => {
    if (tempUrl !== link.url) {
      updateMutation.mutate({
        id: link.id,
        url: tempUrl,
      });
    } else {
      setEditingUrl(null);
    }
  };

  const selectedPlatform = SOCIAL_PLATFORMS.find(p => p.id === newLink.icon);
  const isCrypto = selectedPlatform?.isCrypto;

  return (
    <div className="space-y-4">
      <PremiumFeatureDialog
        open={showPremiumDialog}
        onOpenChange={setShowPremiumDialog}
        featureName="Unlimited Social Links"
      />

      {links.length >= (maxSocialLinks -1) && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm text-yellow-500">
            Free users can add up to {maxSocialLinks} social links. Upgrade to Premium for unlimited links!
          </p>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newLink.icon && newLink.url) {
            createMutation.mutate({
              icon: newLink.icon,
              url: newLink.url,
              title: newLink.title,
              order: links.length,
            });
          }
        }}
        className="flex gap-2"
      >
        <Select
          value={newLink.icon}
          onValueChange={(value) => {
            setNewLink(prev => ({
              ...prev,
              icon: value,
            }));
          }}
        >
          <SelectTrigger className="w-[180px] rounded-lg">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            {SOCIAL_PLATFORMS.map((platform) => (
              <SelectItem key={platform.id} value={platform.id}>
                <div className="flex items-center gap-2">
                  {platform.icon && (
                    <platform.icon className="h-4 w-4" style={{ color: platform.color }} />
                  )}
                  {platform.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Title"
          type="text"
          value={newLink.title}
          onChange={(e) =>
            setNewLink(prev => ({ ...prev, title: e.target.value }))
          }
          className="rounded-lg flex-1"
        />

        <Input
          placeholder={isCrypto ? "Wallet Address" : "URL"}
          type={isCrypto ? "text" : "url"}
          value={newLink.url}
          onChange={(e) =>
            setNewLink(prev => ({ ...prev, url: e.target.value }))
          }
          className="rounded-lg flex-1"
        />

        <Button
          type="submit"
          size="icon"
          className="rounded-lg"
          disabled={createMutation.isPending || !newLink.icon || !newLink.url}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="links">
          {(provided: DroppableProvided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {links.map((link, index) => {
                const platform = SOCIAL_PLATFORMS.find(p => p.id === link.icon);

                return (
                  <Draggable
                    key={link.id}
                    draggableId={link.id}
                    index={index}
                  >
                    {(provided: DraggableProvided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center gap-2 p-2 rounded-lg border bg-background"
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-grab"
                        >
                          <Grip className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {link.icon && (
                          <div className="w-[180px] flex items-center gap-2">
                            {platform?.icon && (
                              <platform.icon
                                className="h-4 w-4"
                                style={{ color: platform.color }}
                              />
                            )}
                            <span className="text-sm">
                              {platform?.name}
                            </span>
                          </div>
                        )}

                        {editingUrl === link.id ? (
                          <form
                            className="flex-1 flex gap-2"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleUrlEditSave(link);
                            }}
                          >
                            <Input
                              type={platform?.isCrypto ? "text" : "url"}
                              value={tempUrl}
                              onChange={(e) => setTempUrl(e.target.value)}
                              className="rounded-lg flex-1"
                              autoFocus
                            />
                            <Button
                              type="submit"
                              size="sm"
                              className="rounded-lg"
                            >
                              Save
                            </Button>
                          </form>
                        ) : (
                          <button
                            onClick={() => handleUrlEditStart(link)}
                            className="flex-1 text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors"
                          >
                            {link.url}
                          </button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg"
                          onClick={() => deleteMutation.mutate(link.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}