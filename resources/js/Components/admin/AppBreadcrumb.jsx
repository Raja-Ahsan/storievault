import React from 'react'
import { usePage } from '@inertiajs/react'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'

const AppBreadcrumb = () => {
  const { url } = usePage()

  // Simple breadcrumb generation based on URL
  const generateBreadcrumbs = () => {
    const parts = url.split('/').filter(Boolean);

    // Skip the 'admin' part as it's already in the Home link
    if (parts[0] === 'admin') {
      parts.shift();
    }

    if (parts.length === 0) {
      return [];
    }

    return parts.map((part, index) => {
      // Convert URL part to title case
      const name = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');

      // Build the path up to this point
      const path = '/' + parts.slice(0, index + 1).join('/');

      return {
        name,
        path,
        active: index === parts.length - 1
      };
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <CBreadcrumb className="my-0">
      <CBreadcrumbItem href="/admin-dashboard">Dashboard</CBreadcrumbItem>
      {breadcrumbs.map((breadcrumb, index) => (
        <CBreadcrumbItem
          {...(breadcrumb.active ? { active: true } : { href: breadcrumb.path })}
          key={index}
        >
          {breadcrumb.name}
        </CBreadcrumbItem>
      ))}
    </CBreadcrumb>
  )
}

export default React.memo(AppBreadcrumb)
