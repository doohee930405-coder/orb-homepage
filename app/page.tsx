import ClinicHome from './components/ClinicHome';
import { getAllColumns } from './lib/columns';
import { ensureQeegBrainmapImage } from './lib/syncImages';

export default function Home() {
  ensureQeegBrainmapImage();
  const latestColumns = getAllColumns().slice(0, 3);
  return <ClinicHome locale="ko" latestColumns={latestColumns} />;
}
