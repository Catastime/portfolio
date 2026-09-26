import { useState, useEffect, useCallback, useRef } from 'react'
import Dither from '@/components/Dither'
import Dock from '@/components/Dock'
import Masonry from '@/components/Masonry'
import DecryptedText from '@/components/DecryptedText'
import CuttingMat from '@/components/CuttingMat'
import ScrollSequence from '@/components/ScrollSequence'
import Sketchbook from '@/components/Sketchbook'
import { PixelHome, PixelProjects, PixelContact, PixelArrowDownSolid, PixelArrowUp, PixelArrowRight, PixelArrowLeft } from '@/components/PixelIcons'
import { motion } from 'motion/react'
import { BASE } from '@/paths'
import { startPreload } from '@/preload'

const projectItems = [
  { id: '1', img: 'https://picsum.photos/id/1015/600/900?grayscale', url: 'https://example.com/one', height: 400 },
  { id: '2', img: 'https://picsum.photos/id/1011/600/750?grayscale', url: 'https://example.com/two', height: 250 },
  { id: '3', img: 'https://picsum.photos/id/1020/600/800?grayscale', url: 'https://example.com/three', height: 600 },
  { id: '4', img: 'https://picsum.photos/id/1016/600/700?grayscale', url: 'https://example.com/four', height: 350 },
  { id: '5', img: 'https://picsum.photos/id/1018/600/650?grayscale', url: 'https://example.com/five', height: 450 },
  { id: '6', img: 'https://picsum.photos/id/1019/600/550?grayscale', url: 'https://example.com/six', height: 300 },
  { id: '7', img: 'https://picsum.photos/id/1024/600/800?grayscale', url: 'https://example.com/seven', height: 500 },
  { id: '8', img: 'https://picsum.photos/id/1025/600/600?grayscale', url: 'https://example.com/eight', height: 350 },
  { id: '9', img: 'https://picsum.photos/id/1043/600/750?grayscale', url: 'https://example.com/nine', height: 400 },
  { id: '10', img: 'https://picsum.photos/id/1035/600/850?grayscale', url: 'https://example.com/ten', height: 550 },
]

// Sketchbook pages — 13 spreads (26 pages).
// Spread 0: Introduction & CV (no corner text)
// Spread 1: Master Thesis — "Artificial Intelligence in Architectural Design"
// Spreads 2-12: Placeholder for future projects
// Corner text (spread number, year, place, title) is auto-injected by Sketchbook
// for all spreads except spread 0, using the `meta` field on the left page.

const THESIS_IMG = `${BASE}master-thesis`

// Master thesis pages — MORE overlay grid, numbered in reading order
const thesisPageCount = 140
const thesisPages = Array.from({ length: thesisPageCount }, (_, i) => ({
  id: String(i + 1),
  img: `${THESIS_IMG}/pages-preview/Masterthesis${i + 1}.jpg`,
  full: `${THESIS_IMG}/pages/Masterthesis${i + 1}.png`,
  aspect: 1748 / 2480,
}))

