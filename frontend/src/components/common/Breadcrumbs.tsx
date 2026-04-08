import { MdChevronRight, MdHome } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { useBreadcrumbs } from '../../context/BreadcrumbContext';

const routeConfig: Record<string, string> = {
  blog: 'Blog',
  forum: 'Forum',
  review: 'Review',
  perfume: 'Parfum',
  dashboard: 'Dashboard',
  profile: 'Profil',
  admin: 'Admin Panel',
  new: 'Baru',
  edit: 'Edit',
  notifications: 'Notifikasi',
  tentang: 'Tentang Mewangi',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const { titleMap } = useBreadcrumbs();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (location.pathname === '/') return null;

  return (
    <nav className="flex mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-500" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-black hover:text-primary transition-colors"
          >
            <MdHome className="mr-2.5 w-4 h-4" />
            Home
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          // Check for dynamic title in titleMap, then routeConfig, then fallback to formatted name
          const displayName = titleMap[routeTo] || routeConfig[name] || name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

          return (
            <li key={name}>
              <div className="flex items-center">
                <MdChevronRight className="w-5 h-5 text-black" />
                {isLast ? (
                  <span className="ml-1 md:ml-2 text-primary font-bold">
                    {displayName}
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    className="ml-1 md:ml-2 text-black hover:text-primary transition-colors whitespace-nowrap"
                  >
                    {displayName}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
