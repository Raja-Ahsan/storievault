import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Icons } from '../../utils/icons';
const UserAvatar = ({ user, className = '' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);

  const { auth } = usePage().props;
  // Get first letter of user's name
  const firstLetter = user?.name?.charAt(0).toUpperCase() || 'U';

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`position-relative ${className}`}>
      {/* User Avatar */}
      <div
        ref={avatarRef}
        className="user-avatar"
        onClick={toggleDropdown}
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        {firstLetter}
      </div>

      {/* Dropdown Menu */}
      <div
        ref={dropdownRef}
        className={`user-dropdown ${showDropdown ? 'show' : ''}`}
      >
        <div className="user-dropdown-header">
          <h6 className="mb-0 secondry-font fs-20">{user.name}</h6>
          <small className="text-muted d-block">{user.email}</small>
        </div>
        <div className="user-dropdown-body">
          <Link href={route('profile.edit')} className="user-dropdown-item">
            <Icons.Profile /> <span className='pl-10'>Profile</span>
          </Link>

          <div className="user-dropdown-divider"></div>
          {auth.user?.role === 'admin' && (
            <a href="/admin-dashboard" className="user-dropdown-item">
              <Icons.Dashboard /> <span className='pl-10'>Dashboard</span>
            </a>
          )}
          {auth.user?.role === 'user' && (
            <a href="/user-dashboard" className="user-dropdown-item">
              <Icons.Dashboard /> <span className='pl-10'>Dashboard</span>
            </a>
          )}
          <div className="user-dropdown-divider"></div>

          <Link
            href={route('logout')}
            method="post"
            as="button"
            className="user-dropdown-item w-100 text-start bg-transparent border-0"
          >
            <Icons.Logout /> <span className='pl-10'>Logout</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserAvatar;