const bookPages = [
  // ===== SPREAD 0: Introduction & CV =====
  // Left page — Introduction heading on black paper
  {
    texture: 'left_page-black',
    items: [
      // Statement — big white caps in the lower half of the page
      { type: 'statement', text: 'I\'M TIM MOEDEKER,\nAN ARCHITECT AND\nLECTURER BASED IN\nHANNOVER\nWITH A PASSION FOR\nCUTTING EDGE\nTECHNOLOGIES OF THE\nDIGITAL WORLD AND,\nCONTRADICTORILY,\nANALOGUE PHOTOGRAPHY.', x: -4, y: 58.9, w: 108, h: 37.8, rotation: 0 },
      // Hole marks — mirrored from the Anthrazit image on the right page
      // (box matches the image box; h follows the image aspect 2.046)
      // frame: black outline around the dots, same size as the right image
      { type: 'holes', x: -4, y: 10, w: 108, h: 37, rotation: 0, frame: true },
      // Introduction — centered between the hole marks
      { type: 'text', text: 'introduction', x: -4, y: 26.8, w: 108, rotation: 0, align: 'center', sizes: [1], weight: 300 },
    ],
  },
  // Right page — Anthrazit image + CV
  {
    items: [
      // Atelier Anthrazit — the image we zoom out from
      { type: 'image', img: `${BASE}tim/Atelier Anthrazit-039-breit-bw.jpg`, imgMobile: `${BASE}tim/Atelier Anthrazit-039-breit-bw-mobile.jpg`, x: -4, y: 10, w: 108, rotation: 0, taped: true, noBg: true, shadow: '0 2px 8px rgba(0, 0, 0, 0.15)', tackers: [3, 1, 4, 2] },
      // Punched holes on the image — the book renders its own dots
      { type: 'holes', x: -4, y: 10, w: 108, h: 37, rotation: 0 },
      // CV — single column below the image: leader lines to right-aligned dates
      {
        type: 'cv', x: -4, y: 48.5, w: 108, rotation: 0, fontSize: 0.85, fontSizeMobile: 0.46,
        sections: [
          { name: 'EDUCATION', entries: [
            { head: 'M. Sc. Architecture, Leibniz University Hannover', date: '10.2021 - 01.2024', desc: 'Thesis on AI in architectural design, with a practical AI interface focused on accessibility.' },
            { head: 'B. Sc. Architecture, Leibniz University Hannover', date: '10.2017 - 01.2021', desc: 'Focus on conceptual, digital work in new formats such as VR and AR, deepened in the bachelor\'s thesis.' },
          ]},
          { name: 'EXPERIENCE', entries: [
            { head: 'Architectural Designer, Mosaik Architekt:innen Hannover', date: '10.2024 - today', desc: 'Competitions for public-sector clients, agentic automations and some IT.' },
            { head: 'Lecturer, Institute of Digital Methods in Architecture, Leibniz University Hannover', date: '04.2024 - today', desc: 'Teaching "Digital Simulation", researching open-source AI in architecture.' },
            { head: 'Guest Lecturer, Digital Design Unit, TU Darmstadt', date: '05.2025', desc: 'Weekend Arduino seminar; students built sensor-based musical instruments.' },
            { head: 'Architectural Intern, Design & Concept, Angelis & Partner', date: '04.2021 - 10.2021', desc: 'Design and concept work on competitions.' },
            { head: 'Student Assistant - IT, Faculty of Architecture & Landscape, Leibniz University Hannover', date: '01.2018 - 01.2025', desc: 'IT support for teaching staff and students.' },
          ]},
          { name: 'SKILLS', entries: [
            { head: 'Design & BIM: Rhinoceros, Revit, Archicad' },
            { head: 'Visualization: V-Ray, D5, Unity, Photoshop, Illustrator, InDesign' },
            { head: 'Other: Python, QGIS, 3D printing, large-format plotting, web/server hosting' },
            { head: 'Languages: German (mother tongue), English (fluent)' },
          ]},
        ],
      },
    ],
  },

  // ===== SPREAD 1: Master Thesis =====
  // Left page — black paper
  {
    texture: 'left_page-black',
    meta: { year: '2024', place: 'Hannover', title: 'Artificial Intelligence in Architectural Design' },
    items: [
      // Upper text block — narrowed to make room for comics on the right
      { type: 'text', text: 'The current development in the field of artificial intelligence promises unprecedented potentials for creative fields such as architecture. Instead of mere automation of simple processes and efficiency improvement through enhanced tools, it could herald the beginning of a true symbiosis between humans and machines, a vision pursued in the 20th century by researchers like John McCarthy and later Nicolas Negroponte.', x: 8, y: 10, w: 58, rotation: 0, font: "'Epoch', sans-serif", fontSize: 0.55, fontSizeMobile: 0.42 },
      // Comics image — right side, 10% smaller, slightly more right
      { type: 'image', img: `${THESIS_IMG}/comics-pipelineRendering.png`, x: 73, y: 9.5, w: 18, rotation: 0, noBg: true, taped: true, tackers: [2, 4, 1, 3] },
      // thesis-starter — between the two text blocks
      { type: 'image', img: `${THESIS_IMG}/thesis-starter.jpeg`, x: 8, y: 27, w: 42, rotation: 0, taped: true, noBg: true, tackers: [1, 3, 2, 4] },
      // website-concept — below the lower text, poking into it, 20% bigger than original w:38
      { type: 'image', img: `${THESIS_IMG}/website-concept2.png`, x: 48, y: 80, w: 42, rotation: 0, noBg: true },
      // Second text block — part 1: below comic, right of starter, above concept
      { type: 'text', text: 'However, the concept of artificial intelligence has undergone significant changes since its inception in the 1950s by John McCarthy. While he viewed AI as the understanding and reproduction of human intelligence, the term has now become vastly expansive, encompassing various categories of programs, from personal assistants to deep learning algorithms.', x: 52, y: 60, w: 38, rotation: 0, font: "'Epoch', sans-serif", fontSize: 0.5, fontSizeMobile: 0.4, align: 'right' },
      // Second text block — part 2: left of concept, below starter
      { type: 'text', text: 'When someone speaks of AI today, it generally refers to a deep learning algorithm attempting to simulate cognitive functions based on vast amounts of data. However, truly autonomous thinking programs, as envisaged in the 1950s, have not been realized yet, as current computers lack the necessary level of perception or self-reflection to develop actual intelligence.', x: 8, y: 80, w: 34, rotation: 0, font: "'Epoch', sans-serif", fontSize: 0.5, fontSizeMobile: 0.4 },
    ],
  },
  // Right page — black paper
  {
    texture: 'right_page-black',
    meta: { year: '2024', place: 'Hannover', title: 'Artificial Intelligence in Architectural Design' },
    items: [
      // Top text block
      { type: 'text', text: 'The rapid development in this renaissance of artificial intelligence has ignited in me a desire to delve into this topic through a master\'s thesis. The goal of this work is to examine the connections between past and current developments, describe the theoretical ideas and aspirations of these developments and their instigators, and develop a simple tool that showcases current possibilities of generative deep learning artificial intelligence in a user-friendly and helpful manner.', x: 8, y: 10, w: 84, rotation: 0, font: "'Epoch', sans-serif", fontSize: 0.55, fontSizeMobile: 0.4 },
      // Three images — positioned below the text (y:30 to y:95)
      { type: 'image', img: `${THESIS_IMG}/Example_start.png`, x: 8, y: 32, w: 35, rotation: 0, taped: true, noBg: true, tackers: [1, 3, 2, 4] },
      // Cityhotel Polaroid stack — slightly overlapping like stickers
      { type: 'image', img: `${THESIS_IMG}/Cityhotel_Sketch.jpg`, x: 48, y: 24, w: 28, rotation: -3, polaroid: true, bringToFront: true },
      { type: 'image', img: `${THESIS_IMG}/Cityhotel_Concrete.jpg`, x: 60, y: 29, w: 28, rotation: 2, polaroid: true, bringToFront: true },
      { type: 'image', img: `${THESIS_IMG}/Cityhotel_Scandi.jpg`, x: 52, y: 38, w: 28, rotation: -1, polaroid: true, bringToFront: true },
      { type: 'image', img: `${THESIS_IMG}/Cityhotel_Blade-Runner.jpg`, x: 64, y: 43, w: 28, rotation: 4, polaroid: true, bringToFront: true },
      { type: 'image', img: `${THESIS_IMG}/website.png`, x: 8, y: 72, w: 72, rotation: 0, taped: true, noBg: true, video: `${THESIS_IMG}/FinalVideo.mp4`, tackers: [4, 2, 3, 1] },
      // MORE — square button right of the video poster
      { type: 'button', label: 'MORE', x: 84, y: 91.25, w: 12, rotation: 0 },
    ],
  },

  // ===== SPREADS 2-12: Placeholder pages for future projects =====
  // Spread 2
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 3
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 4
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 5
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 6
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 7
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 8
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 9
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 10
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 11
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },
  // Spread 12
  { meta: { year: '', place: '', title: '' }, items: [] },
  { meta: { year: '', place: '', title: '' }, items: [] },

  // ===== SPREAD 13: IMPRESSUM — last page, black left, no right page =====
  {
    meta: { year: '2026', place: '', title: '' },
    impressum: true,
    texture: 'left_page-black',
    items: [
      { type: 'text', text: 'TIM MOEDEKER', x: -4, y: 14, w: 108, rotation: 0, fontSize: 1.2, fontSizeMobile: 0.65, weight: 300 },
      // TODO: replace with the real postal address
      { type: 'text', text: 'STREET AND NUMBER\nPOSTAL CODE HANNOVER\nGERMANY', x: -4, y: 21.5, w: 108, rotation: 0, fontSize: 0.85, fontSizeMobile: 0.46, weight: 300 },
      { type: 'text', text: 'TIM.MOEDEKER@GMAIL.COM\n+49 177 9000982\nTIMMKR.SPACE', x: -4, y: 34, w: 108, rotation: 0, fontSize: 0.85, fontSizeMobile: 0.46, weight: 300 },
      { type: 'text', text: '© 2026 TIM MOEDEKER — ALL RIGHTS RESERVED', x: -4, y: 86, w: 108, rotation: 0, fontSize: 0.7, fontSizeMobile: 0.4, weight: 300 },
      { type: 'text', text: 'DESIGNED AND BUILT WITH THE SUPPORT OF AI TOOLS', x: -4, y: 90.5, w: 108, rotation: 0, fontSize: 0.7, fontSizeMobile: 0.4, weight: 300 },
    ],
  },
]

