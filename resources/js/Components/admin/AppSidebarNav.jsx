import React from 'react'
import { Link, usePage } from '@inertiajs/react'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CSidebarNav, CNavGroup, CNavItem } from '@coreui/react'

export const AppSidebarNav = ({ items }) => {
  const { url } = usePage()

  const renderLink = (name, to, icon, badge, indent = false) => {
    return (
      <Link
        href={to}
        className={`nav-link ${url.startsWith(to)}`}
      >
        {icon
          ? icon
          : indent && (
            <span className="nav-icon">
              <span className="nav-icon-bullet"></span>
            </span>
          )}
        {name}
        {badge && (
          <CBadge color={badge.color} className="ms-auto" size="sm">
            {badge.text}
          </CBadge>
        )}
      </Link>
    )
  }

  const renderItem = (item, index, indent = false) => {
    const { name, to, icon, badge } = item

    return (
      <CNavItem key={index} className="px-3">
        {renderLink(name, to, icon, badge, indent)}
      </CNavItem>
    )
  }

  const renderGroup = (item, index) => {
    const { name, icon, items } = item

    return (
      <CNavGroup
        key={index}
        toggler={
          <>
            {icon}
            {name}
          </>
        }
      >
        {items &&
          items.map((child, i) =>
            child.items ? renderGroup(child, i) : renderItem(child, i, true),
          )}
      </CNavGroup>
    )
  }

  return (
    <CSidebarNav as={SimpleBar}>
      {items.map((item, index) =>
        item.items ? renderGroup(item, index) : renderItem(item, index),
      )}
    </CSidebarNav>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
