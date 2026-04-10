import React from 'react'

const Sidebar = () => {
  return (
    <div className="sidebar-wrapper" data-sidebar-layout="stroke-svg">
    <div>
        <div className="logo-wrapper">
            <a href="">
                {/* <img className="img-fluid for-light" src="./assets/dashboard/assets/images/logo/logo.png" alt="" /> */}
                {/* <img className="img-fluid for-dark" src="./assets/dashboard/assets/images/logo/logo_dark.png" alt="" /> */}
            </a>
            <div className="back-btn"><i className="fa-solid fa-angle-left"></i></div>
            <div className="toggle-sidebar">
                <i className="status_toggle middle sidebar-toggle" data-feather="grid"></i>
            </div>
        </div>
        <div className="logo-icon-wrapper">
            <a href="">
                <img className="img-fluid" src="./assets/dashboard/assets/images/logo/logo-icon.png" alt="" />
            </a>
        </div>
        <nav className="sidebar-main">
            <div className="left-arrow" id="left-arrow">
                <i data-feather="arrow-left"></i>
            </div>
            <div id="sidebar-menu">
                <ul className="sidebar-links" id="simple-bar">
                    <li className="back-btn">
                        <a href="">
                            <img className="img-fluid" src="assets/dashboard/assets/images/logo/logo-icon.png" alt="" />
                        </a>
                        <div className="mobile-back text-end">
                            <span>Back</span><i className="fa-solid fa-angle-right ps-2" aria-hidden="true"></i>
                        </div>
                    </li>
                    <li className="pin-title sidebar-main-title">
                        <div>
                            <h6>Pinned</h6>
                        </div>
                    </li>
                    <li className="sidebar-main-title">
                        <div>
                            <h6 className="lan-1">General</h6>
                        </div>
                    </li>
                    
                    <li className="sidebar-list">
                        <i className="fa-solid fa-thumbtack"></i>
                        <a className="sidebar-link sidebar-title">
                            <svg className="stroke-icon">
                                <use href="./assets/dashboard/assets/svg/icon-sprite.svg#stroke-blog"></use>
                            </svg>
                            <svg className="fill-icon">
                                <use href="./assets/dashboard/assets/svg/icon-sprite.svg#fill-blog"></use>
                            </svg>
                            <span>Blogs</span>
                        </a>
                        <ul className="sidebar-submenu">
                            <li><a href="">Blogs List</a></li>
                            <li><a href="">Add Blog</a></li>
                        </ul>
                    </li>
                    <li className="sidebar-list">
                        <i className="fa-solid fa-thumbtack"></i>
                        <a className="sidebar-link sidebar-title">
                            <svg className="stroke-icon">
                                <use href="./assets/dashboard/assets/svg/icon-sprite.svg#stroke-blog"></use>
                            </svg>
                            <svg className="fill-icon">
                                <use href="./assets/dashboard/assets/svg/icon-sprite.svg#fill-blog"></use>
                            </svg>
                            <span>Faqs</span>
                        </a>
                        <ul className="sidebar-submenu">
                            <li><a href="">Faqs List</a></li>
                            <li><a href="">Add Faqs</a></li>
                        </ul>
                    </li>
                    <li className="sidebar-list">
                        <i className="fa-solid fa-thumbtack"></i>
                        <a className="sidebar-link sidebar-title">
                            <svg className="stroke-icon">
                                <use href="./assets/dashboard/assets/svg/icon-sprite.svg#stroke-blog"></use>
                            </svg>
                            <svg className="fill-icon">
                                <use href="./assets/dashboard/svg/icon-sprite.svg#fill-blog"></use>
                            </svg>
                            <span>Faqs Categories</span>
                        </a>
                        <ul className="sidebar-submenu">
                            <li><a href="">Faqs Categories List</a></li>
                            <li><a href="">Add Faqs Categories</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
            <div className="right-arrow" id="right-arrow">
                <i data-feather="arrow-right"></i>
            </div>
        </nav>
    </div>
</div>

  )
}

export default Sidebar;