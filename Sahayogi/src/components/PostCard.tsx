import { CheckCircle2, MapPin, Clock, ArrowRight, Heart, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import PostInteractions from './PostInteractions';

interface PostCardProps {
    post: {
        id: string;
        title: string;
        description: string;
        location: string | null;
        created_at: string;
        images: string[];
        intent?: string;
        help_type?: string;
        status?: string;
        categories: { name: string } | null;
        profiles: { username: string } | null;
    };
}

const PostCard = ({ post }: PostCardProps) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const isGiving = post.intent === 'OFFER_HELP' || post.help_type === 'offering' || post.help_type === 'giving';

    // Simulate a progress % for giving posts (would come from API in real app)
    const progress = isGiving ? Math.floor(30 + Math.random() * 60) : null;

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / 86400000);
        if (days < 1) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 30) return `${days}d ago`;
        return new Date(dateStr).toLocaleDateString('en-NP', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="group spotlight-card overflow-hidden w-full">
            {/* Clickable area - image + content */}
            <Link to={`/post/${post.id}`} className="flex flex-col sm:flex-row">
                {/* IMAGE */}
                <div className="w-full sm:w-36 relative overflow-hidden shrink-0 bg-muted" style={{ aspectRatio: '4/3' }}>
                    {post.images && post.images.length > 0 ? (
                        <>
                            {/* Skeleton */}
                            {!imgLoaded && <div className="absolute inset-0 skeleton-shimmer" />}
                            <img
                                src={post.images[0]}
                                alt={post.title}
                                onLoad={() => setImgLoaded(true)}
                                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                                loading="lazy"
                            />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/4">
                            <Heart className="w-7 h-7 text-primary/20" />
                        </div>
                    )}

                    {/* Giving / Needs badge */}
                    <div className="absolute top-2 left-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold shadow-sm border-opacity-10 ${isGiving ? 'bg-primary text-white' : 'bg-amber-500 text-white'}`}>
                            {isGiving ? 'Giving' : 'Needs help'}
                        </span>
                    </div>

                    {/* Status pill */}
                    {post.status && post.status !== 'available' && (
                        <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium bg-foreground/60 text-white backdrop-blur-sm">
                                {post.status}
                            </span>
                        </div>
                    )}
                </div>

                {/* CONTENT */}
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                    {/* TOP LAYER: meta info */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-semibold text-foreground/70">
                                    @{post.profiles?.username || 'anonymous'}
                                </span>
                                {post.location && (
                                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                        <MapPin className="w-2.5 h-2.5 text-primary/50" />
                                        {post.location}
                                    </span>
                                )}
                                {/* Verified badge */}
                                <span className="verified-dot">
                                    <CheckCircle2 className="w-2.5 h-2.5" />Verified
                                </span>
                            </div>
                            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground shrink-0">
                                <Clock className="w-2.5 h-2.5" />
                                {timeAgo(post.created_at)}
                            </span>
                        </div>

                        {/* MIDDLE LAYER: title + summary */}
                        <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors mb-1 line-clamp-2">
                            {post.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                            {post.description}
                        </p>
                    </div>

                    {/* BOTTOM LAYER: tags + progress + CTA */}
                    <div className="mt-3 pt-2.5 border-t border-border/50 space-y-2">
                        {/* Progress bar (for giving posts) */}
                        {isGiving && progress !== null && (
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-muted-foreground">Interest level</span>
                                    <span className="text-[10px] font-semibold text-primary">{progress}%</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                                {post.categories && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/6 text-primary text-[10px] font-medium border border-primary/10 truncate max-w-[120px]">
                                        <Tag className="w-2.5 h-2.5 shrink-0" />
                                        <span className="truncate">{post.categories.name}</span>
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-primary group-hover:gap-1.5 transition-all shrink-0">
                                View post <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Interaction bar - outside the Link so clicks don't navigate */}
            <PostInteractions postId={post.id} />
        </div>
    );
};

export default PostCard;
