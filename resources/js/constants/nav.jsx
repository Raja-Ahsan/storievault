import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilUser,
  cilBook,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'
import { Link, usePage } from '@inertiajs/react';



 
const InertiaNavItem = ({ name, to, icon }) => (
  
  <CNavItem component={Link} to={to}>
    {icon}
    {name}
  </CNavItem>
)

const adminNav = [
  
  {
    component: CNavGroup,
    name: 'Dashboard',
    to: '/admin-dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
    component: CNavGroup,
    name: 'Users',
    to: '/admin-dashboard/users',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: InertiaNavItem,
        name: 'List',
        to: '/admin-dashboard/users',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Subscriptions',
    to: '/admin-dashboard/subscriptions',
    icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
    items: [
      {
        component: InertiaNavItem,
        name: 'All Subscriptions',
        to: '/admin-dashboard/subscriptions',
      },
      {
        component: InertiaNavItem,
        name: 'Active Subscriptions',
        to: '/admin-dashboard/subscriptions?status=active',
      },
      {
        component: InertiaNavItem,
        name: 'Expired Subscriptions',
        to: '/admin-dashboard/subscriptions?status=expired',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Stories',
    to: '/admin-dashboard/stories',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List',
        to: '/admin-dashboard/stories',
      },
      {
        component: CNavItem,
        name: 'Create',
        to: '/admin-dashboard/stories/create',
      },
      {
        component: CNavItem,
        name: 'Community',
        to: '/admin-dashboard/community/stories',
      },
      {
        component: CNavItem,
        name: 'Categories',
        to: '/admin-dashboard/categories',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Packages',
    to: '/admin-dashboard/packages',
    icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List',
        to: '/admin-dashboard/packages',
      },
      {
        component: CNavItem,
        name: 'Create',
        to: '/admin-dashboard/packages/create',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Publish Packages',
    to: '/admin-dashboard/publish-packages',
    icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List',
        to: '/admin-dashboard/publish-packages',
      },
      {
        component: CNavItem,
        name: 'Create',
        to: '/admin-dashboard/publish-packages/create',
      },
    ],
  },
  {
    component: CNavItem,
    name: 'Publish Requests',
    to: '/admin-dashboard/publish-requests',
    icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
  },

  {
    component: CNavGroup,
    name: 'Coupons',
    to: '/admin-dashboard/coupons',
    icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List',
        to: '/admin-dashboard/coupons',
      },
      {
        component: CNavItem,
        name: 'Create',
        to: '/admin-dashboard/coupons/create',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Ratings',
    to: '/admin-dashboard/ratings',
    icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List',
        to: '/admin-dashboard/ratings',
      },
      {
        component: CNavItem,
        name: 'Create',
        to: '/admin-dashboard/ratings/create',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Blog',
    to: '/admin-dashboard/blog-posts',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Posts',
        to: '/admin-dashboard/blog-posts',
      },
      {
        component: CNavItem,
        name: 'New post',
        to: '/admin-dashboard/blog-posts/create',
      },
      {
        component: CNavItem,
        name: 'Blog categories',
        to: '/admin-dashboard/blog-categories',
      },
      {
        component: CNavItem,
        name: 'Blog tags',
        to: '/admin-dashboard/blog-tags',
      },
    ],
  },
]

const userNav = [
  {
    component: CNavItem,
    name: 'User Dashboard',
    to: '/user-dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
    component: CNavGroup,
    name: 'Stories',
    to: '/user-dashboard/stories',
    icon: <CIcon icon={cilCursor} customClassName="nav-icon" />,
    items: [
      {
        component: InertiaNavItem,
        name: 'List',
        to: '/user-dashboard/stories',
      },
      {
        component: InertiaNavItem,
        name: 'Create',
        to: '/user-dashboard/stories/create',
      },
    ],
  },

]

export const getNavItems = (role) => {
  return role === 'admin' ? adminNav : userNav
}

