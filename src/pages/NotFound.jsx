import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'

export default function NotFound() {
  const { t } = useTranslation()
  return <PageHeader title={t('pages.notFound.title')} icon="alertTriangle" />
}
