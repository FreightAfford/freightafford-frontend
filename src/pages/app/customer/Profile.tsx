import { Bell, Mail, MapPin, Phone, Shield, User } from "lucide-react";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import EditProfileForm from "../../../components/app/EditProfileForm";
import { useState } from "react";
import UpdatePasswordForm from "../../../components/app/UpdatePasswordForm";

const CustomerProfile = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] =
    useState<boolean>(false);
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-1 text-slate-500">
          Manage your personal information and account settings.
        </p>
      </div>
      <div className="max-medium-desktop:grid-cols-2 grid grid-cols-3 gap-8">
        <div className="max-medium-desktop:col-span-2 col-span-1">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="bg-brand/10 h-32" />
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4">
                <div className="h-24 w-24 rounded-full bg-white p-1 shadow-sm">
                  <div className="bg-brand/10 border-brand/20 flex h-full w-full items-center justify-center rounded-full border">
                    <User className="text-brand h-12 w-12" />
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Franklin Andrew
              </h2>
              <p className="text-slate-500 capitalize">Customer</p>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="h-6 w-6 text-slate-400" />
                  franklin@example.com
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="h-6 w-6 text-slate-400" />
                  +234 111 223 0000
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="h-6 w-6 text-slate-400" />
                  Nkanu West, Enugu
                </div>
              </div>

              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outline"
                className="mt-8 w-full"
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="col-span-2 space-y-8">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
              <Shield className="text-brand h-7 w-7" />
              Security Settings
            </h3>
            <div className="space-y-6">
              <div className="max-small-mobile:py-2 flex items-center justify-between border-b border-slate-50 py-4">
                <div>
                  <p className="font-semibold text-slate-900">Password</p>
                  <p className="text-sm text-slate-500">
                    Last changed 3 months ago
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  Update
                </Button>
              </div>
              <div className="max-small-mobile:py-2 flex items-center justify-between border-b border-slate-50 py-4">
                <div>
                  <p className="font-semibold text-slate-900">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-slate-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-brand">
                  Enable
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
              <Bell className="text-brand h-5 w-5" /> Notifications
            </h3>
            <div className="space-y-4">
              {[
                {
                  label: "Freight Request Updates",
                  desc: "Receive alerts when your requests are countered or approved",
                },
                {
                  label: "Booking Confirmations",
                  desc: "Get notified when your bookings are confirmed by the operator",
                },
                {
                  label: "Invoice Alerts",
                  desc: "Receive notifications for new invoices and payment reminders",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                  <div className="bg-brand relative ml-2 h-6 w-11 cursor-pointer rounded-full">
                    <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <EditProfileForm onCancel={() => setIsEditModalOpen(false)} />
      </Modal>
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Update Password"
      >
        <UpdatePasswordForm onCancel={() => setIsPasswordModalOpen(false)} />
      </Modal>
    </>
  );
};
export default CustomerProfile;
