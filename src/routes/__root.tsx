import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Shell } from "@/components/site/Shell";

function NotFoundComponent() {
  return (
    <section className="flex min-h-[80vh] flex-col items-start justify-center px-5 md:px-10">
      <p className="eyebrow">404</p>
      <h1 className="font-display mt-4 text-6xl font-bold md:text-9xl">Eltévedtél.</h1>
      <p className="mt-4 text-muted-foreground">Ez az oldal nem létezik vagy elköltözött.</p>
      <Link to="/" className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
        Vissza a főoldalra
      </Link>
    </section>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Az oldal nem töltött be</h1>
        <p className="mt-2 text-sm text-muted-foreground">Valami hiba történt. Próbáld újra.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Újra
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GátAi studio — Creative Technology Studio" },
      { name: "description", content: "Weboldalak, alkalmazások és intelligens rendszerek Budapestről." },
      { name: "author", content: "Gátai Bence" },
      { name: "theme-color", content: "#08090D" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/brand/gatai-favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600&family=Unbounded:wght@500;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="hu">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Shell>
        <Outlet />
      </Shell>
    </QueryClientProvider>
  );
}
