import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const AppShell = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            {/* 
        The Navbar is fixed, so we need top padding on the main content area.
        We use pt-24 (6rem) for mobile and pt-28 (7rem) for md+ to give the navbar room to breathe. 
        Note this padding happens BEFORE the page content.
      */}
            <main className="flex-1 pt-20 flex flex-col">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default AppShell;
