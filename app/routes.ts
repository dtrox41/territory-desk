import {
  index,
  layout,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  layout("routes/app-layout.tsx", [
    index("routes/home.tsx"),
    route("territory", "routes/territory.tsx"),
    route("leads/new", "routes/send-lead.tsx"),
    route("leads", "routes/leads.tsx"),
    route("leads/:leadId", "routes/lead-detail.tsx"),
    route("directory", "routes/directory.tsx"),
    route("directory/:representativeId", "routes/representative-detail.tsx"),
    route("notifications", "routes/notifications.tsx"),
    route("insights", "routes/insights.tsx"),
    route("data-status", "routes/data-status.tsx"),
    route("profile", "routes/profile.tsx"),
    route("help", "routes/help.tsx"),
    route("help/requests/:requestId", "routes/help-request.tsx"),
    route("help/:topicSlug", "routes/help-topic.tsx"),
  ]),
  route("signed-out", "routes/signed-out.tsx"),
  route("not-found", "routes/not-found.tsx"),
  route("*", "routes/catch-all.tsx"),
] satisfies RouteConfig;
