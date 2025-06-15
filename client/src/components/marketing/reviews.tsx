import { cn } from "@/lib/utils";
import { Marquee } from "@/components/ui/marquee";

const reviews = [
  {
    name: "Alex Carter",
    username: "@alexcarter",
    body: "Slayz made my page look stunning! Love the customization.",
    img: "https://avatar.vercel.sh/alex",
  },
  {
    name: "Sophia Reynolds",
    username: "@sophiareynolds",
    body: "Best link-in-bio tool out there. The AI chatbot is amazing!",
    img: "https://avatar.vercel.sh/sophia",
  },
  {
    name: "Daniel Hayes",
    username: "@danielhayes",
    body: "Insane customization and animations. Totally worth it!",
    img: "https://avatar.vercel.sh/daniel",
  },
  {
    name: "Mia Thompson",
    username: "@miathompson",
    body: "So easy to use, and my page looks incredible!",
    img: "https://avatar.vercel.sh/mia",
  },
  {
    name: "Liam Foster",
    username: "@liamfoster",
    body: "Finally, a link-in-bio tool that isn’t boring!",
    img: "https://avatar.vercel.sh/liam",
  },
  {
    name: "Emma Brooks",
    username: "@emmabrooks",
    body: "Best $5 I’ve spent! No ads, custom domain, and great effects.",
    img: "https://avatar.vercel.sh/emma",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
        // dark styles
        "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
    </figure>
  );
};

export function MarqueeDemo() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
      <Marquee pauseOnHover className="[--duration:20s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:20s]">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background"></div>
    </div>
  );
}
