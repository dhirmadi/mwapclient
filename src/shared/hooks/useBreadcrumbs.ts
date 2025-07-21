import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { BreadcrumbItem } from '../../core/layouts/Breadcrumbs';

/**
 * Hook to generate breadcrumbs based on current route
 */
export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();
  const params = useParams();

  return useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Dashboard
    breadcrumbs.push({
      title: 'Dashboard',
      href: '/dashboard'
    });

    // Handle different route patterns
    if (pathSegments.includes('integrations')) {
      breadcrumbs.push({
        title: 'Integrations',
        href: '/integrations'
      });

      if (pathSegments.includes('create')) {
        breadcrumbs.push({
          title: 'Create Integration'
        });
      } else if (params.id) {
        breadcrumbs.push({
          title: 'Integration Details'
        });
      }
    } else if (pathSegments.includes('projects')) {
      breadcrumbs.push({
        title: 'Projects',
        href: '/projects'
      });

      if (pathSegments.includes('create')) {
        breadcrumbs.push({
          title: 'Create Project'
        });
      } else if (params.id) {
        breadcrumbs.push({
          title: 'Project Details'
        });

        if (pathSegments.includes('edit')) {
          breadcrumbs.push({
            title: 'Edit Project'
          });
        } else if (pathSegments.includes('members')) {
          breadcrumbs.push({
            title: 'Members'
          });
        } else if (pathSegments.includes('files')) {
          breadcrumbs.push({
            title: 'Files'
          });
        }
      }
    } else if (pathSegments.includes('admin')) {
      breadcrumbs.push({
        title: 'Admin',
        href: '/admin/dashboard'
      });

      if (pathSegments.includes('tenants')) {
        breadcrumbs.push({
          title: 'Tenants',
          href: '/admin/tenants'
        });
      } else if (pathSegments.includes('cloud-providers')) {
        breadcrumbs.push({
          title: 'Cloud Providers',
          href: '/admin/cloud-providers'
        });
      } else if (pathSegments.includes('project-types')) {
        breadcrumbs.push({
          title: 'Project Types',
          href: '/admin/project-types'
        });
      }
    } else if (pathSegments.includes('tenant')) {
      breadcrumbs.push({
        title: 'Tenant',
        href: '/tenant/dashboard'
      });

      if (pathSegments.includes('settings')) {
        breadcrumbs.push({
          title: 'Settings'
        });
      } else if (pathSegments.includes('management')) {
        breadcrumbs.push({
          title: 'Management'
        });
      }
    }

    return breadcrumbs;
  }, [location.pathname, params]);
};

export default useBreadcrumbs;