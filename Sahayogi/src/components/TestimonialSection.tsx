import { useState, useEffect } from 'react';

// Assets
import sujitImg from '@/assets/Sujit.jpg';
import sameerImg from '@/assets/sameer.png';
import prakritiImg from '@/assets/prakriti.jpg';
import supriyaImg from '@/assets/Supriya.jpg';
import ujjwalImg from '@/assets/Ujjwal.jpg';
import pritamImg from '@/assets/pritam.jpg';
import nischalImg from '@/assets/nischal.png';
import riwajImg from '@/assets/riwaj.png';

const testimonials = [
    {
        quote: 'वरपर कसैलाई विद्यालयका लागि पुस्तकहरू चाहिएको थियो। केही घण्टामै समुदायले प्रतिक्रिया दियो।',
        name: 'Sujit Shaha',
        city: 'Kathmandu',
        photo: sujitImg,
    },
    {
        quote: 'मैले एक्लै समाधान गर्न नसकेको कुरा, सहयोगीले हामीलाई सँगै मिलेर समाधान गर्न मद्दत गर्यो।',
        name: 'Sameer Jung Thapa',
        city: 'Pokhara',
        photo: sameerImg,
    },
    {
        quote: 'A small post turned into real support from real people around me.',
        name: 'Prakriti Dahal',
        city: 'Lalitpur',
        photo: prakritiImg,
    },
    {
        quote: 'Helping strangers no longer feels distant. It feels local and real.',
        name: 'Supriya Kc',
        city: 'Bhaktapur',
        photo: supriyaImg,
    },
    {
        quote: 'आपतकालीन अवस्थामा मैले २० मिनेटभित्रै प्रमाणित अक्सिजन सिलिन्डर दाता फेला पारेँ।',
        name: 'Ujjwal Rupakheti',
        city: 'Dharan',
        photo: ujjwalImg,
    },
    {
        quote: 'मलाई थाहा थिएन कसरी सोध्नु पर्छ। Sahayogi ले गाह्रो बनाएन।',
        name: 'Pritam Rai',
        city: 'Illam',
        photo: pritamImg,
    },
];

// All 8 people for the floating avatar grid
const allAvatars = [
    sujitImg, sameerImg, prakritiImg, supriyaImg,
    ujjwalImg, pritamImg, nischalImg, riwajImg,
];

// Positions: 4 left side, 4 right side - precise layout matching reference
const leftAvatars = [
    { img: sujitImg, size: 72, x: '5%', y: '12%', delay: 0 },
    { img: sameerImg, size: 56, x: '14%', y: '38%', delay: 1.2 },
    { img: prakritiImg, size: 64, x: '8%', y: '62%', delay: 2.4 },
    { img: nischalImg, size: 48, x: '20%', y: '80%', delay: 0.6 },
];

const rightAvatars = [
    { img: supriyaImg, size: 64, x: '78%', y: '10%', delay: 1.8 },
    { img: ujjwalImg, size: 72, x: '86%', y: '36%', delay: 0.4 },
    { img: pritamImg, size: 56, x: '80%', y: '62%', delay: 2.1 },
    { img: riwajImg, size: 48, x: '72%', y: '82%', delay: 1.4 },
];

const CHANGE_INTERVAL = 5500;

