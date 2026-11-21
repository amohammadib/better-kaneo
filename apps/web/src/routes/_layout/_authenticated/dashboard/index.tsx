import { createFileRoute, redirect } from "@tanstack/react-router";
import { getPendingInvitations } from "@/fetchers/invitation/get-pending-invitations";
import getWorkspaces from "@/fetchers/workspace/get-workspaces";
import { handleUnauthorized, isUnauthorizedError } from "@/lib/http-error";
import type Workspace from "@/types/workspace";

export const Route = createFileRoute("/_layout/_authenticated/dashboard/")({
  beforeLoad: async () => {
    let workspaces: Workspace[];
    let invitations: Awaited<ReturnType<typeof getPendingInvitations>>;
    try {
      [workspaces, invitations] = await Promise.all([
        getWorkspaces(),
        getPendingInvitations(),
      ]);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        handleUnauthorized();
        return;
      }
      throw error;
    }

    if (invitations && invitations.length > 0 && !workspaces.length) {
      throw redirect({ to: "/invitations" });
    }

    if (workspaces && workspaces.length > 0) {
      throw redirect({
        to: "/dashboard/workspace/$workspaceId/my-tasks",
        params: {
          workspaceId: workspaces.length > 1 ? "everything" : workspaces[0].id,
        },
      });
    }
    throw redirect({ to: "/onboarding" });
  },
});
