import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    label?: string;
    className?: string;
}

export const BackButton = ({ label = 'Back', className = '' }: BackButtonProps) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className={`group inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 ${className}`}
            style={{
                color: '#7a6a65',
                background: 'transparent',
                border: '1px solid rgba(122, 106, 101, 0.2)',
                borderRadius: '999px',
                padding: '7px 16px',
                cursor: 'pointer',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#b22826';
                (e.currentTarget as HTMLButtonElement).style.color = '#b22826';
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(178,40,38,0.05)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(122, 106, 101, 0.2)';
                (e.currentTarget as HTMLButtonElement).style.color = '#7a6a65';
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
        >
            <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
            {label}
        </button>
    );
};

export default BackButton;
