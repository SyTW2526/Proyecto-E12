import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  userName?: string;
  userEmail?: string;
  registrationDate?: string;
}

export default function Email({ userName = "Usuario", userEmail = "email@ejemplo.com", registrationDate = "01/12/2025" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>¡Bienvenido a QuickPark! Tu cuenta ha sido creada exitosamente</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <table style={logoTable}>
              <tr>
                <td style={logoCircle}>
                  <Img
                    src="https://img.icons8.com/ios-filled/50/ffffff/car.png"
                    width="40"
                    height="40"
                    alt="QuickPark"
                    style={logoImg}
                  />
                </td>
              </tr>
            </table>
            <Text style={logoText}>QuickPark</Text>
          </Section>

          <Hr style={topDivider} />

          {/* Contenido Principal */}
          <Section style={content}>
            <Heading style={heading}>¡Bienvenido a QuickPark!</Heading>

            <Text style={greeting}>Hola <strong>{userName}</strong>,</Text>

            <Text style={paragraph}>
              Estamos encantados de tenerte con nosotros. Tu cuenta ha sido creada exitosamente y ya
              puedes comenzar a disfrutar de todos los beneficios de nuestra plataforma.
            </Text>

            {/* Sección de características */}
            <Section style={featuresSection}>
              <Heading as="h3" style={subheading}>
                ¿Qué puedes hacer ahora?
              </Heading>

              <table style={feature}>
                <tr>
                  <td style={iconContainer}>
                    <div style={{ ...iconCircle, backgroundColor: "#E8F0FF" }}>
                      <Text style={{ ...iconEmoji, color: "#3B82F6" }}>🔑</Text>
                    </div>
                  </td>
                  <td style={featureContent}>
                    <Text style={featureTitle}>Buscar garajes disponibles</Text>
                    <Text style={featureDescription}>
                      Encuentra el parking perfecto cerca de tu ubicación con nuestra búsqueda inteligente.
                    </Text>
                  </td>
                </tr>
              </table>

              <table style={feature}>
                <tr>
                  <td style={iconContainer}>
                    <div style={{ ...iconCircle, backgroundColor: "#D1FAE5" }}>
                      <Text style={{ ...iconEmoji, color: "#10B981" }}>⚡</Text>
                    </div>
                  </td>
                  <td style={featureContent}>
                    <Text style={featureTitle}>Reservar en segundos</Text>
                    <Text style={featureDescription}>
                      Proceso de reserva rápido y seguro. Paga online y accede inmediatamente.
                    </Text>
                  </td>
                </tr>
              </table>

              <table style={feature}>
                <tr>
                  <td style={iconContainer}>
                    <div style={{ ...iconCircle, backgroundColor: "#F3E8FF" }}>
                      <Text style={{ ...iconEmoji, color: "#A855F7" }}>⭕</Text>
                    </div>
                  </td>
                  <td style={featureContent}>
                    <Text style={featureTitle}>Gestiona tus reservas</Text>
                    <Text style={featureDescription}>
                      Accede a tu panel de control para ver y gestionar todas tus reservas.
                    </Text>
                  </td>
                </tr>
              </table>
            </Section>

            {/* Botón CTA */}
            <Section style={buttonContainer}>
              <Button style={button} href="https://parkinggo.com/garajes">
                Explorar Garajes Disponibles
              </Button>
            </Section>

            {/* Detalles de la cuenta */}
            <Section style={accountDetails}>
              <Heading as="h3" style={accountHeading}>
                Detalles de tu cuenta
              </Heading>
              <Text style={accountInfo}>
                <strong>Email:</strong> {userEmail}
              </Text>
              <Text style={accountInfo}>
                <strong>Fecha de registro:</strong> {registrationDate}
              </Text>
            </Section>

            {/* Footer */}
            <Text style={footer}>
              <a href="">
                ¿Necesitas ayuda? Pregúntanos.
              </a> 
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Estilos
const main = {
  backgroundColor: "#f5f5f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  padding: "0",
};

const logoSection = {
  textAlign: "center" as const,
  padding: "40px 20px 20px",
};

const logoTable = {
  margin: "0 auto 16px",
  borderCollapse: "collapse" as const,
};

const logoCircle = {
  backgroundColor: "#3B82F6",
  borderRadius: "50%",
  width: "80px",
  height: "80px",
  textAlign: "center" as const,
  verticalAlign: "middle" as const,
};

const logoImg = {
  display: "inline-block",
  verticalAlign: "middle",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#3B82F6",
  margin: "0",
};

const topDivider = {
  borderColor: "#3B82F6",
  borderWidth: "2px",
  maxWidth: "80%",
};

const content = {
  padding: "0 54px 48px",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#1a1a1a",
  textAlign: "center" as const,
  margin: "32px 0 24px",
};

const greeting = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#525252",
  margin: "0 0 24px",
};

const featuresSection = {
  margin: "32px 0",
};

const subheading = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 24px",
};

const feature = {
  width: "100%",
  marginBottom: "20px",
  borderCollapse: "collapse" as const,
};

const iconContainer = {
  width: "60px",
  verticalAlign: "top" as const,
  paddingRight: "0",
};

const iconCircle = {
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  textAlign: "center" as const,
  lineHeight: "48px",
};

const iconEmoji = {
  fontSize: "24px",
  margin: "0",
  lineHeight: "48px",
  display: "inline-block",
};

const featureContent = {
  verticalAlign: "top" as const,
  paddingLeft: "16px",
};

const featureTitle = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 4px",
};

const featureDescription = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#737373",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#3B82F6",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 40px",
};

const accountDetails = {
  backgroundColor: "#EFF6FF",
  borderRadius: "8px",
  padding: "24px",
  margin: "32px 0",
};

const accountHeading = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const accountInfo = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#525252",
  margin: "0 0 8px",
};

const footer = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "#737373",
  textAlign: "center" as const,
  margin: "24px 0 0",
};