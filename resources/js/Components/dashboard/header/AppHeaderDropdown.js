import React from 'react'
import { usePage, Link } from '@inertiajs/react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilUser,
  cilHome,
  cilAccountLogout,
  cilSettings,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

const AppHeaderDropdown = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

  // Get first letter of user's name for avatar
  const firstLetter = user?.name?.charAt(0).toUpperCase() || 'U';

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar
          size="md"
          style={{
            backgroundColor: '#fea257',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}
        >
          {firstLetter}
        </CAvatar>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">
          <div className="d-flex flex-column">
            <span className="fw-bold">{user?.name}</span>
            <small className="text-muted">{user?.email}</small>
          </div>
        </CDropdownHeader>

        <CDropdownItem href="/" target="_blank">
          <CIcon icon={cilHome} className="me-2" />
          Visit Website
        </CDropdownItem>

        <CDropdownDivider />

        <CDropdownItem href={route('profile.edit')}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>

        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>

        <CDropdownDivider />

        <Link
          href={route('logout')}
          method="post"
          as="button"
          className="dropdown-item text-danger"
          style={{
            background: 'none',
            border: 'none',
            width: '100%',
            textAlign: 'left',
            padding: '0.5rem 1rem',
            cursor: 'pointer'
          }}
        >
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </Link>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
