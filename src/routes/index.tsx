import { createFileRoute } from "@tanstack/react-router";
import { VeilApp } from "@/components/norn/VeilApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <VeilApp />;
}
