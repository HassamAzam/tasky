'use client';

import Link from "next/link";

interface NavbarProps {
  loggedInUser: string | null|undefined;
  handleLogout: () => void;
}

const Navbar = ({ loggedInUser, handleLogout }: NavbarProps) => {
  return (
    <div className="flex justify-between items-center w-full bg-[#1a1a1a] p-4 h-[50px]">
      <h6 className="text-white text-lg">Tasky</h6>
      <div className="flex items-center space-x-4">
        <p className="text-white">{loggedInUser}</p>
        <button
          onClick={handleLogout}
          className="bg-[#ff4081] text-white px-4 py-2 rounded"
          title="Click to logout"
        >
          <Link href="/login" style={{ textDecoration: "none" }}>
            Logout
          </Link>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
