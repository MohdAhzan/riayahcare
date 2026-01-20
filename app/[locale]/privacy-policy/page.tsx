import { Shield, Lock, Eye, UserCheck, Database, Mail } from "lucide-react"

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Shield,
      title: "Information We Collect",
      content: [
        {
          heading: "Personal Information",
          text: "When you use our services, we collect personal information including your name, email address, phone number, medical history, and treatment preferences. This information is essential for providing you with personalized medical tourism services."
        },
        {
          heading: "Medical Records",
          text: "With your explicit consent, we collect and store medical reports, test results, and related health information to facilitate consultations with healthcare providers and ensure accurate treatment planning."
        },
        {
          heading: "Usage Data",
          text: "We automatically collect information about how you interact with our website, including IP address, browser type, pages visited, and time spent on our platform."
        }
      ]
    },
    {
      icon: Database,
      title: "How We Use Your Information",
      content: [
        {
          heading: "Service Delivery",
          text: "We use your information to connect you with appropriate healthcare providers, arrange medical consultations, coordinate travel arrangements, and provide comprehensive medical tourism support."
        },
        {
          heading: "Communication",
          text: "Your contact information is used to send appointment confirmations, treatment updates, and important notifications related to your healthcare journey."
        },
        {
          heading: "Improvement & Analytics",
          text: "We analyze usage patterns to improve our services, enhance user experience, and develop new features that better serve our clients' needs."
        }
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        {
          heading: "Encryption & Protection",
          text: "We implement industry-standard encryption protocols (SSL/TLS) to protect your data during transmission. All sensitive information is stored in secure, encrypted databases with restricted access."
        },
        {
          heading: "Access Controls",
          text: "Only authorized personnel with a legitimate need have access to your personal information. We maintain strict internal policies and conduct regular security audits."
        },
        {
          heading: "Compliance",
          text: "We comply with international data protection regulations including GDPR and HIPAA standards to ensure your information is handled with the highest level of security."
        }
      ]
    },
    {
      icon: Eye,
      title: "Information Sharing",
      content: [
        {
          heading: "Healthcare Providers",
          text: "We share relevant medical information with hospitals, clinics, and doctors you choose to consult with, strictly for the purpose of providing medical services."
        },
        {
          heading: "Service Partners",
          text: "Trusted third-party service providers (travel agencies, accommodation providers) may receive limited personal information necessary to fulfill their services, under strict confidentiality agreements."
        },
        {
          heading: "Legal Requirements",
          text: "We may disclose information when required by law, court order, or to protect the rights, property, or safety of our company, users, or others."
        }
      ]
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: [
        {
          heading: "Access & Correction",
          text: "You have the right to access, review, and request corrections to your personal information at any time through your account settings or by contacting our support team."
        },
        {
          heading: "Data Deletion",
          text: "You can request deletion of your personal data, subject to legal retention requirements. Medical records may be retained as required by healthcare regulations."
        },
        {
          heading: "Opt-Out Options",
          text: "You can opt out of marketing communications at any time while still receiving essential service-related notifications."
        },
        {
          heading: "Data Portability",
          text: "You have the right to receive your personal data in a structured, commonly used format and transfer it to another service provider."
        }
      ]
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: [
        {
          heading: "Privacy Inquiries",
          text: "If you have questions about this privacy policy or how we handle your data, please contact our Data Protection Officer at privacy@riayahcare.com or call +91 858-906-8653."
        },
        {
          heading: "Data Protection Officer",
          text: "Our dedicated Data Protection Officer is available to address your concerns and ensure your rights are protected. Response time: Within 72 hours for all privacy-related inquiries."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Your privacy and data security are our top priorities. Learn how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-green-200 mt-4">Last updated: January 20, 2026</p>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-gray-700 leading-relaxed">
            At <span className="font-semibold text-green-600">Riayah Care</span>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our medical tourism services and website.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mt-4">
            By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">{section.title}</h2>
                </div>

                <div className="space-y-6">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {item.heading}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Cookie Policy */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h2>
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your browsing experience, analyze website traffic, and understand user preferences. Cookies are small text files stored on your device.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Essential Cookies</h4>
                <p className="text-sm text-gray-700">Required for website functionality and security. Cannot be disabled.</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Analytics Cookies</h4>
                <p className="text-sm text-gray-700">Help us understand how visitors interact with our website.</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2">Marketing Cookies</h4>
                <p className="text-sm text-gray-700">Used to deliver personalized advertisements relevant to you.</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-2">Preference Cookies</h4>
                <p className="text-sm text-gray-700">Remember your settings and preferences for a better experience.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Changes to Policy */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Changes to This Privacy Policy</h2>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <p className="text-gray-700 leading-relaxed">
              We may update our Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              We encourage you to review this Privacy Policy periodically to stay informed about how we protect your information. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Have Questions About Your Privacy?
          </h2>
          <p className="text-green-100 text-lg mb-8">
            Our team is here to help. Contact us for any privacy-related concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:privacy@riayahcare.com"
              className="bg-white hover:bg-gray-100 text-green-600 font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Email Us
            </a>
            <a
              href="tel:+918589068653"
              className="bg-green-800 hover:bg-green-900 text-white font-semibold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