function App() {
  const [showProjects, setShowProjects] = useState(false)
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [videoOverlay, setVideoOverlay] = useState<string | null>(null)
  const [contactOverlay, setContactOverlay] = useState(false)
  const [moreOverlay, setMoreOverlay] = useState(false)
  const [moreZoomed, setMoreZoomed] = useState<number | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard?.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(prev => (prev === key ? null : prev)), 1500)
  }

  // Hold-to-copy for touch devices (right-click is not available there)
  const holdTimerRef = useRef<number | null>(null)
  const holdCopiedRef = useRef(false)
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  const startHoldCopy = (key: string, text: string) => {
    holdCopiedRef.current = false
    holdTimerRef.current = window.setTimeout(() => {
      holdCopiedRef.current = true
      navigator.vibrate?.(50)
      copyToClipboard(key, text)
    }, 600)
  }
  const cancelHoldCopy = () => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }

  // Warm media before the user reaches it
  useEffect(() => { startPreload() }, [])
  const [imgAspect, setImgAspect] = useState(0)

  // Measure the intro image's aspect — the book's max-zoom geometry needs it
  useEffect(() => {
    const img = new Image()
    img.onload = () => setImgAspect(img.naturalWidth / img.naturalHeight)
    img.src = `${BASE}tim/Atelier Anthrazit-039-breit-bw.jpg`
  }, [])
  const [viewportW, setViewportW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1920))
  const isMobileViewport = viewportW < 768

  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  const [scrollProgress, setScrollProgress] = useState(0)
  const [arrowVisible, setArrowVisible] = useState(false)
  const [fadingHome, setFadingHome] = useState(false)
  const scrollAnimRef = useRef<number | null>(null)
  const [turnHint, setTurnHint] = useState<null | 'forward' | 'back'>(null)
  const turnHintRef = useRef<null | 'forward' | 'back'>(null)

  // Landing click choreography: 1st click grows the scroll arrow, 2nd shows
  // the hint text, 3rd+ moves the arrow to the click point
  const [landingClickStep, setLandingClickStep] = useState(0)
  const [landingHint, setLandingHint] = useState(false)
  const [arrowOffset, setArrowOffset] = useState({ x: 0, y: 0 })
  const arrowIconRef = useRef<HTMLSpanElement | null>(null)
  const [arrowRotation, setArrowRotation] = useState(0)
  const settleTimerRef = useRef<number | null>(null)
  const arrowButtonRef = useRef<HTMLButtonElement | null>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const offsetRef = useRef({ x: 0, y: 0 })
  const rotRef = useRef(0)
  const scaleRef = useRef(2)
  const prevCenterRef = useRef<{ x: number; y: number } | null>(null)
  const dartRef = useRef<{ x: number; y: number } | null>(null)
  const forceDartRef = useRef<{ x: number; y: number } | null>(null)

  // Show arrow after DecryptedText finishes (28 chars * 80ms speed + buffer)
  useEffect(() => {
    const decryptDuration = 28 * 80 + 300
    const t = setTimeout(() => setArrowVisible(true), decryptDuration)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    // Coalesce scroll events to one state update per frame
    let ticking = false
    const update = () => {
      ticking = false
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) { setScrollProgress(0); return }
      setScrollProgress(Math.min(1, Math.max(0, window.scrollY / max)))
    }
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Title moves from center of viewport to top during the first 33% of scroll
  // At progress 0: centered (translateY = ~40vh), at progress 0.33: at top (translateY = 0)
  const titleMoveEnd = 0.33
  const titleTranslateY = scrollProgress <= titleMoveEnd
    ? `${(1 - scrollProgress / titleMoveEnd) * 40}vh`
    : '0vh'

  // Arrow visible at landing (progress < 0.02); one click rolls the whole
  // sequence through to the book on the cutting mat
  const atLanding = scrollProgress < 0.02
  const arrowOpacity = !arrowVisible ? 0 : atLanding ? 1 : 0

  // Reset the landing click choreography once the user leaves the landing
  useEffect(() => {
    if (!atLanding) {
      setLandingClickStep(0)
      setLandingHint(false)
      setArrowOffset({ x: 0, y: 0 })
      setArrowRotation(0)
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
      }
      dartRef.current = null
      forceDartRef.current = null
    }
  }, [atLanding])

  // Clear a pending settle rotation on unmount
  useEffect(() => () => {
    if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
  }, [])

  // Click 6+: the arrow trails the cursor; click 8+: it grows huge; click
  // 10+: it evades the cursor. The loop writes the arrow's transform directly
  // every frame — React leaves unchanged inline styles alone, so the JSX
  // values stay dormant while this runs and take over again on reset
  const followMode = landingClickStep >= 6
  const hugeMode = landingClickStep >= 8
  const evadeMode = landingClickStep >= 10

  useEffect(() => {
    if (!followMode) return
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [followMode])

  useEffect(() => {
    if (!followMode || !atLanding || !arrowVisible) return
    const btn = arrowButtonRef.current
    const icon = arrowIconRef.current
    if (!btn || !icon) return
    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const rect = icon.getBoundingClientRect()
      if (!rect.width) return
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      // Ease toward the target size (2x, or 8x once it gets ridiculous)
      scaleRef.current += ((hugeMode ? 8 : 2) - scaleRef.current) * 0.07
      const halfW = 24 * scaleRef.current
      const halfH = 28.8 * scaleRef.current
      const vw = window.innerWidth
      const vh = window.innerHeight
      const m = mouseRef.current
      let tx = cx
      let ty = cy
      let ease = 0.06
      if (evadeMode) {
        const dart = dartRef.current
        const near = Math.hypot(cx - m.x, cy - m.y) < 260
        // Dart to a random point out of reach when the cursor closes in
        if (forceDartRef.current || (near && (!dart || Math.hypot(dart.x - m.x, dart.y - m.y) < 300))) {
          forceDartRef.current = null
          let picked = false
          for (let i = 0; i < 8; i++) {
            const a = Math.random() * Math.PI * 2
            const d = 320 + Math.random() * 220
            const px = Math.min(Math.max(m.x + Math.cos(a) * d, halfW), vw - halfW)
            const py = Math.min(Math.max(m.y + Math.sin(a) * d, halfH), vh - halfH)
            if (Math.hypot(px - m.x, py - m.y) > 360) {
              dartRef.current = { x: px, y: py }
              picked = true
              break
            }
          }
          if (!picked) {
            // Everything nearby clamps too close — flee to the far corner
            dartRef.current = {
              x: m.x < vw / 2 ? vw - halfW : halfW,
              y: m.y < vh / 2 ? vh - halfH : halfH,
            }
          }
        }
        const target = dartRef.current
        if (target) {
          tx = target.x
          ty = target.y
          ease = 0.16
          if (Math.hypot(tx - cx, ty - cy) < 4) dartRef.current = null
        }
      } else {
        // Follow underneath the cursor so it stays clickable, trailing
        // behind with a little lag like a dog on a leash
        tx = Math.min(Math.max(m.x, halfW), vw - halfW)
        ty = Math.min(Math.max(m.y, halfH), vh - halfH)
      }
      const prev = prevCenterRef.current
      const vx = prev ? cx - prev.x : 0
      const vy = prev ? cy - prev.y : 0
      prevCenterRef.current = { x: cx, y: cy }
      // Tip ahead while moving; settle crooked-down when parked
      const targetRot = Math.hypot(vx, vy) > 0.6
        ? Math.atan2(vy, vx) * 180 / Math.PI - 90
        : 11
      const diff = ((targetRot - rotRef.current + 540) % 360) - 180
      rotRef.current += diff * 0.12
      offsetRef.current.x += (tx - cx) * ease
      offsetRef.current.y += (ty - cy) * ease
      btn.style.transform = `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px)`
      icon.style.transform = `rotate(${rotRef.current}deg) scale(${scaleRef.current})`
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [followMode, hugeMode, evadeMode, atLanding, arrowVisible])

  // Landing clicks on non-interactive areas: grow the arrow, then show the
  // hint text, then move the arrow to each click point
  useEffect(() => {
    if (!atLanding || !arrowVisible) return
    const onLandingClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('button, a, [role="button"]')) return
      mouseRef.current = { x: e.clientX, y: e.clientY }
      const step = landingClickStep
      if (step === 0) {
        setLandingClickStep(1)
        return
      }
      if (step === 1) {
        setLandingClickStep(2)
        setLandingHint(true)
        return
      }
      if (step >= 10) {
        // Evading: any further click scares it away from the click point
        forceDartRef.current = { x: e.clientX, y: e.clientY }
        return
      }
      setLandingClickStep(step + 1)
      if (step <= 4) {
        const rect = arrowIconRef.current?.getBoundingClientRect()
        if (!rect) return
        const dx = e.clientX - (rect.left + rect.width / 2)
        const dy = e.clientY - (rect.top + rect.height / 2)
        if (dx === 0 && dy === 0) return
        // Tip ahead: the neutral orientation points straight down (90deg),
        // so rotate by the travel direction minus 90deg
        setArrowRotation(Math.atan2(dy, dx) * 180 / Math.PI - 90)
        setArrowOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }))
        // Once the glide ends, settle pointing mostly down but always a
        // little crooked — never straight down
        if (settleTimerRef.current !== null) window.clearTimeout(settleTimerRef.current)
        settleTimerRef.current = window.setTimeout(() => {
          const crook = (6 + Math.random() * 12) * (Math.random() < 0.5 ? -1 : 1)
          setArrowRotation(crook)
          settleTimerRef.current = null
        }, 520)
      } else if (step === 5) {
        // Following starts — hand position and rotation to the rAF loop
        if (settleTimerRef.current !== null) {
          window.clearTimeout(settleTimerRef.current)
          settleTimerRef.current = null
        }
        offsetRef.current = { ...arrowOffset }
        rotRef.current = arrowRotation
        scaleRef.current = 2
        prevCenterRef.current = null
        dartRef.current = null
      }
    }
    document.addEventListener('click', onLandingClick)
    return () => document.removeEventListener('click', onLandingClick)
  }, [atLanding, arrowVisible, landingClickStep, arrowOffset, arrowRotation])

  // Book page turn arrows — visible when the book is visible
  // The book scroll range is 0.60-1.00, with flat zones and turn zones
  const bookStart = 0.60
  const bookEnd = 1.00
  const bookRange = bookEnd - bookStart

  // The intro slide runs 0-0.33; the zoom-out overlaps its tail from 0.15.
  // The photo is always the book's own image item (no separate layer), and
  // Sketchbook's clip edge tracks the slide so the page above the photo
  // reveals at its natural zoom rate — slide and zoom run at the same time.
  const zoomStart = 0.15
  const zoomT = scrollProgress <= zoomStart ? 0 : scrollProgress >= bookStart ? 1 : (scrollProgress - zoomStart) / (bookStart - zoomStart)
  // The cutting mat appears behind the book as the zoom-out begins
  const matVisible = scrollProgress > zoomStart
  const totalSpreads = Math.ceil(bookPages.length / 2)
  const flatRatio = 0.35

  // Determine which spread we're on and whether we're in a flat zone
  const bookT = Math.max(0, Math.min(1, (scrollProgress - bookStart) / bookRange))
  const sliceSize = 1 / totalSpreads
  const currentSpread = Math.min(totalSpreads - 1, Math.floor(bookT / sliceSize))
  const sliceStart = currentSpread * sliceSize
  const sliceT = (bookT - sliceStart) / sliceSize
  const inFlatZone = sliceT <= flatRatio || currentSpread >= totalSpreads - 1

  // Show book arrows when in the book's flat zone
  const bookArrowVisible = inFlatZone && scrollProgress >= bookStart && scrollProgress <= bookEnd
  const canTurnForward = bookArrowVisible && currentSpread < totalSpreads - 1 && !isMobileViewport
  const canTurnBack = bookArrowVisible && currentSpread > 0 && !isMobileViewport
  // Up arrow: at book flat zone on the first spread only
  const canGoUp = bookArrowVisible && currentSpread === 0

  // Scroll to a specific spread's flat zone center
  const scrollToSpreadFlat = (spread: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const sStart = bookStart + spread * sliceSize * bookRange
    const flatCenter = sStart + sliceSize * flatRatio * 0.5 * bookRange
    smoothScrollTo(max * flatCenter, 1500)
  }

  const turnPageForward = () => {
    if (canTurnForward) {
      scrollToSpreadFlat(currentSpread + 1)
    }
  }

  const turnPageBack = () => {
    if (canTurnBack) {
      scrollToSpreadFlat(currentSpread - 1)
    }
  }

  // Mobile: single pages are scroll-driven, scroll to a page's slice center
  const scrollToMobilePage = useCallback((page: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    const slice = bookRange / bookPages.length
    const target = Math.min(1, bookStart + slice * (page + 0.5))
    smoothScrollTo(max * target, 700)
  }, [bookRange, bookPages.length])

  const smoothScrollTo = (target: number, duration = 4000) => {
    if (scrollAnimRef.current !== null) {
      cancelAnimationFrame(scrollAnimRef.current)
    }
    const start = window.scrollY
    const distance = target - start
    const startTime = performance.now()

    // Ease-out: starts fast, decelerates — no initial pause
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const step = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(1, elapsed / duration)
      window.scrollTo(0, start + distance * easeOutCubic(t))
      if (t < 1) {
        scrollAnimRef.current = requestAnimationFrame(step)
      } else {
        scrollAnimRef.current = null
      }
    }
    scrollAnimRef.current = requestAnimationFrame(step)
  }

  const cancelScroll = () => {
    if (scrollAnimRef.current !== null) {
      cancelAnimationFrame(scrollAnimRef.current)
      scrollAnimRef.current = null
    }
  }

  // Mobile: settle on the nearest page when scrolling comes to rest, so
  // the page crossfade never stops halfway between two pages. Never settles
  // while a finger is on the screen or an animation is running.
  useEffect(() => {
    if (!isMobileViewport) return
    let snapTimer: number | null = null
    let touchActive = false
    const settle = () => {
      snapTimer = null
      if (touchActive || scrollAnimRef.current !== null) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return
      const p = window.scrollY / max
      if (p < bookStart || p >= 0.999) return
      const slice = bookRange / bookPages.length
      const page = Math.min(bookPages.length - 1, Math.max(0, Math.round((p - bookStart) / slice - 0.5)))
      const target = max * (bookStart + slice * (page + 0.5))
      if (Math.abs(target - window.scrollY) < 2) return
      smoothScrollTo(target, 350)
    }
    const schedule = () => {
      if (snapTimer !== null) window.clearTimeout(snapTimer)
      snapTimer = window.setTimeout(settle, 220)
    }
    const onTouchStart = () => {
      touchActive = true
      if (snapTimer !== null) { window.clearTimeout(snapTimer); snapTimer = null }
      cancelScroll()
    }
    const onTouchEnd = () => {
      touchActive = false
      schedule()
    }
    const onWheel = () => {
      if (snapTimer !== null) { window.clearTimeout(snapTimer); snapTimer = null }
      cancelScroll()
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('touchcancel', onTouchEnd, { passive: true })
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('touchcancel', onTouchEnd)
      window.removeEventListener('wheel', onWheel)
      if (snapTimer !== null) window.clearTimeout(snapTimer)
    }
  }, [isMobileViewport])

  // Desktop: settle into the nearest spread's flat zone when scrolling comes
  // to rest, so wheel/trackpad scrolling lands on settled pages instead of
  // freezing mid-turn. Uses the same smooth scroll as the arrows; fresh
  // input interrupts the settle.
  useEffect(() => {
    if (isMobileViewport) return
    let settleTimer: number | null = null
    const settle = () => {
      settleTimer = null
      if (scrollAnimRef.current !== null) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return
      const p = window.scrollY / max
      if (p < bookStart || p >= 0.999) return
      const bookT = (p - bookStart) / bookRange
      const sliceSize = 1 / totalSpreads
      const spread = Math.min(totalSpreads - 1, Math.floor(bookT / sliceSize))
      const sliceT = (bookT - spread * sliceSize) / sliceSize
      // Already flat, or on the last spread (no turn zone) — nothing to do
      if (sliceT <= flatRatio || spread >= totalSpreads - 1) return
      // Snap to the nearer flat center: this spread's or the next one's
      const flatCenterT = flatRatio / 2
      const toCurrent = sliceT - flatCenterT
      const toNext = 1 + flatCenterT - sliceT
      const targetT = (toNext < toCurrent ? spread + 1 : spread) * sliceSize + flatCenterT * sliceSize
      const target = max * (bookStart + targetT * bookRange)
      if (Math.abs(target - window.scrollY) < 2) return
      smoothScrollTo(target, 600)
    }
    const onScroll = () => {
      if (settleTimer !== null) window.clearTimeout(settleTimer)
      settleTimer = window.setTimeout(settle, 220)
    }
    const onInterrupt = () => {
      if (settleTimer !== null) { window.clearTimeout(settleTimer); settleTimer = null }
      cancelScroll()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', onInterrupt, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onInterrupt)
      if (settleTimer !== null) window.clearTimeout(settleTimer)
    }
  }, [isMobileViewport])

  // Desktop: in the book, wheel input no longer scrubs the page turn.
  // Scroll distance accumulates and, past a threshold, plays the same smooth
  // turn animation the arrows use. While accumulating, the target page lifts
  // slightly and its arrow gets an outline; both persist for a moment (wheel
  // signals are intermittent) instead of flickering. The counter resets when
  // a turn plays or scrolling stops for 0.8s, and never builds during an
  // animation.
  useEffect(() => {
    if (isMobileViewport) return
    let acc = 0
    let lastWheel = 0
    let hintTimer: number | null = null
    const THRESHOLD = 100
    const IDLE_RESET_MS = 800
    const setHint = (h: null | 'forward' | 'back') => {
      if (turnHintRef.current !== h) { turnHintRef.current = h; setTurnHint(h) }
    }
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return
      if (document.body.style.overflow === 'hidden') return
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) return
      const p = window.scrollY / max
      if (p < bookStart) return
      const bookT = (p - bookStart) / bookRange
      const sliceSize = 1 / totalSpreads
      const spread = Math.min(totalSpreads - 1, Math.floor(bookT / sliceSize))
      if (e.deltaY < 0 && spread === 0) return
      e.preventDefault()
      const now = performance.now()
      if (now - lastWheel > IDLE_RESET_MS) acc = 0
      lastWheel = now
      // No threshold building while an animation plays
      if (scrollAnimRef.current !== null) return
      acc += e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY
      setHint(acc > 0 ? 'forward' : 'back')
      if (hintTimer !== null) window.clearTimeout(hintTimer)
      hintTimer = window.setTimeout(() => setHint(null), IDLE_RESET_MS)
      if (acc >= THRESHOLD || acc <= -THRESHOLD) {
        const next = spread + (acc > 0 ? 1 : -1)
        acc = 0
        setHint(null)
        if (hintTimer !== null) { window.clearTimeout(hintTimer); hintTimer = null }
        if (next >= 0 && next <= totalSpreads - 1) scrollToSpreadFlat(next)
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', onWheel)
      if (hintTimer !== null) window.clearTimeout(hintTimer)
    }
  }, [isMobileViewport])

  // Navigation: two steps — landing (0) and book (0.60)
  const scrollToStep = (step: 'landing' | 'book', duration = 1500) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    // Land inside spread 0's flat zone, not exactly on bookStart — pixel
    // rounding at the boundary can stop the scroll a hair short, which
    // hides the arrows (they require scrollProgress >= bookStart).
    const targets = { landing: 0, book: bookStart + bookRange * (flatRatio * 0.5) / totalSpreads }
    smoothScrollTo(max * targets[step], duration)
  }

  // Auto-play rolls the whole sequence through — image slide-up, zoom-out,
  // book reveal — without stopping on the full-size picture
  const autoPlay = () => {
    scrollToStep('book', 3500)
  }

  // Go back to the landing
  const goBack = () => {
    if (inFlatZone) {
      scrollToStep('landing', 2000)
    }
  }

  const goHome = () => {
    setShowProjects(false)
    setVideoOverlay(null)
    setFadingHome(true)
    // Scroll up while fading to black, then cut scroll, jump to top and fade in
    smoothScrollTo(0, 1200)
    setTimeout(() => {
      cancelScroll()
      window.scrollTo(0, 0)
      setFadingHome(false)
    }, 450)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC closes any open overlay
      if (e.key === 'Escape') {
        if (videoOverlay) { setVideoOverlay(null); return }
        if (contactOverlay) { setContactOverlay(false); return }
        if (moreZoomed !== null) { setMoreZoomed(null); return }
        if (moreOverlay) { setMoreOverlay(false); return }
        if (showProjects) { setShowProjects(false); return }
        return
      }
      // Arrow keys navigate the zoomed thesis page
      if (moreZoomed !== null) {
        if (e.key === 'ArrowRight') {
          e.preventDefault()
          setMoreZoomed((m) => (m !== null && m < thesisPages.length - 1 ? m + 1 : m))
        }
        if (e.key === 'ArrowLeft') {
          e.preventDefault()
          setMoreZoomed((m) => (m !== null && m > 0 ? m - 1 : m))
        }
        return
      }
      // Block arrow interactions while any overlay is open
      if (showProjects || videoOverlay || contactOverlay || moreOverlay) return
      if (e.key === 'ArrowDown' && arrowVisible && atLanding) {
        e.preventDefault()
        autoPlay()
      }
      if (e.key === 'ArrowUp' && canGoUp) {
        e.preventDefault()
        goBack()
      }
      if (e.key === 'ArrowRight' && canTurnForward) {
        e.preventDefault()
        turnPageForward()
      }
      if (e.key === 'ArrowLeft' && canTurnBack) {
        e.preventDefault()
        turnPageBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [arrowVisible, atLanding, canGoUp, canTurnForward, canTurnBack, showProjects, videoOverlay, contactOverlay, moreOverlay, moreZoomed])

  // Trigger autoPlay/goBack after 2 wheel ticks in the appropriate direction
  const wheelTickRef = useRef(0)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (showProjects || videoOverlay || contactOverlay || moreOverlay) return
      if (scrollAnimRef.current !== null) return
      if (!arrowVisible) return

      const goingDown = e.deltaY > 0
      const goingUp = e.deltaY < 0

      // Determine which step we're at
      const canGoForward = atLanding
      const canGoBack = canGoUp

      if (!canGoForward && !canGoBack) {
        wheelTickRef.current = 0
        return
      }

      if (goingDown && !canGoForward) {
        wheelTickRef.current = 0
        return
      }
      if (goingUp && !canGoBack) {
        wheelTickRef.current = 0
        return
      }

      e.preventDefault()
      wheelTickRef.current += 1
      if (wheelTickRef.current >= 2) {
        wheelTickRef.current = 0
        if (goingDown) autoPlay()
        else goBack()
      }
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [arrowVisible, atLanding, canGoUp, showProjects, videoOverlay, contactOverlay, moreOverlay])

  useEffect(() => {
    if (showProjects || moreOverlay) {
      const t = setTimeout(() => setOverlayVisible(true), 10)
      document.body.style.overflow = 'hidden'
      return () => {
        clearTimeout(t)
        if (!videoOverlay) document.body.style.overflow = ''
      }
    } else {
      setOverlayVisible(false)
      if (!videoOverlay) document.body.style.overflow = ''
    }
  }, [showProjects, moreOverlay, videoOverlay])

  // Lock scroll when video or contact overlay is open
  useEffect(() => {
    if (videoOverlay || contactOverlay || moreOverlay) {
      document.body.style.overflow = 'hidden'
      return () => {
        if (!showProjects) document.body.style.overflow = ''
      }
    }
  }, [videoOverlay, contactOverlay, moreOverlay, showProjects])

  const dockItems = [
    { icon: <PixelHome size={18} />, label: 'Home', onClick: goHome },
    { icon: <PixelProjects size={18} />, label: 'Projects', onClick: () => setShowProjects(prev => !prev) },
    { icon: <PixelContact size={18} />, label: 'Contact', onClick: () => setContactOverlay(true) },
  ]

  return (
    <div className="relative w-full">
      {/* Fade overlay for home transition */}
      <div
        className="fixed inset-0 z-50 bg-black"
        style={{
          opacity: fadingHome ? 1 : 0,
          transition: 'opacity 0.45s ease',
          pointerEvents: fadingHome ? 'auto' : 'none',
        }}
      />

      {/* Scroll spacer — gives the document scrollable height for the sequence */}
      <div className="h-[700vh] w-full" />

      {/* Fixed background layers */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Dither
          waveColor={[0.5, 0.5, 0.5]}
          backgroundColor={[0, 0, 0]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>

      {/* Mobile intro image layer — on desktop the book itself is the intro */}
      {isMobileViewport && <ScrollSequence />}

      {/* Cutting mat — behind the image, appears when zoom-out starts */}
      <div
        className="fixed inset-0 z-5"
        style={{
          opacity: matVisible ? 1 : 0,
          transition: 'opacity 0.6s ease',
          pointerEvents: matVisible ? 'auto' : 'none',
        }}
      >
        <CuttingMat startCm={7} />
      </div>

      {/* Sketchbook — always mounted: at max zoom it is the intro image,
          slides up, then zooms out onto the cutting mat */}
      <Sketchbook
        pages={bookPages}
        visible={true}
        scrollProgress={scrollProgress}
        bookZoom={zoomT}
        imgAspect={imgAspect}
        onVideoOpen={setVideoOverlay}
        onMoreOpen={() => setMoreOverlay(true)}
        onNavigatePage={scrollToMobilePage}
        turnHint={turnHint}
      />

      {/* Title — starts centered, moves to top on scroll.
          Underneath the cutting mat (z-5) so it shows through the translucent mat. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-1 flex justify-center px-4 pt-10"
        style={{ transform: `translateY(${titleTranslateY})` }}
      >
        <div className="w-full max-w-5xl">
          <DecryptedText
            text="ARCH1TECTURE.PORTF0LIO_TIM.MKR"
            speed={80}
            maxIterations={10}
            sequential
            revealDirection="start"
            animateOn="view"
            className="text-white"
            parentClassName="decrypted-title"
          />
        </div>
      </div>

      {/* Landing hint — shown after the second non-interactive click */}
      {landingHint && atLanding && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 z-20 flex justify-center"
          style={{ bottom: 132 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="landing-hint">TO CONTINUE, PLEASE SCROLL OR USE THE ARROWS.</span>
        </motion.div>
      )}

      {/* Scroll arrow — appears after decrypt animation, lower right corner */}
      {arrowVisible && arrowOpacity > 0.01 && (
        <button
          ref={arrowButtonRef}
          onClick={autoPlay}
          className="fixed bottom-8 right-8 z-20 flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-white"
          style={{
            opacity: arrowOpacity,
            transform: `translate(${arrowOffset.x}px, ${arrowOffset.y}px)`,
            transition: followMode ? 'opacity 0.5s ease' : 'opacity 0.5s ease, transform 0.5s ease',
            lineHeight: 0,
            paddingBottom: '48px',
          }}
          aria-label="Scroll to explore"
        >
          <span
            ref={arrowIconRef}
            className="book-arrow"
            style={{
              transform: `rotate(${arrowRotation}deg) scale(${landingClickStep >= 1 ? 2 : 1})`,
              transformOrigin: 'center',
              transition: followMode ? 'none' : 'transform 0.3s ease',
            }}
          >
            <PixelArrowDownSolid size={48} />
          </span>
        </button>
      )}

      {/* Up arrow — go back to previous step, top right corner */}
      {arrowVisible && canGoUp && (
        <button
          onClick={goBack}
          className="fixed top-8 right-8 z-20 flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-white"
          style={{
            opacity: 1,
            transition: 'opacity 0.5s ease',
            lineHeight: 0,
            paddingTop: '48px',
          }}
          aria-label="Go back"
        >
          <span className="book-arrow">
            <PixelArrowUp size={48} />
          </span>
        </button>
      )}

      {/* Book page turn arrows — right arrow for forward, left arrow for back */}
      {canTurnForward && (
        <button
          onClick={turnPageForward}
          className="fixed bottom-8 right-8 z-20 flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-white"
          style={{
            opacity: 1,
            transition: 'opacity 0.3s ease',
            lineHeight: 0,
            paddingBottom: '48px',
          }}
          aria-label="Next page"
        >
          <span className={'book-arrow' + (turnHint === 'forward' ? ' book-arrow-hint' : '')}>
            <PixelArrowRight size={48} />
          </span>
        </button>
      )}

      {canTurnBack && (
        <button
          onClick={turnPageBack}
          className="fixed bottom-8 left-8 z-20 flex cursor-pointer items-center justify-center border-none bg-transparent p-2 text-white"
          style={{
            opacity: 1,
            transition: 'opacity 0.3s ease',
            lineHeight: 0,
            paddingBottom: '48px',
          }}
          aria-label="Previous page"
        >
          <span className={'book-arrow' + (turnHint === 'back' ? ' book-arrow-hint' : '')}>
            <PixelArrowLeft size={48} />
          </span>
        </button>
      )}

      {showProjects && (
        <div
          className="fixed inset-0 overflow-y-auto"
          onClick={() => setShowProjects(false)}
          style={{
            zIndex: 45,
            backgroundColor: 'rgba(5, 5, 5, 0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            opacity: overlayVisible ? 1 : 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: overlayVisible ? 'auto' : 'none',
          }}
        >
          <div
            className="mx-auto w-full max-w-6xl px-6 pb-32 pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Masonry
              items={projectItems}
              ease="power3.out"
              duration={0.3}
              stagger={0.04}
              animateFrom="bottom"
              scaleOnHover
              hoverScale={0.95}
              blurToFocus
              colorShiftOnHover={false}
            />
          </div>
        </div>
      )}

      {/* MORE overlay — thesis pages overview, same interface as projects */}
      {moreOverlay && (
        <div
          className="fixed inset-0 overflow-y-auto"
          onClick={() => setMoreOverlay(false)}
          style={{
            zIndex: 45,
            backgroundColor: 'rgba(5, 5, 5, 0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            opacity: overlayVisible ? 1 : 0,
            transition: 'opacity 0.4s ease',
            pointerEvents: overlayVisible ? 'auto' : 'none',
          }}
        >
          <div
            className="mx-auto w-full max-w-6xl px-6 pb-32 pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Masonry
              items={thesisPages}
              ease="power3.out"
              duration={0.3}
              stagger={0.01}
              animateFrom="bottom"
              scaleOnHover
              hoverScale={0.95}
              blurToFocus
              colorShiftOnHover={false}
              waitForImages={false}
              onItemClick={(item) => setMoreZoomed(Number(item.id) - 1)}
            />
          </div>
        </div>
      )}

      {/* Zoomed thesis page — click outside or ESC returns to the overview */}
      {moreZoomed !== null && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          onClick={() => setMoreZoomed(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ zIndex: 50, backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        >
          {moreZoomed > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setMoreZoomed(moreZoomed - 1) }}
              className="fixed left-8 top-1/2 z-50 flex -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-transparent p-2 text-white"
              style={{ lineHeight: 0 }}
              aria-label="Previous page"
            >
              <PixelArrowLeft size={48} />
            </button>
          )}
          <motion.img
            key={moreZoomed}
            src={thesisPages[moreZoomed].full ?? thesisPages[moreZoomed].img}
            alt=""
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: '80vw', maxHeight: '80vh' }}
          />
          {moreZoomed < thesisPages.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setMoreZoomed(moreZoomed + 1) }}
              className="fixed right-8 top-1/2 z-50 flex -translate-y-1/2 cursor-pointer items-center justify-center border-none bg-transparent p-2 text-white"
              style={{ lineHeight: 0 }}
              aria-label="Next page"
            >
              <PixelArrowRight size={48} />
            </button>
          )}
        </motion.div>
      )}

      {/* Video overlay — above all content, click outside or ESC to close */}
      {videoOverlay && (
        <div
          className="fixed inset-0 flex items-center justify-center"
          onClick={() => setVideoOverlay(null)}
          style={{
            zIndex: 60,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
          }}
        >
          <video
            src={videoOverlay}
            autoPlay
            loop
            muted
            playsInline
            controls
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
            }}
          />
        </div>
      )}

      {/* Contact overlay — email/phone with right-click copy, CV download */}
      {contactOverlay && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          onClick={() => setContactOverlay(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            zIndex: 60,
            backgroundColor: 'rgba(5, 5, 5, 0.3)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          <div className="contact-overlay" onClick={(e) => e.stopPropagation()}>
            <motion.button
              type="button"
              className="contact-btn"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0 }}
              onClick={() => { if (holdCopiedRef.current) return; window.location.href = 'mailto:tim.moedeker@gmail.com' }}
              onContextMenu={(e) => { e.preventDefault(); copyToClipboard('email', 'tim.moedeker@gmail.com') }}
              onTouchStart={() => startHoldCopy('email', 'tim.moedeker@gmail.com')}
              onTouchMove={cancelHoldCopy}
              onTouchEnd={cancelHoldCopy}
            >
              <span className="contact-btn-main">tim.moedeker@gmail.com</span>
              <span className="contact-btn-hint">{copied === 'email' ? 'Copied' : isTouch ? 'Hold to copy' : 'Rightclick to copy'}</span>
            </motion.button>
            <motion.button
              type="button"
              className="contact-btn"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
              onClick={() => { if (holdCopiedRef.current) return; window.location.href = 'tel:+491779000982' }}
              onContextMenu={(e) => { e.preventDefault(); copyToClipboard('phone', '+49 177 9000982') }}
              onTouchStart={() => startHoldCopy('phone', '+49 177 9000982')}
              onTouchMove={cancelHoldCopy}
              onTouchEnd={cancelHoldCopy}
            >
              <span className="contact-btn-main">+49 177 9000982</span>
              <span className="contact-btn-hint">{copied === 'phone' ? 'Copied' : isTouch ? 'Hold to copy' : 'Rightclick to copy'}</span>
            </motion.button>
            <motion.a
              className="contact-btn"
              href={`${BASE}CV.pdf`}
              download="CV_Tim_Moedeker.pdf"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            >
              <span className="contact-btn-main">Download CV</span>
            </motion.a>
          </div>
        </motion.div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center">
        <Dock
          items={dockItems}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
        />
      </div>
    </div>
  )
}

export default App
