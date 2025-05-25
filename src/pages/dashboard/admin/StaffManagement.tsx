import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Pencil, User2Icon, AlertTriangle } from "lucide-react";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
interface Availability {
  id: string;
  doctorId: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface DoctorInfo {
  id: string;
  userId: string;
  specialization: string;
  availabilities: Availability[];
}

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "suspend";
  phone: string;
  doctor: DoctorInfo | null;
  nurse: null; // Add other staff type interfaces if needed
}

interface AvailabilityForm {
  day: string;
  startTime: string;
  endTime: string;
}

interface StaffFormData {
  name: string;
  email: string;
  password: string;
  role: string;
  phone: string;
  specialization?: string;
  availabilities?: AvailabilityForm[];
}

interface DeleteConfirmationProps {
  isOpen: boolean;
  staffName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  availabilities: Availability[];
  doctorName: string;
}

const specialties = [
  {
    id: "cardiology",
    name: "Cardiology",
    description: "Heart and cardiovascular system",
  },
  {
    id: "dermatology",
    name: "Dermatology",
    description: "Skin, hair, and nails",
  },
  {
    id: "neurology",
    name: "Neurology",
    description: "Brain, spinal cord, and nervous system",
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    description: "Bones, joints, ligaments, tendons, and muscles",
  },
  {
    id: "gastroenterology",
    name: "Gastroenterology",
    description: "Digestive system and related organs",
  },
  {
    id: "general",
    name: "General Medicine",
    description: "General health assessments and primary care",
  },
];

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  staffName,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertTriangle size={24} />
          <h3 className="text-lg font-semibold">Confirm Your Action</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to chnage status of{" "}
          <span className="font-semibold">{staffName}</span>? This action cannot
          be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Change Status
          </Button>
        </div>
      </div>
    </div>
  );
};

