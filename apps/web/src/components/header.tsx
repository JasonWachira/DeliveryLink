"use client"
import { useState, useEffect } from "react"
import { Sheet, SheetTrigger, SheetContent } from "./ui/sheet"
import { Button } from "./ui/button"
import Link from "next/link"
import Image from "next/image"
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuLabel,
DropdownMenuSeparator,
DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { authClient } from "../lib/auth-client"
import { ModeToggle } from "./mode-toggle"
import { usePathname, useRouter } from "next/navigation"
import { Menu, Home, Info, Calendar, Building, User, LogOut } from "lucide-react"

export default function Header() {
const pathname = usePathname()
const { data: session } = authClient.useSession()
const [scrolled, setScrolled] = useState(false)
const router = useRouter()

useEffect(() => {
const handleScroll = () => {
  setScrolled(window.scrollY > 10)
}

window.addEventListener("scroll", handleScroll)
return () => window.removeEventListener("scroll", handleScroll)
}, [])

return (
<header className={`fixed top-0 left-0 right-0 z-50 flex h-20 w-full items-center px-2 md:px-4 lg:px-6 transition-all duration-300
bg-background/80 backdrop-blur-sm ${
scrolled ? "shadow-sm" : ""
}`}>
<div className="container mx-auto flex items-center justify-between">
<div className="flex items-center min-w-0 flex-shrink-0">
  <Sheet>
  <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2 hover:bg-accent/10 flex-shrink-0"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-6">
          <div className="flex items-center mb-8">
            <span className="text-xl font-bold">Delivery Link</span>
          </div>
          <div className="grid gap-4">
          <Link
href="/"
className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent text-foreground transition-colors"
prefetch={false}
>
<Home className="h-5 w-5" />
<span className="font-medium">Home</span>
</Link>
   <Link
href="/about"
className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent text-foreground transition-colors"
prefetch={false}
>
<Info className="h-5 w-5" />
<span className="font-medium">About</span>
</Link>
<Link
href="/dashboard/start-order"
className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent text-foreground transition-colors"
prefetch={false}
>
<Calendar className="h-5 w-5" />
<span className="font-medium">Start Order</span>
</Link>
<Link
href="/track-order"
className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent text-foreground transition-colors"
prefetch={false}
>
<Building className="h-5 w-5" />
<span className="font-medium">Track Order</span>
</Link>
          </div>
        </SheetContent>
  </Sheet>

  <Link href="/" className="flex items-center min-w-0" prefetch={false}>
    <span className="text-lg md:text-xl font-bold text-primary whitespace-nowrap">
      Delivery Link
    </span>
  </Link>
</div>

<nav className="hidden lg:flex items-center gap-2 xl:gap-3 ml-auto mr-4">
  <NavLink href="/" active={pathname === "/"}>Home</NavLink>
  <NavLink href="/about" active={pathname === "/about"}>About</NavLink>
 <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap text-xs xl:text-sm px-3 xl:px-4" onClick={() => router.push("/dashboard/start-order")}>
Start Order
</Button>
<Button variant="outline" size="sm" className="whitespace-nowrap text-xs xl:text-sm px-3 xl:px-4" onClick={() => router.push("/track-order")}>
Track Order
</Button>
</nav>

    <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
    <ModeToggle  />
      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="rounded-full h-9 w-9 p-0 flex-shrink-0">
              <Avatar className="h-9 w-9 border-2 border-primary-foreground/20">
                <AvatarImage
                  src={session.user.image ?? undefined}
                  alt={session.user?.name ?? "User"}
                />
                <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                  {session.user?.name?.charAt(0) ?? "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session.user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/booking")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>My Orders</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem  onClick={() => authClient.signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex gap-1">
          <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 whitespace-nowrap text-xs px-2 md:px-3" onClick={() => router.push("/auth")}>
            Sign in
          </Button>
        </div>
      )}
    </div>
  </div>
</header>
)
}

interface NavLinkProps {
href: string;
children: React.ReactNode;
active: boolean;
}

function NavLink({ href, children, active }: NavLinkProps) {
return (
<Link
  href={href}
  className={`relative font-medium transition-colors whitespace-nowrap text-xs xl:text-sm px-3 xl:px-4 py-2 rounded-md ${
    active
      ? "text-primary font-semibold bg-primary/10"
      : "text-foreground hover:text-foreground/80 hover:bg-accent/50"
  }`}
  prefetch={false}
>
  {children}
  {active && (
    <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-4 bg-primary rounded-full" />
  )}
</Link>
)
}
