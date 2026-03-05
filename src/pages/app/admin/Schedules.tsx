import { Plus } from "lucide-react";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import Button from "../../../components/Button";
import { useState } from "react";
import Modal from "../../../components/Modal";
import SailingScheduleForm from "../../../components/app/SailingScheduleForm";

const AdminSchedules = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  return (
    <>
      <div className="max-medium-mobile:flex-col max-medium-mobile:items-start mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Sailing Schedule
          </h1>
          <p className="mt-1 text-slate-500">
            Manage vessel departures and arrivals.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Schedule
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <Table
          headers={["Vessel Name", "Shipping Line", "ETD", "ETA", "Route"]}
        >
          <TableRow>
            <TableCell className="text-brand font-medium">
              MAERSK SEOUL
            </TableCell>
            <TableCell>Maersk</TableCell>
            <TableCell>Oct 24, 2023</TableCell>
            <TableCell>Nov 12, 2023</TableCell>
            <TableCell>SHA → LAX</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-brand font-medium">MSC OSCAR</TableCell>
            <TableCell>MSC</TableCell>
            <TableCell>Oct 28, 2023</TableCell>
            <TableCell>Nov 20, 2023</TableCell>
            <TableCell>NGB → RTM</TableCell>
          </TableRow>
        </Table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Sailing Schedule"
      >
        <SailingScheduleForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};
export default AdminSchedules;
