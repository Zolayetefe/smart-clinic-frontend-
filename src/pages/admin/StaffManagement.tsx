// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Plus, Pencil, Trash2 } from 'lucide-react';
// import Button from '../../components/ui/Button';
// import Input from '../../components/ui/Input';

// interface Staff {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   phone: string;
//   department: string;
// }

// interface StaffFormData {
//   name: string;
//   email: string;
//   password: string;
//   role: string;
//   phone: string;
//   department: string;
//   specialization?: string;
//   availabilities?: Array<{
//     day: string;
//     startTime: string;
//     endTime: string;
//   }>;
// }

// // Add days of the week
// const daysOfWeek = [
//   'Monday',
//   'Tuesday',
//   'Wednesday',
//   'Thursday',
//   'Friday',
//   'Saturday',
//   'Sunday'
// ];

// // Update the specializations array
// const specializations = [
//   "Cardiologist",
//   "Dermatologist",
//   "Neurologist",
//   "Orthopedist",
//   "Pediatrician",
//   "Psychiatrist",
//   "Gynecologist",
//   "Ophthalmologist",
//   "Dentist",
//   "General Practitioner"
// ];

// const StaffManagement: React.FC = () => {
//   const [staffs, setStaffs] = useState<Staff[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showForm, setShowForm] = useState(false);
//   const [formData, setFormData] = useState<StaffFormData>({
//     name: '',
//     email: '',
//     password: '',
//     role: '',
//     phone: '',
//     department: '',
//     specialization: '',
//   });

//   // API instance
//   const api = axios.create({
//     baseURL: 'http://localhost:5000/api',
//     withCredentials: true,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });

//   // Fetch staff data
//   const fetchStaffs = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get('/admin/staff');
//       setStaffs(response.data.staff);
//       setError(null);
//     } catch (err) {
//       setError('Failed to fetch staff data');
//       console.error('Error fetching staff:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStaffs();
//   }, []);

//   // Handle form input changes
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle staff registration
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
      
//       // Create request data based on role
//       const requestData = {
//         ...formData,
//         // Only include specialization if role is doctor
//         ...(formData.role === 'doctor' ? { specialization: formData.specialization } : {})
//       };

//       await api.post('/admin/staff/register', requestData);
      
//       // Reset form and refresh staff list
//       setFormData({
//         name: '',
//         email: '',
//         password: '',
//         role: '',
//         phone: '',
//         department: '',
//         specialization: '',
//       });
//       setShowForm(false);
//       fetchStaffs();
//       setError(null);
//     } catch (err) {
//       if (axios.isAxiosError(err)) {
//         setError(err.response?.data?.message || 'Failed to register staff');
//       } else {
//         setError('An unexpected error occurred');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Staff Management</h1>
//         <Button
//           variant="primary"
//           onClick={() => setShowForm(!showForm)}
//           className="flex items-center gap-2"
//         >
//           <Plus size={20} />
//           Add Staff
//         </Button>
//       </div>

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {showForm && (
//         <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Input
//               label="Name"
//               name="name"
//               value={formData.name}
//               onChange={handleInputChange}
//               required
//             />
//             <Input
//               label="Email"
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleInputChange}
//               required
//             />
//             <Input
//               label="Password"
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleInputChange}
//               required
//             />
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Role
//               </label>
//               <select
//                 name="role"
//                 value={formData.role}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//                 required
//               >
//                 <option value="">Select Role</option>
//                 <option value="doctor">Doctor</option>
//                 <option value="nurse">Nurse</option>
//                 <option value="lab_technician">Lab Technician</option>
//                 <option value="pharmacist">Pharmacist</option>
//                 <option value="receptionist">Receptionist</option>
//               </select>
//             </div>
//             <Input
//               label="Phone"
//               name="phone"
//               value={formData.phone}
//               onChange={handleInputChange}
//               required
//             />
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Department
//               </label>
//               <select
//                 name="department"
//                 value={formData.department}
//                 onChange={handleInputChange}
//                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//                 required
//               >
//                 <option value="">Select Department</option>
//                 <option value="Emergency">Emergency</option>
//                 <option value="Cardiology">Cardiology</option>
//                 <option value="Neurology">Neurology</option>
//                 <option value="Pediatrics">Pediatrics</option>
//                 <option value="Orthopedics">Orthopedics</option>
//                 <option value="General Medicine">General Medicine</option>
//                 <option value="Surgery">Surgery</option>
//                 <option value="Gynecology">Gynecology</option>
//                 <option value="Laboratory">Laboratory</option>
//                 <option value="Pharmacy">Pharmacy</option>
//               </select>
//             </div>
            
//             {/* Replace the existing specialization select with this improved version */}
//             {formData.role === 'doctor' && (
//               <>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Specialization
//                   </label>
//                   <select
//                     name="specialization"
//                     value={formData.specialization || ''}
//                     onChange={handleInputChange}
//                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//                     required
//                   >
//                     <option value="">Select Specialization</option>
//                     {specializations.map((spec) => (
//                       <option key={spec} value={spec}>
//                         {spec}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="md:col-span-2 mt-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Available Time
//                   </label>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm text-gray-600 mb-1">Day</label>
//                       <select
//                         name="day"
//                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//                       >
//                         <option value="">Select Day</option>
//                         {daysOfWeek.map((day) => (
//                           <option key={day} value={day}>
//                             {day}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     <div className="grid grid-cols-2 gap-2">
//                       <div>
//                         <label className="block text-sm text-gray-600 mb-1">Start Time</label>
//                         <input
//                           type="time"
//                           name="startTime"
//                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm text-gray-600 mb-1">End Time</label>
//                         <input
//                           type="time"
//                           name="endTime"
//                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
//                         />
//                       </div>
//                     </div>
//                     <div className="md:col-span-2">
//                       <Button
//                         type="button"
//                         variant="secondary"
//                         onClick={() => {
//                           // Add time slot logic here
//                         }}
//                         className="w-full"
//                       >
//                         Add Time Slot
//                       </Button>
//                     </div>
//                   </div>
                  
//                   {/* Display added time slots */}
//                   <div className="mt-4">
//                     <h4 className="text-sm font-medium text-gray-700 mb-2">Added Time Slots</h4>
//                     <div className="space-y-2">
//                       {/* Map through added time slots here */}
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </div>
//           <div className="mt-4 flex justify-end gap-2">
//             <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
//               Cancel
//             </Button>
//             <Button type="submit" variant="primary" isLoading={loading}>
//               Register Staff
//             </Button>
//           </div>
//         </form>
//       )}

//       {loading && !showForm ? (
//         <div className="text-center">Loading...</div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white rounded-lg overflow-hidden">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Name
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Email
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Role
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Phone
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Department
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {staffs.map((staff) => (
//                 <tr key={staff.id}>
//                   <td className="px-6 py-4 whitespace-nowrap">{staff.name}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{staff.email}</td>
//                   <td className="px-6 py-4 whitespace-nowrap capitalize">{staff.role}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{staff.phone}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{staff.department}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex gap-2">
//                       <Button
//                         variant="secondary"
//                         size="sm"
//                         onClick={() => {/* Handle edit */}}
//                       >
//                         <Pencil size={16} />
//                       </Button>
//                       <Button
//                         variant="danger"
//                         size="sm"
//                         onClick={() => {/* Handle delete */}}
//                       >
//                         <Trash2 size={16} />
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StaffManagement; 