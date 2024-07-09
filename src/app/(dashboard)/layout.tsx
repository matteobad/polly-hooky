import Link from "next/link";

import { AppSwitcher } from "./_components/app-switcher";

export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden rounded-[0.5rem]">
      <nav className="border-b pb-2">
        <div className="flex h-16 items-center px-6">
          <Link
            href="/"
            className="relative z-20 mr-2 flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            Polly-Hooky
          </Link>
          <AppSwitcher />
          <div className="ml-auto flex items-center space-x-4">
            {/* <UserNav /> */}
          </div>
        </div>
        {/* <div className="px-2">{<ProjectNav />}</div> */}
      </nav>
      <main className="min-h-[calc(100vh-11rem)] flex-1 space-y-4">
        {props.children}
      </main>
      {/* <SiteFooter /> */}
    </div>
  );
}
