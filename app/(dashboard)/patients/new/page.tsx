import Topbar from '@/components/layout/Topbar'
import PatientForm from '@/components/patients/PatientForm'

export default function NewPatientPage() {
  return (
    <div className="flex-1">
      <Topbar title="Yeni Hasta" />
      <div className="p-6 max-w-lg">
        <PatientForm />
      </div>
    </div>
  )
}
