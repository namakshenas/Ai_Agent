import { Link } from 'react-router-dom';

function Nav(){
    return
    return(
        <nav>
            <ul>
            <li><Link to="/">
              {/*<svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2.69L15 7.19V15H13V9H7V15H5V7.19L10 2.69ZM10 0L0 9H3V17H9V11H11V17H17V9H20L10 0Z" fill="#000000aa"/>
              </svg>*/}
              <span>Home</span>
            </Link></li>
          </ul>
          <ul>
            <li><Link to="/">Login</Link></li>
          </ul>
          <ul>
            <li><Link to="/">Chat</Link></li>
          </ul>
          <ul>
            <li><Link to="/">Presets</Link></li>
          </ul>
          <ul>
            <li><Link to="/">Options</Link></li>
          </ul>
          <ul>
            <li><Link to="/">My Github</Link></li>
          </ul>
        </nav>
    )
}

export default Nav