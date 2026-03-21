import { Rss } from 'lucide-react';
import geminiImage from '@/assets/Gemini_Generated_Image_fo3xrjfo3xrjfo3x.png';

interface FeedHeroProps {
    username?: string;
}

const FeedHero = ({ username }: FeedHeroProps) => {
    return (
        <div className="w-full relative pt-24 pb-8 sm:pt-32 sm:pb-12 lg:min-h-[380px] flex items-center overflow-hidden transition-all duration-500">
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
                <div className="flex items-center gap-2 mb-2 animate-fade-in">
                    <Rss className="w-4 h-4 text-primary" />
                    <span className="text-[11px] font-bold text-primary uppercase tracking-[0.1em]">Global Feed</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-3 animate-slide-up">
                    Namaste, <span className="text-primary">{username || 'Community'}</span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground max-w-sm sm:max-w-md animate-slide-up animation-delay-100 italic font-medium leading-relaxed">
                    Real stories and direct help requests from people across the country.
                </p>
            </div>
        </div>
    );
};

export default FeedHero;
