"use client"
import { useState, useEffect, useRef } from "react"
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
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-6">
          <div className="flex items-center mb-8">
            <Image
              src="/mainlogo.png"
              alt="Mehetabel"
              width={40}
              height={40}
              className="mr-3 flex-shrink-0"
            />
            <span className="text-xl font-bold">Mehetabel</span>
          </div>
          <div className="grid gap-4">
          <Link
href="/"
className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent text-foreground transition-colors"
prefetch={false}
>
<HomeIcon className="h-5 w-5" />
<span className="font-medium">Home</span>
</Link>
   <Link
href="/about"
className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent text-foreground transition-colors"
prefetch={false}
>
<InfoIcon className="h-5 w-5" />
<span className="font-medium">About</span>
</Link>
   <Link
href="/services"
className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent text-foreground transition-colors"
prefetch={false}
>
<ServicesIcon className="h-5 w-5" />
<span className="font-medium">Services</span>
</Link>

<Link
href="/contact"
className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent text-foreground transition-colors"
prefetch={false}
>
<ContactIcon className="h-5 w-5" />
<span className="font-medium">Contact</span>
</Link>
<Link
href="/start-order"
className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent text-foreground transition-colors"
prefetch={false}
>
<CalendarIcon className="h-5 w-5" />
<span className="font-medium">Start Order</span>
</Link>
<Link
href="/track-order"
className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-accent text-foreground transition-colors"
prefetch={false}
>
<BuildingIcon className="h-5 w-5" />
<span className="font-medium">Track Order</span>
</Link>

          </div>
        </SheetContent>
  </Sheet>

  <Link href="/" className="flex items-center min-w-0" prefetch={false}>
    <div className="logo-container flex-shrink-0">
      {/*<Image
        src="/mainlogo.png"
        alt="Mehetabel"
        width={44}
        height={44}
        className="mr-3"
      />*/}
    </div>
    <span className="text-lg md:text-xl font-bold text-primary hidden sm:inline-block whitespace-nowrap">
      Delivery Link
    </span>
  </Link>
</div>

<nav className="hidden lg:flex items-center gap-1 2xl:gap-2 ml-4">
  <NavLink href="/" active={pathname.substring(1)==""?true:false}>Home</NavLink>
  <NavLink href="/about" active={pathname.substring(1)=="about"?true:false}>About</NavLink>
  <NavLink href="/services" active={pathname.substring(1)=="services"?true:false}>Services</NavLink>

  <NavLink href="/contact" active={pathname.substring(1)=="contact"?true:false}>Contact</NavLink>

 <Button size="sm" className="ml-1 2xl:ml-2 bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap text-xs xl:text-sm px-2 2xl:px-3" onClick={() => router.push("/start-order")}>
Start Order
</Button>
<Button variant="outline" size="sm" className="ml-1 whitespace-nowrap text-xs xl:text-sm px-2 2xl:px-3" onClick={() => router.push("/track-order")}>
Track Order
</Button>
</nav>

    <div className="flex items-center gap-1 md:gap-2 ml-2 flex-shrink-0">
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
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/booking")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              <span>My Sessions</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem  onClick={() => authClient.signOut()}>
              <LogOutIcon className="mr-2 h-4 w-4" />
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
  className={`relative font-medium transition-colors whitespace-nowrap text-xs xl:text-sm px-2 2xl:px-3 py-2 rounded-md ${
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


type IconProps = React.SVGProps<SVGSVGElement>;

function MenuIcon(props: IconProps) {
return (
<svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <line x1="4" x2="20" y1="12" y2="12" />
  <line x1="4" x2="20" y1="6" y2="6" />
  <line x1="4" x2="20" y1="18" y2="18" />
</svg>
)
}

function HomeIcon(props: IconProps) {
return (
<svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  <polyline points="9 22 9 12 15 12 15 22" />
</svg>
)
}

function InfoIcon(props: IconProps) {
return (
<svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <circle cx="12" cy="12" r="10" />
  <line x1="12" y1="16" x2="12" y2="12" />
  <line x1="12" y1="8" x2="12.01" y2="8" />
</svg>
)
}

function ServicesIcon(props: IconProps) {
return (
<svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
</svg>
)
}


function ContactIcon(props: IconProps) {
return (
<svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
</svg>
)
}

function UserIcon(props: IconProps) {
return (
<svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
  <circle cx="12" cy="7" r="4" />
</svg>
)
}

function CalendarIcon(props: IconProps) {
return (
<svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
  <line x1="16" y1="2" x2="16" y2="6" />
  <line x1="8" y1="2" x2="8" y2="6" />
  <line x1="3" y1="10" x2="21" y2="10" />
</svg>
)
}

function CreditCardIcon(props: IconProps) {
return (
<svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
  <line x1="3" y1="10" x2="21" y2="10" />
</svg>
)
}

function LogOutIcon(props: IconProps) {
return (
<svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
 <polyline points="16 17 21 12 16 7" />
 <line x1="21" y1="12" x2="9" y2="12" />
</svg>
)
}

function BuildingIcon(props: IconProps) {
return (
<svg
  {...props}
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
  <path d="M9 22v-4h6v4"/>
  <path d="M8 6h.01"/>
  <path d="M16 6h.01"/>
  <path d="M12 6h.01"/>
  <path d="M12 10h.01"/>
  <path d="M12 14h.01"/>
  <path d="M16 10h.01"/>
  <path d="M16 14h.01"/>
  <path d="M8 10h.01"/>
  <path d="M8 14h.01"/>
</svg>
)
}
