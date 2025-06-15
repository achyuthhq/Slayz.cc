import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Crown } from "lucide-react";

// Updated to use local files instead of GitHub repository
const DECORATION_BASE_URL = "/decorations";

const DECORATION_LIST = [
  "a_hint_of_clove.png",
  "afternoon_breeze.png",
  "aim_for_love.png",
  "air.png",
  "akuma.png",
  "angel.png",
  "angry.png",
  "angry_pink.png",
  "angry_yellow.png",
  "arcane_sigil.png",
  "astronaut_helmet.png",
  "aurora.png",
  "autumn_crown.png",
  "autumns_arbor.png",
  "autumns_arbor_aurora.png",
  "baby_displacer_beast.png",
  "balance.png",
  "batarang.png",
  "beamchop.png",
  "big_dill_chain.png",
  "black_hole.png",
  "blade_storm.png",
  "blanket_green.png",
  "blanket_orange.png",
  "blanket_pink.png",
  "blanket_purple.png",
  "bloodthirsty.png",
  "bloodthirsty_gold.png",
  "bloodthirsty_green.png",
  "bloomling.png",
  "blue_futuristic_ui.png",
  "blue_gyroscope.png",
  "blue_hyper_helmet.png",
  "blue_shine_helmet.png",
  "blue_smoke.png",
  "blueberry_jam.png",
  "bowler_hat.png",
  "box_blue_yellow.png",
  "box_green_red.png",
  "box_red_white.png",
  "box_red_white_blue.png",
  "box_white_blue.png",
  "brass_beats.png",
  "bubble_tea.png",
  "bunny.png",
  "bunny_zzzs.png",
  "burnt_toast.png",
  "bush_camper.png",
  "butterflies.png",
  "cammy.png",
  "candlelight.png",
  "candlelight_crimson.png",
  "candlelight_dark.png",
  "cannon_fire.png",
  "cat_1.png",
  "cat_2.png",
  "cat_3.png",
  "cat_4.png",
  "cat_ear_headset.png",
  "cat_ears.png",
  "cat_ears_blue.png",
  "cat_ears_green.png",
  "cat_ears_purple.png",
  "cat_ears_yellow.png",
  "cat_onesie.png",
  "cat_onesie_black.png",
  "cat_onesie_pink.png",
  "cattiva.png",
  "chewbert.png",
  "chillet.png",
  "chromawave.png",
  "chrysanthemums_morning.png",
  "chrysanthemums_twilight.png",
  "chuck.png",
  "chun_li.png",
  "city_walls.png",
  "clyde_invaders.png",
  "confetti_festive.png",
  "confetti_fire.png",
  "confetti_ice.png",
  "confetti_mint.png",
  "confetti_star.png",
  "confetti_vaporwave.png",
  "constellations.png",
  "cottage_home.png",
  "cozy_cat.png",
  "cozy_headphones.png",
  "cozy_post_it.png",
  "cozy_post_it_festive.png",
  "crossbones.png",
  "crystal_ball_blue.png",
  "crystal_ball_purple.png",
  "crystal_elk.png",
  "cybernetic.png",
  "cypher_neural_theft.png",
  "dancing_fairies.png",
  "dandelion_duo.png",
  "deaths_edge.png",
  "defensive_shield.png",
  "depresso.png",
  "devil.png",
  "dice_azure.png",
  "dice_violet.png",
  "digital_sunrise.png",
  "dismay.png",
  "dismay_green.png",
  "dismay_pink.png",
  "dismay_purple.png",
  "dismay_yellow.png",
  "disxcore_headset.png",
  "dog_1.png",
  "dog_2.png",
  "dog_3.png",
  "donut.png",
  "doodlezard.png",
  "doodling.png",
  "dragons_smile.png",
  "dusk_and_dawn.png",
  "earth.png",
  "eldritch_ring.png",
  "exoborne.png",
  "faces_of_the_moon.png",
  "fairy_sprites.png",
  "fairy_sprites_blue.png",
  "fairy_sprites_pink.png",
  "fall_leaves.png",
  "fall_leaves_scarlet.png",
  "fall_leaves_woodland.png",
  "fan_flourish.png",
  "feelin_awe.png",
  "feelin_nervous.png",
  "feelin_panic.png",
  "feelin_scrumptious.png",
  "fire.png",
  "firecrackers.png",
  "fishbones.png",
  "flame_chompers.png",
  "flaming_sword.png",
  "floral_harmony.png",
  "floral_harmony_sunburst.png",
  "flower_clouds.png",
  "flux_alchemy.png",
  "forest.png",
  "fortnite_boogie_bomb.png",
  "fox_hat.png",
  "fox_hat_chestnut.png",
  "fox_hat_snow.png",
  "frag_out.png",
  "freezer_bunny_lovebug.png",
  "fresh_pine.png",
  "fresh_pine_cinnamon.png",
  "fresh_pine_ribbon.png",
  "fried_egg.png",
  "frog_1.png",
  "frog_3.png",
  "frog_angry.png",
  "frog_derpy.png",
  "frog_hat.png",
  "fuchsia_agent.png",
  "gary_the_snail.png",
  "gawblehop.png",
  "gelatinous_cube_blue.png",
  "gelatinous_cube_green.png",
  "ghosts.png",
  "glitch.png",
  "glop.png",
  "glowing_runes.png",
  "goblin_stinkums.png",
  "gold_laurel_wreath.png",
  "golden_hex.png",
  "good_ol_pepper.png",
  "graveyard_cat.png",
  "green_fried_egg.png",
  "green_futuristic_ui.png",
  "green_gyroscope.png",
  "green_headset.png",
  "green_hyper_helmet.png",
  "green_shine_helmet.png",
  "green_smoke.png",
  "group_hug.png",
  "guile.png",
  "hailey.png",
  "head_in_the_clouds.png",
  "head_in_the_clouds_sunset.png",
  "heart_to_heart.png",
  "heartbloom.png",
  "heartbloom_blue.png",
  "heartbloom_green.png",
  "heartbloom_purple.png",
  "heartbloom_yellow.png",
  "heartstrings_blue.png",
  "heartstrings_red.png",
  "helmsman.png",
  "hex_lights.png",
  "hex_tiles.png",
  "honeyblossom.png",
  "hood_crimson.png",
  "hood_dark.png",
  "hoppy_day.png",
  "hot_shot.png",
  "hugh_the_rainbow.png",
  "ice_cube.png",
  "icicle_gleaming.png",
  "icicle_snowing.png",
  "im_a_clown.png",
  "imagination.png",
  "implant.png",
  "in_love.png",
  "in_love_blue.png",
  "in_love_green.png",
  "in_tears.png",
  "in_tears_green.png",
  "in_tears_pink.png",
  "in_tears_purple.png",
  "in_tears_yellow.png",
  "jack_o_lantern.png",
  "jeff_the_land_shark.png",
  "joystick.png",
  "juri.png",
  "kabuto.png",
  "ken.png",
  "ki_energy.png",
  "ki_energy_blue.png",
  "ki_energy_cyan.png",
  "ki_energy_fuchsia.png",
  "ki_energy_green.png",
  "kitsune.png",
  "koi_pond.png",
  "lamball.png",
  "lava_blobs.png",
  "lava_blobs_blue.png",
  "lava_blobs_pink.png",
  "lava_blobs_slime.png",
  "lightning.png",
  "lofi_girl_outfit.png",
  "los_santos.png",
  "lotus_flower.png",
  "lovestruck.png",
  "lucky_envelopes.png",
  "luminescent_lotus.png",
  "lunar_lanterns.png",
  "m_bison.png",
  "magic_portal_blue.png",
  "magic_portal_purple.png",
  "magical_girl.png",
  "magical_potion.png",
  "magical_wand_green.png",
  "magical_wand_purple.png",
  "malefic_crown.png",
  "mallow_jump.png",
  "mech_flora.png",
  "mermaid_serenade.png",
  "midnight_sorceress.png",
  "minions.png",
  "mirage.png",
  "mirage_nightshade.png",
  "mirage_twilight.png",
  "mirage_void.png",
  "mokoko.png",
  "mooncaps_blue.png",
  "mooncaps_pink.png",
  "morning_coffee.png",
  "musclebob.png",
  "mushroom_1.png",
  "mushroom_2.png",
  "mushroom_3.png",
  "mushroom_4.png",
  "neon_nibbles.png",
  "new_year_2024.png",
  "new_year_2025.png",
  "next_turn_button.png",
  "oasis.png",
  "omens_cowl.png",
  "oni_mask.png",
  "owlbear_cub.png",
  "owlbear_cub_snowy.png",
  "pal_sphere.png",
  "pancakes.png",
  "pathojen.png",
  "patrick_star.png",
  "phoenix.png",
  "pink_futuristic_ui.png",
  "pink_gyroscope.png",
  "pink_headset.png",
  "pink_hyper_helmet.png",
  "pink_shine_helmet.png",
  "pink_smoke.png",
  "pipedream.png",
  "pirate_captain.png",
  "playful_lofi_cat.png",
  "polar_bear_hat.png",
  "powered_by_shimmer.png",
  "pumpkin_spice.png",
  "radiating_energy.png",
  "radiating_energy_blue.png",
  "radiating_energy_yellow.png",
  "rage.png",
  "rage_blue.png",
  "rage_green.png",
  "rage_purple.png",
  "rage_red.png",
  "rainy_mood.png",
  "ramen_bowl.png",
  "ramen_bowl_toppings.png",
  "rec_room_lightning.png",
  "red_lantern.png",
  "reynas_leer.png",
  "rift_butterfly.png",
  "ring_of_roses_blue.png",
  "ring_of_roses_red.png",
  "rose_bearer_blue.png",
  "rose_bearer_pink.png",
  "ruby_hearts.png",
  "rumbling.png",
  "ryu.png",
  "sakura.png",
  "sakura_1.png",
  "sakura_2.png",
  "sakura_3.png",
  "sakura_gyoiko.png",
  "sakura_ink.png",
  "sakura_pink.png",
  "sakura_scholar.png",
  "sakura_ukon.png",
  "sakura_warrior.png",
  "sandy_cheeks.png",
  "santa_cat_ears.png",
  "saw.png",
  "scallywag.png",
  "scout.png",
  "selyne.png",
  "shadow.png",
  "shield_potion.png",
  "shocked.png",
  "shocked_green.png",
  "shocked_yellow.png",
  "shower_stroll.png",
  "shurikens_mask.png",
  "shy.png",
  "shy_in_love.png",
  "skull_medallion.png",
  "sleepy_chilledcow.png",
  "slither_n_snack.png",
  "snakes_hug.png",
  "snowfall.png",
  "snowglobe.png",
  "snowglobe_blue.png",
  "snowglobe_green.png",
  "snowglobe_pink.png",
  "snowglobe_wood.png",
  "solar_orbit.png",
  "soul_leaving_body.png",
  "soul_leaving_body_blue.png",
  "spirit_embers.png",
  "split_avatar_decoration.png",
  "spongebob.png",
  "spooky_cat_ears.png",
  "spooky_cat_ears_midnight.png",
  "sproutling.png",
  "stardust.png",
  "starlight_whales.png",
  "starry_eyed.png",
  "starry_eyed_green.png",
  "starry_eyed_pink.png",
  "steampunk_cat_ears.png",
  "stinkums.png",
  "straw_hat.png",
  "strawberry_vine.png",
  "street_fighter_6_battle_field.png",
  "string_lights.png",
  "string_lights_aurora.png",
  "string_lights_dusk.png",
  "string_lights_ember.png",
  "string_lights_mix.png",
  "study_session.png",
  "sushi_roll.png",
  "sweat_drops.png",
  "sweat_drops_cyan.png",
  "sweat_drops_pink.png",
  "teacup_blue.png",
  "teacup_orange.png",
  "teacup_pink.png",
  "teacup_red.png",
  "terrain_tiles.png",
  "tga_controller.png",
  "the_anomaly.png",
  "the_atlas_gauntlets.png",
  "the_hexcore.png",
  "the_mark.png",
  "the_monster_you_created.png",
  "the_petal_pack.png",
  "timekeepers_clock.png",
  "toast.png",
  "torgal_puppy.png",
  "treasure_and_key.png",
  "ufo.png",
  "unicorn.png",
  "uwu_xp.png",
  "valorant_champions_2024.png",
  "victory_crown.png",
  "viper_poison_cloud.png",
  "wallach_spaceport.png",
  "warp_helmet.png",
  "water.png",
  "wingman_boba.png",
  "wingmans_got_it.png",
  "winkle.png",
  "witch_hat_midnight.png",
  "witch_hat_plum.png",
  "wizard_hat_blue.png",
  "wizard_hat_purple.png",
  "wizards_staff.png",
  "wolf_morph.png",
  "woolgathering.png",
  "yoru_dimensional_drift.png",
  "zombie_food.png",
  "zombie_food_purple.png"
];

