import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside>
      <h3>Patient Management</h3>

      <nav>
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>

          <li>
            <Link to="/patients/register">Register Patient</Link>
          </li>

          <li>
            <Link to="/patients">All Patients</Link>
          </li>

          <li>
            <Link to="/patients/search">Patient Search</Link>
          </li>

          <li>
            <Link to="/profile">My Profile</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;