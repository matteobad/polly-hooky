"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useOrganization, useOrganizationList, useUser } from "@clerk/nextjs";
import {
  Check,
  ChevronsUpDown,
  Command,
  LayoutGrid,
  PlusCircle,
} from "lucide-react";

import {
  type OrganizationMembershipResource,
  type OrganizationResource,
  type UserResource,
} from "@clerk/types";

// import { NewOrganizationDialog } from "./new-organization-dialog";
// import { NewProjectDialog } from "./new-project-dialog";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

function WorkspaceSwitcher(props: {
  orgs: OrganizationMembershipResource[];
  user: UserResource | undefined;
  activeOrg: OrganizationResource | UserResource;
  handleSelect: (selectedId: string) => void;
  openNewOrgDialog: () => void;
  setHoveredWorkspace: React.Dispatch<React.SetStateAction<string>>;
}) {
  const {
    orgs,
    activeOrg,
    user,
    handleSelect,
    openNewOrgDialog,
    setHoveredWorkspace,
  } = props;

  return (
    <Command>
      <CommandList>
        <CommandInput placeholder="Search workspace..." />
        <CommandGroup heading="Personal account">
          <CommandItem
            onSelect={() => handleSelect(user?.id ?? activeOrg.id)}
            onMouseEnter={() => setHoveredWorkspace(user?.id ?? activeOrg.id)}
            className="cursor-pointer text-sm"
          >
            <Avatar className="mr-2 h-5 w-5">
              <AvatarImage src={user?.imageUrl} alt={user?.fullName ?? ""} />
              <AvatarFallback>
                {`${user?.firstName?.[0]}${user?.lastName?.[0]}` ?? "JD"}
              </AvatarFallback>
            </Avatar>
            {user?.fullName}
            <Check
              className={cn(
                "ml-auto h-4 w-4",
                activeOrg === null ? "opacity-100" : "opacity-0",
              )}
            />
          </CommandItem>
        </CommandGroup>

        <CommandGroup
          heading={!orgs?.length ? "No organizations yet" : "Organizations"}
        >
          {orgs?.map(({ organization: org }) => (
            <CommandItem
              key={org.name}
              onSelect={() => handleSelect(org.id)}
              onMouseEnter={() => setHoveredWorkspace(org.id)}
              className="cursor-pointer text-sm"
            >
              <Avatar className="mr-2 h-5 w-5">
                <AvatarImage
                  src={org.imageUrl ?? "/images/placeholder.png"}
                  alt={org.name}
                />
                <AvatarFallback>{org.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              {org.name}
              <Check
                className={cn(
                  "ml-auto h-4 w-4",
                  activeOrg?.id === org.id ? "opacity-100" : "opacity-0",
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <CommandSeparator />
      <CommandList>
        <CommandGroup>
          <DialogTrigger asChild>
            <CommandItem onSelect={openNewOrgDialog} className="cursor-pointer">
              <PlusCircle className="mr-2 h-5 w-5" />
              Create Organization
            </CommandItem>
          </DialogTrigger>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function ProjectSwitcher(props: {
  projects?: RouterOutputs["project"]["listByWorkspace"]["projects"];
  activeProject?: RouterOutputs["project"]["listByWorkspace"]["projects"][number];
  handleSelect: (projectId: string) => void;
  openNewProjectDialog: () => void;
}) {
  const { projects, activeProject, handleSelect, openNewProjectDialog } = props;

  return (
    <Command>
      <CommandList>
        <CommandInput placeholder="Search project..." />

        <CommandGroup heading="Projects">
          {projects?.map((project) => (
            <CommandItem
              key={project.id}
              onSelect={() => handleSelect(project.id)}
              className="text-sm"
            >
              <Avatar className="mr-2 h-5 w-5">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              {project.name}
              <Check
                className={cn(
                  "ml-auto h-4 w-4",
                  project.id === activeProject?.id
                    ? "opacity-100"
                    : "opacity-0",
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
      <CommandSeparator />
      <CommandList>
        <CommandGroup>
          <CommandItem
            onSelect={() => handleSelect("")}
            className="cursor-pointer"
          >
            <LayoutGrid className="mr-2 h-5 w-5" />
            Browse projects
          </CommandItem>
          <CommandItem
            onSelect={openNewProjectDialog}
            className="cursor-pointer"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Create project
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function AppSwitcher() {
  const router = useRouter();

  const { workspaceId, projectId } = useParams<{
    workspaceId: string;
    projectId: string;
  }>();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState<"org" | "project">("org");
  const [hoveredWorkspace, setHoveredWorkspace] = useState(workspaceId);

  const orgs = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const org = useOrganization();

  const { user, isSignedIn, isLoaded } = useUser();
  if (isLoaded && !isSignedIn) throw new Error("How did you get here???");

  const data = { projects: [] };
  const activeProject = data?.projects.find((p) => p.id === projectId);

  const activeOrg = org.organization ?? user;
  if (
    !orgs.isLoaded ||
    !org.isLoaded ||
    !activeOrg ||
    orgs.userMemberships.isLoading
  ) {
    // Skeleton loader
    return (
      <Button
        variant="ghost"
        size="sm"
        role="combobox"
        aria-expanded={switcherOpen}
        aria-label="Select a workspace"
        className="justify-between opacity-50"
      >
        <Avatar className="mr-2 h-5 w-5">
          <AvatarFallback>Ac</AvatarFallback>
        </Avatar>
        Select a workspace
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
      </Button>
    );
  }

  const handleOrgSelect = async (teamId: string | null) => {
    if (!user?.id) return;

    console.debug(`[workspace-switcher] selected team ${teamId}`);
    await orgs.setActive?.({ organization: teamId });
    setSwitcherOpen(false);
    router.push(`/${teamId ?? user.id}`);
  };

  const handleProjectSelect = async (projectId: string) => {
    if (!activeOrg.id) return;

    console.debug(`[workspace-switcher] selected project ${projectId}`);
    setSwitcherOpen(false);
    router.push(`/${activeOrg.id}/${projectId}`);
  };

  const openNewOrgDialog = () => {
    setSwitcherOpen(false);
    setNewDialogOpen(true);
    setActiveDialog("org");
  };

  const openNewProjectDialog = () => {
    setSwitcherOpen(false);
    setNewDialogOpen(true);
    setActiveDialog("project");
  };

  const closeDialog = () => {
    setNewDialogOpen(false);
  };

  return (
    <>
      <span className="text-muted-foreground mx-2 text-lg font-medium">/</span>
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <Popover open={switcherOpen} onOpenChange={setSwitcherOpen}>
          <Link
            href={`/${workspaceId}`}
            className="mx-2 flex items-center gap-1 text-xs font-semibold"
          >
            <Avatar className="h-5 w-5 md:mr-2">
              <AvatarImage src={activeOrg?.imageUrl ?? ""} />
              <AvatarFallback>
                {("name" in activeOrg
                  ? activeOrg.name
                  : activeOrg.fullName
                )?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block">
              {"name" in activeOrg ? activeOrg.name : activeOrg.fullName}
            </span>
          </Link>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              role="combobox"
              aria-expanded={switcherOpen}
              aria-label="Select a workspace"
              className="w-2"
            >
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          {activeProject && (
            <>
              <span className="text-muted-foreground mx-2 text-lg font-medium">
                /
              </span>
              <Link
                href={`/${workspaceId}/${activeProject?.id}`}
                className="mx-2 flex items-center gap-1 text-xs font-semibold"
              >
                <Avatar className="h-5 w-5 md:mr-2">
                  <AvatarImage src={`${activeProject.domain}/favicon.ico`} />
                  <AvatarFallback>
                    {activeProject.name.substring(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block">{activeProject.name}</span>
              </Link>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  role="combobox"
                  aria-expanded={switcherOpen}
                  aria-label="Select a workspace"
                  className="w-2"
                >
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
            </>
          )}
          <PopoverContent className="flex w-96 p-0">
            <WorkspaceSwitcher
              activeOrg={activeOrg}
              orgs={orgs.userMemberships.data}
              user={user}
              handleSelect={handleOrgSelect}
              openNewOrgDialog={openNewOrgDialog}
              setHoveredWorkspace={setHoveredWorkspace}
            />
            <Separator orientation="vertical" className="h-auto" />
            <ProjectSwitcher
              activeProject={activeProject}
              projects={data?.projects}
              handleSelect={handleProjectSelect}
              openNewProjectDialog={openNewProjectDialog}
            />
          </PopoverContent>
        </Popover>

        {/* <React.Suspense>
          {activeDialog === "org" && (
            <NewOrganizationDialog closeDialog={closeDialog} />
          )}
          {activeDialog === "project" && (
            <NewProjectDialog closeDialog={closeDialog} />
          )}
        </React.Suspense> */}
      </Dialog>
    </>
  );
}