interface DecorationSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (decoration: {
    enabled: boolean;
    name: string;
    animation: {
      type: string;
      speed: number;
      scale: number;
    };
  }) => void;
  currentDecoration?: {
    name: string;
    animation: {
      type: string;
      speed: number;
      scale: number;
    };
  };
}

export function DecorationSelector({ open, onOpenChange, onSelect, currentDecoration }: DecorationSelectorProps) {
  const queryClient = useQueryClient();
  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await fetch('/api/subscription/status');
      if (!res.ok) throw new Error('Failed to fetch subscription status');
      return res.json();
    }
  });

  // Check both isPremium property and status
  const hasPremium = subscription?.isPremium === true || subscription?.status === 'premium';

  const [selectedDecoration, setSelectedDecoration] = useState<string | null>(
    currentDecoration?.name || null
  );

  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const handleSelect = (name: string) => {
    if (!hasPremium) {
      toast({
        title: "Premium Feature",
        description: "Profile decorations are only available with a premium subscription.",
        action: (
          <Button onClick={() => navigate('/pricing')}>
            Upgrade to Premium
          </Button>
        )
      });
      return;
    }

    setSelectedDecoration(name);
    onSelect({
      enabled: true,
      name,
      animation: {
        type: "none",
        speed: 1,
        scale: 1
      }
    });
  };

  if (isLoading) {
    return null;
  }

  console.log("Subscription data:", subscription);
  console.log("Has premium:", hasPremium);

  // Return specific dialog based on subscription status
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {hasPremium ? (
        // Premium user view - show decoration selector
        <DialogContent className="max-w-4xl z-[100]">
          <DialogHeader>
            <DialogTitle>Choose Profile Decoration</DialogTitle>
            <DialogDescription>Select a decoration to display around your profile picture</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[80vh] sm:h-[500px] pr-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {DECORATION_LIST.map((decoration) => (
                <Card
                  key={decoration}
                  className={`relative p-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedDecoration === decoration ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => handleSelect(decoration)}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative aspect-square rounded-lg overflow-hidden"
                  >
                    <img
                      loading="lazy"
                      src={`${DECORATION_BASE_URL}/${decoration}`}
                      alt={decoration}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                      }}
                    />
                  </motion.div>
                  <p className="mt-2 text-sm text-center truncate">
                    {decoration.replace(".png", "")}
                  </p>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      ) : (
        // Free user view - show premium upgrade dialog
        <DialogContent className="sm:max-w-md bg-black border border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Premium Feature: Profile Decorations
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Upgrade to access exclusive profile features
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-base text-white/80">
              Profile decorations are exclusively available with a Premium subscription.
              Upgrade now to unlock all premium features and enhance your profile!
            </p>
            <div className="bg-white/5 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium text-white">Premium includes:</p>
              <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                <li>Custom profile decorations</li>
                <li>Unlimited social links</li>
                <li>Special effects and animations</li>
                <li>AI-powered chatbot</li>
                <li>Advanced background options</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Maybe Later
              </Button>
              <Button 
                onClick={() => {
                  onOpenChange(false);
                  navigate('/pricing');
                }}
                className="bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 hover:from-yellow-500 hover:to-yellow-600"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}