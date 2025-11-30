import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface ContactProps {
  user?: any;
}

function Contact({ user }: ContactProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Autocompletar nombre y email si el usuario está logueado
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.nombre || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:3000/api/contact', formData, {
        headers: { 'Content-Type': 'application/json' },
      })

      // El backend devuelve { success: true } cuando el mensaje se envía correctamente
      if (response.status === 200 && response.data && response.data.success) {
        setSuccess(true)

        // Limpiar formulario (mantener nombre/email si el usuario está logueado)
        setFormData({
          nombre: user ? user.nombre : '',
          email: user ? user.email : '',
          telefono: '',
          asunto: '',
          mensaje: '',
        })

        // Ocultar mensaje de éxito automáticamente después de 4 segundos
        setTimeout(() => setSuccess(false), 4000)
      } else {
        setError('No se pudo enviar el mensaje. Por favor, inténtalo de nuevo más tarde.')
      }
    } catch (error: any) {
      console.error('Error al enviar mensaje:', error)
      setError(error.response?.data?.error || 'Error al enviar el mensaje. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="overflow-hidden pt-10 pb-12 lg:pt-[60px] lg:pb-[90px] bg-white dark:bg-dark">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap -mx-4">
          {/* Columna izquierda - Información */}
          <div className="w-full px-4 lg:w-5/12 mb-12 lg:mb-0">
            <div className="max-w-[570px]">
              <span className="block mb-4 text-lg font-semibold text-gray-900">
                Contacto
              </span>
              <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-[40px]/[48px]">
                ¿Tienes alguna duda?
              </h2>
              <p className="mb-9 text-base text-gray-600 leading-relaxed">
                ¿Tienes dudas sobre tarifas, reservas o disponibilidad? Estamos aquí para ayudarte.
                Rellena el formulario y te responderemos lo antes posible.
              </p>

              {/* Información de contacto adicional */}
              <div className="mb-8 flex w-full max-w-[370px] items-center">
                <div className="mr-6 flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 sm:h-[70px] sm:w-[70px]">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="w-full">
                  <h4 className="mb-1 text-xl font-bold text-gray-900">
                    Email
                  </h4>
                  <p className="text-base text-gray-600">
                    contacto@quickpark.com
                  </p>
                </div>
              </div>

              <div className="mb-8 flex w-full max-w-[370px] items-center">
                <div className="mr-6 flex h-[60px] w-[60px] items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 sm:h-[70px] sm:w-[70px]">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div className="w-full">
                  <h4 className="mb-1 text-xl font-bold text-gray-900">
                    Teléfono
                  </h4>
                  <p className="text-base text-gray-600">
                    +34 922 123 456
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="w-full px-4 lg:w-7/12">
            <div className="relative rounded-lg bg-white p-8 shadow-lg sm:p-12">
              {error && (
                <div className="mb-6 p-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 text-sm text-green-800 rounded-lg bg-green-50" role="alert">
                  ¡Mensaje enviado correctamente! Te responderemos pronto.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-900 mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder="Tu nombre"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={!!user}
                    className={`block w-full rounded-md px-4 py-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 ${user ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="tu@email.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!!user}
                    className={`block w-full rounded-md px-4 py-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 ${user ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-900 mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    placeholder="+34 123 456 789"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-4 py-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="asunto" className="block text-sm font-medium text-gray-900 mb-2">
                    Asunto *
                  </label>
                  <select
                    id="asunto"
                    name="asunto"
                    required
                    value={formData.asunto}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-4 py-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="tarifas">Consulta sobre tarifas</option>
                    <option value="reservas">Problema con reservas</option>
                    <option value="disponibilidad">Disponibilidad de parking</option>
                    <option value="soporte">Soporte técnico</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="mensaje" className="block text-sm font-medium text-gray-900 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={6}
                    placeholder="Escribe tu consulta aquí..."
                    required
                    value={formData.mensaje}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-4 py-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 resize-none"
                  />
                </div>

                <div className="mb-6">
                  <p className="text-xs text-gray-500">
                    * Campos obligatorios. Tus datos serán tratados únicamente para responder a tu consulta.
                  </p>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact