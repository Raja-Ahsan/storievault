import React from 'react'

const Header = () => {
  return (
    <header>
        <>
        
        <div className="page-header">
    <div className="header-wrapper row m-0">
        <form className="form-inline search-full col" action="#" method="get">
            <div className="form-group w-100">
                <div className="Typeahead Typeahead--twitterUsers">
                    <div className="u-posRelative">
                        <input className="demo-input Typeahead-input form-control-plaintext w-100" type="text"
                            placeholder="Search Anything Here..." name="q" title="" />
                        <div className="spinner-border Typeahead-spinner" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <i className="close-search" data-feather="x"></i>
                    </div>
                    <div className="Typeahead-menu"></div>
                </div>
            </div>
        </form>
        <div className="header-logo-wrapper col-auto p-0">
            <div className="logo-wrapper">
                <a href="index.html">
                    {/* <img className="img-fluid for-light" src="{{ asset('assets/images/logo/logo.png') }}" alt="" /> */}
                    {/* <img className="img-fluid for-dark" src="{{ asset('assets/images/logo/logo_dark.png') }}"
                        alt="" /> */}
                </a>
            </div>
            <div className="toggle-sidebar">
                <i className="status_toggle middle sidebar-toggle" data-feather="align-center"></i>
            </div>
        </div>
        <div className="nav-right col-xxl-7 col-xl-6 col-md-7 col-8 pull-right right-header p-0 ms-auto">
            <ul className="nav-menus">
                {/* {{-- Notification icons --}} */}
                <li className="profile-nav onhover-dropdown pe-0 py-0">
                    <div className="d-flex profile-media">
                        <div className="flex-grow-1 d-flex align-items-center gap-2">
                            {/* <span>{{ Auth::user()->name }}</span> */}
                            <p className="mb-0">
                                 <i className="middle fa-solid fa-angle-down"></i>
                            </p>
                        </div>
                    </div>
                    <div className="cart-dropdown onhover-show-div">
                        <ul>
                            <li>
                                <div className="d-flex">
                                    <div className="flex-grow-1 d-flex row-gap-3 flex-column">
                                        {/* <a href="{{ route('admin.profile.edit') }}"><span className="f-light">{{ __('Profile') }}</span></a>
                                        <form method="POST" action="{{ route('logout') }}">
                                            @csrf

                                            <x-dropdown-link :href="route('logout')"
                                                onclick="event.preventDefault();
                                                this.closest('form').submit();">
                                                <span className="f-light">{{ __('Log Out') }}</span>
                                            </x-dropdown-link>
                                        </form>
                                        {{-- <span>Logout</span> --}} */}
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </li>
            </ul>
        </div>
        {/* <script className="result-template" type="text/x-handlebars-template">
            {{-- ... --}}
        </script>
        <script className="empty-template" type="text/x-handlebars-template">
        </script> */}
    </div>
</div>
</>
    </header>
  )
}

export default Header