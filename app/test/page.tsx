import ReboundNavbar from '@/components/ReboundNavbar';

export default function TestPage() {
    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            <ReboundNavbar />
            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] mt-20">
                <h1 className="text-4xl font-semibold text-white/80">Rebound Navbar Test Page</h1>
            </div>
        </div>
    );
}
