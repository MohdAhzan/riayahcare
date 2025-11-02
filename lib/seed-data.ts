import { createClient } from "./supabase/server"

export async function seedDatabase() {
  const supabase = await createClient()

  // Seed hospitals
  const hospitals = [
    {
      name: "Apollo Hospitals",
      country: "India",
      city: "Delhi",
      specialty: "Multi-specialty",
      accreditation: "JCI Accredited",
      beds: 500,
      rating: 4.8,
      reviews_count: 245,
      image_url: "/modern-hospital-exterior.jpg",
      description: "Asia's leading multi-specialty hospital with state-of-the-art facilities",
    },
    {
      name: "Medicana International",
      country: "Turkey",
      city: "Istanbul",
      specialty: "Orthopedic & Cardiac",
      accreditation: "JCI Accredited",
      beds: 300,
      rating: 4.7,
      reviews_count: 189,
      image_url: "/hospital-building.jpg",
      description: "Premier healthcare center offering world-class orthopedic and cardiac services",
    },
    {
      name: "Bumrungrad Hospital",
      country: "Thailand",
      city: "Bangkok",
      specialty: "Cosmetic & General Surgery",
      accreditation: "JCI Accredited",
      beds: 200,
      rating: 4.6,
      reviews_count: 167,
      image_url: "/luxury-healthcare-facility.jpg",
      description: "International medical center specializing in cosmetic and general surgery",
    },
    {
      name: "Aster DM Healthcare",
      country: "UAE",
      city: "Dubai",
      specialty: "Cardiology & Neurology",
      accreditation: "JCI Accredited",
      beds: 350,
      rating: 4.9,
      reviews_count: 312,
      image_url: "/modern-medical-center.jpg",
      description: "Leading healthcare provider in the Middle East with cutting-edge technology",
    },
    {
      name: "Virtus Medical",
      country: "Mexico",
      city: "Mexico City",
      specialty: "Dental & Aesthetics",
      accreditation: "Certified",
      beds: 120,
      rating: 4.5,
      reviews_count: 98,
      image_url: "/dental-clinic.jpg",
      description: "Specialized center for dental procedures and aesthetic treatments",
    },
  ]

  const { data: hospitalData } = await supabase.from("hospitals").insert(hospitals).select()

  // Seed procedures
  const hospitalIds = hospitalData?.map((h) => h.id) || []

  const procedures = [
    {
      name: "Knee Replacement",
      specialty: "Orthopedic",
      description: "Advanced knee replacement surgery using latest techniques",
      cost_min: 8000,
      cost_max: 15000,
      recovery_days: 45,
      success_rate: 98.5,
      hospital_id: hospitalIds[0],
    },
    {
      name: "Cardiac Bypass Surgery",
      specialty: "Cardiology",
      description: "Complex cardiac surgery with world-class surgical teams",
      cost_min: 25000,
      cost_max: 45000,
      recovery_days: 60,
      success_rate: 97.2,
      hospital_id: hospitalIds[1],
    },
    {
      name: "Hair Transplant",
      specialty: "Cosmetic Surgery",
      description: "Advanced FUE hair transplant technology",
      cost_min: 3000,
      cost_max: 8000,
      recovery_days: 14,
      success_rate: 96.8,
      hospital_id: hospitalIds[2],
    },
    {
      name: "Dental Implants",
      specialty: "Dental",
      description: "Premium dental implant procedures with lifetime warranty",
      cost_min: 1500,
      cost_max: 3000,
      recovery_days: 30,
      success_rate: 99.1,
      hospital_id: hospitalIds[4],
    },
    {
      name: "Bariatric Surgery",
      specialty: "General Surgery",
      description: "Weight loss surgery with comprehensive follow-up care",
      cost_min: 5000,
      cost_max: 12000,
      recovery_days: 35,
      success_rate: 95.3,
      hospital_id: hospitalIds[0],
    },
    {
      name: "Brain Tumor Removal",
      specialty: "Neurology",
      description: "Advanced neuro-surgical intervention with precision",
      cost_min: 30000,
      cost_max: 50000,
      recovery_days: 90,
      success_rate: 94.7,
      hospital_id: hospitalIds[1],
    },
  ]

  await supabase.from("procedures").insert(procedures)

  // Seed doctors
  const doctors = [
    {
      name: "Dr. Rajesh Sharma",
      specialty: "Orthopedic Surgery",
      experience_years: 22,
      bio: "Leading orthopedic surgeon with extensive experience in joint replacement",
      hospital_id: hospitalIds[0],
      rating: 4.9,
      reviews_count: 156,
      image_url: "/male-doctor-professional.jpg",
    },
    {
      name: "Dr. Fatima Al-Mansouri",
      specialty: "Cardiology",
      experience_years: 18,
      bio: "Renowned cardiologist specializing in complex cardiac interventions",
      hospital_id: hospitalIds[3],
      rating: 4.8,
      reviews_count: 203,
      image_url: "/female-doctor-professional.jpg",
    },
    {
      name: "Dr. Sorn Petchpradab",
      specialty: "Cosmetic Surgery",
      experience_years: 15,
      bio: "Expert in aesthetic procedures with natural results",
      hospital_id: hospitalIds[2],
      rating: 4.7,
      reviews_count: 189,
      image_url: "/male-surgeon-professional.jpg",
    },
    {
      name: "Dr. Elena Rodriguez",
      specialty: "Dental Surgery",
      experience_years: 12,
      bio: "Specialist in complex dental implants and restoration",
      hospital_id: hospitalIds[4],
      rating: 4.9,
      reviews_count: 142,
      image_url: "/female-dentist-professional.jpg",
    },
    {
      name: "Dr. Ahmad Hassan",
      specialty: "General Surgery",
      experience_years: 20,
      bio: "Pioneer in minimally invasive surgical techniques",
      hospital_id: hospitalIds[0],
      rating: 4.8,
      reviews_count: 178,
      image_url: "/male-surgeon.jpg",
    },
  ]

  await supabase.from("doctors").insert(doctors)

  // Seed testimonials
  const testimonials = [
    {
      patient_name: "John Smith",
      patient_country: "USA",
      procedure: "Knee Replacement",
      hospital_id: hospitalIds[0],
      rating: 5,
      title: "Life-changing surgery",
      content:
        "The entire experience was seamless. The doctors were highly professional and the facility was world-class. I can walk without pain now!",
      image_url: "/patient-testimonial.jpg",
    },
    {
      patient_name: "Maria Garcia",
      patient_country: "Spain",
      procedure: "Hair Transplant",
      hospital_id: hospitalIds[2],
      rating: 5,
      title: "Amazing results",
      content:
        "The hair transplant results exceeded my expectations. The team was caring and the recovery was smooth. Highly recommended!",
      image_url: "/satisfied-patient.jpg",
    },
    {
      patient_name: "David Chen",
      patient_country: "Canada",
      procedure: "Cardiac Surgery",
      hospital_id: hospitalIds[1],
      rating: 4,
      title: "Excellent medical care",
      content:
        "Professional team, modern facilities, and comprehensive aftercare. The cost was significantly lower than in Canada.",
      image_url: "/male-patient-smiling.jpg",
    },
  ]

  await supabase.from("testimonials").insert(testimonials)

  console.log("Database seeded successfully!")
}
