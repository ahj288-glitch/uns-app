import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ApiError } from "../../../lib/api-client-react/src/custom-fetch";
import { triggerUnauthorized } from "@/lib/authSession";

import { AdminLayout } from "./components/layout/AdminLayout";
import { AuthGuard } from "./components/AuthGuard";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Programs from "./pages/Programs";
import Community from "./pages/Community";
import Safety from "./pages/Safety";
import AiConfig from "./pages/AiConfig";
import AiProviders from "./pages/AiProviders";
import ConfigEngine from "./pages/ConfigEngine";
import FeatureFlags from "./pages/FeatureFlags";
import Nudges from "./pages/Nudges";
import TeamRBAC from "./pages/TeamRBAC";
import AuditLogs from "./pages/AuditLogs";
import ErrorsConfig from "./pages/ErrorsConfig";
import ContentCMS from "./pages/ContentCMS";
import DailyRecipes from "./pages/DailyRecipes";

function handle401(error: unknown): void {
  if (error instanceof ApiError && error.status === 401) {
    triggerUnauthorized();
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status === 401) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      onError: handle401,
    },
  },
});

queryClient.getQueryCache().subscribe((event) => {
  if (event.type === "updated" && event.action.type === "error") {
    handle401(event.action.error);
  }
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        <AuthGuard>
          <AdminLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/users" component={Users} />
              <Route path="/programs" component={Programs} />
              <Route path="/community" component={Community} />
              <Route path="/safety" component={Safety} />
              <Route path="/ai-config" component={AiConfig} />
              <Route path="/ai-providers" component={AiProviders} />
              <Route path="/config-engine" component={ConfigEngine} />
              <Route path="/feature-flags" component={FeatureFlags} />
              <Route path="/nudges" component={Nudges} />
              <Route path="/team" component={TeamRBAC} />
              <Route path="/audit-logs" component={AuditLogs} />
              <Route path="/errors-config" component={ErrorsConfig} />
              <Route path="/content-cms" component={ContentCMS} />
              <Route path="/daily-recipes" component={DailyRecipes} />
              <Route component={NotFound} />
            </Switch>
          </AdminLayout>
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
