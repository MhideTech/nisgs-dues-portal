import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Share2, Check, Sparkles, RefreshCw, MessageCircle, Copy } from 'lucide-react';

export default function BirthdayCardModal({ student, onClose }) {
  const canvasRef = useRef(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [copiedFlyerWish, setCopiedFlyerWish] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [activeTab, setActiveTab] = useState('flyer'); // 'flyer' or 'caption'

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = months[student.dob_month - 1] || '';
  const birthdayDate = `${monthName} ${student.dob_day}`;
  const firstName = student.full_name.split(' ')[0] || student.full_name;
  const nameCall = student.nickname ? student.nickname : firstName;

  // Flyer quotes
  const defaultWishes = [
    "May your coordinates always lead to prosperity and your benchmarks remain steadfast. Wishing you elevation and boundless breakthroughs!",
    "Happy Birthday Geomatician! May your life continue to map out greatness, joy, and stellar achievements across every terrain.",
    "On your special day, we celebrate you. May all your contours ascend to greater heights this year!",
    "Wishing you precision in all your azimuths and pure happiness in everything you do. Have a sensational celebration!"
  ];

  const [selectedWish, setSelectedWish] = useState(defaultWishes[0]);

  // Generate human-written, Nigerian university student style birthday captions
  const generateCaptions = () => {
    const rawInterests = (student.interests || '').toLowerCase();
    
    // Detect interest keywords
    let interestNote = '';
    if (rawInterests.includes('drone') || rawInterests.includes('uav')) {
      interestNote = 'Our very own drone pilot and aerial commander 🚁✨ May your altitude keep climbing with zero turbulence!';
    } else if (rawInterests.includes('gis') || rawInterests.includes('mapping') || rawInterests.includes('remote sensing')) {
      interestNote = 'The spatial data & GIS guru himself 🗺️📍 May your paths always be mapped with favor and heavy wins!';
    } else if (rawInterests.includes('football') || rawInterests.includes('fifa') || rawInterests.includes('ball')) {
      interestNote = 'Baller on and off the field ⚽️🔥 May all your shots hit the target this new year!';
    } else if (rawInterests.includes('code') || rawInterests.includes('python') || rawInterests.includes('tech') || rawInterests.includes('crypto')) {
      interestNote = 'Tech bro of our set 💻🚀 Big alerts, successful trades, and zero bugs in your life!';
    } else if (rawInterests.includes('photo') || rawInterests.includes('design') || rawInterests.includes('graphic')) {
      interestNote = 'Creative powerhouse with the sharp eye 🎨📸 Keep creating magic and winning big!';
    } else if (student.interests) {
      interestNote = `Big shoutout to our resident ${student.interests.split(',')[0]} specialist 🙌 May your hustle keep paying off!`;
    }

    return [
      {
        title: "🔥 Hype / WhatsApp Status",
        text: `Big birthday energy for my guy ${nameCall}! 🎂🍾 One of the realest and coolest in Class of 2030. ${interestNote ? interestNote + ' ' : ''}May this new age open massive doors, bring peace of mind, and flood your account with back-to-back alerts! 💸📈 Drop aza make we do transfer sharp sharp! 🥂✨ Enjoy your day bro!`
      },
      {
        title: "🌍 World Day / Banter Style",
        text: `World ${nameCall} Day! 🌍🎉 Today na your day, no cap! Happy birthday to a solid geomatician and an amazing coursemate. May your GPA stay up, your stress levels stay at zero, and your year be filled with soft life and celebration! 🥳🍻 More life and more blessings champ!`
      },
      {
        title: "💫 Heartfelt & Class Love",
        text: `Happy Birthday ${student.full_name} ${student.nickname ? `("${student.nickname}")` : ''}! 🎉✨ So glad to have you in our class. Wishing you a year packed with great memories, divine favor, and academic distinction. 📚🌟 Keep being your awesome self and have a wonderful celebration today! 🍰🎈`
      },
      {
        title: "⚡️ Short & Sharp Status",
        text: `Happy birthday ${nameCall}! 🥂🍾 More life, more grace, good health, and abundant blessings. Enjoy your day to the maximum! 🎉🎂`
      }
    ];
  };

  const captions = generateCaptions();
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(0);

  const drawCard = () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 1080 x 1350 (4:5 vertical flyer for WhatsApp Status & Instagram)
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/nisgs-logo.png';

    const photoImg = new Image();
    photoImg.crossOrigin = 'anonymous';
    photoImg.src = student.photo_url.startsWith('http') 
      ? student.photo_url 
      : `${window.location.origin}${student.photo_url}`;

    let loadedCount = 0;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= 2) {
        renderGraphics();
      }
    };

    logoImg.onload = checkAllLoaded;
    logoImg.onerror = () => checkAllLoaded();

    photoImg.onload = checkAllLoaded;
    photoImg.onerror = () => checkAllLoaded();

    const renderGraphics = () => {
      // 1. Deep Obsidian / Survey Forest Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#06130D');
      bgGrad.addColorStop(0.5, '#0A1E15');
      bgGrad.addColorStop(1, '#040B07');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Subtle Cartographic Grid lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Outer gold/emerald perimeter border
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, W - 72, H - 72);

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1;
      ctx.strokeRect(46, 46, W - 92, H - 92);

      // Coordinate corner marks
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(30, 60); ctx.lineTo(30, 30); ctx.lineTo(60, 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W - 60, 30); ctx.lineTo(W - 30, 30); ctx.lineTo(W - 30, 60); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(30, H - 60); ctx.lineTo(30, H - 30); ctx.lineTo(60, H - 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W - 60, H - 30); ctx.lineTo(W - 30, H - 30); ctx.lineTo(W - 30, H - 60); ctx.stroke();

      // 3. NISGS Logo at the top
      try {
        if (logoImg.complete && logoImg.naturalWidth > 0) {
          const logoSize = 125;
          ctx.drawImage(logoImg, (W - logoSize) / 2, 70, logoSize, logoSize);
        }
      } catch (e) {
        console.error(e);
      }

      // 4. Header Titles (Class of 2030 focus)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('CLASS OF 2030', W / 2, 230);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SURVEYING & GEOINFORMATICS', W / 2, 260);

      // "HAPPY BIRTHDAY"
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 58px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('HAPPY BIRTHDAY', W / 2, 330);

      ctx.fillStyle = '#34D399';
      ctx.font = '700 28px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '4px';
      ctx.fillText('• GEOMATICIAN OF THE DAY •', W / 2, 370);

      // 5. Central Student Photograph inside circular surveyor reticle
      const photoCenterX = W / 2;
      const photoCenterY = 585;
      const radius = 175;

      // Glow behind circle
      const radGrad = ctx.createRadialGradient(photoCenterX, photoCenterY, radius - 10, photoCenterX, photoCenterY, radius + 40);
      radGrad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
      radGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(photoCenterX, photoCenterY, radius + 40, 0, Math.PI * 2);
      ctx.fill();

      // Outer surveying ring
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(photoCenterX, photoCenterY, radius + 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(photoCenterX, photoCenterY, radius + 6, 0, Math.PI * 2);
      ctx.stroke();

      // Clip and draw photo
      ctx.save();
      ctx.beginPath();
      ctx.arc(photoCenterX, photoCenterY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (photoImg.complete && photoImg.naturalWidth > 0) {
        const iw = photoImg.naturalWidth;
        const ih = photoImg.naturalHeight;
        const sSize = Math.min(iw, ih);
        const sx = (iw - sSize) / 2;
        const sy = (ih - sSize) / 2;
        ctx.drawImage(photoImg, sx, sy, sSize, sSize, photoCenterX - radius, photoCenterY - radius, radius * 2, radius * 2);
      } else {
        ctx.fillStyle = '#1F2937';
        ctx.fillRect(photoCenterX - radius, photoCenterY - radius, radius * 2, radius * 2);
        ctx.fillStyle = '#9CA3AF';
        ctx.font = 'bold 60px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(student.full_name.charAt(0), photoCenterX, photoCenterY + 20);
      }
      ctx.restore();

      // 6. Student Name & Alias
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 44px "Plus Jakarta Sans", sans-serif';
      let displayName = student.full_name;
      if (displayName.length > 28) {
        displayName = displayName.substring(0, 26) + '...';
      }
      ctx.fillText(displayName, W / 2, 820);

      if (student.nickname) {
        ctx.fillStyle = '#34D399';
        ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`"${student.nickname}"`, W / 2, 862);
      }

      // Birthday Date Badge
      const badgeY = student.nickname ? 910 : 880;
      ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
      const badgeWidth = 340;
      const badgeHeight = 44;
      ctx.roundRect((W - badgeWidth) / 2, badgeY - 30, badgeWidth, badgeHeight, 22);
      ctx.fill();
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#E5E7EB';
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(birthdayDate.toUpperCase(), W / 2, badgeY - 2);

      // 7. Wish Message Box
      const wishY = badgeY + 65;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.roundRect(100, wishY, W - 200, 160, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#D1D5DB';
      ctx.font = 'italic 500 23px "Plus Jakarta Sans", sans-serif';
      wrapText(ctx, `"${selectedWish}"`, W / 2, wishY + 50, W - 260, 36);

      // 8. Footer signature
      ctx.fillStyle = '#10B981';
      ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('FROM: CLASS OF 2030 • SURVEYING & GEOINFORMATICS', W / 2, H - 70);

      const dataUrl = canvas.toDataURL('image/png');
      setDownloadUrl(dataUrl);
      setIsGenerating(false);
    };

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      let testY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, testY);
          line = words[n] + ' ';
          testY += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, testY);
    }
  };

  useEffect(() => {
    drawCard();
  }, [student, selectedWish]);

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captions[selectedCaptionIndex].text);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-emerald-900/60 rounded-2xl shadow-2xl p-4 sm:p-6 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-950 border border-emerald-700/60 rounded-lg text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Birthday Celebration & Captions</h3>
              <p className="text-xs text-stone-400">{student.full_name} {student.nickname ? `("${student.nickname}")` : ''}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex space-x-2 mt-4 border-b border-stone-800 pb-2">
          <button
            onClick={() => setActiveTab('flyer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'flyer'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            🎨 Birthday Flyer
          </button>
          <button
            onClick={() => setActiveTab('caption')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'caption'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>💬 Human-Written Captions</span>
          </button>
        </div>

        {/* Tab 1: Flyer Canvas */}
        {activeTab === 'flyer' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-4 items-start">
            <div className="md:col-span-6 flex flex-col items-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-[4/5] rounded-xl overflow-hidden shadow-2xl border border-stone-700 bg-stone-950 flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
                {isGenerating && (
                  <div className="absolute inset-0 bg-stone-950/70 flex flex-col items-center justify-center space-y-2">
                    <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                    <span className="text-xs text-stone-300">Rendering...</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-stone-500 mt-2 text-center">
                1080×1350px high-res for WhatsApp Status & Instagram
              </p>
            </div>

            <div className="md:col-span-6 flex flex-col space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1.5">
                  Select Quote for Flyer
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {defaultWishes.map((w, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedWish(w)}
                      className={`w-full text-left p-2 rounded-lg text-xs leading-relaxed transition-all border ${
                        selectedWish === w
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100'
                          : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      "{w}"
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 space-y-2">
                <a
                  href={downloadUrl || '#'}
                  download={`Class2030-Birthday-${student.full_name.replace(/\s+/g, '_')}.png`}
                  className={`w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-md ${
                    !downloadUrl ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <Download className="w-4 h-4" />
                  <span>Download Flyer (PNG)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setActiveTab('caption')}
                  className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-semibold text-xs text-stone-300 bg-stone-800 hover:bg-stone-700 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>View Specialized WhatsApp Captions</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Specialized Human-Written Birthday Captions */}
        {activeTab === 'caption' && (
          <div className="mt-4 space-y-4">
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-3.5 space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Personalized Details Detected:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-200">
                  Name: <strong>{student.full_name}</strong>
                </span>
                {student.nickname && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300">
                    Nickname: <strong>{student.nickname}</strong>
                  </span>
                )}
                {student.interests && (
                  <span className="px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300">
                    Interests: <em>{student.interests}</em>
                  </span>
                )}
              </div>
            </div>

            {/* Caption Style Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {captions.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedCaptionIndex(idx)}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                    selectedCaptionIndex === idx
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200 shadow-sm'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>

            {/* Caption Display Box */}
            <div className="bg-stone-950 border border-emerald-900/50 rounded-xl p-4 sm:p-5 relative">
              <p className="text-xs sm:text-sm text-stone-200 leading-relaxed whitespace-pre-line font-normal">
                {captions[selectedCaptionIndex].text}
              </p>
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyCaption}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-400 hover:bg-emerald-300 text-emerald-950 flex items-center justify-center space-x-2 transition-colors shadow-md"
            >
              {copiedCaption ? (
                <>
                  <Check className="w-4 h-4 text-emerald-950" />
                  <span>Copied Caption to Clipboard! Paste on WhatsApp Status 🚀</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Caption with Emojis</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
