"use client"

import { useState, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Calendar, Clock, Mail, Phone, User, Video, Stethoscope, FileText, Globe } from "lucide-react"

// Define the type for the form data
interface ConsultationForm {
    fullName: string
    email: string
    phone: string
    date: string
    time: string // This will store the final IST time string (e.g., "10:00 AM")
    topic: string
}

const discussionTopics = [
    "Procedure Information & Cost Estimate",
    "Hospital & Doctor Selection",
    "Travel & Accommodation Support",
    "Medical Visa Guidance",
    "Post-Procedure Follow-up",
    "General Inquiry",
]

// --- FIXED COMPONENTS: MOVED OUTSIDE THE MAIN FUNCTION ---

// Reusable Input component with error display
const FormInput = ({ icon: Icon, name, type, placeholder, value, required = true, error, onChange }: any) => (
    <div className="relative">
        <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            // Pass the onChange handler from props
            onChange={onChange} 
            required={required}
            className={`bg-white w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-emerald-500 text-gray-900 
                ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
        />
        {/* Error message position adjusted for spacing */}
        {error && <p className="absolute text-xs text-red-500 top-full mt-1 left-0">{error}</p>}
    </div>
)

// Reusable Select component with error display
const FormSelect = ({ icon: Icon, name, value, required = true, error, children, placeholder, onChange }: any) => (
    <div className="relative">
        <Icon className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
        <select
            name={name}
            value={value}
            // Pass the onChange handler from props
            onChange={onChange}
            required={required}
            className={`w-full pl-10 pr-3 py-3 border rounded-lg bg-white appearance-none text-gray-900 
                ${error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
        >
            <option value="" disabled>{placeholder}</option>
            {children}
        </select>
        {error && <p className="absolute text-xs text-red-500 top-full mt-1 left-0">{error}</p>}
    </div>
)

// --- MAIN COMPONENT ---

export default function PrivateConsultationSection() {
    const [formData, setFormData] = useState<ConsultationForm>({
        fullName: "",
        email: "",
        phone: "",
        date: "",
        time: "", 
        topic: "",
    })
    const supabase = createClient()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error' | null, text: string | null }>({ type: null, text: null })
    const [validationErrors, setValidationErrors] = useState<Record<string, string | null>>({})

    // ----------------------------------------------------------------------
    // 1. TIME SLOT LOGIC
    // ----------------------------------------------------------------------

    const IST_SLOTS_24HR = [9, 10, 11, 12, 14, 15, 16, 17, 20, 21] 

    const TIME_SLOTS_DATA = useMemo(() => {
        const IST_OFFSET_MINUTES = 330 
        
        return IST_SLOTS_24HR.map(hour => {
            const date = new Date();
            const IST_TIME_UTC = date.getTime() - date.getTimezoneOffset() * 60000 + IST_OFFSET_MINUTES * 60000;
            const istSlotDate = new Date(IST_TIME_UTC);
            
            istSlotDate.setHours(hour, 0, 0, 0); 
            
            const istValue = istSlotDate.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true, 
                timeZone: 'Asia/Kolkata' 
            });

            const localLabel = istSlotDate.toLocaleTimeString(undefined, {
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: true,
            });

            return {
                istValue: istValue, // Saved to DB
                localLabel: localLabel, // Displayed to user
            };
        });
    }, []) 

    // ----------------------------------------------------------------------
    // 2. HANDLERS
    // ----------------------------------------------------------------------
    
    // Use useCallback to memoize the function
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for the field being edited
        setValidationErrors(prev => ({ ...prev, [name]: null }))
    }, []) 

    const validateForm = (data: ConsultationForm) => {
        const errors: Record<string, string> = {}
        if (!data.fullName.trim()) errors.fullName = "Full Name is required."
        if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) errors.email = "A valid Email Address is required."
        if (!data.phone.trim()) errors.phone = "Phone Number is required."
        if (!data.date) errors.date = "Please select a date."
        if (!data.time) errors.time = "Please select a time slot."
        if (!data.topic) errors.topic = "Please select a discussion topic."
        return errors
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitMessage({ type: null, text: null })

        const errors = validateForm(formData)
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            return
        }
        setValidationErrors({}) 

        setIsSubmitting(true)

        try {
            const { error } = await supabase.from('private_consultations').insert([{
                patient_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                scheduled_date: formData.date,
                scheduled_time: formData.time, // This is the IST time
                discussion_topic: formData.topic,
            }])

            if (error) {
                console.error("Supabase Error:", error.message);
                throw new Error("Database insert failed: " + error.message);
            }

            setSubmitMessage({ type: 'success', text: "🎉 Consultation scheduled successfully! We've received your request and will be in touch shortly to confirm." })
            setFormData({ fullName: "", email: "", phone: "", date: "", time: "", topic: "" }) // Reset form
        } catch (error) {
            console.error("Submission error:", error)
            setSubmitMessage({ type: 'error', text: "❌ Failed to schedule consultation. Please check your details and try again." })
        } finally {
            setIsSubmitting(false) 
        }
    }

    // Helper for generating dates (example for next 7 days)
    const getDates = () => {
        const dates = []
        const today = new Date();
        today.setDate(today.getDate());
        
        for (let i = 1; i <= 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            dates.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            })
        }
        return dates
    }


    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Schedule Your Private Patient Consultation
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Book a **free 30-minute** video session with our International Patient Care team for personalized medical advice and guidance.
                        </p>
                    </div>

                    {/* Consultation Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                        {/* Form Panel */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-xl border border-emerald-200 p-8">
                            <div className="mb-6">
                                <h3 className="font-semibold tracking-tight text-2xl text-emerald-600 flex items-center">
                                    <Video className="mr-3 h-6 w-6 text-emerald-600" />
                                    Book Video Meeting
                                </h3>
                                <p className="text-gray-500">Secure and confidential consultation</p>
                            </div>

                            {/* Submission Message */}
                            {submitMessage.text && (
                                <div className={`p-4 mb-4 rounded-lg font-semibold ${submitMessage.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {submitMessage.text}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Input fields (now using the external FormInput) */}
                                <FormInput
                                    icon={User}
                                    name="fullName"
                                    type="text"
                                    placeholder="Your Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    error={validationErrors.fullName}
                                />
                                <FormInput
                                    icon={Mail}
                                    name="email"
                                    type="email"
                                    placeholder="Your Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={validationErrors.email}
                                />
                                <FormInput
                                    icon={Phone}
                                    name="phone"
                                    type="tel"
                                    placeholder="Your Phone Number (with country code)"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    error={validationErrors.phone}
                                />

                                {/* Date & Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormSelect
                                        icon={Calendar}
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        placeholder="Select Date"
                                        error={validationErrors.date}
                                    >
                                        {getDates().map(d => (
                                            <option key={d.value} value={d.value}>{d.label}</option>
                                        ))}
                                    </FormSelect>
                                    
                                    {/* Time Select (Shows Local Time) */}
                                    <FormSelect
                                        icon={Clock}
                                        name="time"
                                        value={formData.time} 
                                        onChange={handleChange}
                                        placeholder="Select Time"
                                        error={validationErrors.time}
                                    >
                                        {TIME_SLOTS_DATA.map(t => (
                                            <option 
                                                key={t.istValue} 
                                                value={t.istValue} 
                                            >
                                                {t.localLabel}
                                            </option>
                                        ))}
                                    </FormSelect>
                                </div>

                                {/* Discussion Topic */}
                                <FormSelect
                                    icon={Stethoscope}
                                    name="topic"
                                    value={formData.topic}
                                    onChange={handleChange}
                                    placeholder="Select Discussion Topic"
                                    error={validationErrors.topic}
                                >
                                    {discussionTopics.map(topic => (
                                        <option key={topic} value={topic}>{topic}</option>
                                    ))}
                                </FormSelect>


                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting} 
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 shadow-md hover:shadow-lg mt-6"
                                >
                                    <Calendar className="h-5 w-5" />
                                    {isSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
                                </button>
                            </form>
                        </div>

                        {/* Benefits Panel */}
                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-xl border border-emerald-200 p-8">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">What You'll Get:</h3>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1 shrink-0">
                                            <Stethoscope className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Expert Medical Matching</h4>
                                            <p className="text-sm text-gray-600">Find the perfect hospital and specialist for your unique condition.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1 shrink-0">
                                            <FileText className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Detailed Procedure Planning</h4>
                                            <p className="text-sm text-gray-600">Transparent cost estimates, treatment roadmaps, and payment options.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1 shrink-0">
                                            <Globe className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">End-to-End Travel Support</h4>
                                            <p className="text-sm text-gray-600">Assistance with medical visas, travel logistics, and local accommodation.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-emerald-600/10 rounded-xl shadow-xl border border-emerald-200 p-6 text-center">
                                <h3 className="text-lg font-semibold text-emerald-800 mb-2">⭐ Patient Priority Treatment</h3>
                                <p className="text-sm text-gray-700">
                                    All scheduled consultations receive a full **Medical Travel Guide** including hospital profiles and patient testimonials.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

