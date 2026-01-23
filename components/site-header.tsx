import { NavUser } from "@/components/nav-user"

export function SiteHeader({ user }: { user: { name: string, email: string, avatar: string } }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <h1 className="text-base font-medium">Albaly Insight</h1>
        <div className="ml-auto flex items-center gap-2">
          <NavUser user={user} />
        </div>
      </div>
    </header>
  )
}