const TestimonialSection = () => {
    const [current, setCurrent] = useState(0);
    const [fading, setFading] = useState(false);

    const goTo = (idx: number) => {
        if (idx === current || fading) return;
        setFading(true);
        setTimeout(() => {
            setCurrent(idx);
            setFading(false);
        }, 400);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setFading(true);
            setTimeout(() => {
                setCurrent((prev) => (prev + 1) % testimonials.length);
                setFading(false);
            }, 400);
        }, CHANGE_INTERVAL);
        return () => clearInterval(timer);
    }, []);

    const t = testimonials[current];

    return (
        <section
            className="relative overflow-hidden min-h-[500px] lg:min-h-[700px] flex items-center justify-center"
            style={{
                background: 'linear-gradient(160deg, #fdfaf6 0%, #fef9f2 60%, #fdf6ee 100%)',
            }}
        >
            {/* Subtle vertical guide lines */}
            <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
                {[15, 30, 50, 70, 85].map((left) => (
                    <div
                        key={left}
                        className="absolute top-0 bottom-0 w-px"
                        style={{ left: `${left}%`, background: '#b22826' }}
                    />
                ))}
            </div>

            {/* Floating Avatars - desktop only */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none">
                {[...leftAvatars, ...rightAvatars].map((ava, i) => (
                    <div
                        key={i}
                        className="absolute overflow-hidden border-2 border-white"
                        style={{
                            left: ava.x,
                            top: ava.y,
                            width: ava.size,
                            height: ava.size,
                            borderRadius: '18px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                            animation: `floatAvatar ${3.5 + (i % 3) * 0.7}s ease-in-out infinite alternate`,
                            animationDelay: `${ava.delay}s`,
                            opacity: 0.6,
                        }}
                    >
                        <img src={ava.img} alt="" className="w-full h-full object-contain" />
                    </div>
                ))}
            </div>


            {/* Center content block */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 sm:px-6 py-12 lg:py-24">
                {/* Mobile: avatar row - centered above content */}
                <div className="flex lg:hidden items-center justify-center mb-6">
                    <div className="flex gap-2 sm:gap-3">
                        {allAvatars.slice(0, 4).map((img, i) => (
                            <div
                                key={i}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md"
                                style={{ opacity: 0.85 }}
                            >
                                <img src={img} alt="Community member" className="w-full h-full object-contain" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Badge */}
                <div
                    className="inline-flex items-center gap-2 mb-6"
                    style={{
                        background: 'rgba(178, 40, 38, 0.07)',
                        border: '1px solid rgba(178, 40, 38, 0.18)',
                        borderRadius: '999px',
                        padding: '6px 18px',
                    }}
                >
                    <span
                        style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: '#b22826',
                        }}
                    >
                        Testimonials
                    </span>
                </div>

                {/* Main heading */}
                <h2
                    className="text-center font-black leading-tight mb-5"
                    style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        color: '#1a1210',
                        letterSpacing: '-0.03em',
                        maxWidth: '600px',
                    }}
                >
                    नेपालभरिका विभिन्न
                    <br />
                    <span style={{ color: '#b22826' }}>समुदायको विश्वास</span>
                </h2>

                {/* Supporting text */}
                <p
                    className="text-center mb-10"
                    style={{
                        color: '#7a6a65',
                        fontSize: '1rem',
                        lineHeight: 1.65,
                        maxWidth: '420px',
                        fontWeight: 450,
                    }}
                >
                    प्रमाणित अनुरोधहरू, साझा स्रोतहरू, र सामुदायिक विश्वासको माध्यमबाट एकअर्कालाई मद्दत गर्ने वास्तविक मानिसहरू।
                </p>

                {/* Testimonial card */}
                <div
                    className="relative w-full transition-all duration-400"
                    style={{ maxWidth: '560px' }}
                >
                    <div
                        style={{
                            opacity: fading ? 0 : 1,
                            transform: fading ? 'translateY(8px)' : 'translateY(0)',
                            transition: 'opacity 0.4s ease, transform 0.4s ease',
                        }}
                    >
                        {/* Avatar */}
                        <div className="flex justify-center mb-5">
                            <div
                                className="overflow-hidden border-4 border-white"
                                style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '20px',
                                    boxShadow: '0 8px 28px rgba(0,0,0,0.13)',
                                }}
                            >
                                <img src={t.photo} alt={t.name} className="w-full h-full object-contain" />
                            </div>
                        </div>

                        {/* Quote */}
                        <blockquote
                            className="text-center px-2 sm:px-0"
                            style={{
                                fontSize: 'clamp(1.1rem, 5vw, 1.45rem)',
                                color: '#1a1210',
                                lineHeight: 1.55,
                                fontStyle: 'italic',
                                fontWeight: 500,
                                letterSpacing: '-0.01em',
                                marginBottom: '20px',
                            }}
                        >
                            "{t.quote}"
                        </blockquote>

                        {/* Name + city */}
                        <div className="flex flex-col items-center gap-1">
                            <span
                                style={{
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    color: '#1a1210',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                {t.name}
                            </span>
                            <span
                                style={{
                                    fontSize: '0.78rem',
                                    color: '#b22826',
                                    fontWeight: 600,
                                    letterSpacing: '0.06em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {t.city}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Dots */}
                <div className="flex items-center gap-2 mt-8">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => goTo(i)}
                            style={{
                                width: i === current ? 28 : 7,
                                height: 7,
                                borderRadius: '999px',
                                background: i === current ? '#b22826' : 'rgba(178,40,38,0.18)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.4s ease',
                                padding: 0,
                            }}
                        />
                    ))}
                </div>

                {/* CTA */}
                <a
                    href="/feed"
                    className="mt-10 inline-flex items-center gap-2 transition-all"
                    style={{
                        background: '#1a1210',
                        color: '#fff',
                        borderRadius: '999px',
                        padding: '12px 28px',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textDecoration: 'none',
                        boxShadow: '0 4px 20px rgba(26,18,16,0.13)',
                        transition: 'background 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = '#b22826';
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 24px rgba(178,40,38,0.22)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background = '#1a1210';
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(26,18,16,0.13)';
                    }}
                >
                    Read Community Stories →
                </a>
            </div>

            <style>{`
                @keyframes floatAvatar {
                    0%   { transform: translateY(0px); }
                    100% { transform: translateY(-14px); }
                }
            `}</style>
        </section>
    );
};

export default TestimonialSection;