const TimeSlotPicker: React.FC<{
  day: string;
  availabilities: AvailabilityForm[];
  onChange: (day: string, availabilities: AvailabilityForm[]) => void;
}> = ({ day, availabilities, onChange }) => {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

  const addTimeSlot = () => {
    const newSlot: AvailabilityForm = {
      day,
      startTime,
      endTime,
    };

    // Check for overlapping times
    const hasOverlap = availabilities.some(
      (slot) =>
        slot.day === day &&
        ((startTime >= slot.startTime && startTime < slot.endTime) ||
          (endTime > slot.startTime && endTime <= slot.endTime))
    );

    if (!hasOverlap) {
      const newAvailabilities = [...availabilities, newSlot];
      onChange(day, newAvailabilities);
    }
  };

  const removeTimeSlot = (slotToRemove: AvailabilityForm) => {
    const filteredSlots = availabilities.filter(
      (slot) =>
        !(
          slot.day === slotToRemove.day &&
          slot.startTime === slotToRemove.startTime &&
          slot.endTime === slotToRemove.endTime
        )
    );
    onChange(day, filteredSlots);
  };

  const daySlots = availabilities.filter((slot) => slot.day === day);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
            <option key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
              {`${hour.toString().padStart(2, "0")}:00`}
            </option>
          ))}
        </select>
        <span>to</span>
        <select
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
        >
          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
            <option key={hour} value={`${hour.toString().padStart(2, "0")}:00`}>
              {`${hour.toString().padStart(2, "0")}:00`}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" size="sm" onClick={addTimeSlot}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {daySlots.map((slot, index) => (
          <div
            key={index}
            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
          >
            <span>{`${slot.startTime}-${slot.endTime}`}</span>
            <button
              type="button"
              onClick={() => removeTimeSlot(slot)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  availabilities,
  doctorName,
}) => {
  if (!isOpen) return null;

  // Group availabilities by day
  const groupedSchedule = availabilities.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, Availability[]>);

  // Sort days in correct order
  const daysOrder = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  const sortedDays = Object.keys(groupedSchedule).sort(
    (a, b) => daysOrder.indexOf(a) - daysOrder.indexOf(b)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">
            Schedule for Dr. {doctorName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time Slots
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedDays.map((day) => (
                <tr key={day}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {groupedSchedule[day]
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((slot, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {slot.startTime} - {slot.endTime}
                          </span>
                        ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const StaffManagement: React.FC = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    staffId: string | null;
    staffName: string;
  }>({
    isOpen: false,
    staffId: null,
    staffName: "",
  });
  const [formData, setFormData] = useState<StaffFormData>({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    specialization: "",
    availabilities: [],
  });
  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    availabilities: Availability[];
    doctorName: string;
  }>({
    isOpen: false,
    availabilities: [],
    doctorName: "",
  });

  // API instance
  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Fetch staff data
  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/staff");
      setStaffs(response.data.staff);
      setError(null);
    } catch (err) {
      setError("Failed to fetch staff data");
      console.error("Error fetching staff:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle schedule changes
  const handleScheduleChange = (
    day: string,
    dayAvailabilities: AvailabilityForm[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      availabilities: [
        ...(prev.availabilities?.filter((slot) => slot.day !== day) || []),
        ...dayAvailabilities,
      ],
    }));
  };

  // Handle staff registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Prepare the data based on role
      const submitData = {
        ...formData,
        // Only include specialization and availabilities for doctors
        ...(formData.role === "doctor"
          ? {
              specialization: formData.specialization,
              availabilities: formData.availabilities,
            }
          : {}),
      };

      await api.post("/admin/staff/register", submitData);

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "",
        phone: "",
        specialization: "",
        availabilities: [],
      });
      setShowForm(false);
      fetchStaffs();
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to register staff");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (staff: Staff) => {
    setDeleteConfirmation({
      isOpen: true,
      staffId: staff.id,
      staffName: staff.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.staffId) return;

    try {
      setLoading(true);
      await api.put(`/admin/staff/${deleteConfirmation.staffId}/status`);
      await fetchStaffs();
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to delete staff");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
      setDeleteConfirmation({ isOpen: false, staffId: null, staffName: "" });
    }
  };

  const renderForm = () => (
    <div className="bg-white rounded-lg max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Add New Staff</h2>
        <p className="mt-2 text-sm text-gray-600">
          Fill in the information below to register a new staff member.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full"
              />
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full"
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full"
              />
              <Input
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full"
              />
            </div>
          </div>

          {/* Role Section */}
          <div className="pb-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Staff Role
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              >
                <option value="">Select Role</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="lab_technician">Lab Technician</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="receptionist">Receptionist</option>
                <option value="admin">Admin</option>
                <option value="finance">Finance Staff</option>
              </select>
            </div>
          </div>

          {/* Doctor Specific Section */}
          {formData.role === "doctor" && (
            <div className="space-y-6">
              <div className="pb-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Doctor Details
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  >
                    <option value="">Select Specialization</option>
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Availability Schedule
                </h3>
                <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
                  {[
                    "MONDAY",
                    "TUESDAY",
                    "WEDNESDAY",
                    "THURSDAY",
                    "FRIDAY",
                    "SATURDAY",
                    "SUNDAY",
                  ].map((day) => (
                    <div
                      key={day}
                      className="pb-4 last:pb-0 last:border-b-0 border-b border-gray-200"
                    >
                      <h4 className="font-medium text-gray-900 mb-3">{day}</h4>
                      <TimeSlotPicker
                        day={day}
                        availabilities={
                          formData.availabilities?.filter(
                            (slot) => slot.day === day
                          ) || []
                        }
                        onChange={handleScheduleChange}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="px-4 py-2"
            >
              Register Staff
            </Button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Staff
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          {renderForm()}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Specialization
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffs.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">{staff.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                    {staff.email}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap capitalize">
                    {staff.role}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                    {staff.phone}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden xl:table-cell">
                    {staff.role === "doctor" && staff.doctor?.specialization
                      ? specialties.find(
                          (s) => s.id === staff.doctor?.specialization
                        )?.name || staff.doctor.specialization
                      : "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
      ${
        staff.status === "active"
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
                    >
                      {staff.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 hidden 2xl:table-cell">
                    {staff.role === "doctor" &&
                      staff.doctor?.availabilities && (
                        <div className="max-w-xs">
                          <button
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={() =>
                              setScheduleModal({
                                isOpen: true,
                                availabilities:
                                  staff.doctor?.availabilities || [],
                                doctorName: staff.name,
                              })
                            }
                          >
                            {staff.doctor.availabilities.length > 0 ? (
                              <>
                                <span>View Schedule</span>
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-200 rounded-full">
                                  {staff.doctor.availabilities.length}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-500">No schedule</span>
                            )}
                          </button>
                        </div>
                      )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          /* Handle edit */
                        }}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDeleteClick(staff)}
                      >
                        <User2Icon size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DeleteConfirmation
        isOpen={deleteConfirmation.isOpen}
        staffName={deleteConfirmation.staffName}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteConfirmation({ isOpen: false, staffId: null, staffName: "" })
        }
      />

      <ScheduleModal
        isOpen={scheduleModal.isOpen}
        onClose={() => setScheduleModal((prev) => ({ ...prev, isOpen: false }))}
        availabilities={scheduleModal.availabilities}
        doctorName={scheduleModal.doctorName}
      />
    </div>
  );
};

export default StaffManagement;
