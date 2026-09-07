import CenterToast from '../../components/CenterToast'
import Alert from '../../components/form/Alert'
import Button from '../../components/form/Button'
import Icon from '../../components/Icon'
import StudentAttendanceRow from './StudentAttendanceRow'

export default function LessonAttendanceEditor({
  subjectName,
  groupName,
  room,
  timeLabel,
  students,
  records,
  editable,
  blockTitle,
  blockMessage,
  savedBanner,
  savedDetails,
  onDismissSaved,
  onStatusChange,
  onMarkAllPresent,
  onSave,
  isSaving = false,
}) {
  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
      {!editable && blockTitle && (
        <div className="mb-4">
          <Alert variant="warning" icon="alertTriangle">
            <strong>{blockTitle}</strong> {blockMessage}
          </Alert>
        </div>
      )}

      <CenterToast
        open={savedBanner}
        message="Davomat saqlandi."
        details={savedDetails}
        onClose={onDismissSaved}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-box border border-primary/15 bg-linear-to-r from-primary/10 via-primary/5 to-transparent p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-box bg-primary text-primary-content shadow-sm">
            <Icon name="book" className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-base-content">{subjectName}</h2>
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-base-content/60">
              <span className="inline-flex items-center gap-1">
                <Icon name="group" className="size-3.5 shrink-0" />
                {groupName}
              </span>
              <span className="text-base-content/30">·</span>
              <span className="inline-flex items-center gap-1">
                <Icon name="mapPin" className="size-3.5 shrink-0" />
                {room}
              </span>
              <span className="text-base-content/30">·</span>
              <span className="inline-flex items-center gap-1">
                <Icon name="clock" className="size-3.5 shrink-0" />
                {timeLabel}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {students.length > 0 && (
            <div className="text-right">
              <p className="text-lg font-semibold leading-none text-base-content">
                {students.filter((s) => records[s.id]?.status).length}
                <span className="text-base-content/40">/{students.length}</span>
              </p>
              <p className="mt-1 text-xs text-base-content/50">belgilandi</p>
            </div>
          )}
          <Button variant="outline" onClick={onMarkAllPresent} disabled={!editable}>
            <Icon name="check" className="size-4" />
            Barchasini keldi deb belgilash
          </Button>
        </div>
      </div>

      {students.length === 0 ? (
        <p className="py-8 text-center text-sm text-base-content/50">
          Bu guruhda tinglovchilar topilmadi
        </p>
      ) : (
        <div className="flex flex-col">
          {students.map((student) => (
            <StudentAttendanceRow
              key={student.id}
              student={student}
              record={records[student.id]}
              disabled={!editable}
              onStatusChange={(statusKey) => onStatusChange(student, statusKey)}
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={onSave} disabled={!editable || students.length === 0 || isSaving}>
          {isSaving ? (
            <span className="loading loading-spinner loading-sm" />
          ) : (
            <>
              <Icon name="check" className="size-4" />
              Saqlash
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
