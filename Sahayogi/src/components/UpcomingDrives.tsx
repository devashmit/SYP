import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const INITIAL_DRIVES = [
    { id: '1', title: 'Clothes Drive - Kathmandu', date: 'Falgun 15', org: 'Sahayogi Volunteers', spots: 34 },
    { id: '2', title: 'Food Distribution - Sindhupalchok', date: 'Falgun 18', org: 'Local NGO Collective', spots: 12 },
    { id: '3', title: 'School Kit Collection - Pokhara', date: 'Falgun 22', org: 'Kids First Nepal', spots: 50 },
    { id: '4', title: 'Free Health Camp - Chitwan', date: 'Chaitra 2', org: 'Medical Volunteers', spots: 25 },
    { id: '5', title: 'Blood Donation - Lalitpur', date: 'Chaitra 5', org: 'Red Cross Society', spots: 100 },
    { id: '6', title: 'Blanket Distribution - Jumla', date: 'Chaitra 10', org: 'Himalayan Relief Fund', spots: 15 },
];

export const UpcomingDrives = ({ compact = false }: { compact?: boolean }) => {
    const { authStatus } = useAuth();
    const navigate = useNavigate();
    const [drives, setDrives] = useState(INITIAL_DRIVES);
    const [joinedDrives, setJoinedDrives] = useState<Record<string, boolean>>({});
    const [joining, setJoining] = useState<string | null>(null);

    const displayDrives = compact ? drives.slice(0, 3) : drives;

    const handleJoin = async (driveId: string) => {
        if (authStatus !== 'authenticated') {
            toast.error('Please sign in to join a drive.');
            navigate('/auth/login');
            return;
        }

        if (joinedDrives[driveId]) return;

        setJoining(driveId);

        // Simulate API call for real-time interaction
        await new Promise((resolve) => setTimeout(resolve, 800));

        setDrives((prev) =>
            prev.map((d) => (d.id === driveId ? { ...d, spots: d.spots - 1 } : d))
        );
        setJoinedDrives((prev) => ({ ...prev, [driveId]: true }));
        setJoining(null);
        toast.success('Successfully reserved your spot!');
    };

    return (
        <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-1 block">Around Nepal</span>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Upcoming drives</h2>
                </div>
                {compact && (
                    <Link to="/feed" className="text-xs font-medium text-primary flex items-center gap-1 hover:gap-2 transition-all">
                        View all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                )}
            </div>
            <div className={`grid gap-3 ${compact ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                {displayDrives.map((drive) => {
                    const isJoined = joinedDrives[drive.id];
                    const isJoining = joining === drive.id;

                    return (
                        <div key={drive.id} className="bg-white border border-border rounded-2xl p-4 hover:border-primary/20 hover:shadow-sm border-opacity-10 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between mb-3">
                                    <span className="chip bg-muted text-muted-foreground">{drive.date}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${drive.spots > 20 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {drive.spots === 0 ? 'Full' : `${drive.spots} spots`}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-foreground mb-1 line-clamp-1">{drive.title}</p>
                                <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground mb-4">
                                    <Users className="w-3 h-3 text-primary/60" />
                                    {drive.org}
                                </p>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handleJoin(drive.id)}
                                disabled={isJoined || isJoining || drive.spots === 0}
                                className={`w-full h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${isJoined
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                                        : isJoining
                                            ? 'bg-muted text-muted-foreground cursor-wait'
                                            : drive.spots === 0
                                                ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                                                : 'bg-primary/10 text-primary hover:bg-primary/20 hover:scale-[1.02]'
                                    }`}
                            >
                                {isJoined ? (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Spot reserved
                                    </>
                                ) : isJoining ? (
                                    'Reserving...'
                                ) : drive.spots === 0 ? (
                                    'No spots left'
                                ) : (
                                    'Join Drive'
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
