import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AdminLayout } from "./components/layout/AdminLayout";
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

const queryClient = new QueryClient();

function Router() {
  return (
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
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
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
