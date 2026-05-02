import { useEffect, useState } from 'react'

// 4 kiểu hình dạng mềm mại
const SHAPES = {
  circle:  { borderRadius: '50%' },
  rounded: { borderRadius: '22%' },
  blob:    { borderRadius: '60% 40% 55% 45% / 45% 55% 45% 55%' },
  heart:   { clipPath: 'url(#fp-heart)' },
}

// delay âm = ảnh bắt đầu giữa chừng animation → hiện ngay khi load
const CONFIG = [
  { left:'1%',  size:64, dur:30, delay:-15, type:'a', shape:'circle'  },
  { left:'5%',  size:52, dur:26, delay:-8,  type:'b', shape:'heart'   },
  { left:'9%',  size:72, dur:34, delay:-22, type:'d', shape:'blob'    },
  { left:'13%', size:56, dur:28, delay:-5,  type:'c', shape:'rounded' },
  { left:'17%', size:68, dur:38, delay:-19, type:'a', shape:'circle'  },
  { left:'21%', size:58, dur:32, delay:-12, type:'b', shape:'heart'   },
  { left:'25%', size:76, dur:25, delay:-3,  type:'d', shape:'blob'    },
  { left:'29%', size:60, dur:36, delay:-24, type:'c', shape:'rounded' },
  { left:'33%', size:70, dur:29, delay:-10, type:'a', shape:'heart'   },
  { left:'37%', size:54, dur:33, delay:-17, type:'b', shape:'circle'  },
  { left:'41%', size:80, dur:27, delay:-7,  type:'d', shape:'blob'    },
  { left:'45%', size:62, dur:40, delay:-28, type:'c', shape:'rounded' },
  { left:'49%', size:66, dur:31, delay:-14, type:'a', shape:'circle'  },
  { left:'53%', size:74, dur:35, delay:-21, type:'b', shape:'heart'   },
  { left:'57%', size:58, dur:24, delay:-4,  type:'d', shape:'blob'    },
  { left:'61%', size:70, dur:37, delay:-18, type:'c', shape:'rounded' },
  { left:'65%', size:64, dur:30, delay:-9,  type:'a', shape:'heart'   },
  { left:'69%', size:52, dur:28, delay:-26, type:'b', shape:'circle'  },
  { left:'73%', size:72, dur:33, delay:-13, type:'d', shape:'blob'    },
  { left:'77%', size:60, dur:26, delay:-6,  type:'c', shape:'rounded' },
  { left:'81%', size:76, dur:36, delay:-20, type:'a', shape:'circle'  },
  { left:'85%', size:58, dur:29, delay:-11, type:'b', shape:'heart'   },
  { left:'89%', size:66, dur:38, delay:-25, type:'d', shape:'blob'    },
  { left:'93%', size:54, dur:32, delay:-2,  type:'c', shape:'rounded' },
  { left:'97%', size:70, dur:25, delay:-16, type:'a', shape:'heart'   },
  // Lớp 2 — xen kẽ lấp chỗ trống
  { left:'3%',  size:58, dur:33, delay:-30, type:'b', shape:'blob'    },
  { left:'7%',  size:68, dur:28, delay:-16, type:'d', shape:'heart'   },
  { left:'11%', size:54, dur:35, delay:-23, type:'c', shape:'circle'  },
  { left:'15%', size:74, dur:30, delay:-8,  type:'a', shape:'rounded' },
  { left:'19%', size:62, dur:26, delay:-18, type:'b', shape:'blob'    },
  { left:'23%', size:70, dur:40, delay:-33, type:'d', shape:'circle'  },
  { left:'27%', size:56, dur:32, delay:-11, type:'c', shape:'heart'   },
  { left:'31%', size:78, dur:27, delay:-27, type:'a', shape:'rounded' },
  { left:'35%', size:64, dur:36, delay:-6,  type:'b', shape:'blob'    },
  { left:'39%', size:60, dur:31, delay:-20, type:'d', shape:'circle'  },
  { left:'43%', size:72, dur:24, delay:-14, type:'c', shape:'heart'   },
  { left:'47%', size:52, dur:38, delay:-29, type:'a', shape:'rounded' },
  { left:'51%', size:68, dur:28, delay:-9,  type:'b', shape:'blob'    },
  { left:'55%', size:76, dur:33, delay:-22, type:'d', shape:'circle'  },
  { left:'59%', size:58, dur:30, delay:-17, type:'c', shape:'heart'   },
  { left:'63%', size:64, dur:35, delay:-4,  type:'a', shape:'rounded' },
  { left:'67%', size:70, dur:26, delay:-25, type:'b', shape:'blob'    },
  { left:'71%', size:56, dur:40, delay:-12, type:'d', shape:'circle'  },
  { left:'75%', size:74, dur:29, delay:-31, type:'c', shape:'heart'   },
  { left:'79%', size:62, dur:34, delay:-7,  type:'a', shape:'rounded' },
  { left:'83%', size:68, dur:27, delay:-19, type:'b', shape:'blob'    },
  { left:'87%', size:54, dur:36, delay:-24, type:'d', shape:'circle'  },
  { left:'91%', size:76, dur:31, delay:-10, type:'c', shape:'heart'   },
  { left:'95%', size:60, dur:28, delay:-28, type:'a', shape:'rounded' },
  { left:'99%', size:66, dur:38, delay:-15, type:'b', shape:'blob'    },
]

export default function FloatingPhotos() {
  const [photos, setPhotos] = useState([])

  useEffect(() => {
    fetch('/api/embe-photos')
      .then(r => r.json())
      .then(list => {
        // Fisher-Yates shuffle — mỗi lần vào trang ảnh xáo trộn khác nhau
        const arr = [...list]
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]]
        }
        setPhotos(arr)
      })
      .catch(() => {})
  }, [])

  if (!photos.length) return null

  return (
    <>
      {/* SVG defs cho hình trái tim — scale theo objectBoundingBox */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <clipPath id="fp-heart" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.85 C0.1,0.65 0,0.5 0,0.33 C0,0.14 0.14,0 0.32,0 C0.41,0 0.48,0.05 0.5,0.1 C0.52,0.05 0.59,0 0.68,0 C0.86,0 1,0.14 1,0.33 C1,0.5 0.9,0.65 0.5,0.85Z" />
          </clipPath>
        </defs>
      </svg>

      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 3 }}
        aria-hidden="true"
      >
        {CONFIG.map((cfg, i) => (
          <div
            key={i}
            className={`absolute bottom-0 floating-photo-${cfg.type}`}
            style={{
              left: cfg.left,
              animationDuration: `${cfg.dur}s`,
              animationDelay: `${cfg.delay}s`,
              opacity: 0,
              willChange: 'transform, opacity',
            }}
          >
            <div style={{
              width: cfg.size,
              height: cfg.size,
              overflow: 'hidden',
              ...SHAPES[cfg.shape],
              border: cfg.shape === 'heart' ? 'none' : '2.5px solid rgba(255,107,157,0.55)',
              boxShadow: '0 4px 18px rgba(255,107,157,0.28)',
            }}>
              <img
                src={photos[i % photos.length]}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
