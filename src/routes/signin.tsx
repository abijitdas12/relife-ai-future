import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@/components/ui/modern-stunning-sign-in";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In — ReLife AI" },
      {
        name: "description",
        content: "Sign in to ReLife AI to scan products, review RDE reports and reach Skill Centers.",
      },
      { property: "og:title", content: "Sign In — ReLife AI" },
      {
        property: "og:description",
        content: "Access your circular repair intelligence workspace.",
      },
    ],
  }),
  component: SignIn,
});
