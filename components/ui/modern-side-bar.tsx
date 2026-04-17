"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  Bell,
  Kanban,
  Users,
  Archive
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import NotificationBell from '@/components/layout/NotificationBell';
import { createClient } from '@/lib/supabase/client';

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
  show?: boolean;
}

interface ModernSidebarProps {
  user: {
    id: string;
    name: string;
    role: string;
    avatar_url?: string | null;
  };
  className?: string;
}

export function ModernSidebar({ user, className = "" }: ModernSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isClient = user.role === 'client'
  const isDesigner = user.role === 'designer'

  const requestsLabel = isDesigner ? 'Gelen Talepler' : isClient ? 'Taleplerim' : 'Talepler'

  const navigationItems: NavigationItem[] = [
    { id: "dashboard", name: "Dashboard", icon: Home, href: "/dashboard", show: true },
    { id: "requests", name: requestsLabel, icon: FileText, href: "/requests", show: true },
    { id: "kanban", name: "Kanban Board", icon: Kanban, href: "/kanban", show: true },
    { id: "brands", name: "Markalar", icon: BarChart3, href: "/brands", show: !isDesigner },
    { id: "team", name: "Ekip", icon: Users, href: "/team", show: true },
    { id: "archive", name: "Arşiv", icon: Archive, href: "/archive", show: !isDesigner },
    { id: "notifications", name: "Bildirimler", icon: Bell, href: "/notifications", show: true },
    { id: "settings", name: "Ayarlar", icon: Settings, href: "/settings", show: true },
  ];

  const filteredItems = navigationItems.filter(item => item.show !== false);

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const initials = getInitials(user.name);

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-6 left-6 z-50 p-3 rounded-lg bg-white shadow-md border border-slate-100 md:hidden hover:bg-slate-50 transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        {isOpen ?
          <X className="h-5 w-5 text-slate-600" /> :
          <Menu className="h-5 w-5 text-slate-600" />
        }
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-background border-r border-border z-40 transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          ${isCollapsed ? "w-28" : "w-72"}
          md:translate-x-0 md:static md:z-auto
          ${className}
        `}
      >
        {/* Header with logo and collapse button */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/30">
          {!isCollapsed && (
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 flex items-center justify-center">
                <Image src="/flat_icon.svg" alt="DesignOps" width={36} height={36} className="w-9 h-9" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-base">DesignOps</span>
                <span className="text-xs text-muted-foreground">Design Management</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-9 h-9 flex items-center justify-center mx-auto">
              <Image src="/flat_icon.svg" alt="DesignOps" width={36} height={36} className="w-9 h-9" />
            </div>
          )}

          {/* Desktop collapse button */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-1.5 rounded-md hover:bg-muted transition-all duration-200"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>


        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-0">
          <ul className="space-y-0.5">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              if (item.id === 'notifications') {
                return (
                  <li key={item.id}>
                    <NotificationBell
                      userId={user.id}
                      variant="sidebar"
                      isCollapsed={isCollapsed}
                      isActive={isActive}
                    />
                  </li>
                );
              }

              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setIsOpen(false);
                      }
                    }}
                    className={`
                      w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group relative
                      ${isActive
                        ? "bg-secondary text-primary"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                      ${isCollapsed ? "justify-center px-2" : ""}
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex items-center justify-center min-w-[24px]">
                      <Icon
                        className={`
                          h-4.5 w-4.5 flex-shrink-0
                          ${isActive
                            ? "text-primary"
                            : "text-slate-500 group-hover:text-slate-700"
                          }
                        `}
                      />
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-sm ${isActive ? "font-medium" : "font-normal"}`}>{item.name}</span>
                        {item.badge && item.badge > 0 && (
                          <span className={`
                            px-1.5 py-0.5 text-xs font-medium rounded-full
                            ${isActive
                              ? "bg-primary/10 text-primary"
                              : "bg-slate-100 text-slate-600"
                            }
                          `}>
                            {item.badge > 99 ? '99+' : item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Badge for collapsed state */}
                    {isCollapsed && item.badge && item.badge > 0 && (
                      <div className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-primary/10 border border-white">
                        <span className="text-[10px] font-medium text-primary">
                          {item.badge > 9 ? '9+' : item.badge}
                        </span>
                      </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {item.name}
                        {item.badge && item.badge > 0 && (
                          <span className="ml-1.5 px-1 py-0.5 bg-slate-700 rounded-full text-[10px]">
                            {item.badge}
                          </span>
                        )}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section with profile and logout */}
        <div className="mt-auto border-t border-slate-200">
          {/* Profile Section */}
          <div className={`border-b border-slate-200 bg-slate-50/30 py-2`}>
            {!isCollapsed ? (
              <div className="flex items-center px-3 py-2.5 rounded-md bg-white hover:bg-slate-50 transition-colors duration-200">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs bg-slate-200">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 ml-2.5">
                  <p className="text-sm font-medium text-slate-800 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.role === 'admin' ? 'Yönetici' :
                     user.role === 'designer' ? 'Tasarımcı' : 'Proje Yönetici'}
                  </p>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2" title="Online" />
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="relative">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs bg-slate-200">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="py-2">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center rounded-md text-left transition-all duration-200 group px-3 py-2.5
                text-red-600 hover:bg-red-50 hover:text-red-700
                ${isCollapsed ? "justify-center" : "space-x-2.5"}
              `}
              title={isCollapsed ? "Logout" : undefined}
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <LogOut className="h-4.5 w-4.5 flex-shrink-0 text-red-500 group-hover:text-red-600" />
              </div>

              {!isCollapsed && (
                <span className="text-sm">Çıkış Yap</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                  Çıkış Yap
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
