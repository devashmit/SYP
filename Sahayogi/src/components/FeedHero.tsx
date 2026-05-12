import { Rss } from 'lucide-react';
import geminiImage from '@/assets/Pashupati.png';

interface FeedHeroProps {
    username?: string;
}

const FeedHero = ({ username }: FeedHeroProps) => {
    return (
        <div className="w-full relative pt-20 pb-6 sm:pt-24 sm:pb-8 lg:min-h-[320px] flex items-center overflow-hidden transition-all duration-500">
            {/* Background Base */}
            <div className="absolute inset-0 bg-primary/5" />

            {/* Cultural Image - Responsive Handling */}
            <div className="absolute inset-y-0 right-0 w-full sm:w-[60%] lg:w-[500px] xl:w-[650px] opacity-[0.3] pointer-events-none animate-fade-in select-none" style={{ transition: "all 700ms" }}>
                <div className="h-full w-full">
                    <img
                        src={geminiImage}
                        alt="Cultural Heritage"
                        className="w-full h-full object-cover lg:object-cover sm:object-cover rounded-none sm:rounded-l-[3rem]"
                        style={{
                            maskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to left, black 50%, transparent 100%)',
                            objectPosition: 'center 38%'
                        }}
                    />
                </div>
            </div>

            <div className="container mx-auto px-5 max-w-5xl relative z-10">
                <div className="flex items-center gap-2 mb-3 animate-fade-in group cursor-default">
                    <Rss className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] bg-primary/5 px-2 py-0.5 rounded-full">Global Feed</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tighter text-foreground mb-4 animate-slide-up leading-[1.1]">
                    Namaste, <span className="gradient-text">{username || 'Community'}</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-sm sm:max-w-md lg:max-w-lg animate-slide-up animation-delay-100 font-medium leading-relaxed border-l-2 border-primary/20 pl-4">
                    Real stories and <span className="text-primary/80 italic font-serif">direct help requests</span> from people across the country.
                </p>
            </div>
        </div>
    );
};

export default FeedHero;
