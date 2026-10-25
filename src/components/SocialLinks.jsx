import React from 'react';

export function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

export function TikTokIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  );
}

export const SOCIAL_LINKS = {
  instagram: {
    name: 'Instagram',
    handle: '@unilag_svg30',
    url: 'https://www.instagram.com/unilag_svg30',
  },
  tiktok: {
    name: 'TikTok',
    handle: '@unilag_svg30',
    url: 'https://www.tiktok.com/@unilag_svg30',
  }
};

export function ModalSocials() {
  return (
    <div className="pt-3 border-t border-stone-800/80 space-y-3">
      <div className="space-y-1 text-center">
        <p className="text-xs font-bold text-stone-200">
          Follow us on our socials
        </p>
        <p className="text-[11px] text-stone-400">
          Stay connected for class updates, announcements and birthday spotlights!
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <a
          href={SOCIAL_LINKS.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center space-x-2.5 p-2.5 rounded-xl bg-stone-950/80 hover:bg-stone-800/90 border border-stone-800 hover:border-pink-500/50 transition-all text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <InstagramIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-stone-200 group-hover:text-white transition-colors truncate">
              Instagram
            </div>
            <div className="text-[10px] text-stone-400 truncate font-mono">
              {SOCIAL_LINKS.instagram.handle}
            </div>
          </div>
        </a>

        <a
          href={SOCIAL_LINKS.tiktok.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center space-x-2.5 p-2.5 rounded-xl bg-stone-950/80 hover:bg-stone-800/90 border border-stone-800 hover:border-cyan-500/50 transition-all text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-white flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <TikTokIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-stone-200 group-hover:text-white transition-colors truncate">
              TikTok
            </div>
            <div className="text-[10px] text-stone-400 truncate font-mono">
              {SOCIAL_LINKS.tiktok.handle}
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}

export function FooterSocials() {
  return (
    <div className="flex flex-col items-center space-y-2 mb-3">
      <span className="text-[11px] font-semibold tracking-wide uppercase text-stone-400">
        Follow Us on Socials
      </span>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <a
          href={SOCIAL_LINKS.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-pink-500/40 text-stone-300 hover:text-white transition-all text-xs font-medium"
        >
          <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
          <span>Instagram</span>
          <span className="text-[11px] text-stone-500 font-mono">(@unilag_svg30)</span>
        </a>

        <a
          href={SOCIAL_LINKS.tiktok.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-cyan-500/40 text-stone-300 hover:text-white transition-all text-xs font-medium"
        >
          <TikTokIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>TikTok</span>
          <span className="text-[11px] text-stone-500 font-mono">(@unilag_svg30)</span>
        </a>
      </div>
    </div>
  );
}
