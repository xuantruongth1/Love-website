const HEARTS = [
  { left: '1%',  size: 28, dur: 20, delay: -10, color: '#FF6B9D' },
  { left: '3%',  size: 20, dur: 25, delay: -18, color: '#FFB3C6' },
  { left: '6%',  size: 36, dur: 17, delay: -6,  color: '#FF3366' },
  { left: '9%',  size: 24, dur: 22, delay: -14, color: '#FF6B9D' },
  { left: '12%', size: 32, dur: 18, delay: -4,  color: '#FFB3C6' },
  { left: '15%', size: 22, dur: 23, delay: -20, color: '#FF6B9D' },
  { left: '18%', size: 38, dur: 16, delay: -8,  color: '#FF3366' },
  { left: '21%', size: 26, dur: 21, delay: -16, color: '#FF6B9D' },
  { left: '24%', size: 30, dur: 19, delay: -3,  color: '#FFB3C6' },
  { left: '27%', size: 20, dur: 26, delay: -22, color: '#FF6B9D' },
  { left: '30%', size: 34, dur: 24, delay: -11, color: '#FFB3C6' },
  { left: '33%', size: 24, dur: 15, delay: -7,  color: '#FF3366' },
  { left: '36%', size: 40, dur: 20, delay: -17, color: '#FF6B9D' },
  { left: '39%', size: 22, dur: 22, delay: -2,  color: '#FF3366' },
  { left: '42%', size: 32, dur: 18, delay: -13, color: '#FFB3C6' },
  { left: '45%', size: 26, dur: 27, delay: -9,  color: '#FF6B9D' },
  { left: '48%', size: 38, dur: 21, delay: -19, color: '#FF3366' },
  { left: '51%', size: 28, dur: 19, delay: -5,  color: '#FFB3C6' },
  { left: '54%', size: 24, dur: 23, delay: -15, color: '#FF6B9D' },
  { left: '57%', size: 36, dur: 17, delay: -12, color: '#FF3366' },
  { left: '60%', size: 30, dur: 25, delay: -21, color: '#FFB3C6' },
  { left: '63%', size: 22, dur: 20, delay: -1,  color: '#FF6B9D' },
  { left: '66%', size: 34, dur: 16, delay: -9,  color: '#FF3366' },
  { left: '69%', size: 26, dur: 28, delay: -24, color: '#FFB3C6' },
  { left: '72%', size: 40, dur: 22, delay: -16, color: '#FF6B9D' },
  { left: '75%', size: 24, dur: 19, delay: -7,  color: '#FF3366' },
  { left: '78%', size: 32, dur: 24, delay: -13, color: '#FFB3C6' },
  { left: '81%', size: 28, dur: 18, delay: -25, color: '#FF6B9D' },
  { left: '84%', size: 36, dur: 21, delay: -4,  color: '#FF3366' },
  { left: '87%', size: 22, dur: 26, delay: -18, color: '#FFB3C6' },
  { left: '90%', size: 30, dur: 17, delay: -10, color: '#FF6B9D' },
  { left: '93%', size: 38, dur: 23, delay: -22, color: '#FF3366' },
  { left: '96%', size: 26, dur: 20, delay: -6,  color: '#FFB3C6' },
  { left: '98%', size: 34, dur: 27, delay: -14, color: '#FF6B9D' },
  { left: '4%',  size: 40, dur: 15, delay: -11, color: '#FF3366' },
  { left: '10%', size: 28, dur: 24, delay: -20, color: '#FFB3C6' },
  { left: '20%', size: 34, dur: 19, delay: -3,  color: '#FF6B9D' },
  { left: '32%', size: 22, dur: 22, delay: -17, color: '#FF3366' },
  { left: '43%', size: 38, dur: 26, delay: -8,  color: '#FFB3C6' },
  { left: '53%', size: 30, dur: 18, delay: -23, color: '#FF6B9D' },
  { left: '62%', size: 24, dur: 21, delay: -5,  color: '#FF3366' },
  { left: '70%', size: 36, dur: 16, delay: -19, color: '#FFB3C6' },
  { left: '77%', size: 28, dur: 25, delay: -12, color: '#FF6B9D' },
  { left: '83%', size: 32, dur: 20, delay: -26, color: '#FF3366' },
  { left: '89%', size: 40, dur: 17, delay: -9,  color: '#FFB3C6' },
  { left: '94%', size: 26, dur: 23, delay: -15, color: '#FF6B9D' },
  { left: '7%',  size: 34, dur: 28, delay: -21, color: '#FF3366' },
  { left: '22%', size: 20, dur: 19, delay: -16, color: '#FFB3C6' },
  { left: '47%', size: 36, dur: 22, delay: -27, color: '#FF6B9D' },
  { left: '74%', size: 30, dur: 24, delay: -2,  color: '#FF3366' },
]

export default function FloatingHearts() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    >
      {HEARTS.map((h, i) => (
        <span
          key={i}
          className="absolute bottom-0 select-none floating-heart"
          style={{
            left: h.left,
            fontSize: `${h.size}px`,
            color: h.color,
            animationDuration: `${h.dur}s`,
            animationDelay: `${h.delay}s`,
            opacity: 0,
            willChange: 'transform, opacity',
            lineHeight: 1,
            filter: 'drop-shadow(0 2px 4px rgba(255,107,157,0.4))',
          }}
        >
          ♥
        </span>
      ))}
    </div>
  )
}
