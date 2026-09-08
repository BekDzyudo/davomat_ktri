import { useState } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'
import {
  buildMonthGrid,
  formatDurationUz,
  getStaffDayInfo,
  staffStatusCellClass,
  STAFF_DAY_STATUS,
  STAFF_STATUS_LEGEND,
} from '../data/mockAttendanceCalendar'
import { formatDate, toIsoDate } from '../utils/date'

const WEEKDAY_LABELS = ['DU', 'SE', 'CH', 'PA', 'JU', 'SH', 'YA']
const UZ_MONTHS_CAP = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]

function memberInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function MemberAvatar({ member, className = 'size-11' }) {
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-black text-primary ${className}`}>
      {member.avatar ? (
        <img src={member.avatar} alt="" className="size-full object-cover" />
      ) : (
        memberInitials(member.name)
      )}
    </span>
  )
}

export default function AttendanceCalendarModal({ member, onClose, showWorkStats = true }) {
  const [monthDate, setMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(null)

  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const cells = buildMonthGrid(year, month)
  const selectedInfo = selectedDate ? getStaffDayInfo(member, selectedDate) : null

  const changeMonth = (delta) => {
    setMonthDate(new Date(year, month + delta, 1))
    setSelectedDate(null)
  }

  return createPortal(
    (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" onClick={(e) => e.stopPropagation()}>
      <div className="absolute inset-0 bg-base-content/45 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative flex max-h-[min(700px,calc(100vh-1.5rem))] w-full max-w-237 flex-col overflow-hidden rounded-2xl border border-white/20 bg-base-100 shadow-2xl sm:max-h-[calc(100vh-3rem)]">
        <div className="flex min-h-21 shrink-0 items-center justify-between gap-4 bg-linear-to-r from-[oklch(52%_0.20_290)] via-[oklch(54%_0.18_276)] to-[oklch(65%_0.15_260)] px-6 py-4 text-primary-content sm:px-7">
          <div className="flex min-w-0 items-center gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/30 bg-white/15 text-sm font-black uppercase shadow-inner sm:size-12">
              {member.avatar ? <img src={member.avatar} alt="" className="size-full object-cover" /> : memberInitials(member.name)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold tracking-tight sm:text-xl">{member.name}</h2>
              <p className="mt-0.5 truncate text-sm font-medium text-primary-content/75 sm:text-base">{member.position}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-primary-content/70 sm:text-sm">
              <Icon name="calendar" className="size-3.5" />
              {UZ_MONTHS_CAP[month]} oyi davomati
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-primary-content/80 transition-colors hover:bg-white/15 hover:text-primary-content"
          >
            <Icon name="x" className="size-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto bg-base-100 md:flex-row md:overflow-hidden">
          <div className="flex-1 border-b border-base-300 p-4 sm:p-6 md:overflow-y-auto md:border-b-0 md:border-r lg:p-10">
            <div className="mb-5 flex items-center justify-between rounded-full border border-base-300 bg-base-100 px-2 py-1.5 shadow-sm">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-bold text-base-content/65 transition-colors hover:bg-base-200 hover:text-base-content"
              >
                <Icon name="chevronLeft" className="size-4" />
                Oldingi
              </button>
              <span className="text-xl font-extrabold tracking-tight text-base-content">
                {UZ_MONTHS_CAP[month]}, {year}
              </span>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-bold text-base-content/65 transition-colors hover:bg-base-200 hover:text-base-content"
              >
                Keyingi
                <Icon name="chevronRight" className="size-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center sm:gap-2">
              {WEEKDAY_LABELS.map((label, i) => (
                <span
                  key={label}
                  className={`py-1 text-xs font-extrabold uppercase tracking-wide sm:text-sm ${i >= 5 ? 'text-error/70' : 'text-base-content/40'}`}
                >
                  {label}
                </span>
              ))}
              {cells.map((date, i) => {
                if (!date) return <span key={i} />
                const info = getStaffDayInfo(member, date)
                const isSelected = !!selectedDate && toIsoDate(selectedDate) === toIsoDate(date)
                const disabled = !info.status

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedDate(date)}
                    className={[
                      'flex aspect-square items-center justify-center rounded-xl text-lg font-extrabold transition-all duration-150 sm:rounded-xl',
                      disabled
                        ? 'cursor-default bg-base-200 text-base-content/30'
                        : `cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${staffStatusCellClass(info.status)}`,
                      isSelected ? 'ring-2 ring-base-content/60 ring-offset-2 ring-offset-base-100' : '',
                    ].join(' ')}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-base-200 pt-4">
              {STAFF_STATUS_LEGEND.map((s) => (
                <span key={s.key} className="flex items-center gap-1.5 text-xs font-medium text-base-content/70">
                  <span className={`size-2 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-4 bg-base-200/25 p-4 sm:p-6 md:w-94 md:shrink-0 md:overflow-y-auto lg:p-10">
            {!selectedInfo ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-info/10 text-info">
                  <Icon name="calendar" className="size-8" />
                </span>
                <p className="text-lg font-extrabold text-base-content">Kun tanlanmagan</p>
                <p className="max-w-xs text-sm leading-relaxed text-base-content/50">
                  Batafsil hisobotni ko'rish uchun chap tomondagi taqvimdan biror kunni tanlang.
                </p>
              </div>
            ) : selectedInfo.status === STAFF_DAY_STATUS.KELMAGAN ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
                <Icon name="alertCircle" className="size-8 text-error" />
                <p className="text-base font-semibold text-base-content">{formatDate(selectedDate)} kunida kelmagan</p>
              </div>
            ) : (
              <>
                <p className="flex items-center gap-1.5 border-b border-base-300 pb-3 text-lg font-extrabold text-base-content">
                  <Icon name="calendar" className="size-4 text-info" />
                  {formatDate(selectedDate)} sanasi bo'yicha hisobot
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="relative mt-2 flex flex-col items-center gap-2 rounded-2xl border border-base-300 bg-base-100 px-3 pb-4 pt-6 shadow-sm">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-success px-3 py-1 text-[10px] font-black uppercase leading-none text-white shadow-sm">
                      Birinchi kirish
                    </span>
                    <MemberAvatar member={member} className="size-16 border-2 border-success/20" />
                    <p className="whitespace-nowrap text-2xl font-black tabular-nums tracking-tight text-base-content">{selectedInfo.checkIn}</p>
                  </div>
                  <div className="relative mt-2 flex flex-col items-center gap-2 rounded-2xl border border-base-300 bg-base-100 px-3 pb-4 pt-6 shadow-sm">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-error px-3 py-1 text-[10px] font-black uppercase leading-none text-white shadow-sm">
                      So'nggi chiqish
                    </span>
                    <MemberAvatar member={member} className="size-16 border-2 border-error/20" />
                    <p className="whitespace-nowrap text-2xl font-black tabular-nums tracking-tight text-base-content">{selectedInfo.checkOut}</p>
                  </div>
                </div>

                {showWorkStats && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-xl border border-base-300 bg-base-100 px-3 py-3 shadow-sm">
                      <span className="flex items-center gap-2 text-sm font-semibold text-base-content/65">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-info/10 text-info">
                          <Icon name="briefcase" className="size-4" />
                        </span>
                        Sof Ish Vaqti <span className="text-xs text-base-content/40">(9-18)</span>
                      </span>
                      <span className="text-sm font-extrabold text-base-content">{formatDurationUz(selectedInfo.netWorkMinutes)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-base-300 bg-base-100 px-3 py-3 shadow-sm">
                      <span className="flex items-center gap-2 text-sm font-semibold text-base-content/65">
                        <span className="flex size-7 items-center justify-center rounded-lg bg-info/10 text-info">
                          <Icon name="clock" className="size-4" />
                        </span>
                        Qo'shimcha <span className="text-xs text-base-content/40">(Overtime)</span>
                      </span>
                      <span className="text-sm font-extrabold text-base-content">{formatDurationUz(selectedInfo.overtimeMinutes)}</span>
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <p className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-base-content/45">
                    <Icon name="clock" className="size-3.5" />
                    Barcha harakatlar
                  </p>
                  <div className="relative flex flex-col gap-2 pl-4 before:absolute before:bottom-3 before:left-0.75 before:top-3 before:w-px before:bg-base-300">
                    <div className="relative flex items-center gap-2.5 rounded-xl border border-base-300 bg-base-100 p-2.5 shadow-sm">
                      <span className="absolute left-[-1.05rem] size-2.5 rounded-full border-2 border-base-100 bg-success ring-1 ring-success" />
                      <MemberAvatar member={member} className="size-9 border border-success/20" />
                      <div className="min-w-0 leading-tight">
                        <p className="text-base font-extrabold tabular-nums text-base-content">{selectedInfo.checkIn}</p>
                        <p className="text-xs font-bold text-success">↓ Kirish</p>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-2.5 rounded-xl border border-base-300 bg-base-100 p-2.5 shadow-sm">
                      <span className="absolute left-[-1.05rem] size-2.5 rounded-full border-2 border-base-100 bg-error ring-1 ring-error" />
                      <MemberAvatar member={member} className="size-9 border border-error/20" />
                      <div className="min-w-0 leading-tight">
                        <p className="text-base font-extrabold tabular-nums text-base-content">{selectedInfo.checkOut}</p>
                        <p className="text-xs font-bold text-error">↑ Chiqish</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    ),
    document.body,
  )
}
