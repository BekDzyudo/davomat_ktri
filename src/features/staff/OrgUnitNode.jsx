import { useLayoutEffect, useRef, useState } from 'react'
import UnitBox from './UnitBox'

// Institut tuzilmasini ierarxik daraxt sifatida chizadi. `depth === 0` —
// ildiz (direktor): "side" deb belgilangan bolalar (Strategik/Inson
// resurslari bo'limlari) direktorning ikki yonida — har biriga direktordan
// gorizontal chiziq chiqadi — qolganlari (o'rinbosarlar) pastda alohida
// qatorda chiziladi (`Branch` orqali).
export default function OrgUnitNode({ node }) {
  const realChildren = node.children ?? []
  const sideUnits = realChildren.filter((c) => c.layout === 'side')
  const belowUnits = realChildren.filter((c) => c.layout !== 'side')

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap items-center justify-center">
        {sideUnits[0] && (
          <div className="flex items-center">
            <div className="w-80 shrink-0">
              <UnitBox node={sideUnits[0]} depth={1} collapsibleMembers />
            </div>
            <div className="h-1 w-8 shrink-0 rounded-full bg-primary" />
          </div>
        )}
        <div className="w-96 shrink-0">
          <UnitBox node={node} depth={0} />
        </div>
        {sideUnits[1] && (
          <div className="flex items-center">
            <div className="h-1 w-8 shrink-0 rounded-full bg-primary" />
            <div className="w-80 shrink-0">
              <UnitBox node={sideUnits[1]} depth={1} collapsibleMembers />
            </div>
          </div>
        )}
      </div>

      {belowUnits.length > 0 && (
        <>
          <div className="h-6 w-1 shrink-0 rounded-full bg-primary" />
          <Branch nodes={belowUnits} depth={1} />
        </>
      )}
    </div>
  )
}

function childCountOf(node) {
  const children = node.children ?? []
  return children.length > 0 ? children.length : (node.pendingCount ?? 0)
}

// Bir xil otaga tegishli tugunlar qatorini (bir daraja) chizadi. Qatordagi
// tugunlardan faqat bittasi ochiq bo'ladi (akkordeon — yangisi ochilganda
// avvalgisi avtomatik yopiladi). Ochilgan tugunning o'z farzandlari shu
// qatorning PASTIDA, butun kenglik bo'yicha alohida qator sifatida silliq
// (grid-template-rows animatsiyasi bilan) ochiladi/yopiladi va aynan o'sha
// tugundan chiqib pastdagi qatorga tushuvchi haqiqiy "elbow" chiziq bilan
// bog'lanadi (kartaning qatordagi joylashuvidan qat'i nazar — o'lchov DOM
// orqali hisoblanadi). `displayNode` yopilish animatsiyasi tugagunicha oxirgi
// ochilgan tugunning kontentini ekranda ushlab turadi.
function Branch({ nodes, depth }) {
  const [openId, setOpenId] = useState(null)
  const [displayNode, setDisplayNode] = useState(null)
  const containerRef = useRef(null)
  const boxRefs = useRef({})
  const expandRef = useRef(null)
  const [connector, setConnector] = useState(null)

  const openNode = nodes.find((n) => n.id === openId)
  const isOpen = !!openNode

  // Yopilish animatsiyasi tugagunicha oxirgi ochilgan tugunning kontentini
  // ko'rsatishda davom etish uchun render vaqtida holatni moslashtiramiz
  // (React'ning tavsiya etilgan "adjust state during render" usuli).
  if (openNode && openNode !== displayNode) {
    setDisplayNode(openNode)
  }

  const displayRealChildren = displayNode?.children ?? []
  const displayChildCount = displayNode ? childCountOf(displayNode) : 0

  useLayoutEffect(() => {
    const container = containerRef.current
    const boxEl = displayNode && boxRefs.current[displayNode.id]
    if (!container || !boxEl) {
      setConnector(null)
      return
    }

    const measure = () => {
      const containerRect = container.getBoundingClientRect()
      const boxRect = boxEl.getBoundingClientRect()
      setConnector({
        width: containerRect.width,
        from: boxRect.left + boxRect.width / 2 - containerRect.left,
        to: containerRect.width / 2,
      })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    return () => observer.disconnect()
  }, [displayNode])

  // Karta ochilganda yangi ochilgan qatorni ko'rinadigan qilib scroll qiladi.
  useLayoutEffect(() => {
    if (!isOpen || !expandRef.current) return
    const id = requestAnimationFrame(() => {
      expandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
    return () => cancelAnimationFrame(id)
  }, [isOpen, openId])

  return (
    <div ref={containerRef} className="flex w-full flex-col items-center">
      <div className="flex w-full flex-wrap items-start justify-center gap-x-8 gap-y-6">
        {nodes.map((node) => {
          const childCount = childCountOf(node)
          const hasChildren = childCount > 0
          const nodeIsOpen = openId === node.id
          return (
            <div
              key={node.id}
              ref={(el) => {
                boxRefs.current[node.id] = el
              }}
              className="w-80 shrink-0"
            >
              <UnitBox
                node={node}
                depth={depth}
                hasToggle={hasChildren}
                isOpen={nodeIsOpen}
                onToggle={() => setOpenId((current) => (current === node.id ? null : node.id))}
                toggleLabel={`Bo'limlarni ${nodeIsOpen ? 'yashirish' : "ko'rsatish"} (${childCount})`}
              />
            </div>
          )
        })}
      </div>

      {displayNode && displayChildCount > 0 && (
        <>
          <div className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <Elbow connector={connector} />
          </div>
          <div
            ref={expandRef}
            id={`staff-children-${displayNode.id}`}
            className={`grid w-full overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out ${
              isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="flex min-h-0 flex-col items-center overflow-hidden">
              <span className="mb-3 max-w-full truncate rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                {displayNode.title} bo'limlari
              </span>
              {displayRealChildren.length > 0 ? (
                <Branch nodes={displayRealChildren} depth={depth + 1} />
              ) : (
                <div className="w-80 rounded-xl border border-dashed border-base-300 bg-base-200/50 px-4 py-3 text-center text-xs text-base-content/50">
                  Bu bo'lim ma'lumotlari hali kiritilmagan.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Ochiq kartaning pastki-markazidan (x = `from`) chiqib, pastdagi to'liq
// kenglikdagi qatorning markaziga (x = `to`) tushadigan burchakli chiziq.
function Elbow({ connector }) {
  if (!connector) return <div className="h-6 w-1 shrink-0 rounded-full bg-primary" />

  const { width, from, to } = connector
  const mid = 12

  return (
    <svg width={width} height={24} className="block shrink-0" aria-hidden="true">
      <path
        d={`M ${from} 0 L ${from} ${mid} L ${to} ${mid} L ${to} 24`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
    </svg>
  )
}
